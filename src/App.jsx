import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import RoleSwitcher from './components/RoleSwitcher';
import CategoryRail from './components/CategoryRail';
import ListingGrid from './components/ListingGrid';
import FilterModal from './components/FilterModal';
import SearchModal from './components/SearchModal';
import PropertyDetail from './components/PropertyDetail';
import CheckoutModal from './components/CheckoutModal';
import VoucherModal from './components/VoucherModal';
import HostDashboard from './components/HostDashboard';
import ListingWizard from './components/ListingWizard';
import FieldAgentPortal from './components/FieldAgentPortal';
import AdminPortal from './components/AdminPortal';
import MobileFooterNav from './components/MobileFooterNav';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import InfoModal from './components/InfoModal';
import OrderTrackerModal from './components/OrderTrackerModal';
import ShareModal from './components/ShareModal';
import WishlistPage from './components/WishlistPage';
import TripsPage from './components/TripsPage';
import InboxPage from './components/InboxPage';
import ProfilePage from './components/ProfilePage';
import AuthGuard from './components/AuthGuard';
import OnboardingModal from './components/OnboardingModal';
import LegalPolicyPage from './components/LegalPolicyPage';
import { MOCK_PROPERTIES } from './data/mockProperties';
import {
  Building2,
  ShieldCheck,
  Sparkles,
  MapPin,
  CheckCircle2,
  Search,
  User,
  Navigation
} from 'lucide-react';

