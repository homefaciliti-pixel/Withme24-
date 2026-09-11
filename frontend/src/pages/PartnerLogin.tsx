import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Lock, ArrowLeft, ShieldCheck, LogIn, UserPlus, Sparkles } from 'lucide-react';
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
        toast('Logged in successfully as Partner', 'success');
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
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Decorative Blur Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md w-full space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-700 transition-colors">
            <ArrowLeft size={14} /> Back to choices
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100/80 shadow-sm">
            <ShieldCheck size={14} className="text-purple-600" /> Partner Portal
          </span>
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-purple-500/20 text-white">
            <Sparkles size={22} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Partner Sign In</h2>
          <p className="text-xs font-medium text-slate-500 max-w-xs mx-auto">
            Access your companion dashboard, earnings, and booking requests.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Mobile Number</label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-3.5 text-slate-400" />
              <input
                type="tel"
                placeholder="+91 98765 43210"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-slate-700 block">Password</label>
              <Link to="/partner/forgot-password" className="text-xs text-purple-600 font-extrabold hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-3.5 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !mobile || !password}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-sm shadow-lg shadow-purple-600/25 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} /> Partner Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100 space-y-3">
          <p className="text-xs font-medium text-slate-500">Don't have a partner account yet?</p>
          <Link
            to="/partner/register"
            className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all border border-purple-200 shadow-sm"
          >
            <UserPlus size={16} /> Become a Partner (Register)
          </Link>
        </div>
      </div>
    </div>
  );
};
