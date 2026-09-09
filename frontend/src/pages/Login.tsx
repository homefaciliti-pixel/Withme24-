import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome to WithMe24</h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Please choose how you would like to proceed into the WithMe24 ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CUSTOMER CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col justify-between hover:shadow-md transition-all hover:border-brand-300 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 group-hover:scale-105 transition-transform">
                <UserCheck size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Customer / User</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Book verified companions for social events, dining, movie dates, shopping, and travel companionship.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                  Instant Mobile OTP Login
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                  Zero passwords required
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                  Browse 100% verified hosts
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/customer/login')}
              className="mt-8 w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 group-hover:gap-3 transition-all"
            >
              Continue as Customer <ArrowRight size={16} />
            </button>
          </div>

          {/* PARTNER CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col justify-between hover:shadow-md transition-all hover:border-purple-300 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Partner / Host</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Become a social companion, set your hourly rates, manage your availability, and earn securely.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Mobile + Password Login
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Official Admin KYC Approval
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Weekly Wallet Payouts
                </li>
              </ul>
            </div>

            <div className="mt-8 space-y-2">
              <button
                onClick={() => navigate('/partner/login')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <LogIn size={16} /> Partner Login
              </button>
              <button
                onClick={() => navigate('/partner/register')}
                className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <UserPlus size={15} /> Become a Partner (Register)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
