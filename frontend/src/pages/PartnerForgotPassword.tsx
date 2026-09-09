import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Lock, HelpCircle, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';
import { useToast } from '../components/Common/Toast';

export const PartnerForgotPassword: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [mockOtpHint, setMockOtpHint] = useState<string | null>(null);

  const { sendPartnerForgotPasswordOtp, resetPartnerPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile) return;

    let targetMobile = mobile.trim();
    if (!targetMobile.startsWith('+')) {
      targetMobile = `+91${targetMobile.replace(/\D/g, '')}`;
    }

    setLoading(true);
    try {
      const res = await sendPartnerForgotPasswordOtp(targetMobile);
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
      toast(err.response?.data?.message || 'Failed to dispatch reset OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) return;

    if (newPassword.length < 6) {
      toast('Password must be at least 6 characters long', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPartnerPassword(mobile, otp, newPassword);
      if (res.success) {
        toast('Password reset successfully. Please log in with your new password.', 'success');
        navigate('/partner/login');
      } else {
        toast(res.message || 'Password reset failed', 'error');
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Password reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-slate-50">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md w-full space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/partner/login" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft size={14} /> Back to Partner Login
          </Link>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
            <ShieldCheck size={12} /> Password Recovery
          </span>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Reset Partner Password</h2>
          <p className="text-xs text-slate-500">Verify your mobile number via OTP to reset your password.</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Registered Partner Mobile Number</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl text-sm shadow-sm transition-colors"
            >
              {loading ? 'Sending OTP...' : 'Send Reset OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">6-Digit Reset OTP</label>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-purple-600 hover:text-purple-700 text-xs font-semibold"
                >
                  Edit ({mobile})
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-purple-500 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none text-center tracking-widest font-black text-lg"
                />
              </div>
              {mockOtpHint && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-700 font-medium bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                  <HelpCircle size={14} className="shrink-0 text-purple-600" /> Demo Reset OTP: <span className="font-bold">{mockOtpHint}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">New Password</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-purple-500 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Confirm New Password</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-purple-500 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl text-sm shadow-sm transition-colors"
            >
              {loading ? 'Resetting Password...' : 'Reset Password & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
