import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { useToast } from '../../components/Common/Toast';
import { Calendar, Clock, Check, X, Award, AlertCircle } from 'lucide-react';
import api from '../../services/api';

interface Booking {
  id: number;
  booking_number: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration: string;
  total_amount: string;
  status: string;
  payment_status: string;
  customer: {
    name: string;
    profile_photo: string | null;
  };
  activity: {
    name: string;
  };
}

export const CompanionBookings: React.FC = () => {
  const { toast } = useToast();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ACTIVE' | 'HISTORY'>('PENDING');
  const [loading, setLoading] = useState(true);

  const loadBookings = () => {
    setLoading(true);
    api
      .get('/bookings')
      .then((res) => {
        if (res.data.success) setBookings(res.data.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleAccept = async (id: number) => {
    try {
      const res = await api.post(`/bookings/${id}/accept`);
      if (res.data.success) {
        toast('Booking request accepted! Customer notified for payment.', 'success');
        loadBookings();
      }
    } catch (e: any) {
      toast(e.response?.data?.message || 'Failed to accept booking', 'error');
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await api.post(`/bookings/${id}/reject`);
      if (res.data.success) {
        toast('Booking request rejected. Availability released.', 'info');
        loadBookings();
      }
    } catch (e: any) {
      toast(e.response?.data?.message || 'Failed to reject booking', 'error');
    }
  };

  const handleComplete = async (id: number) => {
    try {
      const res = await api.post(`/bookings/${id}/complete`);
      if (res.data.success) {
        toast('Outing completed! Your wallet balance has been credited.', 'success');
        loadBookings();
      }
    } catch (e: any) {
      toast(e.response?.data?.message || 'Failed to complete booking', 'error');
    }
  };

  const getFilteredBookings = () => {
    if (activeTab === 'PENDING') {
      return bookings.filter((b) => b.status === 'PENDING');
    }
    if (activeTab === 'ACTIVE') {
      return bookings.filter((b) =>
        ['ACCEPTED', 'PAYMENT_PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)
      );
    }
    return bookings.filter((b) => ['COMPLETED', 'CANCELLED', 'EXPIRED', 'DISPUTED'].includes(b.status));
  };

  const visibleBookings = getFilteredBookings();

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar type="companion" />

      <main className="flex-grow p-6 space-y-6 max-w-5xl">
        <h2 className="text-xl font-bold text-slate-800">Booking Management Desk</h2>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          {(['PENDING', 'ACTIVE', 'HISTORY'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border-b-2 text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'PENDING'
                ? 'Pending Requests'
                : tab === 'ACTIVE'
                ? 'Active Schedule'
                : 'Booking History'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-xs text-slate-400 py-12">Loading booking desk...</div>
        ) : visibleBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {visibleBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">#{b.booking_number}</span>
                    <span
                      className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : b.status === 'COMPLETED'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : b.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-slate-50 text-slate-700 border border-slate-100'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-slate-800">
                    {b.activity.name} with customer {b.customer.name}
                  </div>

                  <div className="flex flex-wrap gap-4 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={13} /> {b.booking_date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={13} /> {b.start_time} - {b.end_time} ({parseFloat(b.duration)} hrs)
                    </div>
                    <div className="flex items-center gap-1 text-brand-600 font-bold">
                      Payout Estimate: ₹{(parseFloat(b.total_amount) * 0.75).toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* Inline Action Triggers */}
                <div className="flex gap-2">
                  {b.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleAccept(b.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-2 rounded-lg text-xs flex items-center gap-1 transition-colors"
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button
                        onClick={() => handleReject(b.id)}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold p-2 rounded-lg text-xs flex items-center gap-1 transition-colors"
                      >
                        <X size={14} /> Reject
                      </button>
                    </>
                  )}

                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleComplete(b.id)}
                      className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1 transition-colors shadow"
                    >
                      <Award size={14} /> Mark Completed
                    </button>
                  )}

                  {b.status === 'PAYMENT_PENDING' && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-1.5 rounded-lg border border-amber-200">
                      <AlertCircle size={14} /> Awaiting Cust Payment
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-16 text-center text-xs text-slate-450 italic">
            No entries found in this queue.
          </div>
        )}
      </main>
    </div>
  );
};
