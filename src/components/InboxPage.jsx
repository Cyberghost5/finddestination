import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  CheckCheck,
  ShieldCheck,
  Building2,
  User,
  ArrowLeft,
  Sparkles,
  Phone,
  Paperclip,
  Clock,
  MapPin,
  Bot,
  Lock,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  AlertCircle,
  Calendar,
  Check
} from 'lucide-react';

export default function InboxPage({
  currentUser,
  onOpenAuthModal,
  onNavigateExplore,
  targetBookingRef = null,
  targetThreadId = null,
  onClearTargetChat = null
}) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'booking', 'support'
  const [threads, setThreads] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState(null);

  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Helper for auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('finddestination_token') || localStorage.getItem('tafiya_token');
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (currentUser?.id) {
      headers['X-User-Id'] = currentUser.id;
    }
    return headers;
  };

  // Enforce Authentication Check
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 space-y-5 max-w-lg mx-auto shadow-md">
          <div className="w-16 h-16 rounded-3xl bg-tafiya-blue-50 text-tafiya-blue flex items-center justify-center mx-auto border border-tafiya-blue-100 shadow-sm">
            <Lock className="w-8 h-8 stroke-[2]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-black text-slate-900">Sign In to Access Messages</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Communicate directly with your confirmed stay's property owner and access 24/7 FindDestination escrow support.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
              className="w-full sm:w-auto px-6 py-3 bg-tafiya-blue text-white font-bold text-xs rounded-2xl shadow-md hover:bg-tafiya-blue-600 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Log In</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal('signup')}
              className="w-full sm:w-auto px-6 py-3 bg-white text-tafiya-blue border border-tafiya-blue/30 font-bold text-xs rounded-2xl hover:bg-tafiya-blue-50 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-tafiya-gold" />
              <span>Create Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Auto-scroll messages to bottom
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  // 1. Fetch Threads List
  const fetchThreads = async (selectId = null) => {
    try {
      const response = await fetch('/api/v1/chats', {
        headers: getAuthHeaders(),
      });
      const res = await response.json();
      if (res.status === 'success' && Array.isArray(res.data)) {
        setThreads(res.data);

        // If a specific ID is requested, select it
        if (selectId) {
          setSelectedThreadId(selectId);
        } else if (!selectedThreadId && window.innerWidth >= 768 && res.data.length > 0) {
          // Default select the first conversation on desktop
          setSelectedThreadId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load chats:', err);
    } finally {
      setLoadingThreads(false);
    }
  };

  // 2. Fetch Messages for Active Thread
  const fetchMessages = async (threadId, silent = false) => {
    if (!threadId) return;
    if (!silent) setLoadingMessages(true);

    try {
      const response = await fetch(`/api/v1/chats/${threadId}/messages`, {
        headers: getAuthHeaders(),
      });
      const res = await response.json();
      if (res.status === 'success' && res.data) {
        setMessages(res.data.messages || []);
        if (!silent) {
          setTimeout(() => scrollToBottom(false), 80);
        }
        // Reset unread count locally for this thread
        setThreads(prev => prev.map(t => t.id === threadId ? { ...t, unread_count: 0 } : t));
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchThreads();
  }, [currentUser]);

  // Handle targetBookingRef initiation
  useEffect(() => {
    if (targetBookingRef) {
      initiateBookingChat(targetBookingRef);
    }
  }, [targetBookingRef]);

  // Handle targetThreadId selection
  useEffect(() => {
    if (targetThreadId) {
      setSelectedThreadId(targetThreadId);
      if (onClearTargetChat) onClearTargetChat();
    }
  }, [targetThreadId]);

  // Whenever selectedThreadId changes, fetch messages & set up polling
  useEffect(() => {
    if (selectedThreadId) {
      fetchMessages(selectedThreadId);

      // Clear previous interval if any
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      // Poll active thread every 4 seconds
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(selectedThreadId, true);
      }, 4000);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [selectedThreadId]);

  // Background thread refresh every 15 seconds
  useEffect(() => {
    const threadPoll = setInterval(() => {
      fetchThreads();
    }, 15000);
    return () => clearInterval(threadPoll);
  }, [currentUser]);

  // Start chat for a confirmed booking
  const initiateBookingChat = async (bookingRef) => {
    try {
      setActionNotice({ type: 'info', message: `Connecting to host for booking ${bookingRef}...` });
      const response = await fetch('/api/v1/chats/start-booking-chat', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ booking_reference: bookingRef }),
      });
      const res = await response.json();

      if (res.status === 'success' && res.data?.thread_id) {
        setActionNotice({ type: 'success', message: 'Connected with host!' });
        await fetchThreads(res.data.thread_id);
        setSelectedThreadId(res.data.thread_id);
      } else {
        setActionNotice({
          type: 'error',
          message: res.message || 'Messaging becomes available once booking payment is confirmed.'
        });
      }
    } catch (err) {
      setActionNotice({ type: 'error', message: 'Could not connect to host chat. Please try again.' });
    } finally {
      if (onClearTargetChat) onClearTargetChat();
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  // Start or open Support Desk thread
  const handleOpenSupportChat = async () => {
    // Check if support thread already in list
    const existingSupport = threads.find(t => t.type === 'support');
    if (existingSupport) {
      setSelectedThreadId(existingSupport.id);
      return;
    }

    try {
      setActionNotice({ type: 'info', message: 'Connecting to FindDestination Support Desk...' });
      const response = await fetch('/api/v1/chats/support', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const res = await response.json();
      if (res.status === 'success' && res.data?.thread_id) {
        await fetchThreads(res.data.thread_id);
        setSelectedThreadId(res.data.thread_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // Send Message Handler
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const text = messageInput.trim();
    if (!text || !selectedThreadId || sendingMessage) return;

    // Optimistic message append
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      sender_id: currentUser?.id,
      sender_name: currentUser?.name || 'You',
      sender_role: currentUser?.role || 'guest',
      is_me: true,
      text: text,
      is_read: false,
      time: 'Just now',
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setMessageInput('');
    setSendingMessage(true);
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const response = await fetch(`/api/v1/chats/${selectedThreadId}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: text }),
      });
      const res = await response.json();

      if (res.status === 'success' && res.data) {
        // Replace temp message with server message
        setMessages(prev => prev.map(m => m.id === tempId ? res.data : m));
        // Update threads list latest message snippet
        setThreads(prev => prev.map(t => {
          if (t.id === selectedThreadId) {
            return {
              ...t,
              latest_message: {
                id: res.data.id,
                text: res.data.text,
                sender_role: res.data.sender_role,
                is_me: true,
                time: 'Just now'
              },
              last_message_at: new Date().toISOString()
            };
          }
          return t;
        }));
      } else {
        // Show error notice
        setActionNotice({ type: 'error', message: res.message || 'Failed to send message.' });
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setActionNotice({ type: 'error', message: 'Network error. Message could not be sent.' });
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setSendingMessage(false);
      setTimeout(() => scrollToBottom(true), 100);
    }
  };

  const activeThread = threads.find(t => t.id === selectedThreadId);

  // Quick Chips
  const getQuickChips = () => {
    if (!activeThread) return [];
    if (activeThread.type === 'support') {
      return [
        'Need help with booking modification',
        'Check escrow payment verification',
        'Issue with key handoff or check-in',
        'Request invoice / official receipt'
      ];
    }
    return [
      'Is early check-in allowed?',
      'Please send the exact gate & road directions',
      'Can you confirm 24/7 generator & inverter power?',
      'What is the Wi-Fi password?'
    ];
  };

  // Filtered threads list
  const filteredThreads = threads.filter(t => {
    if (activeFilter === 'booking' && t.type !== 'booking') return false;
    if (activeFilter === 'support' && t.type !== 'support') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const otherName = (t.other_party?.name || '').toLowerCase();
      const propTitle = (t.property?.name || '').toLowerCase();
      const bookRef = (t.booking?.reference || '').toLowerCase();
      return otherName.includes(q) || propTitle.includes(q) || bookRef.includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">

      {/* Page Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-tafiya-blue to-tafiya-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shrink-0">
            <MessageSquare className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black">Messages & Escrow Support</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure communication between confirmed guests, property owners & 24/7 FindDestination desk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Escrow Protected Chats</span>
          </div>

          <button
            onClick={handleOpenSupportChat}
            className="flex items-center gap-1.5 px-3 py-2 bg-tafiya-blue hover:bg-tafiya-blue-600 text-white text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-sm shrink-0"
            title="Chat directly with FindDestination Super Admin & Support"
          >
            <Bot className="w-4 h-4" />
            <span>Support Desk</span>
          </button>
        </div>
      </div>

      {/* Dynamic Action / Error Notification */}
      {actionNotice && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border ${
          actionNotice.type === 'error'
            ? 'bg-rose-50 text-rose-800 border-rose-200'
            : actionNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{actionNotice.message}</span>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">

        {/* Left Column: Conversations List */}
        <div className={`md:col-span-5 border-r border-slate-200/80 flex flex-col ${selectedThreadId ? 'hidden md:flex' : 'flex'}`}>

          {/* Search & Tabs Header */}
          <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hosts, stays, or reference..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tafiya-blue bg-white shadow-xs"
              />
            </div>

            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'booking', label: 'Stay Hosts' },
                  { id: 'support', label: 'Support' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeFilter === tab.id
                        ? 'bg-tafiya-blue text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => fetchThreads()}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                title="Refresh conversations"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingThreads ? 'animate-spin text-tafiya-blue' : ''}`} />
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[520px]">
            {loadingThreads ? (
              <div className="p-8 text-center space-y-3">
                <RefreshCw className="w-6 h-6 text-tafiya-blue animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-semibold">Loading your conversations...</p>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">No conversations in this view</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                    Chat with a host is automatically created once your apartment booking is confirmed. You can also chat with Support anytime.
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleOpenSupportChat}
                    className="px-4 py-2 bg-tafiya-blue text-white text-xs font-bold rounded-xl shadow-xs hover:bg-tafiya-blue-600 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Open Support Desk</span>
                  </button>
                  {onNavigateExplore && (
                    <button
                      onClick={onNavigateExplore}
                      className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                    >
                      <span>Explore Verified Stays</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              filteredThreads.map(t => {
                const isSelected = t.id === selectedThreadId;
                const isSupport = t.type === 'support';

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedThreadId(t.id)}
                    className={`p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-tafiya-blue-50/70 border-l-4 border-tafiya-blue'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {isSupport ? (
                        <div className="w-11 h-11 rounded-full bg-slate-900 text-tafiya-gold flex items-center justify-center font-bold text-sm shadow-xs border border-slate-800">
                          <Bot className="w-5 h-5 text-tafiya-gold" />
                        </div>
                      ) : t.other_party?.avatar ? (
                        <img
                          src={t.other_party.avatar}
                          alt={t.other_party?.name}
                          className="w-11 h-11 rounded-full object-cover shadow-xs border border-slate-200"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-tafiya-blue to-tafiya-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {t.other_party?.name ? t.other_party.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                        </div>
                      )}

                      {t.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-tafiya-orange text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                          {t.unread_count}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                          <span>{t.other_party?.name || t.title}</span>
                          {isSupport && (
                            <span className="text-[9px] bg-slate-900 text-tafiya-gold font-bold px-1.5 py-0.2 rounded-md">
                              Official
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {t.latest_message ? t.latest_message.time : ''}
                        </span>
                      </div>

                      {/* Property / Subject Tag */}
                      {t.property ? (
                        <div className="flex items-center gap-1 text-[10px] text-tafiya-blue font-bold truncate mt-0.5">
                          <Building2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{t.property.name}</span>
                          {t.booking?.reference && (
                            <span className="text-slate-400 font-mono">({t.booking.reference})</span>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">
                          {t.other_party?.role || 'FindDestination Desk'}
                        </p>
                      )}

                      {/* Latest message preview */}
                      <p className="text-[11px] text-slate-500 truncate mt-1">
                        {t.latest_message?.is_me && <span className="font-semibold text-slate-700">You: </span>}
                        {t.latest_message ? t.latest_message.text : 'Conversation opened'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: Chat Messages Thread */}
        <div className={`md:col-span-7 flex flex-col bg-slate-50/30 ${!selectedThreadId ? 'hidden md:flex' : 'flex'}`}>

          {selectedThreadId && activeThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 bg-white border-b border-slate-200/80 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setSelectedThreadId(null)}
                    className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {activeThread.type === 'support' ? (
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-tafiya-gold flex items-center justify-center shrink-0 border border-slate-800">
                      <Bot className="w-5 h-5" />
                    </div>
                  ) : activeThread.other_party?.avatar ? (
                    <img
                      src={activeThread.other_party.avatar}
                      alt={activeThread.other_party.name}
                      className="w-10 h-10 rounded-full object-cover shadow-xs shrink-0 border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-tafiya-blue to-tafiya-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-sm">
                      {activeThread.other_party?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 truncate">
                      <span className="truncate">{activeThread.other_party?.name || activeThread.title}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        activeThread.type === 'support'
                          ? 'bg-slate-900 text-tafiya-gold'
                          : 'bg-tafiya-blue-50 text-tafiya-blue'
                      }`}>
                        {activeThread.other_party?.badge || activeThread.other_party?.role || 'Direct Chat'}
                      </span>
                    </h3>

                    {activeThread.property ? (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate mt-0.5">
                        <Building2 className="w-3 h-3 text-tafiya-blue shrink-0" />
                        <span className="font-semibold text-slate-700 truncate">{activeThread.property.name}</span>
                        {activeThread.booking?.check_in && (
                          <span className="text-slate-400 text-[10px]">
                            • {activeThread.booking.check_in}
                          </span>
                        )}
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3" />
                        <span>FindDestination Super Admin Verified Desk</span>
                      </p>
                    )}
                  </div>
                </div>

                {activeThread.other_party?.phone && (
                  <a
                    href={`tel:${activeThread.other_party.phone}`}
                    className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors shrink-0"
                    title={`Call: ${activeThread.other_party.phone}`}
                  >
                    <Phone className="w-4 h-4 text-slate-700" />
                  </a>
                )}
              </div>

              {/* Security Escrow Notice */}
              <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 text-[11px] text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="leading-snug">
                  <strong>FindDestination Escrow Notice:</strong> Bookings & check-in are secured by 24h post-checkin escrow payout lock. Never share off-platform payment details.
                </span>
              </div>

              {/* Messages Body */}
              <div className="p-4 space-y-3 overflow-y-auto flex-1 max-h-[380px]">
                {loadingMessages ? (
                  <div className="p-8 text-center space-y-2">
                    <RefreshCw className="w-5 h-5 text-tafiya-blue animate-spin mx-auto" />
                    <p className="text-[11px] text-slate-400">Loading message history...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">No messages yet</p>
                    <p className="text-[11px] text-slate-400">Send a greeting to start your conversation.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.is_me;
                    const isAdminSender = m.sender_role === 'admin';

                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}>
                        <div className={`max-w-[82%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs space-y-1 shadow-xs ${
                          isMe
                            ? 'bg-tafiya-blue text-white rounded-br-none'
                            : isAdminSender
                              ? 'bg-slate-900 text-white rounded-bl-none border border-slate-800'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                        }`}>
                          {!isMe && (
                            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100/20 text-[10px] font-bold">
                              <span className={isAdminSender ? 'text-tafiya-gold' : 'text-tafiya-blue'}>
                                {m.sender_name}
                              </span>
                              <span className={`text-[8px] uppercase px-1.5 py-0.2 rounded ${
                                isAdminSender ? 'bg-amber-400/20 text-tafiya-gold' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {m.sender_role}
                              </span>
                            </div>
                          )}

                          <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>

                          <div className={`flex items-center gap-1 text-[9px] pt-0.5 ${
                            isMe ? 'text-blue-100 justify-end' : isAdminSender ? 'text-slate-400 justify-start' : 'text-slate-400 justify-start'
                          }`}>
                            <span>{m.time}</span>
                            {isMe && <CheckCheck className="w-3 h-3 text-blue-200" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {getQuickChips().map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => setMessageInput(chip)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-tafiya-blue-50 hover:text-tafiya-blue text-slate-600 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0"
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={activeThread.type === 'support' ? "Ask FindDestination Support desk..." : "Type your message to host..."}
                  className="flex-1 px-4 py-2.5 text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tafiya-blue bg-white"
                  disabled={sendingMessage}
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || sendingMessage}
                  className="w-10 h-10 bg-tafiya-blue text-white rounded-2xl flex items-center justify-center hover:bg-tafiya-blue-600 transition-colors disabled:opacity-40 cursor-pointer shadow-sm shrink-0"
                >
                  {sendingMessage ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Blank Selection State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-tafiya-blue-50 text-tafiya-blue flex items-center justify-center border border-tafiya-blue-100">
                <MessageSquare className="w-8 h-8 stroke-[2]" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-sm font-bold text-slate-900">Select a Conversation</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Choose a chat from the left panel to message your booked host or talk directly with the FindDestination Super Admin support desk.
                </p>
              </div>

              <button
                onClick={handleOpenSupportChat}
                className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-2xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm"
              >
                <Bot className="w-4 h-4 text-tafiya-gold" />
                <span>Open 24/7 Escrow Support Desk</span>
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
