import { useState } from 'react';
import { useRide } from '../context/RideContext';
import { useAuth } from '../context/authContext';
import type { Location } from '../types';
import RideMap from '../components/map/RideMap';
import { useNavigate } from 'react-router-dom';
import { usePlaceName } from '../hooks/usePlaceName';

const RiderPage = () => {
  const { ride, requestRide, cancelRide } = useRide();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [pickup, setPickup] = useState<Location | null>(null);
  const [requesting, setRequesting] = useState(false);

  const { placeName, loading: placeLoading } = usePlaceName(pickup);

  const handleRequest = async () => {
    if (!pickup) return;
    setRequesting(true);
    
    await requestRide(pickup);
    setRequesting(false);
  };

  const handleCancel = async () => {
    await cancelRide();
    setPickup(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusMessage = () => {
    switch (ride?.status) {
      case 'requesting':
        return { text: 'Looking for a driver...', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
      case 'accepted':
        return { text: 'Driver accepted! On the way...', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'active':
        return { text: 'Ride in progress!', color: 'bg-green-50 text-green-700 border-green-200' };
      case 'completed':
        return { text: 'Ride completed!', color: 'bg-green-50 text-green-700 border-green-200' };
      case 'cancelled':
        return { text: 'Ride cancelled.', color: 'bg-red-50 text-red-700 border-red-200' };
      case 'rejected':
        return { text: 'Driver rejected the ride.', color: 'bg-red-50 text-red-700 border-red-200' };
      default:
        return null;
    }
  };

  const status = getStatusMessage();
  const isActive = ride && !['idle', 'completed', 'cancelled', 'rejected'].includes(ride.status);

  return (
    <div className="h-screen flex flex-col">

      {/* Top navbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 z-10">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">Namlo Rides</span>
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
            Rider
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

      {/* Map — takes remaining height */}
      <div className="flex-1 relative">
        <RideMap
          pickupLocation={pickup}
          driverLocation={ride?.driverLocation}
          interactive={!isActive}
          onMapClick={(loc) => {
            if (!isActive) setPickup(loc);
          }}
        />

        {/* Bottom panel — overlays the map */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 space-y-3">

            {/* Status badge */}
            {status && (
              <div className={`text-sm px-3 py-2 rounded-lg border ${status.color}`}>
                {status.text}
              </div>
            )}

            {/* Idle state — pick location */}
            {!ride || ['completed', 'cancelled', 'rejected'].includes(ride.status) ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Pickup location
                  </p>
                  {pickup ? (
                    <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                      📍 {placeName || `${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)}`}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
                      Tap on the map to set pickup
                    </p>
                  )}
                </div>

                <button
                  onClick={handleRequest}
                  disabled={!pickup || requesting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl text-sm transition-colors"
                >
                  {requesting ? 'Requesting...' : 'Request Ride'}
                </button>
              </div>
            ) : null}

            {/* Requesting / accepted state — show cancel */}
            {ride && ['requesting', 'accepted'].includes(ride.status) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Pickup</span>
                  <span className="font-medium text-gray-700">
                    {ride.pickup.lat.toFixed(4)}, {ride.pickup.lng.toFixed(4)}
                  </span>
                </div>

                {ride.driverLocation && (
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Driver location</span>
                    <span className="font-medium text-green-600">Live 🟢</span>
                  </div>
                )}

                <button
                  onClick={handleCancel}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 rounded-xl text-sm transition-colors border border-red-200"
                >
                  Cancel Ride
                </button>
              </div>
            )}

            {/* Active ride state */}
            {ride?.status === 'active' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="text-green-600 font-medium">In progress</span>
                </div>
                {ride.driverId && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Driver</span>
                    <span className="text-gray-700 font-medium">{ride.driverId}</span>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderPage;