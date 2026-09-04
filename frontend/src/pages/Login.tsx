import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Lock, HelpCircle } from 'lucide-react';
import { useToast } from '../components/Common/Toast';

export const Login: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'CUSTOMER' | 'COMPANION'>('CUSTOMER');
  const [mockOtpHint, setMockOtpHint] = useState<string | null>(null);

  const { sendOtp, verifyOtp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target
  const defaultTarget = role === 'COMPANION' ? '/companion-dashboard' : '/dashboard';
  const from = (location.state as any)?.from?.pathname || defaultTarget;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile) return;

    let targetMobile = mobile.trim();
    if (!targetMobile.startsWith('+')) {
      targetMobile = `+91${targetMobile.replace(/\D/g, '')}`;
    }

    setLoading(true);
    try {
      const res = await sendOtp(targetMobile);
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
      const res = await verifyOtp(mobile, otp, role);
      if (res.success) {
        toast('Logged in successfully', 'success');
        if (res.isNewUser) {
          toast('Welcome to WithMe24! Please update your profile.', 'info');
        }
        const destination = role === 'COMPANION' ? '/companion-dashboard' : (from || '/dashboard');
        navigate(destination, { replace: true });
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'OTP verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-slate-50">
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 max-w-sm w-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black text-slate-800">Verify Identity</h2>
          <p className="text-xs text-slate-500">Secure OTP Authentication via Mobile Number</p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              role === 'CUSTOMER'
                ? 'bg-white text-brand-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            👤 User Login
          </button>
          <button
            type="button"
            onClick={() => setRole('COMPANION')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              role === 'COMPANION'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            🤝 Partner / Host
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Mobile Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+919999999999"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-350 focus:border-brand-500 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold py-2.5 rounded-lg text-sm shadow-sm transition-colors"
            >
              {loading ? 'Requesting OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-600">Verification Code</label>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-brand-600 hover:text-brand-700 text-xs font-semibold"
                >
                  Edit Number
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-350 focus:border-brand-500 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none text-center tracking-widest font-bold"
                />
              </div>
              {mockOtpHint && (
                <div className="flex items-center gap-1 mt-1 text-[11px] text-brand-600 font-semibold bg-brand-50 p-2 rounded-lg">
                  <HelpCircle size={14} /> Mock Dev Mode OTP: {mockOtpHint}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold py-2.5 rounded-lg text-sm shadow-sm transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
