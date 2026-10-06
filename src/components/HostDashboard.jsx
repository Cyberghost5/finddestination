import React, { useState } from 'react';
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
  MapPin
} from 'lucide-react';

export default function HostDashboard({ properties, onOpenWizard, onTogglePublish }) {
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' or 'reservations'
  const [payoutRequested, setPayoutRequested] = useState(false);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      
      {/* Host Portal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-tafiya-blue to-tafiya-orange flex items-center justify-center text-white font-extrabold text-xl shadow-md shrink-0">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">Alhaji Ibrahim Bello</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-tafiya-blue-500 text-white">
                Super Host
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Northern Nigeria Managed Property Portfolio</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPayoutRequested(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-xs font-bold border border-slate-700 transition-colors"
          >
            <DollarSign className="w-4 h-4 text-tafiya-gold" />
            <span>{payoutRequested ? 'Payout Triggered' : 'Payout Settings'}</span>
          </button>

          <button
            onClick={onOpenWizard}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 text-white rounded-full text-xs font-bold shadow-lg hover:shadow-tafiya-blue/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>List New Property</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Available Escrow Earnings */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Available Balance</span>
          <div className="text-2xl font-black text-slate-900">₦1,420,000</div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <Lock className="w-3 h-3" /> Escrow Protected
          </span>
        </div>

        {/* Occupancy Rate */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Average Occupancy</span>
          <div className="text-2xl font-black text-tafiya-blue">84%</div>
          <span className="text-[11px] font-medium text-slate-500">Across 6 room units</span>
        </div>

        {/* Active Reservations */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Monthly Bookings</span>
          <div className="text-2xl font-black text-tafiya-orange">18 Stays</div>
          <span className="text-[11px] font-medium text-slate-500">Northern Nigeria Region</span>
        </div>

        {/* Verification Status */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Verification Status</span>
          <div className="text-base font-extrabold text-emerald-950 flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
            <span>Tier 3 Verified</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500">CAC & Field GPS Audited</span>
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
            My Managed Listings ({properties.length})
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
              activeTab === 'reservations'
                ? 'border-tafiya-blue text-tafiya-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Incoming Guest Reservations ({mockReservations.length})
          </button>
        </div>

        {/* Listings Table View */}
        {activeTab === 'listings' ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Property</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Verification Tier</th>
                    <th className="p-4">Nightly Price</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {properties.map((prop) => (
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
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Tier 3 Verified
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-tafiya-blue-50 text-tafiya-blue border border-tafiya-blue-200">
                            Tier 2 Location
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-bold text-slate-900">
                        {prop.starting_price_formatted}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => onTogglePublish(prop.id)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${
                            prop.is_published 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-slate-100 text-slate-600'
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
          </div>
        ) : (
          /* Incoming Reservations Table */
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Incoming Reservations & Escrow Payout Queue</h3>
            
            <div className="space-y-3">
              {mockReservations.map((res) => (
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
                    <button className="px-3 py-1 bg-tafiya-blue text-white font-bold text-[10px] rounded-full shadow-sm hover:bg-tafiya-blue-600">
                      Validate Check-in
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