export default function App() {
  const [properties, setProperties] = useState(MOCK_PROPERTIES);

  // Fetch real product/property data from database on mount
  useEffect(() => {
    const fetchDbProperties = async () => {
      try {
        const response = await fetch('/api/v1/properties');
        if (response.ok) {
          const resData = await response.json();
          if (resData.status === 'success' && Array.isArray(resData.data) && resData.data.length > 0) {
            setProperties(resData.data);
          }
        }
      } catch (err) {
        console.error('Database property fetch failed, using fallback dataset', err);
      }
    };
    fetchDbProperties();
  }, []);

  // Authenticated User State & Token
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('finddestination_user') || localStorage.getItem('tafiya_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object' && (parsed.name || parsed.email || parsed.id)) {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('finddestination_token') || localStorage.getItem('tafiya_token') || null);

  // Active User Role: 'guest', 'host', 'agent', or 'admin'
  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const savedUser = localStorage.getItem('finddestination_user') || localStorage.getItem('tafiya_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u && u.role) return u.role;
      }
    } catch { }
    return 'guest';
  });

  // Guest Navigation Sub-view: 'feed' or 'detail'
  const [guestSubView, setGuestSubView] = useState('feed');
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login', 'signup', or 'forgot'

  // Info Modal State for Footer Links
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoTopicKey, setInfoTopicKey] = useState('help');

  // Legal Policy Dedicated Page State & Hash Router
  const [activeLegalPolicy, setActiveLegalPolicy] = useState(() => {
    const hash = window.location.hash;
    if (hash === '#privacy-policy' || hash === '#privacy') return 'privacy';
    if (hash === '#refund-policy' || hash === '#refund' || hash === '#escrow') return 'refund';
    if (hash === '#terms-and-conditions' || hash === '#terms') return 'terms';
    if (hash === '#host-partner-policy' || hash === '#host-policy') return 'host-policy';
    if (hash === '#sitemap') return 'sitemap';
    return null;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#privacy-policy' || hash === '#privacy') {
        setActiveLegalPolicy('privacy');
      } else if (hash === '#refund-policy' || hash === '#refund' || hash === '#escrow') {
        setActiveLegalPolicy('refund');
      } else if (hash === '#terms-and-conditions' || hash === '#terms') {
        setActiveLegalPolicy('terms');
      } else if (hash === '#host-partner-policy' || hash === '#host-policy') {
        setActiveLegalPolicy('host-policy');
      } else if (hash === '#sitemap') {
        setActiveLegalPolicy('sitemap');
      } else if (!hash) {
        setActiveLegalPolicy(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Order Tracker Modal State
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [trackerInitialRef, setTrackerInitialRef] = useState('');

  // Active Chat Navigation State
  const [activeChatBookingRef, setActiveChatBookingRef] = useState(null);
  const [activeChatThreadId, setActiveChatThreadId] = useState(null);

  const handleOpenChat = (bookingRef, bookingDataOrThread) => {
    if (bookingRef) {
      setActiveChatBookingRef(bookingRef);
    }
    setActiveMobileTab('inbox');
  };

  // Modals & Triggers
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState(() => {
    try {
      const savedUser = localStorage.getItem('finddestination_user') || localStorage.getItem('tafiya_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u && (u.role === 'host' || u.role === 'agent' || u.role === 'admin')) {
          return 'dashboard';
        }
      }
    } catch { }
    return 'explore';
  });
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Wishlist State (persisted in localStorage)
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem('finddestination_wishlist') || localStorage.getItem('tafiya_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Share Property Modal State
  const [shareProperty, setShareProperty] = useState(null);

  const handleToggleWishlist = (propertyId) => {
    setWishlistIds(prev => {
      const exists = prev.includes(propertyId);
      const updated = exists ? prev.filter(id => id !== propertyId) : [...prev, propertyId];
      try {
        localStorage.setItem('finddestination_wishlist', JSON.stringify(updated));
        localStorage.setItem('tafiya_wishlist', JSON.stringify(updated));
      } catch { }
      return updated;
    });
  };

  const handleRoleSelect = (role) => {
    setCurrentRole(role);
    if (role === 'guest') {
      setGuestSubView('feed');
      setActiveMobileTab('explore');
    } else {
      setActiveMobileTab('dashboard');
    }
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    setIsOnboardingModalOpen(false);
    if (updatedUser && updatedUser.role && updatedUser.role !== 'guest') {
      setActiveMobileTab('dashboard');
    }
    try {
      localStorage.setItem('finddestination_user', JSON.stringify(updatedUser));
      localStorage.setItem('tafiya_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Failed to update user in localStorage', e);
    }
  };

  // Onboarding Modal Trigger (Only shown after registration)
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleOpenTrackerModal = (ref = '') => {
    setTrackerInitialRef(ref);
    setIsTrackerModalOpen(true);
  };

  const handleOpenInfoTopic = (topicKey) => {
    if (topicKey === 'privacy') {
      setActiveLegalPolicy('privacy');
      window.location.hash = '#privacy-policy';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (topicKey === 'refund' || topicKey === 'escrow') {
      setActiveLegalPolicy('refund');
      window.location.hash = '#refund-policy';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (topicKey === 'terms') {
      setActiveLegalPolicy('terms');
      window.location.hash = '#terms-and-conditions';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (topicKey === 'host-policy' || topicKey === 'host-cover') {
      setActiveLegalPolicy('host-policy');
      window.location.hash = '#host-partner-policy';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (topicKey === 'sitemap') {
      setActiveLegalPolicy('sitemap');
      window.location.hash = '#sitemap';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setInfoTopicKey(topicKey);
      setIsInfoModalOpen(true);
    }
  };

  const handleSelectDestinationState = (stateName) => {
    setSearchParams(prev => ({ ...prev, state: stateName }));
    if (currentRole !== 'guest') {
      setCurrentRole('guest');
    }
    setGuestSubView('feed');
  };

  const handleAuthSuccess = (user, token, options = {}) => {
    if (!user) return;
    setCurrentUser(user);
    if (token) setAuthToken(token);
    if (user.role) {
      setCurrentRole(user.role);
      if (user.role === 'host' || user.role === 'agent' || user.role === 'admin') {
        setActiveMobileTab('dashboard');
      } else {
        setActiveMobileTab('explore');
      }
    }

    // Trigger onboarding modal ONLY after new registration
    if (options.isRegistration) {
      setIsOnboardingModalOpen(true);
    } else {
      setIsOnboardingModalOpen(false);
    }

    try {
      localStorage.setItem('finddestination_user', JSON.stringify(user));
      localStorage.setItem('tafiya_user', JSON.stringify(user));
      if (token) {
        localStorage.setItem('finddestination_token', token);
        localStorage.setItem('tafiya_token', token);
      }
    } catch (e) {
      console.error('Failed to save auth state to localStorage', e);
    }
  };

  const handleLogout = async () => {
    if (authToken) {
      try {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
          }
        });
      } catch (err) {
        console.error('Logout request failed', err);
      }
    }
    setCurrentUser(null);
    setAuthToken(null);
    setCurrentRole('guest');
    localStorage.removeItem('finddestination_user');
    localStorage.removeItem('finddestination_token');
    localStorage.removeItem('tafiya_user');
    localStorage.removeItem('tafiya_token');
    localStorage.removeItem('finddestination_recent_bookings');
    localStorage.removeItem('tafiya_recent_bookings');
  };

  // Search Parameters State
  const [searchParams, setSearchParams] = useState({
    state: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  // Booking & Checkout Flow State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [activeBookingData, setActiveBookingData] = useState(null);
  const [newBookingAlert, setNewBookingAlert] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingNights, setBookingNights] = useState(2);

  const [filters, setFilters] = useState({
    tier: 'all',
    propertyTypes: [],
    amenities: []
  });

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.tier !== 'all') count++;
    if (filters.propertyTypes && filters.propertyTypes.length > 0) count += filters.propertyTypes.length;
    if (filters.amenities && filters.amenities.length > 0) count += filters.amenities.length;
    return count;
  }, [filters]);

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      // 1. Search State Filter
      if (searchParams.state) {
        const searchedState = searchParams.state.toLowerCase();
        const propState = (property.state || '').toLowerCase();
        const propCity = (property.city || '').toLowerCase();
        if (!propState.includes(searchedState) && !propCity.includes(searchedState)) {
          return false;
        }
      }

      // 2. Category Rail Filter
      if (selectedCategory === 'verified' && property.verification_tier !== 'tier_3_certified') {
        return false;
      }
      if (selectedCategory !== 'all' && selectedCategory !== 'verified' && property.property_type !== selectedCategory) {
        return false;
      }

      // 3. Modal Filters
      if (filters.tier !== 'all' && property.verification_tier !== filters.tier) {
        return false;
      }

      if (filters.propertyTypes && filters.propertyTypes.length > 0) {
        if (!filters.propertyTypes.includes(property.property_type)) {
          return false;
        }
      }

      if (filters.amenities && filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity =>
          property.amenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    });
  }, [properties, selectedCategory, filters, searchParams]);

  const [activeBookingDates, setActiveBookingDates] = useState({ checkIn: '', checkOut: '' });
  const gridScrollPosRef = useMemo(() => ({ current: 0 }), []);

  const handleSelectProperty = (property) => {
    gridScrollPosRef.current = window.scrollY || window.pageYOffset || 0;
    setSelectedProperty(property);
    setSelectedRoom(property.rooms[0] || null);
    setGuestSubView('detail');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBackToFeed = () => {
    const savedPos = gridScrollPosRef.current || 0;
    setGuestSubView('feed');
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedPos, behavior: 'instant' });
    });
  };

  const handleInitiateBooking = (property, room, nights, checkIn, checkOut) => {
    setSelectedProperty(property);
    setSelectedRoom(room);
    setBookingNights(nights);
    if (checkIn && checkOut) {
      setActiveBookingDates({ checkIn, checkOut });
    }
    setIsCheckoutModalOpen(true);
  };

  const handlePaymentComplete = (bookingData) => {
    setIsCheckoutModalOpen(false);
    setActiveBookingData(bookingData);
    setNewBookingAlert(bookingData);

    // If guest was unauthenticated, establish guest session so profile recognizes them immediately
    if (!currentUser) {
      const guestUser = {
        name: bookingData.guestName || 'Guest Traveler',
        full_name: bookingData.guestName || 'Guest Traveler',
        email: bookingData.guestEmail || '',
        phone: bookingData.guestPhone || '',
        role: 'guest',
        state: bookingData.property?.state || 'Bauchi'
      };
      setCurrentUser(guestUser);
      try {
        localStorage.setItem('finddestination_user', JSON.stringify(guestUser));
      } catch (e) {}
    }

    // Redirect guest directly to their Profile Page where reservations are displayed
    setActiveMobileTab('profile');
    setGuestSubView('feed');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Automatically trigger booking confirmation & voucher email in background
    if (bookingData.reference && bookingData.guestEmail) {
      fetch('/api/v1/bookings/send-voucher-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          booking_reference: bookingData.reference,
          recipient_email: bookingData.guestEmail,
          guest_name: bookingData.guestName,
          property_name: bookingData.property?.name || bookingData.propertyTitle,
          property_address: bookingData.property?.address
            ? `${bookingData.property.address}${bookingData.property.city ? `, ${bookingData.property.city}` : ''}`
            : bookingData.location,
          room_name: bookingData.room?.name || bookingData.roomType,
          check_in_date: bookingData.checkInDate,
          check_out_date: bookingData.checkOutDate,
          nights: bookingData.nights,
          total_amount: typeof bookingData.totalAmount === 'number'
            ? `₦${bookingData.totalAmount.toLocaleString()}`
            : bookingData.totalAmount
        })
      }).catch(e => console.warn('Background email dispatch caught:', e));
    }

    try {
      const savedStr = localStorage.getItem('finddestination_recent_bookings') || localStorage.getItem('tafiya_recent_bookings');
      const saved = savedStr ? JSON.parse(savedStr) : [];
      const updated = [bookingData, ...saved.filter(b => b.reference !== bookingData.reference)];
      localStorage.setItem('finddestination_recent_bookings', JSON.stringify(updated));
      localStorage.setItem('tafiya_recent_bookings', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save booking to local storage', e);
    }
  };

  const handlePropertyCreated = async (newProp) => {
    try {
      const response = await fetch('/api/v1/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          ...newProp,
          host_id: newProp.host_id || currentUser?.id,
          host_email: currentUser?.email,
          host_name: currentUser?.name,
          business_name: currentUser?.business_name,
          cac_number: currentUser?.cac_number,
          tin_number: currentUser?.tin_number,
        })
      });
      if (response.ok) {
        const resData = await response.json();
        if (resData.status === 'success' && resData.data) {
          if (resData.data.host?.id && (!currentUser?.id || currentUser.id !== resData.data.host.id)) {
            const updatedUser = {
              ...currentUser,
              id: resData.data.host.id,
              name: currentUser?.name || resData.data.host.name,
              business_name: currentUser?.business_name || resData.data.host.business_name,
              email: currentUser?.email || resData.data.host.email,
              role: 'host',
              host_status: 'approved'
            };
            setCurrentUser(updatedUser);
            try {
              localStorage.setItem('finddestination_user', JSON.stringify(updatedUser));
              localStorage.setItem('tafiya_user', JSON.stringify(updatedUser));
            } catch (err) {}
          }
          setProperties(prev => [resData.data, ...prev]);
          return resData.data;
        }
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create property');
      }
    } catch (e) {
      console.error('Failed to create property in DB', e);
      setProperties(prev => [newProp, ...prev]);
      return newProp;
    }
  };

  const handleTogglePublish = async (propId) => {
    try {
      await fetch(`/api/v1/properties/${propId}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });
    } catch (e) {
      console.error('Failed to toggle publish status in DB', e);
    }
    setProperties(prev => prev.map(p =>
      p.id === propId ? { ...p, is_published: !p.is_published } : p
    ));
  };

  const handleUpdateVerificationStatus = async (propId, newTier) => {
    try {
      await fetch(`/api/v1/properties/${propId}/verification`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ tier: newTier })
      });
    } catch (e) {
      console.error('Failed to update verification status in DB', e);
    }
    setProperties(prev => prev.map(p => {
      if (p.id === propId) {
        const statusMap = {
          'tier_1_docs': 'documents_verified',
          'tier_2_location': 'location_verified',
          'tier_3_certified': 'verified'
        };
        return {
          ...p,
          verification_tier: newTier,
          verification_status: statusMap[newTier] || 'verified'
        };
      }
      return p;
    }));
  };

  const handleLocationAudit = (propId, auditData) => {
    setProperties(prev => prev.map(p => {
      if (p.id === propId) {
        return {
          ...p,
          verification_tier: 'tier_2_location',
          verification_status: 'location_verified',
          latitude: parseFloat(auditData.latitude) || p.latitude,
          longitude: parseFloat(auditData.longitude) || p.longitude
        };
      }
      return p;
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/30">

      <div className="flex-1">
        {/* 1. Global Role Switcher Navigation Header */}
        <RoleSwitcher
          currentRole={currentRole}
          currentUser={currentUser}
          onOpenAuthModal={handleOpenAuthModal}
          onSelectRole={handleRoleSelect}
        />

        {/* 2. Main Header */}
        <Header
          onOpenSearchModal={() => setIsSearchModalOpen(true)}
          activeTab={activeMobileTab}
          setActiveTab={setActiveMobileTab}
          currentUser={currentUser}
          onOpenAuthModal={handleOpenAuthModal}
          onLogout={handleLogout}
          searchParams={searchParams}
          onOpenTracker={handleOpenTrackerModal}
          onLogoClick={() => {
            setActiveLegalPolicy(null);
            if (window.location.hash) {
              history.pushState("", document.title, window.location.pathname + window.location.search);
            }
            setActiveMobileTab('explore');
            setGuestSubView('feed');
          }}
        />

        {/* 3. Render Role-Specific Portal or Mobile Sub-Page */}
        {activeLegalPolicy ? (
          <LegalPolicyPage
            activePolicyKey={activeLegalPolicy}
            onNavigateTab={(key) => setActiveLegalPolicy(key)}
            onClose={() => {
              setActiveLegalPolicy(null);
              if (window.location.hash) {
                history.pushState("", document.title, window.location.pathname + window.location.search);
              }
            }}
            onSelectStateFilter={handleSelectDestinationState}
            onOpenAuthModal={handleOpenAuthModal}
          />
        ) : activeMobileTab === 'wishlist' ? (
          <WishlistPage
            properties={properties}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onSelectProperty={handleSelectProperty}
            onNavigateExplore={() => setActiveMobileTab('explore')}
            currentUser={currentUser}
            onOpenAuthModal={handleOpenAuthModal}
          />
        ) : activeMobileTab === 'trips' ? (
          <TripsPage
            currentUser={currentUser}
            onOpenAuthModal={handleOpenAuthModal}
            onOpenVoucher={(booking) => {
              setActiveBookingData(booking);
              setIsVoucherModalOpen(true);
            }}
            onOpenTracker={(ref) => handleOpenTrackerModal(ref)}
            onOpenChat={handleOpenChat}
            onNavigateExplore={() => setActiveMobileTab('explore')}
          />
        ) : activeMobileTab === 'inbox' ? (
          <InboxPage
            currentUser={currentUser}
            onOpenAuthModal={handleOpenAuthModal}
            onNavigateExplore={() => setActiveMobileTab('explore')}
            targetBookingRef={activeChatBookingRef}
            targetThreadId={activeChatThreadId}
            onClearTargetChat={() => {
              setActiveChatBookingRef(null);
              setActiveChatThreadId(null);
            }}
          />
        ) : activeMobileTab === 'profile' ? (
          <ProfilePage
            currentUser={currentUser}
            currentRole={currentRole}
            onOpenAuthModal={handleOpenAuthModal}
            onLogout={handleLogout}
            onSelectRole={handleRoleSelect}
            onOpenTracker={(ref) => handleOpenTrackerModal(ref)}
            onOpenInfoModal={(key) => handleOpenInfoTopic(key)}
            onUpdateUser={handleUpdateUser}
            onOpenVoucher={(booking) => {
              setActiveBookingData(booking);
              setIsVoucherModalOpen(true);
            }}
            onOpenChat={handleOpenChat}
            onNavigateExplore={() => {
              setActiveMobileTab('explore');
              setGuestSubView('feed');
            }}
            newBookingAlert={newBookingAlert}
            onDismissAlert={() => setNewBookingAlert(null)}
          />
        ) : activeMobileTab === 'explore' || currentRole === 'guest' ? (
          /* GUEST / TRAVELER STAYS FEED */
          <>
            <div className={guestSubView === 'feed' ? 'animate-in fade-in duration-300' : 'hidden'}>
              <CategoryRail
                activeCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onOpenFilterModal={() => setIsFilterModalOpen(true)}
                activeFilterCount={activeFilterCount}
              />

              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

                <ListingGrid
                  properties={filteredProperties}
                  onSelectProperty={handleSelectProperty}
                  onOpenFilterModal={() => setIsFilterModalOpen(true)}
                  wishlistIds={wishlistIds}
                  onToggleWishlist={handleToggleWishlist}
                />

              </main>
            </div>

            {guestSubView === 'detail' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out">
                <PropertyDetail
                  property={selectedProperty}
                  onBack={handleBackToFeed}
                  onInitiateBooking={handleInitiateBooking}
                  isSaved={wishlistIds.includes(selectedProperty?.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onOpenShareModal={(p) => setShareProperty(p)}
                />
              </div>
            )}
          </>
        ) : currentRole === 'host' ? (
          /* HOST / PROPERTY MANAGER ROLE */
          <AuthGuard
            currentUser={currentUser}
            requiredRole="host"
            portalName="Host Dashboard"
            onOpenAuthModal={handleOpenAuthModal}
            onSelectRole={handleRoleSelect}
            onLogout={handleLogout}
          >
            <HostDashboard
              currentUser={currentUser}
              properties={properties}
              onOpenWizard={() => setIsWizardOpen(true)}
              onTogglePublish={handleTogglePublish}
              onOpenChat={handleOpenChat}
              onNavigateInbox={() => setActiveMobileTab('inbox')}
            />
          </AuthGuard>
        ) : currentRole === 'agent' ? (
          /* FIELD VERIFICATION AGENT ROLE */
          <AuthGuard
            currentUser={currentUser}
            requiredRole="agent"
            portalName="Field Agent Desk"
            onOpenAuthModal={handleOpenAuthModal}
            onSelectRole={handleRoleSelect}
            onLogout={handleLogout}
          >
            <FieldAgentPortal
              properties={properties}
              currentUser={currentUser}
              authToken={authToken}
              onCompleteLocationAudit={() => {}}
            />
          </AuthGuard>
        ) : (
          /* SUPER ADMIN ROLE */
          <AuthGuard
            currentUser={currentUser}
            requiredRole="admin"
            portalName="Super Admin Portal"
            onOpenAuthModal={handleOpenAuthModal}
            onSelectRole={handleRoleSelect}
            onLogout={handleLogout}
          >
            <AdminPortal
              properties={properties}
              onUpdateVerificationStatus={handleUpdateVerificationStatus}
              onTogglePublish={handleTogglePublish}
              currentUser={currentUser}
            />
          </AuthGuard>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
        onResetFilters={() => setFilters({ tier: 'all', propertyTypes: [], amenities: [] })}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        searchParams={searchParams}
        onApplySearch={(newSearchParams) => setSearchParams(newSearchParams)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuthModal}
        property={selectedProperty}
        selectedRoom={selectedRoom}
        totalNights={bookingNights}
        bookingDates={activeBookingDates}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Voucher Modal */}
      <VoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        booking={activeBookingData}
      />

      {/* Order & Booking Tracker Modal */}
      <OrderTrackerModal
        isOpen={isTrackerModalOpen}
        onClose={() => setIsTrackerModalOpen(false)}
        currentUser={currentUser}
        initialRef={trackerInitialRef}
        onOpenVoucher={(bookingDetails) => {
          setActiveBookingData(bookingDetails);
          setIsVoucherModalOpen(true);
        }}
      />

      {/* Multi-Step Property Creator Wizard */}
      <ListingWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onPropertyCreated={handlePropertyCreated}
        currentUser={currentUser}
      />

      {/* Authentication & Account Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Compulsory Post-Registration Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        currentUser={currentUser}
        onCompleteOnboarding={handleUpdateUser}
      />

      {/* Share Property Modal */}
      <ShareModal
        isOpen={!!shareProperty}
        onClose={() => setShareProperty(null)}
        property={shareProperty}
      />

      {/* Informational Policy & Help Modal */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        topicKey={infoTopicKey}
        onOpenAuthModal={handleOpenAuthModal}
        onSelectStateFilter={handleSelectDestinationState}
      />

      {/* Airbnb Style Full Footer Component */}
      <Footer
        currentUser={currentUser}
        currentRole={currentRole}
        onOpenAuthModal={handleOpenAuthModal}
        onOpenInfoTopic={handleOpenInfoTopic}
        onSelectDestinationState={handleSelectDestinationState}
        onOpenTracker={handleOpenTrackerModal}
        onOpenWizard={() => setIsWizardOpen(true)}
        onSelectTab={(tab) => setActiveMobileTab(tab)}
      />

      {/* Mobile Bottom Navigation */}
      <MobileFooterNav
        currentRole={currentRole}
        activeTab={activeMobileTab}
        setActiveTab={setActiveMobileTab}
        onOpenWizard={() => setIsWizardOpen(true)}
      />

    </div>
  );
}

