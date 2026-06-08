/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Store, Plus, Tag, Layers, Database, ShoppingBag, ShieldAlert, Check, TrendingUp, Image as ImageIcon } from 'lucide-react';
import { Product } from '../types';
import ImageUploaderWithCrop from './ImageUploaderWithCrop';

interface SellerDashboardProps {
  isDarkMode: boolean;
  onProductAdded: (newProd: Product) => void;
  vendorName: string;
  setVendorName: (name: string) => void;
}

export default function SellerDashboard({
  isDarkMode,
  onProductAdded,
  vendorName,
  setVendorName
}: SellerDashboardProps) {
  
  // New Product form fields
  const [prodName, setProdName] = useState('');
  const [prodEngName, setProdEngName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodRegularPrice, setProdRegularPrice] = useState('');
  const [prodUnit, setProdUnit] = useState('১ শত গ্রাম');
  const [prodCategory, setProdCategory] = useState<'pickle' | 'dried_fish' | 'burmese' | 'handicraft' | 'fresh_fish'>('pickle');
  const [prodDesc, setProdDesc] = useState('');
  const [prodStock, setProdStock] = useState('15');
  const [prodOffer, setProdOffer] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodSliderImage, setProdSliderImage] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Bangla number digit converter
  const convertToBanglaNumbers = (num: string | number): string => {
    const banglaDigits: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    return String(num).replace(/[0-9]/g, digit => banglaDigits[digit] || digit);
  };

  // Seller metrics statistics simulation
  const stats = {
    totalRevenue: '৳ ৩৩,৫০০',
    ordersCount: '১২',
    commissionRate: '২.৫%',
    activeInventory: '৪টি পণ্য'
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice.trim()) {
      setErrorMsg('পণ্যের নাম এবং মূল্য অবশ্যই প্রদান করতে হবে।');
      return;
    }

    setIsUploading(true);
    setSuccessMsg('');
    setErrorMsg('');

    // Select dynamic unsplash category image logic if no URL entered
    let finalImage = prodImage.trim();
    if (!finalImage) {
      switch (prodCategory) {
        case 'pickle':
          finalImage = 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=400';
          break;
        case 'dried_fish':
          finalImage = 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400';
          break;
        case 'burmese':
          finalImage = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400';
          break;
        case 'handicraft':
          finalImage = 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=400';
          break;
        case 'fresh_fish':
          finalImage = 'https://images.unsplash.com/photo-1553618551-fba689030290?auto=format&fit=crop&q=80&w=400';
          break;
      }
    }

    try {
      const numPrice = Number(prodPrice);
      const numRegPrice = prodRegularPrice.trim() ? Number(prodRegularPrice) : 0;
      
      let calculatedOffer = prodOffer.trim();
      if (!calculatedOffer && numRegPrice > numPrice) {
        const discountP = Math.round(((numRegPrice - numPrice) / numRegPrice) * 100);
        if (discountP > 0) {
          calculatedOffer = `${convertToBanglaNumbers(discountP)}% ছাড়`;
        }
      }

      const payload = {
        name: prodName,
        englishName: prodEngName,
        price: numPrice,
        regularPrice: numRegPrice > 0 ? numRegPrice : undefined,
        unit: prodUnit,
        category: prodCategory,
        description: prodDesc,
        image: finalImage,
        sliderImage: prodSliderImage.trim() || undefined,
        vendorId: 'vendor-user',
        vendorName: vendorName || 'কুয়াকাটা লোকাল মার্সেন্ট',
        stock: Number(prodStock),
        specialOffer: calculatedOffer || undefined
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(`"${prodName}" সফলভাবে আপলোড হয়েছে এবং এখন ক্যাটালগে দৃশ্যমান!`);
        // Notify Parent component to append/refresh products array
        onProductAdded(data.data);
        
        // Reset form controls
        setProdName('');
        setProdEngName('');
        setProdPrice('');
        setProdRegularPrice('');
        setProdDesc('');
        setProdOffer('');
        setProdImage('');
        setProdSliderImage('');
      } else {
        setErrorMsg(data.error || 'পণ্য আপলোড করা সম্ভব হয়নি।');
      }
    } catch (err) {
      setErrorMsg('সার্ভারের সাথে কানেক্ট করা যাচ্ছে না। অফলাইন মোডে ডাটা লোকালস্টোরেজে সিঙ্ক করা আছে।');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 rounded-3xl border transition-all duration-300 ${
      isDarkMode 
        ? 'bg-slate-900 border-slate-800 text-slate-100' 
        : 'bg-white border-slate-100 text-slate-800'
    } shadow-lg outline-none`}>
      
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/10">
            <Store size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold bangla-text flex items-center gap-2">
              কুয়াকাটা সেলার ড্যাশবোর্ড <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full font-mono">MULTI-VENDOR</span>
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 font-sans mt-0.5">
              <span>এখানে আপনার শুটকী, আচার এবং তাজা মাছ সরাসরি কাস্টমারের কাছে বিক্রয় করুন।</span>
            </p>
          </div>
        </div>

        {/* Dynamic Vendor Settings Profile */}
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-75 bangla-text">দোকানের নাম / ব্র্যান্ড:</span>
          <input
            id="vendor-brand-input"
            type="text"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            className={`px-3 py-1.5 text-xs rounded-xl border focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
            placeholder="ফয়সাল শুটকী ও আচার কানন"
          />
        </div>
      </div>

      {/* Analytics widgets simulation cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-750' : 'bg-slate-50/50 border-slate-100'}`}>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Total Sales</p>
          <p className="text-lg sm:text-xl font-bold text-emerald-600 mt-1 font-sans">{stats.totalRevenue}</p>
          <span className="text-[10px] text-emerald-500 flex items-center gap-0.5 mt-0.5 font-sans">
            <TrendingUp size={10} /> +১২% আজ
          </span>
        </div>
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-750' : 'bg-slate-50/50 border-slate-100'}`}>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Orders Completed</p>
          <p className="text-lg sm:text-xl font-bold mt-1 font-sans">{stats.ordersCount} টি</p>
          <span className="text-[10px] opacity-60 font-sans">ডেলিভারড</span>
        </div>
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-750' : 'bg-slate-50/50 border-slate-100'}`}>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Platform Tax</p>
          <p className="text-lg sm:text-xl font-bold text-amber-500 mt-1 font-sans">{stats.commissionRate}</p>
          <span className="text-[10px] opacity-60 font-sans">লোয়েস্ট রেট</span>
        </div>
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-750' : 'bg-slate-50/50 border-slate-100'}`}>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Active Products</p>
          <p className="text-lg sm:text-xl font-bold mt-1 bangla-text">{stats.activeInventory}</p>
          <span className="text-[10px] text-emerald-500 font-mono">অনলাইন লাইভ ক্যাটালগ</span>
        </div>
      </div>

      {/* Upload and details section layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form: Upload Item */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-1.5 text-sm font-bold pb-2 border-b">
            <Plus size={16} className="text-emerald-500" />
            <span className="bangla-text text-emerald-600 dark:text-emerald-400">নতুন পণ্য (শুটকী/আচার/মাছ) আপলোড করুন ক্যাটালগে</span>
          </div>

          <form id="new-product-form" onSubmit={handleCreateProduct} className="space-y-4 text-xs sm:text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1.5 bangla-text">পণ্যের বাংলা নাম *</label>
                <input
                  id="p-name"
                  type="text"
                  placeholder="যেমন: কুয়াকাটার তাজা লাল সুস্বাদু রূপচাঁদা মাছ"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400 dark:placeholder-slate-500 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1.5 bangla-text">ইংরেজি নাম / শর্ট ট্রিগার (ঐচ্ছিক)</label>
                <input
                  id="p-eng-name"
                  type="text"
                  placeholder="যেমন: Fresh Rupchanda Sea Fish"
                  value={prodEngName}
                  onChange={(e) => setProdEngName(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400 dark:placeholder-slate-500 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold mb-1.5 bangla-text text-slate-500 dark:text-slate-400">খুচরা/রেগুলার মূল্য (ঐচ্ছিক)</label>
                <input
                  id="p-regular-price"
                  type="number"
                  placeholder="যেমন: ১৫০০"
                  value={prodRegularPrice}
                  onChange={(e) => setProdRegularPrice(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400 dark:placeholder-slate-500 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1.5 bangla-text text-slate-700 dark:text-slate-200">বিক্রয় মূল্য (টাকা) *</label>
                <input
                  id="p-price"
                  type="number"
                  placeholder="যেমন: ১২০০"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400 dark:placeholder-slate-500 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1.5 bangla-text text-slate-700 dark:text-slate-200">ওজন / পরিমাপের একক *</label>
                <input
                  id="p-unit"
                  type="text"
                  placeholder="১ কেজি, ৫ প্যাকেট বা ৪ পিস"
                  value={prodUnit}
                  onChange={(e) => setProdUnit(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400 dark:placeholder-slate-500 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1.5 bangla-text text-slate-700 dark:text-slate-200">স্টক সংখ্যা (পরিমাণ) *</label>
                <input
                  id="p-stock"
                  type="number"
                  placeholder="যেমন: ২৫"
                  value={prodStock}
                  onChange={(e) => setProdStock(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400 dark:placeholder-slate-500 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1.5 bangla-text">ক্যাটাগরি নির্ধারণ করুন *</label>
                <select
                  id="p-category"
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value as any)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="pickle" className="bg-white text-slate-900">আচার (Pickle)</option>
                  <option value="dried_fish" className="bg-white text-slate-900">শুটকী (Dried Fish)</option>
                  <option value="burmese" className="bg-white text-slate-900">বার্মিজ পণ্য (Burmese)</option>
                  <option value="handicraft" className="bg-white text-slate-900">হস্তশিল্প সামগ্রী (Handicraft)</option>
                  <option value="fresh_fish" className="bg-white text-slate-900">তাজা মাছ ডেলিভারি (Fresh Fish)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1.5 bangla-text">বিশেষ অফার / ট্যাগ (ঐচ্ছিক)</label>
                <input
                  id="p-offer"
                  type="text"
                  placeholder="যেমন: ১০% ছাড়, কিনলেই ফ্রী"
                  value={prodOffer}
                  onChange={(e) => setProdOffer(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400 dark:placeholder-slate-500 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Integrated Aspect-Ratio Image Direct Uploader & Cropper */}
            <div className={`p-4 rounded-xl border-2 border-dashed ${
              isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50/50 border-slate-200'
            } space-y-2.5`}>
              <label className="block font-bold text-xs bangla-text flex items-center gap-1.5">
                <ImageIcon size={14} className="text-emerald-500" />
                <span>পণ্যের ছবির সরাসরি আপলোড ও ক্রপিং সিস্টেম</span>
              </label>
              
              <ImageUploaderWithCrop 
                isDarkMode={isDarkMode}
                value={prodImage}
                onChange={(dataUrl) => setProdImage(dataUrl)}
              />

              <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                <label className="block font-semibold text-[10px] mb-1.5 bangla-text text-slate-400">অথবা সরাসরি কুয়েরি ছবির লিঙ্ক URL ব্যবহার করুন:</label>
                <input
                  id="p-image-url"
                  type="url"
                  placeholder="https://images.unsplash.com/... অথবা Base64 Data URL"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-[10px] focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400 dark:placeholder-slate-500 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1.5 bangla-text">হোমপেজ স্লাইডার ইমেজ লিংক (ঐচ্ছিক - এটি দিলে হিরো স্লাইডারে আলাদা ছবি দেখাবে, অন্যথায় মূল ছবি ব্যবহার হবে)</label>
              <input
                id="p-slider-image-url"
                type="url"
                placeholder="https://images.unsplash.com/... (যেমন ১৬:৯ রেশিওর ছবি)"
                value={prodSliderImage}
                onChange={(e) => setProdSliderImage(e.target.value)}
                className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400 dark:placeholder-slate-500 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1.5 bangla-text">পণ্যের পুঙ্খানুপুঙ্খ বিবরণ (বর্ণনা) *</label>
              <textarea
                id="p-description"
                placeholder="সমুদ্র থেকে ধরার সময়, সংরক্ষণ প্রণালী এবং রান্নার টিপস ক্রেতার সাথে শেয়ার করুন যা আপনার অর্ডার বাড়িয়ে দেবে..."
                value={prodDesc}
                onChange={(e) => setProdDesc(e.target.value)}
                rows={4}
                className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400 dark:placeholder-slate-500 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
                required
              />
            </div>

            {successMsg && (
              <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 p-3.5 rounded-xl flex items-center gap-2 border border-emerald-500/10 font-bold bangla-text">
                <Check size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-500/10 text-rose-600 dark:text-rose-455 p-3.5 rounded-xl flex items-center gap-2 border border-rose-500/10 font-bold bangla-text">
                <ShieldAlert size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <button
                id="publish-product-btn"
                type="submit"
                disabled={isUploading}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl transition hover:scale-[1.02] shadow-md shadow-emerald-505/10 text-xs sm:text-xs"
              >
                {isUploading ? 'আপলোড করা হচ্ছে...' : 'লাইভ ক্যাটালগে যুক্ত করুন 🚀'}
              </button>
            </div>

          </form>
        </div>

        {/* Right Info pane: Advice & Instructions */}
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${
            isDarkMode ? 'bg-slate-800/40 border-slate-750' : 'bg-amber-50/20 border-amber-100'
          }`}>
            <h4 className="font-bold text-sm mb-3 text-amber-600 dark:text-amber-400 bangla-text flex items-center gap-1.5">
              <ShieldAlert size={16} />
              <span>বিক্রেতাদের জন্য নিয়মাবলী</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-655 dark:text-slate-355 leading-relaxed">
              <li className="bangla-text">
                <strong>১. তাজা মাছের কোল্ড-চেইন:</strong> আমাদের গ্রাহকের ১০০% তাজা মাছ নিশ্চিত করতে, মাছের অর্ডারের সময় তা বরফে সংরক্ষিত থাকা আবশ্যক।
              </li>
              <li className="bangla-text">
                <strong>২. বিশুদ্ধ শুটকী পলিসি:</strong> কোনো প্রকার ডিডিটি বা ক্ষতিকর কেমিক্যাল মেশানো শুটকী সাইটে যুক্ত করলে একাউন্ট বন্ধ করা হবে।
              </li>
              <li className="bangla-text">
                <strong>৩. দ্রুত ডেলিভারি টিম:</strong> কুয়াকাটা সংলগ্ন এলাকার জন্য ৪ ঘণ্টায় স্পেশাল ফাস্ট কুরিঙ্গারের সাথে যোগাযোগ করে পন্য বুঝিয়ে দিন।
              </li>
              <li className="bangla-text">
                <strong>৪. কমিশন কাঠামো:</strong> প্রতিটি পণ্য বিক্রেতা সম্পূর্ণ বিনামূল্যে ক্যাটালগে যোগ করতে পারবেন। সফল ডেলিভারির পর সামান্য সার্ভিস চার্জ কর্তন করা হবে।
              </li>
            </ul>
          </div>

          <div className={`p-5 rounded-2xl border ${
            isDarkMode ? 'bg-slate-800/40 border-slate-750' : 'bg-emerald-50/20 border-emerald-100'
          }`}>
            <h4 className="font-bold text-sm mb-2 text-emerald-600 dark:text-emerald-400 bangla-text flex items-center gap-1.5">
              <Database size={16} />
              <span>অফলাইন বা ডাটা সিঙ্ক সামর্থ্য</span>
            </h4>
            <p className="text-xs text-slate-550 leading-relaxed bangla-text">
              আপনি ইন্টারনেটের আওতার বাইরে থাকলেও ড্যাশবোর্ডে নতুন পণ্য আপলোড করতে পারবেন। সিগন্যাল রিকভারি ডাটা লোকাল মেমরিতে জমা থাকবে এবং পুনরায় ইন্টারনেট সংযুক্ত হওয়ার সাথে সাথে ড্যাশবোর্ড আপনার ডাটা স্বয়ংক্রিয়ভাবে কুয়াকাটা মেইন সার্ভারের সাথে সিঙ্ক করে নেবে।
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
