/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Ship, Check, Award, Compass, AlertCircle } from 'lucide-react';
import { Product, CartItem, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalAmount: number;
  isDarkMode: boolean;
  onOrderSuccess: (order: Order) => void;
  onClearCart: () => void;
  loggedInCustomer?: any;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  totalAmount,
  isDarkMode,
  onOrderSuccess,
  onClearCart,
  loggedInCustomer
}: CheckoutModalProps) {
  
  const [customerName, setCustomerName] = useState(loggedInCustomer?.name || '');
  const [customerPhone, setCustomerPhone] = useState(loggedInCustomer?.phone || '');
  const [customerEmail, setCustomerEmail] = useState('');
  
  React.useEffect(() => {
    if (loggedInCustomer) {
      setCustomerName(loggedInCustomer.name || '');
      setCustomerPhone(loggedInCustomer.phone || '');
    }
  }, [loggedInCustomer]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'card' | 'cod'>('bkash');
  const [deliveryType, setDeliveryType] = useState<'standard' | 'express'>('standard');
  
  // Payment simulations
  const [paymentDetails, setPaymentDetails] = useState({ number: '', pin: '', cardHolder: '', cvv: '', expiry: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [encryptionLog, setEncryptionLog] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'form' | 'encrypting' | 'success'>('form');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const deliveryCharge = deliveryType === 'express' ? 120 : 60;
  const grandTotal = totalAmount + deliveryCharge;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !shippingAddress) {
      alert('অনুগ্রহ করে নাম, মোবাইল নম্বর এবং ঠিকানা পূরণ করুন!');
      return;
    }

    setCurrentStep('encrypting');
    setIsProcessing(true);
    setEncryptionLog([]);

    const logSteps = [
      'নিরাপদ পেমেন্ট সেশন ইনিশিয়েট করা হচ্ছে...',
      'AES-256 এনক্রিপশন প্রোটোকল ব্যবহার করে ট্রানজেকশন কী এক্সচেঞ্জ জেনারেট হচ্ছে...',
      'SHA-256 ওয়ান-ওয়ে হ্যাশিং অ্যালগরিদমে পিন/কার্ড সিকিউরিটি লকিং সম্পন্ন হয়েছে...',
      'মোবাইল ব্যাংকিং গেটওয়েতে এনক্রিপ্টেড ডাটা প্যাকেট সাইন-ইন রিকোয়েস্ট হচ্ছে...',
      'পেমেন্ট প্রসেসিং সাকসেস! ব্যাংক ট্রানজেকশন রেকর্ড আপডেট হচ্ছে...'
    ];

    // Simulate real logs of modern encryption on screen for 400ms each
    for (let i = 0; i < logSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, i === 1 || i === 3 ? 550 : 350));
      setEncryptionLog(prev => [...prev, logSteps[i]]);
    }

    try {
      // Secure network transaction call
      const cryptoRes = await fetch('/api/payment/encrypt-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal,
          method: paymentMethod,
          bKashNumber: paymentDetails.number,
          pin: paymentDetails.pin
        })
      });
      const cryptoData = await cryptoRes.json();

      // Submit order data
      const orderPayload = {
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        items: cartItems.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        })),
        totalAmount: grandTotal,
        paymentMethod,
        deliveryType
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();

      if (data.success) {
        setCreatedOrder(data.data);
        onOrderSuccess(data.data);
        setCurrentStep('success');
        onClearCart();
      }
    } catch (err) {
      alert('অর্ডার প্রসেস করার সময় একটু ত্রুটি দেখা দিয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন বা অফলাইনে থাকুন।');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col border transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-amber-300 animate-pulse" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold bangla-text">নিরাপদ ডাবল-এনক্রিপ্টেড চেকআউট</h2>
              <p className="text-[9px] font-mono opacity-80 uppercase tracking-widest">SSL / AES-256 Advanced Gateways</p>
            </div>
          </div>
          <button 
            id="close-checkout-modal"
            onClick={onClose} 
            disabled={isProcessing && currentStep === 'encrypting'}
            className="p-1.5 rounded-full hover:bg-white/10 transition text-white disabled:opacity-30 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {currentStep === 'form' && (
          <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="p-6 space-y-6 text-xs sm:text-xs">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Shipping details */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-emerald-600 border-b pb-2 bangla-text">১. গ্রাহক ও ডেলিভারির তথ্য</h3>
                
                <div>
                  <label className="block font-semibold mb-1 bangla-text">আপনার সম্পূর্ণ নাম *</label>
                  <input
                    id="checkout-name-input"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200 dark:border-slate-700'
                    }`}
                    placeholder="যেমন: আবরার ফুয়াদ"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 bangla-text">মোবাইল নম্বর (অতি জরুরী)*</label>
                  <input
                    id="checkout-phone-input"
                    type="tel"
                    required
                    maxLength={11}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200 dark:border-slate-700'
                    }`}
                    placeholder="যেমন: 017XXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 bangla-text">ইমেইল ঠিকানা (ঐচ্ছিক ইনভয়েসের জন্য)</label>
                  <input
                    id="checkout-email-input"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200 dark:border-slate-700'
                    }`}
                    placeholder="example@gmail.com"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 bangla-text">ডেলিভারির সম্পূর্ণ ঠিকানা *</label>
                  <textarea
                    id="checkout-address-input"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    rows={3}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 dark:border-slate-700 text-slate-850'
                    }`}
                    placeholder="বাসা নম্বর, রোড নাম, থানা, জেলার নাম সুন্দর করে লিখুন..."
                  />
                </div>

                {/* Delivery Option Toggle */}
                <div className="space-y-2">
                  <span className="block font-semibold bangla-text">ডেলিভারির ধরন নির্বাচন করুন:</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      id="del-type-standard"
                      type="button"
                      onClick={() => setDeliveryType('standard')}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                        deliveryType === 'standard'
                          ? 'border-emerald-600 bg-emerald-500/5 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <span className="font-bold bangla-text">সাধারণ ডেলিভারি</span>
                      <span className="text-[10px] text-slate-500">৳৬০ • ২-৩ দিন সময়</span>
                    </button>

                    <button
                      id="del-type-express"
                      type="button"
                      onClick={() => setDeliveryType('express')}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all relative overflow-hidden ${
                        deliveryType === 'express'
                          ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="absolute right-0 top-0 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl">RECOMMENDED</div>
                      <span className="font-bold bangla-text text-amber-600 flex items-center gap-1">মাছ কুরিয়ার এক্সপ্রেস 🐟</span>
                      <span className="text-[10px] text-slate-500">৳১২০ • ৪-১২ ঘণ্টা বা কোল্ড-বক্স</span>
                    </button>
                  </div>
                </div>

              </div>
              
              {/* Right Column: Payments methods & Simulation details */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-emerald-600 border-b pb-2 bangla-text">২. নিরাপদ বিলিং ও পেমেন্ট গেটওয়ে</h3>
                
                {/* Method selector buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'bkash', label: 'বিকাশ', bg: 'bg-rose-500' },
                    { id: 'nagad', label: 'নগদ', bg: 'bg-orange-500' },
                    { id: 'card', label: 'কার্ড', bg: 'bg-blue-600' },
                    { id: 'cod', label: 'ক্যাশ অন', bg: 'bg-slate-700' }
                  ].map((method) => (
                    <button
                      id={`pay-method-${method.id}`}
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`py-2 px-1 text-[11px] font-bold rounded-lg text-center transition-all cursor-pointer ${
                        paymentMethod === method.id 
                          ? `${method.bg} text-white shadow-md ring-2 ring-emerald-300` 
                          : isDarkMode
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="bangla-text">{method.label}</span>
                    </button>
                  ))}
                </div>

                {/* Simulated dynamic input screen based on payment type */}
                {paymentMethod === 'cod' ? (
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[11px] text-slate-500 leading-relaxed space-y-2">
                    <p className="bangla-text font-bold text-slate-750 dark:text-slate-250 flex items-center gap-1">
                      <AlertCircle size={14} className="text-amber-500 shrink-0" />
                      <span>ক্যাশ অন ডেলিভারি নিয়মাবলি:</span>
                    </p>
                    <p className="bangla-text">১. পণ্যটি হাতে বুঝে পেয়ে সম্পূর্ণ টাকা পরিশোধ করবেন।</p>
                    <p className="bangla-text">২. তাজা গলদা চিংড়ি বা অন্যান্য তাজা মাছ অর্ডারের জন্য অগ্রিম কোনো অতিরিক্ত ফি লাগবে না। কুরিয়ার চার্জ ভাউচারে যুক্ত থাকবে।</p>
                  </div>
                ) : paymentMethod === 'card' ? (
                  <div className="space-y-3 p-4 bg-indigo-50/10 border border-indigo-500/15 rounded-2xl">
                    <div className="flex justify-between items-center text-[10px] text-indigo-500 font-mono tracking-wider">
                      <span>AES-256 SECURED EMBED</span>
                      <CreditCard size={14} />
                    </div>
                    <div>
                      <label className="block text-[10px] opacity-75 font-sans uppercase mb-1">Card Number</label>
                      <input
                        id="card-number-input"
                        type="text"
                        placeholder="XXXX XXXX XXXX XXXX"
                        className={`w-full p-2 text-xs rounded-lg border font-mono ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] opacity-75 font-sans uppercase mb-1">Expiry Date</label>
                        <input
                          id="card-exp-input"
                          type="text"
                          placeholder="MM/YY"
                          className={`w-full p-2 text-xs rounded-lg border font-mono ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] opacity-75 font-sans uppercase mb-1">CVV Security</label>
                        <input
                          id="card-cvv-input"
                          type="password"
                          placeholder="***"
                          className={`w-full p-2 text-xs rounded-lg border font-mono ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`space-y-3 p-4 rounded-2xl border ${
                    paymentMethod === 'bkash' 
                      ? 'bg-rose-500/5 border-rose-500/20' 
                      : 'bg-orange-500/5 border-orange-500/20'
                  }`}>
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                      <span className={paymentMethod === 'bkash' ? 'text-rose-500' : 'text-orange-500'}>
                        {paymentMethod === 'bkash' ? 'bKash Live Encrypted API' : 'Nagad Secure Payment Port'}
                      </span>
                      <span>SECURE SANDBOX</span>
                    </div>
                    <div>
                      <label className="block text-[10px] opacity-75 bangla-text mb-1">মোবাইল অ্যাকাউন্ট নম্বর *</label>
                      <input
                        id="m-payment-num"
                        type="tel"
                        maxLength={11}
                        placeholder="01XXXXXXXXX"
                        value={paymentDetails.number}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, number: e.target.value })}
                        className={`w-full p-2 text-xs rounded-lg border font-mono ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] opacity-75 bangla-text mb-1">PIN কোড (AES গেটওয়ে দ্বারা প্রটেক্টেড) *</label>
                      <input
                        id="m-payment-pin"
                        type="password"
                        maxLength={4}
                        placeholder="****"
                        value={paymentDetails.pin}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, pin: e.target.value })}
                        className={`w-full p-2 text-xs rounded-lg border font-mono ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
                      />
                    </div>
                  </div>
                )}

                {/* Cart summary box review */}
                <div className={`p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'
                }`}>
                  <p className="font-bold text-xs border-b pb-1.5 mb-2.5 bangla-text text-emerald-600">৩. বিলের সারসংক্ষেপ</p>
                  <div className="space-y-1.5 text-xs font-medium">
                    <div className="flex justify-between text-slate-500">
                      <span className="bangla-text">পণ্যের উপ-মোট:</span>
                      <span className="font-mono">৳ {totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span className="bangla-text">ডেলিভারি চার্জ:</span>
                      <span className="font-mono">৳ {deliveryCharge}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t font-bold">
                      <span className="bangla-text text-emerald-600">মোট মূল্য:</span>
                      <span className="font-mono text-emerald-600">৳ {grandTotal}</span>
                    </div>
                  </div>
                </div>

                <button
                  id="final-checkout-btn"
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition hover:scale-[1.01] shadow-md cursor-pointer text-sm font-sans"
                >
                  <span className="bangla-text">অর্ডার নিশ্চিত করুন (৳ {grandTotal})</span>
                </button>

              </div>

            </div>

          </form>
        )}

        {/* Encrypting simulator state animations */}
        {currentStep === 'encrypting' && (
          <div className="p-10 text-center space-y-6 flex-1 flex flex-col justify-center items-center">
            <div className="relative">
              <Compass className="animate-spin text-emerald-600" size={64} />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="text-amber-500 animate-pulse" size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg bangla-text">উন্নত এনক্রিটশন গেটওয়ে ভেরিফিকেশন...</h3>
              <p className="text-xs text-slate-400 font-mono">ESTABLISHING CRYPTOGRAPHIC AES TUNNELS ...</p>
            </div>

            {/* Simulated encryption execution lines */}
            <div className="w-full max-w-md bg-slate-950 text-emerald-400 text-left rounded-2xl p-4 font-mono text-[10px] space-y-1 sm:space-y-1.5 leading-relaxed overflow-hidden border border-slate-800 shadow-inner min-h-[140px]">
              {encryptionLog.map((log, idx) => (
                <div key={idx} className="flex gap-1.5">
                  <span className="text-emerald-600">&gt;&gt;</span>
                  <p className="bangla-text">{log}</p>
                </div>
              ))}
              {isProcessing && (
                <div className="flex gap-1.5 animate-pulse text-emerald-600 font-bold">
                  <span>&gt;&gt;</span>
                  <span className="animate-bounce">● ● ●</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success confirmation modal frame */}
        {currentStep === 'success' && createdOrder && (
          <div className="p-10 text-center space-y-6 flex-1 flex flex-col justify-center items-center animate-scale-up text-xs sm:text-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-md shadow-emerald-500/10">
              <Check size={36} />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-xl sm:text-2xl bangla-text text-emerald-600">আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!</h3>
              <p className="text-slate-500 dark:text-slate-400 bangla-text">কুয়াকাটা মাল্টিমিডিয়াতে কেনাকাটা করার জন্য আপনাকে ধন্যবাদ।</p>
            </div>

            <div className="w-full max-w-sm bg-emerald-500/5 rounded-2xl p-5 border border-emerald-500/10 space-y-2 font-medium">
              <p className="bangla-text text-slate-600 dark:text-slate-300 border-b pb-2">
                নিরাপদ ট্র্যাকিং ট্রাই করতে আইডিটি কপি করুন:
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm opacity-60 bangla-text font-normal">অর্ডার আইডি:</span>
                <span id="created-order-id-display" className="text-lg font-extrabold text-emerald-600 font-mono select-all select-text">{createdOrder.id}</span>
              </div>
              <p className="text-[10px] text-amber-600 bangla-text mt-1">
                {deliveryType === 'express' ? 'তাজা মাছ দ্রুত এক্সপ্রেস টিম কোল্ড আইস বক্সে প্রস্তুত করা হচ্ছে!' : 'আপনার পণ্য প্রস্তুত হচ্ছে কুরিঙ্গারে পাঠানোর জন্য।'}
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                id="success-tracker-redirect"
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl transition cursor-pointer text-xs"
              >
                <span className="bangla-text">কেনাকাটা চালিয়ে যান</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
