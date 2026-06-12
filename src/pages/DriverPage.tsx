import { useState, useEffect } from 'react';
import { useRide } from '../context/RideContext';
import { useAuth } from '../context/authContext';
import type { Location } from '../types';
import RideMap from '../components/map/RideMap';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, off, getDatabase } from 'firebase/database';
import { usePlaceName } from '../hooks/usePlaceName';
// Use local getDatabase() instead of importing db from config
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

  const { placeName, loading: placeLoading } = usePlaceName(driverLocation);
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

    return () => clearInterval(interval); // cleanup!
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requesting': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'accepted':   return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'active':     return 'bg-green-50 text-green-700 border-green-200';
      case 'completed':  return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':  return 'bg-red-50 text-red-700 border-red-200';
      case 'rejected':   return 'bg-red-50 text-red-700 border-red-200';
      default:           return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="h-screen flex flex-col">

      {/* Navbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 z-10">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">Namlo Rides</span>
          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
            Driver
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/history')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            History
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <RideMap
          pickupLocation={ride?.pickup}
          driverLocation={driverLocation}
        />

        {/* Bottom panel */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 space-y-3">

            {/* No active ride — waiting */}
            {!ride && !incomingRide && (
              <div className="text-center py-2">
                <p className="text-sm text-gray-400">
                  Waiting for ride requests...
                </p>
                <div className="flex justify-center gap-1 mt-2">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Incoming ride request */}
            {incomingRide && ride && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">
                    New ride request!
                  </p>
                  <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">
                    Incoming
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl px-3 py-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Pickup</span>
                    <span className="text-gray-700 font-medium">
                     📍 {placeName || `${ride.pickup.lat.toFixed(4)}, ${ride.pickup.lng.toFixed(4)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rider </span>
                    <span className="text-gray-700 font-medium">
                      {incomingRide.riderId}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    className="py-3 rounded-xl text-sm font-medium border border-red-200 text-red-600 
                    bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleAccept}
                    disabled={loading}
                    className="py-3 rounded-xl text-sm font-medium bg-green-600 hover:bg-green-700
                     text-white transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Accepting...' : 'Accept'}
                  </button>
                </div>
              </div>
            )}

            {/* Accepted — heading to pickup */}
            {ride?.status === 'accepted' && (
              <div className="space-y-3">
                <div className={`text-sm px-3 py-2 rounded-lg border ${getStatusColor('accepted')}`}>
                  Heading to pickup location...
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pickup</span>
                  <span className="text-gray-700 font-medium">
                    {ride.pickup.lat.toFixed(4)}, {ride.pickup.lng.toFixed(4)}
                  </span>
                </div>
                <button
                  onClick={handleStart}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Starting...' : 'Start Ride'}
                </button>
              </div>
            )}

            {/* Active ride */}
            {ride?.status === 'active' && (
              <div className="space-y-3">
                <div className={`text-sm px-3 py-2 rounded-lg border ${getStatusColor('active')}`}>
                  Ride in progress
                </div>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Completing...' : 'Complete Ride'}
                </button>
              </div>
            )}

            {/* Terminal states */}
            {ride && ['completed', 'cancelled', 'rejected'].includes(ride.status) && (
              <div className="space-y-3">
                <div className={`text-sm px-3 py-2 rounded-lg border ${getStatusColor(ride.status)}`}>
                  {ride.status === 'completed' && '✅ Ride completed — saved to history'}
                  {ride.status === 'cancelled' && '❌ Ride was cancelled by rider'}
                  {ride.status === 'rejected' && '❌ You rejected this ride'}
                </div>
                <button
                  onClick={() => navigate('/history')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 
                  rounded-xl text-sm transition-colors"
                >
                  View History
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverPage;