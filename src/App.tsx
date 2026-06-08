/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Store, 
  Tag, 
  Info, 
  Volume2, 
  Wifi, 
  WifiOff, 
  Bookmark, 
  RefreshCw,
  Award,
  Star,
  Compass,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

import Header from './components/Header';
import Chatbot from './components/Chatbot';
import SupportChat from './components/SupportChat';
import OrderTracker from './components/OrderTracker';
import SellerDashboard from './components/SellerDashboard';
import CheckoutModal from './components/CheckoutModal';
import ProductDetailsModal from './components/ProductDetailsModal';
import CustomerLoginModal from './components/CustomerLoginModal';
import CustomerDashboardModal from './components/CustomerDashboardModal';
import SuperAdminDashboard, { SiteConfig } from './components/SuperAdminDashboard';
import ProductHeroSlider from './components/ProductHeroSlider';

import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';

import { Product, CartItem, Order, Notification, Review, Customer } from './types';
import { INITIAL_PRODUCTS } from './data/mockProducts';

const HOME_CATEGORIES = [
  {
    id: 'all',
    label: 'সব ক্যাটাগরি',
    shortLabel: 'সব পণ্য ও ডিল',
    image: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=200',
    color: 'from-emerald-400 to-teal-500'
  },
  {
    id: 'pickle',
    label: 'আচার',
    shortLabel: 'টক-মিষ্টি চাটনি',
    image: 'https://images.unsplash.com/photo-1590483736622-39da8af75bba?auto=format&fit=crop&q=80&w=200',
    color: 'from-amber-400 to-orange-500'
  },
  {
    id: 'dried_fish',
    label: 'শুটকী',
    shortLabel: 'লইট্টা ও রূপচাঁদা',
    image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&q=80&w=200',
    color: 'from-yellow-400 to-amber-600'
  },
  {
    id: 'burmese',
    label: 'বার্মিজ পণ্য',
    shortLabel: 'ঐতিহ্যবাহী পণ্য',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=200',
    color: 'from-rose-400 to-pink-500'
  },
  {
    id: 'handicraft',
    label: 'হস্তশিল্প',
    shortLabel: 'শৌখিন উপহার',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=200',
    color: 'from-blue-400 to-indigo-500'
  },
  {
    id: 'fresh_fish',
    label: 'তাজা মাছ 🐟',
    shortLabel: 'সাগরের তাজা মাছ',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=200',
    color: 'from-cyan-400 to-sky-500'
  },
];

const getCategoryStyle = (catId: string) => {
  switch (catId) {
    case 'pickle':
      return {
        bg: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 dark:from-amber-600 dark:via-orange-600 dark:to-rose-700',
        border: 'border-amber-400/30 dark:border-amber-500/20 shadow-md shadow-amber-500/10',
        title: 'text-white font-extrabold',
        sub: 'text-amber-100 dark:text-amber-100/90',
        badge: 'bg-white/20 text-white backdrop-blur-xs ring-1 ring-white/30',
        btn: 'text-white hover:text-amber-100 dark:text-white dark:hover:text-amber-100',
        avatarBorder: 'border-white/40',
      };
    case 'dried_fish':
      return {
        bg: 'bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 dark:from-orange-600 dark:via-rose-600 dark:to-red-700',
        border: 'border-orange-400/30 dark:border-orange-500/20 shadow-md shadow-orange-500/10',
        title: 'text-white font-extrabold',
        sub: 'text-orange-100 dark:text-orange-100/90',
        badge: 'bg-white/20 text-white backdrop-blur-xs ring-1 ring-white/30',
        btn: 'text-white hover:text-orange-100 dark:text-white dark:hover:text-orange-100',
        avatarBorder: 'border-white/40',
      };
    case 'burmese':
      return {
        bg: 'bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 dark:from-rose-600 dark:via-pink-600 dark:to-orange-600',
        border: 'border-rose-400/30 dark:border-rose-500/20 shadow-md shadow-rose-500/10',
        title: 'text-white font-extrabold',
        sub: 'text-pink-100 dark:text-rose-100/90',
        badge: 'bg-white/20 text-white backdrop-blur-xs ring-1 ring-white/30',
        btn: 'text-white hover:text-rose-100 dark:text-white dark:hover:text-rose-100',
        avatarBorder: 'border-white/40',
      };
    case 'handicraft':
      return {
        bg: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 dark:from-indigo-600 dark:via-purple-600 dark:to-rose-600',
        border: 'border-indigo-400/30 dark:border-indigo-500/20 shadow-md shadow-indigo-500/10',
        title: 'text-white font-extrabold',
        sub: 'text-indigo-100 dark:text-indigo-100/90',
        badge: 'bg-white/20 text-white backdrop-blur-xs ring-1 ring-white/30',
        btn: 'text-white hover:text-indigo-100 dark:text-white dark:hover:text-indigo-100',
        avatarBorder: 'border-white/40',
      };
    case 'fresh_fish':
      return {
        bg: 'bg-gradient-to-r from-teal-500 via-orange-500 to-rose-500 dark:from-teal-600 dark:via-orange-600 dark:to-rose-600',
        border: 'border-teal-400/30 dark:border-teal-500/20 shadow-md shadow-teal-500/10',
        title: 'text-white font-extrabold',
        sub: 'text-teal-50 dark:text-teal-100/90',
        badge: 'bg-white/20 text-white backdrop-blur-xs ring-1 ring-white/30',
        btn: 'text-white hover:text-teal-100 dark:text-white dark:hover:text-teal-100',
        avatarBorder: 'border-white/40',
      };
    default:
      return {
        bg: 'bg-gradient-to-r from-orange-500 via-orange-500 to-rose-500 dark:from-orange-600 dark:to-rose-600',
        border: 'border-orange-400/30 dark:border-orange-500/20 shadow-md shadow-orange-500/10',
        title: 'text-white font-extrabold',
        sub: 'text-orange-50 dark:text-orange-100/90',
        badge: 'bg-white/20 text-white backdrop-blur-xs ring-1 ring-white/30',
        btn: 'text-white hover:text-orange-100 dark:text-white dark:hover:text-orange-100',
        avatarBorder: 'border-white/40',
      };
  }
};

const getCategoryActiveFilterStyle = (catId: string) => {
  switch (catId) {
    case 'pickle':
      return {
        activeClass: 'border-amber-500 bg-amber-500/10 dark:bg-amber-950/40 ring-2 ring-amber-500/20 scale-105 font-black text-amber-600 dark:text-amber-400',
        dotClass: 'bg-amber-500 dark:bg-amber-400',
        imageBorder: 'border-amber-500 shadow-md shadow-amber-500/10'
      };
    case 'dried_fish':
      return {
        activeClass: 'border-amber-600 bg-amber-600/10 dark:bg-amber-950/40 ring-2 ring-amber-600/20 scale-105 font-black text-amber-700 dark:text-amber-400',
        dotClass: 'bg-amber-600 dark:bg-amber-400',
        imageBorder: 'border-amber-600 shadow-md shadow-amber-600/10'
      };
    case 'burmese':
      return {
        activeClass: 'border-rose-500 bg-rose-500/10 dark:bg-rose-950/40 ring-2 ring-rose-500/20 scale-105 font-black text-rose-600 dark:text-rose-400',
        dotClass: 'bg-rose-500 dark:bg-rose-400',
        imageBorder: 'border-rose-500 shadow-md shadow-rose-500/10'
      };
    case 'handicraft':
      return {
        activeClass: 'border-blue-500 bg-blue-500/10 dark:bg-blue-950/40 ring-2 ring-blue-500/20 scale-105 font-black text-blue-600 dark:text-blue-400',
        dotClass: 'bg-blue-500 dark:bg-blue-400',
        imageBorder: 'border-blue-500 shadow-md shadow-blue-500/10'
      };
    case 'fresh_fish':
      return {
        activeClass: 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 scale-105 font-black text-emerald-600 dark:text-emerald-400',
        dotClass: 'bg-emerald-600 dark:bg-emerald-400',
        imageBorder: 'border-emerald-500 shadow-md shadow-emerald-500/10'
      };
    case 'all':
    default:
      return {
        activeClass: 'border-teal-500 bg-teal-500/10 dark:bg-teal-950/40 ring-2 ring-teal-500/20 scale-105 font-black text-teal-600 dark:text-teal-400',
        dotClass: 'bg-teal-500 dark:bg-teal-400',
        imageBorder: 'border-teal-500 shadow-md shadow-teal-500/10'
      };
  }
};

