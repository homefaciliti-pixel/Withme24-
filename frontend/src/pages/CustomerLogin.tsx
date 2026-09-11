import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, ArrowLeft, ShieldCheck, RefreshCw, CheckCircle2, Sparkles, KeyRound } from 'lucide-react';
import { useToast } from '../components/Common/Toast';

export const CustomerLogin: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState<number>(0);

  const { sendCustomerOtp, verifyCustomerOtp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        toast(res.message || 'OTP sent successfully to your mobile number.', 'info');
        setStep(2);
        setOtpDigits(['', '', '', '']);
        setResendTimer(30);
        setTimeout(() => inputRefs[0].current?.focus(), 150);
      } else {
        toast(res.message || 'Failed to send OTP.', 'error');
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to dispatch OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    // Support multi-digit paste into single input
    if (cleanValue.length > 1) {
      const pasted = cleanValue.slice(0, 4).split('');
      const updated = ['', '', '', ''];
      pasted.forEach((char, i) => {
        if (i < 4) updated[i] = char;
      });
      setOtpDigits(updated);
      const nextFocus = Math.min(pasted.length, 3);
      inputRefs[nextFocus].current?.focus();
      return;
    }

    const updated = [...otpDigits];
    updated[index] = cleanValue.slice(-1);
    setOtpDigits(updated);

    // Auto-advance focus to next input
    if (index < 3 && cleanValue) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 4) {
      toast('Please enter the complete 4-digit OTP code.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyCustomerOtp(mobile, fullOtp);
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
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Glow decorative blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md w-full space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-700 transition-colors">
            <ArrowLeft size={14} /> Back to choices
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100/80 shadow-sm">
            <ShieldCheck size={14} className="text-purple-600" /> Customer Portal
          </span>
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-purple-500/20 text-white">
            <Sparkles size={22} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Customer Access</h2>
          <p className="text-xs font-medium text-slate-500 max-w-xs mx-auto">
            {step === 1 ? 'Enter your mobile number to receive a 4-digit verification code.' : `Enter the 4-digit code sent to ${mobile}`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
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
              <p className="text-[11px] text-slate-400 font-medium pl-1">No password needed. Account created automatically on verification.</p>
            </div>

            <button
              type="submit"
              disabled={loading || !mobile.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-sm shadow-lg shadow-purple-600/25 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Send Verification OTP'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound size={14} className="text-purple-600" /> Enter 4-Digit Code
                </label>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-purple-600 hover:text-purple-800 text-xs font-bold underline"
                >
                  Change ({mobile})
                </button>
              </div>

              {/* 4 Digit OTP Split Input */}
              <div className="flex justify-center gap-3">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-14 h-14 bg-slate-50 border-2 border-slate-200 focus:border-purple-600 focus:bg-white rounded-2xl text-center text-xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-500/15 transition-all shadow-sm"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-slate-500 font-medium">Didn't get the code?</span>
              {resendTimer > 0 ? (
                <span className="font-bold text-slate-400">Resend in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 hover:underline"
                >
                  <RefreshCw size={12} /> Resend OTP
                </button>
              )}
            </div>

            <div className="bg-purple-50/80 border border-purple-100 rounded-2xl p-3.5 text-xs text-purple-900 flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-purple-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-purple-800 font-medium">
                Enter the 4-digit code sent via SMS to verify and log in.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otpDigits.join('').length < 4}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-sm shadow-lg shadow-purple-600/25 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Verify & Enter Dashboard'
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-medium">
            Are you a Host or Social Companion?{' '}
            <Link to="/partner/login" className="text-purple-700 font-extrabold hover:underline">
              Partner Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
