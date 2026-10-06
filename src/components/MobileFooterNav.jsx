import React from 'react';
import { Search, Heart, MapPin, MessageSquare, User } from 'lucide-react';

export default function MobileFooterNav({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'explore', label: 'Explore', icon: Search },
    { id: 'wishlist', label: 'Wishlists', icon: Heart },
    { id: 'trips', label: 'Trips', icon: MapPin },
    { id: 'inbox', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-2 px-4 md:hidden shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-tafiya-blue font-bold' : 'text-slate-500 font-normal hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
