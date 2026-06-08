/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Moon, 
  Sun, 
  Bell, 
  MapPin, 
  UserCheck, 
  Store, 
  MessageSquare, 
  Menu, 
  X,
  Compass,
  User,
  Settings
} from 'lucide-react';
import { Notification, Customer } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  isSellerMode: boolean;
  setIsSellerMode: (isSeller: boolean) => void;
  notifications: Notification[];
  onOpenTracker: () => void;
  onOpenSupportChat: () => void;
  onOpenNotifications: () => void;
  onlineStatus: boolean;
  isLoggedIn: boolean;
  loggedInCustomer: Customer | null;
  onOpenLogin: () => void;
  onOpenCustomerDashboard: () => void;
  isAdminMode: boolean;
  setIsAdminMode: (isAdmin: boolean) => void;
  siteConfig: {
    siteName: string;
    siteTagline: string;
    enableSellerMode: boolean;
    enableSupportChat: boolean;
    enableOrderTracker: boolean;
  };
}

export default function Header({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  cartCount,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  isDarkMode,
  setIsDarkMode,
  isSellerMode,
  setIsSellerMode,
  notifications,
  onOpenTracker,
  onOpenSupportChat,
  onOpenNotifications,
  onlineStatus,
  isLoggedIn,
  loggedInCustomer,
  onOpenLogin,
  onOpenCustomerDashboard,
  isAdminMode,
  setIsAdminMode,
  siteConfig
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const categories = [
    { id: 'all', label: 'সব ক্যাটাগরি' },
    { id: 'pickle', label: 'আচার' },
    { id: 'dried_fish', label: 'শুটকী' },
    { id: 'burmese', label: 'বার্মিজ পণ্য' },
    { id: 'handicraft', label: 'হস্তশিল্প' },
    { id: 'fresh_fish', label: 'তাজা মাছ 🐟' },
  ];

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-300 border-b ${
      isDarkMode 
        ? 'bg-slate-900 border-slate-800 text-slate-100' 
        : 'bg-white border-slate-100 text-slate-800'
    } shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button 
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                <Compass className="animate-spin-slow text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bangla-text tracking-tight flex items-center gap-1.5 leading-snug">
                  <span className="text-emerald-600 dark:text-emerald-400">{siteConfig.siteName}</span>
                </h1>
                <p className="text-[10px] font-mono tracking-wider opacity-60 uppercase">{siteConfig.siteTagline}</p>
              </div>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                id="header-search-desktop"
                type="text"
                placeholder="মজার আচার, শুটকী, রাখাইন বুটিকস অথবা সমুদ্রের মাছ খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-2.5 pl-10 pr-4 rounded-xl border sm:text-sm transition-all shadow-inner-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-100 focus:bg-slate-700' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                }`}
              />
              <Search className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
              {searchQuery && (
                <button 
                  id="clear-search-btn"
                  onClick={() => setSearchQuery('')} 
                  className="absolute right-3 top-3 text-xs opacity-60 hover:opacity-100 bg-slate-200 dark:bg-slate-700 py-0.5 px-1.5 rounded"
                >
                  ক্লিয়ার
                </button>
              )}
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Support chat toggle button */}
            {siteConfig.enableSupportChat && (
              <button
                id="support-chat-toggle"
                onClick={onOpenSupportChat}
                className={`hidden md:flex p-2.5 rounded-xl hover:scale-105 active:scale-95 transition relative ${
                  isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
                }`}
                title="সরাসরি সাপোর্ট টিম চ্যাট"
              >
                <MessageSquare size={19} className="text-emerald-500" />
              </button>
            )}

            {/* Order Tracking shortcut button */}
            {siteConfig.enableOrderTracker && (
              <button
                id="order-tracker-btn"
                onClick={onOpenTracker}
                className={`hidden md:flex p-2.5 rounded-xl hover:scale-105 active:scale-95 transition items-center gap-1.5 ${
                  isDarkMode 
                    ? 'bg-slate-800 text-slate-100 hover:bg-slate-700' 
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
                title="অর্ডার ট্র্যাকিং সিস্টেম"
              >
                <MapPin size={19} className="text-amber-500" />
                <span className="hidden md:inline text-xs sm:text-xs font-medium">অর্ডার ট্র্যাক</span>
              </button>
            )}

            {/* Wishlist Button */}
            <button
              id="wishlist-btn"
              onClick={onOpenWishlist}
              className="hidden md:flex p-2.5 rounded-xl hover:scale-105 transition relative hover:bg-rose-50 dark:hover:bg-rose-950/20"
              title="পছন্দের তালিকা"
            >
              <Heart size={19} className="text-rose-500 fill-rose-500/10" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="cart-btn"
              onClick={onOpenCart}
              className={`hidden md:flex p-2.5 rounded-xl hover:scale-105 transition relative items-center gap-1.5 ${
                isDarkMode ? 'bg-emerald-950/50 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
              }`}
              title="শপিং ব্যাগ"
            >
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Notifications Button */}
            <button
              id="notifications-btn"
              onClick={onOpenNotifications}
              className="p-2.5 rounded-xl hover:scale-105 transition relative hover:bg-slate-100 dark:hover:bg-slate-800"
              title="বার্তা সমূহ"
            >
              <Bell size={19} className={unreadCount > 0 ? 'text-amber-500 animate-swing' : ''} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-amber-500 w-2.5 h-2.5 rounded-full"></span>
              )}
            </button>

            {/* Dark Mode toggle Button */}
            <button
              id="dark-mode-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl hover:scale-105 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              title="থিম পরিবর্তন"
            >
              {isDarkMode ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} className="text-indigo-600" />}
            </button>

            {/* Customer Session Profile Trigger desktop link */}
            {isLoggedIn ? (
              <button
                id="header-user-account-btn"
                onClick={onOpenCustomerDashboard}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl transition font-sans text-xs border cursor-pointer ${
                  isDarkMode
                    ? 'bg-emerald-950/30 text-emerald-400 border-emerald-800 hover:bg-emerald-900/40'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <User size={14} className="text-emerald-555" />
                <span className="bangla-text text-xs font-bold truncate max-w-[120px]">{loggedInCustomer?.name || 'প্রোফাইল'}</span>
              </button>
            ) : (
              <button
                id="header-login-btn"
                onClick={onOpenLogin}
                className={`hidden sm:flex items-center justify-center px-4 py-2.5 rounded-xl transition font-sans text-xs border cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <span className="font-bold font-sans">Login</span>
              </button>
            )}

            {/* Admin Toggle button for multi-vendor system (Only visible to authenticated Sellers) */}
            {isLoggedIn && loggedInCustomer?.role === 'seller' && siteConfig.enableSellerMode && (
              <button
                id="vendor-dashboard-btn"
                onClick={() => {
                  setIsSellerMode(!isSellerMode);
                  setIsAdminMode(false);
                }}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl transition font-sans text-xs border cursor-pointer ${
                  isSellerMode 
                    ? 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600' 
                    : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isSellerMode ? (
                  <>
                    <UserCheck size={14} />
                    <span>গ্রাহক মোড</span>
                  </>
                ) : (
                  <>
                    <Store size={14} />
                    <span>সেলার ড্যাশবোর্ড</span>
                  </>
                )}
              </button>
            )}

            {/* Super Admin Panel entry Trigger (Only visible to authenticated Super Admin) */}
            {isLoggedIn && loggedInCustomer?.role === 'admin' && (
              <button
                id="super-admin-dashboard-btn"
                onClick={() => {
                  setIsAdminMode(!isAdminMode);
                  setIsSellerMode(false);
                }}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl transition font-sans text-xs border cursor-pointer ${
                  isAdminMode 
                    ? 'bg-amber-500 text-slate-950 border-amber-500 hover:bg-amber-600' 
                    : 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-755 hover:text-white'
                }`}
              >
                <Settings size={14} className={isAdminMode ? 'animate-spin-slow' : ''} />
                <span>{isAdminMode ? 'এডমিন বন্ধ করুন' : 'সুপার এডমিন'}</span>
              </button>
            )}

          </div>
        </div>

        {/* Mobile Search & Mode Indicator */}
        <div className="pb-4 lg:hidden">
          <div className="relative">
            <input
              id="header-search-mobile"
              type="text"
              placeholder="আচার, শুটকী, রাখাইন পণ্য, তাজা মাছ খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-2 px-9 rounded-lg border text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-100' 
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
            <Search className="absolute left-3 top-3 text-slate-400" size={14} />
            {searchQuery && (
              <button 
                id="clear-search-btn-mobile"
                onClick={() => setSearchQuery('')} 
                className="absolute right-2 top-2.5 text-[10px] bg-slate-200 dark:bg-slate-700 py-0.5 px-1.5 rounded"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Horizontal scroll feed */}
        <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-none antialiased border-t border-slate-100 dark:border-slate-800/10">
          {categories.map((cat) => (
            <button
              id={`cat-btn-${cat.id}`}
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                // Also toggle seller mode OFF if browsing customer products
                setIsSellerMode(false);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat.id && !isSellerMode
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300 dark:ring-emerald-800'
                  : isDarkMode
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span className="bangla-text">{cat.label}</span>
            </button>
          ))}

          {/* Quick link to Toggle Seller mode on mobile */}
          <button
            id="vendor-dashboard-btn-mobile"
            onClick={() => setIsSellerMode(!isSellerMode)}
            className={`sm:hidden px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
              isSellerMode 
                ? 'bg-rose-500 text-white border-rose-500' 
                : 'bg-sky-600 text-white border-sky-600'
            }`}
          >
            {isSellerMode ? 'গ্রাহক মোড' : 'সেলার ড্যাশবোর্ড 🏪'}
          </button>
        </div>

      </div>

      {/* Side-Drawer Menu navigation or overview for Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white dark:bg-slate-950 p-6 shadow-xl border-b border-slate-100 dark:border-slate-800 z-50 animate-fade-in">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">খুব সহজে সংযোগ করুন</p>
            <button 
              id="mobile-nav-support"
              onClick={() => { onOpenSupportChat(); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                <MessageSquare size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm bangla-text">সরাসরি সাপোর্ট চ্যাট</p>
                <p className="text-[11px] text-slate-500">অনলাইন কাস্টমার কেয়ার টিম</p>
              </div>
            </button>

            <button 
              id="mobile-nav-tracker"
              onClick={() => { onOpenTracker(); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                <MapPin size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm bangla-text">অর্ডার ট্র্যাকিং সিস্টেম</p>
                <p className="text-[11px] text-slate-500">আপনার ডেলিভারির খোঁজ নিন</p>
              </div>
            </button>

            {/* Mobile login panel triggers */}
            {isLoggedIn ? (
              <button 
                id="mobile-nav-customer-dashboard"
                onClick={() => { onOpenCustomerDashboard(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                  <UserCheck size={18} />
                </div>
                <div>
                  <p className="font-semibold text-sm bangla-text">আমার প্রোফাইল ও ড্যাশবোর্ড</p>
                  <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{loggedInCustomer?.name || 'ড্যাশবোর্ড প্রবেশ'}</p>
                </div>
              </button>
            ) : (
              <button 
                id="mobile-nav-login"
                onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-450">
                  <User size={18} />
                </div>
                <div>
                  <p className="font-semibold text-sm font-sans">Login</p>
                  <p className="text-[11px] text-slate-500">পূর্ববর্তী অর্ডার হিস্টোরি ও ট্র্যাকিং</p>
                </div>
              </button>
            )}

            {isLoggedIn && loggedInCustomer?.role === 'seller' && siteConfig.enableSellerMode && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center">
                <span className="text-xs text-slate-500 bangla-text">সেলার প্ল্যাটফর্ম এক্সেস:</span>
                <button
                  id="vendor-dashboard-btn-drawer"
                  onClick={() => { setIsSellerMode(!isSellerMode); setIsAdminMode(false); setMobileMenuOpen(false); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    isSellerMode 
                      ? 'bg-rose-500 border-rose-500 text-white' 
                      : 'bg-emerald-600 border-emerald-600 text-white'
                  }`}
                >
                  {isSellerMode ? 'গ্রাহক মোডে যান' : 'সেলার ড্যাশবোর্ড'}
                </button>
              </div>
            )}

            {isLoggedIn && loggedInCustomer?.role === 'admin' && (
              <div className={`border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center`}>
                <span className="text-xs text-slate-500 bangla-text">সিস্টেম কনফিগারেশন:</span>
                <button
                  id="super-admin-btn-drawer"
                  onClick={() => { setIsAdminMode(!isAdminMode); setIsSellerMode(false); setMobileMenuOpen(false); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    isAdminMode 
                      ? 'bg-amber-500 border-amber-500 text-slate-950' 
                      : 'bg-slate-800 border-slate-700 text-amber-400 hover:text-white'
                  }`}
                >
                  {isAdminMode ? 'এডমিন বন্ধ করুন' : 'সুপার এডমিন প্যানেল'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
