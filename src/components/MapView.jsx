import React, { useEffect, useRef } from 'react';
import { MapPin, ShieldCheck, Star } from 'lucide-react';

export default function MapView({ properties, onSelectProperty, singleProperty = null }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // 1. Dynamically load Leaflet CSS if not already present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Helper to initialize map once Leaflet script is loaded
    const initMap = () => {
      if (!window.L || !mapContainerRef.current) return;

      // Prevent re-initialization error
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const L = window.L;

      // Default center: Northern Nigeria [lat, lng]
      const centerLat = singleProperty ? (singleProperty.latitude || 10.3158) : 10.3158;
      const centerLng = singleProperty ? (singleProperty.longitude || 9.8442) : 9.2000;
      const zoomLevel = singleProperty ? 14 : 7;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: zoomLevel,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles with dark/modern styling option
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | FindDestination.com.ng GPS Engine',
        maxZoom: 19,
      }).addTo(map);

      const itemsToRender = singleProperty ? [singleProperty] : (properties || []);

      itemsToRender.forEach((prop) => {
        const lat = prop.latitude || (prop.id === 101 ? 10.3158 : prop.id === 102 ? 10.5105 : prop.id === 103 ? 12.0022 : 9.8965);
        const lng = prop.longitude || (prop.id === 101 ? 9.8442 : prop.id === 102 ? 7.4165 : prop.id === 103 ? 8.5919 : 8.8583);

        // Create Custom HTML Price Pin Icon
        const priceLabel = prop.starting_price_formatted ? prop.starting_price_formatted.replace(',000', 'k') : '₦35k';
        const customIcon = L.divIcon({
          className: 'tafiya-custom-map-pin',
          html: `
            <div style="
              background: linear-gradient(135deg, #0066FF 0%, #0044BB 100%);
              color: white;
              font-weight: 800;
              font-size: 11px;
              padding: 5px 10px;
              border-radius: 20px;
              box-shadow: 0 4px 12px rgba(0,102,255,0.4);
              border: 2px solid white;
              white-space: nowrap;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 4px;
              transition: transform 0.2s;
            ">
              <span style="width: 6px; height: 6px; background: #FF9900; border-radius: 50%; display: inline-block;"></span>
              ${priceLabel}
            </div>
          `,
          iconSize: [60, 30],
          iconAnchor: [30, 15]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        // Add verification radius circle for single property detail view
        if (singleProperty) {
          L.circle([lat, lng], {
            color: '#0066FF',
            fillColor: '#0066FF',
            fillOpacity: 0.15,
            radius: 300 // 300m radius
          }).addTo(map);
        }

        // Create popup card HTML
        const popupContent = document.createElement('div');
        popupContent.className = 'p-1 text-slate-900 font-sans';
        popupContent.style.minWidth = '200px';
        popupContent.innerHTML = `
          <div style="border-radius: 12px; overflow: hidden;">
            <img src="${prop.images ? prop.images[0] : ''}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 10px;" />
            <div style="padding: 8px 4px 4px 4px;">
              <div style="font-[800]; font-size: 12px; color: #0F172A; line-height: 1.2;">${prop.name}</div>
              <div style="font-size: 11px; color: #64748B; margin-top: 2px;">${prop.city}, ${prop.state || ''}</div>
              <div style="display: flex; justify-between; align-items: center; margin-top: 6px;">
                <span style="font-weight: 800; color: #0066FF; font-size: 12px;">${prop.starting_price_formatted} / night</span>
              </div>
            </div>
          </div>
        `;

        const viewBtn = document.createElement('button');
        viewBtn.innerText = 'View Stay Details';
        viewBtn.style.cssText = 'width: 100%; margin-top: 6px; padding: 6px; background: #0066FF; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 11px; cursor: pointer;';
        viewBtn.onclick = () => {
          if (onSelectProperty) onSelectProperty(prop);
        };
        popupContent.appendChild(viewBtn);

        marker.bindPopup(popupContent);
      });
    };

    // 2. Load Leaflet Script if not present
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [properties, singleProperty]);

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-3xl overflow-hidden border border-slate-200 shadow-md">
      <div ref={mapContainerRef} className="w-full h-full min-h-[450px] z-10" />
    </div>
  );
}
