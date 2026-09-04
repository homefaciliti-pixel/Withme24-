import React from 'react';
import { ShieldCheck, UserCheck, CreditCard, Coffee, ShieldAlert, AlertTriangle } from 'lucide-react';

export const SafetyCenter: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-800 flex items-center justify-center gap-2">
          <ShieldCheck size={32} className="text-brand-600" /> WithMe24 Safety Center
        </h1>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          Our number one priority is trust, verification, and transparency. Read our rules and guidance to ensure a safe experience.
        </p>
      </div>

      {/* Safety Policy Alerts */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 space-y-4">
        <h3 className="text-rose-800 font-extrabold text-sm flex items-center gap-2">
          <AlertTriangle size={18} /> STRICTLY PROHIBITED SERVICES
        </h3>
        <p className="text-xs text-rose-700 leading-relaxed">
          WithMe24 is a verified platform for clean, legitimate social companionship activities (coffee, walking, dining, hobbies, shopping). 
          <strong> We do NOT facilitate or tolerate dating, escort directories, sexual services, adult services, prostitution, or any illegal operations.</strong> 
          Any profile or booking showing indicators of prohibited activities is immediately banned, and relevant data is shared with law enforcement.
        </p>
      </div>

      {/* Grid of Safety Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-brand-600 font-bold text-sm">
            <UserCheck size={18} /> Identity Verification
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every companion registers using official government identity documents (like Aadhaar, Passport, or DL) and completes face selfies. Accounts are verified manually by system administrators before going public.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-brand-600 font-bold text-sm">
            <CreditCard size={18} /> Secure Escrow Payments
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            All session pricing is calculated transparently on our servers. Payments are held in escrow and credited to the companion only after both members verify completion of the social session.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-brand-600 font-bold text-sm">
            <Coffee size={18} /> Public Outing Guidance
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Always meet companions in highly visible, well-populated public places (e.g. coffee shops, busy shopping centres, public parks). Never share your home addresses or private contact information.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-brand-600 font-bold text-sm">
            <ShieldAlert size={18} /> Immediate SOS Panic triggers
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            During any active booking, members can open the SOS panel in our header to instantly log GPS coordinates to WithMe24 support teams and display rapid regional emergency phone hotlines.
          </p>
        </div>
      </div>

      {/* Guidelines Section */}
      <div id="rules" className="space-y-4">
        <h3 className="font-bold text-lg text-slate-800">Community Safety Guidelines</h3>
        <ul className="list-disc pl-5 text-xs text-slate-600 space-y-2">
          <li><strong>Age Gate:</strong> You must be 18+ to use WithMe24. Minors are strictly prohibited.</li>
          <li><strong>In-Platform Communication:</strong> Keep all discussions regarding booking details, timings, and coordinates within the platform.</li>
          <li><strong>No Cash Handling:</strong> Do not pay companions cash directly. All transactions must pass through the secure platform gateway.</li>
          <li><strong>Report Immediately:</strong> If anyone asks for private details, proposes sexual services, or acts aggressively, block them instantly and file a report with our moderation desk.</li>
        </ul>
      </div>
    </div>
  );
};
