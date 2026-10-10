import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Search, Check, Navigation, Loader2 } from 'lucide-react';

export default function MapLocationPickerModal({
  isOpen,
  onClose,
  initialAddress = '',
  initialLat = '10.3158',
  initialLng = '9.8442',
  initialCity = 'Bauchi',
  initialState = 'Bauchi',
  onSelectLocation
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [selectedCoords, setSelectedCoords] = useState({
    lat: parseFloat(initialLat) || 10.3158,
    lng: parseFloat(initialLng) || 9.8442
  });
  const [resolvedAddress, setResolvedAddress] = useState(initialAddress || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingNote, setGeocodingNote] = useState('');

  // Fallback state centers in Northern Nigeria
  const stateCoordinates = {
    Bauchi: [10.3158, 9.8442],
    Kaduna: [10.5105, 7.4165],
    Kano: [12.0022, 8.5919],
    Plateau: [9.8965, 8.8583],
    Adamawa: [9.2003, 12.4954],
    Gombe: [10.2897, 11.1673],
  };

  useEffect(() => {
    if (!isOpen) return;

    // Load Leaflet CSS if not already present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Determine initial center
    let centerLat = parseFloat(initialLat) || 10.3158;
    let centerLng = parseFloat(initialLng) || 9.8442;
    if (initialState && stateCoordinates[initialState]) {
      centerLat = stateCoordinates[initialState][0];
      centerLng = stateCoordinates[initialState][1];
    }

    setSelectedCoords({ lat: centerLat, lng: centerLng });

    const initLeafletMap = () => {
      if (!window.L || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const L = window.L;
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | FindDestination GPS Engine',
        maxZoom: 19,
      }).addTo(map);

      // Create custom marker icon
      const customPinIcon = L.divIcon({
        className: 'custom-map-picker-pin',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: #0066FF;
            color: #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid #ffffff;
          ">
            <div style="
              width: 10px;
              height: 10px;
              background: #ffffff;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([centerLat, centerLng], {
        icon: customPinIcon,
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;

      // Handle marker drag
      marker.on('dragend', (e) => {
        const position = e.target.getLatLng();
        updateSelectedLocation(position.lat, position.lng);
      });

      // Handle map click
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        updateSelectedLocation(lat, lng);
      });

      // If initial address is empty, resolve initial coordinates
      if (!initialAddress) {
        updateSelectedLocation(centerLat, centerLng);
      }
    };

    // Load Leaflet Script if not present
    if (!window.L) {
      if (!document.getElementById('leaflet-script')) {
        const script = document.createElement('script');
        script.id = 'leaflet-script';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => setTimeout(initLeafletMap, 100);
        document.body.appendChild(script);
      } else {
        const checkL = setInterval(() => {
          if (window.L) {
            clearInterval(checkL);
            initLeafletMap();
          }
        }, 100);
      }
    } else {
      setTimeout(initLeafletMap, 50);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  const updateSelectedLocation = async (lat, lng) => {
    setSelectedCoords({ lat, lng });
    setIsGeocoding(true);
    setGeocodingNote('Resolving address from map coordinates...');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          // Format clean street / area address
          const addr = data.address || {};
          const street = addr.road || addr.street || addr.suburb || addr.neighbourhood || '';
          const area = addr.suburb || addr.city_district || addr.neighbourhood || '';
          const city = addr.city || addr.town || addr.county || initialCity;
          const state = addr.state || initialState;

          let cleanAddress = '';
          if (street && street !== area) {
            cleanAddress = `${street}, ${area ? area + ', ' : ''}${city}, ${state}`;
          } else {
            cleanAddress = data.display_name;
          }

          setResolvedAddress(cleanAddress);
          setGeocodingNote('');
          return;
        }
      }
    } catch (e) {
      console.warn('Reverse geocode error:', e);
    } finally {
      setIsGeocoding(false);
    }

    // Graceful fallback
    setResolvedAddress(`Location at ${initialCity || initialState}, Nigeria (GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    setGeocodingNote('');
  };

  const handleSearchLocation = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    try {
      const fullQuery = query.toLowerCase().includes('nigeria') ? query : `${query}, ${initialState || 'Nigeria'}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=1`
      );
      if (response.ok) {
        const results = await response.json();
        if (results && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lng = parseFloat(results[0].lon);

          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lng], 16);
            markerRef.current.setLatLng([lat, lng]);
          }

          updateSelectedLocation(lat, lng);
        } else {
          setGeocodingNote(`No matches found for "${query}". Try clicking directly on the map.`);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    if (onSelectLocation) {
      onSelectLocation(
        resolvedAddress || `Property Location, ${initialCity || initialState}`,
        selectedCoords.lat.toFixed(6),
        selectedCoords.lng.toFixed(6)
      );
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-tafiya-blue flex items-center justify-center text-white">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Select Property Location on Map</h3>
              <p className="text-[11px] text-slate-400">Click anywhere on the map or drag the pin to set your accommodation address</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleSearchLocation} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search town, landmark, street, or LGA (e.g. Bayan Gari, Barnawa GRA, Nasarawa)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-tafiya-blue font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Find</span>
            </button>
          </form>
        </div>

        {/* Map Container */}
        <div className="relative flex-1 min-h-[320px] max-h-[380px] bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full min-h-[320px]" />
          <div className="absolute top-3 left-3 z-1000 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-[11px] font-bold text-slate-700 flex items-center gap-1.5 pointer-events-none">
            <Navigation className="w-3 h-3 text-tafiya-blue" />
            <span>Click map or drag the pin</span>
          </div>
        </div>

        {/* Selected Address Display & Confirmation */}
        <div className="p-4 bg-white border-t border-slate-100 space-y-3">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
              <span>Selected Physical Address</span>
              {isGeocoding && (
                <span className="text-tafiya-blue flex items-center gap-1 font-semibold">
                  <Loader2 className="w-3 h-3 animate-spin" /> Resolving...
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-900 leading-relaxed">
              {resolvedAddress || 'Click anywhere on the map to select address'}
            </p>
            {geocodingNote && (
              <p className="text-[10px] text-slate-400 mt-1">{geocodingNote}</p>
            )}
            <div className="mt-1 pt-1 border-t border-slate-200/60 flex items-center gap-3 text-[10px] font-mono text-slate-400">
              <span>Lat: {selectedCoords.lat.toFixed(6)}</span>
              <span>Lng: {selectedCoords.lng.toFixed(6)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 bg-tafiya-blue hover:bg-tafiya-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-tafiya-blue/20 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Use This Address</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
