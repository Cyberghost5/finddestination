import React, { useState } from 'react';
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
  Navigation
} from 'lucide-react';

export default function ListingWizard({ isOpen, onClose, onPropertyCreated }) {
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    property_type: 'hotel',
    state: 'Bauchi',
    city: 'Bauchi',
    address: '',
    latitude: '10.3158',
    longitude: '9.8442',
    contact_phone: '+234 803 100 2000',
    room_name: 'Executive Suite',
    base_price_ngn: '45000',
    total_units: '4',
    max_occupancy: '2',
    bed_type: 'King Bed',
    amenities: ['24/7 Power', 'Constant Water', 'Air Conditioning', 'WiFi', 'Armed Security'],
    cac_number: 'RC-1928401',
    tin_number: 'TIN-9920194',
    owner_nin: '39201948201'
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProperty = {
      id: Date.now(),
      name: formData.name || 'New Verified Stays Lodge',
      slug: (formData.name || 'new-stay').toLowerCase().replace(/\s+/g, '-'),
      property_type: formData.property_type,
      category: 'New Listing',
      city: formData.city,
      state: formData.state,
      neighborhood: 'Central District',
      address: formData.address || 'Central Road, ' + formData.city,
      description: 'Newly listed accommodation in ' + formData.city + '. Features 24/7 power backup and verified security.',
      verification_status: 'documents_verified', // Tier 1 Docs Verified upon submission
      verification_tier: 'tier_1_docs',
      is_published: true,
      starting_price_kobo: parseInt(formData.base_price_ngn || 45000) * 100,
      starting_price_formatted: `₦${parseInt(formData.base_price_ngn || 45000).toLocaleString()}`,
      rating: 5.0,
      review_count: 1,
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: formData.amenities,
      host: {
        name: 'Alhaji Ibrahim Bello',
        role: 'Verified Host',
        joined: '2026',
        response_rate: '100%'
      },
      rooms: [
        {
          id: Date.now() + 1,
          name: formData.room_name || 'Executive Room',
          price_kobo: parseInt(formData.base_price_ngn || 45000) * 100,
          price_formatted: `₦${parseInt(formData.base_price_ngn || 45000).toLocaleString()}`,
          max_occupancy: parseInt(formData.max_occupancy),
          bed_type: formData.bed_type
        }
      ]
    };

    onPropertyCreated(newProperty);
    onClose();
  };

  const amenityList = [
    "24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Armed Security", "Free Breakfast", "Swimming Pool", "CCTV Security"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Wizard Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-tafiya-blue" />
            <span className="text-sm font-extrabold text-slate-900">List Your Property on Tafiya</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Indicator Bar */}
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
          <span className="text-tafiya-orange">
            {currentStep === 1 && 'Basic Details'}
            {currentStep === 2 && 'Location & GPS'}
            {currentStep === 3 && 'Room Rates'}
            {currentStep === 4 && 'Utilities Audit'}
            {currentStep === 5 && 'Tier 1 CAC Docs'}
          </span>
        </div>

        {/* Wizard Step Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* STEP 1: Basic Property Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">1. Basic Property Information</h3>
              
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Property / Hotel Name</label>
                <input
                  type="text"
                  placeholder="e.g. Yankari Luxury Suites & Resort"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tafiya-blue font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Property Type</label>
                  <select
                    value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-white font-semibold"
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
                    className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-white font-semibold"
                  >
                    <option value="Bauchi">Bauchi</option>
                    <option value="Kaduna">Kaduna</option>
                    <option value="Kano">Kano</option>
                    <option value="Plateau">Plateau (Jos)</option>
                    <option value="Adamawa">Adamawa (Yola)</option>
                    <option value="Gombe">Gombe</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Physical Address & GPS Coordinates */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-tafiya-blue" />
                <span>2. Physical Address & GPS Coordinate Capture</span>
              </h3>
              <p className="text-xs text-slate-500">Tafiya Field Agents verify location within 50m of logged coordinates.</p>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. Plot 14 Safari Way, Off Expressway, Bauchi"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tafiya-blue font-semibold"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Device GPS Coordinate Logger</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> Live GPS Signal
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans uppercase font-bold block">Latitude</span>
                    <input 
                      type="text" 
                      value={formData.latitude} 
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans uppercase font-bold block">Longitude</span>
                    <input 
                      type="text" 
                      value={formData.longitude} 
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Room Tiers & Base Nightly Rates */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">3. Room Tier & Base Nightly Pricing</h3>
              
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Room Tier Name</label>
                <input
                  type="text"
                  placeholder="e.g. Executive Royal Suite"
                  value={formData.room_name}
                  onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Base Price per Night (₦)</label>
                  <input
                    type="number"
                    placeholder="45000"
                    value={formData.base_price_ngn}
                    onChange={(e) => setFormData({ ...formData, base_price_ngn: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl font-bold text-tafiya-blue"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Total Available Units</label>
                  <input
                    type="number"
                    value={formData.total_units}
                    onChange={(e) => setFormData({ ...formData, total_units: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Verified Utilities Audit */}
          {currentStep === 4 && (
            <div className="space-y-4">
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
                        isChecked ? 'border-tafiya-blue bg-tafiya-blue-50/40 text-tafiya-blue' : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="w-4 h-4 rounded border-slate-300 text-tafiya-blue"
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
            <div className="space-y-4">
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
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tax ID (TIN)</label>
                  <input
                    type="text"
                    value={formData.tin_number}
                    onChange={(e) => setFormData({ ...formData, tin_number: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-2 hover:border-tafiya-blue transition-colors bg-slate-50/50">
                <Upload className="w-8 h-8 text-tafiya-blue mx-auto" />
                <span className="text-xs font-bold text-slate-800 block">Upload CAC Certificate or Business Permit</span>
                <span className="text-[10px] text-slate-400 block">PDF, PNG, JPEG up to 10MB</span>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-tafiya-blue text-white rounded-full text-xs font-bold shadow-md hover:bg-tafiya-blue-600 transition-colors"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-8 py-2.5 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 text-white rounded-full text-xs font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-tafiya-gold" />
              <span>Submit for Tier 1 Clearance</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
