import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, HelpCircle, ChevronDown, ChevronUp, PhoneCall } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'General' | 'Booking' | 'Partner' | 'Safety';
}

const faqsData: FAQItem[] = [
  {
    question: 'Is WithMe24 a dating or matrimonial service?',
    answer: 'No. WithMe24 is strictly a professional social companionship and activity support marketplace. We facilitate non-romantic, consent-first social outings like coffee chats, cinema company, elder support, and city tours.',
    category: 'General',
  },
  {
    question: 'How are partners verified on WithMe24?',
    answer: 'All partners undergo multi-step identity verification including Aadhaar/Government ID verification, background checks, mobile OTP validation, and admin approval before being listed.',
    category: 'Safety',
  },
  {
    question: 'What happens if a partner or customer misbehaves?',
    answer: 'We have zero tolerance for harassment, sexual propositions, or illegal activities. Users can use the instant Panic SOS button, block accounts, or file emergency safety reports. Violators face immediate account ban and legal reporting.',
    category: 'Safety',
  },
  {
    question: 'How does payment work?',
    answer: 'Payments are processed securely via Razorpay (UPI, Cards, Net Banking). Funds are held securely in platform escrow until the outing is successfully completed.',
    category: 'Booking',
  },
  {
    question: 'Can I cancel a booking and get a refund?',
    answer: 'Yes. Cancellations made 2+ hours prior to the session start time receive a full refund. Detailed refund guidelines can be viewed in our Cancellation Policy.',
    category: 'Booking',
  },
  {
    question: 'How can I register as a WithMe24 Partner?',
    answer: 'Click on "Become a Partner", verify your mobile OTP, complete your bio & activity services, set your hourly rates & schedule, and submit your government ID for verification.',
    category: 'Partner',
  },
  {
    question: 'When do partners receive payouts for completed sessions?',
    answer: 'Payouts are processed automatically into the partner’s registered bank account within 24–48 hours of session completion.',
    category: 'Partner',
  },
];

export const HelpFAQ: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const categories = ['All', 'General', 'Booking', 'Partner', 'Safety'];

  const filteredFaqs = faqsData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full text-brand-700 text-xs font-extrabold uppercase tracking-wider">
          <HelpCircle size={14} /> Help Center & Support Portal
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-600 font-medium">
          Have questions about WithMe24? Search our guide or browse categories below.
        </p>

        {/* Search Input */}
        <div className="relative max-w-md mx-auto pt-2">
          <Search size={18} className="absolute left-3.5 top-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions (e.g. safety, refund, verification)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === cat
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full text-left p-5 flex justify-between items-center gap-4 font-bold text-slate-800 text-sm sm:text-base hover:bg-slate-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-brand-50 text-brand-700 uppercase">
                    {faq.category}
                  </span>
                  {faq.question}
                </span>
                {openIdx === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {openIdx === idx && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50 font-medium">
                  {faq.answer}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl space-y-2">
            <p className="text-sm font-bold text-slate-700">No questions found matching your search</p>
            <p className="text-xs text-slate-500">Try searching for broader keywords like "safety", "refund", or "partner".</p>
          </div>
        )}
      </div>

      {/* Contact Support Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-bold text-base sm:text-lg">Still have questions or need assistance?</h3>
          <p className="text-xs text-slate-400 font-medium">Our 24/7 support team is here to help you anytime.</p>
        </div>
        <Link
          to="/safety"
          className="shrink-0 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <PhoneCall size={14} /> Contact 24/7 Support
        </Link>
      </div>
    </div>
  );
};
