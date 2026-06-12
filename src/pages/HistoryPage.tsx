import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRides } from '../api/mockapi';
import type { Ride } from '../api/mockapi';
import { useAuth } from '../context/authContext';
import { usePlaceName } from '../hooks/usePlaceName';

const statusStyles: Record<string, { badge: string }> = {
  completed: { badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
  cancelled: { badge: 'bg-rose-500/10 text-rose-300 border-rose-500/20' },
  rejected: { badge: 'bg-orange-500/10 text-orange-300 border-orange-500/20' },
};

const statusIcons: Record<string, string> = {
  completed: '✅',
  cancelled: '❌',
  rejected: '🚫',
};

const PlaceName = ({ location }: { location: { lat: number; lng: number } }) => {
  const { placeName, loading } = usePlaceName(location);
  return (
    <span className="text-sm font-medium text-slate-200 text-right">
      {loading ? 'Finding location…' : placeName || 'Unknown location'}
    </span>
  );
};

const HistoryPage = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadRides = async () => {
      try {
        const data = await fetchRides();
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        setRides(sorted);
      } catch {
        setError('Unable to load ride history.');
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
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-white/10 bg-slate-900/95 px-5 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Ride history</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Past trips</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Back
            </button>
            <button
              onClick={handleLogout}
              className="rounded-2xl border border-white/10 bg-blue-500/10 px-3 py-2 text-sm text-blue-200 transition hover:bg-blue-500/15"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-5 py-6 space-y-4">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/20">
          <p className="text-sm text-slate-400">A quick overview of your completed and canceled rides.</p>
          <p className="mt-3 text-2xl font-semibold text-white">Ride history</p>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="animate-pulse rounded-3xl bg-slate-900/70 p-5">
                <div className="h-4 w-1/3 rounded-full bg-slate-800 mb-4" />
                <div className="space-y-3">
                  <div className="h-3 rounded-full bg-slate-800" />
                  <div className="h-3 rounded-full bg-slate-800 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        )}

        {!loading && !error && rides.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-10 text-center text-slate-400">
            <p className="text-5xl">🚗</p>
            <p className="mt-4 text-lg font-semibold text-white">No rides yet</p>
            <p className="mt-2 text-sm text-slate-500">Completed rides will appear here.</p>
          </div>
        )}

        <div className="space-y-4">
          {!loading && rides.map((ride) => {
            const style = statusStyles[ride.status] ?? {
              badge: 'bg-slate-700/50 text-slate-200 border-slate-700/40',
            };

            return (
              <div key={ride.id} className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-lg shadow-black/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{statusIcons[ride.status]} Ride #{ride.id?.slice(-4)}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{ride.status.toUpperCase()}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${style.badge}`}>
                    {ride.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-950/80 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Pickup</p>
                    <PlaceName location={ride.pickup} />
                  </div>

                  <div className="rounded-3xl bg-slate-950/80 p-4">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Driver</span>
                      <span className="text-slate-200 font-medium">{ride.driverId || 'TBD'}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                      <span>Rider</span>
                      <span className="text-slate-200 font-medium">{ride.riderId}</span>
                    </div>
                  </div>
                </div>

                {ride.createdAt && (
                  <div className="mt-4 text-sm text-slate-500">
                    {new Date(ride.createdAt).toLocaleString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
