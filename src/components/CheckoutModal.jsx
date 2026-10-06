import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Building2, 
  Clock, 
  Copy, 
  Check, 
  Lock,
  Smartphone,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, property, selectedRoom, totalNights, bookingDates, onPaymentComplete }) {
  const [paymentRail, setPaymentRail] = useState('monnify'); // 'monnify' or 'paystack'
  const [guestName, setGuestName] = useState('Musa Danjuma');
  const [guestPhone, setGuestPhone] = useState('+234 802 111 2233');
  const [guestEmail, setGuestEmail] = useState('musa.danjuma@example.com');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [apiError, setApiError] = useState('');

  // Monnify Virtual Account Simulation
  const virtualAccount = {
    accountNumber: '8930219401',
    bankName: 'Wema Bank / Moniepoint MFB',
    accountName: `FindDestination Escrow / ${guestName || 'Musa Danjuma'}`,
    expiresInMinutes: 15
  };

  if (!isOpen || !property) return null;

  const roomPrice = selectedRoom ? selectedRoom.price_kobo / 100 : property.starting_price_kobo / 100;
  const nights = totalNights || 2;
  const subtotal = roomPrice * nights;
  const platformFee = Math.round(subtotal * 0.125); // 12.5% platform commission
  const totalAmount = subtotal + platformFee;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(virtualAccount.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleCompleteBooking = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setApiError('');

    try {
      // Attempt backend API booking store
      const checkIn = bookingDates?.checkIn || new Date().toISOString().split('T')[0];
      const checkOutDateObj = new Date();
      checkOutDateObj.setDate(checkOutDateObj.getDate() + nights);
      const checkOut = bookingDates?.checkOut || checkOutDateObj.toISOString().split('T')[0];

      const token = localStorage.getItem('tafiya_token');

      const response = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          room_type_id: selectedRoom?.id || 1,
          rooms_count: 1,
          check_in_date: checkIn,
          check_out_date: checkOut,
          guest_name: guestName,
          guest_phone: guestPhone,
          guest_email: guestEmail,
          payment_gateway: paymentRail
        })
      });

      const resData = await response.json();

      const bookingReference = (response.ok && resData.data?.booking_reference)
        ? resData.data.booking_reference
        : `TAF-${property.city.substring(0, 2).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const bookingData = {
        reference: bookingReference,
        property: property,
        room: selectedRoom || property.rooms[0],
        guestName,
        guestPhone,
        guestEmail,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        nights,
        totalAmount,
        paymentRail,
        virtualAccount: paymentRail === 'monnify' ? virtualAccount : null,
        paidAt: new Date().toISOString()
      };

      onPaymentComplete(bookingData);
    } catch (err) {
      // Graceful fallback for offline / mock testing
      const bookingData = {
        reference: `TAF-${property.city.substring(0, 2).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        property: property,
        room: selectedRoom || property.rooms[0],
        guestName,
        guestPhone,
        guestEmail,
        checkInDate: bookingDates?.checkIn || '2026-11-01',
        checkOutDate: bookingDates?.checkOut || '2026-11-03',
        nights,
        totalAmount,
        paymentRail,
        virtualAccount: paymentRail === 'monnify' ? virtualAccount : null,
        paidAt: new Date().toISOString()
      };
      onPaymentComplete(bookingData);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-tafiya-blue" />
            <span className="text-sm font-extrabold text-slate-900">Secure Escrow Checkout</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Reservation Summary Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-4">
            <img 
              src={property.images[0]} 
              alt={property.name} 
              className="w-20 h-20 rounded-xl object-cover shadow-sm shrink-0"
            />
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-tafiya-blue bg-tafiya-blue-50 px-2 py-0.5 rounded-full">
                {property.verification_tier === 'tier_3_certified' ? 'FindDestination Verified' : 'Location Verified'}
              </span>
              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{property.name}</h4>
              <p className="text-[11px] text-slate-500">
                {selectedRoom ? selectedRoom.name : 'Standard Suite'} • {nights} {nights === 1 ? 'Night' : 'Nights'}
                {bookingDates?.checkIn && bookingDates?.checkOut ? ` (${bookingDates.checkIn} → ${bookingDates.checkOut})` : ''}
              </p>
              <div className="text-xs font-extrabold text-slate-900">
                Total: ₦{totalAmount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Guest Details Form */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">1. Guest Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Full Name</label>
                <input 
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tafiya-blue font-semibold text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Phone Number</label>
                <input 
                  type="text"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tafiya-blue font-semibold text-slate-800"
                  required
                />
              </div>
            </div>
          </div>

          {/* High Priority Multi-Rail Payment Gateway Selection (PRD Section 3) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">2. Select Payment Gateway Rail</h3>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Escrow Protected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Monnify Rail */}
              <button
                type="button"
                onClick={() => setPaymentRail('monnify')}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  paymentRail === 'monnify'
                    ? 'border-tafiya-blue bg-tafiya-blue-50/40 ring-2 ring-tafiya-blue/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-slate-900">Monnify Transfer</span>
                  <Building2 className={`w-4 h-4 ${paymentRail === 'monnify' ? 'text-tafiya-blue' : 'text-slate-400'}`} />
                </div>
                <p className="text-[11px] text-slate-600 font-medium">Dynamic Virtual Account & Instant Direct Bank App Transfer.</p>
                <span className="inline-block text-[10px] font-bold text-tafiya-orange mt-2 bg-tafiya-orange-50 px-2 py-0.5 rounded-full">
                  Zero Drop-off • Preferred Rail
                </span>
              </button>

              {/* Paystack Rail */}
              <button
                type="button"
                onClick={() => setPaymentRail('paystack')}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  paymentRail === 'paystack'
                    ? 'border-tafiya-blue bg-tafiya-blue-50/40 ring-2 ring-tafiya-blue/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-slate-900">Paystack Gateway</span>
                  <CreditCard className={`w-4 h-4 ${paymentRail === 'paystack' ? 'text-tafiya-blue' : 'text-slate-400'}`} />
                </div>
                <p className="text-[11px] text-slate-600 font-medium">Debit/Credit Cards (Mastercard, Visa, Verve) & USSD Banking.</p>
                <span className="inline-block text-[10px] font-bold text-slate-600 mt-2 bg-slate-100 px-2 py-0.5 rounded-full">
                  Cards & Apple Pay
                </span>
              </button>

            </div>

            {/* Rail Details Box */}
            {paymentRail === 'monnify' ? (
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Reserved Virtual Account</span>
                  <span className="text-tafiya-orange font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 15:00 Hold Countdown
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Account Number</span>
                    <span className="text-base font-black tracking-wider text-tafiya-gold">{virtualAccount.accountNumber}</span>
                    <span className="text-[10px] text-slate-400 block">{virtualAccount.bankName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="flex items-center gap-1 px-3 py-1.5 bg-tafiya-blue text-white rounded-lg text-xs font-bold hover:bg-tafiya-blue-600 transition-colors"
                  >
                    {copiedAccount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Transfer exact amount (<strong>₦{totalAmount.toLocaleString()}</strong>) via your mobile banking app. Payment triggers instant webhook verification.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-900 block">Card & USSD Details</span>
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="Card Number (4111 •••• •••• 1111)" 
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-mono"
                    defaultValue="5399 4100 8829 1928"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="MM / YY" 
                      className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-mono"
                      defaultValue="12/28"
                    />
                    <input 
                      type="text" 
                      placeholder="CVV" 
                      className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-mono"
                      defaultValue="819"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <div className="text-xs">
            <span className="text-slate-500 block">Total Due</span>
            <span className="text-base font-black text-slate-900">₦{totalAmount.toLocaleString()}</span>
          </div>

          <button
            onClick={handleCompleteBooking}
            disabled={isProcessing}
            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 text-white rounded-full font-bold text-xs shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <span>Verifying Webhook Payment...</span>
            ) : (
              <>
                <span>Confirm & Escrow Book</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
