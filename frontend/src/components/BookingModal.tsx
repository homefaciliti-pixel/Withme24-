import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, DollarSign, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from './Common/Toast';
import { useNavigate } from 'react-router-dom';

interface CompanionActivity {
  id: number;
  activity_id: number;
  price_per_hour: string;
  activity: {
    id: number;
    name: string;
    description: string;
  };
}

interface AvailabilitySlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  companionId: number;
  companionName: string;
  activities: CompanionActivity[];
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  companionId,
  companionName,
  activities,
}) => {
  const [selectedActivityId, setSelectedActivityId] = useState<number | ''>('');
  const [selectedSlotId, setSelectedSlotId] = useState<number | ''>('');
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load Companion Availability
  useEffect(() => {
    if (isOpen && companionId) {
      setLoadingSlots(true);
      api
        .get(`/companions/${companionId}/availability`)
        .then((res) => {
          if (res.data.success) setSlots(res.data.data);
        })
        .catch((e) => console.error('Failed to load slots', e))
        .finally(() => setLoadingSlots(false));
    }
  }, [isOpen, companionId]);

  // Calculate pricing breakdown
  const selectedActivity = activities.find(
    (a) => a.activity_id === selectedActivityId
  );
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  let durationHours = 0;
  let basePrice = 0;
  let tax = 0;
  let total = 0;

  if (selectedActivity && selectedSlot) {
    const [startHour, startMin] = selectedSlot.start_time.split(':').map(Number);
    const [endHour, endMin] = selectedSlot.end_time.split(':').map(Number);
    durationHours = (endHour * 60 + endMin - (startHour * 60 + startMin)) / 60;
    if (durationHours <= 0) durationHours = 1;

    const hourlyRate = parseFloat(selectedActivity.price_per_hour);
    basePrice = hourlyRate * durationHours;
    const platformFee = basePrice * 0.25;
    tax = platformFee * 0.18;
    total = basePrice + tax;
  }

  const handleBookSession = async () => {
    if (!selectedActivityId || !selectedSlotId) {
      toast('Please choose both an activity and availability slot', 'error');
      return;
    }

    setBookingLoading(true);
    try {
      const bookingPayload = {
        companion_id: companionId,
        activity_id: selectedActivityId,
        availability_id: selectedSlotId,
      };

      const res = await api.post('/bookings', bookingPayload);

      if (res.data.success) {
        toast('Booking request created successfully!', 'success');
        onClose();
        // Redirect to booking checkout/detail page
        navigate(`/bookings/${res.data.data.id}`);
      }
    } catch (e: any) {
      if (e.response?.status === 401) {
        toast('Please login to book a companion session', 'info');
        onClose();
        navigate('/login');
        return;
      }
      const msg = e.response?.data?.message || 'Failed to submit booking request';
      toast(msg, 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-brand-600 p-4 text-white flex items-center justify-between">
          <h3 className="text-lg font-bold">Book a Session with {companionName}</h3>
          <button onClick={onClose} className="hover:bg-brand-700 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Select Activity */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Select Activity</label>
            <select
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(Number(e.target.value))}
              className="w-full border border-slate-350 rounded-lg p-2.5 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            >
              <option value="">-- Choose an activity --</option>
              {activities.map((a) => (
                <option key={a.id} value={a.activity_id}>
                  {a.activity.name} (₹{a.price_per_hour}/hr)
                </option>
              ))}
            </select>
            {selectedActivity && (
              <p className="text-xs text-slate-500 italic mt-1">
                {selectedActivity.activity.description}
              </p>
            )}
          </div>

          {/* Select Slot */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Choose Availability Slot</label>
            {loadingSlots ? (
              <div className="text-xs text-slate-400">Loading companion calendar...</div>
            ) : slots.length > 0 ? (
              <select
                value={selectedSlotId}
                onChange={(e) => setSelectedSlotId(Number(e.target.value))}
                className="w-full border border-slate-350 rounded-lg p-2.5 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              >
                <option value="">-- Select date & time block --</option>
                {slots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.date} | {s.start_time} - {s.end_time}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-1.5 p-3 rounded-lg bg-amber-50 text-amber-700 text-xs border border-amber-200">
                <AlertCircle size={16} />
                No available slots configured for this companion. Check back later!
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          {selectedActivity && selectedSlot && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Pricing Summary</h4>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Duration</span>
                <span>{durationHours} hour(s)</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Base Price</span>
                <span>₹{basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax (18% Platform Tax)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <hr className="border-slate-200 my-1" />
              <div className="flex justify-between text-base font-bold text-slate-800">
                <span>Total Cost</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={handleBookSession}
            disabled={bookingLoading || !selectedActivityId || !selectedSlotId}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-lg transition-colors text-sm shadow-md active:scale-[0.98]"
          >
            {bookingLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mx-auto"></div>
            ) : (
              'Confirm Booking Request'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
