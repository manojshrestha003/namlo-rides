
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRides } from '../api/mockapi';
import type { Ride } from '../api/mockapi';
import { useAuth } from '../context/authContext';
import {usePlaceName} from '../hooks/usePlaceName';

const statusColors: Record<string, string> = {
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  rejected:  'bg-orange-50 text-orange-700 border-orange-200',
};

const statusIcons: Record<string, string> = {
  completed: '✅',
  cancelled: '❌',
  rejected:  '🚫',
};

const HistoryPage = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { placeName } = usePlaceName(rides[0]?.pickup);

  useEffect(() => {
    const loadRides = async () => {
      try {
        const data = await fetchRides();
        // Most recent first
        const sorted = data.sort((a, b) =>
          new Date(b.createdAt || '').getTime() -
          new Date(a.createdAt || '').getTime()
        );
        setRides(sorted);
      } catch (err) {
        setError('Failed to load ride history.');
      } finally {
        setLoading(false);
      }
    };

    loadRides();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-base font-semibold text-gray-900">Ride History</h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-3">

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse"
              >
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && rides.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🚗</p>
            <p className="text-gray-500 text-sm">No rides yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Completed rides will appear here
            </p>
          </div>
        )}

        {/* Ride cards */}
        {!loading && rides.map((ride) => (
          <div
            key={ride.id}
            className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {statusIcons[ride.status]} Ride #{ride.id?.slice(-4)}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[ride.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {ride.status}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pickup</span>
                <span className="text-gray-700 font-medium">
                  📍 {placeName || `${ride.pickup.lat.toFixed(4)}, ${ride.pickup.lng.toFixed(4)}`}
                </span>
              </div>

              {ride.driverId && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Driver</span>
                  <span className="text-gray-700 font-medium">{ride.driverId}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Rider</span>
                <span className="text-gray-700 font-medium">{ride.riderId}</span>
              </div>

              {ride.createdAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Date</span>
                  <span className="text-gray-700">
                    {new Date(ride.createdAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default HistoryPage;