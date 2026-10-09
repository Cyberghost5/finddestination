import React, { useState, useEffect } from 'react';
import { X, Search, MapPin, Calendar, Users, ShieldCheck, ChevronRight, Clock, RotateCcw } from 'lucide-react';

export default function SearchModal({ isOpen, onClose, searchParams, onApplySearch }) {
  // Helper to format Date to YYYY-MM-DD for date inputs
  const formatDateForInput = (dateObj) => {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = formatDateForInput(new Date());

  // Default checkout is 2 days from today
  const defaultCheckout = new Date();
  defaultCheckout.setDate(defaultCheckout.getDate() + 2);
  const defaultCheckoutStr = formatDateForInput(defaultCheckout);

  const [selectedState, setSelectedState] = useState(searchParams?.state || '');
  const [checkInDate, setCheckInDate] = useState(searchParams?.checkIn || todayStr);
  const [checkOutDate, setCheckOutDate] = useState(searchParams?.checkOut || defaultCheckoutStr);
  const [guestCount, setGuestCount] = useState(searchParams?.guests || 1);

  // Sync internal state when searchParams prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedState(searchParams?.state || '');
      setCheckInDate(searchParams?.checkIn || todayStr);
      setCheckOutDate(searchParams?.checkOut || defaultCheckoutStr);
      setGuestCount(searchParams?.guests || 1);
    }
  }, [isOpen, searchParams]);

  if (!isOpen) return null;

  // Calculate nights
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const totalNights = calculateNights();

  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value;
    setCheckInDate(newCheckIn);
    // If checkout is before or same as new check-in, update checkout to next day
    if (newCheckIn >= checkOutDate) {
      const nextDay = new Date(newCheckIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOutDate(formatDateForInput(nextDay));
    }
  };

  const handleClear = () => {
    setSelectedState('');
    setCheckInDate(todayStr);
    setCheckOutDate(defaultCheckoutStr);
    setGuestCount(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onApplySearch) {
      onApplySearch({
        state: selectedState,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: guestCount
      });
    }
    onClose();
  };

  const northernStates = [
    { name: 'Bauchi', subtitle: 'Yankari Game Reserve & Luxury Suites', count: '142 stays' },
    { name: 'Kaduna', subtitle: 'Business Hub & Serviced Apartments', count: '215 stays' },
    { name: 'Kano', subtitle: 'Commercial Capital & Historic Lodges', count: '310 stays' },
    { name: 'Plateau', subtitle: 'Cool Climate Resorts & Villas (Jos)', count: '188 stays' },
    { name: 'Adamawa', subtitle: 'Scenic Riverfront Stays (Yola)', count: '95 stays' },
    { name: 'Gombe', subtitle: 'Modern City Lodges & Hotels', count: '76 stays' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-12 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">Search Accommodations in Northern Nigeria</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSearchSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">

          {/* 1. Where to? Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Where to in Northern Nigeria?</h3>
              {selectedState && (
                <button
                  type="button"
                  onClick={() => setSelectedState('')}
                  className="text-[11px] font-bold text-tafiya-blue hover:underline flex items-center gap-1"
                >
                  Clear state filter
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {northernStates.map((state) => {
                const isSelected = selectedState.toLowerCase() === state.name.toLowerCase();
                return (
                  <button
                    type="button"
                    key={state.name}
                    onClick={() => setSelectedState(isSelected ? '' : state.name)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${isSelected
                        ? 'border-tafiya-blue bg-tafiya-blue-50/60 ring-2 ring-tafiya-blue/30 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-sm">{state.name}</span>
                      <MapPin className={`w-4 h-4 ${isSelected ? 'text-tafiya-blue' : 'text-slate-400'}`} />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{state.subtitle}</p>
                    <span className="inline-block text-[10px] font-bold text-tafiya-orange mt-2">{state.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Interactive Date Picker Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. When is your stay?</h3>
              {totalNights > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tafiya-orange/10 text-tafiya-orange text-[11px] font-bold">
                  <Clock className="w-3 h-3" />
                  <span>{totalNights} {totalNights === 1 ? 'Night' : 'Nights'} Duration</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Check-In Input */}
              <div className="p-3.5 border border-slate-200 rounded-2xl bg-white hover:border-slate-300 focus-within:ring-2 focus-within:ring-tafiya-blue focus-within:border-tafiya-blue transition-all">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Check-in Date
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-tafiya-orange shrink-0" />
                  <input
                    type="date"
                    min={todayStr}
                    value={checkInDate}
                    onChange={handleCheckInChange}
                    className="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* Check-Out Input */}
              <div className="p-3.5 border border-slate-200 rounded-2xl bg-white hover:border-slate-300 focus-within:ring-2 focus-within:ring-tafiya-blue focus-within:border-tafiya-blue transition-all">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Check-out Date
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-tafiya-orange shrink-0" />
                  <input
                    type="date"
                    min={checkInDate || todayStr}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Guest Count Counter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">3. Who is coming?</h3>
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl bg-white">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Guests & Travelers</span>
                <span className="text-[11px] text-slate-500">Corporate personnel, families, NGO workers</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center font-extrabold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
                >
                  -
                </button>
                <span className="text-sm font-extrabold text-slate-900 w-6 text-center">{guestCount}</span>
                <button
                  type="button"
                  onClick={() => setGuestCount(guestCount + 1)}
                  className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center font-extrabold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
                >
                  +
                </button>
              </div>
            </div>
          </div>

        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear all</span>
          </button>

          <button
            type="button"
            onClick={handleSearchSubmit}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 text-white rounded-full font-bold text-xs shadow-md hover:shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            <span>Search Available Stays</span>
          </button>
        </div>

      </div>
    </div>
  );
}
