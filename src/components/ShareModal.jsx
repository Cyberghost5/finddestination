import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  MessageCircle, 
  Twitter, 
  Facebook, 
  QrCode,
  Building2,
  MapPin,
  Sparkles
} from 'lucide-react';

export default function ShareModal({ isOpen, onClose, property }) {
  if (!isOpen || !property) return null;

  const [isCopied, setIsCopied] = useState(false);

  const shareUrl = `${window.location.origin}/?stay=${property.id}`;
  const shareTitle = `Check out ${property.name} on FindDestination!`;
  const shareSummary = `Verified stay in ${property.city}, ${property.state}. ${property.starting_price_formatted} per night on FindDestination.com.ng`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${shareTitle}\n${shareSummary}\n\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`${shareTitle} ${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-tafiya-blue-50 border border-tafiya-blue-100 p-1 flex items-center justify-center text-tafiya-blue">
              <Share2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-sm font-extrabold text-slate-900">Share This Verified Stay</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Property Card Mini Preview */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <img 
              src={property.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'} 
              alt={property.name} 
              className="w-14 h-14 rounded-xl object-cover shrink-0"
            />
            <div className="space-y-0.5 overflow-hidden">
              <h4 className="text-xs font-bold text-slate-900 truncate">{property.name}</h4>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-tafiya-blue" />
                <span className="truncate">{property.city}, {property.state}</span>
              </p>
              <p className="text-xs font-extrabold text-tafiya-blue">{property.starting_price_formatted} <span className="text-[10px] text-slate-400 font-normal">/ night</span></p>
            </div>
          </div>

          {/* Direct Link Copy Box */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">Property Direct Link</label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={shareUrl} 
                className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isCopied
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-tafiya-blue hover:bg-tafiya-blue-600 text-white shadow-md'
                }`}
              >
                {isCopied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* One-Click Social Share Buttons */}
          <div className="space-y-2">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">Share to Social Networks</label>
            <div className="grid grid-cols-3 gap-2">
              
              {/* WhatsApp */}
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-2 p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                <span>WhatsApp</span>
              </button>

              {/* Twitter / X */}
              <button
                onClick={handleTwitterShare}
                className="flex items-center justify-center gap-2 p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Twitter className="w-4 h-4 fill-white" />
                <span>Twitter / X</span>
              </button>

              {/* Facebook */}
              <button
                onClick={handleFacebookShare}
                className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <Facebook className="w-4 h-4 fill-blue-600 text-blue-600" />
                <span>Facebook</span>
              </button>

            </div>
          </div>

          {/* QR Code Scan Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4">
            <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 rounded-xl border border-white shadow-sm shrink-0" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 block flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-tafiya-blue" /> Scan QR Code
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Scan with any smartphone camera to open this verified stay immediately.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
