import React from 'react';
import { 
  Search, 
  Heart, 
  MapPin, 
  MessageSquare, 
  User, 
  Building2, 
  Navigation, 
  ShieldCheck, 
  PlusCircle 
} from 'lucide-react';

export default function MobileFooterNav({ currentRole = 'guest', activeTab, setActiveTab, onOpenWizard }) {
  // Define nav items based on user role
  const getNavItems = () => {
    switch (currentRole) {
      case 'host':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Building2 },
          { id: 'explore', label: 'Explore', icon: Search },
          { id: 'add_listing', label: 'Add Stay', icon: PlusCircle, isAction: true },
          { id: 'inbox', label: 'Messages', icon: MessageSquare },
          { id: 'profile', label: 'Profile', icon: User },
        ];
      case 'agent':
        return [
          { id: 'dashboard', label: 'Audits', icon: Navigation },
          { id: 'explore', label: 'Explore', icon: Search },
          { id: 'inbox', label: 'Messages', icon: MessageSquare },
          { id: 'profile', label: 'Profile', icon: User },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Admin', icon: ShieldCheck },
          { id: 'explore', label: 'Explore', icon: Search },
          { id: 'inbox', label: 'Messages', icon: MessageSquare },
          { id: 'profile', label: 'Profile', icon: User },
        ];
      default: // 'guest'
        return [
          { id: 'explore', label: 'Explore', icon: Search },
          { id: 'wishlist', label: 'Wishlists', icon: Heart },
          { id: 'trips', label: 'Trips', icon: MapPin },
          { id: 'inbox', label: 'Messages', icon: MessageSquare },
          { id: 'profile', label: 'Profile', icon: User },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-2 px-3 md:hidden shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={() => onOpenWizard && onOpenWizard()}
                className="flex flex-col items-center gap-0.5 text-tafiya-blue font-bold active:scale-95 transition-transform cursor-pointer"
              >
                <div className="p-1 rounded-full bg-tafiya-blue text-white shadow-sm">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-tafiya-blue font-bold">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
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
