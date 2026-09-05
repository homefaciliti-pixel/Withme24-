import React, { useEffect, useState } from 'react';
import { UserNavTabs } from '../../components/Layout/UserNavTabs';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Bell } from 'lucide-react';
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
}

interface SystemNotification {
  id: number;
  title: string;
  message: string;
  status: string;
  created_at: string;
}

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/bookings'),
      api.get('/notifications'),
    ])
      .then(([bookingsRes, notifsRes]) => {
        if (bookingsRes.data.success) {
          // Get next 3 upcoming/active bookings
          setBookings(bookingsRes.data.data.slice(0, 3));
        }
        if (notifsRes.data.success) {
          setNotifications(notifsRes.data.data.slice(0, 5));
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <UserNavTabs />

        {/* Welcome */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">Welcome Back, {user?.name || 'Valued Member'}!</h2>
          <p className="text-xs text-slate-500 mt-1">Manage your companionship bookings, safety parameters, and review verified companions.</p>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Upcoming bookings list */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-sm text-slate-700 flex items-center gap-1.5">
              <Calendar size={18} className="text-brand-600" /> Upcoming Outings
            </h3>
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400">Loading schedules...</div>
            ) : bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <Link
                    key={b.id}
                    to={`/bookings/${b.id}`}
                    className="block bg-white border border-slate-250 hover:border-brand-350 p-4 rounded-xl shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs font-bold text-slate-800">Outing with {b.companion.user.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{b.booking_date} | {b.start_time} - {b.end_time}</div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          b.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {b.status}
                        </span>
                        <div className="text-xs font-bold text-slate-800 mt-1">₹{parseFloat(b.total_amount).toFixed(0)}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2">
                <p className="text-xs text-slate-500">You have no upcoming social outings.</p>
                <Link to="/companions" className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2 rounded-lg">
                  Find Companions
                </Link>
              </div>
            )}
          </div>

          {/* Notifications feed */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-700 flex items-center gap-1.5">
              <Bell size={18} className="text-brand-600" /> Notifications
            </h3>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm max-h-80 overflow-y-auto space-y-3">
              {loading ? (
                <div className="text-xs text-slate-400 text-center py-4">Syncing feed...</div>
              ) : notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n.id} className="border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0">
                    <div className="text-[11px] font-bold text-slate-800">{n.title}</div>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">{n.message}</p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-450 italic text-center py-4">No new notifications.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
