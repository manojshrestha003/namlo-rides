import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import type { UserRole } from '../types';
import { Car,PersonStanding , ArrowRight,LogOut } from "lucide-react";

const SelectRolePage = () => {
  const { switchRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (role: UserRole) => {
    switchRole(role);
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Namlo Rides
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Choose how you want to join
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-2 gap-4 mb-4">

          {/* Rider card */}
          <button
            onClick={() => handleSelect('rider')}
            className="group relative bg-white/10 hover:bg-blue-500/20 backdrop-blur-xl border border-white/20 hover:border-blue-400/60 rounded-3xl p-6 text-left transition-all duration-300 "
          >
            {/* Glow on hover */}
            <div className="absolute inset-0 rounded-3xl bg-blue-400/0 group-hover:bg-blue-400/5 transition-all duration-300" />

            <div className="relative">
              {/* Icon */}
              <div className="w-12 h-12 bg-blue-500/20 group-hover:bg-blue-500/30 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                <PersonStanding className="text-blue-400" />
              </div>

              <h3 className="font-bold text-white text-base mb-1">
                Rider
              </h3>
              <p className="text-xs text-white/40 group-hover:text-white/60 transition-colors leading-relaxed">
                Request a ride and track your driver in real time
              </p>

              {/* Arrow */}
              <div className="mt-4 flex items-center gap-1 text-blue-400/0 group-hover:text-blue-400 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
                <span className="text-xs font-medium">Get started</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </button>

          {/* Driver card */}
          <button
            onClick={() => handleSelect('driver')}
            className="group relative bg-white/10 hover:bg-green-500/20 backdrop-blur-xl border border-white/20 hover:border-green-400/60 rounded-3xl p-6 text-left transition-all duration-300 "
          >
            {/* Glow on hover */}
            <div className="absolute inset-0 rounded-3xl bg-green-400/0 group-hover:bg-green-400/5 transition-all duration-300" />

            <div className="relative">
              {/* Icon */}
              <div className="w-12 h-12 bg-green-500/20 group-hover:bg-green-500/30 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                <Car className="w-6 h-6 text-white" />
              </div>

              <h3 className="font-bold text-white text-base mb-1">
                Driver
              </h3>
              <p className="text-xs text-white/40 group-hover:text-white/60 transition-colors leading-relaxed">
                Accept ride requests and complete trips
              </p>

              {/* Arrow */}
              <div className="mt-4 flex items-center gap-1 text-green-400/0 group-hover:text-green-400 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
                <span className="text-xs font-medium">Get started</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </button>
        </div>

        {/* Hint */}
        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 mb-4 flex items-start gap-3">
          
          <p className="text-xs text-white/40 leading-relaxed">
            Open two browser tabs side by side  one as Rider, one as Driver to simulate a live ride in real time.
          </p>
        </div>

        {/* Sign out */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors py-2"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>


      </div>
    </div>
  );
};

export default SelectRolePage;