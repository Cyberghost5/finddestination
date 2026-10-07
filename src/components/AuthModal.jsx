import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  ShieldCheck, 
  Building2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  KeyRound,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login', 'signup', or 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sync mode state when modal opens or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, initialMode]);

  // Login State
  const [loginInput, setLoginInput] = useState('musa@example.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('+234 ');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState('guest');

  // Forgot Password Wizard State (1: Request, 2: OTP, 3: New Password, 4: Success)
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmailOrPhone, setForgotEmailOrPhone] = useState('');
  const [otpCode, setOtpCode] = useState(['8', '9', '2', '0', '1', '4']);
  const [newPassword, setNewPassword] = useState('');

  // Email Verification State
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState(['4', '9', '2', '0', '1', '8']);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const googlePayload = {
        name: signUpName.trim() || 'Musa Danjuma (Google User)',
        email: signUpEmail.trim() || 'musa.google@example.com',
        google_id: 'goog_' + Date.now(),
        role: signUpRole || 'guest',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      };

      const response = await fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(googlePayload)
      });

      const data = await response.json();

      if (response.ok && data.status === 'success' && data.data?.user) {
        if (onAuthSuccess) onAuthSuccess(data.data.user, data.data.token || '');
        onClose();
      } else {
        setErrorMessage(data.message || 'Google authentication failed');
      }
    } catch (err) {
      console.error('Google Auth Error:', err);
      // Fallback demo simulation
      const mockUser = {
        id: Date.now(),
        name: signUpName.trim() || 'Musa Danjuma (Google User)',
        email: signUpEmail.trim() || 'musa.google@example.com',
        role: signUpRole || 'guest',
        google_id: 'goog_demo_123'
      };
      if (onAuthSuccess) onAuthSuccess(mockUser, 'google_sanctum_token_' + Date.now());
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ login: loginInput, password: loginPassword })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success' && data.data?.user) {
        if (onAuthSuccess) onAuthSuccess(data.data.user, data.data.token || '');
        onClose();
      } else if (data.requires_verification || data.status === 'unverified') {
        setUnverifiedEmail(data.data?.email || loginInput);
        setErrorMessage(data.message || 'Please verify your email address before logging in.');
        setMode('verify');
      } else {
        setErrorMessage(data.message || 'Authentication failed');
      }
    } catch (err) {
      setErrorMessage('Network error connecting to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: signUpName,
          email: signUpEmail,
          phone: signUpPhone,
          password: signUpPassword,
          role: signUpRole
        })
      });

      const data = await response.json();

      if (response.ok && (data.status === 'success' || data.requires_verification || data.status === 'unverified')) {
        setUnverifiedEmail(signUpEmail || data.data?.email);
        setSuccessMessage(data.message || 'Account created! Enter the 6-digit verification code sent to your email.');
        setMode('verify');
      } else {
        setErrorMessage(data.message || 'Registration failed');
      }
    } catch (err) {
      setErrorMessage('Network error connecting to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email: unverifiedEmail,
          code: verifyCode.join('')
        })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success' && data.data?.user) {
        if (onAuthSuccess) onAuthSuccess(data.data.user, data.data.token || '');
        onClose();
      } else {
        setErrorMessage(data.message || 'Invalid verification code');
      }
    } catch (err) {
      setErrorMessage('Failed to verify email code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail })
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setSuccessMessage(`New 6-digit verification email dispatched to ${unverifiedEmail}`);
      } else {
        setErrorMessage(data.message || 'Failed to resend verification email');
      }
    } catch (err) {
      setErrorMessage('Error resending email code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email_or_phone: forgotEmailOrPhone })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setSuccessMessage(`OTP code dispatched to ${forgotEmailOrPhone}`);
        setForgotStep(2);
      } else {
        setErrorMessage(data.message || 'Account not found');
      }
    } catch (err) {
      setErrorMessage('Error sending password reset request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setForgotStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email_or_phone: forgotEmailOrPhone,
          otp: otpCode.join(''),
          password: newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setForgotStep(4);
      } else {
        setErrorMessage(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setErrorMessage('Error resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-tafiya-blue-50 border border-tafiya-blue-100 p-0.5 flex items-center justify-center">
              <img src="/logo.jpeg" alt="FindDestination" className="w-6 h-6 object-contain rounded-lg" />
            </div>
            <span className="text-sm font-extrabold text-slate-900">
              {mode === 'login' && 'Log In to FindDestination'}
              {mode === 'signup' && 'Create Your Account'}
              {mode === 'forgot' && 'Password Recovery'}
              {mode === 'verify' && 'Verify Email Address'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs (Login vs Signup) */}
        {mode !== 'forgot' && mode !== 'verify' && (
          <div className="flex border-b border-slate-100 bg-slate-50/60 p-1">
            <button
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-2xl transition-all ${
                mode === 'login' ? 'bg-white text-tafiya-blue shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setMode('signup'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-2xl transition-all ${
                mode === 'signup' ? 'bg-white text-tafiya-blue shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Error / Success Notifications */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. LOG IN VIEW */}
          {mode === 'login' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 absolute">or</span>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email or Phone Number</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="musa@example.com or +234..."
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tafiya-blue font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] font-bold text-tafiya-blue hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tafiya-blue font-semibold"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-tafiya-blue rounded" />
                    <span>Remember this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 text-white rounded-2xl font-bold text-xs shadow-md hover:shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Authenticating...' : 'Log In to Account'}
                </button>
              </form>
            </div>
          )}

          {/* 2. SIGN UP VIEW */}
          {mode === 'signup' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign up with Google</span>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 absolute">or</span>
              </div>
            <form onSubmit={handleSignUpSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Musa Danjuma"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-tafiya-blue font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="musa@example.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-tafiya-blue font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone (+234)</label>
                  <input
                    type="text"
                    placeholder="+2348021112233"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-tafiya-blue font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Account Type / Role</label>
                <select
                  value={signUpRole}
                  onChange={(e) => setSignUpRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold"
                >
                  <option value="guest">Guest / Traveler (Book Verified Stays)</option>
                  <option value="host">Host / Property Manager (List Properties)</option>
                  <option value="agent">Field Verification Agent (Location Audits)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-tafiya-blue font-semibold"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 text-white rounded-2xl font-bold text-xs shadow-md hover:shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Creating Account...' : 'Create Account & Auto Log In'}
              </button>
            </form>
          </div>
          )}

          {/* 3. FORGOT PASSWORD WIZARD */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              
              {/* Step 1: Request OTP */}
              {forgotStep === 1 && (
                <form onSubmit={handleForgotRequest} className="space-y-4">
                  <div className="text-center space-y-1">
                    <KeyRound className="w-8 h-8 text-tafiya-orange mx-auto" />
                    <h3 className="text-sm font-extrabold text-slate-900">Recover Password</h3>
                    <p className="text-xs text-slate-500">Enter your registered email or phone number to receive a 6-digit OTP code.</p>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="e.g. musa@example.com or +234..."
                      value={forgotEmailOrPhone}
                      onChange={(e) => setForgotEmailOrPhone(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-tafiya-blue font-semibold"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-tafiya-blue text-white rounded-2xl font-bold text-xs shadow-md hover:bg-tafiya-blue-600 transition-colors"
                  >
                    Send 6-Digit OTP Code
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    Back to Log In
                  </button>
                </form>
              )}

              {/* Step 2: OTP Entry */}
              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
                  <span className="text-xs font-extrabold text-slate-900 block">Enter 6-Digit Verification OTP</span>
                  <p className="text-[11px] text-slate-500">Code sent to {forgotEmailOrPhone}. Demo code: <strong className="text-tafiya-blue">892014</strong></p>

                  <div className="flex items-center justify-center gap-2 font-mono">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const updated = [...otpCode];
                          updated[idx] = e.target.value;
                          setOtpCode(updated);
                        }}
                        className="w-9 h-10 text-center font-extrabold border border-slate-300 rounded-xl text-sm focus:border-tafiya-blue bg-slate-50"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-tafiya-blue text-white rounded-2xl font-bold text-xs shadow-md hover:bg-tafiya-blue-600 transition-colors"
                  >
                    Verify Code
                  </button>
                </form>
              )}

              {/* Step 3: New Password */}
              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center space-y-1">
                    <Lock className="w-8 h-8 text-tafiya-blue mx-auto" />
                    <h3 className="text-sm font-extrabold text-slate-900">Set New Password</h3>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-tafiya-blue font-semibold"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 text-white rounded-2xl font-bold text-xs shadow-md hover:shadow-lg transition-transform"
                  >
                    Update Password & Complete Recovery
                  </button>
                </form>
              )}

              {/* Step 4: Success */}
              {forgotStep === 4 && (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="text-sm font-extrabold text-emerald-950">Password Recovered Successfully!</h3>
                  <p className="text-xs text-emerald-800">Your password has been updated. You can now log in.</p>
                  <button
                    onClick={() => { setMode('login'); setForgotStep(1); }}
                    className="px-6 py-2 bg-emerald-600 text-white font-bold text-xs rounded-full shadow hover:bg-emerald-700 transition-colors"
                  >
                    Log In Now
                  </button>
                </div>
              )}

            </div>
          )}

          {/* 4. EMAIL VERIFICATION VIEW */}
          {mode === 'verify' && (
            <form onSubmit={handleVerifyEmailSubmit} className="space-y-4 text-center animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-tafiya-blue mx-auto">
                <Mail className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900">Verify Email Address</h3>
                <p className="text-xs text-slate-500 mt-1">
                  We sent a 6-digit verification code to <strong className="text-slate-800">{unverifiedEmail || 'your email'}</strong>.
                </p>
                <p className="text-[11px] text-tafiya-blue font-bold mt-2 bg-blue-50 px-3 py-1.5 rounded-xl inline-block border border-blue-100">
                  Demo Code: 492018
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 font-mono my-2">
                {verifyCode.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const updated = [...verifyCode];
                      updated[idx] = e.target.value;
                      setVerifyCode(updated);
                    }}
                    className="w-10 h-11 text-center font-extrabold border border-slate-300 rounded-xl text-base focus:border-tafiya-blue focus:ring-2 focus:ring-tafiya-blue/20 bg-slate-50"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 text-white rounded-2xl font-bold text-xs shadow-md hover:shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify Email & Activate Account'}
              </button>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="font-bold text-tafiya-blue hover:underline cursor-pointer"
                >
                  Resend Email Code
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMessage(''); }}
                  className="font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Back to Log In
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
