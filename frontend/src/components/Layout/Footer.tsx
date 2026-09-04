import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Safety Disclaimers */}
          <div className="space-y-4 md:col-span-2">
            <div className="text-xl font-black text-white">
              WithMe<span className="text-brand-500">24</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              WithMe24 is a verified social companionship marketplace connecting adults for local, legitimate, and safe activities. We focus on transparency, verification, and member safety.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-brand-400 font-bold">
              <ShieldCheck size={16} /> Trust + Verification + Safe Booking
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/companions" className="hover:text-white transition-colors">Discover Companions</Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-white transition-colors">Safety Center</Link>
              </li>
              <li>
                <Link to="/safety#rules" className="hover:text-white transition-colors">Community Guidelines</Link>
              </li>
            </ul>
          </div>

          {/* Platform Declaration */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Declaration</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              WithMe24 is strictly a social marketplace. The platform does NOT support, advertise, or allow dating, matchmaking, adult services, escorts, sexual services, or prostitution. Violating profiles are suspended instantly and reported to regional law enforcement.
            </p>
          </div>
        </div>

        <hr className="border-slate-800" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-4">
          <div>© {new Date().getFullYear()} WithMe24 Platform. All rights reserved. Registered adults only (18+).</div>
          <div className="flex gap-4">
            <Link to="/safety#privacy" className="hover:text-slate-400">Privacy Policy</Link>
            <Link to="/safety#terms" className="hover:text-slate-400">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
