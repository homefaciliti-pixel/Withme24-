import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 relative overflow-hidden text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl w-full space-y-10 relative z-10 py-8">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-purple-500/10 text-purple-300 text-xs font-black px-4 py-1.5 rounded-full border border-purple-500/20 shadow-md">
            <ShieldCheck size={16} className="text-emerald-400" /> Welcome to WithMe24 Portal
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Choose Your Destination
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto font-medium">
            Select your account portal to access customer companionship services or host partner management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CUSTOMER CARD */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/80 p-8 flex flex-col justify-between hover:border-purple-500/60 transition-all hover:-translate-y-1 shadow-2xl group">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
                <UserCheck size={32} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white">Customer Portal</h2>
                  <span className="bg-purple-500/20 text-purple-300 text-[10px] uppercase font-black px-2.5 py-1 rounded-full border border-purple-500/30">
                    Instant Access
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Book verified local companions for movies, cafe dates, shopping trips, events, and everyday activities.
                </p>
              </div>

              <ul className="text-xs text-slate-300 space-y-3 pt-4 border-t border-slate-700/60 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Instant Mobile OTP Login (4 Digits)
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Zero Password Required
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  100% Aadhaar Verified Hosts & Escrow
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/customer/login')}
              className="mt-8 w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 hover:from-purple-700 hover:to-brand-700 text-white font-black py-4 px-6 rounded-2xl text-xs sm:text-sm shadow-xl shadow-purple-950/50 flex items-center justify-center gap-2.5 group-hover:gap-3.5 transition-all active:scale-95"
            >
              Continue as Customer <ArrowRight size={18} />
            </button>
          </div>

          {/* PARTNER CARD */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/80 p-8 flex flex-col justify-between hover:border-emerald-500/60 transition-all hover:-translate-y-1 shadow-2xl group">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                <ShieldCheck size={32} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white">Partner Host Portal</h2>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-black px-2.5 py-1 rounded-full border border-emerald-500/30">
                    Earn Money
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Become a verified companion, set your hourly rates, manage bookings, and receive weekly bank payouts.
                </p>
              </div>

              <ul className="text-xs text-slate-300 space-y-3 pt-4 border-t border-slate-700/60 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  Mobile + Password Secured Login
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  4-Step Companion Registration & KYC
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  Direct Bank Payouts up to ₹2,000/hr
                </li>
              </ul>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => navigate('/partner/login')}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-black py-3.5 px-6 rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-600"
              >
                <LogIn size={18} /> Partner Sign In
              </button>
              <button
                onClick={() => navigate('/partner/register')}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <UserPlus size={16} /> Register as Partner (Join Now)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
