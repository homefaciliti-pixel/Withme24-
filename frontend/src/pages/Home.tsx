import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Sparkles, MapPin, Search, Compass, MessageSquare } from 'lucide-react';
import api from '../services/api';

interface City {
  id: number;
  name: string;
}

interface Activity {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

export const Home: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load metadata
    api.get('/cities').then((res) => {
      if (res.data.success) setCities(res.data.data);
    });
    api.get('/activities').then((res) => {
      if (res.data.success) setActivities(res.data.data);
    });
  }, []);

  const handleSearch = () => {
    let query = '?';
    if (selectedCity) query += `city_id=${selectedCity}&`;
    if (selectedActivity) query += `activity_id=${selectedActivity}`;
    navigate(`/companions${query}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-600 to-indigo-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="bg-brand-500 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full border border-brand-400">
            Trust & Safety First Social Platform
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
            Discover Verified Companions <br />
            For Legitimate Social Activities
          </h1>
          <p className="text-slate-200 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Coffee, city walks, events, sports, and shopping. Connect with verified companions who share your hobbies, strictly for platform-approved social outings.
          </p>

          {/* Quick Search Card */}
          <div className="bg-white rounded-xl shadow-xl p-4 text-slate-800 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            {/* City */}
            <div className="flex items-center gap-2 border-b sm:border-b-0 sm:border-r border-slate-200 pb-2 sm:pb-0 pr-2">
              <MapPin size={18} className="text-brand-500 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold focus:outline-none py-1"
              >
                <option value="">Choose Location</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Activity */}
            <div className="flex items-center gap-2 pr-2">
              <Compass size={18} className="text-brand-500 shrink-0" />
              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold focus:outline-none py-1"
              >
                <option value="">Select Activity</option>
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all text-sm"
            >
              <Search size={16} /> Find Companions
            </button>
          </div>
        </div>
      </section>

      {/* Trust & Safety Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-3">
          <div className="bg-brand-50 text-brand-600 p-3 rounded-lg w-fit">
            <Shield size={24} />
          </div>
          <h3 className="font-bold text-lg text-slate-800">100% Verified Profiles</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All companions undergo multi-level KYC checks and 18+ age verification before they can host.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-3">
          <div className="bg-brand-50 text-brand-600 p-3 rounded-lg w-fit">
            <Sparkles size={24} />
          </div>
          <h3 className="font-bold text-lg text-slate-800">Escrow Protected Bookings</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Payments are processed securely and released to the companion only after the session completes.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-3">
          <div className="bg-brand-50 text-brand-600 p-3 rounded-lg w-fit">
            <MessageSquare size={24} />
          </div>
          <h3 className="font-bold text-lg text-slate-800">24/7 Safety Desk</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            SOS emergency triggers, report forms, and active moderation blocks protect our communities.
          </p>
        </div>
      </section>

      {/* Activity Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Approved Social Activities</h2>
          <p className="text-xs text-slate-500">Only verified non-sexual, legitimate social companionship activities are supported.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {activities.map((a) => (
            <Link
              key={a.id}
              to={`/companions?activity_id=${a.id}`}
              className="group relative h-48 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-200"
            >
              <img
                src={a.image_url}
                alt={a.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 flex flex-col justify-end text-white">
                <h4 className="text-xs font-bold">{a.name}</h4>
                <p className="text-[10px] text-slate-300 line-clamp-2 mt-0.5">{a.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
