import React, { useState } from 'react';
import { X, ShieldCheck, Check, SlidersHorizontal, CheckCircle2 } from 'lucide-react';

export default function FilterModal({ isOpen, onClose, filters, onApplyFilters, onResetFilters }) {
  const [localFilters, setLocalFilters] = useState(filters);

  if (!isOpen) return null;

  const handleTierSelect = (tier) => {
    setLocalFilters(prev => ({ ...prev, tier }));
  };

  const handlePropertyTypeToggle = (type) => {
    setLocalFilters(prev => {
      const current = prev.propertyTypes || [];
      const updated = current.includes(type)
        ? current.filter(t => t !== type)
        : [...current, type];
      return { ...prev, propertyTypes: updated };
    });
  };

  const handleAmenityToggle = (amenity) => {
    setLocalFilters(prev => {
      const current = prev.amenities || [];
      const updated = current.includes(amenity)
        ? current.filter(a => a !== amenity)
        : [...current, amenity];
      return { ...prev, amenities: updated };
    });
  };

  const handleSave = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const propertyTypeOptions = [
    { id: 'hotel', label: 'Hotel' },
    { id: 'serviced_apartment', label: 'Serviced Apartment' },
    { id: 'guest_house', label: 'Guest House / Lodge' },
    { id: 'resort', label: 'Resort & Nature' },
    { id: 'boutique', label: 'Boutique Hotel' }
  ];

  const amenityOptions = [
    "24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Armed Security", "Free Breakfast", "Swimming Pool", "CCTV Security"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-sm font-extrabold text-slate-900">Filters</span>
          <div className="w-8"></div>
        </div>

        {/* Scrollable Filter Body */}
        <div className="p-6 space-y-8 overflow-y-auto flex-1">
          
          {/* Verification Tier Section */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-tafiya-blue" />
              <span>Anti-Fraud Property Verification Tier</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">Filter properties by verified physical and document status.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleTierSelect('all')}
                className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                  localFilters.tier === 'all'
                    ? 'border-tafiya-blue bg-tafiya-blue-50/50 font-bold text-tafiya-blue ring-2 ring-tafiya-blue/20'
                    : 'border-slate-200 hover:border-slate-300 font-medium text-slate-700'
                }`}
              >
                All Verification Tiers
              </button>

              <button
                onClick={() => handleTierSelect('tier_2_location')}
                className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                  localFilters.tier === 'tier_2_location'
                    ? 'border-tafiya-blue bg-tafiya-blue-50/50 font-bold text-tafiya-blue ring-2 ring-tafiya-blue/20'
                    : 'border-slate-200 hover:border-slate-300 font-medium text-slate-700'
                }`}
              >
                <div className="font-bold text-slate-900">Tier 2 Location</div>
                <div className="text-[10px] text-slate-500 mt-0.5">GPS & On-site Audit</div>
              </button>

              <button
                onClick={() => handleTierSelect('tier_3_certified')}
                className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                  localFilters.tier === 'tier_3_certified'
                    ? 'border-emerald-600 bg-emerald-50/60 font-bold text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 font-medium text-slate-700'
                }`}
              >
                <div className="font-bold text-emerald-950 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                  <span>Tier 3 Verified</span>
                </div>
                <div className="text-[10px] text-emerald-800 mt-0.5">Full Platform Clearance</div>
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-slate-100"></div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 mb-1">Nightly Price Range</h3>
            <p className="text-xs text-slate-500 mb-4">Nightly room rates including escrow platform protection.</p>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 p-3 border border-slate-200 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Minimum</span>
                <span className="text-xs font-bold text-slate-900">₦10,000</span>
              </div>
              <span className="text-slate-300 font-bold">-</span>
              <div className="flex-1 p-3 border border-slate-200 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Maximum</span>
                <span className="text-xs font-bold text-slate-900">₦150,000+</span>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-100"></div>

          {/* Property Types */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 mb-3">Property Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {propertyTypeOptions.map((type) => {
                const isSelected = (localFilters.propertyTypes || []).includes(type.id);
                return (
                  <label
                    key={type.id}
                    className={`flex items-center gap-3 p-3 border rounded-2xl cursor-pointer transition-all ${
                      isSelected ? 'border-tafiya-blue bg-tafiya-blue-50/40 text-tafiya-blue font-bold' : 'border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handlePropertyTypeToggle(type.id)}
                      className="w-4 h-4 rounded border-slate-300 text-tafiya-blue focus:ring-tafiya-blue"
                    />
                    <span className="text-xs">{type.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="h-[1px] bg-slate-100"></div>

          {/* Amenities */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 mb-3">Verified Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {amenityOptions.map((amenity) => {
                const isSelected = (localFilters.amenities || []).includes(amenity);
                return (
                  <label
                    key={amenity}
                    className="flex items-center gap-3 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="w-4 h-4 rounded border-slate-300 text-tafiya-blue focus:ring-tafiya-blue"
                    />
                    <span>{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={() => {
              onResetFilters();
              onClose();
            }}
            className="text-xs font-bold text-slate-600 underline hover:text-slate-900"
          >
            Clear all
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 text-white rounded-full font-bold text-xs shadow-md hover:shadow-lg transition-transform active:scale-95"
          >
            Show Properties
          </button>
        </div>

      </div>
    </div>
  );
}
