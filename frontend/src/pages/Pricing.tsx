import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Info, ArrowRight, DollarSign } from 'lucide-react';

export const Pricing: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full text-brand-700 text-xs font-extrabold uppercase tracking-wider">
          <DollarSign size={14} /> Transparent & Fair Pricing
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Pricing & Platform Commission Architecture
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
          Simple, upfront pricing with no hidden charges. Partners set their hourly rates, and clients see full transparent fee breakdowns before payment.
        </p>
      </div>

      {/* Pricing Calculation Example */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Info className="text-brand-600" size={20} /> Booking Price Breakdown Example
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Partner Hourly Rate (e.g. Movie Outing)</span>
              <span className="font-bold text-slate-900">₹500 / hr</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Session Duration (2 Hours)</span>
              <span className="font-bold text-slate-900">2.0 Hours</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Base Companion Fee</span>
              <span className="font-bold text-slate-900">₹1,000</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Platform Commission Fee (25%)</span>
              <span className="font-bold text-slate-900">₹250</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-semibold text-slate-600">GST Tax (18% on Platform Fee)</span>
              <span className="font-bold text-slate-900">₹45</span>
            </div>
            <div className="flex justify-between py-3 bg-brand-50 p-3 rounded-xl text-base font-black text-brand-800">
              <span>Total Customer Payable Amount</span>
              <span>₹1,045</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-emerald-900 text-lg flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-600" /> For Customers
            </h3>
            <ul className="text-xs sm:text-sm text-emerald-800 space-y-2 font-medium">
              <li>• Upfront pricing with no surprise charges.</li>
              <li>• Payment held in secure escrow until outing is completed.</li>
              <li>• Instant full refunds for partner cancellations.</li>
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-purple-900 text-lg flex items-center gap-2">
              <CheckCircle2 size={20} className="text-purple-600" /> For Verified Partners
            </h3>
            <ul className="text-xs sm:text-sm text-purple-800 space-y-2 font-medium">
              <li>• You earn 100% of your chosen base hourly price.</li>
              <li>• Direct bank payouts upon session completion.</li>
              <li>• Zero registration setup fee.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          to="/find-partner"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-md"
        >
          Browse Partners & Check Rates <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};
