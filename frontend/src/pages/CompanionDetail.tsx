import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Calendar, ShieldAlert, Award, Ban, X } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Common/Toast';
import { BookingModal } from '../components/BookingModal';

interface CompanionDetailType {
  id: number;
  user_id: number;
  bio: string;
  experience: string;
  rating: string;
  total_reviews: number;
  total_bookings: number;
  user: {
    id: number;
    name: string;
    profile_photo: string;
    gender: string;
    city?: {
      name: string;
    };
  };
  companion_activities: Array<{
    id: number;
    activity_id: number;
    price_per_hour: string;
    activity: {
      id: number;
      name: string;
      description: string;
    };
  }>;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  reply: string | null;
  created_at: string;
  customer: {
    name: string;
    profile_photo: string | null;
  };
}

export const CompanionDetail: React.FC = () => {
  const { id } = useParams();
  const [companion, setCompanion] = useState<CompanionDetailType | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<any>('HARASSMENT');
  const [reportDesc, setReportDesc] = useState('');
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadDetails = () => {
    setLoading(true);
    Promise.all([
      api.get(`/companions/${id}`),
      api.get(`/companions/${id}/reviews`),
    ])
      .then(([detailRes, reviewsRes]) => {
        if (detailRes.data.success) setCompanion(detailRes.data.data);
        if (reviewsRes.data.success) setReviews(reviewsRes.data.data);
      })
      .catch(() => {
        toast('Failed to load profile or profile is unavailable', 'error');
        navigate('/companions');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (id) loadDetails();
  }, [id]);

  const handleBlockCompanion = async () => {
    if (!companion) return;
    try {
      const res = await api.post(`/users/${companion.user_id}/block`);
      if (res.data.success) {
        toast('User blocked successfully. Filtering directory list.', 'success');
        navigate('/companions');
      }
    } catch (e) {
      toast('Failed to block user', 'error');
    }
  };

  const handleReportCompanion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companion || !reportDesc) return;

    try {
      const res = await api.post('/reports', {
        reported_user_id: companion.user_id,
        reason: reportReason,
        description: reportDesc,
      });

      if (res.data.success) {
        toast('Report submitted successfully. Safety team notified.', 'success');
        setReportOpen(false);
        setReportDesc('');
      }
    } catch (e: any) {
      toast(e.response?.data?.message || 'Failed to submit report', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!companion) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Bio, Details, Activities (Col Span 2) */}
      <div className="md:col-span-2 space-y-8">
        {/* Info Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row gap-6 shadow-sm">
          {companion.user.profile_photo ? (
            <img
              src={companion.user.profile_photo}
              alt={companion.user.name}
              className="h-28 w-28 rounded-xl object-cover border border-slate-100 shrink-0 mx-auto sm:mx-0"
            />
          ) : (
            <div className="h-28 w-28 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-black text-4xl shrink-0 mx-auto sm:mx-0">
              {companion.user.name[0]}
            </div>
          )}

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-800">{companion.user.name}</h2>
            <div className="flex justify-center sm:justify-start items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <MapPin size={14} className="text-brand-500" /> {companion.user.city?.name || 'Local'} | Gender: {companion.user.gender || 'N/A'}
            </div>
            <div className="flex justify-center sm:justify-start items-center gap-4 text-xs font-bold text-slate-700 mt-2">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-amber-500 fill-amber-500" /> {parseFloat(companion.rating).toFixed(1)} / 5 ({companion.total_reviews} reviews)
              </div>
              <div className="flex items-center gap-1">
                <Award size={14} className="text-brand-500" /> {companion.experience || '1 year host'}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Biography</h3>
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{companion.bio || 'No bio written yet.'}</p>
        </div>

        {/* Pricing list */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Social Outings & Hourly Pricing</h3>
          <div className="grid grid-cols-1 gap-3">
            {companion.companion_activities.map((act) => (
              <div key={act.id} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="space-y-0.5 max-w-xs">
                  <div className="text-xs font-bold text-slate-800">{act.activity.name}</div>
                  <div className="text-[10px] text-slate-500 leading-relaxed">{act.activity.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-brand-600">₹{parseFloat(act.price_per_hour).toFixed(0)}</div>
                  <div className="text-[8px] uppercase text-slate-400 font-bold">per hour</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Member Reviews ({reviews.length})</h3>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-100 overflow-hidden shrink-0">
                        {r.customer.profile_photo ? (
                          <img src={r.customer.profile_photo} alt={r.customer.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-[10px]">{r.customer.name[0]}</div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{r.customer.name}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < r.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                  
                  {r.reply && (
                    <div className="bg-slate-50 border-l-2 border-brand-500 p-2.5 rounded-r-lg mt-2 text-[11px] text-slate-600">
                      <div className="font-bold text-[10px] text-slate-700 mb-0.5">{companion.user.name} responded:</div>
                      {r.reply}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
              No reviews registered for this companion yet.
            </div>
          )}
        </div>
      </div>

      {/* Booking Actions & Safety Drawer (Col Span 1) */}
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center space-y-4">
          <div className="text-xs text-slate-400">Verified Companionship Outing</div>
          <button
            onClick={() => setBookingOpen(true)}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg text-sm shadow-md transition-colors flex items-center justify-center gap-1.5 active:scale-98"
          >
            <Calendar size={18} /> Book Companion
          </button>

          <hr className="border-slate-100" />

          {/* Safety controls */}
          <div className="space-y-2">
            <button
              onClick={handleBlockCompanion}
              className="w-full flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2 rounded-lg text-xs transition-colors"
            >
              <Ban size={14} /> Block User
            </button>
            <button
              onClick={() => setReportOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 border border-rose-100 hover:bg-rose-50 text-rose-600 font-bold py-2 rounded-lg text-xs transition-colors"
            >
              <ShieldAlert size={14} /> Report Profile
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-slate-150 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">Report Companion Profile</h3>
              <button onClick={() => setReportOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleReportCompanion} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border border-slate-350 rounded-lg p-2 bg-white text-xs"
                >
                  <option value="HARASSMENT">Harassment</option>
                  <option value="UNSAFE_BEHAVIOUR">Unsafe Behaviour</option>
                  <option value="FRAUD">Fraud</option>
                  <option value="FAKE_PROFILE">Fake Profile</option>
                  <option value="PROHIBITED_SERVICE">Prohibited Service (Sexual/Escort/Adult)</option>
                  <option value="OTHER">Other Reason</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Description</label>
                <textarea
                  required
                  rows={3}
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Provide details of the policy breach..."
                  className="w-full border border-slate-350 rounded-lg p-2 text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-lg text-xs"
              >
                Submit Safety Report
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Book Companion Modal */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        companionId={companion.id}
        companionName={companion.user.name}
        activities={companion.companion_activities}
      />
    </div>
  );
};
