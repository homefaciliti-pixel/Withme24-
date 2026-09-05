import React from 'react';
import { Link } from 'react-router-dom';
import {
  Film,
  Coffee,
  ShoppingBag,
  Compass,
  Calendar,
  Gamepad2,
  HeartHandshake,
  Stethoscope,
  Briefcase,
  BookOpen,
  Dumbbell,
  Utensils,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  priceStarting: number;
  icon: React.ReactNode;
  popularFor: string[];
}

const servicesData: ServiceItem[] = [
  {
    id: 'movie-partner',
    name: 'Movie Partner',
    tagline: 'Never watch a blockbuster alone',
    description: 'Find an enthusiastic cinema companion for movie premieres, film festivals, or IMAX outings.',
    priceStarting: 499,
    icon: <Film className="w-6 h-6 text-purple-600" />,
    popularFor: ['Weekend Blockbusters', 'Film Festivals', 'Cinema Outings'],
  },
  {
    id: 'coffee-partner',
    name: 'Coffee & Cafe Partner',
    tagline: 'Meaningful conversations over coffee',
    description: 'Connect with engaging social hosts for cafe hopping, casual conversations, or evening tea breaks.',
    priceStarting: 399,
    icon: <Coffee className="w-6 h-6 text-amber-600" />,
    popularFor: ['Cafe Hopping', 'Evening Tea', 'Intellectual Chats'],
  },
  {
    id: 'shopping-buddy',
    name: 'Shopping Buddy',
    tagline: 'Honest style advice & shopping company',
    description: 'Have a supportive companion assist with fashion shopping, mall visits, or festive gift selections.',
    priceStarting: 599,
    icon: <ShoppingBag className="w-6 h-6 text-pink-600" />,
    popularFor: ['Wardrobe Styling', 'Festive Shopping', 'Mall Walks'],
  },
  {
    id: 'city-tour',
    name: 'City Tour & Exploration',
    tagline: 'Discover hidden gems with a local',
    description: 'Explore historical landmarks, cultural spots, local markets, and scenic viewpoints with a local host.',
    priceStarting: 799,
    icon: <Compass className="w-6 h-6 text-emerald-600" />,
    popularFor: ['Heritage Walks', 'Local Markets', 'Food Trails'],
  },
  {
    id: 'event-partner',
    name: 'Event & Concert Partner',
    tagline: 'Enjoy live music & events together',
    description: 'Attend stand-up shows, music concerts, art exhibitions, or theatre plays with a verified partner.',
    priceStarting: 699,
    icon: <Calendar className="w-6 h-6 text-blue-600" />,
    popularFor: ['Music Concerts', 'Standup Comedy', 'Art Exhibitions'],
  },
  {
    id: 'gaming-partner',
    name: 'Gaming & Arcade Partner',
    tagline: 'Co-op gaming & arcade thrills',
    description: 'Team up for bowling, arcade gaming, esports arenas, or board game cafes.',
    priceStarting: 450,
    icon: <Gamepad2 className="w-6 h-6 text-indigo-600" />,
    popularFor: ['Bowling', 'Arcade Gaming', 'Board Game Cafes'],
  },
  {
    id: 'elder-support',
    name: 'Elderly Activity Support',
    tagline: 'Caring company & assistance for seniors',
    description: 'Compassionate partners for park walks, library visits, light companionship, and elder conversation.',
    priceStarting: 599,
    icon: <HeartHandshake className="w-6 h-6 text-rose-600" />,
    popularFor: ['Park Walks', 'Memory Sharing', 'Library Visits'],
  },
  {
    id: 'medical-support',
    name: 'Medical Appointment Escort',
    tagline: 'Reassuring presence for hospital visits',
    description: 'Respectful assistance for hospital check-ups, pharmacy runs, and routine medical visits.',
    priceStarting: 699,
    icon: <Stethoscope className="w-6 h-6 text-teal-600" />,
    popularFor: ['Clinic Visits', 'Diagnostic Checks', 'Pharmacy Assistance'],
  },
  {
    id: 'networking',
    name: 'Professional Networking Partner',
    tagline: 'Expand your social & professional circle',
    description: 'Attend industry meetups, business summits, or networking dinners with a polished partner.',
    priceStarting: 899,
    icon: <Briefcase className="w-6 h-6 text-slate-700" />,
    popularFor: ['Tech Meetups', 'Business Summits', 'Dinner Events'],
  },
  {
    id: 'study-partner',
    name: 'Study & Work Partner',
    tagline: 'Focused co-working & accountability',
    description: 'Boost productivity with a quiet co-working partner at cafes or public libraries.',
    priceStarting: 350,
    icon: <BookOpen className="w-6 h-6 text-sky-600" />,
    popularFor: ['Co-Working Cafes', 'Library Sessions', 'Accountability'],
  },
  {
    id: 'fitness-partner',
    name: 'Fitness & Sports Buddy',
    tagline: 'Stay active & motivated',
    description: 'Jogging companions, badminton partners, or morning walk buddies to keep you active.',
    priceStarting: 499,
    icon: <Dumbbell className="w-6 h-6 text-orange-600" />,
    popularFor: ['Morning Jogging', 'Badminton', 'Cycling Outings'],
  },
  {
    id: 'food-partner',
    name: 'Food & Fine Dining Partner',
    tagline: 'Explore culinary delights together',
    description: 'Try new restaurants, buffet spreads, or street food tours with a fellow food lover.',
    priceStarting: 549,
    icon: <Utensils className="w-6 h-6 text-red-600" />,
    popularFor: ['Restaurant Reviews', 'Buffet Outings', 'Street Food'],
  },
];

export const Services: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full text-brand-700 text-xs font-extrabold uppercase tracking-wider">
          <Sparkles size={14} /> Professional Social Services
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Services Offered on WithMe24
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
          Discover verified companions for meaningful social outings, everyday activities, elder assistance, and shared experiences — safely and professionally.
        </p>
      </div>

      {/* Safety Callout */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-emerald-100 text-emerald-700 p-3 rounded-xl shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Strict Professional & Safety Boundaries</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              WithMe24 is strictly a non-dating, professional social support platform. All outings take place in public or safe agreed-upon environments. Sexual services or inappropriate behavior are strictly prohibited.
            </p>
          </div>
        </div>
        <Link
          to="/safety"
          className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          View Safety Policy
        </Link>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicesData.map((svc) => (
          <div
            key={svc.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  {svc.icon}
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Starting from</div>
                  <div className="text-base font-black text-brand-700">₹{svc.priceStarting}<span className="text-xs font-normal text-slate-500">/hr</span></div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">{svc.name}</h2>
                <p className="text-xs font-semibold text-brand-600">{svc.tagline}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {svc.description}
              </p>

              {/* Popular use cases */}
              <div className="space-y-1.5 pt-2">
                <div className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Popular For</div>
                <div className="flex flex-wrap gap-1.5">
                  {svc.popularFor.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                    >
                      <CheckCircle2 size={10} className="text-brand-600" /> {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Link
              to={`/find-partner`}
              className="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              Find {svc.name} Partners
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
