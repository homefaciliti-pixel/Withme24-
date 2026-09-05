import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, User, Shield, Sparkles } from 'lucide-react';

export const UserNavTabs: React.FC = () => {
  const activeClass = 'flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md transition-all';
  const inactiveClass = 'flex items-center gap-2 px-5 py-2.5 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-xs font-bold rounded-xl border border-slate-200 transition-all';

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-4 mb-6">
      <NavLink to="/dashboard" end className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
        <LayoutDashboard size={16} /> Account Overview
      </NavLink>
      <NavLink to="/dashboard/bookings" end className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
        <Calendar size={16} /> My Outings
      </NavLink>
      <NavLink to="/dashboard/profile" end className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
        <User size={16} /> Profile & Blocked
      </NavLink>
      <NavLink to="/safety" end className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
        <Shield size={16} /> Safety Center
      </NavLink>
      <NavLink
        to="/find-partner"
        className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm sm:ml-auto"
      >
        <Sparkles size={15} /> Find Companions
      </NavLink>
    </div>
  );
};
