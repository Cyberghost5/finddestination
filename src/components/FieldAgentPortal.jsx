import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Droplets, 
  Camera, 
  FileText, 
  Clock, 
  Building2, 
  Check, 
  Upload,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function FieldAgentPortal({ properties, onCompleteLocationAudit }) {
  const [selectedProperty, setSelectedProperty] = useState(properties[0] || null);
  const [isAuditing, setIsAuditing] = useState(false);
  
  // Field Audit Form State
  const [gpsLatitude, setGpsLatitude] = useState('10.315842');
  const [gpsLongitude, setGpsLongitude] = useState('9.844192');
  const [auditNotes, setAuditNotes] = useState('Physical site inspection completed. Confirmed 24/7 solar backup system and perimeter security.');
  const [checks, setChecks] = useState({
    gpsWithin50m: true,
    solarPowerActive: true,
    constantWaterActive: true,
    armedSecurityPresent: true,
    photosUploaded: true
  });
  const [auditSubmitted, setAuditSubmitted] = useState(false);

  const handleAuditSubmit = (e) => {
    e.preventDefault();
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditSubmitted(true);
      if (selectedProperty) {
        onCompleteLocationAudit(selectedProperty.id, {
          latitude: gpsLatitude,
          longitude: gpsLongitude,
          notes: auditNotes
        });
      }
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      
      {/* Field Agent Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-tafiya-blue to-tafiya-orange flex items-center justify-center text-white font-extrabold text-xl shadow-md shrink-0">
            <Navigation className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">Usman Field Verification Agent</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-tafiya-blue text-white">
                Regional Inspector
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Northern Nigeria Field Audit & On-Site GPS Validation Queue</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700 text-xs font-bold text-slate-300">
          <MapPin className="w-4 h-4 text-tafiya-orange" />
          <span>Active Region: Bauchi & Kaduna</span>
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Inspection Queue */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900">Assigned Physical Audit Queue</h2>
          
          <div className="space-y-3">
            {properties.map((prop) => (
              <div
                key={prop.id}
                onClick={() => {
                  setSelectedProperty(prop);
                  setAuditSubmitted(false);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedProperty?.id === prop.id
                    ? 'border-tafiya-blue bg-tafiya-blue-50/50 ring-2 ring-tafiya-blue/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img 
                    src={prop.images[0]} 
                    alt={prop.name} 
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-xs line-clamp-1">{prop.name}</h3>
                    <p className="text-[11px] text-slate-500">{prop.address}, {prop.city}</p>
                    
                    {prop.verification_tier === 'tier_3_certified' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tier 3 Certified
                      </span>
                    ) : prop.verification_tier === 'tier_2_location' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-tafiya-blue bg-tafiya-blue-50 px-2 py-0.5 rounded-full">
                        <MapPin className="w-3 h-3" /> Tier 2 GPS Cleared
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> Pending On-Site Audit
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Field Agent Inspection Form */}
        <div className="lg:col-span-2">
          {selectedProperty ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-tafiya-orange uppercase tracking-wider block">PRD Section 6 • Tier 2 On-Site Inspection</span>
                  <h2 className="text-base font-extrabold text-slate-900">{selectedProperty.name}</h2>
                  <p className="text-xs text-slate-500">{selectedProperty.address}, {selectedProperty.city}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700 block">Host: {selectedProperty.host?.name}</span>
                  <span className="text-[11px] text-slate-400">{selectedProperty.contact_phone}</span>
                </div>
              </div>

              {auditSubmitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-extrabold text-emerald-950">Tier 2 Location Audit Submitted & Cleared!</h3>
                  <p className="text-xs text-emerald-800">
                    GPS coordinates logged within 50m radius. Property is now forwarded to Super Admin for Tier 3 certification badge.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAuditSubmit} className="space-y-6">
                  
                  {/* 1. Live Device GPS Capture */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-inner">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-tafiya-blue" />
                        <span>Field Agent Device GPS Coordinate Logger</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                        Accuracy: ± 2.4 meters
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                      <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Latitude</span>
                        <input 
                          type="text"
                          value={gpsLatitude}
                          onChange={(e) => setGpsLatitude(e.target.value)}
                          className="w-full bg-transparent text-tafiya-gold font-bold focus:outline-none"
                        />
                      </div>
                      <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Longitude</span>
                        <input 
                          type="text"
                          value={gpsLongitude}
                          onChange={(e) => setGpsLongitude(e.target.value)}
                          className="w-full bg-transparent text-tafiya-gold font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. On-Site Inspection Verification Checklist */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Physical Inspection Checklist</h3>
                    
                    <div className="space-y-2">
                      <label className="flex items-center justify-between p-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-tafiya-blue" />
                          <span>GPS Coordinates within 50m of registered address</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={checks.gpsWithin50m} 
                          onChange={(e) => setChecks({ ...checks, gpsWithin50m: e.target.checked })}
                          className="w-4 h-4 text-tafiya-blue rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-tafiya-orange" />
                          <span>24/7 Power & Solar Backup System functional</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={checks.solarPowerActive} 
                          onChange={(e) => setChecks({ ...checks, solarPowerActive: e.target.checked })}
                          className="w-4 h-4 text-tafiya-blue rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-tafiya-blue" />
                          <span>Constant Water Supply & Pumping System operational</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={checks.constantWaterActive} 
                          onChange={(e) => setChecks({ ...checks, constantWaterActive: e.target.checked })}
                          className="w-4 h-4 text-tafiya-blue rounded"
                        />
                      </label>
                    </div>
                  </div>

                  {/* 3. Field Audit Notes */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Field Agent Inspection Notes</label>
                    <textarea 
                      rows={3}
                      value={auditNotes}
                      onChange={(e) => setAuditNotes(e.target.value)}
                      className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tafiya-blue"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isAuditing}
                    className="w-full py-3.5 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 text-white rounded-2xl font-bold text-xs shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    {isAuditing ? 'Submitting GPS Field Audit...' : 'Submit Tier 2 Location Clearance'}
                  </button>

                </form>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
              Select a property from the left queue to begin physical location audit.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
