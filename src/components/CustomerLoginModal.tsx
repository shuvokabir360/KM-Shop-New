/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Phone, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldAlert, 
  Mail,
  UserCheck,
  Store,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface CustomerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onLoginSuccess: (user: { id: string; name: string; phone: string; email?: string; role?: 'customer' | 'seller' | 'admin' }) => void;
}

export default function CustomerLoginModal({
  isOpen,
  onClose,
  isDarkMode,
  onLoginSuccess
}: CustomerLoginModalProps) {
  const [step, setStep] = useState<'identifier' | 'password' | 'register'>('identifier');
  
  // States
  const [identifier, setIdentifier] = useState(''); // can be email or phone
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'seller' | 'admin'>('customer');
  
  const [existsCheck, setExistsCheck] = useState({ exists: false, hasPassword: false, name: '', role: 'customer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setStep('identifier');
    setIdentifier('');
    setName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRole('customer');
    setError('');
  };

  // Helper to validate identifier type.
  const isEmailFormat = (str: string) => str.includes('@');

  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedInput = identifier.trim();
    if (!trimmedInput) {
      setError('ইমেইল অথবা মোবাইল নম্বর প্রদান করুন!');
      return;
    }

    // Direct validation checks
    if (isEmailFormat(trimmedInput)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedInput)) {
        setError('দয়া করে সঠিক ইমেইল এড্রেস টাইপ করুন (যেমন: name@example.com)');
        return;
      }
    } else {
      // Clean phone number format validation
      const bndPhone = trimmedInput.replace(/\D/g, '');
      const phoneRegex = /^01[3-9]\d{8}$/;
      if (!phoneRegex.test(bndPhone)) {
        setError('১১ ডিজিটের সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX) অথবা ইমেইল দিন।');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: trimmedInput })
      });
      const data = await res.json();

      if (data.success) {
        setExistsCheck({
          exists: data.exists,
          hasPassword: data.hasPassword,
          name: data.name,
          role: data.role
        });

        if (data.exists && data.hasPassword) {
          // Go to password login
          setStep('password');
        } else {
          // Setup registration
          setName(data.name || '');
          if (isEmailFormat(trimmedInput)) {
            setEmail(trimmedInput);
            setPhone('');
          } else {
            setPhone(trimmedInput);
            setEmail('');
          }
          setStep('register');
        }
      } else {
        setError(data.error || 'অ্যাকাউন্ট ভেরিফিকেশন করার সময় ত্রুটি হয়েছে!');
      }
    } catch (err) {
      setError('সার্ভারে যোগাযোগ করা যায়নি, ইন্টারনেট বা নেটওয়ার্ক চেক করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('পাসওয়ার্ড প্রদান করুন!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password })
      });
      const data = await res.json();

      if (data.success) {
        // Redirection checks for admin first-login settings tab redirect
        if (data.isFirstLogin) {
          localStorage.setItem('kqm_admin_first_login', 'yes');
        }
        
        onLoginSuccess(data.user);
        onClose();
        resetForm();
      } else {
        setError(data.error || 'ভুল বা অসঙ্গতিপূর্ণ পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিন।');
      }
    } catch (err) {
      setError('সার্ভারের সাথে যোগাযোগের সময় ত্রুটি হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('দয়া করে আপনার সম্পূর্ণ নাম দিন!');
      return;
    }

    if (!phone.trim() && !email.trim()) {
      setError('নিবন্ধনের জন্য একটি মোবাইল নম্বর অথবা ইমেইল এড্রেস টাইপ করুন।');
      return;
    }

    // Simple fields validation
    if (phone.trim()) {
      const cleanP = phone.replace(/\D/g, '');
      const phoneRegex = /^01[3-9]\d{8}$/;
      if (!phoneRegex.test(cleanP)) {
        setError('১১ ডিজিটের সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
        return;
      }
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('সঠিক ইমেইল এড্রেস টাইপ করুন (যেমন: example@gmail.com)');
        return;
      }
    }

    if (password.length < 4) {
      setError('পাসওয়ার্ডটি অন্তত ৪ সংখ্যার বা অক্ষরের হতে হবে!');
      return;
    }

    if (password !== confirmPassword) {
      setError('দুইটি পাসওয়ার্ড মিলছে না! পুনরায় চেক করুন।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password,
          role
        })
      });
      const data = await res.json();

      if (data.success) {
        onLoginSuccess(data.user);
        onClose();
        resetForm();
      } else {
        setError(data.error || 'নতুন অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      setError('সার্ভারে যোগাযোগ ব্যাহত হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'admin':
        return { label: '👑 সুপার এডমিন', class: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
      case 'seller':
        return { label: '🏪 সেলার/বিক্রেতা', class: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
      default:
        return { label: '🛍️ সাধারণ গ্রাহক', class: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-3xl shadow-2xl flex flex-col border transition-all duration-300 overflow-hidden ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Unified Premium Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Lock className="text-amber-300 animate-pulse" size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold bangla-text">সমন্বিত সাইন-ইন ও অ্যাক্সেস পোর্টাল</h3>
              <p className="text-[9px] opacity-75 font-mono uppercase tracking-widest">Unified Authentication Core</p>
            </div>
          </div>
          <button 
            id="close-login-modal"
            onClick={() => { onClose(); resetForm(); }}
            className="p-1 px-2.5 rounded-full hover:bg-white/10 text-white font-mono font-bold"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-xl flex items-start gap-2 animate-pulse">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <p className="bangla-text text-[11px] leading-relaxed font-semibold">{error}</p>
            </div>
          )}

          {/* STEP 1: ENTER EMAIL OR PHONE */}
          {step === 'identifier' && (
            <form onSubmit={handleIdentifierSubmit} className="space-y-4">
              <div className="text-center space-y-1.5 pb-2">
                <div className="mx-auto w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Sparkles size={20} />
                </div>
                <h4 className="text-[14px] bangla-text font-bold text-slate-800 dark:text-slate-100">
                  গ্রাহক, সেলার ও এডমিনদের জন্য একটিই লগইন প্যানেল
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 bangla-text tracking-wide leading-relaxed">
                  আপনার পূর্বে কেনাকাটা করা কাস্টমার অ্যাকাউন্ট, সেলার ভেন্ডর মেম্বারশিপ অথবা এডমিন ক্রেডেনশিয়াল ব্যবহার করে এখানে সাইন-ইন করতে পারবেন।
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-400 bangla-text select-none">
                  ইমেইল এড্রেস অথবা ১১ ডিজিটের মোবাইল নম্বর *
                </label>
                <div className="relative">
                  <input
                    id="unified-identifier-input"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className={`w-full p-2.5 pl-10 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-750 text-slate-100' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 font-bold'
                    }`}
                    placeholder="example@gmail.com অথবা 017XXXXXXXX"
                  />
                  <User className="absolute left-3.5 top-3 text-slate-400" size={15} />
                </div>
                <p className="text-[9px] text-slate-400 font-sans tracking-wide">
                  পদ্ধতি: স্বয়ংক্রিয়ভাবে টাইপ করা টেক্সট ডিটেক্ট করে নতুন বা পুরাতন ইউজার নির্ধারণ করা হবে।
                </p>
              </div>

              <button
                id="unified-identifier-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-xs disabled:opacity-50"
              >
                {loading ? (
                  <span className="bangla-text">অ্যাকাউন্ট বিশ্লেষণ করা হচ্ছে...</span>
                ) : (
                  <>
                    <span className="bangla-text">পরবর্তী ধাপে যান</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY PASSWORD */}
          {step === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="bg-emerald-500/5 rounded-2xl p-3 border border-emerald-500/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-600 shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="leading-snug">
                    <p className="text-[12px] bangla-text font-extrabold text-emerald-600 dark:text-emerald-400">নিবন্ধিত অ্যাকাউন্ট পাওয়া গেছে!</p>
                    <p className="text-[10px] font-mono text-slate-400 tracking-wider font-bold">{identifier}</p>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full border text-[10px] font-extrabold font-sans leading-none ${getRoleBadge(existsCheck.role).class}`}>
                  {getRoleBadge(existsCheck.role).label}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-baseline mb-1">
                  <label className="block text-[11px] font-bold text-slate-400 bangla-text">আপনার পাসওয়ার্ড দিন *</label>
                  <button 
                    type="button" 
                    onClick={() => setStep('identifier')} 
                    className="text-[10px] text-emerald-500 hover:underline bangla-text font-bold"
                  >
                    ভুল হয়েছে? পরিবর্তন করুন
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="unified-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full p-2.5 pl-10 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs ${
                      isDarkMode ? 'bg-slate-950 border-slate-750 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="আপনার একাউন্টের পাসওয়ার্ড লিখুন"
                  />
                  <Lock className="absolute left-3.5 top-3 text-slate-400" size={15} />
                </div>
              </div>

              <button
                id="unified-login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-extrabold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-xs disabled:opacity-50"
              >
                {loading ? (
                  <span className="bangla-text">প্রমাণীকরণ করা হচ্ছে...</span>
                ) : (
                  <span className="bangla-text">সিকিউর লগইন করুন 🔑</span>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: UNIFIED REGISTRATION */}
          {step === 'register' && (
            <form onSubmit={handleRegistrationSubmit} className="space-y-3">
              <div className="bg-amber-500/5 rounded-2xl p-3 border border-amber-500/10 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <h5 className="text-[12px] bangla-text font-bold text-amber-600">
                    নতুন অ্যাকাউন্টের নিবন্ধন ফরম!
                  </h5>
                  <p className="text-[10px] text-slate-400 bangla-text">
                    আপনার প্রদত্ত ইনপুটটি দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে নিচে আপনার সঠিক বিবরণ দিয়ে অ্যাকাউন্টটি রেজিস্টার করে ফেলুন।
                  </p>
                </div>
              </div>

              {/* Role Selection Tabs */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-400 bangla-text select-none">
                  কাঙ্ক্ষিত অ্যাকাউন্টের ধরন (Account Role) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`p-2 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1.5 transition ${
                      role === 'customer'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <UserCheck size={16} />
                    <span className="bangla-text">🛍️ কাস্টমার</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('seller')}
                    className={`p-2 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1.5 transition ${
                      role === 'seller'
                        ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 shadow-sm'
                        : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Store size={16} />
                    <span className="bangla-text">🏪 সেলার/ভেন্ডর</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-2 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1.5 transition ${
                      role === 'admin'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-sm'
                        : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <ShieldCheck size={16} />
                    <span className="bangla-text">👑 এডমিন</span>
                  </button>
                </div>
              </div>

              {/* Name field */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-400 bangla-text">সম্পূর্ণ নাম *</label>
                <div className="relative">
                  <input
                    id="unified-reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full p-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs ${
                      isDarkMode ? 'bg-slate-950 border-slate-750 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                    placeholder="আবরার ফুয়াদ"
                  />
                  <User className="absolute left-3 top-2.5 text-slate-400" size={14} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Mobile field */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 bangla-text">মোবাইল নম্বর</label>
                  <div className="relative">
                    <input
                      id="unified-reg-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className={`w-full p-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono font-semibold ${
                        isDarkMode ? 'bg-slate-950 border-slate-750 text-slate-100' : 'bg-slate-50 border-slate-200'
                      }`}
                      placeholder="017XXXXXXXX"
                    />
                    <Phone className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  </div>
                </div>

                {/* Email field */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 bangla-text">ইমেইল এড্রেস</label>
                  <div className="relative">
                    <input
                      id="unified-reg-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full p-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono font-semibold ${
                        isDarkMode ? 'bg-slate-950 border-slate-750 text-slate-100' : 'bg-slate-50 border-slate-200'
                      }`}
                      placeholder="name@example.com"
                    />
                    <Mail className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Password input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 bangla-text">নতুন পাসওয়ার্ড *</label>
                  <div className="relative">
                    <input
                      id="unified-reg-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full p-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs ${
                        isDarkMode ? 'bg-slate-950 border-slate-750 text-slate-100' : 'bg-slate-50 border-slate-200'
                      }`}
                      placeholder="কমপক্ষে ৪ ডিজিট"
                    />
                    <Lock className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 bangla-text">নিশ্চিত করুন *</label>
                  <div className="relative">
                    <input
                      id="unified-reg-confirm"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full p-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs ${
                        isDarkMode ? 'bg-slate-950 border-slate-750 text-slate-100' : 'bg-slate-50 border-slate-200'
                      }`}
                      placeholder="পুনরায় টাইপ করুন"
                    />
                    <Lock className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  </div>
                </div>
              </div>

              <button
                id="unified-register-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-extrabold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-xs disabled:opacity-50"
              >
                {loading ? (
                  <span className="bangla-text">তথ্য সংরক্ষণ করা হচ্ছে...</span>
                ) : (
                  <span className="bangla-text">একাউন্ট তৈরি ও লগইন করুন 🚀</span>
                )}
              </button>

              <div className="text-center pt-1">
                <button 
                  type="button" 
                  onClick={() => setStep('identifier')} 
                  className="text-[10px] text-slate-500 hover:underline bangla-text font-bold"
                >
                  অন্য ইমেইল/নম্বর ব্যবহার করতে ফিরে যান
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
