import type { MouseEventHandler } from 'react';
import {Car,PersonStanding , ArrowRight,LogOut ,History } from "lucide-react";

interface NavBarProps {
  role: string;
  roleColorClass?: string;
  onHistory: MouseEventHandler<HTMLButtonElement>;
  onLogout: MouseEventHandler<HTMLButtonElement>;
}

const NavBar = ({ role, onHistory, onLogout }: NavBarProps) => {
  const isDriver = role.toLowerCase() === 'driver';

  return (
    <div className="flex items-center justify-between px-5 py-3 bg-slate-900/95 backdrop-blur-md border-b border-white/10 z-10 shadow-lg shadow-black/20">

      {/* Left — brand + role badge */}
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="w-8 h-8 bg-blue-800 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30">
          <Car className="w-4 h-4 text-white" />
        </div>

        <span className="text-base font-bold text-white tracking-tight">
          Namlo Rides
        </span>

        {/* Role badge */}
        <span className={`
          text-xs px-2.5 py-0.5 rounded-full font-semibold border
          ${isDriver
            ? 'bg-green-500/20 text-green-400 border-green-500/30'
            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
          }
        `}>
          {role}
        </span>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1">

        {/* History button */}
        <button
          onClick={onHistory}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/90 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all"
        >
        <History className="w-3.5 h-3.5" />
          History
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>

      </div>
    </div>
  );
};

export default NavBar;