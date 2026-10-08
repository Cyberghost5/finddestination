import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Building2, 
  DollarSign, 
  Users, 
  FileText, 
  Check, 
  X, 
  ArrowUpRight, 
  Navigation, 
  Clock, 
  Lock,
  Sparkles,
  AlertCircle,
  CreditCard,
  Settings,
  Save
} from 'lucide-react';

export default function AdminPortal({ properties, onUpdateVerificationStatus }) {
  const [activeTab, setActiveTab] = useState('verification'); // 'verification', 'escrow', or 'payment_settings'
  const [payoutLogs, setPayoutLogs] = useState([]);

  // Payment Gateway Settings State
  const [activeGateway, setActiveGateway] = useState('paystack');
  const [paystackPublicKey, setPaystackPublicKey] = useState('pk_test_tafiya_paystack_public_key_2026');
  const [monnifyApiKey, setMonnifyApiKey] = useState('MK_TEST_TAFIYA_MONNIFY_API_KEY');
  const [monnifyContractCode, setMonnifyContractCode] = useState('8920184920');
  const [isSavingGateway, setIsSavingGateway] = useState(false);
  const [gatewaySaveMsg, setGatewaySaveMsg] = useState('');
  const [gatewaySaveError, setGatewaySaveError] = useState('');

  // Fetch Payment Gateway Settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/v1/settings/payment-gateway');
        if (response.ok) {
          const resData = await response.json();
          if (resData.status === 'success' && resData.data) {
            setActiveGateway(resData.data.active_gateway || 'paystack');
            setPaystackPublicKey(resData.data.paystack_public_key || '');
            setMonnifyApiKey(resData.data.monnify_api_key || '');
            setMonnifyContractCode(resData.data.monnify_contract_code || '');
          }
        }
      } catch (err) {
        console.error('Failed to fetch payment gateway settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSavePaymentSettings = async (e) => {
    e.preventDefault();
    setIsSavingGateway(true);
    setGatewaySaveMsg('');
    setGatewaySaveError('');

    try {
      const token = localStorage.getItem('tafiya_token');
      const response = await fetch('/api/v1/settings/payment-gateway', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          active_gateway: activeGateway,
          paystack_public_key: paystackPublicKey,
          monnify_api_key: monnifyApiKey,
          monnify_contract_code: monnifyContractCode
        })
      });

      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        setGatewaySaveMsg(`Payment gateway configuration saved! Active Gateway is now set to ${activeGateway.toUpperCase()}.`);
        if (resData.data) {
          setActiveGateway(resData.data.active_gateway);
          setPaystackPublicKey(resData.data.paystack_public_key || '');
          setMonnifyApiKey(resData.data.monnify_api_key || '');
          setMonnifyContractCode(resData.data.monnify_contract_code || '');
        }
      } else {
        setGatewaySaveError(resData.message || 'Failed to update payment gateway settings.');
      }
    } catch (err) {
      setGatewaySaveError('Error connecting to server. Please check your connection.');
    } finally {
      setIsSavingGateway(false);
    }
  };

  // Calculate platform escrow metrics
  const escrowTotal = 4850000;
  const platformFee = Math.round(escrowTotal * 0.125);
  const netHostPayout = escrowTotal - platformFee;

  const handleTriggerPayout = (hostName, amount) => {
    const newLog = {
      id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      host: hostName,
      amount: amount,
      rail: activeGateway === 'monnify' ? 'Monnify Transfers API' : 'Paystack Transfers API',
      status: 'SUCCESSFUL',
      timestamp: new Date().toLocaleTimeString()
    };
    setPayoutLogs(prev => [newLog, ...prev]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      
      {/* Super Admin & Field Agent Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-tafiya-blue to-emerald-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">Super Admin & Field Agent Portal</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white">
                Platform Verification Control
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Northern Nigeria Regional Anti-Fraud Queue & Escrow Settlement</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
          <Sparkles className="w-4 h-4 text-tafiya-gold" />
          <span>PRD Section 6 Anti-Fraud Engine</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Escrow */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Escrow Funds</span>
          <div className="text-2xl font-black text-slate-900">₦{escrowTotal.toLocaleString()}</div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <Lock className="w-3 h-3" /> Monnify/Paystack Escrow
          </span>
        </div>

        {/* 12.5% Commission Retained */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Platform Fee Retained (12.5%)</span>
          <div className="text-2xl font-black text-tafiya-blue">₦{platformFee.toLocaleString()}</div>
          <span className="text-[11px] font-medium text-slate-500">FindDestination Revenue</span>
        </div>

        {/* Net Host Payout Balance */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Host Payable Balance</span>
          <div className="text-2xl font-black text-tafiya-orange">₦{netHostPayout.toLocaleString()}</div>
          <span className="text-[11px] font-medium text-slate-500">Scheduled Payouts</span>
        </div>

        {/* Pending Audits */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Verification Submissions</span>
          <div className="text-2xl font-black text-slate-900">{properties.length} Properties</div>
          <span className="text-[11px] font-medium text-slate-500">Active Portfolio</span>
        </div>

      </div>

      {/* Main Tab Controls */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('verification')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
              activeTab === 'verification'
                ? 'border-tafiya-blue text-tafiya-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Property Verification Queue (Tier 1 → Tier 2 → Tier 3)
          </button>

          <button
            onClick={() => setActiveTab('escrow')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
              activeTab === 'escrow'
                ? 'border-tafiya-blue text-tafiya-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Escrow Settlement & Host Payouts API
          </button>

          <button
            onClick={() => setActiveTab('payment_settings')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'payment_settings'
                ? 'border-tafiya-blue text-tafiya-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Payment Gateway Settings ({activeGateway.toUpperCase()})</span>
          </button>
        </div>

        {/* Verification Queue View */}
        {activeTab === 'verification' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Anti-Fraud Property Verification Pipeline</h3>
                <p className="text-xs text-slate-500 mt-0.5">Review CAC documents and log Field Agent on-site location audits.</p>
              </div>
            </div>

            <div className="space-y-3">
              {properties.map((prop) => (
                <div key={prop.id} className="p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white hover:border-slate-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <img 
                      src={prop.images[0]} 
                      alt={prop.name} 
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-xs">{prop.name}</h4>
                        <span className="text-[10px] text-slate-400 capitalize">• {prop.property_type}</span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-tafiya-blue" />
                        <span>{prop.address}, {prop.city} ({prop.state})</span>
                      </p>
                      <p className="text-[11px] text-slate-400">Host: {prop.host?.name || 'Local Provider'}</p>
                    </div>
                  </div>

                  {/* Tier Action Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    {prop.verification_tier === 'tier_1_docs' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        Tier 1 Docs Cleared
                      </span>
                    )}

                    {prop.verification_tier === 'tier_2_location' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-tafiya-blue-50 text-tafiya-blue">
                        Tier 2 Location Verified
                      </span>
                    )}

                    {prop.verification_tier === 'tier_3_certified' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Tier 3 Verified Badge</span>
                      </span>
                    )}

                    {/* Action buttons to upgrade tiers */}
                    {prop.verification_tier !== 'tier_2_location' && prop.verification_tier !== 'tier_3_certified' && (
                      <button
                        onClick={() => onUpdateVerificationStatus(prop.id, 'tier_2_location')}
                        className="px-3 py-1.5 bg-tafiya-blue text-white rounded-full text-[11px] font-bold hover:bg-tafiya-blue-600 transition-colors shadow-sm"
                      >
                        Log GPS & Award Tier 2
                      </button>
                    )}

                    {prop.verification_tier !== 'tier_3_certified' && (
                      <button
                        onClick={() => onUpdateVerificationStatus(prop.id, 'tier_3_certified')}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-full text-[11px] font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Award Tier 3 Badge</span>
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* Escrow Payout Monitoring View */}
        {activeTab === 'escrow' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Escrow Settlement & Host Payout Execution</h3>
                <p className="text-xs text-slate-500">Automated payout releases via Monnify & Paystack Transfers API after check-in + 24 hours.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Host Settlement Action Box */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <span className="text-xs font-bold text-slate-900 block">Host Payout Execution ({activeGateway.toUpperCase()} Transfers)</span>
                
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">Target Host Account</span>
                  <span className="text-xs font-bold text-slate-800">Alhaji Ibrahim Bello • Access Bank (0092184910)</span>
                  <span className="text-[11px] font-bold text-tafiya-blue block">Available Balance: ₦1,420,000</span>
                </div>

                <button
                  onClick={() => handleTriggerPayout('Alhaji Ibrahim Bello', '₦1,420,000')}
                  className="w-full py-2.5 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  Initiate Host Bank Payout (API)
                </button>
              </div>

              {/* Payout Execution Logs */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-900 text-white space-y-3">
                <span className="text-xs font-bold text-white block">Recent Payout API Log</span>

                {payoutLogs.length === 0 ? (
                  <p className="text-xs text-slate-400">No payout executions logged yet in this session.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {payoutLogs.map((log) => (
                      <div key={log.id} className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-tafiya-gold block">{log.host}</span>
                          <span className="text-[10px] text-slate-400">{log.id} • {log.rail}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-400 block">{log.amount}</span>
                          <span className="text-[10px] text-emerald-500 font-bold">SUCCESS</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Payment Gateway Configuration View */}
        {activeTab === 'payment_settings' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-tafiya-blue" />
                <h3 className="text-sm font-extrabold text-slate-900">Payment Gateway Control & API Keys</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Select which payment gateway is active across guest checkout. Only <strong>ONE</strong> gateway can be active at a time as required by platform policy.
              </p>
            </div>

            {gatewaySaveMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{gatewaySaveMsg}</span>
              </div>
            )}

            {gatewaySaveError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{gatewaySaveError}</span>
              </div>
            )}

            <form onSubmit={handleSavePaymentSettings} className="space-y-6">
              
              {/* Active Gateway Choice */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                  1. Active Payment Gateway Switcher
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Paystack Card */}
                  <label 
                    onClick={() => setActiveGateway('paystack')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative block ${
                      activeGateway === 'paystack'
                        ? 'border-tafiya-blue bg-tafiya-blue-50/40 ring-2 ring-tafiya-blue/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className={`w-5 h-5 ${activeGateway === 'paystack' ? 'text-tafiya-blue' : 'text-slate-400'}`} />
                        <span className="text-sm font-extrabold text-slate-900">Paystack Inline Gateway</span>
                      </div>
                      <input 
                        type="radio"
                        name="active_gateway"
                        value="paystack"
                        checked={activeGateway === 'paystack'}
                        onChange={() => setActiveGateway('paystack')}
                        className="w-4 h-4 text-tafiya-blue focus:ring-tafiya-blue cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Accept Mastercard, Visa, Verve, USSD, and Apple Pay using Paystack's official Popup Inline SDK.
                    </p>
                    {activeGateway === 'paystack' && (
                      <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-extrabold bg-tafiya-blue text-white px-2.5 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> ACTIVE SYSTEM GATEWAY
                      </span>
                    )}
                  </label>

                  {/* Monnify Card */}
                  <label 
                    onClick={() => setActiveGateway('monnify')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative block ${
                      activeGateway === 'monnify'
                        ? 'border-tafiya-blue bg-tafiya-blue-50/40 ring-2 ring-tafiya-blue/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Building2 className={`w-5 h-5 ${activeGateway === 'monnify' ? 'text-tafiya-blue' : 'text-slate-400'}`} />
                        <span className="text-sm font-extrabold text-slate-900">Monnify Payment SDK</span>
                      </div>
                      <input 
                        type="radio"
                        name="active_gateway"
                        value="monnify"
                        checked={activeGateway === 'monnify'}
                        onChange={() => setActiveGateway('monnify')}
                        className="w-4 h-4 text-tafiya-blue focus:ring-tafiya-blue cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Reserved Virtual Accounts, Instant Direct Bank Transfers & Monnify Inline SDK Checkout.
                    </p>
                    {activeGateway === 'monnify' && (
                      <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-extrabold bg-tafiya-blue text-white px-2.5 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> ACTIVE SYSTEM GATEWAY
                      </span>
                    )}
                  </label>

                </div>
              </div>

              {/* API Credentials Configuration */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                  2. Gateway API Credentials & Public Keys
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Paystack Public Key */}
                  <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-tafiya-blue" />
                      <span>Paystack Public Key</span>
                    </label>
                    <input 
                      type="text"
                      value={paystackPublicKey}
                      onChange={(e) => setPaystackPublicKey(e.target.value)}
                      placeholder="pk_test_... or pk_live_..."
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-tafiya-blue text-slate-800"
                    />
                    <p className="text-[10px] text-slate-400">Used for client-side PaystackPop inline SDK initialization.</p>
                  </div>

                  {/* Monnify API Key & Contract Code */}
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-tafiya-blue" />
                        <span>Monnify API Key</span>
                      </label>
                      <input 
                        type="text"
                        value={monnifyApiKey}
                        onChange={(e) => setMonnifyApiKey(e.target.value)}
                        placeholder="MK_TEST_... or MK_PROD_..."
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-tafiya-blue text-slate-800"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 block">Monnify Contract Code</label>
                      <input 
                        type="text"
                        value={monnifyContractCode}
                        onChange={(e) => setMonnifyContractCode(e.target.value)}
                        placeholder="e.g. 8920184920"
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-tafiya-blue text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingGateway}
                  className="px-6 py-3 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 text-white rounded-full font-bold text-xs shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingGateway ? 'Saving Gateway Settings...' : 'Save & Activate Selected Gateway'}</span>
                </button>
              </div>

            </form>
          </div>
        )}

      </div>

    </div>
  );
}
