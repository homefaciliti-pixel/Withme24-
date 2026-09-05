import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { useToast } from '../../components/Common/Toast';
import { CreditCard, Check, X } from 'lucide-react';
import api from '../../services/api';

interface PayoutRequest {
  id: number;
  amount: string;
  status: string;
  requested_at: string;
  bank_reference: string | null;
  wallet: {
    companion: {
      user: {
        name: string;
      };
    };
  };
}

export const AdminPayoutsManager: React.FC = () => {
  const { toast } = useToast();

  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Settlement details
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [bankRef, setBankRef] = useState('');
  const [settling, setSettling] = useState(false);

  const loadPayouts = () => {
    setLoading(true);
    api
      .get('/admin/payouts')
      .then((res) => {
        if (res.data.success) setPayouts(res.data.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayouts();
  }, []);

  const handlePayoutStatus = async (status: 'SUCCESS' | 'REJECTED') => {
    if (!selectedPayout) return;
    if (status === 'SUCCESS' && !bankRef) {
      toast('Please supply a bank reference transfer number', 'error');
      return;
    }

    setSettling(true);
    try {
      const res = await api.post(`/admin/payouts/${selectedPayout.id}/approve`, {
        status,
        bank_reference: status === 'SUCCESS' ? bankRef : null,
      });

      if (res.data.success) {
        toast(`Payout request marked as ${status}`, 'success');
        setSelectedPayout(null);
        setBankRef('');
        loadPayouts();
      }
    } catch (e: any) {
      toast(e.response?.data?.message || 'Failed to update payout request', 'error');
    } finally {
      setSettling(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-grow p-6 space-y-6 max-w-5xl">
        <h2 className="text-xl font-bold text-slate-800">Companion Payout Settlements</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payout list */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm md:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Withdrawal Requests</h3>

            {loading ? (
              <div className="text-xs text-slate-400 text-center py-6 animate-pulse">Syncing payouts...</div>
            ) : payouts.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1">
                {payouts.map((po) => (
                  <div
                    key={po.id}
                    className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-850">
                        ₹{parseFloat(po.amount).toFixed(2)} requested by {po.wallet.companion.user.name}
                      </div>
                      <div className="text-[10px] text-slate-550 mt-0.5">
                        Requested: {new Date(po.requested_at).toLocaleDateString()}
                      </div>
                      <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-1.5 uppercase ${
                        po.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : po.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {po.status}
                      </span>
                    </div>

                    {po.status === 'PENDING' && (
                      <button
                        onClick={() => setSelectedPayout(po)}
                        className="bg-brand-600 hover:bg-brand-700 text-white font-bold p-2 rounded-lg text-xs flex items-center gap-1 transition-colors shadow"
                      >
                        <CreditCard size={14} /> Settle
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-10 bg-slate-50 border border-dashed rounded-xl font-medium">
                No withdrawal requests submitted.
              </div>
            )}
          </div>

          {/* Settle Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 h-fit">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <CreditCard size={14} className="text-slate-400" /> Settle Transaction
            </h3>

            {selectedPayout ? (
              <div className="space-y-4 text-xs">
                <div className="border-b border-slate-100 pb-3">
                  <div className="font-bold text-slate-800">Payout ID: #{selectedPayout.id}</div>
                  <div className="text-[10px] text-slate-450 mt-0.5">
                    Amount: <strong>₹{parseFloat(selectedPayout.amount).toFixed(2)}</strong> to{' '}
                    <strong>{selectedPayout.wallet.companion.user.name}</strong>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Bank Transaction ID (UTR)</label>
                    <input
                      type="text"
                      required
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                      placeholder="e.g. UTR1234567890"
                      className="w-full border border-slate-350 bg-slate-50 rounded-lg p-2.5 text-xs outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => handlePayoutStatus('SUCCESS')}
                      disabled={settling}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handlePayoutStatus('REJECTED')}
                      disabled={settling}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic text-center py-8">Select a payout request to configure settlements.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
