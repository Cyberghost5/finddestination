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
  Save,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Eye,
  MessageSquare,
  Bot,
  Send,
  CheckCheck,
  Search,
  User,
  Phone,
  Mail,
  Unlock,
  Video,
  Landmark,
  ArrowDownLeft,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export default function AdminPortal({ properties, onUpdateVerificationStatus, onTogglePublish, currentUser }) {
  const [activeTab, setActiveTab] = useState('host_approvals'); // 'host_approvals', 'verification', 'escrow', or 'payment_settings'
  const [payoutLogs, setPayoutLogs] = useState([]);

  // Host Level 1 Approval Queue State
  const [hosts, setHosts] = useState([]);
  const [isLoadingHosts, setIsLoadingHosts] = useState(false);
  const [hostActionMsg, setHostActionMsg] = useState('');
  const [hostActionError, setHostActionError] = useState('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [rejectingHostId, setRejectingHostId] = useState(null);

  // Field Agent Inspection Management State
  const [adminInspectionsSubTab, setAdminInspectionsSubTab] = useState('bounties'); // 'bounties', 'applications', 'reports'
  const [inspectionProperties, setInspectionProperties] = useState([]);
  const [inspectionApplications, setInspectionApplications] = useState([]);
  const [inspectionReports, setInspectionReports] = useState([]);
  const [agentWithdrawals, setAgentWithdrawals] = useState([]);
  const [isLoadingInspections, setIsLoadingInspections] = useState(false);
  const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(false);
  const [inspectActionMsg, setInspectActionMsg] = useState('');
  const [inspectActionError, setInspectActionError] = useState('');

  // Modals for Agent Inspections & Payouts
  const [bountyConfigModal, setBountyConfigModal] = useState(null); // { property, fee, is_open }
  const [appReviewModal, setAppReviewModal] = useState(null); // { application, action, notes }
  const [reportVerifyModal, setReportVerifyModal] = useState(null); // { report, action, notes }
  const [withdrawalActionModal, setWithdrawalActionModal] = useState(null); // { withdrawal, action, note }

  // Payment Gateway & Auth Settings State
  const [activeGateway, setActiveGateway] = useState('paystack');
  const [paystackPublicKey, setPaystackPublicKey] = useState('pk_test_finddestination_paystack_public_key_2026');
  const [monnifyApiKey, setMonnifyApiKey] = useState('MK_TEST_FINDDESTINATION_MONNIFY_API_KEY');
  const [monnifyContractCode, setMonnifyContractCode] = useState('8920184920');
  const [googleClientId, setGoogleClientId] = useState('');
  const [isSavingGateway, setIsSavingGateway] = useState(false);
  const [gatewaySaveMsg, setGatewaySaveMsg] = useState('');
  const [gatewaySaveError, setGatewaySaveError] = useState('');

  // Universal Support Desk State
  const [supportThreads, setSupportThreads] = useState([]);
  const [isLoadingSupport, setIsLoadingSupport] = useState(false);
  const [selectedSupportThreadId, setSelectedSupportThreadId] = useState(null);
  const [supportMessages, setSupportMessages] = useState([]);
  const [isLoadingSupportMessages, setIsLoadingSupportMessages] = useState(false);
  const [adminReplyInput, setAdminReplyInput] = useState('');
  const [isSendingAdminReply, setIsSendingAdminReply] = useState(false);
  const [supportSearchQuery, setSupportSearchQuery] = useState('');

  const getAdminAuthHeaders = () => {
    const token = localStorage.getItem('finddestination_token') || localStorage.getItem('tafiya_token');
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (currentUser?.id) headers['X-User-Id'] = currentUser.id;
    return headers;
  };

  const fetchSupportThreads = async () => {
    setIsLoadingSupport(true);
    try {
      const res = await fetch('/api/v1/chats', { headers: getAdminAuthHeaders() });
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        // In support desk, focus on support threads or inbound user threads
        const supportOnly = data.data.filter(t => t.type === 'support');
        setSupportThreads(supportOnly);
        if (!selectedSupportThreadId && supportOnly.length > 0) {
          setSelectedSupportThreadId(supportOnly[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load support threads', e);
    } finally {
      setIsLoadingSupport(false);
    }
  };

  const fetchSupportMessages = async (threadId, silent = false) => {
    if (!threadId) return;
    if (!silent) setIsLoadingSupportMessages(true);
    try {
      const res = await fetch(`/api/v1/chats/${threadId}/messages`, { headers: getAdminAuthHeaders() });
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        setSupportMessages(data.data.messages || []);
        // Reset unread locally
        setSupportThreads(prev => prev.map(t => t.id === threadId ? { ...t, unread_count: 0 } : t));
      }
    } catch (e) {
      console.error('Failed to load messages', e);
    } finally {
      if (!silent) setIsLoadingSupportMessages(false);
    }
  };

  const handleSendAdminReply = async (e) => {
    if (e) e.preventDefault();
    const text = adminReplyInput.trim();
    if (!text || !selectedSupportThreadId || isSendingAdminReply) return;

    const tempId = `admin-temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      sender_id: currentUser?.id,
      sender_name: currentUser?.name || 'Super Admin',
      sender_role: 'admin',
      is_me: true,
      text: text,
      is_read: false,
      time: 'Just now',
      created_at: new Date().toISOString()
    };

    setSupportMessages(prev => [...prev, optimistic]);
    setAdminReplyInput('');
    setIsSendingAdminReply(true);

    try {
      const res = await fetch(`/api/v1/chats/${selectedSupportThreadId}/messages`, {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        setSupportMessages(prev => prev.map(m => m.id === tempId ? data.data : m));
        setSupportThreads(prev => prev.map(t => {
          if (t.id === selectedSupportThreadId) {
            return {
              ...t,
              latest_message: {
                id: data.data.id,
                text: data.data.text,
                sender_role: 'admin',
                is_me: true,
                time: 'Just now'
              },
              last_message_at: new Date().toISOString()
            };
          }
          return t;
        }));
      }
    } catch (err) {
      console.error('Failed to send admin reply', err);
    } finally {
      setIsSendingAdminReply(false);
    }
  };

  // Poll for support messages
  useEffect(() => {
    fetchSupportThreads();
  }, [currentUser]);

  useEffect(() => {
    if (selectedSupportThreadId) {
      fetchSupportMessages(selectedSupportThreadId);
      const poll = setInterval(() => {
        fetchSupportMessages(selectedSupportThreadId, true);
      }, 4000);
      return () => clearInterval(poll);
    }
  }, [selectedSupportThreadId]);

  const supportUnreadTotal = supportThreads.reduce((sum, t) => sum + (t.unread_count || 0), 0);

  // Fetch Host Applications
  const fetchHosts = async () => {
    setIsLoadingHosts(true);
    try {
      const response = await fetch('/api/v1/admin/hosts');
      if (response.ok) {
        const resData = await response.json();
        if (resData.status === 'success' && resData.data) {
          setHosts(resData.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin hosts:', err);
    } finally {
      setIsLoadingHosts(false);
    }
  };

  const fetchInspectionProperties = async () => {
    setIsLoadingInspections(true);
    try {
      const res = await fetch('/api/v1/admin/inspections/properties', { headers: getAdminAuthHeaders() });
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        setInspectionProperties(data.data);
      }
    } catch (e) {
      console.error('Failed to load inspection properties', e);
    } finally {
      setIsLoadingInspections(false);
    }
  };

  const fetchInspectionApplications = async () => {
    try {
      const res = await fetch('/api/v1/admin/inspections/applications', { headers: getAdminAuthHeaders() });
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        setInspectionApplications(data.data);
      }
    } catch (e) {
      console.error('Failed to load inspection applications', e);
    }
  };

  const fetchInspectionReports = async () => {
    try {
      const res = await fetch('/api/v1/admin/inspections/reports', { headers: getAdminAuthHeaders() });
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        setInspectionReports(data.data);
      }
    } catch (e) {
      console.error('Failed to load inspection reports', e);
    }
  };

  const fetchAgentWithdrawals = async () => {
    setIsLoadingWithdrawals(true);
    try {
      const res = await fetch('/api/v1/admin/withdrawals', { headers: getAdminAuthHeaders() });
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        setAgentWithdrawals(data.data);
      }
    } catch (e) {
      console.error('Failed to load agent withdrawals', e);
    } finally {
      setIsLoadingWithdrawals(false);
    }
  };

  const fetchAllAgentAdminData = async () => {
    await Promise.all([
      fetchInspectionProperties(),
      fetchInspectionApplications(),
      fetchInspectionReports(),
      fetchAgentWithdrawals(),
    ]);
  };

  const handleSaveBountyConfig = async (e) => {
    e.preventDefault();
    if (!bountyConfigModal) return;
    setInspectActionMsg('');
    setInspectActionError('');

    try {
      const res = await fetch(`/api/v1/admin/inspections/properties/${bountyConfigModal.property.id}/open`, {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({
          is_open_for_inspection: bountyConfigModal.is_open,
          inspection_fee: parseFloat(bountyConfigModal.fee) || 0,
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setInspectActionMsg(data.message || 'Property bounty configuration updated!');
        setBountyConfigModal(null);
        fetchInspectionProperties();
      } else {
        setInspectActionError(data.message || 'Failed to update bounty configuration.');
      }
    } catch (err) {
      setInspectActionError('Network error updating bounty configuration: ' + err.message);
    }
  };

  const handleRespondApplication = async (e) => {
    e.preventDefault();
    if (!appReviewModal) return;
    setInspectActionMsg('');
    setInspectActionError('');

    try {
      const res = await fetch(`/api/v1/admin/inspections/applications/${appReviewModal.application.id}/respond`, {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({
          action: appReviewModal.action,
          admin_review_notes: appReviewModal.notes,
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setInspectActionMsg(data.message || 'Application response recorded!');
        setAppReviewModal(null);
        fetchAllAgentAdminData();
      } else {
        setInspectActionError(data.message || 'Failed to process application response.');
      }
    } catch (err) {
      setInspectActionError('Network error: ' + err.message);
    }
  };

  const handleVerifyReport = async (e) => {
    e.preventDefault();
    if (!reportVerifyModal) return;
    setInspectActionMsg('');
    setInspectActionError('');

    try {
      const res = await fetch(`/api/v1/admin/inspections/${reportVerifyModal.report.id}/verify`, {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({
          action: reportVerifyModal.action,
          admin_review_notes: reportVerifyModal.notes,
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setInspectActionMsg(data.message || 'Inspection report processed successfully!');
        setReportVerifyModal(null);
        fetchAllAgentAdminData();
      } else {
        setInspectActionError(data.message || 'Failed to verify inspection report.');
      }
    } catch (err) {
      setInspectActionError('Network error: ' + err.message);
    }
  };

  const handleProcessWithdrawal = async (e) => {
    e.preventDefault();
    if (!withdrawalActionModal) return;
    setInspectActionMsg('');
    setInspectActionError('');

    try {
      const res = await fetch(`/api/v1/admin/withdrawals/${withdrawalActionModal.withdrawal.id}/process`, {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({
          action: withdrawalActionModal.action,
          admin_note: withdrawalActionModal.note,
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setInspectActionMsg(data.message || 'Withdrawal request updated!');
        setWithdrawalActionModal(null);
        fetchAgentWithdrawals();
      } else {
        setInspectActionError(data.message || 'Failed to process withdrawal.');
      }
    } catch (err) {
      setInspectActionError('Network error: ' + err.message);
    }
  };

  useEffect(() => {
    fetchHosts();
    fetchAllAgentAdminData();

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
            setGoogleClientId(resData.data.google_client_id || '');
          }
        }
      } catch (err) {
        console.error('Failed to fetch platform settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdateHostApproval = async (hostId, newStatus, reason = '') => {
    setIsLoadingHosts(true);
    setHostActionMsg('');
    setHostActionError('');

    try {
      const token = localStorage.getItem('finddestination_token') || localStorage.getItem('tafiya_token');
      const response = await fetch(`/api/v1/admin/hosts/${hostId}/approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          host_status: newStatus,
          rejection_reason: reason
        })
      });

      const resData = await response.json();

      if (response.ok && resData.status === 'success') {
        setHostActionMsg(`Host application ${newStatus === 'approved' ? 'APPROVED' : 'REJECTED'} successfully!`);
        setRejectingHostId(null);
        setRejectionReasonInput('');
        fetchHosts();
      } else {
        setHostActionError(resData.message || 'Failed to update host approval status');
      }
    } catch (err) {
      setHostActionError('Network error updating host approval');
    } finally {
      setIsLoadingHosts(false);
    }
  };

  const handleSavePaymentSettings = async (e) => {
    e.preventDefault();
    setIsSavingGateway(true);
    setGatewaySaveMsg('');
    setGatewaySaveError('');

    try {
      const token = localStorage.getItem('finddestination_token') || localStorage.getItem('tafiya_token');
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
          monnify_contract_code: monnifyContractCode,
          google_client_id: googleClientId
        })
      });

      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        setGatewaySaveMsg(`Platform settings saved successfully!`);
        if (resData.data) {
          setActiveGateway(resData.data.active_gateway);
          setPaystackPublicKey(resData.data.paystack_public_key || '');
          setMonnifyApiKey(resData.data.monnify_api_key || '');
          setMonnifyContractCode(resData.data.monnify_contract_code || '');
          setGoogleClientId(resData.data.google_client_id || '');
        }
      } else {
        setGatewaySaveError(resData.message || 'Failed to update platform settings.');
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

  const pendingHostsCount = hosts.filter(h => h.host_status === 'pending_approval').length;
  const pendingApplicationsCount = inspectionApplications.filter(a => a.status === 'pending').length;
  const submittedReportsCount = inspectionReports.filter(r => r.status === 'submitted').length;
  const pendingWithdrawalsCount = agentWithdrawals.filter(w => w.status === 'pending').length;

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
              <h1 className="text-xl font-black">Super Admin & Verification Console</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white">
                Multi-Level Governance
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Host CAC Audits • Field Agent Bounties • Tier 3 Certified Verification • Escrow Payouts</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllAgentAdminData}
            title="Refresh All Admin Queues"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-2xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingInspections || isLoadingWithdrawals ? 'animate-spin text-tafiya-blue' : ''}`} />
            <span>Sync Queues</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
            <Sparkles className="w-4 h-4 text-tafiya-gold" />
            <span>Super Admin Authority</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Pending Level 1 Host Approvals */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Host CAC Queue</span>
          <div className="text-2xl font-black text-amber-600">{pendingHostsCount} Hosts</div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-600" /> CAC Check Needed
          </span>
        </div>

        {/* Inspector Applications & Audits */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Agent Inspection Queue</span>
          <div className="text-2xl font-black text-tafiya-blue">{pendingApplicationsCount + submittedReportsCount} Active</div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            <Navigation className="w-3 h-3 text-tafiya-blue" /> {submittedReportsCount} Audits for Review
          </span>
        </div>

        {/* Pending Agent Withdrawals */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Agent Payout Requests</span>
          <div className="text-2xl font-black text-emerald-600">{pendingWithdrawalsCount} Payouts</div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            <DollarSign className="w-3 h-3 text-emerald-600" /> Bank Transfer Ready
          </span>
        </div>

        {/* Total Escrow */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Escrow Funds</span>
          <div className="text-2xl font-black text-slate-900">₦{escrowTotal.toLocaleString()}</div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <Lock className="w-3 h-3" /> Monnify/Paystack Escrow
          </span>
        </div>

        {/* Total Listings */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Active Listings</span>
          <div className="text-2xl font-black text-slate-900">{properties.length} Properties</div>
          <span className="text-[11px] font-medium text-slate-500">Tier 1-3 Verified</span>
        </div>

      </div>

      {/* Main Tab Controls */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-200">
          
          {/* TAB 1: Host CAC Approvals */}
          <button
            onClick={() => setActiveTab('host_approvals')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'host_approvals'
                ? 'border-tafiya-blue text-tafiya-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Host CAC Approvals (Level 1)</span>
            {pendingHostsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                {pendingHostsCount}
              </span>
            )}
          </button>

          {/* TAB 2: Field Agent Inspections & Bounties (NEW) */}
          <button
            onClick={() => setActiveTab('agent_inspections')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'agent_inspections'
                ? 'border-tafiya-blue text-tafiya-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Navigation className="w-4 h-4 text-tafiya-blue" />
            <span>Agent Inspections & Bounties</span>
            {(pendingApplicationsCount + submittedReportsCount) > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[10px]">
                {pendingApplicationsCount + submittedReportsCount}
              </span>
            )}
          </button>

          {/* TAB 3: Agent Payouts & Withdrawals (NEW) */}
          <button
            onClick={() => setActiveTab('agent_withdrawals')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'agent_withdrawals'
                ? 'border-tafiya-blue text-tafiya-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Agent Withdrawals</span>
            {pendingWithdrawalsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                {pendingWithdrawalsCount}
              </span>
            )}
          </button>

          {/* TAB 4: Property Verification & Publishing */}
          <button
            onClick={() => setActiveTab('verification')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'verification'
                ? 'border-tafiya-blue text-tafiya-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Level 2 Property Publishing</span>
          </button>

          {/* TAB 5: Escrow Settlement */}
          <button
            onClick={() => setActiveTab('escrow')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
              activeTab === 'escrow'
                ? 'border-tafiya-blue text-tafiya-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Escrow Settlement & Host Payouts
          </button>

          {/* TAB 6: Super Admin Support Desk */}
          <button
            onClick={() => setActiveTab('support_desk')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'support_desk'
                ? 'border-tafiya-blue text-tafiya-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-tafiya-blue" />
            <span>Escrow Support Desk</span>
            {supportUnreadTotal > 0 && (
              <span className="bg-tafiya-orange text-white text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                {supportUnreadTotal}
              </span>
            )}
          </button>

          {/* TAB 7: Payment Gateway Settings */}
          <button
            onClick={() => setActiveTab('payment_settings')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'payment_settings'
                ? 'border-tafiya-blue text-tafiya-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Gateway Settings ({activeGateway.toUpperCase()})</span>
          </button>
        </div>

        {/* VIEW 1: HOST CAC LEVEL 1 APPROVAL QUEUE */}
        {activeTab === 'host_approvals' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Level 1 Governance: Host CAC & Business Verification Queue</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hosts must pass Super Admin CAC credential audit before accessing host workspace or uploading properties.
                </p>
              </div>

              <button
                onClick={fetchHosts}
                disabled={isLoadingHosts}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHosts ? 'animate-spin' : ''}`} />
                <span>Refresh Queue</span>
              </button>
            </div>

            {/* Status Notifications */}
            {hostActionMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{hostActionMsg}</span>
              </div>
            )}

            {hostActionError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{hostActionError}</span>
              </div>
            )}

            {/* Host Applications Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Host / Applicant</th>
                    <th className="p-4">Corporate Business Details</th>
                    <th className="p-4">CAC Reg Number</th>
                    <th className="p-4">TIN Number</th>
                    <th className="p-4">Level 1 Status</th>
                    <th className="p-4 text-right">Super Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {hosts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                        No host applications currently in queue.
                      </td>
                    </tr>
                  ) : (
                    hosts.map((host) => (
                      <tr key={host.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4">
                          <span className="font-bold text-slate-900 block">{host.name}</span>
                          <span className="text-[11px] text-slate-500">{host.email}</span>
                          <span className="text-[10px] text-slate-400 block">{host.phone}</span>
                        </td>

                        <td className="p-4 font-semibold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-tafiya-blue shrink-0" />
                            <span>{host.business_name || 'N/A'}</span>
                          </div>
                        </td>

                        <td className="p-4 font-mono font-bold text-slate-900">
                          {host.cac_number ? (
                            <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                              {host.cac_number}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal italic">Not Provided</span>
                          )}
                        </td>

                        <td className="p-4 font-mono text-xs text-slate-600">
                          {host.tin_number || 'N/A'}
                        </td>

                        <td className="p-4">
                          {host.host_status === 'pending_approval' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1 inline-flex">
                              <Clock className="w-3 h-3 text-amber-600" /> Pending Review
                            </span>
                          )}
                          {host.host_status === 'approved' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 inline-flex">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Level 1 Approved
                            </span>
                          )}
                          {host.host_status === 'rejected' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-800 border border-red-200 flex items-center gap-1 inline-flex">
                              <AlertTriangle className="w-3 h-3 text-red-600" /> Audit Rejected
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {host.host_status !== 'approved' && (
                              <button
                                onClick={() => handleUpdateHostApproval(host.id, 'approved')}
                                disabled={isLoadingHosts}
                                className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-[11px] font-bold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve CAC
                              </button>
                            )}

                            {host.host_status !== 'rejected' && (
                              <button
                                onClick={() => setRejectingHostId(rejectingHostId === host.id ? null : host.id)}
                                disabled={isLoadingHosts}
                                className="px-3.5 py-1.5 bg-slate-100 hover:bg-red-50 text-red-600 rounded-xl text-[11px] font-bold transition-colors cursor-pointer border border-slate-200 flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            )}
                          </div>

                          {/* Rejection Modal Inline */}
                          {rejectingHostId === host.id && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-left space-y-2 animate-in fade-in duration-200">
                              <label className="text-[10px] font-extrabold text-red-900 block uppercase">
                                State Rejection Reason for Host
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. CAC Registration Number not found on corporate registry."
                                value={rejectionReasonInput}
                                onChange={(e) => setRejectionReasonInput(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs border border-red-200 rounded-lg bg-white focus:outline-none font-semibold text-slate-800"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setRejectingHostId(null)}
                                  className="px-2.5 py-1 text-[10px] font-bold text-slate-600 hover:text-slate-800"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateHostApproval(host.id, 'rejected', rejectionReasonInput)}
                                  className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg shadow-sm hover:bg-red-700"
                                >
                                  Confirm Rejection
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW: FIELD AGENT INSPECTIONS & BOUNTIES */}
        {activeTab === 'agent_inspections' && (
          <div className="space-y-6">
            
            {/* Top Sub-tabs Bar */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Field Agent Inspection Governance & Bounties</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set inspection fee bounties, review inspector applications, and verify on-site audit evidence to release wallet bounties.
                </p>
              </div>

              {/* Sub-tab pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl shrink-0">
                <button
                  onClick={() => setAdminInspectionsSubTab('bounties')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    adminInspectionsSubTab === 'bounties'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bounty Setup ({inspectionProperties.filter(p => p.is_open_for_inspection).length} Open)
                </button>

                <button
                  onClick={() => setAdminInspectionsSubTab('applications')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    adminInspectionsSubTab === 'applications'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Inspector Applications</span>
                  {pendingApplicationsCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                      {pendingApplicationsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setAdminInspectionsSubTab('reports')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    adminInspectionsSubTab === 'reports'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Audit Reports</span>
                  {submittedReportsCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">
                      {submittedReportsCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Notifications */}
            {inspectActionMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{inspectActionMsg}</span>
              </div>
            )}
            {inspectActionError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{inspectActionError}</span>
              </div>
            )}

            {/* SUB-VIEW 1: BOUNTY SETUP & FEES */}
            {adminInspectionsSubTab === 'bounties' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Properties Open for Regional Field Bounty</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Toggle inspection availability and configure bounty payout amounts.</p>
                  </div>
                  <button
                    onClick={fetchInspectionProperties}
                    disabled={isLoadingInspections}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInspections ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-4">Property</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Host Liaison</th>
                        <th className="p-4">Bounty Amount</th>
                        <th className="p-4">Inspection Status</th>
                        <th className="p-4">Assigned Agent</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {inspectionProperties.map((prop) => (
                        <tr key={prop.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={prop.cover_image} alt={prop.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200" />
                              <div>
                                <span className="font-bold text-slate-900 block line-clamp-1">{prop.name}</span>
                                <span className="text-[10px] text-slate-400 capitalize">{prop.property_type.replace('_', ' ')}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-slate-600">
                            {prop.city}, {prop.state}
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block">{prop.host?.name || '—'}</span>
                            <span className="text-[11px] text-slate-400">{prop.host?.phone || '—'}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-black text-emerald-600 font-mono text-sm">
                              {prop.inspection_fee_formatted}
                            </span>
                          </td>
                          <td className="p-4">
                            {prop.is_open_for_inspection ? (
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                prop.inspection_status === 'verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : prop.inspection_status === 'submitted'
                                  ? 'bg-blue-100 text-blue-800'
                                  : prop.inspection_status === 'assigned'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {prop.inspection_status || 'Open / Unassigned'}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-400">
                                Closed
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {prop.assigned_agent ? (
                              <div>
                                <span className="font-bold text-slate-900 block">{prop.assigned_agent.name}</span>
                                <span className="text-[11px] text-slate-400">{prop.assigned_agent.phone}</span>
                              </div>
                            ) : prop.pending_applications_count > 0 ? (
                              <span className="text-amber-600 font-bold text-[11px]">
                                {prop.pending_applications_count} Application(s) Pending
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">No Inspector</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setBountyConfigModal({
                                property: prop,
                                fee: prop.inspection_fee || 25000,
                                is_open: prop.is_open_for_inspection,
                              })}
                              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold shadow-sm transition-all cursor-pointer"
                            >
                              Configure Bounty
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: INSPECTOR APPLICATIONS QUEUE */}
            {adminInspectionsSubTab === 'applications' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Regional Field Inspector Applications</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Authorizing an application unlocks confidential host contact details and exact address for the agent.</p>
                  </div>
                  <button
                    onClick={fetchInspectionApplications}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>

                {inspectionApplications.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-bold">
                    No inspection applications submitted yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-4">Inspector</th>
                          <th className="p-4">Target Property</th>
                          <th className="p-4">Bounty Amount</th>
                          <th className="p-4">Applied Date</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Super Admin Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {inspectionApplications.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-4">
                              <span className="font-bold text-slate-900 block">{app.agent_name}</span>
                              <span className="text-[11px] text-slate-400">{app.agent_phone} • {app.agent_email}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-slate-900 block">{app.property_name}</span>
                              <span className="text-[11px] text-slate-500">{app.property_city}, {app.property_state}</span>
                            </td>
                            <td className="p-4 font-black text-emerald-600 font-mono">
                              {app.inspection_fee_formatted}
                            </td>
                            <td className="p-4 text-slate-500">{app.applied_at}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                app.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : app.status === 'declined'
                                  ? 'bg-red-50 text-red-800 border border-red-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}>
                                {app.status === 'approved' ? 'Authorized' : app.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {app.status === 'pending' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setAppReviewModal({
                                      application: app,
                                      action: 'approved',
                                      notes: 'Authorized by Super Admin. Property and host contact details unlocked.'
                                    })}
                                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Authorize Inspector</span>
                                  </button>
                                  <button
                                    onClick={() => setAppReviewModal({
                                      application: app,
                                      action: 'declined',
                                      notes: 'Application declined by Super Admin.'
                                    })}
                                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-red-50 text-red-600 rounded-xl text-[11px] font-bold transition-all cursor-pointer border border-slate-200 flex items-center gap-1"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Decline</span>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-semibold italic">
                                  {app.status === 'approved' ? 'Inspector Authorized' : 'Application Processed'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW 3: ON-SITE FIELD AUDIT VERIFICATION */}
            {adminInspectionsSubTab === 'reports' && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Physical Site Audit Evidence Review Queue</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verify GPS coordinates, photographic proof, video walkthrough, and amenities checklist. Approving automatically upgrades the property to Tier 3 Certified badge and deposits the bounty into the agent's wallet.
                    </p>
                  </div>
                  <button
                    onClick={fetchInspectionReports}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>

                {inspectionReports.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs font-bold text-slate-400">
                    No field audit reports awaiting review.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inspectionReports.map((report) => {
                      const isSubmitted = report.status === 'submitted';
                      const isVerified = report.status === 'verified';

                      return (
                        <div
                          key={report.id}
                          className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-black text-slate-900">{report.property_name}</h4>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {isVerified ? 'Tier 3 Certified & Bounty Paid' : 'Awaiting Super Admin Audit'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                <span>{report.address}, {report.city}</span>
                                <span>•</span>
                                <span>Inspector: <strong className="text-slate-800">{report.agent?.name}</strong> ({report.agent?.phone})</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Bounty Payout</span>
                                <span className="text-lg font-black text-emerald-600">{report.inspection_fee_formatted}</span>
                              </div>

                              {isSubmitted && (
                                <button
                                  onClick={() => setReportVerifyModal({
                                    report: report,
                                    action: 'approved',
                                    notes: 'Field evidence confirmed. GPS reading within perimeter. Tier 3 Certified badge awarded.'
                                  })}
                                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Approve Audit & Release {report.inspection_fee_formatted}</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Audit Evidence Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* 1. GPS Coordinates */}
                            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider flex items-center gap-1">
                                <Navigation className="w-3.5 h-3.5 text-tafiya-blue" />
                                <span>GPS Coordinates Reading</span>
                              </span>
                              <div className="font-mono text-xs text-emerald-400 font-black">
                                <div>Lat: {report.gps_latitude || 'N/A'}</div>
                                <div>Lng: {report.gps_longitude || 'N/A'}</div>
                              </div>
                              <span className="text-[10px] text-slate-400 block">Verified within on-site geolocation boundaries</span>
                            </div>

                            {/* 2. Walkthrough Video Link */}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider flex items-center gap-1">
                                <Video className="w-3.5 h-3.5 text-tafiya-orange" />
                                <span>Video Walkthrough</span>
                              </span>
                              {report.video_url ? (
                                <a
                                  href={report.video_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-bold text-tafiya-blue hover:underline flex items-center gap-1"
                                >
                                  <span>Watch Field Tour Video</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-xs text-slate-400 italic">No video link provided</span>
                              )}
                            </div>

                            {/* 3. Amenities Checklist */}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Amenities Verification</span>
                              </span>
                              <div className="text-[11px] space-y-1 font-semibold text-slate-700">
                                {report.amenities_check && typeof report.amenities_check === 'object' ? (
                                  Object.entries(report.amenities_check).slice(0, 3).map(([k, v]) => (
                                    <div key={k} className="flex items-center gap-1.5">
                                      {v ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-red-500" />}
                                      <span className="capitalize">{k.replace('_', ' ')}: {v ? 'Confirmed' : 'Deficient'}</span>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-slate-400 italic">No checklist recorded</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Photos Evidence Gallery */}
                          {report.photos && report.photos.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                                Field Audit Photo Evidence ({report.photos.length} Captured)
                              </span>
                              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                                {report.photos.map((photo, pIdx) => (
                                  <a key={pIdx} href={photo} target="_blank" rel="noreferrer" className="shrink-0 group">
                                    <img
                                      src={photo}
                                      alt={`Evidence ${pIdx + 1}`}
                                      className="w-24 h-24 rounded-xl object-cover border border-slate-200 group-hover:opacity-90 transition-opacity"
                                    />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Auditor Notes */}
                          {report.report_notes && (
                            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Inspector Field Remarks:</span>
                              <p className="leading-relaxed">{report.report_notes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* VIEW: AGENT PAYOUTS & WITHDRAWALS */}
        {activeTab === 'agent_withdrawals' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Field Agent Withdrawal & Payout Processing Desk</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Process bank disbursements to regional inspectors. Rejecting automatically refunds the debited amount back to the agent's wallet.
                </p>
              </div>
              <button
                onClick={fetchAgentWithdrawals}
                disabled={isLoadingWithdrawals}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWithdrawals ? 'animate-spin' : ''}`} />
                <span>Refresh Requests</span>
              </button>
            </div>

            {/* Notifications */}
            {inspectActionMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{inspectActionMsg}</span>
              </div>
            )}
            {inspectActionError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{inspectActionError}</span>
              </div>
            )}

            {/* Withdrawals Table */}
            {agentWithdrawals.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-bold">
                No agent withdrawal requests in queue.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Inspector</th>
                      <th className="p-4">Payout Amount</th>
                      <th className="p-4">Destination Bank Account</th>
                      <th className="p-4">Reference</th>
                      <th className="p-4">Requested At</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Super Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {agentWithdrawals.map((w) => {
                      const isPending = w.status === 'pending';
                      const isApproved = w.status === 'approved';
                      const isRejected = w.status === 'rejected';

                      return (
                        <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block">{w.agent_name}</span>
                            <span className="text-[11px] text-slate-400">{w.agent_phone} • {w.agent_email}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-black text-slate-900 font-mono text-sm">
                              {w.amount_formatted}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block">{w.bank_name}</span>
                            <span className="text-[11px] font-mono text-slate-600 font-bold">{w.account_number} ({w.account_name})</span>
                          </td>
                          <td className="p-4 font-mono text-slate-500 text-[11px]">{w.transaction_reference}</td>
                          <td className="p-4 text-slate-500">{w.created_at}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              isApproved
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : isRejected
                                ? 'bg-red-50 text-red-800 border border-red-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              {isApproved ? 'Disbursed / Paid' : isRejected ? 'Refunded' : 'Pending Disbursal'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setWithdrawalActionModal({
                                    withdrawal: w,
                                    action: 'approved',
                                    note: 'Disbursed via automated bank transfer reference NIBSS-' + Math.floor(100000 + Math.random() * 900000)
                                  })}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Mark Paid</span>
                                </button>
                                <button
                                  onClick={() => setWithdrawalActionModal({
                                    withdrawal: w,
                                    action: 'rejected',
                                    note: 'Withdrawal rejected and balance refunded back to agent wallet.'
                                  })}
                                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-red-50 text-red-600 rounded-xl text-[11px] font-bold transition-all cursor-pointer border border-slate-200 flex items-center gap-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Decline & Refund</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic font-semibold">
                                {isApproved ? 'Transfer Completed' : 'Declined & Refunded'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: LEVEL 2 PROPERTY AUDIT & PUBLISHING */}
        {activeTab === 'verification' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Level 2 Governance: Property Verification & Publishing Control</h3>
                <p className="text-xs text-slate-500 mt-0.5">Review property details, award Tier 2/3 verification badges, and approve live publishing.</p>
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
                      <p className="text-[11px] text-slate-400">Host: {prop.host?.name || 'Approved Host Provider'}</p>
                    </div>
                  </div>

                  {/* Tier & Publishing Action Controls */}
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
                        <span>Tier 3 Certified</span>
                      </span>
                    )}

                    {/* Level 2 Publishing Toggle */}
                    {onTogglePublish && (
                      <button
                        onClick={() => onTogglePublish(prop.id)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                          prop.is_published 
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {prop.is_published ? 'Published Live' : 'Publish to Public Site'}
                      </button>
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
                        <span>Award Tier 3</span>
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: ESCROW PAYOUT MONITORING */}
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

        {/* VIEW 4: PAYMENT GATEWAY CONFIGURATION */}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

                  {/* Google OAuth Client ID */}
                  <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-tafiya-blue" />
                      <span>Google OAuth Client ID</span>
                    </label>
                    <input 
                      type="text"
                      value={googleClientId}
                      onChange={(e) => setGoogleClientId(e.target.value)}
                      placeholder="...apps.googleusercontent.com"
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-tafiya-blue text-slate-800"
                    />
                    <p className="text-[10px] text-slate-400">Google Cloud Console OAuth 2.0 Web Client ID for live login popup.</p>
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

        {/* VIEW 5: ESCROW SUPPORT DESK CONSOLE */}
        {activeTab === 'support_desk' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px]">

            {/* Left Column: Support Tickets & Inbound Threads */}
            <div className="md:col-span-5 border-r border-slate-200/80 flex flex-col bg-slate-50/40">
              <div className="p-4 border-b border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-tafiya-blue" />
                    <span>Inbound Support Inquiries</span>
                  </h3>
                  <button
                    onClick={fetchSupportThreads}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Refresh inquiries"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSupport ? 'animate-spin text-tafiya-blue' : ''}`} />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={supportSearchQuery}
                    onChange={(e) => setSupportSearchQuery(e.target.value)}
                    placeholder="Search user, role, email..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tafiya-blue bg-white"
                  />
                </div>
              </div>

              {/* Inbound Threads List */}
              <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[480px]">
                {isLoadingSupport && supportThreads.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <RefreshCw className="w-5 h-5 text-tafiya-blue animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-semibold">Loading support inquiries...</p>
                  </div>
                ) : supportThreads.length === 0 ? (
                  <div className="p-8 text-center space-y-3">
                    <Bot className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">No support tickets</p>
                    <p className="text-[11px] text-slate-400">All user inquiries will appear here in real time.</p>
                  </div>
                ) : (
                  supportThreads
                    .filter(t => {
                      if (!supportSearchQuery.trim()) return true;
                      const q = supportSearchQuery.toLowerCase();
                      const name = (t.other_party?.name || '').toLowerCase();
                      const role = (t.other_party?.role || '').toLowerCase();
                      const email = (t.other_party?.email || '').toLowerCase();
                      return name.includes(q) || role.includes(q) || email.includes(q);
                    })
                    .map(t => {
                      const isSelected = t.id === selectedSupportThreadId;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedSupportThreadId(t.id)}
                          className={`p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                            isSelected ? 'bg-tafiya-blue-50/70 border-l-4 border-tafiya-blue' : 'hover:bg-white'
                          }`}
                        >
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full bg-slate-900 text-tafiya-gold flex items-center justify-center font-bold text-xs shadow-xs border border-slate-800">
                              {t.other_party?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            {t.unread_count > 0 && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-tafiya-orange text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
                                {t.unread_count}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {t.other_party?.name || 'Platform User'}
                              </h4>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {t.latest_message ? t.latest_message.time : ''}
                              </span>
                            </div>

                            <p className="text-[10px] text-tafiya-blue font-bold truncate">
                              {t.other_party?.role || 'Guest'} • {t.other_party?.email || 'Registered User'}
                            </p>

                            <p className="text-[11px] text-slate-500 truncate mt-1">
                              {t.latest_message ? t.latest_message.text : 'Opened inquiry'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* Right Column: Active Conversation Pane */}
            <div className="md:col-span-7 flex flex-col bg-white">
              {selectedSupportThreadId ? (
                <>
                  {/* Active Header */}
                  {(() => {
                    const activeT = supportThreads.find(t => t.id === selectedSupportThreadId);
                    return (
                      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-tafiya-gold flex items-center justify-center font-bold text-sm">
                            {activeT?.other_party?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                              <span>{activeT?.other_party?.name || 'Inbound User'}</span>
                              <span className="text-[9px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                                {activeT?.other_party?.role || 'Guest'}
                              </span>
                            </h4>
                            <p className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{activeT?.other_party?.email || 'support@finddestination.com.ng'}</span>
                              {activeT?.other_party?.phone && <span>• {activeT.other_party.phone}</span>}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          Active Ticket
                        </span>
                      </div>
                    );
                  })()}

                  {/* Message History */}
                  <div className="p-4 space-y-3 overflow-y-auto flex-1 max-h-[360px] bg-slate-50/20">
                    {isLoadingSupportMessages ? (
                      <div className="p-8 text-center space-y-2">
                        <RefreshCw className="w-5 h-5 text-tafiya-blue animate-spin mx-auto" />
                        <p className="text-xs text-slate-400">Loading conversation history...</p>
                      </div>
                    ) : supportMessages.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-400">
                        No messages yet in this ticket.
                      </div>
                    ) : (
                      supportMessages.map(m => {
                        const isAdminSender = m.sender_role === 'admin' || m.is_me;
                        return (
                          <div key={m.id} className={`flex ${isAdminSender ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs space-y-1 shadow-xs ${
                              isAdminSender
                                ? 'bg-slate-900 text-white rounded-br-none border border-slate-800'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                            }`}>
                              <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/20 text-[9px] font-bold">
                                <span className={isAdminSender ? 'text-tafiya-gold' : 'text-tafiya-blue'}>
                                  {isAdminSender ? 'Super Admin Support' : m.sender_name}
                                </span>
                                <span className={`text-[8px] uppercase px-1.5 py-0.2 rounded ${
                                  isAdminSender ? 'bg-amber-400/20 text-tafiya-gold' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {m.sender_role}
                                </span>
                              </div>
                              <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                              <div className={`flex items-center gap-1 text-[9px] pt-0.5 ${
                                isAdminSender ? 'text-slate-400 justify-end' : 'text-slate-400 justify-start'
                              }`}>
                                <span>{m.time}</span>
                                {isAdminSender && <CheckCheck className="w-3 h-3 text-tafiya-gold" />}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Super Admin Quick Response Chips */}
                  <div className="px-4 py-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-white">
                    {[
                      'Your escrow payment has been verified and secured.',
                      'A verification field agent has inspected the property.',
                      'Your check-in voucher has been re-dispatched to your email.',
                      'Please provide your booking reference number.'
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAdminReplyInput(chip)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-tafiya-blue-50 hover:text-tafiya-blue text-slate-600 rounded-full text-[10px] font-semibold whitespace-nowrap cursor-pointer transition-colors shrink-0"
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>

                  {/* Super Admin Reply Form */}
                  <form onSubmit={handleSendAdminReply} className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white">
                    <input
                      type="text"
                      value={adminReplyInput}
                      onChange={(e) => setAdminReplyInput(e.target.value)}
                      placeholder="Type official reply as Super Admin..."
                      className="flex-1 px-4 py-2.5 text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tafiya-blue"
                      disabled={isSendingAdminReply}
                    />
                    <button
                      type="submit"
                      disabled={!adminReplyInput.trim() || isSendingAdminReply}
                      className="px-4 py-2.5 bg-slate-900 text-white rounded-2xl flex items-center gap-1.5 text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer shadow-sm shrink-0"
                    >
                      {isSendingAdminReply ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-tafiya-gold" />
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-tafiya-gold" />
                          <span>Reply</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <Bot className="w-12 h-12 text-slate-300" />
                  <p className="text-xs font-bold text-slate-700">Select a support ticket</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Choose a conversation on the left to review user inquiries and respond as Super Admin.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* MODAL 1: CONFIGURE INSPECTION BOUNTY */}
        {bountyConfigModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-tafiya-blue-50 text-tafiya-blue flex items-center justify-center font-bold">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Configure Inspection Bounty</h3>
                    <p className="text-[11px] text-slate-400 truncate max-w-[240px]">{bountyConfigModal.property?.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setBountyConfigModal(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveBountyConfig} className="space-y-4">
                {/* Toggle open for inspection */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Open for Field Agent Bounties</span>
                    <span className="text-[10px] text-slate-400">Listed on certified regional agents explore view</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBountyConfigModal(prev => ({ ...prev, is_open: !prev.is_open }))}
                    className={`w-12 h-6.5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                      bountyConfigModal.is_open ? 'bg-tafiya-blue' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform ${
                        bountyConfigModal.is_open ? 'translate-x-5.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Bounty Fee Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Inspection Payout Bounty Amount (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₦</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={bountyConfigModal.fee}
                      onChange={(e) => setBountyConfigModal(prev => ({ ...prev, fee: e.target.value }))}
                      placeholder="e.g. 25000"
                      className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl font-mono font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-tafiya-blue"
                      required
                    />
                  </div>

                  {/* Preset fee chips */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400">Presets:</span>
                    {[15000, 25000, 35000, 50000].map(val => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setBountyConfigModal(prev => ({ ...prev, fee: val }))}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                          Number(bountyConfigModal.fee) === val
                            ? 'bg-tafiya-blue text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        ₦{val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-[11px] text-blue-900/80 leading-relaxed">
                  Upon successful on-site audit verification by Super Admin, this bounty amount will be automatically deposited directly into the inspector's verified wallet.
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setBountyConfigModal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-tafiya-blue hover:bg-tafiya-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-tafiya-blue/20 cursor-pointer"
                  >
                    Save Configuration
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: INSPECTOR APPLICATION REVIEW */}
        {appReviewModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    appReviewModal.action === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {appReviewModal.action === 'approved' ? <ShieldCheck className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {appReviewModal.action === 'approved' ? 'Authorize Inspector Assignment' : 'Decline Bounty Application'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Agent: {appReviewModal.application?.agent_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAppReviewModal(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRespondApplication} className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Property:</span>
                    <span className="font-bold text-slate-900">{appReviewModal.application?.property_name}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Bounty Fee:</span>
                    <span className="font-mono font-bold text-emerald-700">₦{Number(appReviewModal.application?.bounty_fee || 0).toLocaleString()}</span>
                  </div>
                </div>

                {appReviewModal.action === 'approved' ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-900 leading-relaxed flex items-start gap-2">
                    <Unlock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Authorizing will immediately unlock full host liaison contacts (phone, WhatsApp, and exact gated directions) in this agent's portal.
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-[11px] text-red-900 leading-relaxed">
                    Declining will notify the agent and reopen the property bounty for other regional verifiers.
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Super Admin Review Remarks / Guidance (Optional)
                  </label>
                  <textarea
                    rows="3"
                    value={appReviewModal.notes}
                    onChange={(e) => setAppReviewModal(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder={appReviewModal.action === 'approved' ? 'e.g. Please prioritize verification of electrical backup and water pressure.' : 'e.g. Inspector currently has max pending assignments.'}
                    className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-tafiya-blue"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setAppReviewModal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                      appReviewModal.action === 'approved'
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                        : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                    }`}
                  >
                    {appReviewModal.action === 'approved' ? 'Confirm Approval & Release Info' : 'Confirm Decline'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: AUDIT VERIFICATION & TIER 3 CERTIFICATION */}
        {reportVerifyModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    reportVerifyModal.action === 'verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {reportVerifyModal.action === 'verified' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {reportVerifyModal.action === 'verified' ? 'Approve Audit & Release Bounty' : 'Request Report Revision'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Report #{reportVerifyModal.report?.id} • {reportVerifyModal.report?.property_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReportVerifyModal(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleVerifyReport} className="space-y-4">
                {reportVerifyModal.action === 'verified' ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-2">
                    <div className="font-bold flex items-center gap-2 text-emerald-800">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Automated Post-Verification Pipeline:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-emerald-900/90 pl-1">
                      <li>Upgrades property to <strong>Tier 3 Certified</strong> with verified badge</li>
                      <li>Credits <strong>₦{Number(reportVerifyModal.report?.bounty_fee || 0).toLocaleString()}</strong> bounty immediately into inspector's wallet</li>
                      <li>Generates an immutable credit transaction receipt</li>
                    </ul>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 leading-relaxed">
                    Please provide specific guidance on deficient photos or checklist details so the inspector can update their field evidence.
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Super Admin Audit Certification Notes
                  </label>
                  <textarea
                    rows="3"
                    value={reportVerifyModal.notes}
                    onChange={(e) => setReportVerifyModal(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder={reportVerifyModal.action === 'verified' ? 'Audit evidence verified and approved by Super Admin.' : 'Please upload clearer photo evidence of the generator and master bedroom.'}
                    className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-tafiya-blue"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportVerifyModal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                      reportVerifyModal.action === 'verified'
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                        : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    }`}
                  >
                    {reportVerifyModal.action === 'verified' ? 'Certify & Credit Bounty' : 'Send Revision Notice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: WITHDRAWAL ACTION */}
        {withdrawalActionModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    withdrawalActionModal.action === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {withdrawalActionModal.action === 'approved' ? <Landmark className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {withdrawalActionModal.action === 'approved' ? 'Confirm Bank Payout Disbursal' : 'Decline Payout & Refund Wallet'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Ref: {withdrawalActionModal.withdrawal?.transaction_reference}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setWithdrawalActionModal(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleProcessWithdrawal} className="space-y-4">
                {/* Payout Summary Card */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Inspector:</span>
                    <span className="font-bold text-slate-900">{withdrawalActionModal.withdrawal?.agent_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Disbursal Amount:</span>
                    <span className="font-mono font-black text-sm text-slate-900">
                      {withdrawalActionModal.withdrawal?.amount_formatted}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Destination:</span>
                    <span className="font-bold text-slate-800">
                      {withdrawalActionModal.withdrawal?.bank_name} ({withdrawalActionModal.withdrawal?.account_number})
                    </span>
                  </div>
                </div>

                {withdrawalActionModal.action === 'rejected' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-[11px] text-red-900 leading-relaxed">
                    Declining this request will immediately refund the debited payout amount back to the agent's available wallet balance.
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    {withdrawalActionModal.action === 'approved' ? 'Bank Transfer Reference / Notes' : 'Reason for Declining (Sent to Agent)'}
                  </label>
                  <textarea
                    rows="2"
                    value={withdrawalActionModal.note}
                    onChange={(e) => setWithdrawalActionModal(prev => ({ ...prev, note: e.target.value }))}
                    placeholder={withdrawalActionModal.action === 'approved' ? 'e.g. NIBSS Instant Settlement #NIP-99827361' : 'e.g. Incorrect account name matching bank record.'}
                    className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-tafiya-blue"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawalActionModal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                      withdrawalActionModal.action === 'approved'
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                        : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                    }`}
                  >
                    {withdrawalActionModal.action === 'approved' ? 'Confirm Disbursal' : 'Decline & Refund Wallet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
