import React from 'react';
import {
  User,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Building2,
  HelpCircle,
  FileText,
  Lock,
  Clock,
  Sparkles,
  Bell,
  Settings,
  CreditCard,
  PhoneCall,
  UserCheck
} from 'lucide-react';

export default function ProfilePage({
  currentUser,
  currentRole,
  onOpenAuthModal,
  onLogout,
  onSelectRole,
  onOpenTracker,
  onOpenInfoModal
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-300">

      {/* Profile Header / User Card */}
      {currentUser ? (
        <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-tafiya-blue to-tafiya-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
              {(currentUser.name || currentUser.full_name || 'U').charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-black text-white truncate">{currentUser.name || currentUser.full_name || 'Verified User'}</h1>
                <span className="text-[10px] font-extrabold uppercase bg-tafiya-blue/30 text-tafiya-gold px-2.5 py-0.5 rounded-full border border-tafiya-gold/30">
                  {currentRole === 'host' ? 'Host Account' : currentRole === 'agent' ? 'Field Agent' : currentRole === 'admin' ? 'Super Admin' : 'Guest / Traveler'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium truncate">{currentUser.email}</p>
              {currentUser.phone && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <PhoneCall className="w-3 h-3 text-tafiya-blue" />
                  <span>{currentUser.phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick Account Badges */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Identity Verified</span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors font-bold text-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      ) : (
        /* Guest Unauthenticated Card */
        <div className="p-6 bg-gradient-to-br from-tafiya-blue-50/90 via-slate-50 to-indigo-50 border-2 border-dashed border-tafiya-blue/30 rounded-3xl text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-tafiya-blue text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <User className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-base font-black text-slate-900">Your FindDestination Traveler Account</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Log in or register to track bookings, manage saved stays, manage CAC host listings, and view vouchers.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
              className="px-6 py-2.5 bg-tafiya-blue text-white font-bold text-xs rounded-xl hover:bg-tafiya-blue-600 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal('signup')}
              className="px-6 py-2.5 bg-white text-tafiya-blue border border-tafiya-blue/30 font-bold text-xs rounded-xl hover:bg-tafiya-blue-50 transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-tafiya-gold" />
              <span>Register</span>
            </button>
          </div>
        </div>
      )}

      {/* Role Switching Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">Switch Application Module</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { role: 'guest', label: 'Guest Portal', desc: 'Book stays', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            { role: 'host', label: 'Host Dashboard', desc: 'Manage properties', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { role: 'agent', label: 'Agent Portal', desc: 'Field inspections', color: 'bg-amber-50 text-amber-700 border-amber-200' },
            { role: 'admin', label: 'Super Admin', desc: 'CAC & System', color: 'bg-purple-50 text-purple-700 border-purple-200' }
          ].map(r => (
            <button
              key={r.role}
              onClick={() => onSelectRole && onSelectRole(r.role)}
              className={`p-3 rounded-2xl border text-left space-y-1 transition-all cursor-pointer ${currentRole === r.role
                  ? 'ring-2 ring-tafiya-blue shadow-sm bg-white font-bold'
                  : 'bg-white hover:border-slate-300'
                }`}
            >
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block ${r.color}`}>
                {r.label}
              </span>
              <p className="text-[11px] text-slate-500 font-medium leading-tight">{r.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Settings Navigation Menu */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">

        <div className="p-4 bg-slate-50/50">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Support & Tracking</h3>
        </div>

        <button
          onClick={() => onOpenTracker && onOpenTracker('')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-tafiya-blue-50 text-tafiya-blue flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Track Booking or Order</h4>
              <p className="text-[11px] text-slate-500">Lookup real-time status with booking reference</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => onOpenInfoModal && onOpenInfoModal('help')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Help Center & FAQ</h4>
              <p className="text-[11px] text-slate-500">Escrow guidelines, check-in rules & support</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => onOpenInfoModal && onOpenInfoModal('terms')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Terms of Service & Escrow Policy</h4>
              <p className="text-[11px] text-slate-500">Legal agreements and host verification policy</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

      </div>

      {/* App Version Info */}
      <div className="text-center pt-2 space-y-1">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">FindDestination FindDestination v2.4</p>
        <p className="text-[10px] text-slate-400">Escrow Shortlet Platform • Northern Nigeria</p>
      </div>

    </div>
  );
}
