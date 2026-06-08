import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Heart, Eye, ChevronLeft, ChevronRight, Play, Pause, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductHeroSliderProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  wishlist: Product[];
  isDarkMode: boolean;
}

export default function ProductHeroSlider({
  products,
  onAddToCart,
  onToggleWishlist,
  onSelectProduct,
  wishlist,
  isDarkMode,
}: ProductHeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Filter products to make sure we show all products (limiting to max 8-10 featured items for amazing user experience)
  const featuredProducts = products.length > 0 ? products : [];

  useEffect(() => {
    if (isPlaying && featuredProducts.length > 0) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
      }, 4000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isPlaying, featuredProducts.length, currentIndex]);

  if (featuredProducts.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
        <p className="text-xs text-slate-500 font-sans bangla-text">কোনো পণ্য পাওয়া যায়নি</p>
      </div>
    );
  }

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  const activeProduct = featuredProducts[currentIndex];
  const isWishlisted = wishlist.some((item) => item.id === activeProduct.id);

  // Theme helper based on product category
  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'pickle':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30';
      case 'dried_fish':
        return 'bg-orange-100 text-orange-850 dark:bg-orange-500/20 dark:text-orange-300 border-orange-200 dark:border-orange-500/30';
      case 'burmese':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border-rose-200 dark:border-rose-500/30';
      case 'handicraft':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30';
      case 'fresh_fish':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300 border-teal-200 dark:border-teal-500/30';
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30';
    }
  };

  const getBanglaCategory = (cat: string) => {
    switch (cat) {
      case 'pickle': return 'টক-মিষ্টি আচার';
      case 'dried_fish': return 'কোস্টাল শুটকী';
      case 'burmese': return 'বার্মিজ আচার';
      case 'handicraft': return 'রাখাইন হস্তশিল্প';
      case 'fresh_fish': return 'তাজা মাছের বাজার';
      default: return 'সেরা পণ্য';
    }
  };

  return (
    <div 
      className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-green-300 dark:border-green-850 bg-gradient-to-br from-green-100/95 via-emerald-100/95 to-teal-150/95 dark:from-green-950/80 dark:via-emerald-950/80 dark:to-slate-900/90 backdrop-blur-md p-4 flex flex-col transition-all duration-500 hover:shadow-2xl hover:border-green-500 group/slider select-none shadow-green-500/10 dark:shadow-green-950/30"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Upper Badge Line */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
          <span className="text-[10px] sm:text-xs font-bold text-orange-600 dark:text-orange-400 bangla-text">
            সুপার হিট ডিলস 🔥
          </span>
        </div>
        
        {/* Toggle play/pause & slide status indicator */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-400">
            {currentIndex + 1} / {featuredProducts.length}
          </span>
          <button 
            type="button"
            id="slider-toggle-play"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:scale-95 transition cursor-pointer"
            title={isPlaying ? "স্লাইডার থামান" : "স্লাইডার চালু করুন"}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>
        </div>
      </div>

      {/* Main product representation container */}
      <div className="flex flex-col gap-4 flex-grow">
        {/* Full-width Product Photo with pure white backdrop */}
        <div 
          className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-xl overflow-hidden bg-white border border-slate-200/40 dark:border-slate-800 shadow-sm group cursor-pointer flex items-center justify-center" 
          onClick={() => onSelectProduct(activeProduct)}
        >
          <img 
            src={activeProduct.sliderImage || activeProduct.image} 
            alt={activeProduct.name} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain transition-transform duration-500 scale-100 hover:scale-103"
          />
          {activeProduct.specialOffer && (
            <span className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] md:text-xs font-black px-2.5 py-1 rounded-md bangla-text shadow-md ring-1 ring-white/15 z-10 animate-bounce">
              {activeProduct.specialOffer}
            </span>
          )}
          
          {/* Heart Bookmark overlay inside cover */}
          <button
            id={`slider-wishlist-toggle-${activeProduct.id}`}
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(activeProduct); }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all active:scale-95 z-20 shadow-sm ${
              isWishlisted 
                ? 'bg-rose-500 text-white shadow-lg' 
                : 'bg-black/30 hover:bg-black/55 text-white'
            }`}
          >
            <Heart size={14} className={isWishlisted ? 'fill-white' : ''} />
          </button>
        </div>

        {/* Product details and purchase action - Below the Image */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getCategoryBadgeColor(activeProduct.category)} font-bold bangla-text`}>
                  {getBanglaCategory(activeProduct.category)}
                </span>
                <div className="flex items-center gap-0.5">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <span className="text-[11px] font-bold font-mono text-slate-500 dark:text-slate-400">
                    {activeProduct.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              <h4 
                className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-50 bangla-text hover:text-orange-600 dark:hover:text-orange-400 transition leading-snug cursor-pointer"
                onClick={() => onSelectProduct(activeProduct)}
              >
                {activeProduct.name}
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-mono italic">
                {activeProduct.englishName}
              </p>
            </div>

            {/* Pricing, unit & stock */}
            <div className="flex items-center sm:items-end justify-between sm:flex-col gap-1 sm:text-right border-t sm:border-t-0 border-dashed border-slate-200/50 dark:border-slate-800/60 pt-2 sm:pt-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">মূল্য:</span>
                <span className="text-lg font-extrabold text-orange-600 dark:text-orange-400 font-mono">
                  ৳ {activeProduct.price}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 bangla-text">
                  ({activeProduct.unit})
                </span>
              </div>
              
              <div>
                {activeProduct.stock > 0 ? (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-bold bangla-text">
                    {activeProduct.stock} টি উপলব্ধ আছে
                  </span>
                ) : (
                  <span className="text-[10px] text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md font-bold bangla-text">
                    স্টকে নেই ⚠️
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-800 dark:text-slate-100 leading-relaxed font-medium bangla-text line-clamp-2">
            {activeProduct.description}
          </p>

          {/* Slider Action Buttons - Below */}
          <div className="flex gap-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
            <button
              id={`slider-add-to-cart-${activeProduct.id}`}
              type="button"
              disabled={activeProduct.stock <= 0}
              onClick={() => onAddToCart(activeProduct)}
              className="flex-1 bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600 hover:from-orange-600 hover:via-rose-600 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-300 dark:disabled:from-slate-850 dark:disabled:to-slate-800 text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-rose-500/15 active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={14} />
              <span className="bangla-text font-extrabold text-shadow-sm">কার্টে যুক্ত করুন</span>
            </button>
            <button
              id={`slider-quick-view-${activeProduct.id}`}
              type="button"
              onClick={() => onSelectProduct(activeProduct)}
              className="px-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-xl shadow-md shadow-cyan-550/10 transition-all cursor-pointer flex items-center justify-center hover:scale-[1.03] active:scale-95"
              title="বিস্তারিত জানুন"
            >
              <Eye size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Navigation Trigger Arrows */}
      <button 
        type="button"
        id="slider-go-prev"
        onClick={handlePrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur-md bg-emerald-500/90 hover:bg-emerald-600 dark:bg-emerald-600/90 dark:hover:bg-emerald-500 shadow-lg text-white font-bold active:scale-90 transition opacity-0 group-hover/slider:opacity-100 cursor-pointer hidden sm:block z-20"
      >
        <ChevronLeft size={16} />
      </button>
      <button 
        type="button"
        id="slider-go-next"
        onClick={handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur-md bg-emerald-500/90 hover:bg-emerald-600 dark:bg-emerald-600/90 dark:hover:bg-emerald-500 shadow-lg text-white font-bold active:scale-90 transition opacity-0 group-hover/slider:opacity-100 cursor-pointer hidden sm:block z-20"
      >
        <ChevronRight size={16} />
      </button>

      {/* Pagination bullets bar */}
      <div className="flex gap-1 justify-center mt-3 pt-2 border-t border-slate-50 dark:border-slate-800/10">
        {featuredProducts.map((_, dotIdx) => (
          <button
            key={dotIdx}
            type="button"
            id={`slider-dot-${dotIdx}`}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(dotIdx); }}
            className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
              dotIdx === currentIndex ? 'w-4 bg-emerald-500' : 'w-1.5 bg-slate-200 dark:bg-slate-850 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
