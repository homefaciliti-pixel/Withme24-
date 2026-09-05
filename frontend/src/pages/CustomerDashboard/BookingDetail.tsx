import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, CreditCard, DollarSign, ArrowLeft, Star } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../components/Common/Toast';

interface Booking {
  id: number;
  booking_number: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration: string;
  base_price: string;
  platform_fee: string;
  tax: string;
  total_amount: string;
  status: string;
  payment_status: string;
  cancellation_reason: string | null;
  companion: {
    id: number;
    user: {
      name: string;
      profile_photo: string | null;
    };
  };
  activity: {
    name: string;
  };
  payment?: {
    id: number;
    order_id: string;
    transaction_id: string | null;
    payment_status: string;
  } | null;
  review?: {
    id: number;
    rating: number;
    comment: string;
    reply: string | null;
  } | null;
}

export const BookingDetail: React.FC = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  
  // Cancellation Form
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  // Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const loadBooking = () => {
    setLoading(true);
    api
      .get(`/bookings/${id}`)
      .then((res) => {
        if (res.data.success) setBooking(res.data.data);
      })
      .catch(() => {
        toast('Failed to load booking details', 'error');
        navigate('/dashboard/bookings');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (id) loadBooking();
  }, [id]);

  const handleStartPayment = async () => {
    setPaying(true);
    try {
      const res = await api.post('/payments/create-order', { booking_id: booking?.id });
      if (res.data.success) {
        setOrderData(res.data.data);
        setShowCheckout(true);
      }
    } catch (e: any) {
      toast(e.response?.data?.message || 'Failed to initialize payment gateway order', 'error');
    } finally {
      setPaying(false);
    }
  };

  const handleSimulatePayment = async (status: 'SUCCESS' | 'FAILED') => {
    if (!orderData) return;

    try {
      if (status === 'SUCCESS') {
        const verifyPayload = {
          order_id: orderData.id,
          payment_id: `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
          signature: 'mock_signature', // mock verify checks signature in local service
        };

        const res = await api.post('/payments/verify', verifyPayload);
        if (res.data.success) {
          toast('Payment successful! Booking confirmed.', 'success');
          setShowCheckout(false);
          loadBooking();
        }
      } else {
        toast('Simulated payment failure path', 'error');
        setShowCheckout(false);
      }
    } catch (e: any) {
      toast(e.response?.data?.message || 'Verification rejected by backend rules', 'error');
    }
  };

  const handleCancelBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    try {
      const res = await api.post(`/bookings/${booking.id}/cancel`, {
        status: 'CANCELLED',
        cancellation_reason: cancelReason,
      });

      if (res.data.success) {
        toast('Booking cancelled successfully', 'info');
        setCancelOpen(false);
        loadBooking();
      }
    } catch (e: any) {
      toast(e.response?.data?.message || 'Failed to cancel booking', 'error');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    setReviewSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        booking_id: booking.id,
        rating,
        comment,
      });
      if (res.data.success) {
        toast('Review registered successfully!', 'success');
        loadBooking();
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to register review', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };
  // Yes! We can write `submitReview` in `CompanionController` and mount it:
  // `router.post('/reviews', authenticate, CompanionController.submitReview);` in `routes/index.ts`.
  // Let's do that to allow submitting reviews!
  // First, let's add `submitReview` to `CompanionController.ts`. Let's write the code for it.
  
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate('/dashboard/bookings')}
        className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors"
      >
        <ArrowLeft size={14} /> Back to Outings
      </button>

      {/* Booking Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
              Booking ID: #{booking.booking_number}
            </span>
            <h2 className="text-lg font-bold text-slate-800 mt-0.5">
              {booking.activity.name} with {booking.companion.user.name}
            </h2>
          </div>
          <span
            className={`text-[10px] uppercase font-black px-3 py-1 rounded-full ${
              booking.status === 'CONFIRMED'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : booking.status === 'COMPLETED'
                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                : booking.status === 'CANCELLED'
                ? 'bg-slate-50 text-slate-700 border border-slate-100'
                : 'bg-amber-50 text-amber-700 border border-amber-100'
            }`}
          >
            {booking.status}
          </span>
        </div>

        {/* Date / Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-brand-500" />
            <div>
              <div className="font-extrabold text-slate-400 text-[9px] uppercase">Outing Date</div>
              <div className="font-semibold">{booking.booking_date}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-brand-500" />
            <div>
              <div className="font-extrabold text-slate-400 text-[9px] uppercase">Outing Time</div>
              <div className="font-semibold">{booking.start_time} - {booking.end_time}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-brand-500" />
            <div>
              <div className="font-extrabold text-slate-400 text-[9px] uppercase">Payment Status</div>
              <div className="font-semibold uppercase">{booking.payment_status}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pricing Breakdown</h3>
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Hourly Session Duration</span>
            <span>{parseFloat(booking.duration)} hour(s)</span>
          </div>
          <div className="flex justify-between">
            <span>Base Companion Rate</span>
            <span>₹{parseFloat(booking.base_price).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (18% Platform Tax)</span>
            <span>₹{parseFloat(booking.tax).toFixed(2)}</span>
          </div>
          <hr className="border-slate-100" />
          <div className="flex justify-between text-sm font-black text-slate-800">
            <span>Total Cost</span>
            <span>₹{parseFloat(booking.total_amount).toFixed(2)}</span>
          </div>
        </div>

        {/* Dynamic Action Area */}
        <div className="pt-2">
          {booking.status === 'PAYMENT_PENDING' && (
            <button
              onClick={handleStartPayment}
              disabled={paying}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow flex items-center justify-center gap-1.5"
            >
              <CreditCard size={16} /> {paying ? 'Connecting Gateway...' : 'Pay with Gateway'}
            </button>
          )}

          {['PENDING', 'ACCEPTED', 'PAYMENT_PENDING', 'CONFIRMED'].includes(booking.status) && (
            <button
              onClick={() => setCancelOpen(true)}
              className="w-full mt-2 border border-rose-100 hover:bg-rose-50 text-rose-600 font-bold py-2 rounded-lg text-xs transition-colors"
            >
              Cancel Social Outing
            </button>
          )}
        </div>
      </div>

      {/* Review Section */}
      {booking.status === 'COMPLETED' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Outing Review & Rating</h3>
          
          {booking.review ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">Your Rating</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      size={14}
                      className={idx < booking.review!.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-lg border border-slate-150">
                "{booking.review.comment || 'No text comment provided.'}"
              </p>
              {booking.review.reply && (
                <div className="bg-brand-50 border-l-2 border-brand-500 p-3 rounded-r-lg text-xs text-slate-600 mt-2">
                  <div className="font-bold text-[10px] text-slate-700 mb-0.5">
                    {booking.companion.user.name} responded:
                  </div>
                  "{booking.review.reply}"
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRating(val)}
                      className="text-slate-350 hover:text-amber-400 transition-colors"
                    >
                      <Star
                        size={24}
                        className={val <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Comments</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience during the social outing..."
                  className="w-full border border-slate-350 rounded-lg p-2 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>
      )}

      {/* Simulated Gateway Checkout modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-slate-150 p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-base text-center flex items-center justify-center gap-1.5">
              <CreditCard size={20} className="text-brand-500" /> Sandbox Checkout
            </h3>
            <p className="text-xs text-slate-500 text-center">
              Simulating payment order: <strong>{orderData.id}</strong> for amount <strong>₹{orderData.amount}</strong>.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleSimulatePayment('SUCCESS')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs"
              >
                Simulate Success
              </button>
              <button
                onClick={() => handleSimulatePayment('FAILED')}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-lg text-xs"
              >
                Simulate Failure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-slate-150 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">Cancel Outing Request</h3>
              <button onClick={() => setCancelOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCancelBooking} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Cancellation Reason</label>
                <textarea
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Tell us why you need to cancel this social companion booking..."
                  className="w-full border border-slate-350 rounded-lg p-2 text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-lg text-xs animate-pulse"
              >
                Confirm Cancel & Request Refund
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Help helper for X close button in modal
const X: React.FC<{ size: number }> = ({ size }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
};
