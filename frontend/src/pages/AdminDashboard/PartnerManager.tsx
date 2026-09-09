import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/Common/Toast';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, FileText, Eye, Ban, Search, Filter } from 'lucide-react';

interface Partner {
  id: number;
  name: string | null;
  email: string | null;
  mobile: string;
  gender: string | null;
  date_of_birth: string | null;
  role: string;
  profile_photo: string | null;
  account_status: string;
  partner_status: string | null;
  kyc_status: string | null;
  rejection_reason: string | null;
  created_at: string;
  companion_profile?: any;
  kyc_verifications?: any[];
}

export const PartnerManager: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  // Modal states for rejection / resubmission
  const [rejectionModalType, setRejectionModalType] = useState<'REJECT' | 'RESUBMIT' | null>(null);
  const [reasonInput, setReasonInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { toast } = useToast();

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const query = activeFilter !== 'ALL' ? `?status=${activeFilter}` : '';
      const res = await api.get(`/admin/partners${query}`);
      if (res.data.success) {
        setPartners(res.data.data);
      }
    } catch (err: any) {
      toast('Failed to fetch partners', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [activeFilter]);

  const handleApprove = async (partnerId: number) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/admin/partners/${partnerId}/approve`);
      if (res.data.success) {
        toast(res.data.message, 'success');
        setSelectedPartner(null);
        fetchPartners();
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Approval failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReasonAction = async () => {
    if (!selectedPartner || !rejectionModalType || !reasonInput.trim()) {
      toast('Please enter a reason or instructions', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const endpoint =
        rejectionModalType === 'REJECT'
          ? `/admin/partners/${selectedPartner.id}/reject`
          : `/admin/partners/${selectedPartner.id}/request-resubmission`;

      const res = await api.post(endpoint, { rejection_reason: reasonInput.trim() });
      if (res.data.success) {
        toast(res.data.message, 'success');
        setRejectionModalType(null);
        setReasonInput('');
        setSelectedPartner(null);
        fetchPartners();
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (partnerId: number, status: string) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/admin/partners/${partnerId}/status`, { account_status: status });
      if (res.data.success) {
        toast(res.data.message, 'success');
        fetchPartners();
      }
    } catch (err: any) {
      toast('Failed to update status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPartners = partners.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(term)) ||
      p.mobile.includes(term) ||
      (p.email && p.email.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Partner Verification Desk</h1>
          <p className="text-xs text-slate-500">Inspect companion registrations, review KYC identity documents, and manage approval status.</p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          {['ALL', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED', 'RESUBMISSION_REQUIRED'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === f ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by partner name, mobile or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-purple-500 shadow-sm"
        />
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading partner applications...</div>
        ) : filteredPartners.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No partner records found matching your filters.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Partner Details</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Partner Status</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredPartners.map((partner) => (
                <tr key={partner.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {partner.profile_photo ? (
                        <img src={partner.profile_photo} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-700 font-bold flex items-center justify-center">
                          {partner.name ? partner.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900">{partner.name || 'Unnamed Partner'}</p>
                        <p className="text-[11px] text-slate-400">{partner.email || 'No email provided'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-800">{partner.mobile}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        partner.partner_status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : partner.partner_status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : partner.partner_status === 'RESUBMISSION_REQUIRED'
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {partner.partner_status || 'PENDING_VERIFICATION'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        partner.account_status === 'ACTIVE'
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {partner.account_status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{new Date(partner.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedPartner(partner)}
                      className="inline-flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors"
                    >
                      <Eye size={14} /> Inspect KYC
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* INSPECT PARTNER MODAL */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedPartner.name || selectedPartner.mobile}</h3>
                  <p className="text-xs text-slate-500">Partner Application Details & Documents</p>
                </div>
              </div>
              <button onClick={() => setSelectedPartner(null)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 font-bold">Mobile</p>
                <p className="font-mono text-slate-800 font-bold">{selectedPartner.mobile}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold">Email</p>
                <p className="text-slate-800 font-medium">{selectedPartner.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold">Gender & DOB</p>
                <p className="text-slate-800 font-medium">
                  {selectedPartner.gender || 'N/A'} • {selectedPartner.date_of_birth || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-bold">Current Partner Status</p>
                <p className="font-bold text-purple-700">{selectedPartner.partner_status || 'PENDING'}</p>
              </div>
            </div>

            {selectedPartner.companion_profile?.bio && (
              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Companion Bio:</p>
                <p>{selectedPartner.companion_profile.bio}</p>
              </div>
            )}

            {/* KYC DOCUMENTS */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">KYC Verification Documents</h4>
              {selectedPartner.kyc_verifications && selectedPartner.kyc_verifications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPartner.kyc_verifications.map((kyc: any) => (
                    <div key={kyc.id} className="border border-slate-200 rounded-xl p-3 space-y-2 bg-slate-50">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText size={14} className="text-purple-600" /> {kyc.document_type}
                      </p>
                      {kyc.document_front_url && (
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold">Front Side:</p>
                          <a
                            href={kyc.document_front_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-purple-600 underline hover:text-purple-800 truncate block"
                          >
                            View Front Document
                          </a>
                        </div>
                      )}
                      {kyc.document_back_url && (
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold">Back Side:</p>
                          <a
                            href={kyc.document_back_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-purple-600 underline hover:text-purple-800 truncate block"
                          >
                            View Back Document
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No KYC document records uploaded.</p>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
              <button
                disabled={actionLoading}
                onClick={() => handleApprove(selectedPartner.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <CheckCircle2 size={16} /> Approve Partner
              </button>
              <button
                disabled={actionLoading}
                onClick={() => setRejectionModalType('RESUBMIT')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <AlertCircle size={16} /> Request Resubmission
              </button>
              <button
                disabled={actionLoading}
                onClick={() => setRejectionModalType('REJECT')}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <XCircle size={16} /> Reject Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION / RESUBMISSION INPUT MODAL */}
      {rejectionModalType && selectedPartner && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {rejectionModalType === 'REJECT' ? 'Reject Partner Application' : 'Request KYC Document Resubmission'}
            </h3>
            <p className="text-xs text-slate-500">
              Provide instructions or reason for partner ({selectedPartner.name || selectedPartner.mobile}).
            </p>

            <textarea
              rows={3}
              placeholder={
                rejectionModalType === 'REJECT'
                  ? 'Reason for declining application...'
                  : 'Specify which document needs re-upload (e.g. Front Aadhaar photo is blurry)...'
              }
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-purple-500"
            ></textarea>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectionModalType(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleReasonAction}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm"
              >
                Submit Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
