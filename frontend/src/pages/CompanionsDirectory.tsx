import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Star, Compass, Calendar } from 'lucide-react';
import api from '../services/api';

interface Companion {
  id: number;
  bio: string;
  experience: string;
  rating: string;
  total_reviews: number;
  user: {
    id: number;
    name: string;
    profile_photo: string;
    city?: {
      name: string;
    };
  };
  companion_activities: Array<{
    id: number;
    price_per_hour: string;
    activity: {
      name: string;
    };
  }>;
}

const DEFAULT_CITIES = [
  { id: 1, name: 'Delhi NCR' },
  { id: 2, name: 'Mumbai' },
  { id: 3, name: 'Bangalore' },
  { id: 4, name: 'Jaipur' },
  { id: 5, name: 'Pune' },
  { id: 6, name: 'Hyderabad' },
];

const DEFAULT_ACTIVITIES = [
  { id: 1, name: 'WithMe Coffee & Conversation' },
  { id: 2, name: 'WithMe City Walk' },
  { id: 3, name: 'WithMe Shopping Companion' },
  { id: 4, name: 'WithMe Movie / Entertainment' },
  { id: 5, name: 'WithMe Events & Shows' },
  { id: 6, name: 'WithMe Sports & Fitness' },
  { id: 7, name: 'WithMe Hobbies & Activities' },
  { id: 8, name: 'WithMe Explore the City' },
];

export const CompanionsDirectory: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [cities, setCities] = useState<Array<{ id: number; name: string }>>(DEFAULT_CITIES);
  const [activities, setActivities] = useState<Array<{ id: number; name: string }>>(DEFAULT_ACTIVITIES);
  const [loading, setLoading] = useState(true);

  // Read filter params
  const cityId = searchParams.get('city_id') || '';
  const activityId = searchParams.get('activity_id') || '';
  const rating = searchParams.get('rating') || '';
  const date = searchParams.get('date') || '';

  useEffect(() => {
    // Load metadata
    api.get('/cities').then((res) => {
      if (res.data?.success && res.data.data?.length > 0) setCities(res.data.data);
    }).catch(() => {});

    api.get('/activities').then((res) => {
      if (res.data?.success && res.data.data?.length > 0) setActivities(res.data.data);
    }).catch(() => {});
  }, []);

  const loadCompanions = () => {
    setLoading(true);
    let url = `/companions?`;
    if (cityId) url += `city_id=${cityId}&`;
    if (activityId) url += `activity_id=${activityId}&`;
    if (rating) url += `rating=${rating}&`;
    if (date) url += `date=${date}`;

    api
      .get(url)
      .then((res) => {
        if (res.data.success) setCompanions(res.data.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCompanions();
  }, [searchParams]);

  const handleFilterChange = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full flex-grow">
          {/* City filter */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Location</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-2.5 top-3 text-slate-450" />
              <select
                value={cityId}
                onChange={(e) => handleFilterChange('city_id', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-8 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
              >
                <option value="">All Locations</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Activity filter */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Activity</label>
            <div className="relative">
              <Compass size={14} className="absolute left-2.5 top-3 text-slate-450" />
              <select
                value={activityId}
                onChange={(e) => handleFilterChange('activity_id', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-8 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
              >
                <option value="">All Activities</option>
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date filter */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Outing Date</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-2.5 top-3 text-slate-450" />
              <input
                type="date"
                value={date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-8 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
              />
            </div>
          </div>

          {/* Rating filter */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Min Rating</label>
            <div className="relative">
              <Star size={14} className="absolute left-2.5 top-3 text-amber-500" />
              <select
                value={rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-8 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
              >
                <option value="">Any Rating</option>
                <option value="4.8">4.8+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Companions */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-4 space-y-4 animate-pulse">
              <div className="bg-slate-200 rounded-2xl h-44 w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : companions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {companions.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-purple-100/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              {/* Photo & Verified Badge */}
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                {c.user.profile_photo ? (
                  <img
                    src={c.user.profile_photo}
                    alt={c.user.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-4xl">
                    {c.user.name ? c.user.name[0].toUpperCase() : 'C'}
                  </div>
                )}

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 border border-white/20 shadow-md">
                  <Star size={11} className="text-amber-400 fill-amber-400" /> {parseFloat(c.rating).toFixed(1)} ({c.total_reviews})
                </div>

                {/* Aadhaar Verified Chip */}
                <div className="absolute bottom-3 left-3 bg-emerald-500/90 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-0.5 rounded-full border border-emerald-300/40 shadow-xs uppercase tracking-wider">
                  ✓ Verified Host
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-slate-900 text-base line-clamp-1">{c.user.name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-purple-700 font-extrabold">
                    <MapPin size={13} className="text-purple-600 shrink-0" /> {c.user.city?.name || 'Local City'}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed font-medium">
                    {c.bio || 'Verified social companion available for movie outings, dining, shopping, and everyday companion events.'}
                  </p>
                </div>

                {/* Hourly Activities List */}
                <div className="space-y-1.5 bg-purple-50/50 p-3 rounded-2xl border border-purple-100/60">
                  <div className="text-[9px] uppercase font-black tracking-wider text-purple-600">Available Activities & Rates</div>
                  <div className="space-y-1 max-h-20 overflow-y-auto pr-1">
                    {c.companion_activities && c.companion_activities.length > 0 ? (
                      c.companion_activities.map((act) => (
                        <div key={act.id} className="flex justify-between items-center text-[11px] font-extrabold text-slate-700">
                          <span className="line-clamp-1">{act.activity?.name || 'Social Companion'}</span>
                          <span className="text-purple-700 font-black">₹{parseFloat(act.price_per_hour).toFixed(0)}/hr</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] font-semibold text-slate-500">General Companion Outings</div>
                    )}
                  </div>
                </div>

                {/* Details Button */}
                <Link
                  to={`/companions/${c.id}`}
                  className="block w-full text-center bg-gradient-to-r from-purple-700 via-indigo-700 to-brand-700 hover:from-purple-800 hover:to-brand-800 text-white font-black py-2.5 rounded-xl text-xs transition-all shadow-md shadow-purple-900/10 hover:shadow-lg active:scale-95"
                >
                  View Profile & Book Outing
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-purple-100 rounded-3xl space-y-3 shadow-xs max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mx-auto">
            <Compass size={24} />
          </div>
          <p className="text-base font-black text-slate-900">No companions found for this filter</p>
          <p className="text-xs text-slate-500 font-medium px-4">
            Try choosing a different city or activity, or clear your filters to view all available companions.
          </p>
        </div>
      )}
    </div>
  );
};
