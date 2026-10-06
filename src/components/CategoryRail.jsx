import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Hotel, 
  Home, 
  Key, 
  Trees, 
  Sparkles,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import { MOCK_CATEGORIES } from '../data/mockProperties';

const ICON_MAP = {
  Building2,
  ShieldCheck,
  Hotel,
  Home,
  Key,
  Trees,
  Sparkles
};

export default function CategoryRail({ activeCategory, onSelectCategory, onOpenFilterModal, activeFilterCount }) {
  return (
    <div className="sticky top-[73px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/70 py-3 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Scrollable Category Rail */}
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth py-1">
            {MOCK_CATEGORIES.map((cat) => {
              const IconComponent = ICON_MAP[cat.icon] || Building2;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex flex-col items-center gap-1.5 min-w-max pb-2 border-b-2 transition-all duration-200 group cursor-pointer ${
                    isActive
                      ? 'border-tafiya-blue text-tafiya-blue font-bold'
                      : 'border-transparent text-slate-500 font-medium hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-tafiya-blue stroke-[2.2]' : 'text-slate-500 stroke-2'
                  }`} />
                  <span className="text-xs tracking-tight">{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Airbnb Filter Drawer Button */}
          <div className="hidden sm:flex items-center pl-4 border-l border-slate-200">
            <button
              onClick={onOpenFilterModal}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-2xl hover:border-slate-400 hover:shadow-airbnb transition-all duration-200 bg-white text-xs font-bold text-slate-800 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-tafiya-blue" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-tafiya-orange text-white text-[10px] font-extrabold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
