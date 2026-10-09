import React from 'react';
import ListingCard from './ListingCard';
import { Heart, Search, ShieldCheck, MapPin, Building2, Sparkles, Lock, ChevronRight } from 'lucide-react';

export default function WishlistPage({ 
  properties, 
  wishlistIds = [], 
  onToggleWishlist, 
  onSelectProperty, 
  onNavigateExplore,
  currentUser,
  onOpenAuthModal 
}) {
  // Enforce Authentication Check
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 space-y-5 max-w-lg mx-auto shadow-md">
          <div className="w-16 h-16 rounded-3xl bg-tafiya-orange-50 text-tafiya-orange flex items-center justify-center mx-auto border border-tafiya-orange-100 shadow-sm">
            <Lock className="w-8 h-8 stroke-[2]" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-black text-slate-900">Sign In to Access Your Wishlist</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Save your favorite verified shortlet stays across Northern Nigeria, sync them across all your devices, and receive price drop alerts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
              className="w-full sm:w-auto px-6 py-3 bg-tafiya-blue text-white font-bold text-xs rounded-2xl shadow-md hover:bg-tafiya-blue-600 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Log In</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal('signup')}
              className="w-full sm:w-auto px-6 py-3 bg-white text-tafiya-blue border border-tafiya-blue/30 font-bold text-xs rounded-2xl hover:bg-tafiya-blue-50 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-tafiya-gold" />
              <span>Create Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const wishlistProperties = properties.filter(p => wishlistIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-tafiya-orange to-red-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md shrink-0">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-black">My Saved Stays</h1>
            <p className="text-xs text-slate-400 mt-0.5">Your curated list of verified shortlet accommodations</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700">
          <Sparkles className="w-4 h-4 text-tafiya-gold" />
          <span>{wishlistProperties.length} Saved {wishlistProperties.length === 1 ? 'Stay' : 'Stays'}</span>
        </div>
      </div>

      {/* Grid or Empty Wishlist View */}
      {wishlistProperties.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 space-y-4 max-w-md mx-auto my-8 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-tafiya-orange-50 text-tafiya-orange flex items-center justify-center mx-auto border border-tafiya-orange-100">
            <Heart className="w-8 h-8 stroke-[2]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">Your Wishlist is Empty</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              As you browse verified shortlet properties across Northern Nigeria, tap the heart icon on any stay to save it here for quick access.
            </p>
          </div>
          <button
            onClick={onNavigateExplore}
            className="px-6 py-3 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-2 mx-auto"
          >
            <Search className="w-4 h-4" />
            <span>Explore Verified Stays</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistProperties.map((property) => (
            <ListingCard
              key={property.id}
              property={property}
              onSelectProperty={onSelectProperty}
              isSaved={true}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      )}

    </div>
  );
}
