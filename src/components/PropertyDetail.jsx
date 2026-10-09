import React, { useState, useEffect } from 'react';
import MapView from './MapView';
import {
  ArrowLeft,
  Star,
  Share2,
  Heart,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Building2,
  Zap,
  Droplets,
  Wind,
  Wifi,
  Shield,
  Coffee,
  Waves,
  Calendar,
  Users,
  Grid,
  X,
  ChevronRight,
  Lock,
  Award
} from 'lucide-react';

export default function PropertyDetail({ property, onBack, onInitiateBooking, isSaved, onToggleWishlist, onOpenShareModal }) {
  if (!property) return null;

  const formatDateForInput = (dateObj) => {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = formatDateForInput(new Date());
  const defaultCheckout = new Date();
  defaultCheckout.setDate(defaultCheckout.getDate() + 2);
  const defaultCheckoutStr = formatDateForInput(defaultCheckout);

  const [selectedRoom, setSelectedRoom] = useState(property.rooms[0] || null);
  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkOutDate, setCheckOutDate] = useState(defaultCheckoutStr);
  const [nightsCount, setNightsCount] = useState(2);
  const [guestCount, setGuestCount] = useState(1);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Recalculate nights whenever check-in or check-out changes
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      setNightsCount(diff > 0 ? diff : 1);
    }
  }, [checkInDate, checkOutDate]);

  const images = property.images && property.images.length > 0 ? property.images : [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
  ];

  const roomPrice = selectedRoom ? selectedRoom.price_kobo / 100 : property.starting_price_kobo / 100;
  const subtotal = roomPrice * nightsCount;
  const platformFee = Math.round(subtotal * 0.125);
  const totalAmount = subtotal + platformFee;

  const renderVerificationBadge = () => {
    if (property.verification_tier === 'tier_3_certified') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
          <span>Tier 3 Tafiya Verified</span>
        </span>
      );
    }
    if (property.verification_tier === 'tier_2_location') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tafiya-blue-50 text-tafiya-blue border border-tafiya-blue-200 text-xs font-extrabold">
          <MapPin className="w-4 h-4 text-tafiya-blue" />
          <span>Tier 2 Location Verified</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold">
        <ShieldCheck className="w-4 h-4 text-slate-500" />
        <span>Tier 1 Docs Verified</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">

      {/* Back Button & Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-tafiya-blue transition-colors px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Stays</span>
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Check out ${property.name} on FindDestination`,
                  text: `Verified stay in ${property.city}, ${property.state}`,
                  url: `${window.location.origin}/?stay=${property.id}`
                }).catch(() => onOpenShareModal && onOpenShareModal(property));
              } else {
                onOpenShareModal && onOpenShareModal(property);
              }
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={() => onToggleWishlist && onToggleWishlist(property.id)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Heart className={`w-4 h-4 transition-all ${isSaved ? 'text-tafiya-orange fill-tafiya-orange scale-110' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Property Title & Header Meta */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          {renderVerificationBadge()}
          <span className="text-xs font-bold text-slate-500">{property.category || 'Luxury Accommodation'}</span>
        </div>

        <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {property.name}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-tafiya-orange fill-tafiya-orange" />
            <span className="font-extrabold">{property.rating}</span>
            <span className="text-slate-400">({property.review_count} verified reviews)</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 text-slate-600">
            <MapPin className="w-4 h-4 text-tafiya-blue" />
            <span>{property.address}, {property.city}, {property.state}</span>
          </div>
        </div>
      </div>

      {/* Airbnb 5-Photo Hero Grid */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 aspect-[16/9] md:aspect-[21/9]">

          {/* Main Large Hero Image */}
          <div className="md:col-span-2 h-full overflow-hidden">
            <img
              src={images[0]}
              alt={property.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
              onClick={() => setIsGalleryOpen(true)}
            />
          </div>

          {/* 4 Secondary Grid Images */}
          <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-2 h-full">
            {images.slice(1, 5).map((imgUrl, idx) => (
              <div key={idx} className="h-full overflow-hidden">
                <img
                  src={imgUrl}
                  alt={`${property.name} ${idx + 2}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() => setIsGalleryOpen(true)}
                />
              </div>
            ))}
          </div>

        </div>

        {/* Show All Photos Floating Button */}
        <button
          onClick={() => setIsGalleryOpen(true)}
          className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-900 shadow-lg hover:bg-white transition-all cursor-pointer"
        >
          <Grid className="w-4 h-4 text-tafiya-blue" />
          <span>Show all {images.length} photos</span>
        </button>
      </div>

      {/* Main Content Layout: Left Details + Sticky Right Booking Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">

        {/* Left Column: Details & Verification */}
        <div className="lg:col-span-2 space-y-8">

          {/* Host Info Box */}
          <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                Hosted by {property.host?.name || 'Alhaji Ibrahim Bello'}
              </h3>
              <p className="text-xs text-slate-500">
                {property.host?.role || 'Verified Super Host'} • Joined {property.host?.joined || '2024'} • Response Rate: {property.host?.response_rate || '99%'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-tafiya-blue to-tafiya-orange text-white font-extrabold flex items-center justify-center text-sm shadow-md shrink-0">
              {property.host?.name ? property.host.name.charAt(0) : 'A'}
            </div>
          </div>

          {/* PRD Section 6: Verification Protocol Card */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4 shadow-md border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-tafiya-orange" />
                <h3 className="text-sm font-extrabold text-white">Anti-Fraud Verification Clearance</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This property has undergone physical on-site audit by Tafiya Field Agents in {property.city}, {property.state}.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
                <span className="text-[10px] font-bold text-tafiya-orange block uppercase">CAC & Legal</span>
                <span className="text-xs font-bold text-white">Docs Verified</span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
                <span className="text-[10px] font-bold text-tafiya-blue block uppercase">GPS Coordinate</span>
                <span className="text-xs font-bold text-white">50m Radius Verified</span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 block uppercase">24/7 Power Audit</span>
                <span className="text-xs font-bold text-white">Solar Backup Passed</span>
              </div>
            </div>

            {/* Interactive Leaflet Location Map */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-300 block mb-2">Verified GPS Location & Neighborhood Map:</span>
              <div className="h-64 rounded-2xl overflow-hidden border border-slate-700 shadow-md">
                <MapView singleProperty={property} />
              </div>
            </div>
          </div>

          {/* Room Tiers Selection */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Select Available Room Tier</h3>

            <div className="space-y-3">
              {property.rooms.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${isSelected
                      ? 'border-tafiya-blue bg-tafiya-blue-50/50 ring-2 ring-tafiya-blue/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-slate-900">{room.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {room.bed_type} • Max Occupancy: {room.max_occupancy} Guests
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block">{room.price_formatted}</span>
                      <span className="text-[10px] text-slate-400">per night</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Property Amenities */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900">Verified Amenities</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              {property.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/80">
                  <CheckCircle2 className="w-4 h-4 text-tafiya-blue shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Airbnb Booking Box */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white rounded-3xl p-6 border border-slate-200 shadow-airbnb space-y-6">

            {/* Price Header */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-slate-900">{selectedRoom ? selectedRoom.price_formatted : property.starting_price_formatted}</span>
                <span className="text-xs text-slate-500"> / night</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                <Star className="w-3.5 h-3.5 text-tafiya-orange fill-tafiya-orange" />
                <span>{property.rating}</span>
              </div>
            </div>

            {/* Interactive Date & Guest Picker Inputs */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200">
              <div className="grid grid-cols-2 divide-x divide-slate-200 bg-slate-50/50">
                <div className="p-2.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-0.5">Check-in</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={checkInDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCheckInDate(val);
                      if (val >= checkOutDate) {
                        const nextDay = new Date(val);
                        nextDay.setDate(nextDay.getDate() + 1);
                        setCheckOutDate(formatDateForInput(nextDay));
                      }
                    }}
                    className="w-full text-xs font-extrabold text-slate-900 bg-transparent border-0 p-0 focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="p-2.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-0.5">Check-out</label>
                  <input
                    type="date"
                    min={checkInDate || todayStr}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full text-xs font-extrabold text-slate-900 bg-transparent border-0 p-0 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-3 bg-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Guests</span>
                  <span className="text-xs font-bold text-slate-800">{guestCount} Guest(s)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer hover:bg-slate-100"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuestCount(guestCount + 1)}
                    className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs font-medium text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>₦{roomPrice.toLocaleString()} x {nightsCount} {nightsCount === 1 ? 'night' : 'nights'}</span>
                <span className="font-bold text-slate-900">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Escrow Protection Fee (12.5%)</span>
                <span className="font-bold text-slate-900">₦{platformFee.toLocaleString()}</span>
              </div>

              <div className="h-[1px] bg-slate-200 my-2"></div>

              <div className="flex justify-between text-sm font-extrabold text-slate-900">
                <span>Total</span>
                <span className="text-tafiya-blue">₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Instant Reserve Button */}
            <button
              onClick={() => onInitiateBooking(property, selectedRoom, nightsCount, checkInDate, checkOutDate, guestCount)}
              className="w-full py-4 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 text-white font-extrabold text-xs rounded-2xl shadow-lg hover:shadow-tafiya-blue/30 transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-tafiya-gold" />
              <span>Proceed</span>
            </button>

            <p className="text-[11px] text-center text-slate-400">
              You won't be charged until you confirm payment rail in next step.
            </p>

          </div>
        </div>

      </div>

      {/* Fullscreen Photo Gallery Overlay Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 p-4 sm:p-8 flex flex-col justify-between animate-in fade-in duration-200 overflow-y-auto">
          <div className="flex items-center justify-between text-white pb-4 border-b border-white/10">
            <span className="text-sm font-bold">{property.name} Photo Gallery</span>
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-6 max-w-6xl mx-auto">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-64 object-cover rounded-2xl border border-white/10 shadow-lg"
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
