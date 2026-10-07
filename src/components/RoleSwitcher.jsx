import React from 'react';
import {
  User,
  Building2,
  Navigation,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function RoleSwitcher({ currentRole, onSelectRole, currentUser, onOpenAuthModal }) {
  const roles = [
    {
      id: 'guest',
      title: 'Guest / Traveler',
      subtitle: 'Public Search, Direct Booking & Trip Vouchers',
      icon: User,
      color: 'bg-tafiya-blue text-white',
      badge: 'Guest Portal'
    },
    {
      id: 'host',
      title: 'Host / Property Mgr',
      subtitle: 'Inventory, Room Rates & Payout Requests',
      icon: Building2,
      color: 'bg-tafiya-orange text-white',
      badge: 'Host Portal'
    },
    {
      id: 'agent',
      title: 'Field Verification Agent',
      subtitle: 'On-Site Device GPS & Location Audits',
      icon: Navigation,
      color: 'bg-indigo-600 text-white',
      badge: 'Agent Portal'
    },
    {
      id: 'admin',
      title: 'Super Admin',
      subtitle: 'CAC Docs, Tier 3 Badges & Escrow Payouts',
      icon: ShieldCheck,
      color: 'bg-emerald-600 text-white',
      badge: 'Admin Control'
    },
  ];

  const handleRoleClick = (targetRoleId) => {
    // If target is guest, allow freely
    if (targetRoleId === 'guest') {
      onSelectRole('guest');
      return;
    }

    // If user is logged in and their role matches or admin access
    if (currentUser) {
      const userRole = currentUser.role || 'guest';
      if (userRole === targetRoleId || userRole === 'admin') {
        onSelectRole(targetRoleId);
      } else {
        alert(`Your current account is registered as '${userRole.toUpperCase()}'. Log out or sign up with a '${targetRoleId.toUpperCase()}' account to access this portal.`);
      }
    } else {
      // Prompt log in / sign up
      onOpenAuthModal && onOpenAuthModal('login');
    }
  };

  return (
    null
  );
}