export default function App() {
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('kqm_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  // Client connection state simulation (to test the offline sync)
  const [isOnline, setIsOnline] = useState(true);

  // Core Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('kqm_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('kqm_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Multi-vendor Dynamic Data State
  const [vendorName, setVendorName] = useState('ফয়সাল প্রিমিয়াম শুটকী বিতান');

  // Multi-view Active parameters
  const [isSellerMode, setIsSellerMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Direct Chat toggles
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Customer Account Session Controls
  const [loggedInCustomer, setLoggedInCustomer] = useState<Customer | null>(() => {
    const saved = localStorage.getItem('kqm_logged_in_customer');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCustomerDashboardOpen, setIsCustomerDashboardOpen] = useState(false);

  // Synchronise account persistence safely
  useEffect(() => {
    if (loggedInCustomer) {
      localStorage.setItem('kqm_logged_in_customer', JSON.stringify(loggedInCustomer));
    } else {
      localStorage.removeItem('kqm_logged_in_customer');
    }
  }, [loggedInCustomer]);

  // Handle session terminations gracefully
  const handleLogout = () => {
    setLoggedInCustomer(null);
    setIsCustomerDashboardOpen(false);
    setIsAdminMode(false);
    setIsSellerMode(false);
    
    // Add simple notification alert
    setNotifications(prev => [
      {
        id: `logout-${Date.now()}`,
        title: 'প্রোফাইল সাইন-আউট সম্পন্ন!',
        message: 'প্রোফাইল সফলভাবে সাইন আউট করা হয়েছে। পুনরায় ড্যাশবোর্ড এবং একাউন্ট ডিটেইলস দেখতে আবার লগইন করুন।',
        type: 'system',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
  };

  // Re-ordering core data copier logic
  const handleReorder = (orderItems: Array<{ productId: string; productName: string; price: number; quantity: number }>) => {
    let addedAnyProducts = false;
    const workingCart: CartItem[] = [...cart];

    orderItems.forEach(historicItem => {
      // Find matching item inside our main products list (which includes static + seller items)
      const exactProductObj = products.find(p => p.id === historicItem.productId);
      if (exactProductObj) {
        const matchingCartIdx = workingCart.findIndex(ci => ci.product.id === exactProductObj.id);
        if (matchingCartIdx > -1) {
          workingCart[matchingCartIdx].quantity += historicItem.quantity;
        } else {
          workingCart.push({
            product: exactProductObj,
            quantity: historicItem.quantity
          });
        }
        addedAnyProducts = true;
      }
    });

    if (addedAnyProducts) {
      setCart(workingCart);
      localStorage.setItem('kqm_cart', JSON.stringify(workingCart));
      
      // Close profile modal and open checkout/shoppping bag sliding drawer
      setIsCustomerDashboardOpen(false);
      setIsCartPanelOpen(true);

      // Notify consumer
      setNotifications(prev => [
        {
          id: `reorder-success-${Date.now()}`,
          title: 'রি-অর্ডার সফল হয়েছে!',
          message: 'আপনার পূর্ববর্তী অর্ডারের পণ্যগুলো কার্টে যোগ করা হয়েছে। দাম ও পরিমাণ চেক করে অর্ডার কনফার্ম করুন।',
          type: 'system',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    } else {
      alert('দুঃখিত, এই অর্ডারের পণ্যগুলো বর্তমানে স্টোরে উপলব্ধ নেই।');
    }
  };
  
  // Selected Details parameter
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart & Wishlist sliding panel visibility
  const [isCartPanelOpen, setIsCartPanelOpen] = useState(false);
  const [isWishlistPanelOpen, setIsWishlistPanelOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  // Notifications Array
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Offline syncing holding states
  const [offlineOrdersToSync, setOfflineOrdersToSync] = useState<Order[]>(() => {
    const saved = localStorage.getItem('kqm_offline_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [offlineProductsToSync, setOfflineProductsToSync] = useState<Product[]>(() => {
    const saved = localStorage.getItem('kqm_offline_products');
    return saved ? JSON.parse(saved) : [];
  });

  // Admin and customization configuration states
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState('');
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState('shuvokuakata27@gmail.com');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user && user.email === 'shuvokuakata27@gmail.com') {
        setIsAdminMode(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAdminPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthLoading(true);
    setAdminAuthError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPasswordInput })
      });
      const data = await response.json();
      if (data.success) {
        setIsAdminMode(true);
        setIsAdminAuthModalOpen(false);
        setAdminPasswordInput('');
        
        // Handle first login redirection flag
        if (data.isFirstLogin) {
          localStorage.setItem('kqm_admin_first_login', 'yes');
        }
        
        setNotifications(prev => [
          {
            id: `admin-login-${Date.now()}`,
            title: 'সুপার এডমিন লগইন সফল! 👑',
            message: `স্বাগতম এডমিন! আপনি কুয়াকাটা মাল্টিমিডিয়াতে পাসওয়ার্ড ভেরিফিকেশনের মাধ্যমে সুপার এডমিন হিসেবে অ্যাক্সেস পেয়েছেন।`,
            type: 'system',
            isRead: false,
            createdAt: new Date().toISOString()
          },
          ...prev
        ]);
      } else {
        setAdminAuthError(data.error || 'ভুল শংসাপত্র! আবার চেষ্টা করুন।');
      }
    } catch (err: any) {
      console.error('Admin Password Login Error:', err);
      setAdminAuthError('সার্ভারের সাথে যোগাযোগ করতে ত্রুটি হয়েছে।');
    } finally {
      setAdminAuthLoading(false);
    }
  };

  const handleAdminGoogleLogin = async () => {
    setAdminAuthLoading(true);
    setAdminAuthError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (user && user.email === 'shuvokuakata27@gmail.com') {
        setIsAdminMode(true);
        setIsAdminAuthModalOpen(false);
        setNotifications(prev => [
          {
            id: `admin-login-${Date.now()}`,
            title: 'সুপার এডমিন লগইন সফল! 👑',
            message: `স্বাগতম ${user.displayName || 'এডমিন'}! আপনি কুয়াকাটা মাল্টিমিডিয়াতে সুপার এডমিন হিসেবে অ্যাক্সেস পেয়েছেন।`,
            type: 'system',
            isRead: false,
            createdAt: new Date().toISOString()
          },
          ...prev
        ]);
      } else {
        // Log them back out if they are not the requested admin email
        await signOut(auth);
        setAdminAuthError('দুঃখিত, এই ইমেইলটি সুপার এডমিন হিসেবে নিবন্ধিত নয়!');
      }
    } catch (err: any) {
      console.error('Admin Login Error:', err);
      setAdminAuthError(err.message || 'গুগল লগইন করার সময় কোড ত্রুটি হয়েছে।');
    } finally {
      setAdminAuthLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await signOut(auth);
      setIsAdminMode(false);
      setNotifications(prev => [
        {
          id: `admin-logout-${Date.now()}`,
          title: 'সুপার এডমিন সাইন-আউট! 👋',
          message: 'আপনি আপনার এডমিন সেশন থেকে সফলভাবে প্রস্থান করেছেন।',
          type: 'system',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    } catch (err) {
      console.error('Error signing out admin:', err);
    }
  };

  const [orders, setOrders] = useState<Order[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    siteName: 'কুয়াকাটা মাল্টিমিডিয়া',
    siteTagline: 'Direct Coastal E-Shop',
    announcement: '১০০% ক্যাচ-ফ্রেশ গ্যারান্টি',
    heroTitle: 'সরাসরি সাগর থেকে',
    heroSub: 'তাজা মাছ, শুটকী ও কুয়াকাটার ঐতিহ্যবাহী উপহার',
    heroDesc: 'কুয়াকাটার বিখ্যাত আমরার টক-মিষ্টি আচার, সমুদ্রের আসল বালুমুক্ত লইট্টা ও রূপচাঁদা শুটকী, রাখাইনদের বোনা তাত সামগ্রী, নান্দনিক হস্তশিল্প এবং গভীর সমুদ্রের সদ্য ধরা পড়া গলদা চিংড়ি কোল্ড কুরিঙ্গারের মাধ্যমে অতি দ্রুত আমরা পৌঁছে দেব আপনার ঠিকানায়।',
    heroTheme: 'emerald',
    enableAiChat: true,
    enableSupportChat: true,
    enableOrderTracker: true,
    enableSellerMode: true,
    promoSectionTitle: 'সীমিত সময়ের বিশেষ অফারসমূহ ⚡',
    categorySectionTitle: 'আমাদের স্পেশাল ক্যাটাগরি সমূহ 🌟',
    productSectionTitle: 'আমাদের সব ক্যাটাগরির সেরা পণ্য সমূহ 🛍️',
    footerDesc: 'আমাদের সকল তাজা চিংড়ি ও কোরাল মাছ আইস-প্যাক বক্সে ফাস্ট এক্সপ্রেস রুটের মাধ্যমে ঢাকায় ২৪ ঘণ্টায় নিরাপদে ডেলিভারি করা হয়।',
    footerContact: '01712-345678',
    footerAddress: 'কুয়াকাটা চৌরাস্তা, মহিপুর, পটুয়াখালী, বাংলাদেশ'
  });

  // Persist settings
  useEffect(() => {
    localStorage.setItem('kqm_dark_mode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('kqm_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
PersistWishlist();
  }, [wishlist]);

  const PersistWishlist = () => {
    localStorage.setItem('kqm_wishlist', JSON.stringify(wishlist));
  };

  // Fetch initial products and notifications from server
  const fetchInventory = async () => {
    if (!isOnline) return; // Freeze if simulated offline
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (e) {
      console.warn('Network offline during catalog load, falling back to static schema.');
      setProducts(INITIAL_PRODUCTS);
    }
  };

  const fetchNotificationLogs = async () => {
    if (!isOnline) return;
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    if (!isOnline) return;
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (e) {
      console.error('Error fetching admin orders list', e);
    }
  };

  const fetchSiteSettings = async () => {
    if (!isOnline) return;
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSiteConfig(data.data);
      }
    } catch (e) {
      console.warn('Error fetching settings', e);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchNotificationLogs();
    fetchOrders();
    fetchSiteSettings();
  }, [isOnline]);

  // Synchronize dynamic offline data once connection transitions to ON
  const triggerAutoDataSyncState = async () => {
    if (offlineOrdersToSync.length === 0 && offlineProductsToSync.length === 0) {
      return;
    }

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localOrders: offlineOrdersToSync,
          localProducts: offlineProductsToSync
        })
      });
      const data = await res.json();

      if (data.success) {
        // Clear offline caches
        setOfflineOrdersToSync([]);
        setOfflineProductsToSync([]);
        localStorage.removeItem('kqm_offline_orders');
        localStorage.removeItem('kqm_offline_products');
        
        // Reload fresh server database
        await fetchInventory();
        await fetchNotificationLogs();

        // Create notification successful sync
        const newlyCreated: Notification = {
          id: `n-sync-${Date.now()}`,
          title: 'স্বয়ংক্রিয় অফলাইন ডাটা সিঙ্কড!',
          message: `${data.syncedProductsCount}টি পণ্য এবং ${data.syncedOrdersCount}টি অর্ডার সফলভাবে কুয়াকাটা সার্ভারের সাথে সমন্বয় বা সিঙ্ক করা হয়েছে।`,
          type: 'system',
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [newlyCreated, ...prev]);
      }
    } catch (err) {
      console.warn('Sync failed due to connectivity errors.', err);
    }
  };

  useEffect(() => {
    if (isOnline) {
      triggerAutoDataSyncState();
    }
  }, [isOnline]);

  // Handle Cart Functions
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('দুঃখিত, পণ্যটি বর্তমানে পর্যাপ্ত পরিমাণে স্টকে নেই!');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: Math.min(product.stock, item.quantity + 1) } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    
    // Auto slide cart panel open for visual confirmation
    setIsCartPanelOpen(true);
  };

  const handleDirectOrder = (product: Product) => {
    if (product.stock <= 0) {
      alert('দুঃখিত, পণ্যটি বর্তমানে পর্যাপ্ত পরিমাণে স্টকে নেই!');
      return;
    }
    setCart([{ product, quantity: 1 }]);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleWhatsAppOrder = (product: Product) => {
    const phoneNumber = '8801704256336';
    const text = `আসসালামু আলাইকুম। আমি কুয়াকাটা মাল্টিমিডিয়া থেকে এই পণ্যটি অর্ডার করতে চাই:
• পণ্যের নাম: ${product.name}
• মূল্য: ৳ ${product.price} (${product.unit})
• বিক্রেতা: ${product.vendorName}

অনুগ্রহ করে আমার অর্ডারটি কনফার্ম করুন।`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const renderProductCard = (p: Product) => {
    const isBookmarked = wishlist.some(item => item.id === p.id);
    return (
      <div
        key={p.id}
        className={`group rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg dark:hover:shadow-slate-900/50 hover:border-emerald-500/20 text-xs sm:text-xs select-none ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-850 hover:bg-slate-850' 
            : 'bg-white border-slate-100 hover:bg-slate-50/50'
        }`}
      >
        {/* Dynamic Product Cover top section */}
        <div className="relative aspect-video sm:aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer" onClick={() => { setSelectedProduct(p); }}>
          <img
            src={p.image}
            alt={p.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {p.specialOffer && (
            <span className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md bangla-text shadow">
              {p.specialOffer}
            </span>
          )}

          {/* Quick Wishlist add star overlay inside cover */}
          <button
            id={`catalog-quick-wish-${p.id}`}
            type="button"
            onClick={(e) => { e.stopPropagation(); handleToggleWishlist(p); }}
            className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all active:scale-95 ${
              isBookmarked 
                ? 'bg-rose-500 text-white shadow' 
                : 'bg-black/35 hover:bg-black/50 text-white'
            }`}
          >
            <Heart size={14} className={isBookmarked ? 'fill-white' : ''} />
          </button>
        </div>

        {/* Mid Details section */}
        <div className="p-3.5 sm:p-4 space-y-3.5 flex-grow flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                <span className="text-[10px] font-black font-mono text-slate-700 dark:text-slate-200">{p.rating.toFixed(1)}</span>
              </div>
              <span className="text-[9px] bg-red-600 text-white dark:bg-red-650 dark:text-white px-2.5 py-0.5 rounded-full font-mono uppercase font-black tracking-wider shadow-sm">
                {p.category.replace('_', ' ')}
              </span>
            </div>
            
            <h4 
              className="font-extrabold text-green-700 dark:text-green-400 bangla-text sm:text-xs leading-snug line-clamp-2 cursor-pointer hover:text-green-800 dark:hover:text-green-300 transition"
              onClick={() => { setSelectedProduct(p); }}
            >
              {p.name}
            </h4>
            <p className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold line-clamp-1">{p.englishName}</p>
          </div>

          <div className="space-y-3">
            {/* Price Line */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/10 flex items-baseline justify-between flex-wrap gap-1">
              <div>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-base font-black text-amber-500 font-mono">৳ {p.price}</span>
                  {p.regularPrice && p.regularPrice > p.price && (
                    <span className="text-slate-400 dark:text-slate-500 text-[10.5px] line-through font-mono">
                      ৳ {p.regularPrice}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] text-slate-600 dark:text-slate-300 block bangla-text font-bold">প্রতি {p.unit}</span>
                  {p.regularPrice && p.regularPrice > p.price && (
                    <span className="text-[9.5px] bg-rose-500/10 text-rose-500 dark:text-rose-450 font-extrabold px-1 rounded-sm">
                      {Math.round(((p.regularPrice - p.price) / p.regularPrice) * 100)}% ছাড়
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-[9px] text-slate-700 dark:text-slate-300 flex items-center gap-1 max-w-[105px] truncate font-extrabold">
                <Store size={10} className="text-amber-500 shrink-0" />
                <span className="bangla-text truncate">{p.vendorName}</span>
              </p>
            </div>

            {/* --- ACTION BUTTON DETAILS FOR EACH PRODUCT --- */}
            <div className="space-y-2">
              {/* Button 1: Buy Now (সরাসরি অর্ডার করুন) */}
              <button
                id={`direct-order-btn-${p.id}`}
                type="button"
                onClick={() => handleDirectOrder(p)}
                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:via-orange-400 hover:to-rose-500 text-white font-extrabold py-2 px-3 rounded-xl transition duration-155 transform shadow-sm hover:shadow-orange-500/20 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-[11px] outline-none select-none"
              >
                <Sparkles size={11} className="text-white shrink-0 animate-pulse" />
                <span className="bangla-text font-black text-[11px] leading-none">সরাসরি অর্ডার করুন</span>
              </button>

              {/* Button 2: Add to Cart */}
              <button
                id={`quick-cart-btn-${p.id}`}
                type="button"
                onClick={() => handleAddToCart(p)}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-extrabold py-2 px-3 rounded-xl transition duration-155 transform shadow-sm hover:shadow-blue-500/20 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-[11px] outline-none select-none"
                title="ব্যাগে যোগ করুন"
              >
                <ShoppingBag size={11} className="shrink-0 text-white" />
                <span className="bangla-text leading-none font-black text-[11px]">কার্টে যোগ করুন</span>
              </button>

              {/* Button 3: Order on WhatsApp */}
              <button
                id={`whatsapp-order-btn-${p.id}`}
                type="button"
                onClick={() => handleWhatsAppOrder(p)}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold py-2 px-3 rounded-xl transition duration-155 transform shadow-sm hover:shadow-emerald-500/20 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-[11px] outline-none select-none"
                title="হোয়াটসঅ্যাপে অর্ডার করুন"
              >
                <MessageSquare size={11} className="shrink-0 text-white" />
                <span className="bangla-text leading-none font-black text-[11px]">হোয়াটসঅ্যাপে অর্ডার করুন</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const handleUpdateCartQty = (productId: string, amount: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + amount;
        return { 
          ...item, 
          quantity: Math.max(1, Math.min(item.product.stock, newQty)) 
        };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Handle Wishlist Functions
  const handleToggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  // Handle dynamic additions from Seller Sub-dashboard module
  const handleVendorNewProduct = (newProd: Product) => {
    if (!isOnline) {
      // Offline mode caching
      const updatedProductsToSync = [newProd, ...offlineProductsToSync];
      setOfflineProductsToSync(updatedProductsToSync);
      localStorage.setItem('kqm_offline_products', JSON.stringify(updatedProductsToSync));
      
      // Update catalog listing in client screen in-memory as well
      setProducts(prev => [newProd, ...prev]);

      // Add local notice
      const localNotification: Notification = {
        id: `n-${Date.now()}`,
        title: 'অফলাইনে পণ্য সংরক্ষিত!',
        message: `আপনার পণ্য "${newProd.name}" অফলাইন মুডে স্থানীয়ভাবে ড্রাফট সেভ করা হয়েছে এবং ইন্টারনেট সক্রিয় হলে সিঙ্ক হবে।`,
        type: 'system',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [localNotification, ...prev]);
    } else {
      // Reload from server to be pristine
      fetchInventory();
    }
  };

  // Triggered on Order placed successfully inside CheckoutModal
  const handleSuccessfulOrder = (order: Order) => {
    if (!isOnline) {
      // Buffer the order locally to be sent later
      const updatedOrdersToSync = [order, ...offlineOrdersToSync];
      setOfflineOrdersToSync(updatedOrdersToSync);
      localStorage.setItem('kqm_offline_orders', JSON.stringify(updatedOrdersToSync));

      // Append local notifications
      setNotifications(prev => [
        {
          id: `n-order-local-${Date.now()}`,
          title: 'অফলাইন অর্ডার রেজিস্টার্ড!',
          message: `অর্ডার আইডি ${order.id} স্থানীয় ডাটাবেজে সংরক্ষণ করা হয়েছে। সিঙ্ক পেতে পুনরায় অনলাইন অ্যাক্সেস চেক করুন।`,
          type: 'order',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    } else {
      // Dynamic alerts and update loops
      fetchInventory();
      fetchNotificationLogs();
      fetchOrders();
    }
  };

  // Handle reviewing system live-appending in client with database simulation
  const handleAddProductReview = (productId: string, newReview: Review) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const updatedReviews = [newReview, ...p.reviews];
        // recalculate rating average
        const avg = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
        
        // If we choose to sync or update, can also notify state
        const updatedProd = { ...p, reviews: updatedReviews, rating: avg };
        
        // Auto update selected product in active modal state to prevent stale view
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct(updatedProd);
        }

        return updatedProd;
      }
      return p;
    }));
  };

  // Mark all notifications as read
  const handleClearNotifications = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    if (isOnline) {
      try {
        await fetch('/api/notifications/read', { method: 'POST' });
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Filter Catalog logic
  const filteredProducts = products.filter(prod => {
    const matchesSearch = 
      prod.name.includes(searchQuery) || 
      prod.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.includes(searchQuery) ||
      (prod.vendorName && prod.vendorName.includes(searchQuery));

    const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const popularProducts = products.filter(p => p.isPopular);
  const totalCartCost = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div className={`min-h-screen pb-20 md:pb-0 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50/50 text-slate-800'
    }`}>
      
      {/* Header with quick utilities */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartPanelOpen(true)}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setIsWishlistPanelOpen(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isSellerMode={isSellerMode}
        setIsSellerMode={(mode) => {
          if (mode) {
            if (loggedInCustomer && loggedInCustomer.role === 'seller') {
              setIsSellerMode(true);
              setIsAdminMode(false);
            } else {
              setIsLoginModalOpen(true);
            }
          } else {
            setIsSellerMode(false);
          }
        }}
        notifications={notifications}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenSupportChat={() => setIsSupportOpen(true)}
        onOpenNotifications={() => setIsNotificationPanelOpen(true)}
        onlineStatus={isOnline}
        isLoggedIn={loggedInCustomer !== null}
        loggedInCustomer={loggedInCustomer}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenCustomerDashboard={() => setIsCustomerDashboardOpen(true)}
        isAdminMode={isAdminMode}
        setIsAdminMode={(mode) => {
          if (mode) {
            if (loggedInCustomer && loggedInCustomer.role === 'admin') {
              setIsAdminMode(true);
              setIsSellerMode(false);
            } else {
              setIsLoginModalOpen(true);
            }
          } else {
            setIsAdminMode(false);
          }
        }}
        siteConfig={siteConfig}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Dynamic multi-view route control */}
        {isAdminMode ? (
          <SuperAdminDashboard
            products={products}
            orders={orders}
            onAddProduct={async (newProd) => {
              // Add product locally
              setProducts(prev => [newProd, ...prev]);
              // Post to server if online
              if (isOnline) {
                try {
                   const response = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: newProd.name,
                      englishName: newProd.englishName,
                      category: newProd.category,
                      price: newProd.price,
                      unit: newProd.unit,
                      description: newProd.description,
                      image: newProd.image,
                      stock: newProd.stock,
                      vendorName: newProd.vendorName,
                      specialOffer: newProd.specialOffer
                    })
                  });
                  const result = await response.json();
                  if (result.success) {
                    fetchInventory();
                  }
                } catch (err) {
                  console.error('Error posting admin product to backend:', err);
                }
              }
            }}
            onUpdateProductsList={async (updatedList) => {
              const previousList = [...products];
              setProducts(updatedList);
              
              if (!isOnline) return;

              if (updatedList.length < previousList.length) {
                const deletedProd = previousList.find(p => !updatedList.some(up => up.id === p.id));
                if (deletedProd) {
                  try {
                    await fetch(`/api/products/${deletedProd.id}`, { method: 'DELETE' });
                  } catch (e) {
                    console.error('Failed to delete product from server', e);
                  }
                }
              } else {
                updatedList.forEach(async (p) => {
                  const orig = previousList.find(op => op.id === p.id);
                  if (orig && (orig.price !== p.price || orig.stock !== p.stock)) {
                    try {
                      await fetch(`/api/products/${p.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ price: p.price, stock: p.stock })
                      });
                    } catch (e) {
                      console.error('Failed to update product details on server', e);
                    }
                  }
                });
              }
            }}
            onUpdateOrdersList={async (updatedOrders) => {
              const previousOrders = [...orders];
              setOrders(updatedOrders);

              if (!isOnline) return;

              updatedOrders.forEach(async (ord) => {
                const orig = previousOrders.find(o => o.id === ord.id);
                if (orig && (orig.status !== ord.status || orig.paymentStatus !== ord.paymentStatus)) {
                  try {
                    await fetch(`/api/orders/${ord.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: ord.status, paymentStatus: ord.paymentStatus })
                    });
                    fetchNotificationLogs();
                  } catch (e) {
                    console.error('Failed to update order status on server', e);
                  }
                }
              });
            }}
            siteConfig={siteConfig}
            isDarkMode={isDarkMode}
            onBroadcastNotification={async (title, message, type) => {
              if (isOnline) {
                try {
                  await fetch('/api/notifications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, message, type })
                  });
                  fetchNotificationLogs();
                } catch (e) {
                  console.error('Error broadcasting admin notification', e);
                }
              }
            }}
            onUpdateSiteConfig={async (newConfig) => {
              setSiteConfig(newConfig);
              if (isOnline) {
                try {
                  const res = await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newConfig)
                  });
                  const data = await res.json();
                  if (data.success && data.data) {
                    setSiteConfig(data.data);
                  }
                } catch (e) {
                  console.error('Error saving settings to backend:', e);
                }
              }
            }}
          />
        ) : isSellerMode ? (
          <SellerDashboard
            isDarkMode={isDarkMode}
            onProductAdded={handleVendorNewProduct}
            vendorName={vendorName}
            setVendorName={setVendorName}
          />
        ) : (
          <div className="space-y-8 antialiased">
            
            {/* HERO BANNER SECTION */}
            <div className={`relative rounded-3xl overflow-hidden p-6 sm:p-10 md:p-14 border transition-colors duration-300 ${
              isDarkMode 
                ? siteConfig.heroTheme === 'sunset'
                  ? 'bg-gradient-to-r from-amber-950/60 via-orange-950/40 to-rose-950/55 border-orange-950/50'
                  : 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-slate-800' 
                : siteConfig.heroTheme === 'sunset'
                  ? 'bg-gradient-to-r from-amber-100/60 via-orange-50/80 to-rose-100/60 border-orange-200/70'
                  : siteConfig.heroTheme === 'rose' 
                    ? 'bg-gradient-to-r from-rose-50 via-white to-amber-50/30 border-rose-100'
                    : 'bg-gradient-to-r from-emerald-50 via-white to-amber-50/30 border-emerald-100'
            } shadow-inner`}>
              
              <div className="relative z-10 w-full">
                <ProductHeroSlider
                  products={products}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  onSelectProduct={setSelectedProduct}
                  wishlist={wishlist}
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* Decorative design aesthetics */}
              <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-radial-gradient from-emerald-500/20 to-transparent pointer-events-none hidden md:block"></div>
            </div>


            {/* SPECIAL OFFERS PANEL SECTION */}
            {selectedCategory === 'all' && !searchQuery && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-6 bg-amber-500 rounded-sm"></div>
                  <h3 className="text-lg sm:text-lg font-bold bangla-text text-amber-600 dark:text-amber-400">
                    {siteConfig.promoSectionTitle || 'সীমিত সময়ের বিশেষ অফারসমূহ ⚡'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {products.filter(p => p.specialOffer).slice(0, 3).map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => { setSelectedProduct(p); }}
                      className={`p-4 sm:p-5 rounded-2xl border cursor-pointer hover:border-amber-500/30 transition-shadow dark:hover:shadow-amber-500/5 hover:shadow-lg flex gap-4 ${
                        isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-100'
                      }`}
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border bg-slate-50">
                        <img src={p.image} referrerPolicy="no-referrer" alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1 text-xs">
                        <span className="text-[9px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-bold font-sans tracking-wide uppercase uppercase">{p.specialOffer}</span>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 bangla-text line-clamp-1 mt-1 text-xs sm:text-xs">{p.name}</h4>
                        <p className="text-[10px] text-slate-450 line-clamp-1">{p.englishName}</p>
                        <div className="flex items-baseline gap-1.5 flex-wrap mt-0.5">
                          <span className="font-extrabold text-amber-500 font-mono">৳ {p.price}</span>
                          {p.regularPrice && p.regularPrice > p.price && (
                            <span className="text-slate-400 dark:text-slate-500 text-[10.5px] line-through font-mono">
                              ৳{p.regularPrice}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 bangla-text">({p.unit})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CATEGORIES HORIZONTAL SCROLL CAROUSEL */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-emerald-600 dark:bg-emerald-400 rounded-full"></div>
                  <h3 className="text-sm sm:text-base font-bold bangla-text text-slate-800 dark:text-slate-100">
                    {siteConfig.categorySectionTitle || 'আমাদের স্পেশাল ক্যাটাগরি সমূহ 🌟'}
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 bangla-text animate-pulse">
                  বামে-ডানে স্ক্রোল করুন ↔
                </span>
              </div>

              {/* Scroll Container */}
              <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none scroll-smooth snap-x antialiased">
                {HOME_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  const filterStyle = getCategoryActiveFilterStyle(cat.id);
                  return (
                    <button
                      id={`home-cat-card-${cat.id}`}
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setIsSellerMode(false);
                      }}
                      className={`snap-start flex flex-col items-center shrink-0 w-24 sm:w-28 p-3 rounded-2xl border transition-all duration-300 relative group cursor-pointer ${
                        isActive
                          ? filterStyle.activeClass
                          : 'border-slate-150 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-200 dark:hover:border-slate-700 hover:scale-102'
                      }`}
                    >
                      {/* Circle Image Frame */}
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 relative transition-all duration-300 ${
                        isActive
                          ? filterStyle.imageBorder
                          : 'border-slate-100 dark:border-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700'
                      }`}>
                        <img
                          src={cat.image}
                          alt={cat.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t opacity-15 ${cat.color}`}></div>
                      </div>

                      {/* Text label */}
                      <div className="text-center mt-2.5 space-y-0.5">
                        <p className={`text-xs font-bold leading-tight bangla-text line-clamp-1 ${
                          isActive 
                            ? 'font-extrabold' 
                            : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {cat.label}
                        </p>
                        <p className={`text-[9px] line-clamp-1 font-sans ${
                          isActive
                            ? 'text-current opacity-85 font-medium'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {cat.shortLabel}
                        </p>
                      </div>

                      {/* Accent dynamic dot */}
                      {isActive && (
                        <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${filterStyle.dotClass}`}></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DYNAMIC CATALOG SECTION */}
            <div className="space-y-8">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-150/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-6 bg-emerald-600 rounded-sm"></div>
                  <h3 className="text-lg sm:text-xl font-bold bangla-text text-emerald-600 dark:text-emerald-400">
                    {selectedCategory === 'all' && !searchQuery ? (siteConfig.productSectionTitle || 'আমাদের সব ক্যাটাগরির সেরা পণ্য সমূহ 🛍️') : `ক্যাটাগরি: ${INITIAL_PRODUCTS.find(i=>i.category===selectedCategory)?.category.replace('_',' ') || selectedCategory}`}
                  </h3>
                  <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full font-mono text-slate-500 dark:text-slate-400 sm:inline hidden">
                    ({filteredProducts.length} টি পন্য প্রদর্শন করা হচ্ছে)
                  </span>
                </div>

                {searchQuery && (
                  <p className="text-xs text-slate-500 bangla-text">
                    অনুসন্ধান ফলাফল: "<span className="text-emerald-600 font-bold">{searchQuery}</span>"
                  </p>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <Bookmark size={48} className="mx-auto text-slate-300 animate-bounce" />
                  <div>
                    <h4 className="font-bold text-sm bangla-text">কোনো পণ্য খুঁজে পাওয়া যায়নি!</h4>
                    <p className="text-[11px] text-slate-450 bangla-text max-w-sm mx-auto mt-1">দুঃখিত, অনুসন্ধান কুয়েরির সাথে মিল রয়েছে এমন কোনো শুটকী বা আচার কিংবা তাজা মাছ পাওয়া যায়নি। ক্যাটাগরি পরিবর্তন করে ট্রাই করুন।</p>
                  </div>
                  <button 
                    id="catalog-reset-filters"
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs px-5 py-2.5 rounded-xl transition"
                  >
                    ফিল্টার ক্লিয়ার করুন
                  </button>
                </div>
              ) : (
                /* CHECK IF WE DO CATEGORIZED VIEW */
                (selectedCategory === 'all' && !searchQuery) ? (
                  <div className="space-y-12">
                    {HOME_CATEGORIES.filter(cat => cat.id !== 'all').map((cat) => {
                      const categoryProducts = filteredProducts.filter(p => p.category === cat.id);
                      if (categoryProducts.length === 0) return null;
                      
                      const style = getCategoryStyle(cat.id);
                      return (
                        <div key={cat.id} className="space-y-4">
                          {/* Category Header banner */}
                          <div className={`flex items-center justify-between p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 ${style.bg} ${style.border}`}>
                            <div className="flex items-center gap-3">
                              {/* Small thumb */}
                              <div className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-xs ${style.avatarBorder}`}>
                                <img src={cat.image} referrerPolicy="no-referrer" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt={cat.label} />
                              </div>
                              <div>
                                <h4 className={`font-extrabold text-xs sm:text-sm bangla-text flex items-center gap-2 ${style.title}`}>
                                  {cat.label} 
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-extrabold ${style.badge}`}>
                                    {categoryProducts.length} টি পণ্য
                                  </span>
                                </h4>
                                <p className={`text-[10px] font-semibold bangla-text opacity-90 ${style.sub}`}>{cat.shortLabel}</p>
                              </div>
                            </div>
                            
                            <button
                              id={`view-more-cat-${cat.id}`}
                              onClick={() => { setSelectedCategory(cat.id); }}
                              className={`text-xs font-bold bangla-text hover:underline transition-all flex items-center gap-1 cursor-pointer duration-300 ${style.btn}`}
                            >
                              সব দেখুন <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>

                          {/* Category Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {categoryProducts.map((p) => renderProductCard(p))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Standard single catalog grid list (for searched list or specific category page) */
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filteredProducts.map((p) => renderProductCard(p))}
                  </div>
                )
              )}

            </div>

          </div>
        )}

      </div>

      {/* FOOTER AREA AESTHETICS */}
      <footer className={`mt-20 border-t py-12 text-center text-xs transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 text-slate-400' 
          : 'bg-white border-slate-100 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="bangla-text text-sm font-semibold tracking-wide text-emerald-600 dark:text-emerald-400">
            {siteConfig.siteName || 'কুয়াকাটা মাল্টিমিডিয়া'} — {siteConfig.siteTagline || 'Direct Coastal E-Shop'}
          </p>
          <p className="bangla-text max-w-xl mx-auto opacity-75 leading-relaxed">
            {siteConfig.footerDesc || 'আমাদের সকল তাজা চিংড়ি ও কোরাল মাছ আইস-প্যাক বক্সে ফাস্ট এক্সপ্রেস রুটের মাধ্যমে ঢাকায় ২৪ ঘণ্টায় নিরাপদে ডেলিভারি করা হয়।'}
          </p>
          
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] opacity-75">
            {siteConfig.footerContact && (
              <span className="bangla-text font-medium">
                📞 গ্রাহক সেবা: <span className="font-sans text-emerald-600 dark:text-emerald-450 font-bold">{siteConfig.footerContact}</span>
              </span>
            )}
            {siteConfig.footerAddress && (
              <span className="bangla-text font-medium">
                📍 ঠিকানা: <span className="font-sans">{siteConfig.footerAddress}</span>
              </span>
            )}
          </div>

          <div className="flex justify-center gap-4 text-xs font-bold pt-2 shrink-0">
            <span className="bangla-text cursor-pointer hover:opacity-100">শর্তাবলী</span>
            <span>•</span>
            <span className="bangla-text cursor-pointer hover:opacity-100">প্রাইভেসি পলিসি</span>
            <span>•</span>
            <span className="bangla-text cursor-pointer hover:opacity-100">হেল্প সেন্টার</span>
          </div>
          <p className="text-[10px] font-mono opacity-60">© 2026 {siteConfig.siteName || 'Kuakata Multimedia Ltd'}. SSL Protected / Double Encrypted Gateway Enabled.</p>
        </div>
      </footer>

      {/* --- CART PANEL SIDE DRAWER --- */}
      {isCartPanelOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition" onClick={() => setIsCartPanelOpen(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-md flex flex-col justify-between text-xs sm:text-xs shadow-2xl animate-slide-left ${
              isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800'
            }`}>
              {/* Cart Drawer Header */}
              <div className="p-5 border-b border-slate-150/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="text-emerald-600" size={20} />
                  <h3 className="text-sm font-bold bangla-text">আপনার শপিং ব্যাগ</h3>
                  <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-bold font-mono text-[10px]">{cart.length} টি পণ্য</span>
                </div>
                <button 
                  id="close-cart-drawer-btn"
                  onClick={() => setIsCartPanelOpen(false)} 
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20 space-y-3 opacity-60">
                    <ShoppingBag size={48} className="mx-auto text-emerald-600 animate-pulse" />
                    <p className="bangla-text">আপনার শপিং ব্যাগ বর্তমানে সম্পূর্ণ খালি!</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="flex gap-4 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/10">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border bg-slate-50">
                        <img src={item.product.image} referrerPolicy="no-referrer" alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-bold line-clamp-1 bangla-text">{item.product.name}</h4>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-500 font-mono">৳ {item.product.price} <span className="text-[9px] text-slate-400">({item.product.unit})</span></span>
                          
                          {/* Quantity selector controls */}
                          <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 rounded-lg py-0.5 px-1.5 font-mono text-[10px]">
                            <button 
                              id={`cart-qty-dec-${item.product.id}`}
                              onClick={() => { if (item.quantity > 1) handleUpdateCartQty(item.product.id, -1); }}
                              className="px-1 hover:text-emerald-600 font-bold"
                            >
                              -
                            </button>
                            <span className="font-bold">{item.quantity}</span>
                            <button 
                              id={`cart-qty-inc-${item.product.id}`}
                              onClick={() => { handleUpdateCartQty(item.product.id, 1); }}
                              className="px-1 hover:text-emerald-600 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <button 
                        id={`cart-remove-item-${item.product.id}`}
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg self-center"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer footer totals */}
              <div className="p-5 border-t border-slate-150/10 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                <div className="flex justify-between items-baseline font-bold">
                  <span className="bangla-text text-sm">উপ-মোট মূল্য:</span>
                  <span className="text-xl font-black text-rose-500 font-mono">৳ {totalCartCost}</span>
                </div>
                <button
                  id="checkout-drawer-trigger-btn"
                  onClick={() => {
                    if (cart.length === 0) {
                      alert('আপনার কার্ট খালি!');
                      return;
                    }
                    setIsCartPanelOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer shadow-md text-xs sm:text-xs"
                >
                  <span className="bangla-text">নিরাপদ বুকিংয়ে যান</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- WISHLIST PANEL SIDE DRAWER --- */}
      {isWishlistPanelOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition" onClick={() => setIsWishlistPanelOpen(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-md flex flex-col justify-between text-xs sm:text-xs shadow-2xl animate-slide-left ${
              isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800'
            }`}>
              
              <div className="p-5 border-b border-slate-150/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="text-rose-500 fill-rose-500" size={20} />
                  <h3 className="text-sm font-bold bangla-text">পছন্দের তালিকা (উইশলিস্ট)</h3>
                </div>
                <button 
                  id="close-wishlist-drawer-btn"
                  onClick={() => setIsWishlistPanelOpen(false)} 
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {wishlist.length === 0 ? (
                  <div className="text-center py-20 space-y-3 opacity-60">
                    <Heart size={48} className="mx-auto text-rose-500 animate-pulse" />
                    <p className="bangla-text">কোনো পণ্য পছন্দের তালিকায় যুক্ত করা নেই।</p>
                  </div>
                ) : (
                  wishlist.map((prod) => (
                    <div key={prod.id} className="flex gap-4 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/10 items-center">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border bg-slate-50 cursor-pointer" onClick={() => { setSelectedProduct(prod); setIsWishlistPanelOpen(false); }}>
                        <img src={prod.image} referrerPolicy="no-referrer" alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-bold line-clamp-1 bangla-text cursor-pointer hover:text-emerald-600 transition" onClick={() => { setSelectedProduct(prod); setIsWishlistPanelOpen(false); }}>{prod.name}</h4>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-500 font-mono">৳ {prod.price}</span>
                          
                          <button
                            id={`wishlist-drawer-move-to-cart-${prod.id}`}
                            onClick={() => { handleAddToCart(prod); handleToggleWishlist(prod); }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 text-[10px] rounded hover:scale-105 transition cursor-pointer"
                          >
                            <span className="bangla-text">ব্যাগে রিলোড</span>
                          </button>
                        </div>
                      </div>
                      <button 
                        id={`wishlist-drawer-remove-${prod.id}`}
                        onClick={() => handleToggleWishlist(prod)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-5 border-t border-slate-150/10">
                <button
                  id="wishlist-drawer-close-bulk"
                  onClick={() => setIsWishlistPanelOpen(false)}
                  className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 hover:dark:bg-slate-700 font-bold py-3.5 rounded-xl transition"
                >
                  <span className="bangla-text">উইন্ডো বন্ধ করুন</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- NOTIFICATIONS POPUP DRAWER --- */}
      {isNotificationPanelOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition" onClick={() => setIsNotificationPanelOpen(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-md flex flex-col justify-between text-xs sm:text-xs shadow-2xl animate-slide-left ${
              isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800'
            }`}>
              
              <div className="p-5 border-b border-slate-150/10 flex items-center justify-between">
                <h3 className="text-sm font-bold bangla-text flex items-center gap-2">
                  <span>ঘোষণা ও নোটিফিকেশন সমূহ</span>
                </h3>
                <div className="flex items-center gap-1.5">
                  <button 
                    id="clear-all-notifs"
                    onClick={handleClearNotifications}
                    className="p-1 px-2.5 bg-emerald-500/10 rounded-lg text-emerald-600 text-[10px] font-bold"
                  >
                    সবগুলো রিড মার্ক করুন
                  </button>
                  <button 
                    id="close-notifs-drawer"
                    onClick={() => setIsNotificationPanelOpen(false)} 
                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Notifications Listing */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-slate-400 font-sans italic text-xs text-center bangla-text py-16">কোনো নোটিফিকেশন তথ্য পাওয়া যায়নি।</p>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-4 rounded-2xl border text-xs relative ${
                        !n.isRead 
                          ? 'border-emerald-500/25 bg-emerald-500/5' 
                          : 'border-slate-100 dark:border-slate-800/10'
                      }`}
                    >
                      {!n.isRead && (
                        <span className="absolute top-4 right-4 bg-emerald-500 w-2 h-2 rounded-full"></span>
                      )}
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-100 bangla-text">{n.title}</h4>
                      <p className="bangla-text text-slate-500 dark:text-slate-400 whitespace-pre-wrap mt-1 leading-relaxed">{n.message}</p>
                      <span className="block text-[8px] text-right text-slate-400 font-sans mt-2">
                        {new Date(n.createdAt).toLocaleTimeString('bn', { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString('bn')}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="p-5 border-t border-slate-150/10">
                <button
                  id="close-notifs-btn"
                  onClick={() => setIsNotificationPanelOpen(false)}
                  className="w-full bg-slate-200 dark:bg-slate-800 font-bold py-3 rounded-xl transition text-xs"
                >
                  <span className="bangla-text">বন্ধ করুন</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- INTEGRATED INDIVIDUAL MODALS FLOW --- */}

      {/* 1. Gemini Chatbot Panel (Floating Absolute Bottom Trigger) */}
      {siteConfig.enableAiChat && (
        <Chatbot isDarkMode={isDarkMode} />
      )}

      {/* 2. Direct Support Chat */}
      {siteConfig.enableSupportChat && (
        <SupportChat
          isOpen={isSupportOpen}
          onClose={() => setIsSupportOpen(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* 3. Order Tracker Popup */}
      {siteConfig.enableOrderTracker && (
        <OrderTracker
          isOpen={isTrackerOpen}
          onClose={() => setIsTrackerOpen(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* 4. Checkout Modal dialog */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        totalAmount={totalCartCost}
        isDarkMode={isDarkMode}
        onOrderSuccess={handleSuccessfulOrder}
        onClearCart={() => setCart([])}
        loggedInCustomer={loggedInCustomer}
      />

      {/* 5. Product Details Modal popup review */}
      <ProductDetailsModal
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        isDarkMode={isDarkMode}
        onAddReview={handleAddProductReview}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={selectedProduct ? wishlist.some(p => p.id === selectedProduct.id) : false}
        onAddToCart={handleAddToCart}
        onDirectOrder={handleDirectOrder}
        onWhatsAppOrder={handleWhatsAppOrder}
        loggedInCustomer={loggedInCustomer}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        hasPurchasedProduct={selectedProduct && loggedInCustomer ? orders.some(o => o.customerPhone === loggedInCustomer.phone && o.status === 'delivered' && o.items.some(it => it.productId === selectedProduct.id)) : false}
      />

      {/* 6. Customer Login & first-time Register password setter */}
      <CustomerLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        isDarkMode={isDarkMode}
        onLoginSuccess={(user: any) => {
          setLoggedInCustomer(user);
          
          if (user.role === 'admin') {
            setIsAdminMode(true);
            setIsSellerMode(false);
            setNotifications(prev => [
              {
                id: `admin-login-${Date.now()}`,
                title: 'সুপার এডমিন লগইন সফল! 👑',
                message: `স্বাগতম ${user.name}! আপনি কুয়াকাটা মাল্টিমিডিয়াতে সুপার এডমিন হিসেবে অ্যাক্সেস পেয়েছেন।`,
                type: 'system',
                isRead: false,
                createdAt: new Date().toISOString()
              },
              ...prev
            ]);
          } else if (user.role === 'seller') {
            setIsSellerMode(true);
            setIsAdminMode(false);
            setVendorName(user.name);
            setNotifications(prev => [
              {
                id: `seller-login-${Date.now()}`,
                title: 'সেলার লগইন সফল! 🏪',
                message: `স্বাগতম ${user.name}! আপনার সেলিং ড্যাশবোর্ড সক্রিয় করা হয়েছে। আপনি এখন পণ্য আপলোড এবং ইনভেন্টরি ম্যানেজ করতে পারবেন।`,
                type: 'system',
                isRead: false,
                createdAt: new Date().toISOString()
              },
              ...prev
            ]);
          } else {
            setIsAdminMode(false);
            setIsSellerMode(false);
            setNotifications(prev => [
              {
                id: `customer-login-${Date.now()}`,
                title: 'লগইন সফল হয়েছে! 🛍️',
                message: `স্বাগতম ${user.name}! আপনার কাস্টমার ড্যাশবোর্ড সক্রিয় করা হয়েছে। এখন আপনার ইমেইল বা মোবাইল দিয়ে অর্ডার ট্র্যাক করতে পারবেন।`,
                type: 'system',
                isRead: false,
                createdAt: new Date().toISOString()
              },
              ...prev
            ]);
          }
        }}
      />

      {/* 7. Customer Dashboard Details (Order history tracker & Re-ordering mechanism) */}
      <CustomerDashboardModal
        isOpen={isCustomerDashboardOpen}
        onClose={() => setIsCustomerDashboardOpen(false)}
        isDarkMode={isDarkMode}
        customerPhone={loggedInCustomer?.phone || ''}
        customerName={loggedInCustomer?.name || ''}
        onLogout={handleLogout}
        onReorder={handleReorder}
      />

      {/* Unified Authentication handles Admin Access seamlessly */}

      {/* --- PREMIUM MOBILE-APP BOTTOM NAV BAR OPTIMIZATION --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/80 z-40 pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_24px_rgba(0,0,0,0.2)]">
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
          {/* Tab 1: Home Feed */}
          <button
            id="mobile-tab-home"
            onClick={() => {
              setIsSellerMode(false);
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
              !isSellerMode ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Compass size={20} className={!isSellerMode ? 'scale-110 text-emerald-600 dark:text-emerald-400' : ''} />
            <span className="text-[10px] bangla-text">প্রথম পাতা</span>
          </button>

          {/* Tab 2: Wishlist */}
          <button
            id="mobile-tab-wishlist"
            onClick={() => setIsWishlistPanelOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all active:scale-95 relative"
          >
            <div className="relative">
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span className="text-[10px] bangla-text">পছন্দ</span>
          </button>

          {/* Tab 3: Cart */}
          <button
            id="mobile-tab-cart"
            onClick={() => setIsCartPanelOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all active:scale-95 relative"
          >
            <div className="relative">
              <ShoppingBag size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </div>
            <span className="text-[10px] bangla-text">কার্ট</span>
          </button>

          {/* Tab 4: Direct Support Live Chat */}
          <button
            id="mobile-tab-support"
            onClick={() => setIsSupportOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all active:scale-95 relative"
          >
            <MessageSquare size={20} />
            <span className="text-[10px] bangla-text">সাপোর্ট</span>
          </button>

          {/* Tab 5: Seller/Vendor Dashboard toggle */}
          <button
            id="mobile-tab-seller"
            onClick={() => {
              if (loggedInCustomer && loggedInCustomer.role === 'seller') {
                setIsSellerMode(true);
                setIsAdminMode(false);
              } else {
                setIsLoginModalOpen(true);
              }
            }}
            className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
              isSellerMode ? 'text-rose-500 font-semibold animate-pulse' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Store size={20} className={isSellerMode ? 'scale-110 text-rose-500' : ''} />
            <span className="text-[10px] bangla-text">দোকান</span>
          </button>
        </div>
      </div>

    </div>
  );
}
