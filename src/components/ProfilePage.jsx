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
  FileEdit,
  QrCode,
  Calendar,
  Lock,
  Copy,
  Check,
  Building2,
  ArrowRight,
  X,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export default function ProfilePage({
  currentUser,
  currentRole,
  onOpenAuthModal,
  onLogout,
  onOpenTracker,
  onOpenInfoModal,
  onUpdateUser,
  onOpenVoucher,
  onOpenChat,
  onNavigateExplore,
  newBookingAlert,
  onDismissAlert
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
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [activeReservationFilter, setActiveReservationFilter] = useState('all'); // 'all', 'upcoming', 'completed'
  const [copiedRef, setCopiedRef] = useState(null);

  // Sync formData with currentUser changes
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

  // Load guest/user bookings from localStorage & API
  useEffect(() => {
    if (currentUser) {
      loadReservations();
    } else {
      setBookings([]);
      setBookingsLoading(false);
    }
  }, [currentUser, newBookingAlert]);

  const loadReservations = async () => {
    if (!currentUser) {
      setBookings([]);
      setBookingsLoading(false);
      return;
    }
    setBookingsLoading(true);
    let allReservations = [];

    // 1. If a new booking was just placed, ensure it's in the list right away
    if (newBookingAlert) {
      allReservations.push(newBookingAlert);
    }

    // 2. Load from localStorage
    try {
      const savedStr = localStorage.getItem('finddestination_recent_bookings') || localStorage.getItem('tafiya_recent_bookings');
      if (savedStr) {
        const parsed = JSON.parse(savedStr);
        if (Array.isArray(parsed)) {
          allReservations = [...allReservations, ...parsed];
        }
      }
    } catch (e) {
      console.error('Failed to parse local reservations', e);
    }

    // 3. Load from API if token exists
    const token = localStorage.getItem('finddestination_token') || localStorage.getItem('tafiya_token');
    if (token) {
      try {
        const response = await fetch('/api/v1/bookings/my-trips', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (response.ok) {
          const resData = await response.json();
          if (resData.status === 'success' && Array.isArray(resData.data)) {
            const apiMapped = resData.data.map(b => ({
              reference: b.booking_reference,
              booking_reference: b.booking_reference,
              property: {
                name: b.property_title || 'FindDestination Verified Stay',
                city: b.city || 'Bauchi',
                state: b.state || 'Bauchi',
                images: b.cover_image ? [b.cover_image] : ['/logo.jpeg']
              },
              propertyTitle: b.property_title,
              location: `${b.city}, ${b.state}`,
              room: { name: b.room_name || 'Standard Suite' },
              checkInDate: b.check_in_date,
              checkOutDate: b.check_out_date,
              nights: b.total_nights,
              totalAmount: b.total_amount_formatted,
              status: b.booking_status || 'confirmed',
              escrowStatus: 'held',
              created_at: b.created_at
            }));
            allReservations = [...allReservations, ...apiMapped];
          }
        }
      } catch (err) {
        console.error('Failed to fetch user trips from API', err);
      }
    }

    // Deduplicate reservations by reference
    const seen = new Set();
    const uniqueReservations = [];
    for (const item of allReservations) {
      const ref = item.reference || item.booking_reference || item.bookingRef;
      if (ref && !seen.has(ref)) {
        seen.add(ref);
        uniqueReservations.push(item);
      }
    }

    setBookings(uniqueReservations);
    setBookingsLoading(false);
  };

  const handleCopy = (ref) => {
    if (!ref) return;
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2500);
  };

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
          localStorage.setItem('finddestination_user', JSON.stringify(updatedUser));
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

  // Reservation Filtering
  const filteredReservations = bookings.filter(b => {
    const status = (b.status || b.booking_status || 'confirmed').toLowerCase();
    if (activeReservationFilter === 'all') return true;
    if (activeReservationFilter === 'upcoming') {
      return status === 'confirmed' || status === 'paid' || status === 'pending';
    }
    if (activeReservationFilter === 'completed') {
      return status === 'completed' || status === 'checked_out';
    }
    return true;
  });

  const upcomingCount = bookings.filter(b => {
    const status = (b.status || b.booking_status || 'confirmed').toLowerCase();
    return status === 'confirmed' || status === 'paid' || status === 'pending';
  }).length;

  const completedCount = bookings.filter(b => {
    const status = (b.status || b.booking_status || 'confirmed').toLowerCase();
    return status === 'completed' || status === 'checked_out';
  }).length;

  // Enforce Authentication Check for unauthenticated guests
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 space-y-5 max-w-lg mx-auto shadow-md">
          <div className="w-16 h-16 rounded-3xl bg-tafiya-blue-50 text-tafiya-blue flex items-center justify-center mx-auto border border-tafiya-blue-100 shadow-sm">
            <Lock className="w-8 h-8 stroke-[2]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-black text-slate-900">Sign In to Access Your Profile</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Log in to view your verified stay reservations, manage digital vouchers, and update your personal account details.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
              className="w-full sm:w-auto px-6 py-3 bg-tafiya-blue text-white font-bold text-xs rounded-2xl shadow-md hover:bg-tafiya-blue-600 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Log In</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onOpenAuthModal && onOpenAuthModal('signup')}
              className="w-full sm:w-auto px-6 py-3 bg-white text-tafiya-blue border border-tafiya-blue/30 font-bold text-xs rounded-2xl hover:bg-tafiya-blue-50 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-tafiya-gold" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Quick Track Order Option for Guest Checkouts */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 mb-2">Have a reservation reference from a guest booking?</p>
            <button
              type="button"
              onClick={() => onOpenTracker && onOpenTracker()}
              className="text-xs font-bold text-tafiya-blue hover:underline inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Track Reservation Status</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-300">

      {/* 1. Transaction Success Alert Banner (Appears when redirected after booking) */}
      {newBookingAlert && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl flex items-start justify-between gap-4 border border-emerald-500/40 animate-in slide-in-from-top-3 duration-300">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  Booking Confirmed
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-black/25 px-2 py-0.5 rounded-md">
                  {newBookingAlert.reference || newBookingAlert.booking_reference}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black">
                Your reservation at {newBookingAlert.property?.name || newBookingAlert.propertyTitle || 'FindDestination Stay'} is confirmed!
              </h2>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Funds are held in secure escrow until check-in. Your digital voucher & check-in QR code are ready below, and a confirmation email has been dispatched.
              </p>
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onOpenVoucher && onOpenVoucher(newBookingAlert)}
                  className="px-4 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                  <span>View Digital Voucher</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenChat && onOpenChat(newBookingAlert.reference || newBookingAlert.booking_reference, newBookingAlert)}
                  className="px-4 py-1.5 bg-emerald-900/60 hover:bg-emerald-900 text-white border border-white/20 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Chat with Host</span>
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismissAlert}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Profile Header / User Card */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-tafiya-blue to-tafiya-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
            {(currentUser.name || currentUser.full_name || 'G').charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-black text-white truncate">{currentUser.name || currentUser.full_name || 'Verified Guest'}</h1>
              <span className="text-[10px] font-extrabold uppercase bg-tafiya-blue/30 text-tafiya-gold px-2.5 py-0.5 rounded-full border border-tafiya-gold/30">
                {currentRole === 'host' ? 'Host Account' : currentRole === 'agent' ? 'Field Agent' : currentRole === 'admin' ? 'Super Admin' : 'Guest / Traveler'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium truncate">{currentUser.email || 'Guest Traveler Session'}</p>
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Escrow Protected Traveler</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">{bookings.length} Reservation{bookings.length !== 1 ? 's' : ''} on record</span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors font-bold text-xs cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* 3. My Reservations & Trips Section (PROMINENTLY FEATURED) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-tafiya-blue-50 text-tafiya-blue flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">My Reservations</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-tafiya-blue-50 text-tafiya-blue border border-tafiya-blue-100">
                  {bookings.length}
                </span>
              </div>
              <p className="text-xs text-slate-500">Track active bookings, view digital check-in vouchers, and print certificates</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveReservationFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeReservationFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveReservationFilter('upcoming')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeReservationFilter === 'upcoming'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Confirmed ({upcomingCount})
            </button>
            {completedCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveReservationFilter('completed')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeReservationFilter === 'completed'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Past ({completedCount})
              </button>
            )}
          </div>
        </div>

        {/* Reservations List */}
        {bookingsLoading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-tafiya-blue border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400">Loading your reservations...</p>
          </div>
        ) : filteredReservations.length > 0 ? (
          <div className="space-y-4">
            {filteredReservations.map((item, idx) => {
              const ref = item.reference || item.booking_reference || item.bookingRef || `FD-RES-${idx}`;
              const propName = item.property?.name || item.propertyTitle || item.propertyName || 'FindDestination Verified Stay';
              const propLocation = item.property?.city 
                ? `${item.property.city}${item.property.state ? `, ${item.property.state}` : ''}`
                : (item.location || 'Northern Nigeria');
              const propImg = item.property?.images?.[0] || item.property?.cover_image || item.cover_image || '/logo.jpeg';
              const room = item.room?.name || item.roomType || item.room_name || 'Executive Verified Stay';
              const checkIn = item.checkInDate || item.check_in_date || 'Scheduled';
              const checkOut = item.checkOutDate || item.check_out_date || 'Scheduled';
              const nights = item.nights || item.total_nights || 2;
              const price = typeof item.totalAmount === 'number'
                ? `₦${item.totalAmount.toLocaleString()}`
                : (item.total_amount_formatted || item.totalAmount || 'Paid in Full');
              const isJustBooked = newBookingAlert && (newBookingAlert.reference === ref || newBookingAlert.booking_reference === ref);

              return (
                <div
                  key={ref + idx}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all duration-200 hover:shadow-md ${
                    isJustBooked
                      ? 'border-emerald-500 bg-emerald-50/20 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200/90 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    
                    {/* Property Thumbnail & Information */}
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                        <img
                          src={propImg}
                          alt={propName}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/logo.jpeg'; }}
                        />
                        <span className="absolute top-1.5 left-1.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 text-emerald-400" />
                          Escrow
                        </span>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-tafiya-blue font-mono bg-tafiya-blue-50 px-2 py-0.5 rounded-lg border border-tafiya-blue-100">
                            {ref}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(ref)}
                            className="text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-colors p-1"
                            title="Copy booking reference"
                          >
                            {copiedRef === ref ? (
                              <span className="text-emerald-600 flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Copied
                              </span>
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          {isJustBooked && (
                            <span className="text-[10px] font-extrabold uppercase bg-emerald-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                              Just Confirmed
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                          {propName}
                        </h4>

                        <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-tafiya-blue shrink-0" />
                          <span>{propLocation}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-semibold text-slate-700">{room}</span>
                        </p>

                        <div className="flex items-center gap-2 text-xs text-slate-600 pt-0.5 flex-wrap">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {checkIn} → {checkOut}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-bold text-slate-700">{nights} Night{nights > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Paid</span>
                        <span className="text-base sm:text-lg font-black text-slate-900 block">{price}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" /> Escrow Held
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => onOpenChat && onOpenChat(ref, item)}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                          title="Message property host"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat Host</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenVoucher && onOpenVoucher(item)}
                          className="px-3.5 py-2 bg-tafiya-blue hover:bg-tafiya-blue-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>View Voucher</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenTracker && onOpenTracker(ref)}
                          className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors cursor-pointer"
                          title="Track reservation status"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Reservations State */
          <div className="py-10 px-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-tafiya-blue-50 text-tafiya-blue flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-sm font-extrabold text-slate-900">No Reservations Found</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                You do not have any active reservations in this category. Explore certified shortlets across Bauchi, Kaduna, Kano, and Plateau.
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateExplore}
              className="px-5 py-2.5 bg-tafiya-blue text-white font-bold text-xs rounded-xl shadow-md hover:bg-tafiya-blue-600 transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Explore Stays</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 4. Edit Personal Profile Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-tafiya-blue-50 text-tafiya-blue flex items-center justify-center">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Personal Information</h3>
              <p className="text-xs text-slate-500">Update your account name, contact details and location</p>
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
                <span>Primary Destination State</span>
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-tafiya-blue/30 focus:border-tafiya-blue transition-all cursor-pointer"
              >
                <option value="Bauchi">Bauchi (Yankari Eco Hub)</option>
                <option value="Kaduna">Kaduna (Commercial Center)</option>
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
              rows={2}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Travel notes or hosting preferences..."
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

      {/* 5. Support & Tracking Navigation Menu */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50/50">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Support & Tracking</h3>
        </div>

        <button
          type="button"
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
          type="button"
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
          type="button"
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
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">FindDestination v2.4</p>
        <p className="text-[10px] text-slate-400">Escrow Shortlet Platform • Northern Nigeria</p>
      </div>

    </div>
  );
}
