import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { Briefcase, DollarSign, Calendar } from 'lucide-react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

interface WalletType {
  total_earnings: string;
  available_balance: string;
  pending_balance: string;
}

interface Booking {
  id: number;
  booking_number: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_amount: string;
  customer: {
    name: string;
  };
  activity?: {
    name: string;
  };
}

export const CompanionDashboard: React.FC = () => {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/earnings'),
      api.get('/bookings'),
    ])
      .then(([earningsRes, bookingsRes]) => {
        if (earningsRes.data.success) {
          setWallet(earningsRes.data.data.wallet);
        }
        if (bookingsRes.data.success) {
          setBookings(bookingsRes.data.data);
        }
      })
      .catch((e) => console.error('Failed to load dashboard metrics', e))
      .finally(() => setLoading(false));
  }, []);

  const pendingBookingsCount = bookings.filter((b) => b.status === 'PENDING').length;
  const activeBookings = bookings.filter((b) => ['CONFIRMED', 'IN_PROGRESS'].includes(b.status));

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar type="companion" />

      <main className="flex-grow p-6 space-y-6 max-w-5xl">
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 font-sans">Companion Dashboard</h2>
          <p className="text-xs text-slate-500 mt-1">Configure your calendar availability, pricing activities, review bookings, and request payouts.</p>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Total Earnings */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2 flex flex-col justify-between">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] uppercase font-extrabold tracking-wider">Total Earnings</span>
              <DollarSign size={18} />
            </div>
            <div className="text-2xl font-black text-slate-800">
              ₹{wallet ? parseFloat(wallet.total_earnings).toFixed(2) : '0.00'}
            </div>
          </div>

          {/* Available balance */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2 flex flex-col justify-between">
            <div className="flex justify-between items-center text-emerald-500">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Available Balance</span>
              <DollarSign size={18} />
            </div>
            <div className="text-2xl font-black text-emerald-600">
              ₹{wallet ? parseFloat(wallet.available_balance).toFixed(2) : '0.00'}
            </div>
          </div>

          {/* Pending tasks / Requests */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2 flex flex-col justify-between">
            <div className="flex justify-between items-center text-amber-500">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Requests Pending Approval</span>
              <Calendar size={18} />
            </div>
            <div className="text-2xl font-black text-amber-600">
              {pendingBookingsCount}
            </div>
          </div>
        </div>

        {/* Main section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Action Lists */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-sm text-slate-700 flex items-center gap-1.5">
              <Briefcase size={16} /> Active Outings schedule
            </h3>
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400">Loading outings...</div>
            ) : activeBookings.length > 0 ? (
              <div className="space-y-3">
                {activeBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">{b.activity?.name || 'Social Outing'} with {b.customer.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{b.booking_date} | {b.start_time} - {b.end_time}</div>
                    </div>
                    <span className="text-[9px] uppercase font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400 italic">
                No active companion outings scheduled. Ensure availability slots are open!
              </div>
            )}
          </div>

          {/* Quick links summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 h-fit">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Quick Controls</h4>
            <div className="grid grid-cols-1 gap-2">
              <Link to="/companion-dashboard/availability" className="block text-center border border-slate-200 hover:bg-slate-50 text-xs font-bold py-2 rounded-lg transition-colors">
                Configure Open Slots
              </Link>
              <Link to="/companion-dashboard/profile" className="block text-center border border-slate-200 hover:bg-slate-50 text-xs font-bold py-2 rounded-lg transition-colors">
                Set Hourly Pricing
              </Link>
              <Link to="/companion-dashboard/bookings" className="block text-center bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2 rounded-lg transition-colors shadow">
                Approve Requests ({pendingBookingsCount})
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
