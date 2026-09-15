import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  Search,
  Compass,
  MessageSquare,
  ShieldCheck,
  HeartHandshake,
  Film,
  Coffee,
  ShoppingBag,
  Calendar,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
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

const featuredCities = [
  { name: 'Delhi NCR', partners: '120+ Verified Hosts', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80' },
  { name: 'Mumbai', partners: '150+ Verified Hosts', image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=600&q=80' },
  { name: 'Bangalore', partners: '110+ Verified Hosts', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80' },
  { name: 'Jaipur', partners: '85+ Verified Hosts', image: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=600&q=80' },
  { name: 'Pune', partners: '90+ Verified Hosts', image: 'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?auto=format&fit=crop&w=600&q=80' },
  { name: 'Hyderabad', partners: '95+ Verified Hosts', image: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=600&q=80' },
];

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

export const Home: React.FC = () => {
  const [cities, setCities] = useState<City[]>(DEFAULT_CITIES);
  const [activities, setActivities] = useState<Activity[]>(DEFAULT_ACTIVITIES);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/cities').then((res) => {
      if (res.data?.success && res.data.data?.length > 0) setCities(res.data.data);
    }).catch(() => {});

    api.get('/activities').then((res) => {
      if (res.data?.success && res.data.data?.length > 0) setActivities(res.data.data);
    }).catch(() => {});
  }, []);

  const handleSearch = () => {
    let query = '?';
    if (selectedCity) query += `city_id=${selectedCity}&`;
    if (selectedActivity) query += `activity_id=${selectedActivity}&`;
    if (selectedDate) query += `date=${selectedDate}`;
    navigate(`/find-partner${query}`);
  };

  return (
    <div className="space-y-16 pb-20 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100">
      {/* Hero Section with Ambient Luxury Glows */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        {/* Soft Radial Ambient Lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-purple-600/20 via-indigo-600/20 to-brand-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-rose-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-brand-500/10 backdrop-blur-xl border border-purple-400/30 px-5 py-2 rounded-full text-purple-300 text-xs font-black uppercase tracking-wider shadow-lg">
            <ShieldCheck size={16} className="text-emerald-400" /> India’s #1 Verified Social Companionship Platform
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15]">
            Find Perfect Company for <br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-rose-300 bg-clip-text text-transparent">
              Every Outing & Event
            </span>
          </h1>

          {/* Subtitle */}
          <div className="space-y-2 max-w-2xl mx-auto">
            <p className="text-purple-300 text-lg sm:text-2xl font-bold font-hindi">
              “जब मन हो साथ चाहिए — WithMe24.”
            </p>
            <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
              Discover verified local companions for cinema releases, cafe conversations, shopping trips, city tours, and elder walks — safe, transparent & strictly professional.
            </p>
          </div>

          {/* Modern Floating Search Bar */}
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-4 text-slate-800 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-3 items-center border border-purple-100/50">
            {/* City Select */}
            <div className="flex items-center gap-2.5 border-b sm:border-b-0 sm:border-r border-slate-200/80 pb-3 sm:pb-0 pr-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <MapPin size={18} />
              </div>
              <div className="w-full text-left">
                <label className="block text-[10px] font-black uppercase text-slate-400">Location</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-transparent text-xs font-extrabold focus:outline-none py-0.5 text-slate-900 cursor-pointer"
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

            {/* Activity Select */}
            <div className="flex items-center gap-2.5 border-b sm:border-b-0 sm:border-r border-slate-200/80 pb-3 sm:pb-0 pr-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <Compass size={18} />
              </div>
              <div className="w-full text-left">
                <label className="block text-[10px] font-black uppercase text-slate-400">Activity</label>
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="w-full bg-transparent text-xs font-extrabold focus:outline-none py-0.5 text-slate-900 cursor-pointer"
                >
                  <option value="">Select Activity</option>
                  {activities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Outing Date */}
            <div className="flex items-center gap-2.5 pr-3">
              <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 shrink-0">
                <Calendar size={18} />
              </div>
              <div className="w-full text-left">
                <label className="block text-[10px] font-black uppercase text-slate-400">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-transparent text-xs font-extrabold focus:outline-none py-0.5 text-slate-900 cursor-pointer"
                />
              </div>
            </div>

            {/* Search Action */}
            <button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-purple-700 via-indigo-700 to-brand-700 hover:from-purple-800 hover:to-brand-800 text-white font-black py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all text-xs sm:text-sm shadow-xl shadow-purple-900/30 hover:scale-[1.02] active:scale-95"
            >
              <Search size={18} /> Find Partner
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-slate-400 text-xs font-bold pt-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% Aadhaar Verified Companions</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-purple-400" />
              <span>Escrow Payment Security</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-indigo-400" />
              <span>Strict Non-Dating & Platonic</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars of Safety & Trust */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-3xl space-y-4 hover:border-purple-500/40 transition-all hover:-translate-y-1 shadow-lg">
          <div className="bg-emerald-500/10 text-emerald-400 p-3.5 rounded-2xl w-fit border border-emerald-500/20">
            <ShieldCheck size={26} />
          </div>
          <h3 className="font-extrabold text-white text-base">Identity Verified</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Every host undergoes mandatory Aadhaar/Government ID verification and background checks prior to listing.
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-3xl space-y-4 hover:border-purple-500/40 transition-all hover:-translate-y-1 shadow-lg">
          <div className="bg-purple-500/10 text-purple-400 p-3.5 rounded-2xl w-fit border border-purple-500/20">
            <Sparkles size={26} />
          </div>
          <h3 className="font-extrabold text-white text-base">Escrow Protected</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Payments are safely held in escrow and released to companions only after the scheduled session completes.
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-3xl space-y-4 hover:border-purple-500/40 transition-all hover:-translate-y-1 shadow-lg">
          <div className="bg-rose-500/10 text-rose-400 p-3.5 rounded-2xl w-fit border border-rose-500/20">
            <MessageSquare size={26} />
          </div>
          <h3 className="font-extrabold text-white text-base">24/7 Safety & SOS</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            One-tap Panic SOS alert, live geolocation tracking, and immediate emergency moderation dispatch.
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-3xl space-y-4 hover:border-purple-500/40 transition-all hover:-translate-y-1 shadow-lg">
          <div className="bg-blue-500/10 text-blue-400 p-3.5 rounded-2xl w-fit border border-blue-500/20">
            <HeartHandshake size={26} />
          </div>
          <h3 className="font-extrabold text-white text-base">Strict Non-Dating</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Consent-first, strictly platonic activity companionship. Zero tolerance for romantic or adult solicitation.
          </p>
        </div>
      </section>

      {/* Featured Cities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Popular Outing Cities</h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">Browse verified companion hosts across top metropolitan cities.</p>
          </div>
          <Link to="/find-partner" className="text-xs font-extrabold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors">
            Explore All Cities <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredCities.map((city, idx) => (
            <Link
              key={idx}
              to={`/find-partner`}
              className="group relative h-48 rounded-3xl overflow-hidden border border-slate-800 shadow-md hover:border-purple-500/50 transition-all"
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex flex-col justify-end">
                <h3 className="font-extrabold text-sm text-white">{city.name}</h3>
                <span className="text-[11px] text-purple-300 font-bold">{city.partners}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Approved Social Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-purple-500/10 text-purple-300 text-xs font-black px-3.5 py-1.5 rounded-full border border-purple-500/20">
            <Sparkles size={14} /> Curated Companion Activities
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Approved Social Services</h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">Clear, hourly pricing with zero hidden fees.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-6 space-y-4 hover:border-purple-500/50 hover:bg-slate-800/70 transition-all shadow-lg">
            <div className="p-3.5 bg-purple-500/10 text-purple-400 rounded-2xl w-fit border border-purple-500/20">
              <Film size={26} />
            </div>
            <h3 className="font-extrabold text-white text-base">WithMe Movie Partner</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">Enjoy cinema releases & movie premieres together with zero awkwardness.</p>
            <div className="flex justify-between items-center pt-3 border-t border-slate-700/60 text-xs">
              <span className="text-slate-400 font-bold">Starts from</span>
              <span className="font-black text-purple-400 text-sm">₹499/hr</span>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-6 space-y-4 hover:border-purple-500/50 hover:bg-slate-800/70 transition-all shadow-lg">
            <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-2xl w-fit border border-amber-500/20">
              <Coffee size={26} />
            </div>
            <h3 className="font-extrabold text-white text-base">WithMe Coffee Partner</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">Engaging chats over coffee, tea, or weekend brunch in top local spots.</p>
            <div className="flex justify-between items-center pt-3 border-t border-slate-700/60 text-xs">
              <span className="text-slate-400 font-bold">Starts from</span>
              <span className="font-black text-amber-400 text-sm">₹399/hr</span>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-6 space-y-4 hover:border-purple-500/50 hover:bg-slate-800/70 transition-all shadow-lg">
            <div className="p-3.5 bg-pink-500/10 text-pink-400 rounded-2xl w-fit border border-pink-500/20">
              <ShoppingBag size={26} />
            </div>
            <h3 className="font-extrabold text-white text-base">WithMe Shopping Buddy</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">Style guidance, wardrobe shopping assistance, and retail trip partner.</p>
            <div className="flex justify-between items-center pt-3 border-t border-slate-700/60 text-xs">
              <span className="text-slate-400 font-bold">Starts from</span>
              <span className="font-black text-pink-400 text-sm">₹599/hr</span>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-6 space-y-4 hover:border-purple-500/50 hover:bg-slate-800/70 transition-all shadow-lg">
            <div className="p-3.5 bg-rose-500/10 text-rose-400 rounded-2xl w-fit border border-rose-500/20">
              <HeartHandshake size={26} />
            </div>
            <h3 className="font-extrabold text-white text-base">WithMe Elder Support</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">Compassionate companions for park walks, medical visits, and conversation.</p>
            <div className="flex justify-between items-center pt-3 border-t border-slate-700/60 text-xs">
              <span className="text-slate-400 font-bold">Starts from</span>
              <span className="font-black text-rose-400 text-sm">₹599/hr</span>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Earnings Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl border border-purple-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[100px] pointer-events-none" />

          <div className="space-y-4 text-center md:text-left relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-black px-4 py-1.5 rounded-full border border-emerald-500/30 shadow-md">
              <DollarSign size={16} /> Earn Up To ₹2,000 / Hour
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Become a Verified Companion Host
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
              Earn ₹50,000 – ₹1,50,000 monthly hosting movie outings, cafe chats, shopping tours, and elder companion walks. Flexible schedule, instant bookings & weekly bank payouts.
            </p>
          </div>

          <Link
            to="/become-partner"
            className="shrink-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 hover:from-purple-700 hover:to-brand-700 text-white font-black text-xs sm:text-sm px-8 py-4 rounded-2xl transition-all shadow-xl shadow-purple-950/50 flex items-center gap-2.5 hover:scale-105 active:scale-95 relative z-10"
          >
            Start Earning as Partner <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};
