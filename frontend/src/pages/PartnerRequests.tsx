import React, { useEffect, useState } from 'react';
import { v1Api } from '../services/api';
import { useToast } from '../components/Common/Toast';
import { Send, Inbox, Check, X, Clock, UserCheck } from 'lucide-react';

export const PartnerRequests: React.FC = () => {
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await v1Api.getPartnerRequests(tab);
      if (res.data.success) {
        setRequests(res.data.requests || []);
      }
    } catch (e: any) {
      toast('Failed to load partner requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [tab]);

  const handleAction = async (requestId: string, action: 'ACCEPT' | 'REJECT' | 'CANCEL') => {
    try {
      const res = await v1Api.actionPartnerRequest(requestId, action);
      if (res.data.success) {
        toast(`Request ${action.toLowerCase()}ed successfully`, 'success');
        loadRequests();
      }
    } catch (e: any) {
      toast(`Failed to ${action.toLowerCase()} request`, 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-purple-100 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <UserCheck size={28} className="text-purple-600" /> Partner Request Center
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage incoming activity requests and track sent companion invitations.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setTab('received')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              tab === 'received' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox size={14} /> Received Requests
          </button>
          <button
            onClick={() => setTab('sent')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              tab === 'sent' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send size={14} /> Sent Requests
          </button>
        </div>
      </div>

      {/* List Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 h-24 animate-pulse"></div>
          ))}
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.request_id}
              className="bg-white border border-purple-100 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <img
                  src={req.sender?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
                  alt={req.sender?.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-200 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-base">{req.sender?.name || 'Partner Host'}</h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium italic">"{req.message}"</p>
                  <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Clock size={11} /> Sent {new Date(req.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                {tab === 'received' && req.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleAction(req.request_id, 'ACCEPT')}
                      className="flex-1 sm:flex-initial bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                    >
                      <Check size={14} /> Accept
                    </button>
                    <button
                      onClick={() => handleAction(req.request_id, 'REJECT')}
                      className="flex-1 sm:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 border border-slate-300 active:scale-95 transition-all"
                    >
                      <X size={14} /> Reject
                    </button>
                  </>
                )}

                {tab === 'sent' && req.status === 'PENDING' && (
                  <button
                    onClick={() => handleAction(req.request_id, 'CANCEL')}
                    className="w-full sm:w-auto bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 border border-rose-200 active:scale-95 transition-all"
                  >
                    <X size={14} /> Cancel Request
                  </button>
                )}

                {req.status !== 'PENDING' && (
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                    {req.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-purple-100 rounded-3xl space-y-3">
          <Inbox size={32} className="text-purple-400 mx-auto" />
          <p className="text-base font-black text-slate-900">No partner requests found</p>
          <p className="text-xs text-slate-500">
            {tab === 'received' ? 'You have no incoming partner requests.' : 'You have not sent any partner invitations yet.'}
          </p>
        </div>
      )}
    </div>
  );
};
