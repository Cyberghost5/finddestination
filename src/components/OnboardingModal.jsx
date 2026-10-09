import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Heart, 
  Lock, 
  Calendar, 
  User, 
  Mail, 
  ArrowLeft,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function OnboardingModal({ 
  isOpen, 
  currentUser, 
  onCompleteOnboarding 
}) {
  const [step, setStep] = useState(1); // 1: Account Info (Legal name, DOB, Email), 2: Terms & Community Commitment
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [marketingOptOut, setMarketingOptOut] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill fields from currentUser
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name || currentUser.full_name) {
        const parts = (currentUser.name || currentUser.full_name || '').trim().split(' ');
        if (parts.length >= 2) {
          setFirstName(parts[0]);
          setLastName(parts.slice(1).join(' '));
        } else if (parts.length === 1 && parts[0]) {
          setFirstName(parts[0]);
        }
      }
      if (currentUser.first_name) setFirstName(currentUser.first_name);
      if (currentUser.last_name) setLastName(currentUser.last_name);
      if (currentUser.dob) setDob(currentUser.dob);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  // Calculate age from Date of Birth
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return 0;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!firstName.trim()) {
      setErrorMsg('First name is required matching your government ID.');
      return;
    }
    if (!lastName.trim()) {
      setErrorMsg('Last name is required matching your government ID.');
      return;
    }
    if (!dob) {
      setErrorMsg('Please select your date of birth.');
      return;
    }

    const age = calculateAge(dob);
    if (age < 18) {
      setErrorMsg('You must be at least 18 years old to book or host on FindDestination.');
      return;
    }

    // Proceed to Step 2: Terms and Community Commitment
    setStep(2);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const payload = {
      email: currentUser?.email || '',
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      name: `${firstName.trim()} ${lastName.trim()}`,
      dob: dob,
      marketing_opt_out: marketingOptOut,
      onboarding_completed: true,
      terms_accepted: true,
      terms_accepted_at: new Date().toISOString()
    };

    try {
      // Send onboarding completion to backend
      const response = await fetch('/api/v1/auth/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      
      const updatedUser = {
        ...(currentUser || {}),
        ...payload,
        onboarding_completed: true
      };

      if (onCompleteOnboarding) {
        onCompleteOnboarding(updatedUser);
      }
    } catch (err) {
      console.error('Onboarding update network call failed, persisting locally', err);
      // Fallback local update
      const updatedUser = {
        ...(currentUser || {}),
        ...payload,
        onboarding_completed: true
      };
      if (onCompleteOnboarding) {
        onCompleteOnboarding(updatedUser);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isGoogleAccount = currentUser?.google_id || (currentUser?.email && currentUser?.email.includes('@gmail.com'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          {step === 2 ? (
            <button
              onClick={() => setStep(1)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9 h-9" />
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-wide text-slate-900 uppercase">
              Step {step} of 2
            </span>
          </div>

          <div className="w-9 h-9" /> {/* Non-closeable on purpose to enforce completion */}
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {step === 1 ? (
            /* STEP 1: Account Creation & Legal Details */
            <form onSubmit={handleStep1Submit} className="space-y-6">
              
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Let’s create your account
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  This information is required to book or host.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Legal Name Section */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Legal name
                </label>
                
                <div className="rounded-2xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-slate-900 transition-all bg-white shadow-sm">
                  <div className="p-3 border-b border-slate-200">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">
                      First name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Covenant"
                      required
                      className="w-full text-sm font-semibold text-slate-900 bg-transparent focus:outline-none pt-0.5"
                    />
                  </div>
                  
                  <div className="p-3 bg-white">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">
                      Last name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Adebisi"
                      required
                      className="w-full text-sm font-semibold text-slate-900 bg-transparent focus:outline-none pt-0.5"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                  Make sure it matches the name on your government ID. If you go by another name, you can add a preferred first name.
                </p>
              </div>

              {/* Date of Birth Section */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Date of birth
                </label>
                
                <div className="relative">
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all cursor-pointer shadow-sm"
                  />
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  To sign up, you need to be at least 18. Other people who use FindDestination won't see your date of birth.
                </p>
              </div>

              {/* Email Section */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Email
                </label>
                
                <div className="p-3.5 rounded-2xl bg-slate-100/90 border border-slate-200 text-sm font-semibold text-slate-600 flex items-center gap-2 cursor-not-allowed">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{currentUser?.email || 'user@example.com'}</span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  We'll email you trip confirmations, escrow receipts and property vouchers.
                </p>
              </div>

              {/* Source Notice */}
              <p className="text-[11px] font-bold text-slate-400">
                {isGoogleAccount ? 'All pre-filled information came from Google.' : 'All pre-filled information came from registration.'}
              </p>

              {/* Marketing Opt-Out Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  FindDestination will send you promotions such as deals and marketing notifications. You can opt out anytime via account settings or within marketing emails.
                </p>

                <label className="flex items-center gap-3 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={marketingOptOut}
                    onChange={(e) => setMarketingOptOut(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    I don’t want to receive FindDestination promotions.
                  </span>
                </label>
              </div>

              {/* Next Step Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:bg-black transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Agree and continue</span>
                </button>
              </div>

            </form>
          ) : (
            /* STEP 2: Terms of Service & Community Commitment */
            <form onSubmit={handleStep2Submit} className="space-y-6 animate-in fade-in duration-200">
              
              <div className="space-y-2 text-center max-w-sm mx-auto">
                <div className="w-14 h-14 rounded-3xl bg-tafiya-blue-50 text-tafiya-blue flex items-center justify-center mx-auto shadow-sm">
                  <ShieldCheck className="w-8 h-8 stroke-[2]" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Welcome to FindDestination
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Our community commitment & Terms of Service
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Commitment Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4 text-xs text-slate-700">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-tafiya-orange fill-tafiya-orange" />
                    <span>FindDestination Community Commitment</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    FindDestination is a community built on trust, respect, and safety across Northern Nigeria.
                  </p>
                </div>

                <ul className="space-y-3 pt-1 text-slate-700 font-medium">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Treat everyone with respect:</strong> I agree to treat all members of the FindDestination community — regardless of ethnicity, state of origin, gender, or religion — with respect and without judgment or bias.</span>
                  </li>
                  
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Escrow Protection Rules:</strong> I agree to communicate and pay exclusively through the FindDestination platform to ensure escrow holding safety and property verification guarantee.</span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Accurate Property Data:</strong> I acknowledge that verified stays undergo field agent physical inspection and GPS coordinate logging within 50 meters.</span>
                  </li>
                </ul>
              </div>

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                By selecting <strong>Agree and continue</strong>, you accept the FindDestination Terms of Service, Nondiscrimination Policy, Escrow Guarantee Rules, and Privacy Policy.
              </p>

              {/* Submit Final Agreement */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-tafiya-blue to-tafiya-blue-600 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:bg-tafiya-blue-600 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-tafiya-gold" />
                  <span>{isSubmitting ? 'Finalizing Account...' : 'Agree and continue'}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
