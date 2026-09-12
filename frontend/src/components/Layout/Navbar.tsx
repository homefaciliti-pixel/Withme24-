import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogOut, Menu } from 'lucide-react';
import { EmergencyModal } from '../EmergencyModal';
import api from '../../services/api';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const [sosOpen, setSosOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleBecomeCompanion = () => {
    navigate('/partner/register');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'COMPANION' || user.role === 'PARTNER') {
      if (user.partner_status === 'APPROVED' || user.role === 'COMPANION') {
        return '/companion-dashboard';
      }
      return '/partner/application-status';
    }
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'MODERATOR') {
      return '/admin';
    }
    return '/dashboard';
  };

  return (
    <>
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tight group">
                <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-brand-600 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                  WithMe
                </span>
                <span className="bg-gradient-to-r from-brand-600 to-purple-600 text-white text-xs font-black px-2 py-0.5 rounded-md shadow-xs">
                  24
                </span>
              </Link>
              <span className="hidden sm:inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border border-purple-200/70 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 18+ Verified Only
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-5">
              <Link to="/find-partner" className="text-slate-600 hover:text-purple-700 text-xs sm:text-sm font-bold transition-colors">
                Find Companion
              </Link>
              <Link to="/explore" className="text-slate-600 hover:text-purple-700 text-xs sm:text-sm font-bold transition-colors flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Explore
              </Link>
              <Link to="/partner-requests" className="text-slate-600 hover:text-purple-700 text-xs sm:text-sm font-bold transition-colors">
                Requests
              </Link>
              <Link to="/verification-hub" className="text-slate-600 hover:text-purple-700 text-xs sm:text-sm font-bold transition-colors">
                KYC Hub
              </Link>
              <Link to="/chat" className="text-slate-600 hover:text-purple-700 text-xs sm:text-sm font-bold transition-colors">
                Chat & Call
              </Link>

              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  {/* Dashboard Route button */}
                  <Link
                    to={getDashboardLink()}
                    className="bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-black px-4 py-2 rounded-xl border border-purple-200 transition-all shadow-2xs"
                  >
                    Dashboard
                  </Link>

                  {user.role === 'CUSTOMER' && (
                    <button
                      onClick={handleBecomeCompanion}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-sm transition-all"
                    >
                      Become Host
                    </button>
                  )}

                  {/* SOS PANIC BUTTON */}
                  <button
                    onClick={() => setSosOpen(true)}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-md active:scale-95 transition-all"
                  >
                    <ShieldAlert size={14} className="animate-pulse" /> SOS
                  </button>

                  {/* Profile Dropdown or Simple Details */}
                  <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                    {user.profile_photo ? (
                      <img
                        src={user.profile_photo}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover border-2 border-purple-200 shadow-2xs"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-2xs">
                        {user.name ? user.name[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="text-xs text-slate-700 hidden lg:block">
                      <div className="font-extrabold text-slate-800 leading-tight">{user.name || 'User'}</div>
                      <div className="text-[9px] text-purple-600 font-black uppercase tracking-wider">
                        {user.role === 'COMPANION' ? 'HOST' : 'CUSTOMER'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-all"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="bg-gradient-to-r from-purple-700 via-indigo-700 to-brand-700 hover:from-purple-800 hover:to-brand-800 text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    Login / Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Icon */}
            <div className="flex items-center gap-2 md:hidden">
              {isAuthenticated && (
                <button
                  onClick={() => setSosOpen(true)}
                  className="flex items-center gap-0.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-md"
                >
                  <ShieldAlert size={12} /> SOS
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-500 hover:bg-slate-100 p-2 rounded-md"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white p-4 space-y-3">
            <Link
              to="/find-partner"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 hover:text-brand-600 font-semibold py-1.5 text-sm"
            >
              Find a Partner
            </Link>
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 hover:text-brand-600 font-semibold py-1.5 text-sm"
            >
              Services
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 hover:text-brand-600 font-semibold py-1.5 text-sm"
            >
              How It Works
            </Link>
            <Link
              to="/become-partner"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 hover:text-brand-600 font-semibold py-1.5 text-sm"
            >
              Become a Partner
            </Link>
            <Link
              to="/safety"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 hover:text-brand-600 font-semibold py-1.5 text-sm"
            >
              Safety Center
            </Link>
            <Link
              to="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 hover:text-brand-600 font-semibold py-1.5 text-sm"
            >
              Help Center
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center bg-brand-50 text-brand-700 font-bold py-2 rounded-lg"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 border border-slate-200 text-slate-600 font-bold py-2 rounded-lg"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center bg-brand-600 text-white font-bold py-2.5 rounded-lg"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Global panic module */}
      <EmergencyModal isOpen={sosOpen} onClose={() => setSosOpen(false)} />
    </>
  );
};
