import React, { useState, useEffect, useCallback } from 'react';
import { 
  Navigation, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Droplets, 
  Camera, 
  FileText, 
  Clock, 
  Building2, 
  Check, 
  Upload,
  AlertTriangle,
  ArrowRight,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  CreditCard,
  Phone,
  Mail,
  Video,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  X,
  Lock,
  Unlock,
  Eye,
  CheckCircle,
  XCircle,
  Landmark,
  Share2
} from 'lucide-react';

export default function FieldAgentPortal({ currentUser, authToken }) {
  // Navigation tabs: 'explore', 'assignments', 'wallet'
  const [activeTab, setActiveTab] = useState('explore');

  // Data states
  const [exploreProperties, setExploreProperties] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [walletData, setWalletData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [exploreStateFilter, setExploreStateFilter] = useState('all');
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState('all');

  // Modals
  const [selectedExploreProp, setSelectedExploreProp] = useState(null);
  const [activeAuditInspection, setActiveAuditInspection] = useState(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  // Form states
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [bankForm, setBankForm] = useState({
    bank_name: '',
    account_number: '',
    account_name: '',
    bank_code: '',
  });
  const [bankSubmitting, setBankSubmitting] = useState(false);

  // Audit Report Submission Form State
  const [auditForm, setAuditForm] = useState({
    gps_latitude: '',
    gps_longitude: '',
    photos: [],
    newPhotoUrl: '',
    video_url: '',
    amenities_check: {
      solar_power: true,
      clean_water: true,
      armed_security: true,
      room_count_accurate: true,
      perimeter_fence: true,
      clean_sanitary: true,
    },
    report_notes: '',
  });
  const [auditSubmitting, setAuditSubmitting] = useState(false);
  const [isGettingGps, setIsGettingGps] = useState(false);

  // Notification Toast State
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Helper for API headers
  const getHeaders = useCallback(() => {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    if (currentUser?.id) {
      headers['X-User-Id'] = currentUser.id;
    }
    return headers;
  }, [authToken, currentUser]);

  // Fetch explore properties
  const fetchExploreProperties = useCallback(async () => {
    try {
      const url = exploreStateFilter === 'all' 
        ? '/api/v1/agent/explore-properties' 
        : `/api/v1/agent/explore-properties?state=${encodeURIComponent(exploreStateFilter)}`;
      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          setExploreProperties(data.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch explore properties:', err);
    }
  }, [exploreStateFilter, getHeaders]);

  // Fetch assignments
  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/agent/inspections/my-assignments', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          setAssignments(data.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    }
  }, [getHeaders]);

  // Fetch wallet
  const fetchWallet = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/agent/wallet', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          setWalletData(data.data || null);
          if (data.data?.bank_details) {
            setBankForm({
              bank_name: data.data.bank_details.bank_name || '',
              account_number: data.data.bank_details.account_number || '',
              account_name: data.data.bank_details.account_name || currentUser?.name || '',
              bank_code: data.data.bank_details.bank_code || '',
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch wallet:', err);
    }
  }, [getHeaders, currentUser]);

  // Initial load
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchExploreProperties(),
      fetchAssignments(),
      fetchWallet(),
    ]);
    setIsLoading(false);
  }, [fetchExploreProperties, fetchAssignments, fetchWallet]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchExploreProperties(),
      fetchAssignments(),
      fetchWallet(),
    ]);
    setRefreshing(false);
  };

  // 1. Apply for property bounty
  const handleApplyBounty = async (propertyId) => {
    try {
      const res = await fetch('/api/v1/agent/inspections/apply', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ property_id: propertyId }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('success', data.message || 'Inspection application submitted!');
        setSelectedExploreProp(null);
        await Promise.all([fetchExploreProperties(), fetchAssignments()]);
        setActiveTab('assignments');
      } else {
        showToast('error', data.message || 'Failed to submit application.');
      }
    } catch (err) {
      showToast('error', 'Network error submitting application: ' + err.message);
    }
  };

  // 2. Open audit modal & prefill GPS
  const handleOpenAuditModal = (assignment) => {
    setActiveAuditInspection(assignment);
    setAuditForm({
      gps_latitude: assignment.report?.gps_latitude || '',
      gps_longitude: assignment.report?.gps_longitude || '',
      photos: Array.isArray(assignment.report?.photos) && assignment.report.photos.length > 0 
        ? assignment.report.photos 
        : [assignment.cover_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'],
      newPhotoUrl: '',
      video_url: assignment.report?.video_url || '',
      amenities_check: assignment.report?.amenities_check && typeof assignment.report.amenities_check === 'object'
        ? assignment.report.amenities_check
        : {
            solar_power: true,
            clean_water: true,
            armed_security: true,
            room_count_accurate: true,
            perimeter_fence: true,
            clean_sanitary: true,
          },
      report_notes: assignment.report?.report_notes || '',
    });
  };

  // Get device live GPS
  const handleCaptureDeviceGps = () => {
    if (!navigator.geolocation) {
      showToast('error', 'Geolocation is not supported by your browser.');
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAuditForm((prev) => ({
          ...prev,
          gps_latitude: pos.coords.latitude.toFixed(6),
          gps_longitude: pos.coords.longitude.toFixed(6),
        }));
        setIsGettingGps(false);
        showToast('success', `GPS coordinates captured with accuracy ±${Math.round(pos.coords.accuracy)}m`);
      },
      (err) => {
        setIsGettingGps(false);
        // Fallback to reasonable coordinates if denied
        setAuditForm((prev) => ({
          ...prev,
          gps_latitude: prev.gps_latitude || '10.315842',
          gps_longitude: prev.gps_longitude || '9.844192',
        }));
        showToast('error', 'Could not access device GPS (' + err.message + '). Manual entry enabled.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Add photo URL to audit
  const handleAddPhoto = () => {
    if (!auditForm.newPhotoUrl.trim()) return;
    setAuditForm((prev) => ({
      ...prev,
      photos: [...prev.photos, prev.newPhotoUrl.trim()],
      newPhotoUrl: '',
    }));
  };

  const handleRemovePhoto = (index) => {
    setAuditForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== index),
    }));
  };

  // Submit on-site report
  const handleSubmitAuditReport = async (e) => {
    e.preventDefault();
    if (!auditForm.gps_latitude || !auditForm.gps_longitude) {
      showToast('error', 'Please provide or capture GPS coordinates.');
      return;
    }
    if (!auditForm.report_notes || auditForm.report_notes.trim().length < 10) {
      showToast('error', 'Please enter comprehensive audit notes (at least 10 characters).');
      return;
    }

    setAuditSubmitting(true);
    try {
      const res = await fetch(`/api/v1/agent/inspections/${activeAuditInspection.id}/submit-report`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          gps_latitude: parseFloat(auditForm.gps_latitude),
          gps_longitude: parseFloat(auditForm.gps_longitude),
          photos: auditForm.photos,
          video_url: auditForm.video_url || null,
          amenities_check: auditForm.amenities_check,
          report_notes: auditForm.report_notes.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('success', data.message || 'Audit report submitted for Super Admin review!');
        setActiveAuditInspection(null);
        await Promise.all([fetchAssignments(), fetchWallet()]);
      } else {
        showToast('error', data.message || 'Failed to upload audit report.');
      }
    } catch (err) {
      showToast('error', 'Network error uploading report: ' + err.message);
    } finally {
      setAuditSubmitting(false);
    }
  };

  // 3. Save Bank Details
  const handleSaveBankDetails = async (e) => {
    e.preventDefault();
    setBankSubmitting(true);
    try {
      const res = await fetch('/api/v1/agent/wallet/bank-details', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(bankForm),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('success', 'Bank payout details saved successfully!');
        setIsBankModalOpen(false);
        await fetchWallet();
      } else {
        showToast('error', data.message || 'Failed to save bank details.');
      }
    } catch (err) {
      showToast('error', 'Network error saving bank details: ' + err.message);
    } finally {
      setBankSubmitting(false);
    }
  };

  // 4. Submit Withdrawal Request
  const handleRequestWithdrawal = async (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 1000) {
      showToast('error', 'Minimum withdrawal amount is ₦1,000.');
      return;
    }
    if (walletData && amount > walletData.balance) {
      showToast('error', `Insufficient balance. Available: ${walletData.balance_formatted}`);
      return;
    }

    setWithdrawSubmitting(true);
    try {
      const res = await fetch('/api/v1/agent/wallet/withdraw', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('success', data.message || 'Withdrawal request submitted successfully!');
        setIsWithdrawModalOpen(false);
        setWithdrawAmount('');
        await fetchWallet();
      } else {
        showToast('error', data.message || 'Failed to submit withdrawal request.');
      }
    } catch (err) {
      showToast('error', 'Network error processing withdrawal: ' + err.message);
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter((item) => {
    if (assignmentStatusFilter === 'all') return true;
    return item.status === assignmentStatusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 max-w-md animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-xs font-bold border ${
            toast.type === 'success' 
              ? 'bg-emerald-950 text-emerald-100 border-emerald-800' 
              : 'bg-red-950 text-red-100 border-red-800'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Banner / Portal Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Agent Profile & Identity */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-tafiya-blue via-emerald-600 to-amber-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg ring-4 ring-slate-800 shrink-0">
                <Navigation className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-black tracking-tight">{currentUser?.name || 'Usman Field Agent'}</h1>
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-tafiya-blue/20 text-tafiya-blue border border-tafiya-blue/40">
                    Certified Regional Inspector
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Tier 3 Verifier
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>Physical On-Site Inspection & Wallet Bounty Desk</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300 font-semibold">{currentUser?.email || 'agent@tafiya.ng'}</span>
                </p>
              </div>
            </div>

            {/* Quick Wallet Stats Pill & Refresh */}
            <div className="flex items-center gap-3">
              <div 
                onClick={() => setActiveTab('wallet')}
                className="cursor-pointer bg-slate-800/90 hover:bg-slate-800 border border-slate-700 p-3.5 rounded-2xl flex items-center gap-4 transition-all shadow-md group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block tracking-wider">Available Balance</span>
                  <span className="text-base font-black text-emerald-400">
                    {walletData ? walletData.balance_formatted : '₦0.00'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                title="Refresh Portal Data"
                className="p-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-2xl transition-all cursor-pointer"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin text-tafiya-blue' : ''}`} />
              </button>
            </div>

          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-2 mt-8 border-b border-slate-800/80 overflow-x-auto scrollbar-none pb-px">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-black rounded-t-xl transition-all border-b-2 cursor-pointer shrink-0 ${
                activeTab === 'explore'
                  ? 'border-tafiya-blue text-white bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Search className="w-4 h-4 text-tafiya-blue" />
              <span>Inspection Bounties</span>
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-tafiya-blue text-white">
                {exploreProperties.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-black rounded-t-xl transition-all border-b-2 cursor-pointer shrink-0 ${
                activeTab === 'assignments'
                  ? 'border-emerald-500 text-white bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>My Assignments</span>
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {assignments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-black rounded-t-xl transition-all border-b-2 cursor-pointer shrink-0 ${
                activeTab === 'wallet'
                  ? 'border-amber-500 text-white bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>Wallet & Payouts</span>
              {walletData && walletData.pending_withdrawal_amount > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Payout Pending
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ======================================================== */}
        {/* TAB 1: INSPECTION BOUNTIES (EXPLORE)                     */}
        {/* ======================================================== */}
        {activeTab === 'explore' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Available Physical Inspection Bounties</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Properties authorized by Super Admin for on-site verification. Host phone & gate directions are unlocked upon assignment.
                </p>
              </div>

              {/* State Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={exploreStateFilter}
                  onChange={(e) => setExploreStateFilter(e.target.value)}
                  className="text-xs font-bold bg-slate-100 hover:bg-slate-200 border-none rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-tafiya-blue outline-none cursor-pointer"
                >
                  <option value="all">All States</option>
                  <option value="Bauchi">Bauchi</option>
                  <option value="Kaduna">Kaduna</option>
                  <option value="Kano">Kano</option>
                  <option value="Plateau">Plateau (Jos)</option>
                  <option value="Adamawa">Adamawa</option>
                  <option value="Gombe">Gombe</option>
                  <option value="Sokoto">Sokoto</option>
                  <option value="Katsina">Katsina</option>
                  <option value="Nasarawa">Nasarawa</option>
                  <option value="Niger">Niger</option>
                  <option value="Taraba">Taraba</option>
                </select>
              </div>
            </div>

            {/* Properties Grid */}
            {isLoading ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                <RefreshCw className="w-8 h-8 animate-spin text-tafiya-blue mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-500">Loading open inspection bounties...</p>
              </div>
            ) : exploreProperties.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 space-y-3">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-sm font-extrabold text-slate-800">No Open Bounties In This Region</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  All properties in this filter have either completed physical inspection or have pending inspector reviews.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exploreProperties.map((prop) => {
                  const hasApplication = Boolean(prop.my_application);
                  const isAssignedOther = prop.is_assigned_to_other;

                  return (
                    <div
                      key={prop.id}
                      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                    >
                      {/* Image & Bounty Badge */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                        <img
                          src={prop.cover_image}
                          alt={prop.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Bounty Fee Pill */}
                        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-emerald-400 px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-xs font-black tracking-wide">{prop.inspection_fee_formatted} Bounty</span>
                        </div>

                        {/* Location Tag */}
                        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-tafiya-orange" />
                          <span>{prop.city}, {prop.state}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-tafiya-blue bg-tafiya-blue-50 px-2.5 py-0.5 rounded-full">
                              {prop.property_type.replace('_', ' ')}
                            </span>
                            <span className="text-[11px] text-slate-400 font-semibold">
                              {prop.neighborhood || prop.city}
                            </span>
                          </div>

                          <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1 group-hover:text-tafiya-blue transition-colors">
                            {prop.name}
                          </h3>

                          {/* Masked Address Banner */}
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2 text-[11px] text-slate-600">
                            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{prop.address}</span>
                          </div>

                          {/* Amenities preview */}
                          {prop.amenities && prop.amenities.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                              {prop.amenities.slice(0, 3).map((a, idx) => (
                                <span key={idx} className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {a}
                                </span>
                              ))}
                              {prop.amenities.length > 3 && (
                                <span className="text-[10px] text-slate-400 font-bold">
                                  +{prop.amenities.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Footer */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                          <button
                            onClick={() => setSelectedExploreProp(prop)}
                            className="text-xs font-bold text-slate-600 hover:text-slate-900 underline underline-offset-4 cursor-pointer"
                          >
                            Inspection Details
                          </button>

                          {hasApplication ? (
                            <span className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                              prop.my_application.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              <Clock className="w-3.5 h-3.5" />
                              {prop.my_application.status === 'approved' ? 'Assigned to You' : 'Pending Review'}
                            </span>
                          ) : isAssignedOther ? (
                            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-400">
                              Assigned to Other
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApplyBounty(prop.id)}
                              className="px-4 py-2 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 hover:from-tafiya-blue-600 hover:to-tafiya-blue text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Apply for ₦{prop.inspection_fee.toLocaleString()}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MY INSPECTION ASSIGNMENTS                         */}
        {/* ======================================================== */}
        {activeTab === 'assignments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">My Inspection Missions</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track your physical inspection lifecycle: approval, on-site visit, host liaison, audit evidence upload, and bounty verification.
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'pending', label: 'Pending Review' },
                  { key: 'approved', label: 'Active Site Visits' },
                  { key: 'submitted', label: 'Under Review' },
                  { key: 'verified', label: 'Verified & Paid' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setAssignmentStatusFilter(f.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      assignmentStatusFilter === f.key
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignments List */}
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 space-y-3">
                <Navigation className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-sm font-extrabold text-slate-800">No Assignments Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You do not have any inspections under this filter. Explore open bounties to apply for high-value on-site inspections.
                </p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-5 py-2.5 bg-tafiya-blue text-white rounded-xl text-xs font-extrabold shadow-md hover:bg-tafiya-blue-600 transition-all cursor-pointer"
                >
                  Explore Inspection Bounties
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAssignments.map((assignment) => {
                  const isApproved = assignment.status === 'approved';
                  const isSubmitted = assignment.status === 'submitted';
                  const isVerified = assignment.status === 'verified';
                  const isPending = assignment.status === 'pending';
                  const isDeclined = assignment.status === 'declined';

                  return (
                    <div
                      key={assignment.id}
                      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all p-6 space-y-5"
                    >
                      {/* Top Row: Basic Info & Status Badge */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                        <div className="flex items-start gap-4">
                          <img
                            src={assignment.cover_image}
                            alt={assignment.property_name}
                            className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-sm"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-black text-slate-900">{assignment.property_name}</h3>
                              <span className="text-[10px] font-black uppercase text-tafiya-blue bg-tafiya-blue-50 px-2 py-0.5 rounded-full">
                                {assignment.property_type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-tafiya-orange shrink-0" />
                              <span>{assignment.city}, {assignment.state}</span>
                              <span className="text-slate-300">•</span>
                              <span>Applied on {assignment.applied_at || 'Recently'}</span>
                            </p>
                          </div>
                        </div>

                        {/* Status & Bounty Pill */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Inspection Bounty</span>
                            <span className="text-base font-black text-emerald-600">{assignment.inspection_fee_formatted}</span>
                          </div>

                          <div>
                            {isApproved && (
                              <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Authorized: Active Visit</span>
                              </span>
                            )}
                            {isSubmitted && (
                              <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-blue-600" />
                                <span>Report Under Admin Review</span>
                              </span>
                            )}
                            {isVerified && (
                              <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-500 text-white flex items-center gap-1.5 shadow-md">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verified & Bounty Paid</span>
                              </span>
                            )}
                            {isPending && (
                              <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Pending Admin Authorization</span>
                              </span>
                            )}
                            {isDeclined && (
                              <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-red-50 text-red-800 border border-red-200 flex items-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5 text-red-600" />
                                <span>Application Declined</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Middle Row: Unlocked Host Details OR Lock Message */}
                      {assignment.is_details_unlocked ? (
                        <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200/80 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                              <Unlock className="w-4 h-4 text-emerald-600" />
                              <span>Unlocked Host Liaison & Exact Address</span>
                            </span>
                            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                              Super Admin Authorization Active
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Exact Address */}
                            <div className="p-3.5 bg-white rounded-xl border border-emerald-100 shadow-sm space-y-1">
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Exact Physical Gate Address</span>
                              <p className="text-xs font-black text-slate-900">{assignment.unlocked_address}</p>
                              <p className="text-[11px] text-slate-500">Contact host prior to site visit to confirm gate access.</p>
                            </div>

                            {/* Host Contact Details */}
                            {assignment.host_details && (
                              <div className="p-3.5 bg-white rounded-xl border border-emerald-100 shadow-sm space-y-2">
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Host Representative</span>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-xs font-black text-slate-900">{assignment.host_details.name}</p>
                                    <p className="text-[11px] text-slate-500">{assignment.host_details.business_name || 'Property Owner'}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {assignment.host_details.phone && (
                                      <a
                                        href={`tel:${assignment.host_details.phone}`}
                                        className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                                        title="Call Host"
                                      >
                                        <Phone className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                    {assignment.host_details.phone && (
                                      <a
                                        href={`https://wa.me/${assignment.host_details.phone.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center gap-1"
                                      >
                                        WhatsApp
                                      </a>
                                    )}
                                    {assignment.host_details.email && (
                                      <a
                                        href={`mailto:${assignment.host_details.email}`}
                                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                                        title="Email Host"
                                      >
                                        <Mail className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-3 text-xs text-slate-600">
                          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>
                            Exact location address and host phone number will be unlocked once Super Admin reviews and authorizes your regional inspection application.
                          </span>
                        </div>
                      )}

                      {/* Bottom Row: Audit Actions & Status Details */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        {/* Audit Details Preview (If submitted) */}
                        <div className="text-xs text-slate-600">
                          {isSubmitted && (
                            <span className="flex items-center gap-1.5 text-blue-700 font-bold">
                              <CheckCircle2 className="w-4 h-4 text-blue-600" />
                              <span>Audit report uploaded with GPS & media evidence. Awaiting Super Admin review.</span>
                            </span>
                          )}
                          {isVerified && (
                            <span className="flex items-center gap-1.5 text-emerald-700 font-black">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>₦{assignment.inspection_fee.toLocaleString()} bounty successfully credited to your wallet balance.</span>
                            </span>
                          )}
                          {isPending && (
                            <span className="text-slate-400 font-semibold">
                              Your application is in the Super Admin verification queue.
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 shrink-0">
                          {isApproved && (
                            <button
                              onClick={() => handleOpenAuditModal(assignment)}
                              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                            >
                              <Camera className="w-4 h-4" />
                              <span>Upload On-Site Audit Report</span>
                            </button>
                          )}

                          {isSubmitted && (
                            <button
                              onClick={() => handleOpenAuditModal(assignment)}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Submitted Evidence</span>
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: WALLET & PAYOUTS                                  */}
        {/* ======================================================== */}
        {activeTab === 'wallet' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Wallet Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Available Balance Card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 border border-slate-700/80 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>Agent Available Balance</span>
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div>
                  <h2 className="text-3xl font-black text-emerald-400 tracking-tight">
                    {walletData ? walletData.balance_formatted : '₦0.00'}
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1">Available for instant bank withdrawal</p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (!walletData?.bank_details?.is_configured) {
                        showToast('error', 'Please configure your bank payout account first.');
                        setIsBankModalOpen(true);
                      } else {
                        setIsWithdrawModalOpen(true);
                      }
                    }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-slate-950 font-black rounded-xl text-xs shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Request Payout / Withdrawal</span>
                  </button>
                </div>
              </div>

              {/* Total Earned Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-tafiya-blue" />
                    <span>Lifetime Bounty Earnings</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-tafiya-blue">
                    Verified Audits
                  </span>
                </div>

                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {walletData ? walletData.total_earned_formatted : '₦0.00'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">Total revenue generated from physical inspections</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                  <span>Earn up to ₦50,000 per Tier 3 physical inspection verification across Northern Nigeria.</span>
                </div>
              </div>

              {/* Bank Payout Account Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-amber-500" />
                    <span>Settlement Bank Account</span>
                  </span>
                  <button
                    onClick={() => setIsBankModalOpen(true)}
                    className="text-xs font-bold text-tafiya-blue hover:underline cursor-pointer"
                  >
                    {walletData?.bank_details?.is_configured ? 'Edit Details' : 'Configure'}
                  </button>
                </div>

                {walletData?.bank_details?.is_configured ? (
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                      {walletData.bank_details.bank_name}
                    </p>
                    <p className="text-xl font-black text-slate-900 tracking-wider font-mono">
                      {walletData.bank_details.account_number}
                    </p>
                    <p className="text-xs font-bold text-slate-700">
                      {walletData.bank_details.account_name}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-2">
                    <p className="text-xs font-bold text-amber-900">No Bank Account Configured</p>
                    <p className="text-[11px] text-amber-700">Add your bank details to enable bounty withdrawals.</p>
                  </div>
                )}

                <button
                  onClick={() => setIsBankModalOpen(true)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl text-xs transition-all cursor-pointer"
                >
                  {walletData?.bank_details?.is_configured ? 'Update Bank Payout Info' : 'Add Bank Payout Account'}
                </button>
              </div>

            </div>

            {/* Double-Entry Transaction Ledger Table */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Double-Entry Transaction Ledger</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Immutable audit trail of inspection bounty credits and withdrawal debits</p>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {walletData?.transactions?.length || 0} Transactions
                </span>
              </div>

              {!walletData?.transactions || walletData.transactions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-bold">
                  No wallet transactions recorded yet. Complete an inspection to earn bounties!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Description</th>
                        <th className="pb-3">Reference</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3 text-right">Amount</th>
                        <th className="pb-3 text-right">Balance After</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {walletData.transactions.map((tx) => {
                        const isCredit = tx.type === 'credit';
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                isCredit 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                {isCredit ? <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> : <ArrowUpRight className="w-3 h-3 text-slate-600" />}
                                {tx.category.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 max-w-xs text-slate-900 font-bold">{tx.description}</td>
                            <td className="py-3.5 font-mono text-[11px] text-slate-500">{tx.reference}</td>
                            <td className="py-3.5 text-slate-500">{tx.date}</td>
                            <td className={`py-3.5 text-right font-black ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                              {tx.amount_formatted}
                            </td>
                            <td className="py-3.5 text-right font-bold text-slate-700">{tx.balance_after_formatted}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Withdrawal Payout History Table */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Withdrawal Payout Requests</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Status of bank transfers processed by Super Admin</p>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {walletData?.withdrawals?.length || 0} Requests
                </span>
              </div>

              {!walletData?.withdrawals || walletData.withdrawals.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-bold">
                  No withdrawal requests placed yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Destination Bank</th>
                        <th className="pb-3">Reference</th>
                        <th className="pb-3">Requested Date</th>
                        <th className="pb-3">Admin Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {walletData.withdrawals.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              w.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : w.status === 'rejected'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {w.status === 'approved' ? 'Disbursed / Paid' : w.status}
                            </span>
                          </td>
                          <td className="py-3.5 font-black text-slate-900">{w.amount_formatted}</td>
                          <td className="py-3.5 text-slate-700">
                            <span className="font-bold">{w.bank_name}</span>
                            <span className="block text-[11px] text-slate-400 font-mono">{w.account_number} ({w.account_name})</span>
                          </td>
                          <td className="py-3.5 font-mono text-[11px] text-slate-500">{w.transaction_reference}</td>
                          <td className="py-3.5 text-slate-500">{w.requested_at}</td>
                          <td className="py-3.5 text-slate-600 max-w-xs text-[11px]">{w.admin_note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ON-SITE AUDIT EVIDENCE UPLOADER                 */}
      {/* ======================================================== */}
      {activeAuditInspection && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 my-8">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-tafiya-orange uppercase tracking-wider block">
                  Field Verification Protocol • Tier 3 Physical Audit
                </span>
                <h3 className="text-base font-black text-slate-900">{activeAuditInspection.property_name}</h3>
                <p className="text-xs text-slate-500">{activeAuditInspection.unlocked_address || activeAuditInspection.city}</p>
              </div>
              <button
                onClick={() => setActiveAuditInspection(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAuditReport} className="space-y-6">
              
              {/* 1. Live Device GPS Capture */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-tafiya-blue" />
                    <span>Device GPS Coordinate Logger</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCaptureDeviceGps}
                    disabled={isGettingGps}
                    className="px-3 py-1 bg-tafiya-blue hover:bg-tafiya-blue-600 text-white rounded-lg text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {isGettingGps ? <RefreshCw className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                    <span>{isGettingGps ? 'Querying GPS...' : 'Auto-Capture My GPS'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Latitude</span>
                    <input 
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 10.315842"
                      value={auditForm.gps_latitude}
                      onChange={(e) => setAuditForm({ ...auditForm, gps_latitude: e.target.value })}
                      className="w-full bg-transparent text-emerald-400 font-bold focus:outline-none"
                    />
                  </div>
                  <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Longitude</span>
                    <input 
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 9.844192"
                      value={auditForm.gps_longitude}
                      onChange={(e) => setAuditForm({ ...auditForm, gps_longitude: e.target.value })}
                      className="w-full bg-transparent text-emerald-400 font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Physical Inspection Checklist */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                  Physical Amenities & Security Checklist
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'solar_power', label: '24/7 Power / Solar Inverters Active' },
                    { key: 'clean_water', label: 'Running Clean Water & Borehole Pump Operational' },
                    { key: 'armed_security', label: 'Perimeter Security Guards & Gates Checked' },
                    { key: 'perimeter_fence', label: 'Perimeter Fencing & Access Controls Secure' },
                    { key: 'room_count_accurate', label: 'Room Counts & Interior Amenities Match Listing' },
                    { key: 'clean_sanitary', label: 'Clean Sanitary Fittings & Plumbing Verified' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2.5 p-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(auditForm.amenities_check[item.key])}
                        onChange={(e) => setAuditForm({
                          ...auditForm,
                          amenities_check: {
                            ...auditForm.amenities_check,
                            [item.key]: e.target.checked,
                          }
                        })}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Photo Evidence URLs & Gallery */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    On-Site Photo Evidence Gallery
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">{auditForm.photos.length} Photos Added</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Enter image link (e.g. cloud photo URL or camera upload)"
                    value={auditForm.newPhotoUrl}
                    onChange={(e) => setAuditForm({ ...auditForm, newPhotoUrl: e.target.value })}
                    className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-tafiya-blue outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                  >
                    Add Photo
                  </button>
                </div>

                {auditForm.photos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                    {auditForm.photos.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Video Walkthrough Link */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 block">
                  Video Walkthrough Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=... or Google Drive video link"
                  value={auditForm.video_url}
                  onChange={(e) => setAuditForm({ ...auditForm, video_url: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-tafiya-blue outline-none"
                />
              </div>

              {/* 5. Detailed Inspection Audit Notes */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 block">
                  Detailed Field Auditor Notes & Observations *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe building physical state, solar battery bank capacity, security guards on post, accessibility road quality..."
                  value={auditForm.report_notes}
                  onChange={(e) => setAuditForm({ ...auditForm, report_notes: e.target.value })}
                  className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-tafiya-blue outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveAuditInspection(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={auditSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-black shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  {auditSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{auditSubmitting ? 'Uploading Audit...' : 'Submit Audit Report for Super Admin Approval'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: WITHDRAWAL REQUEST MODAL                         */}
      {/* ======================================================== */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Request Bounty Withdrawal</h3>
                <p className="text-xs text-slate-500 mt-0.5">Funds are disbursed to your verified bank account</p>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Destination Bank Account Summary */}
            {walletData?.bank_details && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Payout Destination</span>
                <p className="text-xs font-black text-slate-900">{walletData.bank_details.bank_name}</p>
                <p className="text-xs font-mono font-bold text-slate-700">{walletData.bank_details.account_number} • {walletData.bank_details.account_name}</p>
              </div>
            )}

            <form onSubmit={handleRequestWithdrawal} className="space-y-5">
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700">Withdrawal Amount (₦)</label>
                  <span className="text-[11px] font-bold text-emerald-600">
                    Max: {walletData ? walletData.balance_formatted : '₦0'}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₦</span>
                  <input
                    type="number"
                    min="1000"
                    max={walletData?.balance || 0}
                    required
                    placeholder="e.g. 20000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 text-base font-black border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Minimum withdrawal amount is ₦1,000.</p>
              </div>

              {/* Quick Amount Chips */}
              <div className="flex items-center gap-2">
                {[5000, 10000, 20000, 50000].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setWithdrawAmount(amt.toString())}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-extrabold transition-all"
                  >
                    ₦{amt.toLocaleString()}
                  </button>
                ))}
                {walletData?.balance > 0 && (
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(walletData.balance.toString())}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-black"
                  >
                    All
                  </button>
                )}
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawSubmitting || !walletData || walletData.balance <= 0}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-black shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  {withdrawSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                  <span>{withdrawSubmitting ? 'Submitting...' : 'Confirm Withdrawal Request'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: BANK DETAILS CONFIGURATION MODAL                 */}
      {/* ======================================================== */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Settlement Bank Account</h3>
                <p className="text-xs text-slate-500 mt-0.5">Where your field inspection bounty payouts will be wired</p>
              </div>
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBankDetails} className="space-y-4">
              
              {/* Bank Name */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">Bank Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. First Bank of Nigeria, GTBank, Zenith Bank"
                  value={bankForm.bank_name}
                  onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-tafiya-blue outline-none font-bold"
                />
              </div>

              {/* Quick Bank Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['First Bank', 'GTBank', 'Zenith Bank', 'Access Bank', 'Kuda Bank', 'OPay', 'UBA'].map((b) => (
                  <button
                    type="button"
                    key={b}
                    onClick={() => setBankForm({ ...bankForm, bank_name: b })}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold"
                  >
                    {b}
                  </button>
                ))}
              </div>

              {/* Account Number */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">10-Digit Account Number (NUBAN) *</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="e.g. 3012345678"
                  value={bankForm.account_number}
                  onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-tafiya-blue outline-none"
                />
              </div>

              {/* Account Name */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">Account Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Usman Field Agent"
                  value={bankForm.account_name}
                  onChange={(e) => setBankForm({ ...bankForm, account_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-tafiya-blue outline-none font-bold"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bankSubmitting}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  {bankSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{bankSubmitting ? 'Saving...' : 'Save Payout Details'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: EXPLORE PROPERTY DETAILS & APPLICATION PREVIEW   */}
      {/* ======================================================== */}
      {selectedExploreProp && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-tafiya-blue bg-tafiya-blue-50 px-2.5 py-0.5 rounded-full">
                  {selectedExploreProp.property_type.replace('_', ' ')}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{selectedExploreProp.name}</h3>
                <p className="text-xs text-slate-500">{selectedExploreProp.city}, {selectedExploreProp.state}</p>
              </div>
              <button
                onClick={() => setSelectedExploreProp(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cover Image & Gallery Preview */}
            <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={selectedExploreProp.cover_image}
                alt={selectedExploreProp.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Bounty Card */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">Super Admin Inspection Bounty</span>
                <span className="text-2xl font-black text-emerald-900">{selectedExploreProp.inspection_fee_formatted}</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-sm">
                Escrow Guaranteed
              </span>
            </div>

            {/* Masking Disclosure */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Lock className="w-3.5 h-3.5 text-tafiya-orange" />
                <span>Confidential Host Credentials & Directions</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Host direct phone number, email, and exact physical gate directions will be released directly to your assignments tab once Super Admin confirms your inspection assignment.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1 text-xs">
              <span className="font-extrabold text-slate-800 block uppercase text-[10px] tracking-wider">Property Overview</span>
              <p className="text-slate-600 leading-relaxed">{selectedExploreProp.description}</p>
            </div>

            {/* Footer Apply */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedExploreProp(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>

              {selectedExploreProp.can_apply && (
                <button
                  onClick={() => handleApplyBounty(selectedExploreProp.id)}
                  className="px-6 py-2.5 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 hover:from-tafiya-blue-600 hover:to-tafiya-blue text-white rounded-xl text-xs font-black shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Apply for ₦{selectedExploreProp.inspection_fee.toLocaleString()} Bounty</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
