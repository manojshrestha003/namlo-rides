import { useState } from 'react';
import { useRide } from '../context/RideContext';
import { useAuth } from '../context/authContext';
import type { Location } from '../types';
import RideMap from '../components/map/RideMap';
import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router-dom';
import { usePlaceName } from '../hooks/usePlaceName';
import {
  MapPin,
  Navigation,
  X,
  Car,
  CheckCircle,
  XCircle,
  Clock,
  Radio,
  Loader2,
  History,
} from 'lucide-react';

const RiderPage = () => {
  const { ride, requestRide, cancelRide } = useRide();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [pickup, setPickup] = useState<Location | null>(null);
  const [requesting, setRequesting] = useState(false);

  const { placeName, loading: placeLoading } = usePlaceName(pickup);
  const { placeName: ridePickupName } = usePlaceName(ride?.pickup ?? null);

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

  const isActive = ride && !['idle', 'completed', 'cancelled', 'rejected'].includes(ride.status);

  const statusConfig: Record<string, {
    text: string;
    sub: string;
    icon: React.ReactNode;
    bg: string;
    border: string;
    textColor: string;
  }> = {
    requesting: {
      text: 'Finding your driver',
      sub: 'Hang tight, connecting you...',
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/30',
      textColor: 'text-amber-400',
    },
    accepted: {
      text: 'Driver is on the way',
      sub: 'Your driver accepted the ride',
      icon: <Car className="w-5 h-5" />,
      bg: 'bg-blue-500/15',
      border: 'border-blue-500/30',
      textColor: 'text-blue-400',
    },
    active: {
      text: 'Ride in progress',
      sub: 'Sit back and enjoy the ride',
      icon: <Navigation className="w-5 h-5" />,
      bg: 'bg-green-500/15',
      border: 'border-green-500/30',
      textColor: 'text-green-400',
    },
    completed: {
      text: 'Ride completed!',
      sub: 'Thanks for riding with Namlo',
      icon: <CheckCircle className="w-5 h-5" />,
      bg: 'bg-green-500/15',
      border: 'border-green-500/30',
      textColor: 'text-green-400',
    },
    cancelled: {
      text: 'Ride cancelled',
      sub: 'Your ride was cancelled',
      icon: <XCircle className="w-5 h-5" />,
      bg: 'bg-red-500/15',
      border: 'border-red-500/30',
      textColor: 'text-red-400',
    },
    rejected: {
      text: 'Ride rejected',
      sub: 'Driver could not take your ride',
      icon: <XCircle className="w-5 h-5" />,
      bg: 'bg-red-500/15',
      border: 'border-red-500/30',
      textColor: 'text-red-400',
    },
  };

  const currentStatus = ride?.status ? statusConfig[ride.status] : null;

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <NavBar
        role="Rider"
        onHistory={() => navigate('/history')}
        onLogout={handleLogout}
      />

      {/* Split layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT — controls panel */}
        <div className="w-96 shrink-0 bg-slate-900 border-r border-white/10 flex flex-col overflow-y-auto">

          {/* Panel header */}
          <div className="px-6 pt-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2 mb-1">
             
              <h2 className="text-base font-bold text-white">Book a Ride</h2>
            </div>
            <p className="text-xs text-white/30">
              Tap anywhere on the map to set your pickup
            </p>
          </div>

          <div className="flex-1 px-6 py-5 space-y-4">

            {/* Status banner */}
            {currentStatus && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${currentStatus.bg} ${currentStatus.border}`}>
                <span className={currentStatus.textColor}>
                  {currentStatus.icon}
                </span>
                <div>
                  <p className={`text-sm font-semibold ${currentStatus.textColor}`}>
                    {currentStatus.text}
                  </p>
                  <p className="text-xs text-white/40">{currentStatus.sub}</p>
                </div>
              </div>
            )}

            {/* Idle / terminal state */}
            {(!ride || ['completed', 'cancelled', 'rejected'].includes(ride.status)) && (
              <div className="space-y-4">

                {/* Pickup field */}
                <div className="space-y-2">
                  <p className="text-xs  text-white/40  font-xl">
                    Pickup location
                  </p>

                  <div className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border transition-all ${
                    pickup
                      ? 'bg-blue-500/10 border-blue-500/40'
                      : 'bg-white/5 border-white/10 border-dashed'
                  }`}>
                    <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${pickup ? 'text-blue-400' : 'text-white/20'}`} />

                    {pickup ? (
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium leading-tight">
                          {placeLoading ? (
                            <span className="flex items-center gap-2 text-white/40">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Finding location...
                            </span>
                          ) : placeName}
                        </p>
                        <p className="text-xs text-white/30 mt-0.5 font-mono">
                          {pickup.lat.toFixed(4)}, {pickup.lng.toFixed(4)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-white/25 italic">
                        Tap the map to pin your location
                      </p>
                    )}

                    {pickup && (
                      <button
                        onClick={() => setPickup(null)}
                        className="text-white/20 hover:text-white/60 transition-colors mt-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/5" />

                {/* Fare estimate placeholder */}
                {pickup && (
                  <div className="bg-white/5 rounded-2xl border border-white/10 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/40">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">Estimated pickup</span>
                    </div>
                    <span className="text-sm text-white font-semibold">~3 min</span>
                  </div>
                )}

                {/* Request button */}
                <button
                  onClick={handleRequest}
                  disabled={!pickup || requesting}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-blue-500/30 "
                >
                  {requesting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Requesting...
                    </>
                  ) : (
                    <>
                      <Car className="w-4 h-4" />
                      Request Ride
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Requesting / accepted */}
            {ride && ['requesting', 'accepted'].includes(ride.status) && (
              <div className="space-y-3">

                <div className="bg-white/5 rounded-2xl border border-white/10 divide-y divide-white/5">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2 text-white/40">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs">Pickup</span>
                    </div>
                    <span className="text-sm text-white font-medium text-right max-w-[60%] truncate">
                      {ridePickupName || `${ride.pickup.lat.toFixed(4)}, ${ride.pickup.lng.toFixed(4)}`}
                    </span>
                  </div>

                  {ride.driverLocation && (
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2 text-green-400">
                        <Radio className="w-4 h-4" />
                        <span className="text-xs font-medium">Driver</span>
                      </div>
                      <span className="text-xs text-green-400 font-semibold">
                        Live 🟢
                      </span>
                    </div>
                  )}
                </div>

                {/* Waiting dots */}
                {ride.status === 'requesting' && (
                  <div className="flex items-center justify-center gap-2 py-2">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                    <span className="text-xs text-white/30 ml-1">
                      Waiting for driver...
                    </span>
                  </div>
                )}

                {ride.status === 'accepted' && (
                  <div className="flex items-center justify-center gap-2 py-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs text-blue-400">
                      Driver is heading your way
                    </span>
                  </div>
                )}

                <button
                  onClick={handleCancel}
                  className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold py-3.5 rounded-2xl text-sm transition-all border border-red-500/20 hover:border-red-500/40"
                >
                  <X className="w-4 h-4" />
                  Cancel Ride
                </button>
              </div>
            )}

            {/* Active ride */}
            {ride?.status === 'active' && (
              <div className="space-y-3">
                <div className="bg-white/5 rounded-2xl border border-white/10 divide-y divide-white/5">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2 text-white/40">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs">Pickup</span>
                    </div>
                    <span className="text-sm text-white font-medium">
                      {ridePickupName}
                    </span>
                  </div>
                  {ride.driverId && (
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2 text-white/40">
                        <Car className="w-4 h-4" />
                        <span className="text-xs">Driver</span>
                      </div>
                      <span className="text-sm text-white font-medium">
                        {ride.driverId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Bottom — history shortcut */}
          <div className="px-6 pb-6">
            <button
              onClick={() => navigate('/history')}
              className="w-full flex items-center justify-center gap-2 text-xs text-white/30 hover:text-white/60 py-3 rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:bg-white/5"
            >
              <History className="w-3.5 h-3.5" />
              View ride history
            </button>
          </div>
        </div>

        {/* RIGHT — full height map */}
        <div className="flex-1 relative">
          <RideMap
            pickupLocation={pickup}
            driverLocation={ride?.driverLocation}
            interactive={!isActive}
            onMapClick={(loc) => { if (!isActive) setPickup(loc); }}
          />

          {/* Map hint overlay — only when idle */}
          {!pickup && !ride && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs text-white/60">
                  Click anywhere on the map to set pickup
                </span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default RiderPage;