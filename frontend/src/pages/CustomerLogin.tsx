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
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-purple-50/40 to-indigo-50/30 relative overflow-hidden">
      {/* Soft Ambient Light Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-purple-300/20 blur-3xl rounded-full pointer-events-none" />

      <div className="bg-white rounded-3xl shadow-xl shadow-purple-900/5 border border-purple-100/80 p-8 max-w-md w-full space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-700 transition-colors">
            <ArrowLeft size={14} /> Back to options
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-purple-700 bg-purple-100/60 px-3 py-1.5 rounded-full border border-purple-200/60 shadow-2xs">
            <ShieldCheck size={14} className="text-purple-600" /> Customer Portal
          </span>
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-600/20 text-white">
            <Sparkles size={22} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customer Access</h2>
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
                  className="w-full bg-slate-50/80 border border-slate-200 focus:border-purple-600 focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all shadow-2xs"
                />
              </div>
              <p className="text-[11px] text-slate-400 font-medium pl-1">No password needed. Account created automatically on verification.</p>
            </div>

            <button
              type="submit"
              disabled={loading || !mobile.trim()}
              className="w-full bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-lg shadow-purple-600/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
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
                  className="text-purple-700 hover:text-purple-900 text-xs font-extrabold underline"
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
                    className="w-14 h-14 bg-slate-50/80 border-2 border-slate-200 focus:border-purple-600 focus:bg-white rounded-2xl text-center text-xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-500/15 transition-all shadow-2xs"
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
                  className="font-extrabold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 hover:underline"
                >
                  <RefreshCw size={12} /> Resend OTP
                </button>
              )}
            </div>

            <div className="bg-purple-50/90 border border-purple-100 rounded-2xl p-3.5 text-xs text-purple-900 flex items-start gap-2.5 shadow-2xs">
              <CheckCircle2 size={16} className="text-purple-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-purple-800 font-medium">
                Enter the 4-digit code sent via SMS to verify and log in.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otpDigits.join('').length < 4}
              className="w-full bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-lg shadow-purple-600/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
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
            <Link to="/partner/login" className="text-purple-700 font-black hover:underline">
              Partner Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
