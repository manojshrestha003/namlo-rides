import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRides } from '../api/mockapi';
import type { Ride } from '../api/mockapi';
import { useAuth } from '../context/authContext';
import { usePlaceName } from '../hooks/usePlaceName';
import {
  ArrowLeft,
  LogOut,
  MapPin,
  Car,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  ReceiptText,
  RefreshCw,
} from 'lucide-react';

const statusConfig: Record<string, {
  badge: string;
  glow: string;
  icon: React.ReactNode;
  label: string;
}> = {
  completed: {
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    glow: 'hover:border-emerald-500/20',
    icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    label: 'Completed',
  },
  cancelled: {
    badge: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
    glow: 'hover:border-rose-500/20',
    icon: <XCircle className="w-4 h-4 text-rose-400" />,
    label: 'Cancelled',
  },
  rejected: {
    badge: 'bg-orange-500/10 text-orange-300 border-orange-500/25',
    glow: 'hover:border-orange-500/20',
    icon: <Ban className="w-4 h-4 text-orange-400" />,
    label: 'Rejected',
  },
};

const PlaceName = ({ location }: { location: { lat: number; lng: number } }) => {
  const { placeName, loading } = usePlaceName(location);
  return loading ? (
    <span className="text-sm text-slate-500 italic animate-pulse">Finding location…</span>
  ) : (
    <span className="text-sm font-medium text-white">{placeName || 'Unknown location'}</span>
  );
};

const StatCard = ({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) => (
  <div className="bg-slate-800/50 border border-white/5 rounded-2xl px-5 py-4 flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  </div>
);

const HistoryPage = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const loadRides = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchRides();
      const sorted = data.sort(
        (a, b) =>
          new Date(b.createdAt || '').getTime() -
          new Date(a.createdAt || '').getTime()
      );
      setRides(sorted);
      setError('');
    } catch {
      setError('Unable to load ride history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadRides(); }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const completed = rides.filter((r) => r.status === 'completed').length;
  const cancelled = rides.filter((r) => r.status === 'cancelled').length;
  const rejected  = rides.filter((r) => r.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-900/95 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-5 py-4 flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest">History</p>
              <h1 className="text-base font-bold text-white leading-tight">Past Trips</h1>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadRides(true)}
              disabled={refreshing}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-slate-400 hover:text-white disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 px-3 py-2 rounded-xl border border-white/10 hover:border-rose-500/20 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-5 py-6 space-y-6">

        {/* Stats row */}
        {!loading && rides.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Completed"
              value={completed}
              icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
            />
            <StatCard
              label="Cancelled"
              value={cancelled}
              icon={<XCircle className="w-5 h-5 text-rose-400" />}
            />
            <StatCard
              label="Rejected"
              value={rejected}
              icon={<Ban className="w-5 h-5 text-orange-400" />}
            />
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-3xl bg-slate-900/70 border border-white/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 w-24 rounded-full bg-slate-800" />
                  <div className="h-5 w-20 rounded-full bg-slate-800" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 rounded-2xl bg-slate-800" />
                  <div className="h-16 rounded-2xl bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
            <XCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && rides.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60 py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <ReceiptText className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-lg font-semibold text-white">No rides yet</p>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">
              Your completed, cancelled, and rejected rides will show up here.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-6 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Car className="w-4 h-4" />
              Book your first ride
            </button>
          </div>
        )}

        {/* Ride cards */}
        {!loading && rides.length > 0 && (
          <div className="space-y-3">
            {rides.map((ride, index) => {
              const config = statusConfig[ride.status] ?? {
                badge: 'bg-slate-700/50 text-slate-300 border-slate-600/40',
                glow: '',
                icon: <Clock className="w-4 h-4 text-slate-400" />,
                label: ride.status,
              };

              return (
                <div
                  key={ride.id}
                  className={`group rounded-3xl border border-white/8 bg-slate-900/70 p-5 shadow-lg shadow-black/10 transition-all duration-200 hover:bg-slate-900/90 ${config.glow}`}
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      {config.icon}
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Ride #{ride.id?.slice(-4).toUpperCase()}
                        </p>
                        {ride.createdAt && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {new Date(ride.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border ${config.badge}`}>
                      {config.label}
                    </span>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {/* Pickup */}
                    <div className="bg-slate-950/60 rounded-2xl border border-white/5 px-4 py-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Pickup</p>
                      </div>
                      <PlaceName location={ride.pickup} />
                      <p className="text-xs text-slate-600 font-mono mt-0.5">
                        {ride.pickup.lat.toFixed(4)}, {ride.pickup.lng.toFixed(4)}
                      </p>
                    </div>

                    {/* People */}
                    <div className="bg-slate-950/60 rounded-2xl border border-white/5 px-4 py-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs text-slate-500 uppercase tracking-wider">Rider</span>
                        </div>
                        <span className="text-sm font-medium text-white">{ride.riderId}</span>
                      </div>
                      <div className="h-px bg-white/5" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs text-slate-500 uppercase tracking-wider">Driver</span>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {ride.driverId || (
                            <span className="text-slate-600 italic text-xs">Not assigned</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
};

export default HistoryPage;