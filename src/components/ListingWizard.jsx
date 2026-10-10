import React, { useState, useRef } from 'react';
import {
  X,
  Building2,
  MapPin,
  DollarSign,
  ShieldCheck,
  Upload,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Zap,
  FileText,
  Navigation,
  Map,
  Loader2,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import MapLocationPickerModal from './MapLocationPickerModal';

export default function ListingWizard({ isOpen, onClose, onPropertyCreated, currentUser }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationStatusMsg, setLocationStatusMsg] = useState('');
  const [stepErrors, setStepErrors] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    property_type: 'hotel',
    state: 'Bauchi',
    city: 'Bauchi',
    address: '',
    latitude: '10.3158',
    longitude: '9.8442',
    contact_phone: currentUser?.phone || '+234 803 100 2000',
    room_name: 'Executive Suite',
    base_price_ngn: '45000',
    total_units: '4',
    max_occupancy: '2',
    bed_type: 'King Bed',
    amenities: ['24/7 Power', 'Constant Water', 'Air Conditioning', 'WiFi', 'Armed Security'],
    cac_number: currentUser?.cac_number || 'RC-1928401',
    tin_number: currentUser?.tin_number || 'TIN-9920194',
    owner_nin: '39201948201'
  });

  if (!isOpen) return null;

  // Validation per step
  const validateCurrentStep = () => {
    const errors = {};
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        errors.name = 'Please enter a property or hotel name.';
      }
      if (!formData.city.trim()) {
        errors.city = 'Please enter the city or town.';
      }
    } else if (currentStep === 2) {
      if (!formData.address.trim()) {
        errors.address = 'Please enter the full physical address of the property.';
      }
    } else if (currentStep === 3) {
      if (!formData.room_name.trim()) {
        errors.room_name = 'Please enter a room tier name.';
      }
      const price = parseInt(formData.base_price_ngn, 10);
      if (!price || price <= 0) {
        errors.base_price_ngn = 'Please enter a valid nightly price in Naira.';
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < 5) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setStepErrors({});
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(amenity);
      const updated = exists
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities: updated };
    });
  };

  // Get Live Location via Browser Geolocation API + Nominatim Reverse Geocoding
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatusMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationStatusMsg('Detecting live device GPS location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const latStr = latitude.toFixed(6);
        const lngStr = longitude.toFixed(6);

        setFormData(prev => ({
          ...prev,
          latitude: latStr,
          longitude: lngStr
        }));

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              const addr = data.address || {};
              const street = addr.road || addr.street || addr.suburb || addr.neighbourhood || '';
              const area = addr.suburb || addr.city_district || addr.neighbourhood || '';
              const city = addr.city || addr.town || addr.county || formData.city;
              const state = addr.state || formData.state;

              let clean = '';
              if (street && street !== area) {
                clean = `${street}, ${area ? area + ', ' : ''}${city}, ${state}`;
              } else {
                clean = data.display_name;
              }

              setFormData(prev => ({
                ...prev,
                address: clean,
                city: city || prev.city,
                state: state || prev.state
              }));
              setLocationStatusMsg('✓ Live GPS location and street address detected!');
              setStepErrors(prev => ({ ...prev, address: '' }));
              setIsDetectingLocation(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Reverse geocode fetch failed:', err);
        }

        // Graceful fallback if reverse geocoding is slow or unavailable
        setFormData(prev => ({
          ...prev,
          address: `Location at ${prev.city || prev.state}, Nigeria (GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
        }));
        setLocationStatusMsg('✓ Live GPS coordinates recorded!');
        setStepErrors(prev => ({ ...prev, address: '' }));
        setIsDetectingLocation(false);
      },
      (err) => {
        setIsDetectingLocation(false);
        setLocationStatusMsg('Could not get device location. Please type address or use "Select from Map".');
        console.warn('Geolocation error:', err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Callback when location is confirmed in the Map Location Picker Modal
  const handleMapLocationSelect = (address, lat, lng) => {
    setFormData(prev => ({
      ...prev,
      address: address,
      latitude: lat,
      longitude: lng
    }));
    setLocationStatusMsg('✓ Address and coordinates selected from map!');
    setStepErrors(prev => ({ ...prev, address: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB'
      });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setSubmitError('');

    const hostId = currentUser?.id || Date.now();
    const hostName = currentUser?.name || 'Verified Host';
    const hostBusiness = currentUser?.business_name || '';
    const hostEmail = currentUser?.email || '';

    const newProperty = {
      id: Date.now(),
      host_id: hostId,
      host_email: hostEmail,
      host_name: hostName,
      business_name: hostBusiness,
      name: formData.name.trim() || 'New Verified Stays Lodge',
      slug: (formData.name || 'new-stay').toLowerCase().replace(/\s+/g, '-'),
      property_type: formData.property_type,
      category: 'New Listing',
      city: formData.city.trim(),
      state: formData.state,
      neighborhood: formData.city + ' Central',
      address: formData.address.trim() || 'Central Road, ' + formData.city,
      description: `Newly listed accommodation in ${formData.city}, ${formData.state}. Features 24/7 power backup and verified security.`,
      verification_status: 'documents_verified',
      verification_tier: 'tier_1_docs',
      is_published: true,
      latitude: parseFloat(formData.latitude) || 10.3158,
      longitude: parseFloat(formData.longitude) || 9.8442,
      contact_phone: formData.contact_phone || '+2348021112233',
      starting_price_kobo: parseInt(formData.base_price_ngn || 45000, 10) * 100,
      starting_price_formatted: `₦${parseInt(formData.base_price_ngn || 45000, 10).toLocaleString()}`,
      rating: 5.0,
      review_count: 1,
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: formData.amenities,
      host: {
        id: hostId,
        name: hostName,
        business_name: hostBusiness,
        email: hostEmail,
        role: 'Verified Host',
        joined: '2026',
        response_rate: '100%'
      },
      rooms: [
        {
          id: Date.now() + 1,
          name: formData.room_name || 'Executive Room',
          price_kobo: parseInt(formData.base_price_ngn || 45000, 10) * 100,
          price_formatted: `₦${parseInt(formData.base_price_ngn || 45000, 10).toLocaleString()}`,
          max_occupancy: parseInt(formData.max_occupancy, 10) || 2,
          bed_type: formData.bed_type || 'King Bed'
        }
      ]
    };

    try {
      if (onPropertyCreated) {
        await onPropertyCreated(newProperty);
      }
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err) {
      console.error('Failed to submit listing:', err);
      setSubmitError('Failed to save property listing. Please check connection and try again.');
      setIsSubmitting(false);
    }
  };

  const amenityList = [
    "24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Armed Security", "Free Breakfast", "Swimming Pool", "CCTV Security"
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">

          {/* Wizard Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-tafiya-blue" />
              <span className="text-sm font-extrabold text-slate-900">List Your Property on FindDestination</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Indicator Bar */}
          {!isSuccess && (
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Step {currentStep} of 5</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`h-2 rounded-full transition-all ${
                      s === currentStep ? 'w-6 bg-tafiya-blue' : s < currentStep ? 'w-2 bg-tafiya-blue-500/50' : 'w-2 bg-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-tafiya-orange font-extrabold">
                {currentStep === 1 && 'Basic Details'}
                {currentStep === 2 && 'Full Address'}
                {currentStep === 3 && 'Room Rates'}
                {currentStep === 4 && 'Utilities Audit'}
                {currentStep === 5 && 'Tier 1 CAC Docs'}
              </span>
            </div>
          )}

          {/* Wizard Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">

            {/* SUCCESS SCREEN */}
            {isSuccess ? (
              <div className="py-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
                <div className="w-18 h-18 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-lg font-black text-slate-900">Property Listed Successfully!</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-900">{formData.name}</strong> has been created and published under your host portfolio (<span className="font-semibold text-tafiya-blue">{currentUser?.business_name || currentUser?.name}</span>).
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Your listing is now active in your Host Dashboard with Tier 1 document clearance.
                  </p>
                </div>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    View in My Host Dashboard →
                  </button>
                </div>
              </div>
            ) : (
              <>
                {submitError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* STEP 1: Basic Property Details */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-sm font-extrabold text-slate-900">1. Basic Property Information</h3>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Property / Hotel Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Yankari Luxury Suites & Resort"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (stepErrors.name) setStepErrors(prev => ({ ...prev, name: '' }));
                        }}
                        className={`w-full px-4 py-2.5 text-xs border rounded-xl font-semibold focus:outline-none focus:ring-2 ${
                          stepErrors.name ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-tafiya-blue bg-white'
                        }`}
                      />
                      {stepErrors.name && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{stepErrors.name}</span>
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Property Type</label>
                        <select
                          value={formData.property_type}
                          onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                          className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-white font-semibold cursor-pointer"
                        >
                          <option value="hotel">Hotel</option>
                          <option value="serviced_apartment">Serviced Apartment</option>
                          <option value="guest_house">Guest House / Lodge</option>
                          <option value="resort">Resort & Nature</option>
                          <option value="boutique">Boutique Hotel</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">State Location</label>
                        <select
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value, city: e.target.value })}
                          className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-white font-semibold cursor-pointer"
                        >
                          <option value="Bauchi">Bauchi</option>
                          <option value="Kaduna">Kaduna</option>
                          <option value="Kano">Kano</option>
                          <option value="Plateau">Plateau (Jos)</option>
                          <option value="Adamawa">Adamawa (Yola)</option>
                          <option value="Gombe">Gombe</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          City / Town <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Bauchi, Kano Central"
                          value={formData.city}
                          onChange={(e) => {
                            setFormData({ ...formData, city: e.target.value });
                            if (stepErrors.city) setStepErrors(prev => ({ ...prev, city: '' }));
                          }}
                          className={`w-full px-3 py-2.5 text-xs border rounded-xl font-semibold focus:outline-none focus:ring-2 ${
                            stepErrors.city ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-tafiya-blue bg-white'
                          }`}
                        />
                        {stepErrors.city && (
                          <p className="text-[11px] text-rose-600 font-semibold mt-1">{stepErrors.city}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                      <input
                        type="text"
                        placeholder="+234 803 100 2000"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl font-semibold bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: Physical Full Address (With Textarea, Live Location, and Map Selector) */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-tafiya-blue" />
                          <span>2. Physical Property Address</span>
                        </h3>
                        <p className="text-xs text-slate-500">Provide the complete physical address or pick directly from the map.</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleGetLiveLocation}
                          disabled={isDetectingLocation}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                          title="Get current device GPS location"
                        >
                          <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                          <span>{isDetectingLocation ? 'Detecting...' : 'Get Live Location'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsMapPickerOpen(true)}
                          className="px-3 py-1.5 rounded-xl bg-tafiya-blue/10 hover:bg-tafiya-blue text-tafiya-blue hover:text-white text-[11px] font-bold border border-tafiya-blue/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow"
                          title="Open map to drop a pin and select exact property address"
                        >
                          <Map className="w-3.5 h-3.5" />
                          <span>Select from Map</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Full Street Address <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Enter the complete physical address (e.g. Plot 14 Safari Way, Off Central Expressway, Near Central Mosque, Bayan Gari, Bauchi)"
                        value={formData.address}
                        onChange={(e) => {
                          setFormData({ ...formData, address: e.target.value });
                          if (stepErrors.address) setStepErrors(prev => ({ ...prev, address: '' }));
                        }}
                        className={`w-full p-3.5 text-xs border rounded-2xl font-medium focus:outline-none focus:ring-2 transition-all leading-relaxed ${
                          stepErrors.address ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-tafiya-blue bg-white'
                        }`}
                      />
                      {stepErrors.address && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{stepErrors.address}</span>
                        </p>
                      )}
                      {locationStatusMsg && (
                        <p className="text-[11px] text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{locationStatusMsg}</span>
                        </p>
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-slate-600">
                      <ShieldCheck className="w-4 h-4 text-tafiya-blue shrink-0" />
                      <span className="text-[11px]">
                        Field verification agents will physically inspect this accommodation address before granting the Tier 3 Trust Badge.
                      </span>
                    </div>
                  </div>
                )}

                {/* STEP 3: Room Tiers & Base Nightly Rates */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-sm font-extrabold text-slate-900">3. Room Tier & Base Nightly Pricing</h3>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Room Tier Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Executive Royal Suite"
                        value={formData.room_name}
                        onChange={(e) => {
                          setFormData({ ...formData, room_name: e.target.value });
                          if (stepErrors.room_name) setStepErrors(prev => ({ ...prev, room_name: '' }));
                        }}
                        className={`w-full px-4 py-2.5 text-xs border rounded-xl font-semibold focus:outline-none focus:ring-2 ${
                          stepErrors.room_name ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-tafiya-blue bg-white'
                        }`}
                      />
                      {stepErrors.room_name && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1">{stepErrors.room_name}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Base Price per Night (₦) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          placeholder="45000"
                          value={formData.base_price_ngn}
                          onChange={(e) => {
                            setFormData({ ...formData, base_price_ngn: e.target.value });
                            if (stepErrors.base_price_ngn) setStepErrors(prev => ({ ...prev, base_price_ngn: '' }));
                          }}
                          className={`w-full px-4 py-2.5 text-xs border rounded-xl font-bold text-tafiya-blue focus:outline-none focus:ring-2 ${
                            stepErrors.base_price_ngn ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-tafiya-blue bg-white'
                          }`}
                        />
                        {stepErrors.base_price_ngn && (
                          <p className="text-[11px] text-rose-600 font-semibold mt-1">{stepErrors.base_price_ngn}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Total Available Units</label>
                        <input
                          type="number"
                          value={formData.total_units}
                          onChange={(e) => setFormData({ ...formData, total_units: e.target.value })}
                          className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl font-semibold bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Verified Utilities Audit */}
                {currentStep === 4 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-tafiya-orange" />
                      <span>4. Verified Utilities & Infrastructure Audit</span>
                    </h3>
                    <p className="text-xs text-slate-500">Check all infrastructure facilities available on-site for Field Agent audit.</p>

                    <div className="grid grid-cols-2 gap-3">
                      {amenityList.map((amenity) => {
                        const isChecked = formData.amenities.includes(amenity);
                        return (
                          <label
                            key={amenity}
                            className={`flex items-center gap-3 p-3 border rounded-2xl cursor-pointer text-xs font-semibold transition-all ${
                              isChecked ? 'border-tafiya-blue bg-tafiya-blue-50/40 text-tafiya-blue' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleAmenityToggle(amenity)}
                              className="w-4 h-4 rounded border-slate-300 text-tafiya-blue cursor-pointer"
                            />
                            <span>{amenity}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 5: Tier 1 Document Upload */}
                {currentStep === 5 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-tafiya-blue" />
                      <span>5. Tier 1 CAC & Tax Verification Documents</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">CAC Registration No.</label>
                        <input
                          type="text"
                          value={formData.cac_number}
                          onChange={(e) => setFormData({ ...formData, cac_number: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Tax ID (TIN)</label>
                        <input
                          type="text"
                          value={formData.tin_number}
                          onChange={(e) => setFormData({ ...formData, tin_number: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono bg-white"
                        />
                      </div>
                    </div>

                    {/* Upload Dropzone */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-2 hover:border-tafiya-blue transition-colors bg-slate-50/50 cursor-pointer"
                    >
                      {uploadedFile ? (
                        <div className="space-y-1">
                          <FileCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                          <span className="text-xs font-bold text-slate-900 block">{uploadedFile.name}</span>
                          <span className="text-[10px] text-emerald-600 font-semibold block">✓ Attached ({uploadedFile.size})</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-tafiya-blue mx-auto" />
                          <span className="text-xs font-bold text-slate-800 block">Upload CAC Certificate or Business Permit</span>
                          <span className="text-[10px] text-slate-400 block">Click to browse PDF, PNG, JPEG up to 10MB</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

          {/* Footer Controls */}
          {!isSuccess && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1 || isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-tafiya-blue text-white rounded-full text-xs font-bold shadow-md hover:bg-tafiya-blue-600 transition-colors cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-8 py-2.5 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 hover:from-tafiya-blue-600 hover:to-tafiya-blue-700 text-white rounded-full text-xs font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Listing Property...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-tafiya-gold" />
                      <span>Submit for Tier 1 Clearance</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Map Location Picker Modal */}
      <MapLocationPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        initialAddress={formData.address}
        initialLat={formData.latitude}
        initialLng={formData.longitude}
        initialCity={formData.city}
        initialState={formData.state}
        onSelectLocation={handleMapLocationSelect}
      />
    </>
  );
}
