import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  MapPin,
  Compass,
  Search,
  UserCheck,
  Calendar,
  CheckCircle,
  CreditCard,
  BellRing,
  Smile,
  Star,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface Step {
  number: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
}

const stepsData: Step[] = [
  {
    number: 1,
    title: 'Create Account',
    subtitle: 'Quick & Secure Mobile Registration',
    description: 'Sign up using your mobile number and instant OTP verification. No long password forms required.',
    icon: <UserPlus className="w-6 h-6 text-brand-600" />,
  },
  {
    number: 2,
    title: 'Select City / PIN Code',
    subtitle: 'Find Local Companions Near You',
    description: 'Filter companions operating in your city, district, or specific PIN code across India.',
    icon: <MapPin className="w-6 h-6 text-purple-600" />,
  },
  {
    number: 3,
    title: 'Choose Service',
    subtitle: 'Tailored Outings & Support Services',
    description: 'Select from Movie Partner, Coffee Outing, Shopping Buddy, Elder Support, City Tour, and more.',
    icon: <Compass className="w-6 h-6 text-emerald-600" />,
  },
  {
    number: 4,
    title: 'Browse Verified Partners',
    subtitle: 'Compare Profiles, Rates & Ratings',
    description: 'Filter by availability date, rating, language, experience, and hourly pricing transparency.',
    icon: <Search className="w-6 h-6 text-blue-600" />,
  },
  {
    number: 5,
    title: 'View Profile & Reviews',
    subtitle: 'Inspect Experience & Credentials',
    description: 'Check verified status, bio, activity specializations, ratings, and genuine member reviews.',
    icon: <UserCheck className="w-6 h-6 text-pink-600" />,
  },
  {
    number: 6,
    title: 'Select Date & Time',
    subtitle: 'Flexible Availability Slots',
    description: 'Choose an open availability slot that fits your schedule for the planned outing.',
    icon: <Calendar className="w-6 h-6 text-amber-600" />,
  },
  {
    number: 7,
    title: 'Confirm Booking Details',
    subtitle: 'Transparent Pricing Breakdown',
    description: 'Review duration, base price, platform fee, taxes, and total amount before continuing.',
    icon: <CheckCircle className="w-6 h-6 text-indigo-600" />,
  },
  {
    number: 8,
    title: 'Make Secure Payment',
    subtitle: 'Encrypted Razorpay Gateway Integration',
    description: 'Pay via UPI, Cards, Net Banking, or Wallet. Payment is securely held until outing completion.',
    icon: <CreditCard className="w-6 h-6 text-teal-600" />,
  },
  {
    number: 9,
    title: 'Receive Booking Confirmation',
    subtitle: 'Instant In-App & SMS Alerts',
    description: 'Get instant booking status updates, partner contact info, and meeting point details.',
    icon: <BellRing className="w-6 h-6 text-rose-600" />,
  },
  {
    number: 10,
    title: 'Complete Outing Service',
    subtitle: 'Safe, Respectful & Professional Experience',
    description: 'Meet at agreed public/safe locations with emergency SOS support active throughout the session.',
    icon: <Smile className="w-6 h-6 text-orange-600" />,
  },
  {
    number: 11,
    title: 'Rate & Review Partner',
    subtitle: 'Build Community Trust',
    description: 'Share your feedback, rate your experience 1–5 stars, and help maintain marketplace quality.',
    icon: <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />,
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full text-brand-700 text-xs font-extrabold uppercase tracking-wider">
          <ShieldCheck size={14} /> Step-by-Step Experience Guide
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          How WithMe24 Works
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
          A transparent 11-step process designed for safety, convenience, and professional social companionship across India.
        </p>
      </div>

      {/* Timeline Grid */}
      <div className="relative border-l-2 border-brand-200 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-10">
        {stepsData.map((step) => (
          <div key={step.number} className="relative group">
            {/* Number Circle Badge */}
            <div className="absolute -left-[37px] sm:-left-[53px] top-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-600 text-white font-black text-sm sm:text-base flex items-center justify-center border-4 border-slate-50 shadow-md">
              {step.number}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  {step.icon}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">{step.title}</h2>
                  <span className="text-xs font-semibold text-brand-600">{step.subtitle}</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Footer */}
      <div className="bg-gradient-to-r from-brand-700 to-purple-800 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-black">
          Ready to find the right company for your next outing?
        </h2>
        <p className="text-sm text-brand-100 max-w-xl mx-auto font-medium">
          Browse verified companions in your city for coffee, movies, events, shopping, or elder assistance.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to="/find-partner"
            className="w-full sm:w-auto bg-white text-brand-700 hover:bg-brand-50 font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            Find a Partner <ArrowRight size={16} />
          </Link>
          <Link
            to="/become-partner"
            className="w-full sm:w-auto bg-brand-800 hover:bg-brand-900 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all border border-brand-500"
          >
            Become a Partner
          </Link>
        </div>
      </div>
    </div>
  );
};
