/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, MapPin, Truck, ShieldCheck, CheckCircle2, Clock, AlertTriangle, X } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function OrderTracker({ isOpen, onClose, isDarkMode }: OrderTrackerProps) {
  const [searchId, setSearchId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setErrorMsg('');
    setTrackedOrder(null);
    setIsSearching(true);

    try {
      const res = await fetch(`/api/orders/${searchId.trim()}`);
      const data = await res.json();
      
      if (data.success) {
        setTrackedOrder(data.data);
      } else {
        setErrorMsg(data.error || 'অর্ডারটি খুঁজে পাওয়া যায়নি। অনুগ্রহ করে আইডি যাচাই করে আবার চেষ্টা করুন।');
      }
    } catch (err) {
      setErrorMsg('সার্ভারের সাথে সংযোগ স্থাপন করা যাচ্ছে না। আপনার অফলাইন অর্ডার ডাটা চেক করুন।');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col border transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center">
              <Truck className="text-amber-300" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold bangla-text">অর্ডার ট্র্যাকিং সিস্টেম</h2>
              <p className="text-[10px] font-mono opacity-80 uppercase tracking-widest">Kuakata Multimedia Express Track</p>
            </div>
          </div>
          <button 
            id="close-tracker-dialog"
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/10 transition text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tracking Search Input Form */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <form id="track-order-form" onSubmit={handleTrack} className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="tracker-order-id-input"
                type="text"
                placeholder="আপনার অর্ডার আইডি লিখুন (যেমন: KQM-98432)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className={`w-full py-3 pl-10 pr-4 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-100' 
                    : 'bg-white border-slate-200 text-slate-850'
                }`}
              />
              <Search className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
            </div>
            <button
              id="tracker-search-btn"
              type="submit"
              disabled={isSearching}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold font-sans text-xs px-6 py-3 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {isSearching ? 'খোঁজা হচ্ছে...' : 'ট্র্যাক করুন'}
            </button>
          </form>

          {/* Dummy quick copy items */}
          <div className="mt-3 flex flex-wrap gap-2 items-center text-xs text-slate-500">
            <span className="bangla-text">ডিমো আইডি ক্লিক করে ট্রাই করুন:</span>
            <button 
              id="demo-track-p1"
              type="button" 
              onClick={() => { setSearchId('KQM-98432'); }} 
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-mono rounded hover:bg-emerald-500/10"
            >
              KQM-98432 (ডেলিভারড)
            </button>
            <button 
              id="demo-track-p2"
              type="button" 
              onClick={() => { setSearchId('KQM-10254'); }} 
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-mono rounded hover:bg-emerald-500/10"
            >
              KQM-10254 (অন-ট্র্যাক কুরিয়ার)
            </button>
          </div>
        </div>

        {/* Display tracking information */}
        <div className="p-6 flex-1 space-y-6">
          {errorMsg && (
            <div className="bg-rose-500/10 text-rose-600 dark:text-rose-450 p-4 rounded-2xl flex items-start gap-3 border border-rose-500/10 text-xs sm:text-sm">
              <AlertTriangle className="shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold bangla-text mb-0.5">অর্ডার ট্র্যাক করা সম্ভব হয়নি</p>
                <p className="bangla-text">{errorMsg}</p>
              </div>
            </div>
          )}

          {trackedOrder ? (
            <div className="space-y-6 animate-fade-in text-xs sm:text-xs">
              
              {/* Order High Level Meta */}
              <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-emerald-50/20 border-emerald-100'
              }`}>
                <div>
                  <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">EXPRESS WATERPROOF COURIER</p>
                  <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">ID: {trackedOrder.id}</h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">বুকিং তারিখ: {new Date(trackedOrder.createdAt).toLocaleString('bn')}</p>
                </div>
                
                <div className="space-y-1.5 md:text-right">
                  <div className="flex items-center md:justify-end gap-1.5">
                    <Clock size={15} className="text-amber-500 animate-spin-slow" />
                    <span className="font-semibold text-xs text-slate-650 dark:text-slate-350 bangla-text">আনুমানিক ডেলিভারি সময়:</span>
                  </div>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 bangla-text">
                    {new Date(trackedOrder.estimatedDelivery).toLocaleString('bn')}
                  </p>
                  <p className="text-[10px] bg-emerald-500/10 text-emerald-600 font-mono px-2 py-0.5 rounded inline-block">
                    {trackedOrder.deliveryType === 'express' ? 'ফাস্ট-ট্র্যাক এক্সপ্রেস কোল্ড চেইন' : 'স্ট্যান্ডার্ড সুরক্ষিত কুরিয়ার'}
                  </p>
                </div>
              </div>

              {/* Progress Timeline Tracker Visual */}
              <div className="py-2.5">
                <h4 className="font-bold text-sm mb-6 bangla-text">ডেলিভারি টাইমলাইন এবং ধাপ</h4>
                
                <div className="relative">
                  {/* Track bar background */}
                  <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 hidden sm:block"></div>
                  
                  {/* Active track bar overlay */}
                  <div 
                    className="absolute top-1/2 left-8 h-1 bg-emerald-600 -translate-y-1/2 z-0 hidden sm:block transition-all duration-500"
                    style={{ width: `${(getStatusStepIndex(trackedOrder.status) / 3) * 85 + 5}%` }}
                  ></div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative z-10">
                    
                    {/* Step 1: Received */}
                    <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                        getStatusStepIndex(trackedOrder.status) >= 0
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-slate-100 border-slate-300 text-slate-400'
                      }`}>
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-xs sm:text-xs bangla-text">অর্ডার সাকসেস</p>
                        <p className="text-[10px] text-slate-500 font-sans">পেমেন্ট ভেরিফাইড</p>
                      </div>
                    </div>

                    {/* Step 2: Processing (Cold packaging) */}
                    <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                        getStatusStepIndex(trackedOrder.status) >= 1
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : isDarkMode
                            ? 'bg-slate-800 border-slate-700 text-slate-550'
                            : 'bg-slate-100 border-slate-300 text-slate-400'
                      }`}>
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-xs sm:text-xs bangla-text">প্রস্তুতকরণ ঘর</p>
                        <p className="text-[10px] text-slate-500 font-sans">বিশেষ আইস-বক্স প্রসেস</p>
                      </div>
                    </div>

                    {/* Step 3: Dispatched */}
                    <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                        getStatusStepIndex(trackedOrder.status) >= 2
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : isDarkMode
                            ? 'bg-slate-800 border-slate-700 text-slate-550'
                            : 'bg-slate-100 border-slate-300 text-slate-400'
                      }`}>
                        <Truck size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-xs sm:text-xs bangla-text">স্থানান্তর কুরিয়ার</p>
                        <p className="text-[10px] text-slate-500 font-sans">ট্রান্সপোর্ট পথে চলমান</p>
                      </div>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                        getStatusStepIndex(trackedOrder.status) === 3
                          ? 'bg-emerald-600 border-emerald-600 text-white animate-pulse'
                          : isDarkMode
                            ? 'bg-slate-800 border-slate-700 text-slate-550'
                            : 'bg-slate-100 border-slate-300 text-slate-400'
                      }`}>
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-xs sm:text-xs bangla-text">ডেলিভারড</p>
                        <p className="text-[10px] text-slate-500 font-sans">হস্তান্তর সম্পন্ন করা হয়েছে</p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Order Invoice Details summary */}
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-800/40 border-slate-750' : 'bg-slate-50/50 border-slate-100'
              }`}>
                <h4 className="font-bold text-sm border-b pb-2 mb-3 bangla-text text-emerald-600">ক্রেতা ও পণ্যের বিবরণ</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-xs">
                    <p className="bangla-text"><span className="opacity-60">ক্রেতার নাম:</span> {trackedOrder.customerName}</p>
                    <p className="bangla-text"><span className="opacity-60">মোবাইল নম্বর:</span> {trackedOrder.customerPhone}</p>
                    <p className="bangla-text"><span className="opacity-60">ঠিকানা:</span> {trackedOrder.shippingAddress}</p>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p className="bangla-text"><span className="opacity-60">পেমেন্ট মাধ্যম:</span> {trackedOrder.paymentMethod.toUpperCase()}</p>
                    <p className="bangla-text">
                      <span className="opacity-60">পেমেন্ট স্ট্যাটাস:</span> 
                      <span className={`ml-1.5 font-bold font-mono px-2 py-0.5 rounded text-[10px] ${
                        trackedOrder.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>{trackedOrder.paymentStatus.toUpperCase()}</span>
                    </p>
                    <p className="bangla-text font-bold"><span className="opacity-60 font-medium">মোট বিল:</span> ৳ {trackedOrder.totalAmount}</p>
                  </div>
                </div>

                <div className="mt-4 border-t pt-3">
                  <p className="text-xs font-semibold mb-2 bangla-text">ক্রয়কৃত পণ্যসমূহ:</p>
                  <ul className="space-y-1 text-xs">
                    {trackedOrder.items.map((item, id) => (
                      <li key={id} className="flex justify-between items-center text-slate-650 dark:text-slate-350 bg-slate-100/50 dark:bg-slate-900/50 p-2 rounded-lg">
                        <span className="bangla-text">{item.productName} ({item.quantity} টি)</span>
                        <span className="font-mono">৳ {item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-10 space-y-3 opacity-60">
              <MapPin size={48} className="mx-auto text-emerald-600 animate-bounce" />
              <p className="text-xs sm:text-sm bangla-text">সবুজ কুয়াকাটা এক্সপ্রেস ডাটাবেজে আপনার অর্ডার ট্র্যাক করুন।</p>
              <p className="text-xs bangla-text text-amber-500">অনলাইন পেমেন্ট গেটওয়ের বুকিং আইডি দিয়ে চেক করতে পারেন।</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
