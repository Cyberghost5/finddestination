import React from 'react';
import { X, ShieldCheck, Lock, HelpCircle, Building2, CheckCircle2, Award, FileText, PhoneCall, Mail, Globe, MapPin, Sparkles } from 'lucide-react';

export default function InfoModal({ isOpen, onClose, topicKey, onOpenAuthModal, onSelectStateFilter }) {
  if (!isOpen) return null;

  const contentMap = {
    help: {
      title: "Tafiya Help Center & Support",
      icon: HelpCircle,
      badge: "24/7 Customer Support",
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Need help with your stay booking or property listing? Our dedicated Northern Nigeria support team is available 24/7.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <PhoneCall className="w-5 h-5 text-tafiya-blue mb-1" />
              <h4 className="text-xs font-bold text-slate-900">Phone Support Hotline</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">+234 800 TAFIYA (0800 823492)</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <Mail className="w-5 h-5 text-tafiya-orange mb-1" />
              <h4 className="text-xs font-bold text-slate-900">Email Assistance</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">support@tafiya.ng</p>
            </div>
          </div>
          <div className="p-4 bg-tafiya-blue-50/60 rounded-2xl border border-tafiya-blue-100 text-xs space-y-2">
            <h4 className="font-extrabold text-tafiya-blue">Frequently Asked Questions</h4>
            <ul className="space-y-1.5 text-slate-700 list-disc pl-4 text-[11px]">
              <li><strong>How does Tafiya Escrow work?</strong> Your payment is held securely in escrow and only released to the host 24 hours after check-in.</li>
              <li><strong>What if a property does not match its listing?</strong> Contact support within 24 hours of arrival for an immediate replacement stay or full refund.</li>
            </ul>
          </div>
        </div>
      )
    },
    verification: {
      title: "Tafiya 4-Tier Verification System",
      icon: ShieldCheck,
      badge: "Marketplace Security Protocol",
      content: (
        <div className="space-y-4 text-xs text-slate-600">
          <p className="leading-relaxed">
            To eliminate fake listings and ensure guest safety, every stay on Tafiya passes through our rigorous 4-tier verification protocol:
          </p>
          <div className="space-y-2.5">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
              <span className="px-2 py-0.5 bg-slate-200 text-slate-800 font-bold rounded-lg text-[10px] shrink-0 mt-0.5">Tier 1</span>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">CAC & Document Verification</h4>
                <p className="text-[11px] text-slate-500">Host legal identity documents and Corporate Affairs Commission (CAC) business registry check.</p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
              <span className="px-2 py-0.5 bg-tafiya-blue-50 text-tafiya-blue font-bold rounded-lg text-[10px] shrink-0 mt-0.5">Tier 2</span>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Field Agent GPS Location Clearance</h4>
                <p className="text-[11px] text-slate-500">On-site device GPS coordinate verification within 50-meter radius by regional Tafiya Field Agents.</p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
              <span className="px-2 py-0.5 bg-tafiya-orange-50 text-tafiya-orange font-bold rounded-lg text-[10px] shrink-0 mt-0.5">Tier 3</span>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Tafiya Certified Gold Badge</h4>
                <p className="text-[11px] text-slate-500">Physical inspection passing 24/7 power audit (solar/inverter/generator), water supply, and security verification.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    safety: {
      title: "Guest Safety Guidelines",
      icon: ShieldCheck,
      badge: "Peace of Mind",
      content: (
        <div className="space-y-3 text-xs text-slate-600">
          <p className="leading-relaxed">
            Your safety in Northern Nigeria is our top priority. We implement strict safety standards across Bauchi, Kaduna, Kano, Plateau, Adamawa, and Gombe:
          </p>
          <ul className="space-y-2 list-disc pl-4 text-[11px] text-slate-700">
            <li><strong>Verified Host Contacts:</strong> Only communicate and pay through the Tafiya platform. Never send funds directly to personal bank accounts.</li>
            <li><strong>24/7 Armed Guarded Properties:</strong> Look for the "Armed Security" amenity badge on listed villas and hotels.</li>
            <li><strong>Emergency Hotline:</strong> Immediate escalation team available for guests during their stay.</li>
          </ul>
        </div>
      )
    },
    "anti-scam": {
      title: "Anti-Scam & Fraud Protection",
      icon: Lock,
      badge: "Zero Fraud Guarantee",
      content: (
        <div className="space-y-3 text-xs text-slate-600">
          <p className="leading-relaxed">
            Tafiya eliminates accommodation scams through digital escrow holding and verified physical property badges.
          </p>
          <div className="p-3.5 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200 text-xs space-y-1">
            <h4 className="font-extrabold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              100% Escrow Protection Active
            </h4>
            <p className="text-[11px] text-emerald-800">
              Funds are never paid to the host prior to your arrival. If a listing is fake or inaccessible, your money is refunded automatically.
            </p>
          </div>
        </div>
      )
    },
    escrow: {
      title: "Tafiya Escrow Refund Policy",
      icon: Lock,
      badge: "Payment Protection",
      content: (
        <div className="space-y-3 text-xs text-slate-600">
          <p className="leading-relaxed">
            Under the Tafiya Escrow Guarantee, guest payments (processed via Monnify or Paystack) are held in secure escrow.
          </p>
          <ul className="space-y-1.5 text-[11px] text-slate-700 list-disc pl-4">
            <li><strong>Full Refund:</strong> Granted if check-in fails or property is materially different from listing.</li>
            <li><strong>24-Hour Hold Window:</strong> Payouts to hosts occur only after 24 hours of successful guest check-in.</li>
          </ul>
        </div>
      )
    },
    "host-cover": {
      title: "Tafiya Cover for Hosts",
      icon: Award,
      badge: "Host Protection Program",
      content: (
        <div className="space-y-3 text-xs text-slate-600">
          <p className="leading-relaxed">
            Tafiya Cover provides up to ₦5,000,000 in property damage protection and host liability insurance for verified property owners in Northern Nigeria.
          </p>
          <button
            onClick={() => { onClose(); onOpenAuthModal && onOpenAuthModal('signup'); }}
            className="w-full py-3 bg-tafiya-blue text-white font-bold text-xs rounded-xl shadow hover:bg-tafiya-blue-600 transition-colors"
          >
            Register as a Host
          </button>
        </div>
      )
    },
    about: {
      title: "About Tafiya.ng Marketplace",
      icon: Building2,
      badge: "Northern Nigeria Accommodation Portal",
      content: (
        <div className="space-y-3 text-xs text-slate-600">
          <p className="leading-relaxed">
            Tafiya.ng is Northern Nigeria's premier digital accommodation marketplace connecting travelers, NGO teams, and corporate personnel with verified hotels, serviced apartments, resorts, and guest houses.
          </p>
          <p className="leading-relaxed text-[11px] text-slate-500">
            Registered with the Corporate Affairs Commission (CAC RC: 7890123), Tafiya operates across Bauchi, Kaduna, Kano, Plateau (Jos), Adamawa (Yola), Gombe, Zaria, and Sokoto.
          </p>
        </div>
      )
    },
    terms: {
      title: "Terms of Service & Rules",
      icon: FileText,
      badge: "Legal Policy",
      content: (
        <div className="space-y-3 text-xs text-slate-600 max-h-60 overflow-y-auto pr-2">
          <h4 className="font-bold text-slate-900 text-xs">1. Marketplace Agreement</h4>
          <p className="text-[11px] text-slate-500">By accessing Tafiya.ng, guests and hosts agree to abide by our regional verification rules, escrow hold terms, and house policies.</p>
          <h4 className="font-bold text-slate-900 text-xs">2. Cancellation Policy</h4>
          <p className="text-[11px] text-slate-500">Free cancellation up to 48 hours prior to check-in for full escrow refund.</p>
        </div>
      )
    },
    privacy: {
      title: "Privacy Policy & NDPR Compliance",
      icon: FileText,
      badge: "Data Privacy",
      content: (
        <div className="space-y-3 text-xs text-slate-600">
          <p className="leading-relaxed">
            Tafiya complies strictly with the Nigeria Data Protection Regulation (NDPR). Your personal data, phone numbers, and payment details are encrypted and protected.
          </p>
        </div>
      )
    },
    sitemap: {
      title: "Tafiya Platform Sitemap",
      icon: Globe,
      badge: "Navigation Directory",
      content: (
        <div className="space-y-3 text-xs">
          <p className="text-slate-500 text-[11px]">Explore popular stay categories and regional hubs across Northern Nigeria:</p>
          <div className="grid grid-cols-2 gap-2">
            {['Bauchi', 'Kaduna', 'Kano', 'Plateau', 'Adamawa', 'Gombe'].map((stateName) => (
              <button
                key={stateName}
                onClick={() => {
                  onClose();
                  if (onSelectStateFilter) onSelectStateFilter(stateName);
                }}
                className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-left font-bold text-slate-800 hover:border-tafiya-blue hover:text-tafiya-blue transition-colors flex items-center justify-between"
              >
                <span>{stateName} Stays</span>
                <MapPin className="w-3.5 h-3.5 text-tafiya-blue" />
              </button>
            ))}
          </div>
        </div>
      )
    }
  };

  const currentTopic = contentMap[topicKey] || {
    title: "Tafiya Information & Policy",
    icon: Sparkles,
    badge: "Official Information",
    content: (
      <div className="space-y-3 text-xs text-slate-600">
        <p className="leading-relaxed">
          Welcome to Tafiya.ng — Northern Nigeria's trusted digital accommodation marketplace.
        </p>
      </div>
    )
  };

  const IconComponent = currentTopic.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-tafiya-blue-50 border border-tafiya-blue-100 flex items-center justify-center text-tafiya-blue shrink-0">
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">{currentTopic.title}</h3>
              <span className="text-[10px] text-tafiya-blue font-bold uppercase">{currentTopic.badge}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {currentTopic.content}
        </div>

        {/* Footer Close */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-full shadow hover:bg-black transition-colors"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}
