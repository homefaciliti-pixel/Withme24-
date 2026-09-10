import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Lock, HelpCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useToast } from '../components/Common/Toast';

export const CustomerLogin: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [mockOtpHint, setMockOtpHint] = useState<string | null>(null);

  const { sendCustomerOtp, verifyCustomerOtp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile) return;

    let targetMobile = mobile.trim();
    if (!targetMobile.startsWith('+')) {
      targetMobile = `+91${targetMobile.replace(/\D/g, '')}`;
    }

    setLoading(true);
    try {
      const res = await sendCustomerOtp(targetMobile);
      if (res.success) {
        setMobile(targetMobile);
        toast(res.message, 'info');
        setStep(2);
        if (res.mockOtp) {
          setMockOtpHint(res.mockOtp);
          setOtp(res.mockOtp);
        }
      } else {
        toast(res.message, 'error');
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to dispatch OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    try {
      const res = await verifyCustomerOtp(mobile, otp);
      if (res.success) {
        toast('Logged in successfully as Customer', 'success');
        if (res.isNewUser) {
          toast('Welcome to WithMe24! Customer account created automatically.', 'info');
        }
        navigate(from, { replace: true });
      } else {
        toast(res.message || 'OTP verification failed', 'error');
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'OTP verification failed', 'error');
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
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
            <ShieldCheck size={12} /> Customer Portal
          </span>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Customer Login</h2>
          <p className="text-xs text-slate-500">Sign in or create account using your mobile number and OTP.</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
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
                  className="w-full bg-slate-50 border border-slate-300 focus:border-brand-500 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/10 font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">No password needed. We will send a 6-digit verification code.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl text-sm shadow-sm transition-colors"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">4-Digit Verification Code</label>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-brand-600 hover:text-brand-700 text-xs font-semibold"
                >
                  Edit ({mobile})
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  maxLength={4}
                  placeholder="1234"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-brand-500 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/10 text-center tracking-widest font-black text-lg"
                />
              </div>
              {mockOtpHint && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-brand-700 font-medium bg-brand-50 p-2.5 rounded-xl border border-brand-100">
                  <HelpCircle size={14} className="shrink-0 text-brand-600" /> Demo Mode OTP: <span className="font-bold">{mockOtpHint}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl text-sm shadow-sm transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify OTP & Continue'}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Are you a Host or Social Companion?{' '}
            <Link to="/partner/login" className="text-purple-600 font-bold hover:underline">
              Partner Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
