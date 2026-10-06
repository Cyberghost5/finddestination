import React from 'react';
import { 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  MapPin, 
  Printer, 
  Download,
  QrCode,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function VoucherModal({ isOpen, onClose, booking }) {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-tafiya-blue to-tafiya-blue-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-tafiya-gold">Booking Confirmed</span>
          </div>

          <h2 className="text-xl font-black">Official Trip Voucher</h2>
          <p className="text-xs text-slate-200 mt-1">Present this digital voucher upon check-in at property.</p>
        </div>

        {/* Voucher Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-white">
          
          {/* Reference Badge */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Booking Reference</span>
              <span className="text-base font-black text-tafiya-blue font-mono">{booking.reference}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Status</span>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Lock className="w-3 h-3" /> Escrow Held
              </span>
            </div>
          </div>

          {/* Property Info */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Accommodation Details</h3>
            <div className="flex items-start gap-4 p-4 border border-slate-200 rounded-2xl">
              <img 
                src={booking.property.images[0]} 
                alt={booking.property.name} 
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">{booking.property.name}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-tafiya-blue" />
                  <span>{booking.property.address}, {booking.property.city}</span>
                </p>
                <p className="text-xs font-semibold text-slate-700">{booking.room.name}</p>
              </div>
            </div>
          </div>

          {/* Guest & Stay Schedule */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block">Lead Guest</span>
              <span className="font-bold text-slate-800">{booking.guestName}</span>
              <span className="text-[11px] text-slate-500 block">{booking.guestPhone}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block">Duration</span>
              <span className="font-bold text-slate-800">{booking.nights} Nights</span>
              <span className="text-[11px] text-slate-500 block">Check-in: 14:00</span>
            </div>
          </div>

          {/* QR Code & Settlement Info */}
          <div className="flex items-center justify-between p-4 bg-tafiya-blue-50/50 border border-tafiya-blue-100 rounded-2xl">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 block">Check-in Security QR</span>
              <p className="text-[11px] text-slate-600">Scan at hotel reception to validate arrival and unlock host payout.</p>
            </div>
            <div className="w-14 h-14 bg-white p-1 rounded-xl border border-slate-200 flex items-center justify-center shrink-0">
              <QrCode className="w-10 h-10 text-slate-900" />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Voucher</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-tafiya-blue text-white rounded-full font-bold text-xs shadow-md hover:bg-tafiya-blue-600 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
