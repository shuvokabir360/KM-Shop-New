/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Star, Store, ShieldCheck, Heart, ShoppingBag, EyeOff, Award, MessageSquare, LogIn, Lock } from 'lucide-react';
import { Product, Review, Customer } from '../types';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  isDarkMode: boolean;
  onAddReview: (productId: string, review: Review) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onAddToCart: (product: Product) => void;
  onDirectOrder: (product: Product) => void;
  onWhatsAppOrder?: (product: Product) => void;
  loggedInCustomer: Customer | null;
  onOpenLogin: () => void;
  hasPurchasedProduct: boolean;
}

export default function ProductDetailsModal({
  isOpen,
  onClose,
  product,
  isDarkMode,
  onAddReview,
  onToggleWishlist,
  isWishlisted,
  onAddToCart,
  onDirectOrder,
  onWhatsAppOrder,
  loggedInCustomer,
  onOpenLogin,
  hasPurchasedProduct
}: ProductDetailsModalProps) {
  
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState(false);

  // Synchronize reviewer's name with logged-in customer's name
  useEffect(() => {
    if (loggedInCustomer) {
      setName(loggedInCustomer.name);
    } else {
      setName('');
    }
  }, [loggedInCustomer]);

  if (!isOpen || !product) return null;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    const newReview: Review = {
      id: `r-${Date.now()}`,
      userName: name,
      rating,
      comment,
      date: 'আজ মাত্রই'
    };

    onAddReview(product.id, newReview);
    setSuccess(true);
    setName('');
    setComment('');
    
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col border transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Header toolbar */}
        <div className="p-4 border-b flex justify-between items-center sm:px-6">
          <span className="text-[10px] font-mono tracking-widest text-emerald-600 font-bold uppercase">Product Information Desk</span>
          <button 
            id="close-product-modal"
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content detail layout */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-xs leading-relaxed">
          
          {/* Left Column: Image and Actions */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden aspect-video sm:aspect-square bg-slate-100 shadow-sm border dark:border-slate-800 group">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.specialOffer && (
                <span className="absolute top-3 left-3 bg-rose-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow bangla-text animate-pulse">
                  {product.specialOffer}
                </span>
              )}
            </div>

            {/* Quick action triggers */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  id="details-add-to-cart-btn"
                  onClick={() => { onAddToCart(product); }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md text-xs sm:text-xs"
                >
                  <ShoppingBag size={16} />
                  <span className="bangla-text">ব্যাগে যুক্ত করুন</span>
                </button>

                <button
                  id="details-toggle-wishlist-btn"
                  onClick={() => onToggleWishlist(product)}
                  className={`p-3 rounded-xl border transition-all ${
                    isWishlisted
                      ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/20'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800'
                  }`}
                  title={isWishlisted ? 'পছন্দ থেকে সরান' : 'পছন্দের তালিকায় রাখুন'}
                >
                  <Heart size={18} className={isWishlisted ? 'fill-rose-500' : ''} />
                </button>
              </div>

              {/* Direct Order Button */}
              <button
                id="details-direct-order-btn"
                onClick={() => onDirectOrder(product)}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-900 font-extrabold py-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg text-xs sm:text-xs group/btn relative overflow-hidden"
              >
                <div className="flex items-center justify-center gap-1.5 z-10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white flex-shrink-0"></span>
                  </span>
                  <span className="bangla-text text-[13px] font-extrabold text-white tracking-wide">সরাসরি অর্ডার করুন (Buy Now)</span>
                </div>
                <div className="absolute inset-0 bg-white/10 translate-y-full hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
              </button>

              {/* WhatsApp Order Button inside modal */}
              {onWhatsAppOrder && (
                <button
                  id="details-whatsapp-order-btn"
                  onClick={() => onWhatsAppOrder(product)}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-extrabold py-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md text-xs sm:text-xs relative overflow-hidden"
                >
                  <div className="flex items-center justify-center gap-2 z-10">
                    <MessageSquare size={16} className="shrink-0" />
                    <span className="bangla-text text-[13px] font-bold text-white tracking-wide">হোয়াটসঅ্যাপে অর্ডার করুন (WhatsApp Order)</span>
                  </div>
                </button>
              )}
            </div>

            {/* Delivery diagnostic badge info cards */}
            <div className={`p-4 rounded-xl border ${
              isDarkMode ? 'bg-slate-800/20 border-slate-700' : 'bg-emerald-50/10 border-emerald-100'
            }`}>
              <h4 className="font-bold text-xs text-emerald-600 mb-1 bangla-text flex items-center gap-1.5">
                <ShieldCheck size={14} />
                <span>মহারক্ষিত তাজা ও গুণগতমান গ্যারান্টি</span>
              </h4>
              <p className="bangla-text text-slate-500 leading-relaxed text-[11px] dark:text-slate-400">
                {product.category === 'fresh_fish' 
                  ? 'তাজা মাছ কুয়াকাটা উপকূল থেকে সরাসরি ধরা পড়ে এবং আমাদের দ্রুত কোল্ড এক্সপ্রেস ক্যারিয়ার দ্বারা বিশেষ সিলড বরফ-বাক্সে ফ্রেশ অর্ডারে পৌঁছে দেওয়া হয়।'
                  : 'আমাদের আচার এবং শুটকী সম্পূর্ণ স্বাস্থ্যকর এবং কোন প্রকার বিষাক্ত রাসায়নিক কিংবা কৃত্রিম প্রিজারভেটিভ ছাড়াই তৈরি ও শুকাতে দেওয়া হয়।'}
              </p>
            </div>
          </div>

          {/* Right Column: Title details + Reviews Management Form */}
          <div className="space-y-6">
            <div>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">{product.category.replace('_', ' ')} CATEGORY</p>
              <h2 className="text-lg sm:text-xl font-bold bangla-text leading-tight text-emerald-600 mt-1">{product.name}</h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">{product.englishName}</p>
              
              {/* Product Pricing and specs */}
              <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl font-extrabold text-amber-500 font-mono">৳ {product.price}</span>
                  {product.regularPrice && product.regularPrice > product.price && (
                    <span className="text-slate-450 dark:text-slate-550 text-sm line-through font-mono">
                      ৳ {product.regularPrice}
                    </span>
                  )}
                </div>
                
                <span className="text-xs text-slate-500 bangla-text">প্রতি {product.unit}</span>

                {product.regularPrice && product.regularPrice > product.price && (
                  <span className="text-[10px] bg-rose-500/10 text-rose-500 dark:text-rose-450 font-extrabold px-1.5 py-0.5 rounded border border-rose-500/10">
                    {Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100)}% ছাড়
                  </span>
                )}

                <span className={`text-[10px] border px-2 py-0.5 rounded-full ${
                  product.stock > 0 
                    ? 'text-emerald-500 border-emerald-200 bg-emerald-500/5' 
                    : 'text-rose-500 border-rose-200 bg-rose-500/5'
                }`}>
                  {product.stock > 0 ? `রানিং স্টক: ${product.stock} টি` : 'আউট অফ স্টক'}
                </span>
              </div>

              {/* Vendor line */}
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
                <Store size={14} className="text-amber-500" />
                <span className="bangla-text">বিক্রেতা: <strong className="font-bold text-slate-700 dark:text-slate-300">{product.vendorName}</strong></span>
              </div>
            </div>

            {/* Product description details */}
            <div className="space-y-1">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Product Details</h4>
              <p className="bangla-text text-slate-655 dark:text-slate-355 text-xs sm:text-xs leading-relaxed">{product.description}</p>
            </div>

            {/* Reviews display and ratings block */}
            <div className="space-y-4">
              <div className="border-t pt-4 flex items-center justify-between">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-xs bangla-text flex items-center gap-1">
                  <span>ক্রেতা রেটিং ও মতামত</span>
                  <span className="text-[11px] font-mono text-slate-400">({product.reviews.length})</span>
                </h4>
                <div className="flex items-center gap-1">
                  <Star className="text-amber-400 fill-amber-400" size={14} />
                  <span className="font-extrabold font-mono text-xs">{product.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Reviews Scrollbox list */}
              <div className="space-y-3.5 max-h-[170px] overflow-y-auto pr-1">
                {product.reviews.length === 0 ? (
                  <p className="text-slate-400 font-sans italic text-xs bangla-text text-center py-4">এই পন্যটির জন্য কোনো রিভিউ নেই। প্রথম রিভিউ প্রদান করুন!</p>
                ) : (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className={`p-3 rounded-2xl border text-xs ${
                      isDarkMode ? 'bg-slate-800/40 border-slate-750' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-75 * dark:text-slate-250 bangla-text">{rev.userName}</span>
                        <div className="flex items-center gap-1 font-mono">
                          <Star className="text-amber-400 fill-amber-400" size={10} />
                          <span className="text-[10px] font-bold">{rev.rating}</span>
                        </div>
                      </div>
                      <p className="bangla-text text-slate-605 dark:text-slate-355 leading-relaxed">{rev.comment}</p>
                      <span className="block text-[8px] text-right text-slate-400 font-sans mt-0.5">{rev.date}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Add dynamic review form */}
              {!loggedInCustomer ? (
                <div id="review-login-required-box" className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 ${
                  isDarkMode ? 'bg-slate-800/40 border-slate-750' : 'bg-slate-50 border-slate-150'
                }`}>
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="font-bold text-slate-750 dark:text-slate-205 text-xs bangla-text flex items-center justify-center sm:justify-start gap-1">
                      <Lock size={14} className="text-amber-500" />
                      <span>মন্তব্য বা রিভিউ দিতে লগইন প্রয়োজন</span>
                    </p>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                      To share feedback, customers must log in.
                    </p>
                  </div>
                  <button
                    id="details-login-prompt-btn"
                    type="button"
                    onClick={onOpenLogin}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2 px-4 rounded-xl transition duration-155 transform shadow-sm hover:scale-[1.01] active:scale-95 text-[11px] font-black cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <LogIn size={12} />
                    <span className="bangla-text">লগইন করুন</span>
                  </button>
                </div>
              ) : !hasPurchasedProduct ? (
                <div id="review-purchase-warning-box" className="p-4 rounded-2xl border border-rose-250 bg-rose-500/5 text-slate-700 dark:text-slate-300 space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-rose-500 font-bold">
                    <Lock size={15} className="shrink-0" />
                    <span className="bangla-text text-semibold">রিভিউ নিষেধাজ্ঞা (Review Restricted)</span>
                  </div>
                  <p className="font-bold text-slate-750 dark:text-rose-200 text-xs sm:text-xs leading-relaxed bangla-text">
                    রিভিউ বা মন্তব্য করার আগে অনুগ্রহ করে পণ্যটি ক্রয় করুন এবং ব্যবহার করুন।
                  </p>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                    Please purchase the product first and use it before leaving a review or comment.
                  </p>
                </div>
              ) : (
                <form id="add-review-form" onSubmit={handleSubmitReview} className="space-y-3 border-t pt-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-slate-600 dark:text-slate-400 text-xs sm:text-xs bangla-text">আপনার অভিজ্ঞতা শেয়ার করুন:</p>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold tracking-wide flex items-center gap-1 scale-[0.95]">
                      <ShieldCheck size={11} />
                      <span className="bangla-text text-[9px]">যাচাইকৃত ক্রেতা (Verified Buyer)</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-75 bangla-text">রেটিং দিন:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((starNum) => (
                        <button
                          id={`star-btn-${starNum}`}
                          key={starNum}
                          type="button"
                          onClick={() => setRating(starNum)}
                          className="p-0.5 hover:scale-110 active:scale-95 transition"
                        >
                          <Star 
                            size={16} 
                            className={starNum <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <input
                      id="reviewer-name"
                      type="text"
                      required
                      placeholder="আপনার নাম লিখুন..."
                      value={name}
                      disabled={true}
                      className={`p-2.5 rounded-xl border focus:outline-none text-xs sm:text-xs opacity-75 cursor-not-allowed ${
                        isDarkMode ? 'bg-slate-800 border-slate-705 text-slate-350' : 'bg-slate-100 border-slate-205 text-slate-500'
                      }`}
                    />
                    <textarea
                      id="reviewer-comment"
                      required
                      placeholder="মজার আচার বা মাছের ডেলিভারি সম্পর্কে মতামত লিখুন..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={2}
                      className={`p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs sm:text-xs text-slate-850 dark:text-slate-100 ${
                        isDarkMode ? 'bg-slate-800 border-slate-705' : 'bg-slate-50 border-slate-205'
                      }`}
                    />
                  </div>

                  {success && (
                    <p className="text-[11px] text-emerald-600 font-bold bangla-text animate-pulse">রিভিউটি প্রদানের জন্য ধন্যবাদ! এটি সফলভাবে যুক্ত হয়েছে।</p>
                  )}

                  <button
                    id="submit-review-btn"
                    type="submit"
                    disabled={!name.trim() || !comment.trim()}
                    className={`w-full font-extrabold py-2.5 rounded-xl transition duration-155 transform shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-xs sm:text-xs select-none outline-none ${
                      name.trim() && comment.trim()
                        ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 text-white hover:shadow-lg hover:shadow-fuchsia-500/20 hover:scale-[1.01] active:scale-95'
                        : 'bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span className="bangla-text font-black">রিভিউ সাবমিট করুন</span>
                  </button>

                </form>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
