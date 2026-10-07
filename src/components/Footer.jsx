import React, { useState } from 'react';
import {
  ShieldCheck,
  Globe,
  Building2,
  Lock,
  HelpCircle,
  Heart,
  Sparkles,
  MapPin,
  CheckCircle2,
  PhoneCall,
  Mail,
  ArrowUpRight,
  CreditCard,
  Award
} from 'lucide-react';

export default function Footer({ onOpenAuthModal, onOpenInfoTopic, onSelectDestinationState }) {
  const [activeTab, setActiveTab] = useState('destinations');

  const destinationCategories = {
    destinations: [
      { city: 'Bauchi', label: 'Bauchi Stays', desc: 'Yankari Reserve & Thermal Springs', count: '142 verified stays' },
      { city: 'Kaduna', label: 'Kaduna GRA', desc: 'Barnawa & Malali Executive Apartments', count: '215 verified stays' },
      { city: 'Kano', label: 'Kano Central', desc: 'Ancient City Lodges & Sabon Gari Hotels', count: '310 verified stays' },
      { city: 'Plateau', label: 'Plateau (Jos)', desc: 'Rayfield Cool Climate Resorts & Villas', count: '188 verified stays' },
      { city: 'Adamawa', label: 'Adamawa (Yola)', desc: 'Jimeta Riverfront Lodges & Suites', count: '95 verified stays' },
      { city: 'Gombe', label: 'Gombe Jewel', desc: 'Tumfure Business Hotels & Serviced Apartments', count: '76 verified stays' },
      { city: 'Kaduna', label: 'Zaria Historic', desc: 'Samaru University Lodges & Serviced Suites', count: '64 verified stays' },
      { city: 'Kano', label: 'Sokoto Heritage', desc: 'Caliphate Guest Houses & Executive Inns', count: '82 verified stays' }
    ],
    cultural: [
      { city: 'Kano', label: 'Kano Ancient Wall', desc: 'Historic Hausa Architecture Lodges', count: '28 stays' },
      { city: 'Bauchi', label: 'Emir Palace Bauchi', desc: 'Heritage Courtyard Suites', count: '19 stays' },
      { city: 'Plateau', label: 'Jos Wildlife Resort', desc: 'Mountain Cabins & Eco-Lodges', count: '45 stays' },
      { city: 'Kano', label: 'Katsina Gobarau', desc: 'Traditional Clay Wall Villas', count: '14 stays' }
    ],
    business: [
      { city: 'Kaduna', label: 'Kaduna Commercial GRA', desc: 'Corporate NGO & Business Suites', count: '120 stays' },
      { city: 'Kano', label: 'Kano Commercial Hub', desc: 'Sabon Gari Trade Center Hotels', count: '150 stays' },
      { city: 'Gombe', label: 'Gombe City Center', desc: 'Modern Serviced Apartments', count: '55 stays' },
      { city: 'Kaduna', label: 'Minna Executive', desc: 'Government Quarter Serviced Villas', count: '38 stays' }
    ]
  };

  const handleDestinationClick = (e, cityName) => {
    e.preventDefault();
    if (onSelectDestinationState) {
      onSelectDestinationState(cityName);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleInfoClick = (e, topicKey) => {
    e.preventDefault();
    if (onOpenInfoTopic) {
      onOpenInfoTopic(topicKey);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-16 md:pb-8 mt-16 text-xs font-medium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Top Brand Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-tafiya-dark rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="relative overflow-hidden rounded-2xl border border-slate-700 p-1.5 bg-white shadow-md shrink-0">
              <img src="/logo.jpeg" alt="FindDestination.com.ng" className="w-12 h-12 object-contain rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-white">FindDestination<span className="text-tafiya-orange">.com.ng</span></span>
                <span className="px-2.5 py-0.5 rounded-full bg-tafiya-blue/20 text-tafiya-blue text-[10px] font-bold border border-tafiya-blue/30">
                  Northern Nigeria Marketplace
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1 max-w-xl">
                The trusted digital accommodation portal for Northern Nigeria. Verified property documents, on-site GPS agent audits, and 100% escrow backed payment security.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal('signup')}
              className="px-5 py-2.5 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 text-white rounded-2xl font-bold text-xs shadow-md hover:shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>List Your Property</span>
            </button>
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
            >
              Log In
            </button>
          </div>
        </div>

        {/* Section 1: Inspiration for Future Trips (Airbnb Style Tabs) */}
        <div className="border-b border-slate-800 pb-10">
          <h3 className="text-sm font-extrabold text-white mb-4">Inspiration for stays across Northern Nigeria</h3>

          {/* Navigation Category Tabs */}
          <div className="flex items-center gap-6 border-b border-slate-800 pb-3 mb-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('destinations')}
              className={`pb-3 text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer ${activeTab === 'destinations' ? 'text-tafiya-orange' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Popular Destinations
              {activeTab === 'destinations' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-tafiya-orange rounded-full"></span>}
            </button>
            <button
              onClick={() => setActiveTab('cultural')}
              className={`pb-3 text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer ${activeTab === 'cultural' ? 'text-tafiya-orange' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Cultural & Heritage Stays
              {activeTab === 'cultural' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-tafiya-orange rounded-full"></span>}
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`pb-3 text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer ${activeTab === 'business' ? 'text-tafiya-orange' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Corporate & NGO Hubs
              {activeTab === 'business' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-tafiya-orange rounded-full"></span>}
            </button>
          </div>

          {/* Destinations Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {destinationCategories[activeTab].map((item, idx) => (
              <button
                key={idx}
                onClick={(e) => handleDestinationClick(e, item.city)}
                className="group p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors text-left border border-transparent hover:border-slate-800 cursor-pointer"
              >
                <span className="font-bold text-slate-200 group-hover:text-tafiya-blue transition-colors block text-xs">
                  {item.label}
                </span>
                <span className="text-[11px] text-slate-500 block truncate">{item.desc}</span>
                <span className="text-[10px] text-tafiya-orange font-bold mt-1 block">{item.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: 4-Column Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 border-b border-slate-800 pb-12">

          {/* Column 1: Support & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Support & Verification</h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li><button onClick={(e) => handleInfoClick(e, 'help')} className="hover:text-white transition-colors cursor-pointer text-left">FindDestination Help Center</button></li>
              <li><button onClick={(e) => handleInfoClick(e, 'verification')} className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"><ShieldCheck className="w-3.5 h-3.5 text-tafiya-blue" /> 4-Tier Verification System</button></li>
              <li><button onClick={(e) => handleInfoClick(e, 'safety')} className="hover:text-white transition-colors cursor-pointer text-left">Guest Safety Guidelines</button></li>
              <li><button onClick={(e) => handleInfoClick(e, 'anti-scam')} className="hover:text-white transition-colors cursor-pointer text-left">Anti-Scam Guarantee</button></li>
              <li><button onClick={(e) => handleInfoClick(e, 'escrow')} className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"><Lock className="w-3.5 h-3.5 text-tafiya-orange" /> Escrow Refund Policy</button></li>
              <li><button onClick={(e) => handleInfoClick(e, 'verification')} className="hover:text-white transition-colors cursor-pointer text-left">Field Agent GPS Audits</button></li>
            </ul>
          </div>

          {/* Column 2: Hosting & Property Managers */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Hosting on FindDestination</h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li><button onClick={() => onOpenAuthModal && onOpenAuthModal('signup')} className="hover:text-white transition-colors text-left cursor-pointer">List Your Property</button></li>
              <li><button onClick={(e) => handleInfoClick(e, 'host-cover')} className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"><Award className="w-3.5 h-3.5 text-tafiya-gold" /> FindDestination Cover for Hosts</button></li>
              <li><button onClick={(e) => handleInfoClick(e, 'help')} className="hover:text-white transition-colors cursor-pointer text-left">Host Resource Center</button></li>
              <li><button onClick={(e) => handleInfoClick(e, 'verification')} className="hover:text-white transition-colors cursor-pointer text-left">CAC Document Verification</button></li>
              <li><button onClick={(e) => handleInfoClick(e, 'escrow')} className="hover:text-white transition-colors cursor-pointer text-left">Commission & Escrow Payouts</button></li>
              <li><button onClick={(e) => handleInfoClick(e, 'about')} className="hover:text-white transition-colors cursor-pointer text-left">Northern Host Community</button></li>
            </ul>
          </div>

          {/* Column 3: FindDestination Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">FindDestination Marketplace</h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li><button onClick={(e) => handleInfoClick(e, 'about')} className="hover:text-white transition-colors cursor-pointer text-left">About FindDestination.com.ng</button></li>
              <li><button onClick={(e) => handleInfoClick(e, 'about')} className="hover:text-white transition-colors cursor-pointer text-left">Northern Cultural Heritage Stays</button></li>
              <li><button onClick={(e) => handleInfoClick(e, 'about')} className="hover:text-white transition-colors cursor-pointer text-left">Newsroom & Press Releases</button></li>
              <li><button onClick={(e) => handleInfoClick(e, 'help')} className="hover:text-white transition-colors cursor-pointer text-left">Careers at FindDestination</button></li>
              <li><button onClick={(e) => handleInfoClick(e, 'about')} className="hover:text-white transition-colors cursor-pointer text-left">Investor Relations</button></li>
              <li><button onClick={(e) => handleInfoClick(e, 'terms')} className="hover:text-white transition-colors cursor-pointer text-left">Terms of Service & Rules</button></li>
            </ul>
          </div>

          {/* Column 4: Payment Rails & Trust Badges */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Payments & Escrow Security</h4>
            <p className="text-[11px] text-slate-400">
              All bookings are held in secure escrow. Payments are only released to hosts 24 hours after verified guest check-in.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-tafiya-blue shrink-0" />
                <div>
                  <span className="text-[11px] font-bold text-white block">Paystack Payment Rail</span>
                  <span className="text-[10px] text-slate-400">Debit Cards, USSD & Visa/Mastercard</span>
                </div>
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-3">
                <Building2 className="w-5 h-5 text-tafiya-orange shrink-0" />
                <div>
                  <span className="text-[11px] font-bold text-white block">Monnify Bank Transfer</span>
                  <span className="text-[10px] text-slate-400">Instant Nigerian Virtual Bank Accounts</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Section 3: Bottom Legal & Currency Bar (Airbnb Style) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2 text-slate-400 text-xs">

          {/* Left Legal Info */}
          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
            <span>© 2026 FindDestination.com.ng, Inc.</span>
            <span>•</span>
            <button onClick={(e) => handleInfoClick(e, 'privacy')} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
            <span>•</span>
            <button onClick={(e) => handleInfoClick(e, 'terms')} className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</button>
            <span>•</span>
            <button onClick={(e) => handleInfoClick(e, 'sitemap')} className="hover:text-white transition-colors cursor-pointer">Sitemap</button>
            <span>•</span>
            <span className="text-slate-500 font-mono">CAC RC: 7890123</span>
          </div>

          {/* Right Language, Currency & Security */}
          <div className="flex items-center gap-4 shrink-0">
            <button className="flex items-center gap-1.5 hover:text-white transition-colors font-bold cursor-pointer">
              <Globe className="w-4 h-4 text-slate-300" />
              <span>English (NG)</span>
            </button>

            <button className="flex items-center gap-1 hover:text-white transition-colors font-bold cursor-pointer">
              <span className="text-tafiya-orange">₦</span>
              <span>NGN</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-800"></div>

            <button
              onClick={(e) => handleInfoClick(e, 'escrow')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-[10px] font-bold cursor-pointer hover:bg-emerald-900 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Escrow</span>
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
}
