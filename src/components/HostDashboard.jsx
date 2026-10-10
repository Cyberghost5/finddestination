import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  DollarSign, 
  Users, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Eye, 
  Edit, 
  Check, 
  Lock,
  MapPin,
  AlertTriangle,
  FileText,
  ShieldAlert,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

export default function HostDashboard({ currentUser, properties, onOpenWizard, onTogglePublish, onOpenChat, onNavigateInbox }) {
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' or 'reservations'
  const [payoutRequested, setPayoutRequested] = useState(false);

  const hostStatus = currentUser?.host_status || 'approved'; // 'pending_approval', 'approved', 'rejected'
  const isPendingApproval = hostStatus === 'pending_approval';
  const isRejected = hostStatus === 'rejected';
  const isApproved = hostStatus === 'approved';

  // Strict Host Isolation: The host should ONLY and ONLY see properties managed by him
  const managedProperties = useMemo(() => {
    if (!currentUser || !Array.isArray(properties)) return [];

    const currentUserId = currentUser.id ? Number(currentUser.id) : null;
    const currentEmail = currentUser.email ? currentUser.email.toLowerCase().trim() : '';
    const currentName = currentUser.name ? currentUser.name.toLowerCase().trim() : '';
    const currentBusiness = currentUser.business_name ? currentUser.business_name.toLowerCase().trim() : '';

    return properties.filter((prop) => {
      // 1. Direct host_id numeric match
      if (currentUserId && prop.host_id && Number(prop.host_id) === currentUserId) {
        return true;
      }
      // 2. Nested prop.host?.id numeric match
      if (currentUserId && prop.host?.id && Number(prop.host.id) === currentUserId) {
        return true;
      }
      // 3. Host email match
      if (currentEmail && prop.host?.email && prop.host.email.toLowerCase().trim() === currentEmail) {
        return true;
      }
      // 4. Host corporate business name match
      if (currentBusiness) {
        const propHostBiz = (prop.host?.business_name || '').toLowerCase().trim();
        const propBiz = (prop.business_name || '').toLowerCase().trim();
        if (propHostBiz && propHostBiz === currentBusiness) return true;
        if (propBiz && propBiz === currentBusiness) return true;
      }
      // 5. Host applicant name match
      if (currentName && prop.host?.name) {
        const propHostName = prop.host.name.toLowerCase().trim();
        if (propHostName && propHostName === currentName) return true;
      }

      return false;
    });
  }, [properties, currentUser]);

  const mockReservations = [
    {
      id: 'RES-8910',
      guestName: 'Musa Danjuma',
      property: 'Yankari Safari & Luxury Suites',
      room: 'Executive Royal Suite',
      dates: '1 Nov - 3 Nov 2026',
      amount: '₦90,000',
      payoutStatus: 'Escrow Held',
      rail: 'Monnify Transfer'
    },
    {
      id: 'RES-8911',
      guestName: 'Hajia Zainab Kabir',
      property: 'Barnawa Crest Serviced Apartments',
      room: '2-Bedroom Executive Flat',
      dates: '5 Nov - 8 Nov 2026',
      amount: '₦114,000',
      payoutStatus: 'Escrow Held',
      rail: 'Paystack Card'
    }
  ];

  // Scoped Reservations: Only reservations for this host's managed listings
  const hostReservations = useMemo(() => {
    if (!managedProperties || managedProperties.length === 0) return [];
    const managedPropertyNames = managedProperties.map(p => (p.name || '').toLowerCase());
    return mockReservations.filter(res => 
      managedPropertyNames.includes((res.property || '').toLowerCase())
    );
  }, [managedProperties]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      
      {/* Host Portal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-tafiya-blue to-tafiya-orange flex items-center justify-center text-white font-extrabold text-xl shadow-md shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'H'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black">{currentUser?.name || 'Property Host'}</h1>
              {isApproved && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Approved Host
                </span>
              )}
              {isPendingApproval && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Level 1 CAC Pending Approval
                </span>
              )}
              {isRejected && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> CAC Audit Rejected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-tafiya-orange" />
              <span>{currentUser?.business_name || 'Enterprise Managed Properties'}</span>
              {currentUser?.cac_number && (
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  CAC: {currentUser.cac_number}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateInbox && onNavigateInbox()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            title="Open messages and communications with booked guests and support"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Guest Messages</span>
          </button>

          <button
            onClick={() => setPayoutRequested(true)}
            disabled={!isApproved}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-full text-xs font-bold border border-slate-700 transition-colors"
          >
            <DollarSign className="w-4 h-4 text-tafiya-gold" />
            <span>{payoutRequested ? 'Payout Triggered' : 'Payout Settings'}</span>
          </button>

          <button
            onClick={() => isApproved && onOpenWizard && onOpenWizard()}
            disabled={!isApproved}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isApproved
                ? 'bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 text-white shadow-lg hover:shadow-tafiya-blue/30 hover:scale-105 active:scale-95'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
            }`}
            title={!isApproved ? 'Host approval required prior to listing properties' : ''}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isApproved ? 'List New Property' : 'List Property (Locked)'}</span>
          </button>
        </div>
      </div>

      {/* LEVEL 1 CAC PENDING APPROVAL LOCK CARD */}
      {isPendingApproval && (
        <div className="p-6 bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-slate-900 border border-amber-500/30 rounded-3xl shadow-xl text-white space-y-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1 flex-1">
              <h2 className="text-base font-extrabold text-amber-200 flex items-center gap-2">
                <span>Level 1 Verification Pending: CAC & Business Document Audit</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold uppercase">
                  Under Admin Review
                </span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                Your host registration for <strong className="text-white">{currentUser?.business_name || 'your enterprise'}</strong> (CAC Reg: <code className="text-amber-300 font-mono">{currentUser?.cac_number || 'Pending'}</code>) was successfully submitted. Our Super Admin compliance team is currently auditing your corporate credentials. You will receive email verification as soon as your account is activated.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-950/60 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Step 1</span>
                <span className="text-xs font-extrabold text-white">Email Code Verified</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 border border-amber-500/50 rounded-2xl flex items-center gap-3 shadow-md">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 block">Step 2 (In Progress)</span>
                <span className="text-xs font-extrabold text-amber-200">Admin CAC & TIN Audit</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-2xl flex items-center gap-3 opacity-60">
              <Lock className="w-5 h-5 text-slate-500 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Step 3</span>
                <span className="text-xs font-extrabold text-slate-400">Upload & Publish Properties</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL 1 REJECTED CARD */}
      {isRejected && (
        <div className="p-6 bg-red-950/40 border border-red-500/40 rounded-3xl text-white space-y-3 animate-in fade-in duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-red-200">Level 1 Application Rejected</h2>
              <p className="text-xs text-red-300">
                Reason: <strong className="text-white">{currentUser?.rejection_reason || 'Incomplete CAC documentation or mismatched corporate registration.'}</strong>
              </p>
              <p className="text-xs text-slate-300 pt-1">
                Please contact support at <a href="mailto:support@tafiya.com.ng" className="underline text-tafiya-orange font-bold">support@finddestination.com.ng</a> to resubmit valid CAC documents.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Available Escrow Earnings */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Available Balance</span>
          <div className="text-2xl font-black text-slate-900">{isApproved && managedProperties.length > 0 ? `₦${(managedProperties.length * 75000 + 150000).toLocaleString()}` : '₦0'}</div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <Lock className="w-3 h-3" /> Escrow Protected
          </span>
        </div>

        {/* Occupancy Rate */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Average Occupancy</span>
          <div className="text-2xl font-black text-tafiya-blue">{isApproved && managedProperties.length > 0 ? '84%' : '0%'}</div>
          <span className="text-[11px] font-medium text-slate-500">{managedProperties.length > 0 ? `Across ${managedProperties.length} managed unit${managedProperties.length === 1 ? '' : 's'}` : 'No active units'}</span>
        </div>

        {/* Active Reservations */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Monthly Bookings</span>
          <div className="text-2xl font-black text-tafiya-orange">{isApproved && managedProperties.length > 0 ? `${managedProperties.length * 3} Stays` : '0 Stays'}</div>
          <span className="text-[11px] font-medium text-slate-500">Northern Nigeria Region</span>
        </div>

        {/* Verification Status */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Verification Level</span>
          <div className="text-base font-extrabold flex items-center gap-1.5 pt-1">
            {isApproved ? (
              <span className="text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" /> Tier 1 Host Approved
              </span>
            ) : isPendingApproval ? (
              <span className="text-amber-800 flex items-center gap-1.5">
                <Clock className="w-5 h-5 text-amber-500" /> Pending Admin CAC
              </span>
            ) : (
              <span className="text-red-700 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-red-500" /> Rejected
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium text-slate-500">CAC & Business Audit</span>
        </div>

      </div>

      {/* Main Tab Navigation */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
              activeTab === 'listings'
                ? 'border-tafiya-blue text-tafiya-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Managed Listings ({isApproved ? managedProperties.length : 0})
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
              activeTab === 'reservations'
                ? 'border-tafiya-blue text-tafiya-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Incoming Guest Reservations ({isApproved ? hostReservations.length : 0})
          </button>
        </div>

        {/* Listings Table View */}
        {activeTab === 'listings' ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            {!isApproved ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-base font-extrabold text-slate-900">Property Listing Locked</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Once Super Admin approves your CAC business application for <strong className="text-slate-800">{currentUser?.business_name || 'your enterprise'}</strong>, your listing workspace will automatically unlock here.
                  </p>
                </div>
              </div>
            ) : managedProperties.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                  <Building2 className="w-8 h-8 text-tafiya-orange/70" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-base font-extrabold text-slate-900">No Managed Properties Listed Yet</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    You do not have any accommodation listings registered under <strong className="text-slate-800">{currentUser?.business_name || currentUser?.name || 'your host account'}</strong>. As a verified host partner, you can now publish your apartments, guest lodges, and hotel suites.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onOpenWizard && onOpenWizard()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-tafiya-blue hover:bg-tafiya-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-tafiya-blue/20 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>List Your First Property Now</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Property</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Level 2 Property Verification</th>
                      <th className="p-4">Nightly Price</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {managedProperties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img 
                            src={prop.images[0]} 
                            alt={prop.name} 
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{prop.name}</span>
                            <span className="text-[10px] text-slate-400 capitalize">{prop.property_type}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-semibold text-slate-800">{prop.city}, {prop.state}</span>
                        </td>

                        <td className="p-4">
                          {prop.verification_tier === 'tier_3_certified' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 inline-flex">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tier 3 Agent Verified
                            </span>
                          ) : prop.verification_tier === 'tier_2_verified' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-tafiya-blue-50 text-tafiya-blue border border-tafiya-blue-200 flex items-center gap-1 inline-flex">
                              <ShieldCheck className="w-3 h-3 text-tafiya-blue" /> Tier 2 Location Audit
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 inline-flex">
                              <Clock className="w-3 h-3 text-amber-600" /> Pending Admin Publishing
                            </span>
                          )}
                        </td>

                        <td className="p-4 font-bold text-slate-900">
                          {prop.starting_price_formatted}
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => onTogglePublish(prop.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                              prop.is_published 
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {prop.is_published ? 'Published' : 'Draft'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Incoming Reservations Table */
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Incoming Reservations & Escrow Payout Queue</h3>
            
            {!isApproved ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No active reservations. Account Level 1 approval is pending.
              </div>
            ) : hostReservations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs space-y-1">
                <p className="font-bold text-slate-700">No incoming reservations yet</p>
                <p className="text-slate-400">Reservations made by travelers for your managed properties will appear here with live escrow status.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hostReservations.map((res) => (
                  <div key={res.id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{res.guestName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{res.id}</span>
                      </div>
                      <p className="text-xs text-slate-600">{res.property} • {res.room}</p>
                      <p className="text-[11px] text-slate-400">{res.dates} • Paid via {res.rail}</p>
                    </div>

                    <div className="text-right space-y-2">
                      <span className="text-sm font-black text-slate-900 block">{res.amount}</span>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => onOpenChat && onOpenChat(res.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-full shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
                          title="Message this booked guest"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat Guest</span>
                        </button>
                        <button className="px-3 py-1 bg-tafiya-blue text-white font-bold text-[10px] rounded-full shadow-sm hover:bg-tafiya-blue-600">
                          Validate Check-in
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
