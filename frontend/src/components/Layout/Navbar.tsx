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

  const handleBecomeCompanion = async () => {
    try {
      await api.put('/users/profile', { role: 'COMPANION' });
      await refreshUser();
      navigate('/companion-dashboard/profile');
    } catch (err) {
      console.error('Failed to update role', err);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'COMPANION') return '/companion-dashboard';
    return '/dashboard';
  };

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 text-2xl font-black text-brand-600 tracking-tight">
                WithMe<span className="text-slate-800">24</span>
              </Link>
              <span className="hidden sm:inline bg-slate-100 text-slate-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-slate-200">
                18+ verified Only
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-5">
              <Link to="/find-partner" className="text-slate-600 hover:text-brand-600 text-xs sm:text-sm font-semibold transition-colors">
                Find a Partner
              </Link>
              <Link to="/services" className="text-slate-600 hover:text-brand-600 text-xs sm:text-sm font-semibold transition-colors">
                Services
              </Link>
              <Link to="/how-it-works" className="text-slate-600 hover:text-brand-600 text-xs sm:text-sm font-semibold transition-colors">
                How It Works
              </Link>
              <Link to="/become-partner" className="text-slate-600 hover:text-brand-600 text-xs sm:text-sm font-semibold transition-colors">
                Become a Partner
              </Link>
              <Link to="/safety" className="text-slate-600 hover:text-brand-600 text-xs sm:text-sm font-semibold transition-colors">
                Safety
              </Link>
              <Link to="/help" className="text-slate-600 hover:text-brand-600 text-xs sm:text-sm font-semibold transition-colors">
                Help
              </Link>

              {isAuthenticated && user ? (
                <div className="flex items-center gap-4">
                  {/* Dashboard Route button */}
                  <Link
                    to={getDashboardLink()}
                    className="bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold px-4 py-2 rounded-lg border border-brand-200 transition-all"
                  >
                    My Dashboard
                  </Link>

                  {user.role === 'CUSTOMER' && (
                    <button
                      onClick={handleBecomeCompanion}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition-all"
                    >
                      Become a Host / Companion
                    </button>
                  )}

                  {/* SOS PANIC BUTTON */}
                  <button
                    onClick={() => setSosOpen(true)}
                    className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md active:scale-95 transition-all"
                  >
                    <ShieldAlert size={14} className="animate-pulse" /> GET HELP
                  </button>

                  {/* Profile Dropdown or Simple Details */}
                  <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                    {user.profile_photo ? (
                      <img
                        src={user.profile_photo}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">
                        {user.name ? user.name[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="text-xs text-slate-700 hidden lg:block">
                      <div className="font-bold">{user.name || 'User'}</div>
                      <div className="text-[10px] text-brand-600 font-bold uppercase tracking-wider">
                        {user.role === 'COMPANION' ? 'PARTNER / HOST' : 'USER'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg shadow-sm transition-all"
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
