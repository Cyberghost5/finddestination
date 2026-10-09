import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  Award, 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  ArrowLeft,
  PhoneCall,
  Mail,
  Building2,
  MapPin,
  Search
} from 'lucide-react';

export default function LegalPolicyPage({ 
  activePolicyKey = 'privacy', 
  onNavigateTab, 
  onClose,
  onSelectStateFilter,
  onOpenAuthModal
}) {
  const [currentTab, setCurrentTab] = useState(activePolicyKey);
  const [copiedType, setCopiedType] = useState(null); // 'text' or 'link'

  useEffect(() => {
    if (activePolicyKey) {
      setCurrentTab(activePolicyKey);
    }
  }, [activePolicyKey]);

  // Handle Hash URL changes
  const handleTabChange = (key) => {
    setCurrentTab(key);
    window.location.hash = key;
    if (onNavigateTab) onNavigateTab(key);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPolicyContent = (key) => {
    switch (key) {
      case 'refund':
        return {
          id: 'refund',
          title: 'FindDestination Escrow & Refund Policy',
          subtitle: '100% Guest Payment Protection Guarantee & Escrow Terms',
          updated: 'January 1, 2026',
          icon: Lock,
          badge: 'Escrow Refund Guarantee',
          hash: '#refund-policy',
          plainText: `FINDDESTINATION ESCROW & REFUND POLICY
Effective Date: January 1, 2026
Website: https://finddestination.com.ng

1. OVERVIEW & ESCROW GUARANTEE
Under the FindDestination Escrow Protection Guarantee, all guest payments (processed via Monnify or Paystack) are held in secure digital escrow by FindDestination (Tafiya Nigeria Ltd). Funds are never disbursed to the property host prior to successful check-in. Host payouts occur strictly 24 hours after guest arrival, ensuring complete protection for travelers across Bauchi, Kaduna, Kano, Plateau, Adamawa, Gombe, Zaria, and Sokoto.

2. FULL REFUND ELIGIBILITY (100% ESCROW REFUND)
A guest is entitled to a full 100% escrow refund under the following verified conditions:
a) Host Failure or Double Booking: The host fails to provide access to the reserved property or double-books the stay.
b) Listing Inaccuracy: The property condition, location, or essential amenities (24/7 power, water, security) are materially different from the listing on FindDestination.com.ng.
c) Unsafe Conditions: Physical safety concerns identified upon arrival that violate FindDestination Tier 3 verification standards.
d) Immediate Cancellation within Free Window: Guest cancels within the free cancellation window (up to 48 hours before check-in).

3. CANCELLATION WINDOWS & REFUND SCHEDULE
- More than 48 Hours Before Check-in: 100% Full Refund of total booking amount.
- Between 24 to 48 Hours Before Check-in: 50% Refund of total booking amount; remaining 50% released to host to cover preparation costs.
- Less than 24 Hours Before Check-in or No-Show: Non-refundable (except under verified host default, emergency policy, or listing fraud).

4. DISPUTE RESOLUTION & CLAIM TIMELINE
To request a refund or report a stay issue:
- Contact FindDestination Customer Support within 24 hours of scheduled check-in time via the in-app Booking Tracker or email disputes@finddestination.com.ng.
- Attach photo/video evidence if reporting listing inaccuracy.
- Approved refunds are credited back to the original payment source (Monnify/Paystack bank transfer or card) within 3 to 5 business days.

5. CONTACT FOR ESCROW DISPUTES
Email: disputes@finddestination.com.ng / support@finddestination.com.ng
Hotline: +234 800 FindDestination (0800 823492)`
        };

      case 'terms':
        return {
          id: 'terms',
          title: 'Terms of Service & Guest-Host Agreement',
          subtitle: 'Legal Terms, Marketplace Rules & Escrow Guidelines',
          updated: 'January 1, 2026',
          icon: FileText,
          badge: 'Terms & Conditions',
          hash: '#terms-and-conditions',
          plainText: `FINDDESTINATION TERMS OF SERVICE & GUEST-HOST AGREEMENT
Effective Date: January 1, 2026
Website: https://finddestination.com.ng

1. ACCEPTANCE OF TERMS
By accessing, registering, or booking shortlet accommodations on FindDestination.com.ng (operated by Tafiya Nigeria Ltd, CAC RC: 7890123), you agree to be bound by these Terms of Service, Privacy Policy, and Escrow Guarantee Rules.

2. ELIGIBILITY & USER ACCOUNT OBLIGATIONS
- Users must be at least 18 years of age to create an account, book a stay, or list a property.
- Users agree to provide accurate, truthful legal names matching government-issued identification documents.
- Users are responsible for maintaining the confidentiality of their account login credentials.

3. GUEST COMMUNITY CODE & RULES
- Guests agree to treat hosts, property staff, and community members with dignity, fairness, and respect regardless of ethnicity, state of origin, gender, or religion.
- Unregistered parties, unauthorized commercial events, and illegal activities are strictly prohibited on listed properties.
- Guests agree to adhere to checked property house rules (check-in times, smoking policies, noise limits).

4. HOST OBLIGATIONS & CAC LISTING STANDARDS
- Hosts warrant that they hold lawful title, leasehold right, or CAC enterprise registration to list the property.
- Hosts must comply with FindDestination's 4-Tier Verification System (CAC document check, 50-meter GPS field audit, and 24/7 power/water audit).
- Hosts agree not to demand or accept cash payments outside the FindDestination platform. Direct off-platform transactions void all host liability coverage and result in permanent account termination.

5. ESCROW PAYMENT & TRANSACTION FEES
- All financial transactions must be processed through FindDestination using integrated payment rails (Paystack / Monnify).
- FindDestination holds guest funds in escrow and releases host payouts 24 hours post check-in, minus applicable platform service fees.

6. LIMITATION OF LIABILITY & HOST COVER
- FindDestination provides property damage protection up to N5,000,000 under FindDestination Cover for eligible verified hosts.
- FindDestination's total liability for any claim arising out of a booking shall not exceed the total transaction amount paid for that booking.

7. GOVERNING LAW & JURISDICTION
These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.`
        };

      case 'host-policy':
        return {
          id: 'host-policy',
          title: 'FindDestination Host Partner & CAC Compliance Policy',
          subtitle: 'Verification Standards, Listing Guidelines & Host Cover Benefits',
          updated: 'January 1, 2026',
          icon: Award,
          badge: 'Host Partner Policy',
          hash: '#host-partner-policy',
          plainText: `FINDDESTINATION HOST PARTNER & CAC COMPLIANCE POLICY
Effective Date: January 1, 2026
Website: https://finddestination.com.ng

1. HOST PARTNERSHIP OVERVIEW
FindDestination connects verified property owners, hotel managers, and shortlet hosts across Northern Nigeria (Bauchi, Kaduna, Kano, Plateau, Adamawa, Gombe, Zaria, and Sokoto) with high-intent travelers, corporate teams, and NGO personnel.

2. MANDATORY 4-TIER VERIFICATION PROTOCOL
To maintain marketplace security and eliminate accommodation fraud, every host must pass FindDestination's verification protocol:
- Tier 1 (CAC & Legal Identity): Verification of host Government ID, Corporate Affairs Commission (CAC) Business Registration (RC/BN), and Tax Identification Number (TIN).
- Tier 2 (GPS Field Audit): Physical on-site inspection by regional FindDestination Field Agents verifying property GPS coordinates within a 50-meter radius.
- Tier 3 (Amenity Certification): Physical verification of 24/7 power backup (solar/inverter/generator), water supply, and security arrangements.
- Tier 4 (Gold Badge): Granted to top-tier properties passing 95%+ guest satisfaction and fast response audits.

3. PAYOUT SCHEDULE & ESCROW RULES
- Host payouts are dispatched automatically to verified host bank accounts 24 hours after guest check-in.
- Off-Platform Payment Prohibition: Hosts are strictly forbidden from requesting direct bank transfers or cash payments from guests. Off-platform transactions forfeit all Host Cover protections.

4. FINDDESTINATION HOST COVER (N5,000,000 PROTECTION)
Verified hosts in good standing qualify for FindDestination Cover providing up to N5,000,000 in property damage protection and host liability coverage for damages occurring during verified stays.

5. HOST DELISTING & PENALTIES
FindDestination reserves the right to suspend or permanently delist any host for listing inaccuracy, failure to maintain basic amenities, canceled reservations without 48-hour notice, or unprofessional conduct.`
        };

      case 'sitemap':
        return {
          id: 'sitemap',
          title: 'FindDestination Interactive Platform Sitemap',
          subtitle: 'Complete Web Directory & Regional Hub Navigation',
          updated: 'January 1, 2026',
          icon: Globe,
          badge: 'Platform Sitemap',
          hash: '#sitemap',
          plainText: `FINDDESTINATION PLATFORM SITEMAP & DIRECTORY
Website: https://finddestination.com.ng

1. PRIMARY APPLICATION PORTALS
- Traveler Explore Feed: https://finddestination.com.ng/#explore
- Host Dashboard & Property Manager: https://finddestination.com.ng/#host-dashboard
- Field Agent Inspection Desk: https://finddestination.com.ng/#agent-portal
- Super Admin Portal: https://finddestination.com.ng/#admin-portal
- User Profile & Account Settings: https://finddestination.com.ng/#profile

2. REGIONAL DESTINATION HUBS
- Bauchi State Stays (Yankari Game Reserve & Eco-Lodges): https://finddestination.com.ng/#bauchi
- Kaduna State Stays (Barnawa GRA, Malali & Business Apartments): https://finddestination.com.ng/#kaduna
- Kano State Stays (Commercial Capital & Historic Lodges): https://finddestination.com.ng/#kano
- Plateau State Stays (Jos Rayfield Cool Climate Villas): https://finddestination.com.ng/#plateau
- Adamawa State Stays (Yola Riverfront Stays): https://finddestination.com.ng/#adamawa
- Gombe State Stays (Modern City Lodges & Hotels): https://finddestination.com.ng/#gombe

3. LEGAL, POLICIES & SUPPORT DIRECTORY
- Privacy Policy: https://finddestination.com.ng/#privacy-policy
- Refund & Escrow Policy: https://finddestination.com.ng/#refund-policy
- Terms of Service: https://finddestination.com.ng/#terms-and-conditions
- Host Partner Policy: https://finddestination.com.ng/#host-partner-policy
- Order & Booking Tracker: https://finddestination.com.ng/#track-booking`
        };

      default: // 'privacy'
        return {
          id: 'privacy',
          title: 'FindDestination Privacy Policy & NDPR Compliance Notice',
          subtitle: 'Google Play Store & Nigeria Data Protection Regulation (NDPR) Compliant Data Notice',
          updated: 'January 1, 2026',
          icon: ShieldCheck,
          badge: 'Privacy Policy',
          hash: '#privacy-policy',
          plainText: `FINDDESTINATION PRIVACY POLICY & DATA PROTECTION NOTICE
Effective Date: January 1, 2026
Website: https://finddestination.com.ng
App Package Name: com.tafiya.finddestination

1. INTRODUCTION & REGULATORY SCOPE
FindDestination ("we", "us", or "our", operated by Tafiya Nigeria Ltd) is committed to protecting the privacy and security of user data. This Privacy Policy outlines how we collect, use, process, and disclose personal data when you use our mobile application and web portal (https://finddestination.com.ng) in compliance with the Nigeria Data Protection Regulation (NDPR) and Google Play Developer Policies.

2. DATA WE COLLECT
We collect personal information necessary to facilitate verified shortlet bookings and property listings:
a) Account Information: Full name, legal name, date of birth, email address, phone number, profile photo.
b) Host Verification Data: Government-issued ID, Corporate Affairs Commission (CAC) business registration numbers (RC/BN), Tax Identification Numbers (TIN).
c) Location Data: Precise device GPS coordinates collected during property field audits to verify physical location within a 50-meter radius.
d) Payment & Transaction Information: Encrypted transaction tokens via Monnify and Paystack payment gateways. We do not store raw credit card numbers.
e) Technical & Usage Data: IP address, device model, operating system version, app crash logs.

3. HOW WE USE YOUR INFORMATION
- Processing and securing accommodation reservations.
- Verifying host identity and conducting physical property GPS location audits.
- Holding funds safely in digital escrow and disbursing payouts 24 hours after check-in.
- Sending trip confirmations, receipts, SMS booking alerts, and customer support responses.
- Detecting, preventing, and investigating fraud or unauthorized transactions.

4. DATA SHARING & THIRD PARTIES
We do not sell user personal data. We share data only under strictly governed conditions:
- Payment Processors: Monnify (TeamApt) and Paystack (Stripe) for processing secure escrow payments.
- Legal & Regulatory Authorities: When required by law or to enforce our Terms of Service and CAC compliance.

5. LOCATION DATA & BACKGROUND ACCESS
FindDestination requests location permissions strictly to log property coordinates during physical field agent audits. Location access is transparent, prompt-based, and used solely for property verification within 50 meters.

6. DATA RETENTION, SECURITY & USER RIGHTS
- All data is encrypted in transit (TLS 1.3/SSL) and at rest (AES-256).
- Users have the right to request access to, correction of, or permanent deletion of their account data by contacting privacy@finddestination.com.ng.

7. CONTACT DATA PROTECTION OFFICER
Email: privacy@finddestination.com.ng / support@finddestination.com.ng
Hotline: +234 800 FindDestination (0800 823492)`
        };
    }
  };

  const currentPolicy = getPolicyContent(currentTab);
  const IconComponent = currentPolicy.icon;

  const handleCopyText = () => {
    navigator.clipboard.writeText(currentPolicy.plainText);
    setCopiedType('text');
    setTimeout(() => setCopiedType(null), 3000);
  };

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}${window.location.pathname}${currentPolicy.hash}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedType('link');
    setTimeout(() => setCopiedType(null), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300 min-h-screen">
      
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-tafiya-blue to-tafiya-orange flex items-center justify-center text-white shrink-0 shadow-md">
            <IconComponent className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-white">{currentPolicy.title}</h1>
              <span className="text-[10px] font-extrabold uppercase bg-tafiya-blue/30 text-tafiya-gold px-2.5 py-0.5 rounded-full border border-tafiya-gold/30">
                {currentPolicy.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{currentPolicy.subtitle}</p>
          </div>
        </div>

        {/* Copy Actions for Play Store Submission */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Copy public URL for Google Play Console"
          >
            {copiedType === 'link' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ExternalLink className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedType === 'link' ? 'Link Copied!' : 'Copy Page Link'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="px-4 py-2 bg-tafiya-blue hover:bg-tafiya-blue-600 text-white rounded-xl font-bold text-xs shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Copy full policy text for Play Store / App Store legal submission"
          >
            {copiedType === 'text' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
            <span>{copiedType === 'text' ? 'Text Copied!' : 'Copy Policy Text'}</span>
          </button>
        </div>
      </div>

      {/* Policy Navigation Tabs Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto no-scrollbar">
        {[
          { key: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
          { key: 'refund', label: 'Refund Policy', icon: Lock },
          { key: 'terms', label: 'Terms & Conditions', icon: FileText },
          { key: 'host-policy', label: 'Host Partner Policy', icon: Award },
          { key: 'sitemap', label: 'Sitemap & Directory', icon: Globe }
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <TabIcon className={`w-4 h-4 ${isActive ? 'text-tafiya-gold' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {copiedType && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {copiedType === 'text' 
              ? 'Full policy text copied to clipboard! Ready to paste into Google Play Console.' 
              : 'Direct policy URL copied to clipboard! Available for public web access.'}
          </span>
        </div>
      )}

      {/* Main Copyable Prose View Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-8 select-text">
        
        {/* Document Metadata Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 text-xs text-slate-500">
          <div>
            <span className="font-bold text-slate-900">Official Document:</span> {currentPolicy.title}
          </div>
          <div>
            <span className="font-bold text-slate-900">Last Revised:</span> {currentPolicy.updated}
          </div>
        </div>

        {/* Formatted Legal Text */}
        <div className="prose prose-slate max-w-none space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {currentTab === 'sitemap' ? (
            <div className="space-y-6 select-text">
              <p className="text-slate-600 leading-relaxed font-medium">
                Explore the complete directory of Stay Portals, Northern Nigeria State Hubs, and Legal Verification Documents for FindDestination.com.ng:
              </p>

              {/* State Hubs Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">1. Regional Accommodation State Hubs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { name: 'Bauchi', desc: 'Yankari Game Reserve & Thermal Springs Stays', count: '142 stays' },
                    { name: 'Kaduna', desc: 'Barnawa GRA & Business Serviced Apartments', count: '215 stays' },
                    { name: 'Kano', desc: 'Commercial Capital & Historic Ancient Wall Lodges', count: '310 stays' },
                    { name: 'Plateau', desc: 'Jos Rayfield Cool Climate Villas & Resorts', count: '188 stays' },
                    { name: 'Adamawa', desc: 'Yola Jimeta Riverfront Stays', count: '95 stays' },
                    { name: 'Gombe', desc: 'Tumfure Modern City Lodges & Hotels', count: '76 stays' }
                  ].map((s) => (
                    <button
                      key={s.name}
                      onClick={() => onSelectStateFilter && onSelectStateFilter(s.name)}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-tafiya-blue hover:bg-tafiya-blue-50/50 text-left transition-all cursor-pointer space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs group-hover:text-tafiya-blue">{s.name} Stays</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{s.count}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform Modules */}
              <div className="space-y-3 pt-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">2. System Application Modules</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <h4 className="font-bold text-slate-900 text-xs">Host Registration & CAC Verification Desk</h4>
                    <p className="text-[11px] text-slate-500">Level 1 document checks & Level 2 agent 50m GPS audit clearance.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <h4 className="font-bold text-slate-900 text-xs">Escrow Refund & Booking Tracker</h4>
                    <p className="text-[11px] text-slate-500">Lookup real-time stay status using your 8-character booking reference.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-line font-mono text-slate-800 bg-slate-50/70 p-6 sm:p-8 rounded-2xl border border-slate-200 text-xs leading-relaxed overflow-x-auto select-text">
              {currentPolicy.plainText}
            </div>
          )}
        </div>

        {/* Footer Support Info */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <PhoneCall className="w-3.5 h-3.5 text-tafiya-blue" />
              <span>+234 800 823492</span>
            </span>
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <Mail className="w-3.5 h-3.5 text-tafiya-orange" />
              <span>legal@finddestination.com.ng</span>
            </span>
          </div>
          <p className="text-[11px]">FindDestination.com.ng • CAC RC: 7890123</p>
        </div>

      </div>

    </div>
  );
}
