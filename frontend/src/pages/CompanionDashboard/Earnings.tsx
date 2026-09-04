import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { useToast } from '../../components/Common/Toast';
import { CreditCard, DollarSign, Send, ArrowUpRight, History } from 'lucide-react';
import api from '../../services/api';

interface WalletType {
  total_earnings: string;
  available_balance: string;
  pending_balance: string;
}

interface EarningRow {
  id: number;
  amount: string;
  status: string;
  type: string;
  description: string;
  created_at: string;
}

interface PayoutRow {
  id: number;
  amount: string;
  bank_reference: string | null;
  status: string;
  requested_at: string;
}

export const CompanionEarnings: React.FC = () => {
  const { toast } = useToast();

  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [earnings, setEarnings] = useState<EarningRow[]>([]);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Payout request
  const [payoutAmount, setPayoutAmount] = useState('');
  const [requesting, setRequesting] = useState(false);

  const loadEarningsData = () => {
    setLoading(true);
    api
      .get('/earnings')
      .then((res) => {
        if (res.data.success) {
          setWallet(res.data.data.wallet);
          setEarnings(res.data.data.earnings);
          setPayouts(res.data.data.payouts);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEarningsData();
  }, []);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) return;

    setRequesting(true);
    try {
      const res = await api.post('/payouts', { amount: parseFloat(payoutAmount) });
      if (res.data.success) {
        toast('Payout request submitted successfully!', 'success');
        setPayoutAmount('');
        loadEarningsData();
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Payout request rejected', 'error');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar type="companion" />

      <main className="flex-grow p-6 space-y-6 max-w-5xl">
        <h2 className="text-xl font-bold text-slate-800">Earnings & Payout Statement</h2>

        {/* Balance metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
            <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Total Earnings</div>
            <div className="text-2xl font-black text-slate-850">₹{wallet ? parseFloat(wallet.total_earnings).toFixed(2) : '0.00'}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
            <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Available Balance</div>
            <div className="text-2xl font-black text-emerald-600">₹{wallet ? parseFloat(wallet.available_balance).toFixed(2) : '0.00'}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
            <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Pending Settlements</div>
            <div className="text-2xl font-black text-amber-500">₹{wallet ? parseFloat(wallet.pending_balance).toFixed(2) : '0.00'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Earnings statement ledger */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-sm text-slate-700 flex items-center gap-1.5">
              <History size={16} /> Credit History Statement
            </h3>

            {loading ? (
              <div className="text-center text-xs text-slate-400 py-8">Syncing statement logs...</div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm max-h-[350px] overflow-y-auto space-y-2.5">
                {earnings.length > 0 ? (
                  earnings.map((e) => (
                    <div
                      key={e.id}
                      className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-150 rounded-lg text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-850">{e.description}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">{new Date(e.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="font-black text-emerald-600">
                        +₹{parseFloat(e.amount).toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 italic text-center py-6">No credit history entries.</div>
                )}
              </div>
            )}
          </div>

          {/* Request payout form */}
          <div className="space-y-6">
            {/* Form */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-750 uppercase tracking-wide flex items-center gap-1">
                <Send size={14} className="text-slate-400" /> Withdraw Funds
              </h4>

              <form onSubmit={handleRequestPayout} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Payout Amount</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="1"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="Enter withdrawal amount (₹)"
                    className="w-full border border-slate-350 bg-slate-50 rounded-lg p-2.5 text-xs outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={requesting || !payoutAmount}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 shadow transition-colors"
                >
                  <ArrowUpRight size={14} /> {requesting ? 'Processing Request...' : 'Withdraw to Bank'}
                </button>
              </form>
            </div>

            {/* Payout records list */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Withdrawal Requests</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {payouts.length > 0 ? (
                  payouts.map((po) => (
                    <div
                      key={po.id}
                      className="flex justify-between items-center p-2 bg-slate-50 border border-slate-150 rounded-lg text-[11px]"
                    >
                      <div>
                        <div className="font-bold text-slate-700">₹{parseFloat(po.amount).toFixed(2)}</div>
                        <div className="text-[9px] text-slate-400">{new Date(po.requested_at).toLocaleDateString()}</div>
                      </div>
                      <span className={`text-[8px] uppercase font-black px-2 py-0.5 rounded-full ${
                        po.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : po.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {po.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 text-center py-2 italic">No payouts requested yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
