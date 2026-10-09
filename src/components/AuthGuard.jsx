import React from 'react';
import { Lock, ShieldAlert, ChevronRight, Sparkles, User, ArrowLeft, LogOut } from 'lucide-react';

export default function AuthGuard({ 
  currentUser, 
  requiredRole, 
  portalName, 
  onOpenAuthModal, 
  onSelectRole,
  onLogout,
  children 
}) {
  // 1. Unauthenticated Check
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 space-y-6 max-w-lg mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-tafiya-blue-50 text-tafiya-blue flex items-center justify-center mx-auto border border-tafiya-blue-100 shadow-md">
            <Lock className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-tafiya-blue bg-tafiya-blue-50 px-3 py-1 rounded-full border border-tafiya-blue/20">
              Authentication Required
            </span>
            <h2 className="text-xl font-black text-slate-900">Sign In to Access {portalName}</h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Access to {portalName} is restricted to authenticated account holders. Please sign in or register to continue.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
              className="w-full sm:w-auto px-7 py-3.5 bg-tafiya-blue text-white font-bold text-xs rounded-2xl shadow-md hover:bg-tafiya-blue-600 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Log In to {portalName}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal('signup')}
              className="w-full sm:w-auto px-7 py-3.5 bg-white text-tafiya-blue border border-tafiya-blue/30 font-bold text-xs rounded-2xl hover:bg-tafiya-blue-50 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-tafiya-gold" />
              <span>Create Account</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => onSelectRole && onSelectRole('guest')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Guest Accommodations Explorer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Role Authorization Check (if requiredRole specified)
  if (requiredRole && requiredRole !== 'any') {
    const userRole = currentUser.role || 'guest';
    const isAuthorized = userRole === requiredRole || userRole === 'admin';

    if (!isAuthorized) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-amber-200/80 space-y-6 max-w-lg mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-md">
              <ShieldAlert className="w-8 h-8 stroke-[2]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Access Restricted
              </span>
              <h2 className="text-xl font-black text-slate-900">{portalName} Role Required</h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                Your account is currently signed in as <strong className="text-slate-900 uppercase font-black">{userRole}</strong>. Accessing {portalName} requires authorized <strong className="text-slate-900 uppercase font-black">{requiredRole}</strong> credentials.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onSelectRole && onSelectRole('guest')}
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white font-bold text-xs rounded-2xl shadow-md hover:bg-slate-800 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Guest View</span>
              </button>

              <button
                onClick={() => {
                  onLogout && onLogout();
                  onOpenAuthModal && onOpenAuthModal('login');
                }}
                className="w-full sm:w-auto px-6 py-3 bg-white text-slate-700 border border-slate-300 font-bold text-xs rounded-2xl hover:bg-slate-100 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Log In as {requiredRole.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Authorized -> Render portal content
  return children;
}
