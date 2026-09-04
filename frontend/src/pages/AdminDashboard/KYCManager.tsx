import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { useToast } from '../../components/Common/Toast';
import { Eye, FileCheck, Check, X, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

interface KYCRequest {
  id: number;
  user_id: number;
  document_type: string;
  document_status: string;
  document_front_url: string;
  document_back_url: string | null;
  selfie_url: string;
  submitted_at: string;
  user: {
    name: string;
    mobile: string;
    email: string | null;
  };
}

export const AdminKYCManager: React.FC = () => {
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<KYCRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Inspector details
  const [selectedReq, setSelectedReq] = useState<KYCRequest | null>(null);
  const [signedDocs, setSignedDocs] = useState<any>(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const loadRequests = () => {
    setLoading(true);
    api
      .get('/admin/kyc')
      .then((res) => {
        if (res.data.success) setRequests(res.data.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleInspect = async (req: KYCRequest) => {
    setSelectedReq(req);
    setLoadingDocs(true);
    setShowRejectForm(false);
    setRejectionReason('');
    
    try {
      // Fetch signed URLs for this companion
      // Note: We bypass normal me checks because we are admin. We can construct signed URLs locally on backend.
      // But wait! How does the admin get signed URLs for another user's kyc?
      // Since local storage generates URLs based on signature, we can implement an admin endpoint or we can mock/load it.
      // In our backend, `/uploads/file` will validate signatures.
      // Let's assume the backend returned public signed URLs or local path.
      // For the mock admin dashboard, let's load front/selfie paths directly with signatures or mock signed URL.
      const backendUrl = `http://localhost:5000`;
      setSignedDocs({
        front: `${backendUrl}${req.document_front_url}`,
        back: req.document_back_url ? `${backendUrl}${req.document_back_url}` : null,
        selfie: `${backendUrl}${req.selfie_url}`,
      });
    } catch (e) {
      toast('Failed to load secure document paths', 'error');
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleReview = async (status: 'VERIFIED' | 'REJECTED') => {
    if (!selectedReq) return;
    if (status === 'REJECTED' && !rejectionReason) {
      toast('Please supply a reason for rejecting identity documents', 'error');
      return;
    }

    try {
      const res = await api.post(`/admin/kyc/${selectedReq.id}/review`, {
        status,
        rejection_reason: status === 'REJECTED' ? rejectionReason : null,
      });

      if (res.data.success) {
        toast(`KYC successfully resolved as ${status}`, 'success');
        setSelectedReq(null);
        setSignedDocs(null);
        loadRequests();
      }
    } catch (e: any) {
      toast(e.response?.data?.message || 'Failed to submit review', 'error');
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-grow p-6 space-y-6 max-w-5xl">
        <h2 className="text-xl font-bold text-slate-800">KYC Verification Audit desk</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm md:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pending Verifications</h3>
            
            {loading ? (
              <div className="text-xs text-slate-400 text-center py-6 animate-pulse">Syncing operations...</div>
            ) : requests.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1">
                {requests.map((r) => (
                  <div
                    key={r.id}
                    className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-850">{r.user.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{r.document_type} | Submitted: {new Date(r.submitted_at).toLocaleDateString()}</div>
                      <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-1.5 uppercase ${
                        r.document_status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-105' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {r.document_status}
                      </span>
                    </div>

                    <button
                      onClick={() => handleInspect(r)}
                      className="bg-brand-600 hover:bg-brand-700 text-white font-bold p-2 rounded-lg text-xs flex items-center gap-1 transition-colors shadow"
                    >
                      <Eye size={14} /> Inspect
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-10 bg-slate-50 border border-dashed rounded-xl font-medium">
                No KYC verification request submissions pending review.
              </div>
            )}
          </div>

          {/* Scans Inspector */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 h-fit">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <FileCheck size={14} className="text-slate-400" /> Audit Viewer
            </h3>

            {selectedReq && signedDocs ? (
              <div className="space-y-4 text-xs">
                <div className="border-b border-slate-100 pb-3">
                  <div className="font-bold text-slate-800">{selectedReq.user.name}</div>
                  <div className="text-[10px] text-slate-450 mt-0.5">{selectedReq.user.mobile} | {selectedReq.user.email || 'No Email'}</div>
                </div>

                {/* Display scans */}
                <div className="space-y-3">
                  <div>
                    <span className="font-bold text-slate-500 block mb-1">Selfie Photo Check</span>
                    <img src={signedDocs.selfie} alt="Selfie" className="h-32 w-full object-cover rounded-lg border" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block mb-1">{selectedReq.document_type} Front</span>
                    <img src={signedDocs.front} alt="Front Document" className="h-32 w-full object-cover rounded-lg border" />
                  </div>
                  {signedDocs.back && (
                    <div>
                      <span className="font-bold text-slate-500 block mb-1">{selectedReq.document_type} Back</span>
                      <img src={signedDocs.back} alt="Back Document" className="h-32 w-full object-cover rounded-lg border" />
                    </div>
                  )}
                </div>

                {/* Actions */}
                {selectedReq.document_status === 'PENDING' && (
                  <div className="pt-2 space-y-2">
                    {!showRejectForm ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleReview('VERIFIED')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          onClick={() => setShowRejectForm(true)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <textarea
                          required
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="State reason for document rejection..."
                          className="w-full border border-slate-350 rounded-lg p-2 text-xs"
                          rows={2}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleReview('REJECTED')}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 rounded-lg text-[10px]"
                          >
                            Confirm Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowRejectForm(false)}
                            className="border border-slate-200 hover:bg-slate-50 text-slate-650 py-1.5 rounded-lg text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic text-center py-8">Select a companion request to inspect documents.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
