import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';

export default function InboxPage({ currentUser, onOpenAuthModal, onNavigateExplore }) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'hosts', 'support'
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
              Communicate directly with property hosts, verified field agents, and 24/7 FindDestination escrow support desks.
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

  // Initial Conversations Data
  const [threads, setThreads] = useState([
    {
      id: 'thread-1',
      type: 'host',
      name: 'Ibrahim Abubakar (Host)',
      role: 'Property Owner',
      propertyTitle: 'Yankari Game Reserve Eco-Lodge',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      unread: 1,
      lastUpdated: '10:30 AM',
      messages: [
        {
          id: 'm1',
          sender: 'host',
          text: 'Sannu da zuwa! Looking forward to hosting you at Yankari Eco-Lodge on Nov 15.',
          time: '10:28 AM'
        },
        {
          id: 'm2',
          sender: 'host',
          text: 'Let me know if you need help with transportation from Bauchi airport or central park.',
          time: '10:30 AM'
        }
      ]
    },
    {
      id: 'thread-2',
      type: 'agent',
      name: 'Field Agent Sani (Kaduna)',
      role: 'FindDestination Verification Agent',
      propertyTitle: 'Gamji Heritage Villa & Gardens',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      unread: 0,
      lastUpdated: 'Yesterday',
      messages: [
        {
          id: 'm10',
          sender: 'agent',
          text: 'Hello! I completed the physical Tier-3 CAC verification for Gamji Villa yesterday. Everything is in order.',
          time: 'Yesterday'
        },
        {
          id: 'm11',
          sender: 'me',
          text: 'Thank you agent Sani! Is solar power active 24/7 there?',
          time: 'Yesterday'
        },
        {
          id: 'm12',
          sender: 'agent',
          text: 'Yes, 15kVA inverter system + soundproof backup generator available.',
          time: 'Yesterday'
        }
      ]
    },
    {
      id: 'thread-3',
      type: 'support',
      name: 'FindDestination Escrow Support Desk',
      role: '24/7 Customer Care',
      propertyTitle: 'General Support & Bookings',
      avatar: null,
      unread: 0,
      lastUpdated: 'Oct 5',
      messages: [
        {
          id: 'm20',
          sender: 'support',
          text: 'Welcome to Tafiya! Your bookings are protected by 24h post-checkin escrow payout locking.',
          time: 'Oct 5'
        }
      ]
    }
  ]);

  const activeThread = threads.find(t => t.id === selectedThreadId);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedThreadId) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: messageInput.trim(),
      time: 'Just now'
    };

    setThreads(prev => prev.map(t => {
      if (t.id === selectedThreadId) {
        return {
          ...t,
          lastUpdated: 'Just now',
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    }));

    setMessageInput('');
  };

  const handleQuickChipClick = (chipText) => {
    setMessageInput(chipText);
  };

  const filteredThreads = threads.filter(t => {
    if (activeFilter === 'hosts' && t.type !== 'host') return false;
    if (activeFilter === 'support' && (t.type !== 'support' && t.type !== 'agent')) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.propertyTitle.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">

      {/* Page Banner */}
      <div className="flex items-center justify-between p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-tafiya-blue to-tafiya-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shrink-0">
            <MessageSquare className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black">Messages & Support</h1>
            <p className="text-xs text-slate-400 mt-0.5">Direct chat with hosts, field agents & FindDestination escrow support</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted Direct Chat</span>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">

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
                placeholder="Search chats or properties..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tafiya-blue bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'All Chats' },
                { id: 'hosts', label: 'Hosts' },
                { id: 'support', label: 'Support & Agents' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${activeFilter === tab.id
                    ? 'bg-tafiya-blue text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List */}
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filteredThreads.map(t => {
              const isSelected = t.id === selectedThreadId;
              const lastMsg = t.messages[t.messages.length - 1];

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedThreadId(t.id);
                    // Mark as read
                    setThreads(prev => prev.map(item => item.id === t.id ? { ...item, unread: 0 } : item));
                  }}
                  className={`p-4 flex items-start gap-3 transition-colors cursor-pointer ${isSelected ? 'bg-tafiya-blue-50/60 border-l-4 border-tafiya-blue' : 'hover:bg-slate-50'
                    }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {t.avatar ? (
                      <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover shadow-xs" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-slate-900 text-tafiya-gold flex items-center justify-center font-bold text-sm shadow-xs">
                        <Bot className="w-6 h-6" />
                      </div>
                    )}
                    {t.unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-tafiya-orange text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                        {t.unread}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{t.name}</h4>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">{t.lastUpdated}</span>
                    </div>
                    <p className="text-[10px] text-tafiya-blue font-bold truncate">{t.propertyTitle}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{lastMsg ? lastMsg.text : 'No messages'}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Chat Messages Thread */}
        <div className={`md:col-span-7 flex flex-col bg-slate-50/30 ${!selectedThreadId ? 'hidden md:flex' : 'flex'}`}>

          {selectedThreadId && activeThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 bg-white border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedThreadId(null)}
                    className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {activeThread.avatar ? (
                    <img src={activeThread.avatar} alt={activeThread.name} className="w-10 h-10 rounded-full object-cover shadow-xs shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-tafiya-gold flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span>{activeThread.name}</span>
                      <span className="text-[10px] bg-tafiya-blue-50 text-tafiya-blue px-2 py-0.5 rounded-full font-bold">
                        {activeThread.role}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{activeThread.propertyTitle}</span>
                    </p>
                  </div>
                </div>

                <button className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors">
                  <Phone className="w-4 h-4 text-slate-700" />
                </button>
              </div>

              {/* Messages Body */}
              <div className="p-4 space-y-3 overflow-y-auto flex-1 max-h-[380px]">

                {/* Security Banner inside Thread */}
                <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-[11px] text-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Payments & reservations outside FindDestination platform forfeit escrow protection guarantee.</span>
                </div>

                {activeThread.messages.map((m) => {
                  const isMe = m.sender === 'me';
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 shadow-xs ${isMe
                        ? 'bg-tafiya-blue text-white rounded-br-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                        }`}>
                        <p className="leading-relaxed">{m.text}</p>
                        <div className={`flex items-center gap-1 text-[9px] ${isMe ? 'text-blue-200 justify-end' : 'text-slate-400 justify-start'}`}>
                          <span>{m.time}</span>
                          {isMe && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>

              {/* Quick Prompt Chips */}
              <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {[
                  'Is early check-in allowed?',
                  'How do I get directions?',
                  'Confirm power availability'
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickChipClick(chip)}
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
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tafiya-blue"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="w-10 h-10 bg-tafiya-blue text-white rounded-2xl flex items-center justify-center hover:bg-tafiya-blue-600 transition-colors disabled:opacity-40 cursor-pointer shadow-sm shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            /* Blank Selection State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-tafiya-blue-50 text-tafiya-blue flex items-center justify-center border border-tafiya-blue-100">
                <MessageSquare className="w-8 h-8 stroke-[2]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Select a Conversation</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Choose a chat thread from the left panel to communicate directly with hosts, agents, or support.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
