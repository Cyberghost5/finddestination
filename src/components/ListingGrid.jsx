import React, { useState } from 'react';
import ListingCard from './ListingCard';
import MapView from './MapView';
import { Map, ListFilter, Building2, SlidersHorizontal, ShieldCheck } from 'lucide-react';

export default function ListingGrid({ properties, onSelectProperty, onOpenFilterModal }) {
  const [showMap, setShowMap] = useState(false);
  const [includeTaxes, setIncludeTaxes] = useState(false);

  return (
    <div className="space-y-6">
      
      {/* Search Header Bar & Tax Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-sm font-extrabold text-slate-900">
            {properties.length} {properties.length === 1 ? 'Stay' : 'Verified Stays'} Available
          </span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Northern Nigeria Regional Inventory
          </span>
        </div>

        {/* Display Total Before Taxes Toggle */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 shadow-sm">
          <span>Display total before taxes</span>
          <button
            onClick={() => setIncludeTaxes(!includeTaxes)}
            className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
              includeTaxes ? 'bg-tafiya-blue' : 'bg-slate-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-md ${
              includeTaxes ? 'right-1' : 'left-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Grid or Empty State */}
      {properties.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-4 max-w-md mx-auto my-12">
          <div className="w-12 h-12 rounded-full bg-tafiya-orange-50 text-tafiya-orange flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">No properties match your filters</h3>
          <p className="text-xs text-slate-500">Try adjusting your verification tier or property type filters.</p>
          <button
            onClick={onOpenFilterModal}
            className="px-6 py-2.5 bg-tafiya-blue text-white font-bold text-xs rounded-full shadow-md hover:bg-tafiya-blue-600 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : showMap ? (
        /* Real Leaflet OpenStreetMap Container */
        <div className="relative w-full h-[650px] rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900 animate-in fade-in duration-300">
          <MapView 
            properties={properties} 
            onSelectProperty={onSelectProperty} 
          />
        </div>
      ) : (
        /* Standard Airbnb Listing Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {properties.map((property) => (
            <ListingCard
              key={property.id}
              property={property}
              onSelectProperty={onSelectProperty}
            />
          ))}
        </div>
      )}

      {/* Floating Map / List Toggle Button (Airbnb Concept) */}
      <div className="fixed bottom-16 md:bottom-8 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-black text-white rounded-full font-bold text-xs shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer border border-slate-800"
        >
          {showMap ? (
            <>
              <ListFilter className="w-4 h-4 text-tafiya-orange" />
              <span>Show List</span>
            </>
          ) : (
            <>
              <Map className="w-4 h-4 text-tafiya-blue" />
              <span>Show Map</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
