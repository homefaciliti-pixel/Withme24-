import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AlertOctagon } from 'lucide-react';

export const LegalPolicies: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  let title = 'Terms & Conditions';
  let subtitle = 'Official Platform User Agreement & Legal Terms';

  if (path === '/privacy') {
    title = 'Privacy Policy';
    subtitle = 'How WithMe24 Protects & Handles User Data';
  } else if (path === '/refund-policy') {
    title = 'Refund Policy';
    subtitle = 'Transparent Payment Refunds & Escrow Protection';
  } else if (path === '/cancellation-policy') {
    title = 'Cancellation Policy';
    subtitle = 'Session Cancellation Rules for Customers & Partners';
  } else if (path === '/code-of-conduct') {
    title = 'Code of Conduct';
    subtitle = 'Strict Boundaries & Professional Expectations';
  } else if (path === '/partner-guidelines') {
    title = 'Partner Guidelines';
    subtitle = 'Standard Operating Procedures for Verified Hosts';
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Policy Navigation Tabs */}
      <div className="flex flex-wrap gap-2 justify-center bg-white p-2 border border-slate-200 rounded-2xl shadow-sm">
        <Link
          to="/terms"
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            path === '/terms' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Terms & Conditions
        </Link>
        <Link
          to="/privacy"
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            path === '/privacy' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Privacy Policy
        </Link>
        <Link
          to="/code-of-conduct"
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            path === '/code-of-conduct' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Code of Conduct
        </Link>
        <Link
          to="/refund-policy"
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            path === '/refund-policy' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Refund Policy
        </Link>
        <Link
          to="/cancellation-policy"
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            path === '/cancellation-policy' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Cancellation Policy
        </Link>
        <Link
          to="/partner-guidelines"
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            path === '/partner-guidelines' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Partner Guidelines
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-2 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{title}</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">{subtitle}</p>
        <div className="text-[11px] text-slate-400 font-semibold pt-1">Last Updated: September 2026</div>
      </div>

      {/* Mandatory Non-Dating Disclaimer Callout */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-2 text-rose-900 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-sm">
          <AlertOctagon size={18} className="text-rose-600" /> Mandatory Platform Disclaimer
        </div>
        <p className="text-xs leading-relaxed font-medium">
          WithMe24 is strictly a professional social companionship and activity-support marketplace. WithMe24 is NOT a dating, matrimonial, or escort service. Prohibited activities include sexual services, sexual solicitation, harassment, violence, fraud, and illegal acts. Violators face immediate permanent suspension and legal reporting.
        </p>
      </div>

      {/* Policy Content */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-sm font-normal">
        {path === '/terms' && (
          <>
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
              <p>By accessing or using the WithMe24 platform, you agree to be bound by these Terms and Conditions. If you do not agree, you must immediately cease accessing the platform.</p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Professional Scope of Services</h2>
              <p>WithMe24 connects independent verified partners with clients for professional social outings, cinema trips, dining company, elder assistance, and events. All outings must be conducted with mutual consent and strict professional boundaries.</p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Account Eligibility & Verification</h2>
              <p>Users must be at least 18 years of age. Partners must undergo government ID verification (Aadhaar/PAN/Passport) prior to offering services.</p>
            </section>
          </>
        )}

        {path === '/privacy' && (
          <>
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Information Collection</h2>
              <p>We collect essential information required for secure operations, including mobile numbers for OTP authentication, profile details, location preferences, and transaction history.</p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Verification Document Privacy</h2>
              <p>Government ID documents uploaded for KYC verification are encrypted and access-controlled. KYC documents are never displayed publicly on companion profiles.</p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Contact Protection</h2>
              <p>Private phone numbers and personal email addresses are protected and not displayed on public directory cards.</p>
            </section>
          </>
        )}

        {path === '/code-of-conduct' && (
          <>
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Consent & Boundaries</h2>
              <p>All interactions must be strictly consent-first. Physical boundaries and personal space must be respected at all times.</p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Zero Tolerance Policy</h2>
              <p>Sexual propositions, harassment, stalking, offensive comments, or pressure are grounds for immediate account termination.</p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Public & Safe Outing Locations</h2>
              <p>All outings should occur in well-lit, public, or mutually agreed safe places such as cafes, restaurants, cinemas, or public parks.</p>
            </section>
          </>
        )}

        {(path === '/refund-policy' || path === '/cancellation-policy') && (
          <>
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Cancellation Timelines</h2>
              <p>• Cancellations requested 2+ hours prior to session start time receive a 100% full refund.</p>
              <p>• Cancellations requested within 2 hours of session start time incur a 20% platform processing fee.</p>
              <p>• If a Partner cancels a confirmed booking, the Customer receives an instant 100% full refund.</p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Escrow & Refund Processing</h2>
              <p>Payment is securely held by WithMe24 until session completion. Approved refunds are credited back to the original payment source via Razorpay within 3–5 business days.</p>
            </section>
          </>
        )}

        {path === '/partner-guidelines' && (
          <>
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Punctuality & Professionalism</h2>
              <p>Partners are expected to arrive at the agreed meeting location on time, maintain professional attire, and provide engaging companionship.</p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Safety Protocols</h2>
              <p>Always keep your mobile phone charged during outings. Use the Emergency SOS button in the WithMe24 app if any safety concern arises.</p>
            </section>
          </>
        )}
      </div>
    </div>
  );
};
