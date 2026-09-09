import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Lock, ArrowLeft, ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { useToast } from '../components/Common/Toast';

export const PartnerLogin: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { partnerLogin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || !password) return;

    let targetMobile = mobile.trim();
    if (!targetMobile.startsWith('+')) {
      targetMobile = `+91${targetMobile.replace(/\D/g, '')}`;
    }

    setLoading(true);
    try {
      const res = await partnerLogin(targetMobile, password);
      if (res.success) {
        toast('Logged in successfully', 'success');
        // Check local storage or AuthContext state - navigate based on partner approval status
        navigate('/partner/application-status');
      } else {
        toast(res.message || 'Login failed', 'error');
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Partner login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-slate-50">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md w-full space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/login" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft size={14} /> Back to options
          </Link>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
            <ShieldCheck size={12} /> Partner Portal
          </span>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Partner Login</h2>
          <p className="text-xs text-slate-500">Enter your registered mobile number and password.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Mobile Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="tel"
                placeholder="+91 99999 99999"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-purple-500 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/10 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 block">Password</label>
              <Link to="/partner/forgot-password" className="text-xs text-purple-600 font-bold hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-purple-500 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/10 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? 'Logging in...' : <><LogIn size={16} /> Login as Partner</>}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100 space-y-3">
          <p className="text-xs text-slate-500">Don't have a partner account yet?</p>
          <Link
            to="/partner/register"
            className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-purple-200"
          >
            <UserPlus size={15} /> Become a Partner (Register)
          </Link>
        </div>
      </div>
    </div>
  );
};
