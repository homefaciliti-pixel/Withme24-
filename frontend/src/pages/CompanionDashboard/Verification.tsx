import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { useToast } from '../../components/Common/Toast';
import { FileCheck, ShieldCheck, ShieldAlert, Upload, Loader } from 'lucide-react';
import api from '../../services/api';

export const CompanionVerification: React.FC = () => {
  const { toast } = useToast();
  
  const [kycStatus, setKycStatus] = useState<string>('NOT_STARTED');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  
  const [docType, setDocType] = useState('Aadhaar');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadKycStatus = () => {
    setLoading(true);
    api
      .get('/kyc/status')
      .then((res) => {
        if (res.data.success) {
          setKycStatus(res.data.data.status);
          setRejectionReason(res.data.data.rejection_reason);
        }
      })
      .catch((e) => console.error('Failed to load KYC status', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadKycStatus();
  }, []);

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontFile || !selfieFile) {
      toast('Please upload both a front document scan and a selfie verification picture', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('document_type', docType);
      formData.append('document_front', frontFile);
      if (backFile) formData.append('document_back', backFile);
      formData.append('selfie', selfieFile);

      const res = await api.post('/kyc', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        toast('KYC documents uploaded successfully for admin audit!', 'success');
        loadKycStatus();
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to submit KYC documentation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar type="companion" />

      <main className="flex-grow p-6 space-y-6 max-w-4xl">
        <h2 className="text-xl font-bold text-slate-800">Identity Verification (KYC)</h2>

        {loading ? (
          <div className="text-center text-xs text-slate-400 py-12">Checking verification records...</div>
        ) : (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
              {kycStatus === 'VERIFIED' && (
                <div className="flex items-center gap-3 text-emerald-600">
                  <ShieldCheck size={40} className="shrink-0 animate-bounce" />
                  <div>
                    <h3 className="font-bold text-base">Account Verified</h3>
                    <p className="text-xs text-slate-500">Your KYC audit passed. Your companion profile is published and visible on the marketplace directory.</p>
                  </div>
                </div>
              )}

              {['PENDING', 'UNDER_REVIEW'].includes(kycStatus) && (
                <div className="flex items-center gap-3 text-brand-600">
                  <Loader size={40} className="shrink-0 animate-spin" />
                  <div>
                    <h3 className="font-bold text-base">Audit Under Review</h3>
                    <p className="text-xs text-slate-500">Our safety moderators are validating your documents. Reviews are typically resolved in 12-24 hours.</p>
                  </div>
                </div>
              )}

              {kycStatus === 'REJECTED' && (
                <div className="flex items-center gap-3 text-rose-600">
                  <ShieldAlert size={40} className="shrink-0" />
                  <div>
                    <h3 className="font-bold text-base">Verification Audits Failed</h3>
                    <p className="text-xs text-slate-500">Your documents were rejected. Please check comments and re-upload valid scans.</p>
                    {rejectionReason && (
                      <div className="mt-2 text-xs font-bold bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-rose-700">
                        Moderator comments: "{rejectionReason}"
                      </div>
                    )}
                  </div>
                </div>
              )}

              {kycStatus === 'NOT_STARTED' && (
                <div className="flex items-center gap-3 text-slate-400">
                  <FileCheck size={40} className="shrink-0" />
                  <div>
                    <h3 className="font-bold text-base text-slate-600">Verification Pending</h3>
                    <p className="text-xs text-slate-500">Companions must complete 18+ verification audits before publishing profiles or taking bookings.</p>
                  </div>
                </div>
              )}
            </div>

            {/* KYC Submission Form */}
            {(kycStatus === 'NOT_STARTED' || kycStatus === 'REJECTED') && (
              <form onSubmit={handleSubmitKyc} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Submit Identification Documents</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select ID Type */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Document Type</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full border border-slate-350 bg-white rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-brand-500 outline-none font-semibold text-slate-700"
                    >
                      <option value="Aadhaar">Aadhaar Card (India)</option>
                      <option value="Passport">Passport</option>
                      <option value="Driving License">Driving License</option>
                      <option value="PAN Card">PAN Card</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Document Front */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">ID Document Front Scan</label>
                    <div className="border-2 border-dashed border-slate-250 hover:border-brand-400 rounded-lg p-4 text-center cursor-pointer transition-colors relative flex flex-col items-center justify-center min-h-[120px]">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        required
                        onChange={(e) => setFrontFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload size={22} className="text-slate-400 mb-1" />
                      <div className="text-[10px] text-slate-500 truncate font-semibold w-full px-2">
                        {frontFile ? frontFile.name : 'Upload front page'}
                      </div>
                    </div>
                  </div>

                  {/* Document Back */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">ID Document Back Scan (Optional)</label>
                    <div className="border-2 border-dashed border-slate-250 hover:border-brand-400 rounded-lg p-4 text-center cursor-pointer transition-colors relative flex flex-col items-center justify-center min-h-[120px]">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setBackFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload size={22} className="text-slate-400 mb-1" />
                      <div className="text-[10px] text-slate-500 truncate font-semibold w-full px-2">
                        {backFile ? backFile.name : 'Upload back page'}
                      </div>
                    </div>
                  </div>

                  {/* Face Selfie */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">Face Verification Selfie</label>
                    <div className="border-2 border-dashed border-slate-250 hover:border-brand-400 rounded-lg p-4 text-center cursor-pointer transition-colors relative flex flex-col items-center justify-center min-h-[120px]">
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload size={22} className="text-slate-400 mb-1" />
                      <div className="text-[10px] text-slate-500 truncate font-semibold w-full px-2">
                        {selfieFile ? selfieFile.name : 'Upload face selfie'}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  {submitting ? 'Submitting Documents...' : 'Submit Documents for Verification'}
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
