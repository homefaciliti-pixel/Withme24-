import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Common/Toast';
import { Calendar, Clock, Plus, AlertCircle } from 'lucide-react';
import api from '../../services/api';

interface Slot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export const CompanionAvailability: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  // New slot details
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [adding, setAdding] = useState(false);

  const loadSlots = () => {
    setLoading(true);
    // Find companion profile id first
    api
      .get('/companions')
      .then((res) => {
        if (res.data.success) {
          const profile = res.data.data.find((c: any) => c.user.id === user?.id);
          if (profile) {
            return api.get(`/companions/${profile.id}/availability`);
          }
        }
        throw new Error('PROFILE_NOT_FOUND');
      })
      .then((res) => {
        if (res.data.success) setSlots(res.data.data);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) loadSlots();
  }, [user]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) return;

    setAdding(true);
    try {
      const res = await api.post('/companions/availability', {
        date,
        start_time: startTime,
        end_time: endTime,
      });

      if (res.data.success) {
        toast('Availability slot added successfully!', 'success');
        setDate('');
        loadSlots();
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to add availability slot', 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar type="companion" />

      <main className="flex-grow p-6 space-y-6 max-w-4xl">
        <h2 className="text-xl font-bold text-slate-800">Manage Availability Calendar</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Slot Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 h-fit">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Open Availability Slot</h3>
            
            <form onSubmit={handleAddSlot} className="space-y-4">
              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Outing Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-slate-350 bg-slate-50 rounded-lg p-2 text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>

              {/* Start Time */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Start Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border border-slate-350 bg-slate-50 rounded-lg p-2 text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>

              {/* End Time */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">End Time</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border border-slate-350 bg-slate-50 rounded-lg p-2 text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 shadow transition-colors"
              >
                <Plus size={14} /> {adding ? 'Adding...' : 'Add Slot to Calendar'}
              </button>
            </form>
          </div>

          {/* Slots List */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm md:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Configured Slots</h3>

            {loading ? (
              <div className="text-xs text-slate-400 text-center py-8 animate-pulse">Syncing calendar...</div>
            ) : slots.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5 max-h-[400px] overflow-y-auto pr-1">
                {slots.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-brand-500" /> {s.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-brand-500" /> {s.start_time} - {s.end_time}
                      </div>
                    </div>

                    <span className={`text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full ${
                      s.is_booked ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' : 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                    }`}>
                      {s.is_booked ? 'Booked Out' : 'Open / Available'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 p-4 bg-amber-50 text-amber-700 border border-amber-250 rounded-xl text-xs">
                <AlertCircle size={18} />
                No availability slots configured on your calendar. Add a slot to appear in customer searches!
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
