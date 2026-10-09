import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  LogOut,
  ChevronRight,
  HelpCircle,
  FileText,
  Clock,
  Sparkles,
  PhoneCall,
  Save,
  CheckCircle2,
  Mail,
  MapPin,
  FileEdit
} from 'lucide-react';

export default function ProfilePage({
  currentUser,
  currentRole,
  onOpenAuthModal,
  onLogout,
  onOpenTracker,
  onOpenInfoModal,
  onUpdateUser
}) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || currentUser?.full_name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    state: currentUser?.state || 'Bauchi',
    bio: currentUser?.bio || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || currentUser.full_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        state: currentUser.state || 'Bauchi',
        bio: currentUser.bio || ''
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    setTimeout(() => {
      const updatedUser = {
        ...(currentUser || {}),
        name: formData.name,
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        state: formData.state,
        bio: formData.bio
      };

      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      } else {
        try {
          localStorage.setItem('tafiya_user', JSON.stringify(updatedUser));
        } catch {}
      }

      setIsSaving(false);
      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    }, 500);
  };

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

      {/* Edit Profile Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-tafiya-blue-50 text-tafiya-blue flex items-center justify-center">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Edit Personal Profile</h3>
              <p className="text-xs text-slate-500">Update your account name, contact info and location preferences</p>
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Aminu Bello"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-tafiya-blue/30 focus:border-tafiya-blue transition-all"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. aminu@example.com"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-tafiya-blue/30 focus:border-tafiya-blue transition-all"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone Number</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+234 800 000 0000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-tafiya-blue/30 focus:border-tafiya-blue transition-all"
              />
            </div>

            {/* Preferred Primary State */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Primary Location / State</span>
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-tafiya-blue/30 focus:border-tafiya-blue transition-all cursor-pointer"
              >
                <option value="Bauchi">Bauchi (Yankari Eco Hub)</option>
                <option value="Kaduna">Kaduna (Business Capital)</option>
                <option value="Kano">Kano (Commerce Hub)</option>
                <option value="Plateau">Plateau / Jos (Cool Climate)</option>
                <option value="Adamawa">Adamawa / Yola (Scenic Stays)</option>
                <option value="Gombe">Gombe (Modern Gateway)</option>
              </select>
            </div>

          </div>

          {/* Bio / Traveler Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Bio & Traveler Preferences</label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell hosts or agents a bit about yourself, travel habits, or hosting preferences..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-tafiya-blue/30 focus:border-tafiya-blue transition-all resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-tafiya-blue text-white font-bold text-xs rounded-xl shadow-md hover:bg-tafiya-blue-600 transition-all active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
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
