import { useState, useEffect } from 'react';
import { useRide } from '../context/RideContext';
import { useAuth } from '../context/authContext';
import type { Location } from '../types';
import RideMap from '../components/map/RideMap';
import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, off, getDatabase } from 'firebase/database';
import { usePlaceName } from '../hooks/usePlaceName';
import { MapPin, } from 'lucide-react';

const db = getDatabase();

const KATHMANDU: Location = { lat: 27.7172, lng: 85.3240 };

// Simulates driver moving toward pickup
const moveToward = (current: Location, target: Location): Location => {
  const speed = 0.0008;
  const dlat = target.lat - current.lat;
  const dlng = target.lng - current.lng;
  const dist = Math.sqrt(dlat * dlat + dlng * dlng);
  if (dist < speed) return target;
  return {
    lat: current.lat + (dlat / dist) * speed,
    lng: current.lng + (dlng / dist) * speed,
  };
};

const DriverPage = () => {
  const {
    ride,
    acceptRide,
    rejectRide,
    startRide,
    completeRide,
    updateDriverLocation,
    setActiveRide,
  } = useRide();

  const { logout } = useAuth();
  const navigate = useNavigate();

  const [driverLocation, setDriverLocation] = useState<Location>(KATHMANDU);
  const [loading, setLoading] = useState(false);
  const [incomingRide, setIncomingRide] = useState<any>(null);

  const { placeName } = usePlaceName(driverLocation);
  // Listen for any incoming ride requests in Firebase
  useEffect(() => {
    const ridesRef = ref(db, 'rides');

    onValue(ridesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        if (!ride || ride.status === 'requesting') {
          setIncomingRide(null);
          setActiveRide(null, null);
        }
        return;
      }

      // Find first ride in 'requesting' state
      const found = Object.entries(data).find(([_, r]: any) => r.status === 'requesting');

      if (found) {
        const [foundId, foundData] = found as [string, any];
        setIncomingRide(foundData);
        if (!ride || ride.status === 'requesting') {
          setActiveRide(foundId, foundData);
        }
      } else {
        setIncomingRide(null);
        if (!ride || ride.status === 'requesting') {
          setActiveRide(null, null);
        }
      }
    });

    return () => off(ridesRef);
  }, [ride, setActiveRide]);

  // Simulate driver movement toward pickup when ride is accepted
  useEffect(() => {
    if (!ride || !['accepted', 'active'].includes(ride.status)) return;

    const target = ride.pickup;

    const interval = setInterval(() => {
      setDriverLocation((prev) => {
        const next = moveToward(prev, target);
        updateDriverLocation(next); // push to Firebase
        return next;
      });
    }, 2000); // every 2s — not every tick

    return () => clearInterval(interval); // cleanup
  }, [ride?.status]);

  const handleAccept = async () => {
    setLoading(true);
    await acceptRide('driver-001');
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    await rejectRide();
    setLoading(false);
  };

  const handleStart = async () => {
    setLoading(true);
    await startRide();
    setLoading(false);
  };

  const handleComplete = async () => {
    setLoading(true);
    await completeRide();
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statusConfig: Record<string, {
    label: string;
    subtext: string;
    buttonLabel: string;
    buttonColor: string;
    statusColor: string;
  }> = {
    requesting: {
      label: 'Waiting for ride requests...',
      subtext: 'Listening for incoming trips',
      buttonLabel: 'Reject Request',
      buttonColor: 'bg-red-500/10 hover:bg-red-500/20 text-red-600 border-red-200',
      statusColor: 'bg-amber-100 border-amber-200 text-amber-700',
    },
    accepted: {
      label: 'Ride accepted',
      subtext: 'Heading to pickup location',
      buttonLabel: 'Start Ride',
      buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
      statusColor: 'bg-blue-100 border-blue-200 text-blue-700',
    },
    active: {
      label: 'Ride in progress',
      subtext: 'Complete the ride when finished',
      buttonLabel: 'Complete Ride',
      buttonColor: 'bg-green-600 hover:bg-green-700 text-white',
      statusColor: 'bg-green-100 border-green-200 text-green-700',
    },
    completed: {
      label: 'Ride completed',
      subtext: 'Saved to history',
      buttonLabel: 'View History',
      buttonColor: 'bg-slate-900 hover:bg-slate-800 text-white',
      statusColor: 'bg-green-100 border-green-200 text-green-700',
    },
    cancelled: {
      label: 'Ride cancelled',
      subtext: 'The rider cancelled the trip',
      buttonLabel: 'View History',
      buttonColor: 'bg-slate-900 hover:bg-slate-800 text-white',
      statusColor: 'bg-red-100 border-red-200 text-red-700',
    },
    rejected: {
      label: 'Ride rejected',
      subtext: 'You rejected this ride',
      buttonLabel: 'View History',
      buttonColor: 'bg-slate-900 hover:bg-slate-800 text-white',
      statusColor: 'bg-red-100 border-red-200 text-red-700',
    },
  };

  const currentStatus = ride?.status ? statusConfig[ride.status] : null;

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <NavBar
        role="Driver"
        onHistory={() => navigate('/history')}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 shrink-0 bg-slate-900 border-r border-white/10 flex flex-col overflow-y-auto">
          <div className="px-6 pt-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-bold text-white">Driver dashboard</span>
            </div>
            <p className="text-xs text-white/40">
              Manage incoming requests and complete rides.
            </p>
          </div>

          <div className="flex-1 px-6 py-5 space-y-4">
            {currentStatus && (
              <div className={`rounded-3xl border px-4 py-4 ${currentStatus.statusColor}`}>
                <p className="text-sm font-semibold text-slate-900">{currentStatus.label}</p>
                <p className="mt-1 text-xs text-slate-600">{currentStatus.subtext}</p>
              </div>
            )}

            {!ride && !incomingRide && (
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-white">
                <p className="text-sm font-semibold">Waiting for ride requests</p>
                <p className="mt-2 text-xs text-white/40">Your app is listening for riders nearby.</p>
              </div>
            )}

            {incomingRide && ride && (
              <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Incoming ride request</p>
                    <p className="text-xs text-white/40">Review pickup and rider details.</p>
                  </div>
                  <span className="rounded-full bg-yellow-100/15 px-2 py-1 text-[11px] font-medium  tracking-[0.2em] text-yellow-200">
                    Incoming
                  </span>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-900 p-4">
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>Pickup</span>
                    <span className="font-medium text-white">{placeName || `${ride.pickup.lat.toFixed(4)}, ${ride.pickup.lng.toFixed(4)}`}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-white/40">
                    <span>Rider</span>
                    <span className="font-medium text-white">{incomingRide.riderId}</span>
                  </div>
                </div>

                <div className="grid gap-3">
                  <button
                    onClick={handleAccept}
                    disabled={loading}
                    className="w-full rounded-3xl bg-green-600 px-4 py-4 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Accepting...' : 'Accept Ride'}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    className="w-full rounded-3xl border border-red-500/20 bg-red-50 px-4 py-4 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

            {ride?.status === 'accepted' && (
              <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-white">
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>Pickup</span>
                  <span className="font-medium text-white">{ride.pickup.lat.toFixed(4)}, {ride.pickup.lng.toFixed(4)}</span>
                </div>
                <button
                  onClick={handleStart}
                  disabled={loading}
                  className="w-full rounded-3xl bg-blue-600 px-4 py-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Starting...' : 'Start Ride'}
                </button>
              </div>
            )}

            {ride?.status === 'active' && (
              <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-white">
                <div className="text-sm font-semibold">Ride in progress</div>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-full rounded-3xl bg-green-600 px-4 py-4 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Completing...' : 'Complete Ride'}
                </button>
              </div>
            )}

            {ride && ['completed', 'cancelled', 'rejected'].includes(ride.status) && (
              <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-white">
                <div className="text-sm font-semibold">
                  {ride.status === 'completed' && '✅ Ride completed — saved to history'}
                  {ride.status === 'cancelled' && '❌ Ride was cancelled by rider'}
                  {ride.status === 'rejected' && '❌ You rejected this ride'}
                </div>
                <button
                  onClick={() => navigate('/history')}
                  className="w-full rounded-3xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  View History
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 relative">
          <RideMap
            pickupLocation={ride?.pickup}
            driverLocation={driverLocation}
          />

          {!ride && !incomingRide && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-xs text-white/80 shadow-lg shadow-slate-900/20">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Waiting for the next ride request
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverPage;
