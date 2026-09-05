import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="space-y-4 lg:col-span-2">
            <div className="text-2xl font-black text-white tracking-tight">
              WithMe<span className="text-brand-500">24</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-brand-400 font-bold font-hindi">
                “जब मन हो साथ चाहिए — WithMe24.”
              </p>
              <p className="text-xs text-slate-300 font-medium italic">
                “Find someone to connect, share, and experience.”
              </p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India’s professional social companionship & activity support marketplace. Connecting adults for local, legitimate, and safe outings.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
              <ShieldCheck size={16} /> 100% Verified Partners • Escrow Protection
            </div>
          </div>

          {/* Column 2: Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Services</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/services" className="hover:text-white transition-colors">Movie Partner</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Coffee & Cafe Outing</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Shopping Buddy</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">City Tour & Travel</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Elder Support</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors font-bold text-brand-400">Pricing & Fees</Link></li>
            </ul>
          </div>

          {/* Column 3: For Customers */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">For Customers</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/find-partner" className="hover:text-white transition-colors">Find a Partner</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/safety" className="hover:text-white transition-colors">Safety Center</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors">Help Center & FAQ</Link></li>
            </ul>
          </div>

          {/* Column 4: For Partners */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">For Partners</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/become-partner" className="hover:text-white transition-colors font-bold text-emerald-400">Become a Partner</Link></li>
              <li><Link to="/partner-benefits" className="hover:text-white transition-colors">Partner Benefits</Link></li>
              <li><Link to="/partner-guidelines" className="hover:text-white transition-colors">Partner Guidelines</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Partner Portal</Link></li>
            </ul>
          </div>

          {/* Column 5: Legal & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Legal Policies</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/code-of-conduct" className="hover:text-white transition-colors">Code of Conduct</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link to="/cancellation-policy" className="hover:text-white transition-colors">Cancellation Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Declaration Notice */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="text-xs font-bold text-slate-300">Strict Non-Dating & Safety Declaration</div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            WithMe24 is strictly a professional social support marketplace. The platform does NOT support, advertise, or allow dating, matchmaking, adult services, escorts, sexual services, or prostitution. Violating accounts are suspended permanently and reported to regional law enforcement.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-4 border-t border-slate-900 pt-6">
          <div>© 2026 WithMe24.com (Superhome Technologies). All rights reserved.</div>
          <div className="flex gap-4 font-medium">
            <Link to="/terms" className="hover:text-slate-400">Terms</Link>
            <Link to="/privacy" className="hover:text-slate-400">Privacy</Link>
            <Link to="/code-of-conduct" className="hover:text-slate-400">Conduct</Link>
            <Link to="/safety" className="hover:text-slate-400">Safety</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
