import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  ShieldCheck,
  Clock,
  CheckCircle2,
  QrCode,
  ExternalLink,
  Search,
  Lock,
  User,
  Sparkles,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function TripsPage({ currentUser, onOpenAuthModal, onOpenVoucher, onOpenTracker, onNavigateExplore }) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'upcoming', 'completed', 'cancelled'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Enforce Authentication Check
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 space-y-5 max-w-lg mx-auto shadow-md">
          <div className="w-16 h-16 rounded-3xl bg-tafiya-blue-50 text-tafiya-blue flex items-center justify-center mx-auto border border-tafiya-blue-100 shadow-sm">
            <Lock className="w-8 h-8 stroke-[2]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-black text-slate-900">Sign In to Access Your Trips</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Log in to view active stay reservations, digital vouchers, check-in QR codes, and escrow status guarantees.
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

  useEffect(() => {
    fetchUserBookings();
  }, [currentUser]);

  const fetchUserBookings = async () => {
    setLoading(true);
    let loadedBookings = [];

    // 1. Try fetching real bookings from Laravel API if token exists
    const token = localStorage.getItem('finddestination_token') || localStorage.getItem('tafiya_token');
    if (token) {
      try {
        const response = await fetch('/api/v1/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (response.ok) {
          const resData = await response.json();
          if (resData.status === 'success' && Array.isArray(resData.data)) {
            loadedBookings = resData.data.map(b => ({
              reference: b.booking_reference || `FD-TRIP-${b.id}`,
              property: b.room_type?.property || {
                name: b.property_name || 'FindDestination Shortlet Stay',
                city: b.property_city || 'Bauchi',
                address: b.property_address || 'Central Area',
                images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80']
              },
              room: { name: b.room_type?.name || 'Standard Suite' },
              guestName: b.guest_name || currentUser?.name || 'Guest User',
              guestPhone: b.guest_phone || currentUser?.phone || '',
              guestEmail: b.guest_email || currentUser?.email || '',
              checkInDate: b.check_in_date,
              checkOutDate: b.check_out_date,
              nights: b.nights_count || 2,
              totalAmount: b.total_price_kobo ? b.total_price_kobo / 100 : 112500,
              status: b.booking_status || 'confirmed',
              escrowStatus: b.escrow_status || 'held'
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load user bookings from API:', err);
      }
    }

    // 2. Load from localStorage if present
    try {
      const localBookingsStr = localStorage.getItem('finddestination_recent_bookings') || localStorage.getItem('tafiya_recent_bookings');
      if (localBookingsStr) {
        const parsed = JSON.parse(localBookingsStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedBookings = [...parsed, ...loadedBookings];
        }
      }
    } catch (e) {
      console.error('Failed to parse local bookings', e);
    }

    // 3. Fallback to demo trips for rich visual demonstration if logged in & empty
    if (loadedBookings.length === 0 && currentUser) {
      loadedBookings = [
        {
          reference: 'FD-BA-2026-9482',
          property: {
            name: 'Yankari Game Reserve Eco-Lodge',
            city: 'Bauchi',
            state: 'Bauchi',
            address: 'Yankari Game Reserve Park Rd, Main Gate',
            images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'],
            verification_tier: 'tier_3_certified'
          },
          room: { name: 'Premier Wildlife Suite' },
          guestName: currentUser?.name || 'Verified Traveler',
          guestPhone: currentUser?.phone || '+234 802 111 2233',
          guestEmail: currentUser?.email || 'user@finddestination.com.ng',
          checkInDate: '2026-11-15',
          checkOutDate: '2026-11-17',
          nights: 2,
          totalAmount: 112500,
          status: 'confirmed',
          escrowStatus: 'held'
        },
        {
          reference: 'FD-KD-2026-3109',
          property: {
            name: 'Gamji Heritage Villa & Gardens',
            city: 'Kaduna',
            state: 'Kaduna',
            address: '14 Independence Way, Barnawa',
            images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'],
            verification_tier: 'tier_3_certified'
          },
          room: { name: 'Deluxe Executive Suite' },
          guestName: currentUser?.name || 'Verified Traveler',
          guestPhone: currentUser?.phone || '+234 802 111 2233',
          guestEmail: currentUser?.email || 'user@finddestination.com.ng',
          checkInDate: '2026-08-10',
          checkOutDate: '2026-08-12',
          nights: 2,
          totalAmount: 78000,
          status: 'completed',
          escrowStatus: 'released'
        }
      ];
    }

    setBookings(loadedBookings);
    setLoading(false);
  };

  const filteredBookings = bookings.filter(b => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'upcoming') return b.status === 'confirmed' || b.status === 'paid' || b.status === 'pending';
    if (activeFilter === 'completed') return b.status === 'completed';
    if (activeFilter === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">

      {/* Page Header */}
      <div className="flex items-center justify-between p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-tafiya-blue to-tafiya-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shrink-0">
            <MapPin className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black">My Trips & Reservations</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage your stays, view digital vouchers & escrow security</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Escrow Protected Stays</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Trips' },
          { id: 'upcoming', label: 'Upcoming Stays' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${activeFilter === tab.id
              ? 'bg-tafiya-blue text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-tafiya-blue animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading your reservations...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 space-y-4 max-w-md mx-auto my-8 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-tafiya-blue-50 text-tafiya-blue flex items-center justify-center mx-auto border border-tafiya-blue-100">
            <Calendar className="w-8 h-8 stroke-[2]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No Trips Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {activeFilter === 'all'
                ? "You don't have any bookings yet. Browse verified shortlet properties across Northern Nigeria and book with full escrow protection."
                : `No ${activeFilter} stays found in your account.`}
            </p>
          </div>
          <button
            onClick={onNavigateExplore}
            className="px-6 py-3 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-2 mx-auto"
          >
            <Search className="w-4 h-4" />
            <span>Explore Stays</span>
          </button>
        </div>
      ) : (
        /* Bookings List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((b, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">

              <div className="p-4 flex gap-4">
                <img
                  src={b.property.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                  alt={b.property.name}
                  className="w-24 h-24 rounded-xl object-cover shrink-0 shadow-xs"
                />

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-tafiya-blue bg-tafiya-blue-50 px-2 py-0.5 rounded-md border border-tafiya-blue/10">
                      {b.reference}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${b.status === 'confirmed' || b.status === 'paid'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : b.status === 'completed'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                      {b.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 truncate">{b.property.name}</h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-tafiya-blue shrink-0" />
                    <span>{b.property.address || b.property.city}, {b.property.state || 'Nigeria'}</span>
                  </p>

                  <div className="text-[11px] text-slate-600 font-medium pt-1 flex items-center justify-between">
                    <span>{b.checkInDate} → {b.checkOutDate}</span>
                    <span className="font-black text-slate-900">₦{b.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Escrow Footer Bar */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>{b.escrowStatus === 'released' ? 'Escrow Released to Host' : 'Escrow Protected'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenTracker && onOpenTracker(b.reference)}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Track</span>
                  </button>

                  <button
                    onClick={() => onOpenVoucher && onOpenVoucher(b)}
                    className="px-3.5 py-1.5 bg-tafiya-blue text-white rounded-lg text-xs font-bold hover:bg-tafiya-blue-600 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>Voucher</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
