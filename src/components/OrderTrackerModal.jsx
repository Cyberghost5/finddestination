import React, { useState, useEffect } from 'react';
import {
  Search,
  Package,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  X,
  QrCode,
  Building2,
  Phone,
  User,
  ArrowRight,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

export default function OrderTrackerModal({ isOpen, onClose, currentUser, onOpenVoucher, initialRef = '' }) {
  const [bookingRef, setBookingRef] = useState(initialRef || '');
  const [loading, setLoading] = useState(false);
  const [trackedBooking, setTrackedBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialRef) {
      setBookingRef(initialRef);
      handleTrack(initialRef);
    }
  }, [initialRef]);

  if (!isOpen) return null;

  const handleTrack = async (refToUse = bookingRef) => {
    const cleanRef = (refToUse || '').trim();
    if (!cleanRef) {
      setErrorMsg('Please enter your Booking Reference Number (e.g. FND-BA-2026-8920)');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setTrackedBooking(null);

    try {
      const response = await fetch('/api/v1/bookings/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          booking_reference: cleanRef
        })
      });

      const resData = await response.json();
      if (response.ok && resData.status === 'success' && resData.data) {
        setTrackedBooking(resData.data);
        return;
      }

      // Check localStorage for recently completed reservations
      const localBooking = findLocalBooking(cleanRef);
      if (localBooking) {
        setTrackedBooking(localBooking);
        return;
      }

      setErrorMsg(resData.message || `No reservation found matching reference: "${cleanRef}". Please check and try again.`);
    } catch (err) {
      console.error('Track error:', err);

      // Check localStorage fallback for client-side reservations
      const localBooking = findLocalBooking(cleanRef);
      if (localBooking) {
        setTrackedBooking(localBooking);
      } else {
        setErrorMsg(`Unable to locate reservation with reference "${cleanRef}". Please verify your reference number and try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const findLocalBooking = (ref) => {
    try {
      const savedStr = localStorage.getItem('finddestination_recent_bookings') || localStorage.getItem('tafiya_recent_bookings');
      if (!savedStr) return null;
      const list = JSON.parse(savedStr);
      if (!Array.isArray(list)) return null;

      const norm = ref.toUpperCase().trim();
      const match = list.find(b =>
        (b.reference && b.reference.toUpperCase().trim() === norm) ||
        (b.booking_reference && b.booking_reference.toUpperCase().trim() === norm)
      );

      if (!match) return null;

      const prop = match.property || {};
      const room = match.room || {};
      const propTitle = prop.name || match.propertyTitle || 'FindDestination Verified Stay';
      const propCity = prop.city || 'Kaduna';
      const propState = prop.state || 'Kaduna';
      const propAddress = prop.address || `${propCity}, ${propState}`;
      const coverImg = (prop.images && prop.images[0]) || match.coverImage || '/logo.jpeg';

      return {
        booking_reference: match.reference || match.booking_reference || norm,
        booking_status: match.status || 'confirmed',
        hold_expires_at: null,
        property: {
          id: prop.id || 1,
          title: propTitle,
          name: propTitle,
          city: propCity,
          state: propState,
          address: propAddress,
          cover_image: coverImg,
          images: prop.images || [coverImg],
          host_name: prop.host?.name || 'FindDestination Verified Host',
          host_phone: prop.contact_phone || prop.host?.phone || '+234 803 123 4567'
        },
        room_type: {
          name: room.name || 'Executive Apartment Suite',
          capacity: room.max_occupancy || 2
        },
        rooms_count: match.rooms_count || 1,
        guest_name: match.guestName || (currentUser && currentUser.name) || 'Guest Traveler',
        guest_phone: match.guestPhone || (currentUser && currentUser.phone) || '',
        guest_email: match.guestEmail || (currentUser && currentUser.email) || '',
        check_in_date: match.checkInDate || match.checkIn || '2026-10-13',
        check_out_date: match.checkOutDate || match.checkOut || '2026-10-15',
        total_nights: match.nights || 2,
        total_amount_formatted: typeof match.totalAmount === 'number'
          ? `₦${match.totalAmount.toLocaleString()}`
          : (match.totalAmount || '₦75,000.00'),
        platform_fee_formatted: '₦9,375.00',
        payment: {
          status: 'successful',
          gateway: match.paymentRail || 'paystack',
          paid_at: match.paidAt || new Date().toISOString()
        },
        created_at: match.paidAt || new Date().toISOString()
      };
    } catch {
      return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Payment Verified & Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Payment Pending (15m Hold)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            {(status || 'CONFIRMED').toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-8">

        {/* Header Modal Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-tafiya-blue p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-tafiya-orange">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white">Track Order & Reservation</h2>
              <p className="text-xs text-slate-300">
                Check instant payment verification, check-in vouchers, and stay details
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* Lookup Form */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Booking Reference ID
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTrack();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="e.g. FND-BA-2026-8920"
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-tafiya-blue focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-tafiya-blue hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shrink-0"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Track Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
              <span>Don't have your code? Check your SMS or payment receipt email.</span>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tracked Booking Results View */}
          {trackedBooking && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
              <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reference ID</span>
                  <h3 className="text-lg font-mono font-extrabold text-slate-900">{trackedBooking.booking_reference}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(trackedBooking.booking_status)}
                  <button
                    type="button"
                    onClick={() => {
                      setTrackedBooking(null);
                      setBookingRef('');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Track another reference"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Property Details */}
                <div className="flex items-start gap-4">
                  <img
                    src={trackedBooking.property?.cover_image || '/logo.jpeg'}
                    alt={trackedBooking.property?.title || 'Property'}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0 shadow-sm"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{trackedBooking.property?.title}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-tafiya-orange shrink-0" />
                      <span>{trackedBooking.property?.address}, {trackedBooking.property?.city}, {trackedBooking.property?.state}</span>
                    </p>
                    <span className="inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      Room: {trackedBooking.room_type?.name} ({trackedBooking.rooms_count} Room)
                    </span>
                  </div>
                </div>

                {/* Dates & Cost Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-500 block font-medium">Check-in</span>
                    <strong className="text-slate-900 font-bold text-sm">{trackedBooking.check_in_date}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Check-out</span>
                    <strong className="text-slate-900 font-bold text-sm">{trackedBooking.check_out_date}</strong>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-500 block font-medium">Total Paid (Escrowed)</span>
                    <strong className="text-tafiya-blue font-extrabold text-sm">{trackedBooking.total_amount_formatted}</strong>
                  </div>
                </div>

                {/* Host Contact Details & Voucher action */}
                <div className="p-4 border border-blue-100 bg-blue-50/40 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-tafiya-blue text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {trackedBooking.property?.host_name ? trackedBooking.property.host_name.charAt(0) : 'H'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{trackedBooking.property?.host_name || 'Verified Host'}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-tafiya-blue" />
                        <span>{trackedBooking.property?.host_phone || '+234 803 123 4567'}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenVoucher && onOpenVoucher({
                        reference: trackedBooking.booking_reference,
                        bookingRef: trackedBooking.booking_reference,
                        property: {
                          name: trackedBooking.property?.title || trackedBooking.property?.name || 'FindDestination Stay',
                          address: trackedBooking.property?.address || `${trackedBooking.property?.city}, ${trackedBooking.property?.state}`,
                          city: trackedBooking.property?.city || 'Kaduna',
                          state: trackedBooking.property?.state || '',
                          images: trackedBooking.property?.images || ['/logo.jpeg']
                        },
                        propertyTitle: trackedBooking.property?.title || trackedBooking.property?.name,
                        location: `${trackedBooking.property?.city || ''}, ${trackedBooking.property?.state || ''}`,
                        checkInDate: trackedBooking.check_in_date,
                        checkOutDate: trackedBooking.check_out_date,
                        checkIn: trackedBooking.check_in_date,
                        checkOut: trackedBooking.check_out_date,
                        totalAmount: trackedBooking.total_amount_formatted,
                        guestName: trackedBooking.guest_name || (currentUser && currentUser.name) || 'Verified Guest',
                        guestPhone: trackedBooking.guest_phone || (currentUser && currentUser.phone) || '',
                        nights: trackedBooking.total_nights || 2,
                        status: trackedBooking.booking_status || 'confirmed',
                        escrowStatus: 'held'
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
                  >
                    <QrCode className="w-4 h-4 text-tafiya-orange" />
                    <span>View QR Voucher</span>
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 flex items-center justify-between px-6">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            FindDestination Escrow Protected Payments
          </span>
        </div>

      </div>
    </div>
  );
}
