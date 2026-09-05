import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  DollarSign,
  Clock,
  Award,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const BecomePartner: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-700 via-purple-700 to-indigo-800 text-white rounded-3xl p-8 sm:p-12 space-y-6 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-brand-100 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles size={14} /> Earn by Connecting Safely
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Become a Verified Social Companion on WithMe24
          </h1>
          <p className="text-sm sm:text-base text-brand-100 font-medium leading-relaxed">
            Turn your free time, social skills, and local knowledge into income. Host movie outings, coffee chats, shopping tours, and elder support sessions on your terms.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-brand-50 font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-lg"
            >
              Start Registration Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Partner Benefits Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900">Why Partner With WithMe24?</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Designed for professional Hosts & Companions in India with safety, flexibility, and transparent payouts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
              <DollarSign size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Set Your Own Rates</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Decide your hourly pricing per activity service (₹300 - ₹1500+/hr) and receive direct bank payouts.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
              <Clock size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Flexible Schedule</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Set your availability date & time slots when you are free. No minimum working hours requirement.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-fit">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Safety First Protocol</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              All clients are mobile-verified. Instant emergency SOS button and 24/7 safety team support.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit">
              <Award size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Verified Badge</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Build your digital reputation with verified badges, client reviews, and top companion placement.
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Step Registration Overview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 text-center sm:text-left">
          Partner Onboarding Workflow (10 Steps)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs font-semibold text-slate-700">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-brand-600 font-extrabold">Step 1:</span> Mobile OTP
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-brand-600 font-extrabold">Step 2:</span> Basic Details
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-brand-600 font-extrabold">Step 3:</span> Photo & Bio
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-brand-600 font-extrabold">Step 4:</span> Select Services
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-brand-600 font-extrabold">Step 5:</span> Set Rates
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-brand-600 font-extrabold">Step 6:</span> Set Availability
          </div>
          <div className="bg-slate-50 border border-slate-200 border-dashed p-3 rounded-xl space-y-1">
            <span className="text-brand-600 font-extrabold">Step 7:</span> Upload KYC ID
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-brand-600 font-extrabold">Step 8:</span> Choose Plan
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-brand-600 font-extrabold">Step 9:</span> Accept Terms
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-brand-600 font-extrabold">Step 10:</span> Admin Review
          </div>
        </div>
      </div>

      {/* Guidelines & Rules Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
          <AlertTriangle size={18} /> Important Partner Conduct Rules
        </div>
        <ul className="text-xs text-amber-900 space-y-1.5 list-disc pl-5 leading-relaxed font-medium">
          <li>WithMe24 is strictly a non-dating social support platform. Sexual services or solicitation are prohibited.</li>
          <li>All outings must be conducted in safe public places or agreed safe locations.</li>
          <li>Never share personal financial credentials or offline payment requests with clients.</li>
          <li>Breach of code of conduct will result in immediate profile suspension and forfeiture of platform access.</li>
        </ul>
      </div>
    </div>
  );
};
