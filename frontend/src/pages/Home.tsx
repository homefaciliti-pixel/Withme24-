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

export const Home: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
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
    if (selectedActivity) query += `activity_id=${selectedActivity}&`;
    if (selectedDate) query += `date=${selectedDate}`;
    navigate(`/find-partner${query}`);
  };

  return (
    <div className="space-y-16 pb-16 bg-slate-50/50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-700 via-purple-700 to-indigo-800 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-brand-100 text-xs font-black uppercase tracking-wider">
            <ShieldCheck size={16} className="text-emerald-400" /> India’s #1 Professional Social Companionship Platform
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Find the Right Company for Every Moment
          </h1>

          <div className="space-y-1">
            <p className="text-brand-200 text-base sm:text-xl font-bold font-hindi">
              “जब मन हो साथ चाहिए — WithMe24.”
            </p>
            <p className="text-slate-200 text-xs sm:text-sm font-medium italic">
              “Find someone to connect, share, and experience.”
            </p>
          </div>

          <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-medium">
            Discover verified partners for outings, cinema, cafe chats, shopping, elder support, and everyday activities — safely, transparently, and professionally.
          </p>

          {/* Quick Search Bar */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 text-slate-800 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-3 items-center border border-slate-100">
            {/* City */}
            <div className="flex items-center gap-2 border-b sm:border-b-0 sm:border-r border-slate-200 pb-2 sm:pb-0 pr-2">
              <MapPin size={18} className="text-brand-600 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-bold focus:outline-none py-1 text-slate-800"
              >
                <option value="">All Locations</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Activity */}
            <div className="flex items-center gap-2 border-b sm:border-b-0 sm:border-r border-slate-200 pb-2 sm:pb-0 pr-2">
              <Compass size={18} className="text-brand-600 shrink-0" />
              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-bold focus:outline-none py-1 text-slate-800"
              >
                <option value="">Select Activity</option>
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Outing Date */}
            <div className="flex items-center gap-2 pr-2">
              <Calendar size={18} className="text-brand-600 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-bold focus:outline-none py-1 text-slate-800"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-xs sm:text-sm shadow-md"
            >
              <Search size={16} /> Find a Partner
            </button>
          </div>
        </div>
      </section>

      {/* Trust & Verification Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm hover:shadow-md transition-all">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl w-fit">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Identity Verified</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every companion undergoes Aadhaar/Government ID verification and background check prior to listing.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm hover:shadow-md transition-all">
          <div className="bg-purple-50 text-purple-600 p-3 rounded-xl w-fit">
            <Sparkles size={24} />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Escrow Protected</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Payments are held securely in escrow and released to partners only after session completion.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm hover:shadow-md transition-all">
          <div className="bg-rose-50 text-rose-600 p-3 rounded-xl w-fit">
            <MessageSquare size={24} />
          </div>
          <h3 className="font-bold text-slate-800 text-base">24/7 Safety & SOS</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            One-tap Panic SOS alert, instant moderation support, and member safety enforcement.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm hover:shadow-md transition-all">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl w-fit">
            <HeartHandshake size={24} />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Strict Non-Dating</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Consent-first, strictly platonic activity companionship. Zero tolerance for romantic or sexual solicitation.
          </p>
        </div>
      </section>

      {/* Featured Cities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Popular Outing Destinations</h2>
            <p className="text-xs text-slate-500 font-medium">Explore verified companions in top Indian cities.</p>
          </div>
          <Link to="/find-partner" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View All Cities <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredCities.map((city, idx) => (
            <Link
              key={idx}
              to={`/find-partner`}
              className="group relative h-40 rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all"
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 flex flex-col justify-end text-white">
                <h3 className="font-bold text-xs">{city.name}</h3>
                <span className="text-[10px] text-slate-300 font-semibold">{city.partners}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Approved Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900">Approved Social Services</h2>
          <p className="text-xs text-slate-500 font-medium">Transparent hourly pricing for verified social activities.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-fit">
              <Film size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Movie Partner</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Watch cinema releases & premieres together.</p>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-medium">Starts from</span>
              <span className="font-extrabold text-brand-700">₹499/hr</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit">
              <Coffee size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Coffee & Cafe Outing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Great conversations over tea or coffee.</p>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-medium">Starts from</span>
              <span className="font-extrabold text-brand-700">₹399/hr</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="p-3 bg-pink-50 text-pink-600 rounded-xl w-fit">
              <ShoppingBag size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Shopping Buddy</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Fashion advice & shopping assistance.</p>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-medium">Starts from</span>
              <span className="font-extrabold text-brand-700">₹599/hr</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl w-fit">
              <HeartHandshake size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Elder Support</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Compassionate assistance & park walks.</p>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-medium">Starts from</span>
              <span className="font-extrabold text-brand-700">₹599/hr</span>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Earnings Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-brand-950 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl border border-slate-800">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-500/30">
              <DollarSign size={14} /> Earn Up To ₹2,000 / Hour
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Become a Verified Companion on WithMe24
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
              Earn ₹50,000 – ₹1,50,000 monthly hosting cinema trips, coffee chats, shopping tours, and elder walks. Flexible schedule & direct bank payouts.
            </p>
          </div>

          <Link
            to="/become-partner"
            className="shrink-0 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg flex items-center gap-2"
          >
            Start Earning as a Partner <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};
