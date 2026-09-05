import React, { useEffect, useState } from 'react';
import { UserNavTabs } from '../../components/Layout/UserNavTabs';
import { Calendar, DollarSign, Clock } from 'lucide-react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

interface Booking {
  id: number;
  booking_number: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_amount: string;
  companion: {
    user: {
      name: string;
    };
  };
  activity: {
    name: string;
  };
}

export const CustomerBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/bookings')
      .then((res) => {
        if (res.data.success) setBookings(res.data.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'ALL') return true;
    return b.status === filterStatus;
  });

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <UserNavTabs />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">My Social Outings</h2>
            <p className="text-xs text-slate-500">Track current session status, payments, and histories.</p>
          </div>

          {/* Status filters */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-350 bg-white text-xs font-bold p-2.5 rounded-lg focus:ring-1 focus:ring-brand-500 outline-none"
          >
            <option value="ALL">All Bookings</option>
            <option value="PENDING">Pending Approval</option>
            <option value="PAYMENT_PENDING">Awaiting Payment</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center text-xs text-slate-400 py-12">Loading outings ledger...</div>
        ) : filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">#{b.booking_number}</span>
                    <span
                      className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : b.status === 'COMPLETED'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : b.status === 'CANCELLED'
                          ? 'bg-slate-50 text-slate-700 border border-slate-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}
                    >
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="text-sm font-bold text-slate-800">
                    {b.activity.name} with {b.companion.user.name}
                  </div>

                  <div className="flex flex-wrap gap-4 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={13} /> {b.booking_date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={13} /> {b.start_time} - {b.end_time}
                    </div>
                    <div className="flex items-center gap-1 font-bold text-brand-600">
                      <DollarSign size={13} /> ₹{parseFloat(b.total_amount).toFixed(0)}
                    </div>
                  </div>
                </div>

                <Link
                  to={`/bookings/${b.id}`}
                  className="bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 text-xs font-bold px-4 py-2 rounded-lg transition-all"
                >
                  Manage Outing
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-16 text-center text-xs text-slate-450 italic">
            No social companion bookings found matching this status filter.
          </div>
        )}
      </div>
    </div>
  );
};
