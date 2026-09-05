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

export const CompanionsDirectory: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([]);
  const [activities, setActivities] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Read filter params
  const cityId = searchParams.get('city_id') || '';
  const activityId = searchParams.get('activity_id') || '';
  const rating = searchParams.get('rating') || '';
  const date = searchParams.get('date') || '';

  useEffect(() => {
    // Load metadata
    api.get('/cities').then((res) => {
      if (res.data.success) setCities(res.data.data);
    });
    api.get('/activities').then((res) => {
      if (res.data.success) setActivities(res.data.data);
    });
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
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 animate-pulse">
              <div className="bg-slate-200 rounded-lg h-40 w-full"></div>
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
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Photo */}
              <div className="relative h-44 bg-slate-100">
                {c.user.profile_photo ? (
                  <img
                    src={c.user.profile_photo}
                    alt={c.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-600 font-black text-3xl">
                    {c.user.name[0]}
                  </div>
                )}
                {/* Rating overlay */}
                <div className="absolute top-2 right-2 bg-black/75 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                  <Star size={10} className="text-amber-400 fill-amber-400" /> {parseFloat(c.rating).toFixed(1)} ({c.total_reviews})
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{c.user.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <MapPin size={12} /> {c.user.city?.name || 'Local'}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                    {c.bio || 'Hello, I am a verified social companion on WithMe24.'}
                  </p>
                </div>

                {/* Offer list */}
                <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  <div className="text-[9px] uppercase font-extrabold text-slate-400">Outings & Hourly Pricing</div>
                  <div className="space-y-1 max-h-16 overflow-y-auto pr-1">
                    {c.companion_activities.map((act) => (
                      <div key={act.id} className="flex justify-between items-center text-[10px] font-semibold text-slate-700">
                        <span className="line-clamp-1">{act.activity.name}</span>
                        <span className="text-brand-600">₹{parseFloat(act.price_per_hour).toFixed(0)}/hr</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details Button */}
                <Link
                  to={`/companions/${c.id}`}
                  className="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm"
                >
                  View Profile & Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl space-y-2">
          <p className="text-sm font-bold text-slate-700">No verified companions found matching filters</p>
          <p className="text-xs text-slate-450">Try choosing a different city, date, or resetting your filter choices.</p>
        </div>
      )}
    </div>
  );
};
