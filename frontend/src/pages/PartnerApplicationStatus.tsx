import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle2, XCircle, AlertTriangle, LogOut, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

export const PartnerApplicationStatus: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    refreshUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const status = user?.partner_status || user?.kyc_status || 'PENDING_VERIFICATION';

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-slate-50">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-lg w-full space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
            <ShieldCheck size={14} /> Partner Identity Verification
          </span>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* PENDING VERIFICATION */}
        {status === 'PENDING_VERIFICATION' || status === 'PENDING' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
              <Clock size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Application Under Review</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Thank you for applying to become a WithMe24 Social Companion. Your profile and KYC identity documents are currently being inspected by our verification team.
              </p>
            </div>
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900 text-left space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <Clock size={15} /> Expected Response Time: 12-24 Hours
              </p>
              <p className="text-[11px] text-amber-700">
                Once approved, your companion profile will be activated automatically and made visible in public guest searches.
              </p>
            </div>
            <button
              onClick={() => refreshUser()}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw size={14} /> Refresh Application Status
            </button>
          </div>
        )}

        {/* APPROVED */}
        {status === 'APPROVED' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Profile Verified & Approved!</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Congratulations! Your identity and companion profile have been approved by Admin. You are now an official active Partner on WithMe24.
              </p>
            </div>
            <button
              onClick={() => navigate('/companion-dashboard')}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              Go to Companion Dashboard <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* REJECTED */}
        {status === 'REJECTED' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Application Declined</h2>
              <p className="text-xs text-slate-500 mt-1">
                Your partner application was not approved during administrative verification.
              </p>
            </div>
            {user?.rejection_reason && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 text-left space-y-1">
                <p className="font-bold text-rose-800">Reason for Rejection:</p>
                <p className="text-[11px] text-rose-700 leading-relaxed font-medium">{user.rejection_reason}</p>
              </div>
            )}
            <Link
              to="/partner/register"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              Re-apply & Resubmit Profile
            </Link>
          </div>
        )}

        {/* RESUBMISSION REQUIRED */}
        {status === 'RESUBMISSION_REQUIRED' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Document Resubmission Required</h2>
              <p className="text-xs text-slate-500 mt-1">
                Our verification team requires updated or clearer identity documents to approve your application.
              </p>
            </div>
            {user?.rejection_reason && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-xs text-orange-900 text-left space-y-1">
                <p className="font-bold text-orange-800">Admin Instructions:</p>
                <p className="text-[11px] text-orange-700 leading-relaxed font-medium">{user.rejection_reason}</p>
              </div>
            )}
            <Link
              to="/partner/register"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              Upload Revised KYC Documents
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
