import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  
} from 'react';

import type { ReactNode } from 'react';
import { ref, set, onValue, off, push } from 'firebase/database';
import * as firebaseConfig from '../firebase/config';
import type { RideData, Location } from '../types';
import { type RideStatus, isTerminal, canTransition } from '../utils/stateMachine';

const db = (firebaseConfig as any).db ?? (firebaseConfig as any).default ?? (firebaseConfig as any).database;
import { saveRide } from '../api/mockapi';

interface RideContextType {
  ride: RideData | null;
  rideId: string | null;
  setActiveRide: (id: string | null, data?: RideData | null) => void;
  requestRide: (pickup: Location) => Promise<void>;
  acceptRide: (driverId: string) => Promise<void>;
  rejectRide: () => Promise<void>;
  startRide: () => Promise<void>;
  completeRide: () => Promise<void>;
  cancelRide: () => Promise<void>;
  updateDriverLocation: (location: Location) => Promise<void>;
}

const RideContext = createContext<RideContextType | null>(null);

export const RideProvider = ({ children }: { children: ReactNode }) => {
  const [ride, setRide] = useState<RideData | null>(null);
  const [rideId, setRideId] = useState<string | null>(null);

  const setActiveRide = useCallback((id: string | null, data?: RideData | null) => {
    setRideId(id);
    if (data) setRide(data);
    else setRide(null);
  }, []);

  // Listen to ride changes in Firebase
  useEffect(() => {
    if (!rideId) return;

    const rideRef = ref(db, `rides/${rideId}`);

    onValue(rideRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setRide(data);
    });

    // Cleanup listener on unmount — prevents memory leaks
    return () => off(rideRef);
  }, [rideId]);

  // Write status change to Firebase
  const updateStatus = useCallback(
    async (newStatus: RideStatus, extra?: Partial<RideData>) => {
      if (!rideId || !ride) return;

      const currentStatus = ride.status as RideStatus;

      if (!canTransition(currentStatus, newStatus)) {
        console.warn(`Invalid transition: ${currentStatus} → ${newStatus}`);
        return;
      }

      const updated: RideData = { ...ride, ...extra, status: newStatus };
      await set(ref(db, `rides/${rideId}`), updated);

      // If terminal state — persist to MockAPI
      if (isTerminal(newStatus)) {
        await saveRide({ ...updated, createdAt: new Date().toISOString() });
      }
    },
    [rideId, ride]
  );

  const requestRide = async (pickup: Location) => {
    const newRideRef = push(ref(db, 'rides'));
    const newId = newRideRef.key!;

    const newRide: RideData = {
      riderId: 'rider-001',
      status: 'requesting',
      pickup,
      createdAt: new Date().toISOString(),
    };

    console.log('Requesting ride with data:', newRide);
    await set(newRideRef, newRide);
    setRideId(newId);
    setRide(newRide);
  };

  const acceptRide = async (driverId: string) =>
    updateStatus('accepted', { driverId });

  const rejectRide = async () => updateStatus('rejected');

  const startRide = async () => updateStatus('active');

  const completeRide = async () => updateStatus('completed');

  const cancelRide = async () => updateStatus('cancelled');

  const updateDriverLocation = async (location: Location) => {
    if (!rideId) return;
    await set(ref(db, `rides/${rideId}/driverLocation`), location);
  };

  return (
    <RideContext.Provider
      value={{
        ride,
        rideId,
        setActiveRide,
        requestRide,
        acceptRide,
        rejectRide,
        startRide,
        completeRide,
        cancelRide,
        updateDriverLocation,
      }}
    >
      {children}
    </RideContext.Provider>
  );
};

export const useRide = () => {
  const ctx = useContext(RideContext);
  if (!ctx) throw new Error('useRide must be used inside RideProvider');
  return ctx;
};