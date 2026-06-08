/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  X, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Bell, 
  ShieldCheck, 
  CornerDownRight,
  ArrowRight
} from 'lucide-react';

interface SimulatedEmail {
  id: string;
  to: string;
  token: string;
  name: string;
  role: string;
  receivedAt: Date;
}

export default function EmailSimulator({ isDarkMode }: { isDarkMode: boolean }) {
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);
  const [showNotification, setShowNotification] = useState<SimulatedEmail | null>(null);
  const [activeEmail, setActiveEmail] = useState<SimulatedEmail | null>(null);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  
  // Password reset form states
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  useEffect(() => {
    const handleIncomingEmail = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { to, token, name, role } = customEvent.detail;
      
      const newEmail: SimulatedEmail = {
        id: `email-${Date.now()}`,
        to,
        token,
        name,
        role,
        receivedAt: new Date()
      };

      setEmails(prev => [newEmail, ...prev]);
      setShowNotification(newEmail);
      
      // Auto-hide notification banner after 6 seconds
      const timer = setTimeout(() => {
        setShowNotification(curr => curr?.id === newEmail.id ? null : curr);
      }, 6000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('kqm_received_email', handleIncomingEmail);
    return () => window.removeEventListener('kqm_received_email', handleIncomingEmail);
  }, []);

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (newPassword !== confirmPassword) {
      setResetError('পাসওয়ার্ড দুটি মিলছে না! দয়া করে একই পাসওয়ার্ড দিন।');
      return;
    }

    if (newPassword.length < 4) {
      setResetError('নিরাপত্তার স্বার্থে পাসওয়ার্ডটি কমপক্ষে ৪ সংখ্যার হতে হবে।');
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword })
      });
      const data = await res.json();

      if (data.success) {
        setResetSuccess('আপনার পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! এখন লগইন উইন্ডোতে নতুন পাসওয়ার্ড দিয়ে লগইন করতে পারবেন।');
        setNewPassword('');
        setConfirmPassword('');
        
        // Remove restored token from local email list
        setEmails(prev => prev.filter(em => em.token !== resetToken));
      } else {
        setResetError(data.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে!');
      }
    } catch (err) {
      console.error(err);
      setResetError('সার্ভারে অনাকাঙ্ক্ষিত বিভ্রাট দেখা দিয়েছে। পুনরায় ক্লিক করুন।');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      {/* 1. SLIDE-IN RECOVERY EMAIL NOTIFICATION TOAST */}
      {showNotification && (
        <div 
          onClick={() => {
            setActiveEmail(showNotification);
            setIsInboxOpen(true);
            setShowNotification(null);
          }}
          className={`fixed bottom-20 right-4 z-50 p-4 rounded-2xl border shadow-2xl flex gap-3 items-center max-w-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all animate-bounce ${
            isDarkMode ? 'bg-slate-900 border-slate-750 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}
          id="email-notification-toast"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center shrink-0 relative">
            <Mail size={22} className="animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </div>
          <div className="leading-snug">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-orange-500/20 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-md font-bold tracking-wider uppercase font-sans">নতুন ইমেইল</span>
              <span className="text-[10px] text-slate-400 font-medium">এইমাত্র</span>
            </div>
            <p className="font-extrabold text-[12px] bangla-text mt-0.5 text-slate-800 dark:text-white">কুয়াকাটা মাল্টিমিডিয়া থেকে মেইল এসেছে!</p>
            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">টু: {showNotification.to}</p>
          </div>
          <X 
            size={16} 
            className="text-slate-400 hover:text-slate-600 transition self-stretch p-0.5 shrink-0" 
            onClick={(e) => {
              e.stopPropagation();
              setShowNotification(null);
            }}
          />
        </div>
      )}

      {/* FLOATING INBOX TOGGLE BUTTON (ONLY SHOWS WHEN EMAILS ARE INBOXED) */}
      {emails.length > 0 && !isInboxOpen && (
        <button
          onClick={() => setIsInboxOpen(true)}
          className="fixed bottom-24 right-4 z-40 bg-orange-600 text-white hover:bg-orange-500 p-3.5 rounded-full shadow-2xl transition hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
          id="email-simulator-floating-btn"
          title="কুয়াকাটা মাল্টিমিডিয়া ইনবক্স"
        >
          <div className="relative">
            <Mail size={22} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white font-mono text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
              {emails.length}
            </span>
          </div>
        </button>
      )}

      {/* 2. SIMULATED EMAIL INBOX DIALOG OVERLAY */}
      {isInboxOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl border flex flex-col overflow-hidden transition-all duration-300 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`} id="email-inbox-modal">
            
            {/* Header */}
            <div className="bg-slate-950 p-4 text-white flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm bangla-text leading-none">📬 কুয়াকাটা মাল্টিমিডিয়া - সিমুলেটেড মেইল ইনবক্স</h3>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">Simulated security sandbox strictly for recovery testing</p>
                </div>
              </div>
              <button 
                onClick={() => setIsInboxOpen(false)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Split Screen Panel */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Left Column: Messages List */}
              <div className={`w-1/3 border-r overflow-y-auto flex flex-col ${
                isDarkMode ? 'border-slate-850 bg-slate-950/20' : 'border-slate-100 bg-slate-50'
              }`}>
                <div className="p-3 border-b text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  ইনবক্স (Inbounded Mails)
                </div>
                {emails.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                    <Mail size={32} className="opacity-20 mb-2" />
                    <p className="text-xs bangla-text font-bold">কোনো নতুন ইমেইল পাওয়া যায়নি!</p>
                    <p className="text-[9px] font-sans mt-0.5 max-w-44 leading-relaxed">Login screen password box click recover to send credentials check.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-850">
                    {emails.map(email => (
                      <button
                        key={email.id}
                        onClick={() => {
                          setActiveEmail(email);
                          setResetToken('');
                          setResetSuccess('');
                          setResetError('');
                        }}
                        className={`w-full p-3.5 text-left transition flex flex-col gap-1 cursor-pointer select-none ${
                          activeEmail?.id === email.id
                            ? 'bg-orange-500/10 border-l-4 border-orange-500'
                            : 'hover:bg-slate-500/5'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span className="font-mono truncate font-bold uppercase max-w-[120px]">{email.name} ({email.role})</span>
                          <span className="shrink-0">{email.receivedAt.toLocaleTimeString()}</span>
                        </div>
                        <h4 className="font-bold text-xs bangla-text line-clamp-1 text-slate-700 dark:text-slate-100">🔐 পাসওয়ার্ড পুনরুদ্ধার লিংক - কুয়াকাটা মাল্টিমিডিয়া</h4>
                        <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate mt-0.5">টু: {email.to}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Active Email Detail Screen */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col">
                {activeEmail ? (
                  <div className="flex-1 flex flex-col gap-4 max-w-2xl mx-auto w-full">
                    
                    {/* Header Detail Box */}
                    <div className={`p-4 rounded-2xl border space-y-2 ${
                      isDarkMode ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-start justify-between text-xs">
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-400">প্রেরক (From): 
                            <span className="font-bold text-orange-600 dark:text-orange-400 ml-1.5 bangla-text">কুয়াকাটা মাল্টিমিডিয়া শপ</span> 
                            <span className="text-[10px] font-mono text-slate-500">&lt;no-reply@kuakatamultimedia.com&gt;</span>
                          </p>
                          <p className="font-semibold text-slate-400">নিবন্ধিত ইমেইল (To): 
                            <span className="text-[11px] font-mono font-bold dark:text-slate-250 ml-1.5">{activeEmail.to}</span>
                          </p>
                        </div>
                        <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-850 px-2.5 py-1 rounded-lg">
                          {activeEmail.receivedAt.toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t pt-2 border-slate-200 dark:border-slate-800">
                        <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100 bangla-text">
                          বিষয়: আপনার কুয়াকাটা মাল্টিমিডিয়া পাসওয়ার্ড পুনরায় সেট করার অফিশিয়াল লিঙ্ক
                        </p>
                      </div>
                    </div>

                    {/* Rich HTML body wrapper client simulated */}
                    <div className={`flex-1 p-6 sm:p-8 rounded-3xl border text-left flex flex-col shadow-inner ${
                      isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-white border-slate-100'
                    }`}>
                      
                      {/* Multimedia Shop Header Branding */}
                      <div className="flex items-center gap-3 border-b pb-4 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-md font-sans font-bold shadow">
                          KM
                        </div>
                        <div>
                          <h2 className="font-extrabold text-base text-teal-600 dark:text-emerald-400 bangla-text leading-tight">কুয়াকাটা মাল্টিমিডিয়া</h2>
                          <p className="text-[9px] font-mono tracking-wider text-slate-400">SECURED CORE AUTHENTICATION MAILS SYSTEM</p>
                        </div>
                      </div>

                      <div className="py-6 space-y-4 text-[12px] text-slate-600 dark:text-slate-300 font-medium">
                        <p className="font-extrabold text-[13px] bangla-text text-slate-800 dark:text-white">
                          প্রিয় সম্মানিত {activeEmail.name},
                        </p>
                        <p className="bangla-text text-slate-500 dark:text-slate-400 leading-relaxed">
                          কুয়াকাটা মাল্টিমিডিয়া এ আপনার {activeEmail.role === 'admin' ? 'সুপার এডমিন' : activeEmail.role === 'seller' ? 'সেলার/ভেন্ডর' : 'গ্রাহক'} একাউন্টের পাসওয়ার্ডটি পুনরুদ্ধার করার জন্য আমরা একটি অনুরোধ পেয়েছি। আপনি নীচের "পাসওয়ার্ড রিসেট করুন" বাটনে ক্লিক করে সেকেন্ডের মধ্যে আপনার নতুন সিকিউর পাসওয়ার্ড সেট করতে পারবেন।
                        </p>

                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl leading-relaxed text-amber-500 text-[11px] bangla-text">
                          💡 <strong>নিরাপত্তা সতর্কতা:</strong> এই লিঙ্কটি আগামী ১৫ মিনিটের জন্য সক্রিয় থাকবে। আপনি যদি এই পাসওয়ার্ড পরিবর্তনের অনুরোধটি না করে থাকেন, তবে এই ইমেইলটি এড়িয়ে যান।
                        </div>

                        {/* Reset Password Callout button */}
                        <div className="pt-3 flex flex-col items-center">
                          <button
                            onClick={() => {
                              setResetToken(activeEmail.token);
                              setResetSuccess('');
                              setResetError('');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 p-3.5 px-8 rounded-2xl text-white font-extrabold text-xs transition active:scale-95 flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-emerald-500/20 font-sans"
                          >
                            <Lock size={15} />
                            <span className="bangla-text">🔐 পাসওয়ার্ড রিসেট করুন (Reset Password)</span>
                          </button>
                        </div>
                      </div>

                      <div className="border-t pt-4 border-dashed border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-400 font-sans leading-relaxed">
                        কুয়াকাটা মাল্টিমিডিয়া শপ ও সিকিউর গেটওয়ে টিম - ডিরেক্ট কোস্টাল ই-শপ।
                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-8">
                    <Mail size={44} className="opacity-15 mb-2.5 animate-bounce" />
                    <h3 className="font-extrabold text-sm bangla-text text-slate-700 dark:text-slate-300">ইমেইলটি সিলেক্ট করুন</h3>
                    <p className="text-[10px] font-sans text-slate-400 max-w-sm mt-1">Select an incoming email from the sidebar menu to view credentials summary or reset passcode.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 3. SIMULATED RESET PASSWORD MODAL CONTAINER */}
      {resetToken && (
        <div className="fixed inset-0 bg-transparent/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl shadow-2xl border p-6 flex flex-col relative transition-all overflow-hidden ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`} id="reset-password-dialog-form">
            
            <button 
              onClick={() => setResetToken('')}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center mb-5 mt-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2.5">
                <Lock size={24} />
              </div>
              <h3 className="font-extrabold text-base bangla-text text-slate-800 dark:text-slate-100 leading-snug">🔒 নতুন পাসওয়ার্ড সেট করুন</h3>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">Please provide a password (minimum 4 digits)</p>
            </div>

            {resetSuccess ? (
              <div className="space-y-4 py-4 text-center">
                <div className="flex justify-center text-emerald-600 mb-2">
                  <CheckCircle2 size={48} className="animate-pulse" />
                </div>
                <p className="font-bold text-[12px] bangla-text text-emerald-600 leading-relaxed bg-emerald-55/10 p-4 border border-emerald-500/20 rounded-2xl">
                  {resetSuccess}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setResetToken('')}
                    className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold font-sans text-xs py-2.5 rounded-xl transition shadow-md"
                  >
                    Alright, Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs font-semibold">
                
                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-bold text-slate-400 bangla-text">নতুন পাসওয়ার্ড লিখুন * :</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-750' : 'bg-slate-50 border-slate-200'
                    }`}
                    placeholder="কমপক্ষে ৪ সংখ্যার পাসওয়ার্ড দিন"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-bold text-slate-400 bangla-text">নতুন পাসওয়ার্ডটি আবার লিখুন * :</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-750' : 'bg-slate-50 border-slate-200'
                    }`}
                    placeholder="আবার টাইপ করুন"
                  />
                </div>

                {resetError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] rounded-xl bangla-text transition leading-tight">
                    🚨 {resetError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetLoading || !newPassword || !confirmPassword}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-45 text-white font-sans font-extrabold py-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  {resetLoading ? 'সেভ করা হচ্ছে...' : 'পাসওয়ার্ড রি-সেট নিশ্চিত করুন 🔑'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
}
