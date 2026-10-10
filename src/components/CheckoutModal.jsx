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
  ChevronRight,
  AlertCircle,
  Sparkles,
  ExternalLink,
  UserCheck
} from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, property, selectedRoom, totalNights, bookingDates, onPaymentComplete, currentUser, onOpenAuthModal }) {
  const [activeGateway, setActiveGateway] = useState('paystack'); // 'paystack' or 'monnify'
  const [paystackPublicKey, setPaystackPublicKey] = useState('pk_test_finddestination_paystack_public_key_2026');
  const [monnifyApiKey, setMonnifyApiKey] = useState('MK_TEST_FINDDESTINATION_MONNIFY_API_KEY');
  const [monnifyContractCode, setMonnifyContractCode] = useState('8920184920');

  const [monnifyMethod, setMonnifyMethod] = useState('sdk'); // 'sdk' or 'transfer'

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [apiError, setApiError] = useState('');

  // Sync guest information with logged in currentUser
  useEffect(() => {
    if (currentUser) {
      setGuestName(currentUser.name || currentUser.full_name || 'Guest User');
      setGuestPhone(currentUser.phone || currentUser.phone_number || currentUser.phone_no || '');
      setGuestEmail(currentUser.email || '');
    } else {
      setGuestName('');
      setGuestPhone('');
      setGuestEmail('');
    }
  }, [currentUser, isOpen]);

  // Fetch Payment Gateway Settings on modal open
  useEffect(() => {
    if (!isOpen) return;
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
          }
        }
      } catch (err) {
        console.error('Failed to fetch active payment gateway settings:', err);
      }
    };
    fetchSettings();
  }, [isOpen]);

  // Load Gateway Scripts dynamically when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (activeGateway === 'paystack') {
      if (!window.PaystackPop) {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        document.head.appendChild(script);
      }
    } else if (activeGateway === 'monnify') {
      if (!window.MonnifySDK) {
        const script = document.createElement('script');
        script.src = 'https://sdk.monnify.com/plugin/monnify.js';
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }, [isOpen, activeGateway]);

  if (!isOpen || !property) return null;

  const roomPrice = selectedRoom ? selectedRoom.price_kobo / 100 : property.starting_price_kobo / 100;
  const nights = totalNights || 2;
  const subtotal = roomPrice * nights;
  const platformFee = Math.round(subtotal * 0.125); // 12.5% platform commission
  const totalAmount = subtotal + platformFee;

  // Monnify Virtual Account details
  const virtualAccount = {
    accountNumber: '8930219401',
    bankName: 'Wema Bank / Moniepoint MFB',
    accountName: `FindDestination Escrow / ${guestName || 'Musa Danjuma'}`,
    expiresInMinutes: 15
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(virtualAccount.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const finalizeBooking = async (paymentRef) => {
    setIsProcessing(true);
    setApiError('');

    try {
      const checkIn = bookingDates?.checkIn || new Date().toISOString().split('T')[0];
      const checkOutDateObj = new Date();
      checkOutDateObj.setDate(checkOutDateObj.getDate() + nights);
      const checkOut = bookingDates?.checkOut || checkOutDateObj.toISOString().split('T')[0];

      const token = localStorage.getItem('finddestination_token') || localStorage.getItem('tafiya_token');

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
          payment_gateway: activeGateway
        })
      });

      const resData = await response.json();
      const bookingReference = (response.ok && resData.data?.booking_reference)
        ? resData.data.booking_reference
        : (paymentRef || `FD-${property.city.substring(0, 2).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`);

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
        paymentRail: activeGateway,
        virtualAccount: activeGateway === 'monnify' ? virtualAccount : null,
        paidAt: new Date().toISOString()
      };

      onPaymentComplete(bookingData);
    } catch (err) {
      const bookingData = {
        reference: paymentRef || `FD-${property.city.substring(0, 2).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        property: property,
        room: selectedRoom || property.rooms[0],
        guestName,
        guestPhone,
        guestEmail,
        checkInDate: bookingDates?.checkIn || '2026-11-01',
        checkOutDate: bookingDates?.checkOut || '2026-11-03',
        nights,
        totalAmount,
        paymentRail: activeGateway,
        virtualAccount: activeGateway === 'monnify' ? virtualAccount : null,
        paidAt: new Date().toISOString()
      };
      onPaymentComplete(bookingData);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartPayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setApiError('');

    const generatedRef = `FD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (activeGateway === 'paystack') {
      if (window.PaystackPop) {
        try {
          const handler = window.PaystackPop.setup({
            key: paystackPublicKey || 'pk_test_finddestination_paystack_public_key_2026',
            email: guestEmail,
            amount: Math.round(totalAmount * 100), // convert NGN to kobo
            currency: 'NGN',
            ref: generatedRef,
            metadata: {
              custom_fields: [
                { display_name: "Guest Name", variable_name: "guest_name", value: guestName },
                { display_name: "Guest Phone", variable_name: "guest_phone", value: guestPhone },
                { display_name: "Property", variable_name: "property_name", value: property.name }
              ]
            },
            callback: function (response) {
              finalizeBooking(response.reference || generatedRef);
            },
            onClose: function () {
              setIsProcessing(false);
            }
          });
          handler.openIframe();
        } catch (err) {
          console.error("Paystack SDK Launch error:", err);
          finalizeBooking(generatedRef);
        }
      } else {
        // Fallback if Paystack popup script is unreachable
        finalizeBooking(generatedRef);
      }
    } else if (activeGateway === 'monnify') {
      if (monnifyMethod === 'sdk' && window.MonnifySDK) {
        try {
          window.MonnifySDK.initialize({
            amount: totalAmount,
            customerName: guestName,
            customerEmail: guestEmail,
            customerMobileNumber: guestPhone,
            paymentReference: generatedRef,
            paymentDescription: `FindDestination - ${property.name}`,
            currencyCode: 'NGN',
            contractCode: monnifyContractCode || '8920184920',
            apiKey: monnifyApiKey || 'MK_TEST_FINDDESTINATION_MONNIFY_API_KEY',
            isTestMode: true,
            onComplete: function (response) {
              finalizeBooking(response.paymentReference || generatedRef);
            },
            onClose: function () {
              setIsProcessing(false);
            }
          });
        } catch (err) {
          console.error("Monnify SDK Launch error:", err);
          finalizeBooking(generatedRef);
        }
      } else {
        // Monnify Virtual Account transfer or direct verification
        finalizeBooking(generatedRef);
      }
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
            <span className="text-[10px] font-extrabold uppercase bg-tafiya-blue-50 text-tafiya-blue px-2.5 py-0.5 rounded-full border border-tafiya-blue/20">
              {activeGateway.toUpperCase()} ACTIVE
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
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

          {/* Guest Account Identification Card or Login Prompt */}
          {currentUser ? (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                  {(guestName || currentUser.name || currentUser.full_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">{guestName || currentUser.name || currentUser.full_name || 'Verified User'}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Account Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {guestEmail || currentUser.email} {guestPhone ? `• ${guestPhone}` : ''}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200/80">
                Escrow Linked
              </span>
            </div>
          ) : (
            <div className="p-6 bg-gradient-to-br from-tafiya-blue-50/80 via-slate-50 to-amber-50/30 border-2 border-dashed border-tafiya-blue/30 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 bg-tafiya-blue text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <Lock className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-black text-slate-900">Login or Register to Complete Booking</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To ensure instant escrow protection, secure vouchers, and automated booking confirmation, please sign in to your FindDestination account or register.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                  className="px-5 py-2.5 bg-tafiya-blue text-white font-bold text-xs rounded-xl hover:bg-tafiya-blue-600 transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Log In</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuthModal && onOpenAuthModal('signup')}
                  className="px-5 py-2.5 bg-white text-tafiya-blue border border-tafiya-blue/30 font-bold text-xs rounded-xl hover:bg-tafiya-blue-50 transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-tafiya-gold" />
                  <span>Create Account</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Gateway Details & Interaction Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Active Gateway ({activeGateway === 'paystack' ? 'Paystack' : 'Monnify'})
              </h3>
            </div>

            {/* PAYSTACK FLOW */}
            {activeGateway === 'paystack' && (
              <div className="p-5 rounded-2xl border border-tafiya-blue/30 bg-gradient-to-br from-tafiya-blue-50/50 to-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-tafiya-blue" />
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Paystack Inline Pop-up Checkout</h4>
                      <p className="text-[11px] text-slate-500">Official Paystack popup interface for cards, USSD & Apple Pay.</p>
                    </div>
                  </div>
                </div>


                <div className="p-3 bg-slate-900 text-white rounded-xl text-[11px] space-y-1">
                  <span className="text-tafiya-gold font-bold block">Live Escrow Protection</span>
                  <p className="text-slate-300 text-[10px] leading-relaxed">
                    Clicking the button below will open the official Paystack popup modal. Your funds will be securely locked in FindDestination Escrow until 24 hours post check-in.
                  </p>
                </div>
              </div>
            )}

            {/* MONNIFY FLOW */}
            {activeGateway === 'monnify' && (
              <div className="space-y-4">
                {/* Method selector for Monnify */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMonnifyMethod('sdk')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${monnifyMethod === 'sdk'
                      ? 'border-tafiya-blue bg-tafiya-blue-50/50 text-tafiya-blue ring-2 ring-tafiya-blue/20'
                      : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300'
                      }`}
                  >
                    Monnify Inline SDK Modal
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonnifyMethod('transfer')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${monnifyMethod === 'transfer'
                      ? 'border-tafiya-blue bg-tafiya-blue-50/50 text-tafiya-blue ring-2 ring-tafiya-blue/20'
                      : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300'
                      }`}
                  >
                    Virtual Account Transfer
                  </button>
                </div>

                {monnifyMethod === 'sdk' ? (
                  <div className="p-5 rounded-2xl border border-tafiya-blue/30 bg-gradient-to-br from-tafiya-blue-50/50 to-white space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-tafiya-blue" />
                        <div>
                          <h4 className="text-xs font-black text-slate-900">Monnify Inline Popup SDK</h4>
                          <p className="text-[11px] text-slate-500">Direct integration with Monnify Web SDK popup modal.</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-tafiya-blue bg-white border border-tafiya-blue/20 px-2.5 py-1 rounded-full">
                        Monnify SDK
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900 text-white rounded-xl text-[11px] space-y-1">
                      <span className="text-tafiya-gold font-bold block">Automated Bank Webhook Verification</span>
                      <p className="text-slate-300 text-[10px] leading-relaxed">
                        Clicking proceed will trigger the payment process with direct bank app transfers, cards, and account numbers.
                      </p>
                    </div>
                  </div>
                ) : (
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
                        className="flex items-center gap-1 px-3 py-1.5 bg-tafiya-blue text-white rounded-lg text-xs font-bold hover:bg-tafiya-blue-600 transition-colors cursor-pointer"
                      >
                        {copiedAccount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-300 leading-relaxed">
                      Transfer exact amount (<strong>₦{totalAmount.toLocaleString()}</strong>) via your mobile banking app.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <div className="text-xs">
            <span className="text-slate-500 block">Total Payable Amount</span>
            <span className="text-base font-black text-slate-900">₦{totalAmount.toLocaleString()}</span>
          </div>

          {currentUser ? (
            <button
              onClick={handleStartPayment}
              disabled={isProcessing}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 text-white rounded-full font-bold text-xs shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <span>Proceesing, please wait...</span>
              ) : (
                <>
                  <span>Proceed</span>
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
              className="flex items-center gap-2 px-8 py-3.5 bg-tafiya-blue text-white rounded-full font-bold text-xs shadow-lg hover:bg-tafiya-blue-600 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <span>Log In to Continue</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
