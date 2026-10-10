import React, { useState, useEffect } from 'react';
import {
  Search,
  Globe,
  Menu,
  User,
  ShieldCheck,
  Building2,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  X,
  MapPin,
  Calendar,
  Users,
  Package
} from 'lucide-react';

export default function Header({ onOpenSearchModal, activeTab, setActiveTab, currentUser, onOpenAuthModal, onLogout, searchParams, onOpenTracker, onLogoClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Format search pill labels
  const locationLabel = searchParams?.state ? searchParams.state : 'Anywhere in Northern Nigeria';
  const datesLabel = (searchParams?.checkIn && searchParams?.checkOut)
    ? `${searchParams.checkIn} → ${searchParams.checkOut}`
    : 'Any dates';
  const guestsLabel = searchParams?.guests ? `${searchParams.guests} ${searchParams.guests === 1 ? 'Guest' : 'Guests'}` : 'Add guests';

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${isScrolled ? 'glass-header border-b border-slate-200/80 shadow-sm py-3' : 'bg-white border-b border-slate-100 py-4'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">

          {/* Logo & Brand */}
          <div onClick={() => onLogoClick && onLogoClick()} className="flex items-center gap-3 cursor-pointer group">
            <div className="relative overflow-hidden rounded-xl border border-slate-200/60 p-1 bg-white shadow-sm transition-transform duration-300 group-hover:scale-105">
              <img
                src="/logo.jpeg"
                alt="FindDestination Logo"
                className="w-10 h-10 object-contain rounded-lg"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-tafiya-blue transition-colors">
                FindDestination<span className="text-tafiya-orange">.com.ng</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase -mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-tafiya-blue fill-tafiya-blue/10" /> Verified Northern Stays
              </span>
            </div>
          </div>

          {/* Airbnb Floating Pill Search Bar */}
          <div className="hidden md:flex items-center">
            <button
              onClick={onOpenSearchModal}
              className="flex items-center justify-between gap-3 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-search hover:shadow-airbnb transition-all duration-300 hover:border-slate-300 cursor-pointer text-sm font-medium group"
            >
              <div className="flex items-center gap-2 pl-2">
                <MapPin className="w-4 h-4 text-tafiya-blue" />
                <span className="text-slate-900 font-semibold">{locationLabel}</span>
              </div>
              <div className="h-4 w-[1px] bg-slate-200"></div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-tafiya-orange" />
                <span className="text-slate-700">{datesLabel}</span>
              </div>
              <div className="h-4 w-[1px] bg-slate-200"></div>
              <div className="flex items-center gap-2 pr-1">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500 font-normal">{guestsLabel}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-105">
                <Search className="w-4 h-4 stroke-[2.5]" />
              </div>
            </button>
          </div>

          {/* Right Action Menu & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onOpenTracker && onOpenTracker()}
              className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 px-3.5 py-2 rounded-full transition-all duration-200 border border-slate-200 cursor-pointer"
            >
              <Package className="w-4 h-4 text-tafiya-blue" />
              <span>Track Booking</span>
            </button>

            <button className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
              <Globe className="w-4 h-4" />
            </button>

            {/* User Dropdown Pill */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 p-1.5 pl-3 border border-slate-200 rounded-full hover:shadow-airbnb transition-all duration-200 bg-white cursor-pointer"
              >
                <Menu className="w-4 h-4 text-slate-600" />
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-tafiya-blue to-tafiya-orange flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {currentUser && currentUser.name ? currentUser.name.charAt(0).toUpperCase() : (currentUser && currentUser.email ? currentUser.email.charAt(0).toUpperCase() : <User className="w-4 h-4" />)}
                </div>
              </button>

              {/* Dropdown Menu Modal */}
              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-airbnb border border-slate-100 py-2 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                      {currentUser ? (
                        <div>
                          <p className="text-xs font-bold text-slate-900">{currentUser.name || 'Account User'}</p>
                          <p className="text-[11px] text-slate-500 truncate">{currentUser.email || ''}</p>
                          <span className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-tafiya-blue-50 text-tafiya-blue uppercase">
                            Role: {currentUser.role || 'guest'}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold text-slate-900">Welcome to FindDestination</p>
                          <p className="text-[11px] text-slate-500">Northern Nigeria's Accommodation Portal</p>
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      {/* My Profile & Reservations */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setActiveTab && setActiveTab('profile');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-tafiya-blue" />
                        <span>My Profile & Reservations</span>
                      </button>

                      {/* Track Booking Button for all users */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenTracker && onOpenTracker();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-tafiya-blue hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-tafiya-blue" />
                        <span>Track Order</span>
                      </button>

                      {currentUser ? (
                        <>
                          {/* Role Specific Actions */}
                          {currentUser.role === 'host' && (
                            <button
                              onClick={() => {
                                setIsMenuOpen(false);
                                onSelectRole && onSelectRole('host');
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-tafiya-blue hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <Building2 className="w-4 h-4" />
                              <span>Go to Host Dashboard</span>
                            </button>
                          )}

                          {currentUser.role === 'agent' && (
                            <button
                              onClick={() => {
                                setIsMenuOpen(false);
                                onSelectRole && onSelectRole('agent');
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-tafiya-orange hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              <span>Field Agent Desk</span>
                            </button>
                          )}

                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => {
                                setIsMenuOpen(false);
                                onSelectRole && onSelectRole('admin');
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-4 h-4" />
                              <span>Super Admin Console</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              onLogout && onLogout();
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            Log out
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              onOpenAuthModal && onOpenAuthModal('signup');
                            }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <span>Sign up</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              onOpenAuthModal && onOpenAuthModal('login');
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            Log in
                          </button>
                        </>
                      )}
                    </div>

                    <div className="h-[1px] bg-slate-100 my-1"></div>

                    <div className="py-1">
                      {!currentUser || currentUser.role === 'guest' ? (
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenAuthModal && onOpenAuthModal('host_signup');
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <Building2 className="w-4 h-4 text-tafiya-blue" />
                          <span>List your Property (Become Host)</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Search Button Bar */}
        <div className="mt-3 md:hidden">
          <button
            onClick={onOpenSearchModal}
            className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-2xl shadow-search text-xs font-medium"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-tafiya-blue-50 flex items-center justify-center text-tafiya-blue">
                <Search className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900">Where to?</div>
                <div className="text-[11px] text-slate-500">Bauchi • Kaduna • Kano • Plateau • Any dates</div>
              </div>
            </div>
            <div className="p-2 border border-slate-200 rounded-full text-slate-600">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
          </button>
        </div>

      </div>
    </header>
  );
}
