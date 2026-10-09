import React, { useState } from 'react';
import {
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Building2
} from 'lucide-react';

export default function ListingCard({ property, onSelectProperty, isSaved, onToggleWishlist }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const images = property.images && property.images.length > 0 ? property.images : [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
  ];

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const renderVerificationBadge = () => {
    if (property.verification_tier === 'tier_3_certified') {
      return (
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-extrabold shadow-md border border-emerald-400/50">
          <CheckCircle2 className="w-3 h-3 fill-white text-emerald-600" />
          <span>FindDestination Verified</span>
        </div>
      );
    }
    if (property.verification_tier === 'tier_2_location') {
      return (
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tafiya-blue/90 backdrop-blur-md text-white text-[10px] font-extrabold shadow-md border border-tafiya-blue-400/50">
          <MapPin className="w-3 h-3" />
          <span>Location Verified</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold shadow-md">
        <ShieldCheck className="w-3 h-3 text-slate-300" />
        <span>Docs Verified</span>
      </div>
    );
  };

  const activeSaved = isSaved !== undefined ? isSaved : isLiked;

  return (
    <div
      onClick={() => onSelectProperty(property)}
      className="group cursor-pointer flex flex-col space-y-3 active:scale-[0.98] transition-all duration-200"
    >

      {/* Photo Carousel Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-sm border border-slate-200/50">

        <img
          src={images[currentImageIndex]}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Verification Badge Overlay */}
        <div className="absolute top-3 left-3 z-10">
          {renderVerificationBadge()}
        </div>

        {/* Wishlist Heart Icon Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleWishlist) {
              onToggleWishlist(property.id);
            } else {
              setIsLiked(!isLiked);
            }
          }}
          className="absolute top-3 right-3 z-10 p-2 rounded-full hover:scale-110 transition-transform cursor-pointer"
        >
          <Heart className={`w-5 h-5 drop-shadow-md transition-all ${activeSaved ? 'text-tafiya-orange fill-tafiya-orange scale-110' : 'text-white/90 fill-slate-900/30 stroke-[2]'
            }`} />
        </button>

        {/* Carousel Prev/Next Arrows (Show on Hover) */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Carousel Dots */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-4 bg-white shadow-sm' : 'w-1.5 bg-white/60'
                    }`}
                />
              ))}
            </div>
          </>
        )}

      </div>

      {/* Property Details */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-tafiya-blue transition-colors">
            {property.name}
          </h3>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-900 shrink-0">
            <Star className="w-3.5 h-3.5 text-tafiya-orange fill-tafiya-orange" />
            <span>{property.rating}</span>
          </div>
        </div>

        <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span>{property.neighborhood}, {property.city} ({property.state})</span>
        </p>

        <p className="text-[11px] text-slate-400 line-clamp-1">
          {property.amenities.slice(0, 3).join(' • ')}
        </p>

        <div className="pt-1 flex items-baseline gap-1">
          <span className="font-extrabold text-slate-900 text-sm">
            {property.starting_price_formatted}
          </span>
          <span className="text-xs text-slate-500 font-normal">/ night</span>
        </div>
      </div>

    </div>
  );
}
