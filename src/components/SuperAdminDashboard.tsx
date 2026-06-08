/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ToggleLeft, 
  ToggleRight, 
  LayoutDashboard, 
  Sparkles, 
  Database, 
  ShoppingBag, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Radio, 
  TrendingUp, 
  Users, 
  Activity, 
  Monitor, 
  Check, 
  Save, 
  Package, 
  ChevronRight, 
  Clock, 
  HelpCircle,
  Truck,
  DollarSign,
  Briefcase,
  AlertCircle,
  Image as ImageIcon,
  User
} from 'lucide-react';
import { Product, Order, Notification } from '../types';
import ImageUploaderWithCrop from './ImageUploaderWithCrop';

export interface SiteConfig {
  siteName: string;
  siteTagline: string;
  announcement: string;
  heroTitle: string;
  heroSub: string;
  heroDesc: string;
  heroTheme: 'emerald' | 'oceanic' | 'sunset' | 'royal' | 'rose' | 'dark';
  enableAiChat: boolean;
  enableSupportChat: boolean;
  enableOrderTracker: boolean;
  enableSellerMode: boolean;
  promoSectionTitle: string;
  categorySectionTitle: string;
  productSectionTitle: string;
  footerDesc: string;
  footerContact: string;
  footerAddress: string;
}

interface SuperAdminDashboardProps {
  isDarkMode: boolean;
  products: Product[];
  orders: Order[];
  onAddProduct: (prod: Product) => void;
  onUpdateProductsList: (prods: Product[]) => void;
  onUpdateOrdersList: (orders: Order[]) => void;
  siteConfig: SiteConfig;
  onUpdateSiteConfig: (config: SiteConfig) => void;
  onBroadcastNotification: (title: string, message: string, type: 'order' | 'offer' | 'system') => void;
}

export default function SuperAdminDashboard({
  isDarkMode,
  products,
  orders,
  onAddProduct,
  onUpdateProductsList,
  onUpdateOrdersList,
  siteConfig,
  onUpdateSiteConfig,
  onBroadcastNotification
}: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'product_upload' | 'inventory' | 'orders' | 'customization' | 'features' | 'broadcast' | 'settings_security'
  >(() => {
    const isFirstTime = localStorage.getItem('kqm_admin_first_login');
    if (isFirstTime === 'yes') {
      localStorage.removeItem('kqm_admin_first_login'); // consume redirect flag
      return 'settings_security';
    }
    return 'overview';
  });

  // Security password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassError, setChangePassError] = useState('');
  const [changePassSuccess, setChangePassSuccess] = useState('');
  const [changePassLoading, setChangePassLoading] = useState(false);

  // User Provisioning & Account Creation states
  const [provName, setProvName] = useState('');
  const [provPhone, setProvPhone] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provPassword, setProvPassword] = useState('');
  const [provRole, setProvRole] = useState<'customer' | 'seller' | 'admin'>('seller');
  const [provLoading, setProvLoading] = useState(false);
  const [provError, setProvError] = useState('');
  const [provSuccess, setProvSuccess] = useState('');

  // Loaded system users list for audits
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  const fetchSystemUsers = async () => {
    setFetchingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setSystemUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'settings_security') {
      fetchSystemUsers();
    }
  }, [activeTab]);
  
  // Customization Local State
  const [siteName, setSiteName] = useState(siteConfig.siteName);
  const [siteTagline, setSiteTagline] = useState(siteConfig.siteTagline);
  const [announcement, setAnnouncement] = useState(siteConfig.announcement);
  const [heroTitle, setHeroTitle] = useState(siteConfig.heroTitle);
  const [heroSub, setHeroSub] = useState(siteConfig.heroSub);
  const [heroDesc, setHeroDesc] = useState(siteConfig.heroDesc);
  const [heroTheme, setHeroTheme] = useState<SiteConfig['heroTheme']>(siteConfig.heroTheme);
  const [promoSectionTitle, setPromoSectionTitle] = useState(siteConfig.promoSectionTitle || 'সীমিত সময়ের বিশেষ অফারসমূহ ⚡');
  const [categorySectionTitle, setCategorySectionTitle] = useState(siteConfig.categorySectionTitle || 'আমাদের স্পেশাল ক্যাটাগরি সমূহ 🌟');
  const [productSectionTitle, setProductSectionTitle] = useState(siteConfig.productSectionTitle || 'আমাদের সব ক্যাটাগরির সেরা পণ্য সমূহ 🛍️');
  const [footerDesc, setFooterDesc] = useState(siteConfig.footerDesc || 'আমাদের সকল তাজা চিংড়ি ও কোরাল মাছ আইস-প্যাক বক্সে ফাস্ট এক্সপ্রেস রুটের মাধ্যমে ঢাকায় ২৪ ঘণ্টায় নিরাপদে ডেলিভারি করা হয়।');
  const [footerContact, setFooterContact] = useState(siteConfig.footerContact || '01712-345678');
  const [footerAddress, setFooterAddress] = useState(siteConfig.footerAddress || 'কুয়াকাটা চৌরাস্তা, মহিপুর, পটুয়াখালী, বাংলাদেশ');
  
  // Feature flags
  const [enableAiChat, setEnableAiChat] = useState(siteConfig.enableAiChat);
  const [enableSupportChat, setEnableSupportChat] = useState(siteConfig.enableSupportChat);
  const [enableOrderTracker, setEnableOrderTracker] = useState(siteConfig.enableOrderTracker);
  const [enableSellerMode, setEnableSellerMode] = useState(siteConfig.enableSellerMode);

  // New Product Creator State
  const [newProdName, setNewProdName] = useState('');
  const [newProdEnglish, setNewProdEnglish] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdRegularPrice, setNewProdRegularPrice] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('১ কেজি');
  const [newProdCategory, setNewProdCategory] = useState<Product['category']>('pickle');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdStock, setNewProdStock] = useState('25');
  const [newProdOffer, setNewProdOffer] = useState('');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1622264939103-6a97800c1e6c?auto=format&fit=crop&q=80&w=400');
  const [newProdSliderImage, setNewProdSliderImage] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('all');

  // Product Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editRegularPrice, setEditRegularPrice] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editCategory, setEditCategory] = useState<Product['category']>('pickle');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editOffer, setEditOffer] = useState('');

  // Push notification state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState<'system' | 'offer' | 'order'>('system');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Action status indicators
  const [configSaved, setConfigSaved] = useState(false);
  const [featuresSaved, setFeaturesSaved] = useState(false);

  // Sync state values when siteConfig updates externally
  useEffect(() => {
    setSiteName(siteConfig.siteName);
    setSiteTagline(siteConfig.siteTagline);
    setAnnouncement(siteConfig.announcement);
    setHeroTitle(siteConfig.heroTitle);
    setHeroSub(siteConfig.heroSub);
    setHeroDesc(siteConfig.heroDesc);
    setHeroTheme(siteConfig.heroTheme);
    setEnableAiChat(siteConfig.enableAiChat);
    setEnableSupportChat(siteConfig.enableSupportChat);
    setEnableOrderTracker(siteConfig.enableOrderTracker);
    setEnableSellerMode(siteConfig.enableSellerMode);
    setPromoSectionTitle(siteConfig.promoSectionTitle || 'সীমিত সময়ের বিশেষ অফারসমূহ ⚡');
    setCategorySectionTitle(siteConfig.categorySectionTitle || 'আমাদের স্পেশাল ক্যাটাগরি সমূহ 🌟');
    setProductSectionTitle(siteConfig.productSectionTitle || 'আমাদের সব ক্যাটাগরির সেরা পণ্য সমূহ 🛍️');
    setFooterDesc(siteConfig.footerDesc || 'আমাদের সকল তাজা চিংড়ি ও কোরাল মাছ আইস-প্যাক বক্সে ফাস্ট এক্সপ্রেস রুটের মাধ্যমে ঢাকায় ২৪ ঘণ্টায় নিরাপদে ডেলিভারি করা হয়।');
    setFooterContact(siteConfig.footerContact || '01712-345678');
    setFooterAddress(siteConfig.footerAddress || 'কুয়াকাটা চৌরাস্তা, মহিপুর, পটুয়াখালী, বাংলাদেশ');
  }, [siteConfig]);

  // Handle saving customization layouts
  const handleSaveCustomization = async () => {
    const updated: SiteConfig = {
      ...siteConfig,
      siteName,
      siteTagline,
      announcement,
      heroTitle,
      heroSub,
      heroDesc,
      heroTheme,
      promoSectionTitle,
      categorySectionTitle,
      productSectionTitle,
      footerDesc,
      footerContact,
      footerAddress
    };
    onUpdateSiteConfig(updated);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  // Handle saving platform features switches
  const handleSaveFeatures = async () => {
    const updated: SiteConfig = {
      ...siteConfig,
      enableAiChat,
      enableSupportChat,
      enableOrderTracker,
      enableSellerMode
    };
    onUpdateSiteConfig(updated);
    setFeaturesSaved(true);
    setTimeout(() => setFeaturesSaved(false), 3000);
  };

  // Create standard system product in the database pool
  const handleAddSystemProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    // Bangla number digit converter
    const convertToBanglaNumbers = (num: string | number): string => {
      const banglaDigits: { [key: string]: string } = {
        '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
        '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
      };
      return String(num).replace(/[0-9]/g, digit => banglaDigits[digit] || digit);
    };

    const numPrice = Number(newProdPrice);
    const numRegPrice = newProdRegularPrice.trim() ? Number(newProdRegularPrice) : 0;
    
    let calculatedOffer = newProdOffer.trim();
    if (!calculatedOffer && numRegPrice > numPrice) {
      const discountP = Math.round(((numRegPrice - numPrice) / numRegPrice) * 100);
      if (discountP > 0) {
        calculatedOffer = `${convertToBanglaNumbers(discountP)}% ছাড়`;
      }
    }

    const added: Product = {
      id: `p-sys-${Date.now()}`,
      name: newProdName,
      englishName: newProdEnglish || 'System Item',
      price: numPrice,
      regularPrice: numRegPrice > 0 ? numRegPrice : undefined,
      unit: newProdUnit,
      category: newProdCategory,
      description: newProdDesc || 'সিস্টেম অ্যাডমিন প্যানেল দ্বারা কাস্টমাইজড পণ্য।',
      image: newProdImage || 'https://images.unsplash.com/photo-1544526226-d4568090ffb8?auto=format&fit=crop&q=80&w=400',
      sliderImage: newProdSliderImage.trim() || undefined,
      rating: 5.0,
      reviews: [],
      vendorId: 'super-admin',
      vendorName: 'সিস্টেম গ্লোবাল এডমিন',
      stock: Number(newProdStock) || 20,
      specialOffer: calculatedOffer || undefined
    };

    onAddProduct(added);
    
    // Clear fields
    setNewProdName('');
    setNewProdEnglish('');
    setNewProdPrice('');
    setNewProdRegularPrice('');
    setNewProdUnit('১ কেজি');
    setNewProdDesc('');
    setNewProdStock('25');
    setNewProdOffer('');
    setNewProdSliderImage('');
    
    alert('অভিনন্দন! ক্যাটালগে সফলভাবে নতুন পণ্য যুক্ত করা হয়েছে ও লাইভ করা হয়েছে।');
  };

  // Quick edit product fields in list state
  const handleQuickUpdateStock = (productId: string, delta: number) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        return { ...p, stock: Math.max(0, p.stock + delta) };
      }
      return p;
    });
    onUpdateProductsList(updated);
  };

  const handleQuickUpdatePrice = (productId: string, newPrice: number) => {
    if (newPrice <= 0 || isNaN(newPrice)) return;
    const updated = products.map(p => {
      if (p.id === productId) {
        return { ...p, price: newPrice };
      }
      return p;
    });
    onUpdateProductsList(updated);
  };

  // Delete product immediately
  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই পণ্যটি চিরতরে মুছে ফেলতে চান?')) {
      const filtered = products.filter(p => p.id !== productId);
      onUpdateProductsList(filtered);
    }
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditPrice(String(prod.price));
    setEditRegularPrice(prod.regularPrice ? String(prod.regularPrice) : '');
    setEditUnit(prod.unit);
    setEditStock(String(prod.stock || '0'));
    setEditCategory(prod.category);
    setEditDescription(prod.description || '');
    setEditImage(prod.image);
    setEditOffer(prod.specialOffer || '');
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Bangla number digit converter
    const convertToBanglaNumbers = (num: string | number): string => {
      const banglaDigits: { [key: string]: string } = {
        '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
        '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
      };
      return String(num).replace(/[0-9]/g, digit => banglaDigits[digit] || digit);
    };

    const numPrice = Number(editPrice);
    const numRegPrice = editRegularPrice.trim() ? Number(editRegularPrice) : 0;
    
    let calculatedOffer = editOffer.trim();
    if (!calculatedOffer && numRegPrice > numPrice) {
      const discountP = Math.round(((numRegPrice - numPrice) / numRegPrice) * 100);
      if (discountP > 0) {
        calculatedOffer = `${convertToBanglaNumbers(discountP)}% ছাড়`;
      }
    } else if (numRegPrice > 0 && numRegPrice <= numPrice) {
      // If sale price matches or exceeds retail, clear the discount badge
      calculatedOffer = '';
    }

    const updatedProduct: Product = {
      ...editingProduct,
      name: editName,
      price: numPrice,
      regularPrice: numRegPrice > 0 ? numRegPrice : undefined,
      unit: editUnit,
      stock: Number(editStock) || 0,
      category: editCategory,
      description: editDescription,
      image: editImage,
      specialOffer: calculatedOffer || undefined
    };

    // Make API request update if online
    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProduct)
      });
      const resData = await response.json();
      if (!resData.success) {
        console.error('API Error updating product:', resData.error);
      }
    } catch (err) {
      console.error('Network error during editing product:', err);
    }

    const updatedList = products.map(p => p.id === editingProduct.id ? updatedProduct : p);
    onUpdateProductsList(updatedList);
    setEditingProduct(null);
  };

  // Order state changer (Pending -> Processing -> Shipped -> Delivered)
  const handleUpdateOrderStatus = (orderId: string, currentStatus: Order['status']) => {
    const statusCycle: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { 
          ...o, 
          status: nextStatus,
          paymentStatus: nextStatus === 'delivered' ? 'paid' : o.paymentStatus as any
        };
      }
      return o;
    });
    onUpdateOrdersList(updated);
  };

  // Push standard broadcast notifications
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;

    onBroadcastNotification(broadcastTitle, broadcastMsg, broadcastType);
    setBroadcastTitle('');
    setBroadcastMsg('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 4000);
  };

  // Filter products by search & dropdown
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(inventorySearch.toLowerCase()) || 
                          p.englishName.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                          p.vendorName.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesCategory = inventoryCategoryFilter === 'all' || p.category === inventoryCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate high-fidelity real-time dynamic statistics
  const totalSalesRevenue = orders.reduce((acc, ord) => acc + ord.totalAmount, 0);
  const totalOrdersCount = orders.length;
  const popularCategoryCount = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Determine dominant theme classes
  const themeAccentBg = {
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
    oceanic: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500',
    sunset: 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500',
    royal: 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500',
  }[heroTheme];

  const themeTextAccent = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    oceanic: 'text-indigo-600 dark:text-indigo-400',
    sunset: 'text-orange-600 dark:text-orange-400',
    royal: 'text-purple-600 dark:text-purple-400',
  }[heroTheme];

  return (
    <div className={`p-4 sm:p-6 rounded-3xl border ${
      isDarkMode 
        ? 'bg-slate-900 border-slate-800' 
        : 'bg-white border-slate-100'
    } shadow-2xl space-y-6 antialiased max-w-7xl mx-auto`}>
      
      {/* Header Profile Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-dashed border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-lg transform rotate-2">
            <Settings size={28} className="animate-spin-slow text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight bangla-text">সুপার এডমিন ড্যাশবোর্ড</h2>
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">SYSTEM ROOT</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 bangla-text mt-0.5">সাইট ওভারভিউ, রিটেল কাস্টমাইজেশন ও সকল পেমেন্ট/অর্ডার মনিটরিং পোর্টাল</p>
          </div>
        </div>
        
        {/* Quick Database Stat Widgets */}
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-550/10 p-2 rounded-xl border border-slate-200/40 max-w-max">
          <Database size={14} className="text-emerald-500" />
          <span className="opacity-80">Database Engine:</span>
          <span className="text-emerald-500 font-extrabold">IN-MEMORY RECOVERY DB</span>
        </div>
      </div>

      {/* Multitabs navigation */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100 dark:border-slate-800/45">
        {(
          [
            { id: 'overview', label: '১. সাইট এনালাইটিক্স', icon: LayoutDashboard },
            { id: 'product_upload', label: '২. নতুন পণ্য আপলোড', icon: PlusCircle },
            { id: 'inventory', label: '৩. পণ্য তালিকা ও এডিট', icon: Package },
            { id: 'orders', label: '৪. সকল অর্ডার সমূহ', icon: ShoppingBag },
            { id: 'customization', label: '৫. সাইট কাস্টমাইজেশন', icon: Monitor },
            { id: 'features', label: '৬. ফিচারস গেটওয়ে', icon: Sparkles },
            { id: 'broadcast', label: '৭. পুশ ব্রডকাস্টার', icon: Radio },
            { id: 'settings_security', label: '৮. সেটিংস ও নিরাপত্তা', icon: Settings },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              id={`admin-tab-btn-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition cursor-pointer ${
                isActive 
                  ? `${themeAccentBg} shadow-md`
                  : isDarkMode
                    ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon size={14} />
              <span className="bangla-text">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE TAB VIEW */}
      
      {/* 1. OVERVIEW VIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Sales stat */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200/60'} relative overflow-hidden`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-bold bangla-text">মোট বিক্রীত মূল্য</p>
                  <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">৳{totalSalesRevenue}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <DollarSign size={18} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider font-mono mt-3">Live transaction sync: Active</p>
              <div className="absolute right-0 bottom-0 w-24 h-5 opacity-10 bg-emerald-500 transform skew-x-12"></div>
            </div>

            {/* Total Orders */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200/60'} relative overflow-hidden`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-bold bangla-text">মোট কুয়াকাটা অর্ডার</p>
                  <p className="text-3xl font-extrabold font-mono text-amber-500">{totalOrdersCount} টি</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <ShoppingBag size={18} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider font-mono mt-3">Ready-for-dispatch orders tracking</p>
            </div>

            {/* Total Active Items */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200/60'} relative overflow-hidden`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-bold bangla-text">সর্বমোট পণ্য তালিকা</p>
                  <p className="text-3xl font-extrabold font-mono text-rose-500">{products.length} টি</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <Package size={18} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider font-mono mt-3">5 Categories mapped successfully</p>
            </div>

            {/* Simulated Live traffic */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200/60'} relative overflow-hidden`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-bold bangla-text">সক্রিয় ক্রেতা উইন্ডো</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-3xl font-extrabold font-mono text-sky-500">১৩২</p>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500">
                  <Users size={18} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider font-mono mt-3">Dynamic simulated click-stream</p>
            </div>

          </div>

          {/* Graphical Representation simulation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Category analysis */}
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-white border-slate-100'} lg:col-span-2 space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-500 animate-bounce" />
                  <h3 className="font-bold text-sm bangla-text">ক্যাটাগরিভিত্তিক ক্যাটালগ বন্টন এনালাইসিস</h3>
                </div>
                <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono">AUTOMATED METRICS</span>
              </div>
              
              <div className="space-y-4">
                {(
                  [
                    { id: 'pickle', label: 'আচার (Pickle)', count: popularCategoryCount['pickle'] || 0, color: 'bg-amber-500' },
                    { id: 'dried_fish', label: 'শুটকী (Dried Fish)', count: popularCategoryCount['dried_fish'] || 0, color: 'bg-emerald-500' },
                    { id: 'burmese', label: 'বার্মিজ পণ্য (Burmese Toys/Cloths)', count: popularCategoryCount['burmese'] || 0, color: 'bg-rose-500' },
                    { id: 'handicraft', label: 'হস্তশিল্প (Local Handicraft Shells)', count: popularCategoryCount['handicraft'] || 0, color: 'bg-indigo-500' },
                    { id: 'fresh_fish', label: 'তাজা মাছ (Fresh Ocean Fish 🐟)', count: popularCategoryCount['fresh_fish'] || 0, color: 'bg-sky-500' },
                  ]
                ).map((catItem) => {
                  const percentage = Math.min(100, Math.round((catItem.count / Math.max(1, products.length)) * 100));
                  return (
                    <div key={catItem.id} className="space-y-1 text-xs">
                      <div className="flex justify-between items-center font-medium">
                        <span className="bangla-text font-bold text-slate-700 dark:text-slate-300">{catItem.label}</span>
                        <span className="font-mono text-slate-500">{catItem.count} টি পন্য ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className={`h-full ${catItem.color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick action helper guide */}
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-emerald-50/10 border-emerald-500/10'} space-y-4`}>
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-amber-500" />
                <h4 className="font-bold text-sm bangla-text">গ্লোবাল এডমিন কুইক টিপস</h4>
              </div>
              <ul className="text-xs space-y-3 font-medium text-slate-600 dark:text-slate-400">
                <li className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
                  <span className="bangla-text">১. সাইটের নাম বা লোগো পরিবর্তন করলে কাস্টমার হোমপেজে তা সাথে সাথে রিফ্লেক্ট করবে।</span>
                </li>
                <li className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                  <span className="bangla-text">২. যদি কোনো পণ্য স্টক আউট হয়ে যায়, ক্যাটালগে তার পাশে 'স্টক শেষ' ট্যাগ দেখাবে।</span>
                </li>
                <li className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                  <span className="bangla-text">৩. ব্রডকাস্টার নোটিফিকেশন পাঠালে তা আমাদের রিয়েলটাইম নোটিফিকেশন বেল ড্রপডাউন বক্সে যোগ হবে।</span>
                </li>
                <li className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></div>
                  <span className="bangla-text">৪. অর্ডারের স্ট্যাটাস পরিবর্তন করতে অর্ডার পেইজে গিয়ে স্ট্যাটাস বাটনটি ক্লিক করুন।</span>
                </li>
              </ul>

              <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/10 flex items-center gap-3">
                <AlertCircle size={28} className="text-amber-500 flex-shrink-0" />
                <p className="text-[10px] font-sans text-amber-600 dark:text-amber-400 font-semibold leading-relaxed leading-snug">
                  অফলাইন মোড টেস্টিং সক্ষম হলে ব্রাউজার ক্যাশে ডাটা রাখবে। সার্ভার পুনরায় সিঙ্ক হওয়া মাত্রই অর্ডার ড্যাশবোর্ডে তা যুক্ত হবে।
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. CUSTOMIZATION VIEW */}
      {activeTab === 'customization' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Customization Inputs */}
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800/40 border-slate-850' : 'bg-white border-slate-100'} space-y-4`}>
              <h3 className="font-black text-sm bangla-text text-emerald-600 dark:text-emerald-400 flex items-center gap-2 border-b pb-2 mb-2">
                <Monitor size={17} />
                লাইভ ব্র্যান্ডিং কাস্টমাইজেশন টুলস
              </h3>
              
              <div className="grid grid-cols-1 gap-4 text-xs font-semibold">
                
                {/* Site Name Input */}
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">ওয়েবসাইটের নাম (Site Brand Name)</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="যেমন: কুয়াকাটা মাল্টিমিডিয়া"
                  />
                </div>

                {/* Tagline Input */}
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">পাদটীকা/ট্যাগলাইন (English Tagline)</label>
                  <input
                    type="text"
                    value={siteTagline}
                    onChange={(e) => setSiteTagline(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="যেমন: Direct Coastal E-Shop"
                  />
                </div>

                {/* Top Announcement Bar */}
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">শীর্ষ ঘোষণা বার (Announcement / Offer label)</label>
                  <input
                    type="text"
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:ring-1 focus:ring-emerald-500 focus:outline-none animate-pulse-slow"
                    placeholder="যেমন: ১০০% ক্যাচ-ফ্রেশ গ্যারান্টি"
                  />
                </div>

                {/* Hero section customization */}
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">হিরো ব্যানার স্পেশাল হেডলাইন</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="যেমন: সরাসরি সাগর থেকে"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">হিরো ব্যানার আকর্ষণীয় সাব-হেডিং</label>
                  <input
                    type="text"
                    value={heroSub}
                    onChange={(e) => setHeroSub(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="যেমন: তাজা মাছ, শুটকী ও কুয়াকাটার ঐতিহ্যবাহী উপহার"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">হিরো ব্যানার কাস্টম বিবরণ (Description)</label>
                  <textarea
                    rows={2}
                    value={heroDesc}
                    onChange={(e) => setHeroDesc(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:ring-1 focus:ring-emerald-500 focus:outline-none text-[11px]"
                    placeholder="কুয়াকাটার আসল পন্যের আকর্ষণীয় বিবরণী বিস্তারিত লিখুন..."
                  />
                </div>

                {/* Accent selection */}
                <div className="space-y-2">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">সাইটের হিরো ব্যানার থিম রঙ চয়েস</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['emerald', 'oceanic', 'sunset', 'royal'] as const).map((themeName) => {
                       const label = { emerald: 'Emerald', oceanic: 'Ocean Indigo', sunset: 'Sunset', royal: 'Royal' }[themeName];
                       const colorBadge = { emerald: 'bg-emerald-500', oceanic: 'bg-indigo-500', sunset: 'bg-orange-500', royal: 'bg-purple-500' }[themeName];
                       const isSelected = heroTheme === themeName;
                       return (
                        <button
                          id={`theme-select-btn-${themeName}`}
                          key={themeName}
                          onClick={() => setHeroTheme(themeName)}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500 text-slate-800 dark:text-slate-200' 
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg ${colorBadge} shadow-sm`}></div>
                          <span className="text-[10px] font-bold">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Divider & Header for Entire Home Page Custom sections */}
                <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-4 mt-2 space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider opacity-60 text-indigo-500">১.৩. হোমপেজ সেকশন এবং পাদটীকা কাস্টমাইজেশন</span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-450 bangla-text">পুরো হোমপেজের বিভিন্ন সেকশনের শিরোনাম এবং ফুটারে প্রদর্শিত কন্টেন্টগুলো কাস্টমাইজ করুন:</p>
                </div>

                {/* Promo Section Title */}
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">সীমিত অফার সেকশনের শিরোনাম</label>
                  <input
                    type="text"
                    value={promoSectionTitle}
                    onChange={(e) => setPromoSectionTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="সীমিত সময়ের বিশেষ অফারসমূহ ⚡"
                  />
                </div>

                {/* Category Section Title */}
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">ক্যাটাগরি সেকশনের শিরোনাম</label>
                  <input
                    type="text"
                    value={categorySectionTitle}
                    onChange={(e) => setCategorySectionTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="যেমন: আমাদের স্পেশাল ক্যাটাগরি সমূহ 🌟"
                  />
                </div>

                {/* Product Section Title */}
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">পণ্য ক্যাটালগ সেকশনের শিরোনাম</label>
                  <input
                    type="text"
                    value={productSectionTitle}
                    onChange={(e) => setProductSectionTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="우리 সব ক্যাটাগরির সেরা পণ্য সমূহ 🛍️"
                  />
                </div>

                {/* Footer Description */}
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">ফুটার বিস্তারিত বিবরণ (Footer Description)</label>
                  <textarea
                    rows={2}
                    value={footerDesc}
                    onChange={(e) => setFooterDesc(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:ring-1 focus:ring-emerald-500 focus:outline-none text-[11px]"
                    placeholder="পাদটীকায় প্রদর্শিত বিবরণ লিখুন..."
                  />
                </div>

                {/* Footer Contact */}
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">ফুটার যোগাযোগ নম্বর (Footer Support Number)</label>
                  <input
                    type="text"
                    value={footerContact}
                    onChange={(e) => setFooterContact(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="যেমন: 01712-345678"
                  />
                </div>

                {/* Footer Address */}
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">ব্যবসায়িক ঠিকানা (Business Address)</label>
                  <input
                    type="text"
                    value={footerAddress}
                    onChange={(e) => setFooterAddress(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="কুয়াকাটা চৌরাস্তা, মহিপুর, পটুয়াখালী"
                  />
                </div>

                {/* Submit button */}
                <button
                  id="save-theme-customization-btn"
                  onClick={handleSaveCustomization}
                  className={`w-full py-2.5 rounded-xl font-bold font-sans mt-3 shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 ${themeAccentBg}`}
                >
                  <Save size={16} />
                  <span className="bangla-text">কাস্টমাইজেশন লাইভ সেভ করুন 🚀</span>
                </button>

                {configSaved && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-center bangla-text animate-bounce">
                    অনলাইন সাকসেস! সাইটের ডিজাইন ও লোগো থিম রিফ্রেশ হয়েছে।
                  </div>
                )}

              </div>
            </div>

            {/* Live Preview Container */}
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800/40 border-slate-850' : 'bg-white border-slate-100'} space-y-4`}>
              <h3 className="font-black text-sm bangla-text text-slate-800 dark:text-slate-200 border-b pb-2 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                লাইভ উইজেট ব্যানার প্রিভিউ (অপ্রকাশিত ড্রাফট)
              </h3>
              
              <div className="space-y-4">
                <p className="text-[11px] text-slate-400 bangla-text leading-relaxed">
                  নিচে আপনার পরিবর্তন করা হিরো ব্যানারটির ডেমো দেখতে পাচ্ছেন। এটি মূলত কাস্টমারদের হোমপেজের টপ ব্যানার হিসেবে শো করবে।
                </p>

                <div className={`p-4 rounded-xl relative overflow-hidden space-y-2.5 border ${
                  heroTheme === 'emerald' ? (isDarkMode ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-800/40' : 'bg-gradient-to-r from-emerald-50 via-white to-amber-50/30 border-emerald-100') :
                  heroTheme === 'oceanic' ? (isDarkMode ? 'bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-800/40' : 'bg-gradient-to-r from-indigo-50 via-white to-amber-50/20 border-indigo-100') :
                  heroTheme === 'sunset' ? (isDarkMode ? 'bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-900 border-orange-850/40' : 'bg-gradient-to-r from-orange-50 via-white to-amber-50/20 border-orange-100') :
                  (isDarkMode ? 'bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border-purple-800/40' : 'bg-gradient-to-r from-purple-50 via-white to-amber-50/20 border-purple-100')
                }`}>
                  <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                    <Sparkles size={9} />
                    <span className="bangla-text">{announcement || 'ঘোষণা'}</span>
                  </div>

                  <h3 className="font-extrabold text-base bangla-text leading-tight text-slate-800 dark:text-slate-100">
                    {heroTitle || 'সরাসরি সাগর থেকে'}
                  </h3>

                  <p className={`font-bold text-[11px] bangla-text ${themeTextAccent}`}>
                    {heroSub || 'তাজা মাছ ও শুটকী'}
                  </p>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-500/5 p-2 rounded-lg leading-relaxed max-h-16 overflow-y-auto">
                    {heroDesc || 'বিবরণ লিখুন'}
                  </p>

                  <div className="flex gap-2">
                    <div className={`p-2 py-1 rounded text-[9px] font-bold ${themeAccentBg}`}>পণ্য বাজার</div>
                    <div className="p-2 py-1 rounded text-[9px] font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600">সব ক্যাটালগ</div>
                  </div>
                </div>

                {/* Graphic warning for real-time changes */}
                <div className="flex items-center gap-2 text-[10px] text-amber-500 bg-amber-500/5 p-2 px-3 rounded-xl">
                  <AlertCircle size={12} />
                  <span className="font-semibold select-none">উপরে 'কাস্টমাইজেশন লাইভ সেভ করুন' ক্লিক করলেই মূল সাইট রিলোড হওয়া ছাড়া ও সাথে সাথে রিফ্রেশ হবে।</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. FEATURES VIEW */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <div className="max-w-xl mx-auto space-y-4">
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-white border-slate-100'} space-y-4`}>
              <h3 className="font-bold text-sm bangla-text text-emerald-600 dark:text-emerald-400 border-b pb-2 mb-2 flex items-center gap-1.5">
                <Sparkles size={17} />
                সাইটের বিভিন্ন মডিউল ও ফিচারস গেটওয়ে কন্ট্রোল
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 bangla-text leading-relaxed">
                এখানে ক্লিক করে আপনি ওয়েবসাইটের মূল মডিউলগুলো চালু বা বন্ধ করতে পারেন। কোনো ফিচার বন্ধ করলে গ্রাহকের হোমপেজে সেই উইজেট বা শর্টকাট বোতামটি হাইড হয়ে যাবে।
              </p>

              <div className="space-y-3.5 pt-2 text-xs">
                
                {/* AI Chatbot toggle */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                  enableAiChat ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-500/5 border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="space-y-0.5 max-w-[70%]">
                    <p className="font-bold bangla-text text-slate-800 dark:text-slate-200">১. কাস্টমার কেয়ার এআই চ্যাটবট (Gemini 3.5 AI Copilot)</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 bangla-text">বাংলিশ ও বাংলা বোঝে এমন বুদ্ধিমান এআই শপিং অ্যাসিস্ট্যান্ট সক্রিয় করুন।</p>
                  </div>
                  <button
                    onClick={() => setEnableAiChat(!enableAiChat)}
                    className="p-1 cursor-pointer hover:scale-110 transition text-slate-700 dark:text-slate-300"
                  >
                    {enableAiChat ? <ToggleRight size={28} className="text-emerald-500" /> : <ToggleLeft size={28} />}
                  </button>
                </div>

                {/* Support Chat toggle */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                  enableSupportChat ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-500/5 border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="space-y-0.5 max-w-[70%]">
                    <p className="font-bold bangla-text text-slate-800 dark:text-slate-200">২. লাইভ কাস্টমার সাপোর্ট এবং চ্যাট</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 bangla-text">মেсеঞ্জার এবং হোয়াটসঅ্যাপ ইন্টিগ্রেশন সম্পন্ন লাইভ সাপোর্ট গেটওয়ে চালু করুন।</p>
                  </div>
                  <button
                    onClick={() => setEnableSupportChat(!enableSupportChat)}
                    className="p-1 cursor-pointer hover:scale-110 transition text-slate-700 dark:text-slate-300"
                  >
                    {enableSupportChat ? <ToggleRight size={28} className="text-emerald-500" /> : <ToggleLeft size={28} />}
                  </button>
                </div>

                {/* Order tracker toggle */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                  enableOrderTracker ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-500/5 border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="space-y-0.5 max-w-[70%]">
                    <p className="font-bold bangla-text text-slate-800 dark:text-slate-200">৩. রিয়েলটাইম মোবাইল ট্র্যাকার (SMS Pipe)</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 bangla-text">ক্রেতাদের পার্সেল ট্র্যাকিং করার জন্য লাইভ কুয়াকাটা ট্র্যাকিং মডিউলে অ্যাক্সেস দিন।</p>
                  </div>
                  <button
                    onClick={() => setEnableOrderTracker(!enableOrderTracker)}
                    className="p-1 cursor-pointer hover:scale-110 transition text-slate-700 dark:text-slate-300"
                  >
                    {enableOrderTracker ? <ToggleRight size={28} className="text-emerald-500" /> : <ToggleLeft size={28} />}
                  </button>
                </div>

                {/* Seller Mode toggle */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                  enableSellerMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-500/5 border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="space-y-0.5 max-w-[70%]">
                    <p className="font-bold bangla-text text-slate-800 dark:text-slate-200">৪. পার্টনার এডমিন এবং সেলার রেজিস্ট্রেশন পোর্টাল</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 bangla-text">কুয়াকাটার স্থানীয় মাছ বিক্রেতা ও পণ্যের কারিগরদের সিস্টেমে যুক্ত হওয়ার সুযোগ দিন।</p>
                  </div>
                  <button
                    onClick={() => setEnableSellerMode(!enableSellerMode)}
                    className="p-1 cursor-pointer hover:scale-110 transition text-slate-700 dark:text-slate-300"
                  >
                    {enableSellerMode ? <ToggleRight size={28} className="text-emerald-500" /> : <ToggleLeft size={28} />}
                  </button>
                </div>

              </div>

              {/* Action Button */}
              <button
                id="save-features-btn"
                onClick={handleSaveFeatures}
                className="w-full py-2.5 rounded-xl font-bold font-sans tracking-wide hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 transition text-white bg-emerald-600 hover:bg-emerald-700 shadow cursor-pointer"
              >
                <Save size={14} />
                <span className="bangla-text">ফিচার কনফিগারেশন আপডেট করুন 💾</span>
              </button>

              {featuresSaved && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-emerald-600 text-center text-[11px] font-bold font-sans bangla-text animate-pulse">
                  ফিচার গেটওয়ে সেটিংস সফলভাবে আপডেট ও রিফ্রেশ করা হয়েছে!
                </div>
              )}

            </div>
          </div>
        </div>
      )}

�      {/* 2. PRODUCT UPLOAD VIEW */}
      {activeTab === 'product_upload' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Create new product panel form */}
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 shadow-lg relative overflow-hidden ${
            isDarkMode ? 'bg-slate-800/40 border-slate-850' : 'bg-white border-slate-100'
          }`}>
            <div className="border-b pb-4 border-dashed border-slate-200 dark:border-slate-800/80 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
                <PlusCircle size={24} />
              </div>
              <div>
                <h3 className="font-extrabold text-base bangla-text text-slate-800 dark:text-slate-100">
                  নতুন পণ্য ক্যাটালগে যুক্ত করুন (Upload New Product)
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">কুপন, কাস্টম নাম ও ক্যাচ-ফ্রেশ বিবরণ সহ নতুন পণ্য ডাটাবেজে যুক্ত করুন</p>
              </div>
            </div>

            <form onSubmit={handleAddSystemProduct} className="space-y-4 text-xs font-semibold animate-fade-in">
              
              {/* Bangla Name */}
              <div className="space-y-1">
                <label className="text-slate-500 dark:text-slate-400 bangla-text">পণ্যের নাম (বাংলা নাম)</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  placeholder="যেমন: প্রিমিয়াম গোল্ড কোরাল শুটকী"
                />
              </div>

              {/* English Name */}
              <div className="space-y-1">
                <label className="text-slate-500 dark:text-slate-400">English Name (Scientific or tag)</label>
                <input
                  type="text"
                  value={newProdEnglish}
                  onChange={(e) => setNewProdEnglish(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  placeholder="e.g. Premium Golden Coral Shutki"
                />
              </div>

              {/* Category & Prices */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">ক্যাটাগরি</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="pickle" className="text-slate-900 bg-white">আচার</option>
                    <option value="dried_fish" className="text-slate-900 bg-white">শুটকী</option>
                    <option value="burmese" className="text-slate-900 bg-white">বার্মিজ পণ্য</option>
                    <option value="handicraft" className="text-slate-900 bg-white">হস্তশিল্প</option>
                    <option value="fresh_fish" className="text-slate-900 bg-white">তাজা মাছ 🐟</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 dark:text-slate-500 bangla-text">খুচরা মূল্য (৳ টাকা, ঐচ্ছিক)</label>
                  <input
                    type="number"
                    value={newProdRegularPrice}
                    onChange={(e) => setNewProdRegularPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    placeholder="যেমন: ৫০০"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">বিক্রয় মূল্য (৳ টাকা) *</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono focus:ring-1 focus:ring-orange-500 focus:outline-none font-bold"
                    placeholder="যেমন: ৪০০"
                  />
                </div>
              </div>

              {/* Unit & Stock count */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">परिমাণ / ইউনিট</label>
                  <input
                    type="text"
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    placeholder="যেমন: ৫০০ গ্রাম বা ১ পিস"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">স্টক পরিমাণ</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    placeholder="যেমন: ১৫"
                  />
                </div>
              </div>

              {/* Special Offer Tag Label */}
              <div className="space-y-1">
                <label className="text-slate-500 dark:text-slate-400 bangla-text">বিশেষ ছাড় বা অফার ট্যাগ (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={newProdOffer}
                  onChange={(e) => setNewProdOffer(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  placeholder="যেমন: ‘১০% ছাড়’ বা ‘১টি কিনলে ১টি ফ্রি’"
                />
              </div>

              {/* Integrated Aspect-Ratio Image Direct Uploader & Cropper */}
              <div className="space-y-2 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
                <label className="text-slate-600 dark:text-slate-300 font-extrabold text-xs bangla-text flex items-center gap-1.5">
                  <ImageIcon size={15} className="text-orange-500" />
                  <span>পণ্যের ছবির সরাসরি আপলোড ও ক্রপিং সিস্টেম</span>
                </label>
                
                <ImageUploaderWithCrop 
                  isDarkMode={isDarkMode}
                  value={newProdImage}
                  onChange={(dataUrl) => setNewProdImage(dataUrl)}
                />

                {/* Optional Fallback Text Input */}
                <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-1">
                  <label className="text-[10px] text-slate-400 bangla-text">অথবা সরাসরি ছবির লিঙ্ক URL ব্যবহার করুন:</label>
                  <input
                    type="text"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... অথবা Base64 Data URL"
                    className="w-full p-2.5 text-[10px] rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  />
                  {/* Preset Quick select buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { l: 'ডিফল্ট আচার', u: 'https://images.unsplash.com/photo-1622264939103-6a97800c1e6c?auto=format&fit=crop&q=80&w=400' },
                      { l: 'ডিফল্ট শুটকী', u: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=400' },
                      { l: 'ডিফল্ট তাজা মাছ', u: 'https://images.unsplash.com/photo-1553618551-fba689030290?auto=format&fit=crop&q=80&w=400' },
                      { l: 'ডিফল্ট ওড়না', u: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=400' },
                    ].map((pre) => (
                      <button
                        type="button"
                        key={pre.l}
                        onClick={() => setNewProdImage(pre.u)}
                        className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 py-0.5 px-2 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        {pre.l} ছবি
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Slider Image URL Option */}
              <div className="space-y-1">
                <label className="text-slate-500 dark:text-slate-400 bangla-text">স্লাইডার ছবির লিঙ্ক URL (ঐচ্ছিক - খালি রাখলে মূল ছবি ব্যবহার হবে)</label>
                <input
                  type="text"
                  value={newProdSliderImage}
                  onChange={(e) => setNewProdSliderImage(e.target.value)}
                  placeholder="https://images.unsplash.com/... (যেমন ১৬:৯ রেশিও)"
                  className="w-full p-2.5 text-[11px] rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Description Textarea */}
              <div className="space-y-1">
                <label className="text-slate-500 dark:text-slate-400 bangla-text">পণ্যের বিবরণ (বাংলায় লিখুন)</label>
                <textarea
                  rows={3}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  placeholder="যেমন: কুয়াকাটা শুটকী পল্লীর তাजा রূপচাঁদা..."
                />
              </div>

              {/* Form submit */}
              <button
                id="submit-new-product-btn"
                type="submit"
                className="w-full py-3 rounded-xl font-bold font-sans tracking-wide text-white bg-gradient-to-r from-orange-500 to-amber-600 shadow-md flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition"
              >
                <PlusCircle size={15} />
                <span className="bangla-text">গ্লোবাল ক্যাটালগে লাইভ করুন 🟢</span>
              </button>

            </form>
          </div>
        </div>
      )}

      {/* 3. PRODUCT CATALOG INVENTORY VIEW */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-fade-in">
          {/* Live Inventory List - Edit stock / delete */}
          <div className={`p-6 rounded-3xl border space-y-4 shadow-sm ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-dashed border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-base bangla-text text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <Package size={20} />
                  লাইভ ক্যাটালগ ইনভেন্টরি তালিকা ({filteredProducts.length} টি পন্য)
                </h3>
                <p className="text-xs text-slate-400 font-medium font-sans">Real-time Stock Management, Price Editor & Catalog Deletion Engine</p>
              </div>
              
              {/* Search in inventory */}
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="p-2 px-3 rounded-xl border font-sans text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:outline-none min-w-[180px]"
                  placeholder="পণ্য খুঁজুন..."
                />
                <select
                  value={inventoryCategoryFilter}
                  onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                  className="p-2 rounded-xl border font-sans text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:outline-none"
                >
                  <option value="all">সব ক্যাটাগরি</option>
                  <option value="pickle">আচার</option>
                  <option value="dried_fish">শুটকী</option>
                  <option value="burmese">বার্মিজ পণ্য</option>
                  <option value="handicraft">হস্তশিল্প</option>
                  <option value="fresh_fish">তাজা মাছ</option>
                </select>
              </div>
            </div>

            {/* Grid Product List view */}
            <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-1.5">
                  <AlertCircle size={24} className="mx-auto" />
                  <p className="font-semibold text-xs bangla-text">কোনো পণ্য খুঁজে পাওয়া যায়নি!</p>
                </div>
              ) : (
                filteredProducts.map((prod) => (
                  <div 
                    key={prod.id} 
                    className={`p-3.5 rounded-2xl border transition hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200/60 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={prod.image} 
                        alt={prod.name} 
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 animate-fade-in border border-slate-200 dark:border-slate-800" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="leading-snug min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-bold border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded uppercase">
                            {prod.category}
                          </span>
                          {prod.specialOffer && (
                            <span className="text-[9px] bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 px-1.5 py-0.5 rounded font-bold animate-pulse">
                              {prod.specialOffer}
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-xs bangla-text text-slate-800 dark:text-slate-100 mt-1">{prod.name}</h4>
                        
                        {/* PRICES DISPLAY DIRECTLY IN PRODUCT AREA ("Product price will be in the place of the product") */}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 font-sans">
                          <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 px-2 py-0.5 rounded">
                            বিক্রয় মূল্য: ৳{prod.price}
                          </span>
                          {prod.regularPrice && prod.regularPrice > prod.price && (
                            <>
                              <span className="text-[10px] line-through text-slate-400 dark:text-slate-500">
                                খুচরা: ৳{prod.regularPrice}
                              </span>
                              <span className="text-[9px] font-black text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-955/30 border border-rose-200 dark:border-rose-900 px-1 rounded">
                                {Math.round(((prod.regularPrice - prod.price) / prod.regularPrice) * 100)}% ছাড়
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-mono mt-1">Vendor: {prod.vendorName} | Unit: {prod.unit}</p>
                      </div>
                    </div>

                    {/* Highly visible, high contrast action triggers */}
                    <div className="flex flex-wrap items-center gap-3 justify-end md:justify-start font-mono">
                      
                      {/* Highly prominent edit action button ("fix all of them so that it is clearly visible which product can be edited and how") */}
                      <button
                        onClick={() => openEditModal(prod)}
                        className="py-1.5 px-3.5 text-xs rounded-xl font-bold border border-orange-500 bg-gradient-to-r from-orange-500 to-amber-600 text-white cursor-pointer hover:scale-105 active:scale-95 shadow-md hover:shadow-lg transition-all flex items-center gap-1"
                        title="পণ্যের তথ্য সম্পাদনা করুন"
                      >
                        <Edit size={13} />
                        <span className="bangla-text font-bold">সম্পাদনা</span>
                      </button>

                      {/* Stock controls (high contrast boundaries) */}
                      <div className="space-y-0.5 text-center min-w-[70px]">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Stock</span>
                        <div className="flex items-center gap-1 justify-center">
                          <button 
                            onClick={() => handleQuickUpdateStock(prod.id, -1)}
                            className="w-5.5 h-5.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 cursor-pointer transition"
                          >
                            -
                          </button>
                          <span className={`text-xs font-black px-2 py-0.5 rounded-md min-w-[32px] text-center border transition-all ${
                            prod.stock === 0 
                              ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 scale-105' 
                              : 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                          }`}>
                            {prod.stock}
                          </span>
                          <button 
                            onClick={() => handleQuickUpdateStock(prod.id, 1)}
                            className="w-5.5 h-5.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 cursor-pointer transition"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Delete Action (high contrast button structure) */}
                      <button
                        id={`delete-prod-${prod.id}`}
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-1.5 rounded-xl text-rose-500 dark:text-rose-400 hover:bg-rose-50 px-2 border border-slate-200 dark:border-slate-800 dark:hover:bg-rose-950/30 dark:hover:border-rose-900 transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
                        title="পণ্যটি চিরতরে মুছে ফেলুন"
                      >
                        <Trash2 size={15} />
                      </button>

                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. ORDERS VIEW */}
      {activeTab === 'orders' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 border-dashed border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-sm bangla-text text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <ShoppingBag size={17} />
                সকল অনলাইন অর্ডার নিয়ন্ত্রণ ও শিপমেন্ট ট্র্যাকার Pipeline
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 bangla-text mt-0.5">অর্ডারের স্ট্যাটাস চক্রাকারে পরিবর্তন করতে স্ট্যাটাস ব্যাজে ক্লিক করুন (Pending {`->`} Processing {`->`} Shipped {`->`} Delivered)</p>
            </div>
            
            <div className="bg-emerald-500/10 p-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 rounded-xl">
              মোট সেল সম্পন্ন: {orders.length} টি
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {orders.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <ShoppingBag size={32} className="mx-auto" />
                <p className="font-bold text-xs bangla-text">এখনো কোনো অনলাইন অর্ডার পাওয়া যায়নি!</p>
              </div>
            ) : (
              orders.map((ord) => {
                const isPaidStatus = ord.paymentStatus === 'paid';
                
                // Color badges depending on states
                const statusTheme = {
                  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800',
                  processing: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
                  shipped: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border-sky-200 dark:border-sky-800',
                  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                }[ord.status];

                const deliveryText = {
                  standard: 'কুরিয়ার স্ট্যান্ডার্ড (২৪ ঘণ্টা)',
                  express: 'কুয়াকাটা ডিরেক্ট আইস-বক্স ফাস্ট কুরিঙ্গ (৩-৪ ঘণ্টা 🚀)'
                }[ord.deliveryType];

                return (
                  <div 
                    key={ord.id} 
                    className={`p-4 rounded-3xl border transition hover:shadow-lg space-y-3.5 relative overflow-hidden ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-900'
                    }`}
                  >
                    
                    {/* Top order row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-550/5 p-2 px-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Invoice:</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-xs selection:bg-emerald-500/20">{ord.id}</span>
                        <span className="text-slate-300 dark:text-slate-800">|</span>
                        <span className="text-[10px] text-slate-400 font-mono">{new Date(ord.createdAt).toLocaleString('bn-BD')}</span>
                      </div>

                      {/* Clickable Status Switcher widget */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 bangla-text font-bold">স্টেপ পরিবর্তন:</span>
                        <button
                          id={`status-toggle-btn-${ord.id}`}
                          onClick={() => handleUpdateOrderStatus(ord.id, ord.status)}
                          className={`p-1 px-3.5 rounded-full border text-[10px] font-black uppercase tracking-wider cursor-pointer transform hover:scale-105 active:scale-95 transition ${statusTheme}`}
                          title="পরবর্তী ধাপে পাঠিয়ে দিন"
                        >
                          {ord.status} ⇄
                        </button>
                      </div>

                    </div>

                    {/* Customer info and details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      
                      {/* Customer Address Card */}
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Customer Details</p>
                        <p className="font-bold text-slate-800 dark:text-slate-100 bangla-text">{ord.customerName}</p>
                        <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{ord.customerPhone}</p>
                        <p className="text-[10px] text-slate-400 truncate">{ord.customerEmail}</p>
                      </div>

                      {/* Shipping details */}
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Shipping Address & Carrier</p>
                        <p className="text-slate-600 dark:text-slate-300 font-bold bangla-text limit-text-2 overflow-hidden max-h-12">{ord.shippingAddress}</p>
                        <p className="text-[9px] text-amber-500 font-semibold flex items-center gap-1 border-t border-dashed border-slate-200 dark:border-slate-800/10 pt-1">
                          <Truck size={11} />
                          <span className="bangla-text font-black">{deliveryText}</span>
                        </p>
                      </div>

                      {/* Billing items listing and payment status */}
                      <div className="space-y-1 bg-slate-550/10 p-2.5 rounded-xl border border-slate-200/20">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Items summary & payment</p>
                        <div className="max-h-14 overflow-y-auto space-y-0.5 text-[10.5px] pr-1">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-slate-500 dark:text-slate-400">
                              <span className="bangla-text truncate max-w-[120px] font-bold">{item.productName}</span>
                              <span className="font-mono">x{item.quantity} (৳{item.price})</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t border-dashed border-slate-200 dark:border-slate-800 mt-1.5 pt-1 flex justify-between items-center text-xs">
                          <div className="font-black text-slate-800 dark:text-slate-100 font-mono">Total: ৳{ord.totalAmount}</div>
                          {/* Payment status badge */}
                          <span className={`text-[9px] font-bold px-2 py-0.2 rounded ${
                            isPaidStatus 
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10' 
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/10'
                          }`}>
                            {isPaidStatus ? 'PAID via ' + ord.paymentMethod.toUpperCase() : 'PENDING. COD'}
                          </span>
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 6. BROADCAST PUSH NOTIFICATIONS VIEW */}
      {activeTab === 'broadcast' && (
        <div className="space-y-6">
          <div className="max-w-xl mx-auto">
            <div className={`p-6 rounded-2xl border space-y-4 ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-white border-slate-100'}`}>
              <h3 className="font-black text-sm bangla-text text-emerald-600 dark:text-emerald-400 border-b pb-2 mb-2 flex items-center gap-1.5">
                <Radio className="text-red-500 animate-pulse" size={17} />
                গ্রাহকদের জন্য ইনস্ট্যান্ট পুশ অ্যালার্ট ও সিস্টেম ব্রডকাস্টার
              </h3>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 bangla-text leading-relaxed">
                নতুন কোনো অফার, কুয়াকাটা উৎসব, আবহাওয়ার স্পেশাল এলার্ট অথবা সিস্টেম মেসেজ এক ক্লিকেই পাঠিয়ে দিন। এটি হোমপেজের নোটিফিকেশন বেল আইকনে সাথে সাথেই যোগ হবে।
              </p>

              <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs font-semibold">
                
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">ব্রডকাস্ট টাইটেল (যেমন: ইলিশ উৎসব ধামাকা অফার)</label>
                  <input
                    type="text"
                    required
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border font-sans text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500' 
                        : 'bg-white border-slate-300 text-slate-900 font-bold placeholder-slate-400'
                    }`}
                    placeholder="টাইটেল টাইপ করুন..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">সংক্ষিপ্ত বার্তা / মেসেজ কন্টেন্ট</label>
                  <textarea
                    rows={3}
                    required
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border font-sans text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500' 
                        : 'bg-white border-slate-300 text-slate-900 font-bold placeholder-slate-400'
                    }`}
                    placeholder="গ্রাহকদের আকর্ষিত করতে একটি সুন্দর বার্তা লিখুন..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 bangla-text">বার্তাটির ক্যাটাগরি ফ্লেভার</label>
                  <div className="flex gap-4">
                    {[
                      { type: 'system', label: 'সিস্টেম মেসেজ', color: 'border-slate-400' },
                      { type: 'offer', label: 'বিশেষ অফার / ডিল', color: 'border-amber-400' },
                      { type: 'order', label: 'শিপমেন্ট এলার্ট', color: 'border-emerald-400' }
                    ].map((btn) => (
                      <label key={btn.type} className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-bold font-sans">
                        <input
                          type="radio"
                          name="broadcastType"
                          value={btn.type}
                          checked={broadcastType === btn.type}
                          onChange={() => setBroadcastType(btn.type as any)}
                          className="text-emerald-600 focus:ring-emerald-500 focus:ring-1"
                        />
                        <span className="bangla-text text-xs">{btn.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  id="broadcast-submit-btn"
                  type="submit"
                  className={`w-full py-2.5 rounded-xl font-bold font-sans mt-2 shadow-md flex items-center justify-center gap-1.5 cursor-pointer transform hover:scale-102 active:scale-98 transition-transform ${themeAccentBg}`}
                >
                  <Radio size={14} />
                  <span className="bangla-text">সকল গ্রাহকের কাছে পাঠান (Broadcast Now) 📢</span>
                </button>

                {broadcastSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/10 text-emerald-600 text-center text-xs dark:text-emerald-400 bangla-text animate-bounce">
                    দারুণ সাফল্য! বার্তাটি সিস্টেম ডাটাবেজে যুক্ত হয়েছে এবং সকল সক্রিয় গ্রাহক ক্যাভানিলে চলে গেছে।
                  </div>
                )}

              </form>
            </div>
          </div>
        </div>
      )}

      {/* 8. SETTINGS & SECURITY VIEW */}
      {activeTab === 'settings_security' && (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200 text-xs text-slate-800 dark:text-slate-100">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Column 1: Admin Password Change */}
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 shadow-lg relative overflow-hidden ${
              isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="border-b pb-4 border-dashed border-slate-200 dark:border-slate-800/80 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                  <Settings size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base bangla-text text-slate-800 dark:text-slate-100">
                    👑 এডমিন নিরাপত্তা ও পাসওয়ার্ড
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">Change Super Admin Main Core Security Password</p>
                </div>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                setChangePassError('');
                setChangePassSuccess('');
                setChangePassLoading(true);
                try {
                  const response = await fetch('/api/admin/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ currentPassword, newPassword })
                  });
                  const data = await response.json();
                  if (data.success) {
                    setChangePassSuccess('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! পরবর্তী সুপার এডমিন লগইনের সময় নতুন পাসওয়ার্ড ব্যবহার করুন।');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  } else {
                    setChangePassError(data.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে!');
                  }
                } catch (err) {
                  console.error(err);
                  setChangePassError('সার্ভারের সাথে যোগাযোগ করতে একটি ত্রুটি হয়েছে।');
                } finally {
                  setChangePassLoading(false);
                }
              }} className="space-y-4 font-semibold">
                
                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bangla-text">বর্তমান পাসওয়ার্ড:</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:ring-2 focus:ring-amber-500 focus:outline-none ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-700 text-white' 
                        : 'bg-white border-slate-300 text-slate-900 font-bold'
                    }`}
                    placeholder="আপনার বর্তমান সিকিউরিটি পাসওয়ার্ড"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bangla-text">নতুন পাসওয়ার্ড:</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:ring-2 focus:ring-amber-500 focus:outline-none ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-700 text-white' 
                        : 'bg-white border-slate-300 text-slate-900 font-bold'
                    }`}
                    placeholder="কমপক্ষে ৫ অক্ষরের নতুন পাসওয়ার্ড"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bangla-text">নতুন পাসওয়ার্ডটি আবার টাইপ করুন:</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:ring-2 focus:ring-amber-500 focus:outline-none ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-750 text-white' 
                        : 'bg-white border-slate-300 text-slate-900 font-bold'
                    }`}
                    placeholder="নতুন পাসওয়ার্ডটি পুনরায় প্রদান করুন"
                  />
                </div>

                {changePassError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-left font-medium bangla-text text-[11px]">
                    🚨 {changePassError}
                  </div>
                )}

                {changePassSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-left font-bold bangla-text text-[11px]">
                    ✅ {changePassSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={changePassLoading || !currentPassword || !newPassword || newPassword !== confirmPassword}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-45 text-slate-950 font-sans font-extrabold py-3 px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-md"
                >
                  {changePassLoading ? 'প্রসেসিং হচ্ছে...' : (newPassword !== confirmPassword ? 'পাসওয়ার্ড দুটি মিলছে না' : 'পাসওয়ার্ড পরিবর্তন করুন 🔑')}
                </button>
              </form>
            </div>

            {/* Column 2: Account Provisioning Portal */}
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 shadow-lg relative overflow-hidden ${
              isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="border-b pb-4 border-dashed border-slate-200 dark:border-slate-800/80 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <User size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base bangla-text text-slate-800 dark:text-slate-100">
                    🛍️ মেম্বারশিপ ও অ্যাকাউন্ট তৈরি করুন
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">Provision Customers, Sellers/Vendors & Sub-Admins</p>
                </div>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                setProvError('');
                setProvSuccess('');
                setProvLoading(true);

                try {
                  const res = await fetch('/api/admin/create-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: provName,
                      phone: provPhone,
                      email: provEmail,
                      password: provPassword,
                      role: provRole
                    })
                  });
                  const data = await res.json();
                  if (data.success) {
                    setProvSuccess(`অ্যাকাউন্টটি সফলভাবে তৈরি করা হয়েছে! তিনি এখন "${provPhone || provEmail}" দিয়ে লগইন করতে পারবেন।`);
                    setProvName('');
                    setProvPhone('');
                    setProvEmail('');
                    setProvPassword('');
                    fetchSystemUsers(); // Reload audit trail
                  } else {
                    setProvError(data.error || 'অ্যাকাউন্ট তৈরিতে ত্রুটি দেখা দিয়েছে!');
                  }
                } catch (err) {
                  console.error(err);
                  setProvError('সার্ভারে যোগাযোগ করা যায়নি। পুনরায় চেষ্টা করুন।');
                } finally {
                  setProvLoading(false);
                }
              }} className="space-y-3 font-semibold text-left">
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 bangla-text">পূর্ণ নাম:</label>
                    <input
                      type="text"
                      required
                      value={provName}
                      onChange={(e) => setProvName(e.target.value)}
                      className={`w-full p-2 rounded-xl border focus:ring-1 focus:ring-emerald-500 text-xs ${
                        isDarkMode ? 'bg-slate-950 border-slate-750' : 'bg-slate-50'
                      }`}
                      placeholder="যেমন: আরফান আলী"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 bangla-text font-sans">Account Role *:</label>
                    <select
                      value={provRole}
                      onChange={(e) => setProvRole(e.target.value as any)}
                      className={`w-full p-2.5 rounded-xl border focus:ring-1 focus:ring-emerald-500 text-xs font-bold ${
                        isDarkMode ? 'bg-slate-950 border-slate-750' : 'bg-slate-100 border-slate-350'
                      }`}
                    >
                      <option value="customer">🛍️ সাধারণ কাস্টমার (Customer)</option>
                      <option value="seller">🏪 সেলার ও ভেন্ডর (Seller/Vendor)</option>
                      <option value="admin">👑 সিকিউর এডমিন (Admin)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 bangla-text">মোবাইল:</label>
                    <input
                      type="tel"
                      value={provPhone}
                      onChange={(e) => setProvPhone(e.target.value.replace(/\D/g, ''))}
                      className={`w-full p-2 rounded-xl border focus:ring-1 focus:ring-emerald-500 text-xs ${
                        isDarkMode ? 'bg-slate-950 border-slate-755' : 'bg-slate-50'
                      }`}
                      placeholder="যেমন: 01788XXXXXX"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 bangla-text">ইমেইল:</label>
                    <input
                      type="email"
                      value={provEmail}
                      onChange={(e) => setProvEmail(e.target.value)}
                      className={`w-full p-2 rounded-xl border focus:ring-1 focus:ring-emerald-500 text-xs ${
                        isDarkMode ? 'bg-slate-950 border-slate-755' : 'bg-slate-50'
                      }`}
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 bangla-text">অ্যাকাউন্ট সিকিউরিটি পাসওয়ার্ড *:</label>
                  <input
                    type="text"
                    required
                    value={provPassword}
                    onChange={(e) => setProvPassword(e.target.value)}
                    className={`w-full p-2 rounded-xl border focus:ring-1 focus:ring-emerald-500 text-xs text-rose-500 font-bold ${
                      isDarkMode ? 'bg-slate-950 border-slate-755' : 'bg-slate-50'
                    }`}
                    placeholder="কমপক্ষে ৪ সংখ্যার পাসওয়ার্ড দিন"
                  />
                  <p className="text-[9px] text-slate-400 font-sans leading-none">Note: Use this password along with Mobile/Email to login at customer unified section.</p>
                </div>

                {provError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] rounded-xl bangla-text">
                    ⚠️ {provError}
                  </div>
                )}

                {provSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[11px] rounded-xl bangla-text font-bold">
                    🎉 {provSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={provLoading || !provName || (!provPhone && !provEmail) || !provPassword}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-45 text-white font-sans font-extrabold py-3 rounded-xl transition flex items-center justify-center gap-1 text-xs cursor-pointer shadow-md"
                >
                  {provLoading ? 'অ্যাকাউন্ট প্রসেস হচ্ছে...' : 'নতুন মেম্বারশিপ যোগ করুন 🚀'}
                </button>
              </form>
            </div>
          </div>

          {/* Users Audit Trail list */}
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 shadow-lg ${
            isDarkMode ? 'bg-slate-800/45 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="border-b pb-4 border-dashed border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-6 rounded-full bg-indigo-500"></div>
                <div>
                  <h3 className="font-extrabold text-sm bangla-text">📊 নিবন্ধিত সিস্টেম মেম্বার ও অ্যাকাউন্ট লিস্ট</h3>
                  <p className="text-[10px] text-slate-400">Total Authenticated Users Audit Trail (Secure DB Connection)</p>
                </div>
              </div>

              <button 
                onClick={fetchSystemUsers}
                disabled={fetchingUsers}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-750 text-[10px] rounded-lg transition border border-transparent dark:border-slate-750 select-none font-bold cursor-pointer"
              >
                {fetchingUsers ? 'রিলোড হচ্ছে...' : 'লিস্ট রিফ্রেশ'}
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-slate-850 text-slate-400' : 'border-slate-200 text-slate-500'} uppercase font-bold tracking-wider`}>
                    <th className="p-3">পূর্ণ নাম (Name)</th>
                    <th className="p-3">মোবাইল / ইউজারনেম</th>
                    <th className="p-3">ইমেইল এড্রেস</th>
                    <th className="p-3 text-center">টাইপ/রোল</th>
                    <th className="p-3 text-right">নিবন্ধন তারিখ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                  {systemUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-sans">
                        কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে উপরের ফর্ম ব্যবহার করে একটি অ্যাকাউন্ট তৈরি করুন।
                      </td>
                    </tr>
                  ) : (
                    systemUsers.map((user: any) => {
                      let badgeClass = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
                      let badgeLabel = "🛍️ কাস্টমার";
                      if (user.role === 'seller') {
                        badgeClass = "text-rose-500 bg-rose-500/10 border-rose-500/20";
                        badgeLabel = "🏪 সেলার/ভেন্ডর";
                      } else if (user.role === 'admin') {
                        badgeClass = "text-amber-500 bg-amber-500/10 border-amber-500/20";
                        badgeLabel = "👑 এডমিন";
                      }

                      return (
                        <tr key={user.id} className={`hover:bg-slate-500/5 transition duration-150`}>
                          <td className="p-3 font-extrabold bangla-text text-slate-700 dark:text-slate-200">{user.name}</td>
                          <td className="p-3 font-mono text-slate-600 dark:text-slate-400 font-bold">{user.phone || 'N/A'}</td>
                          <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{user.email || 'N/A'}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-extrabold select-none ${badgeClass}`}>
                              {badgeLabel}
                            </span>
                          </td>
                          <td className="p-3 text-right text-slate-400 font-mono text-[10px]">
                            {new Date(user.createdAt).toLocaleDateString('bn-BD')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* 7. PRODUCT EDIT MODAL OVERLAY */}
      {editingProduct && (() => {
        const labelClass = isDarkMode 
          ? "block text-[11px] font-extrabold text-slate-300 mb-1 bangla-text" 
          : "block text-[11px] font-extrabold text-slate-800 mb-1 bangla-text";

        const labelClassEng = isDarkMode 
          ? "block text-[11px] font-extrabold text-slate-300 mb-1 font-sans" 
          : "block text-[11px] font-extrabold text-slate-800 mb-1 font-sans";

        const inputClass = isDarkMode
          ? "w-full p-2.5 rounded-xl border bg-slate-950 border-slate-700 text-slate-50 font-bold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
          : "w-full p-2.5 rounded-xl border bg-white border-slate-300 text-slate-950 font-extrabold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs";

        const selectClass = isDarkMode
          ? "w-full p-2.5 rounded-xl border bg-slate-950 border-slate-700 text-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
          : "w-full p-2.5 rounded-xl border bg-white border-slate-300 text-slate-950 font-extrabold focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs";

        return (
          <div className="fixed inset-0 z-55 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" id="edit-prod-modal-overlay">
            <div className={`w-full max-w-2xl rounded-3xl shadow-2xl p-6 md:p-8 space-y-5 border ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-4 border-dashed border-slate-200 dark:border-slate-850">
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-base text-orange-500 flex items-center gap-2 bangla-text">
                    <Edit size={20} />
                    পণ্যের তথ্য ও মূল্য তালিকা সম্পাদন
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans">Edit Product Names, Stock Counts, Media URLs & Price Discounts</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 font-black text-sm cursor-pointer transition"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveProductEdit} className="space-y-4">
                {/* Product Names (Bangla & English) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>পণ্যের নাম (বাংলা) *</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClassEng}>English Name (Scientific tag)</label>
                    <input
                      type="text"
                      value={editingProduct.englishName || ''}
                      onChange={(e) => {
                        const updated = { ...editingProduct, englishName: e.target.value };
                        setEditingProduct(updated);
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Price calculations */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="space-y-1">
                    <label className={labelClass}>খুচরা/রেগুলার মূল্য</label>
                    <input
                      type="number"
                      value={editRegularPrice}
                      onChange={(e) => setEditRegularPrice(e.target.value)}
                      className={inputClass}
                      placeholder="যেমন: ২০০"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>বিক্রয় মূল্য *</label>
                    <input
                      type="number"
                      required
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className={inputClass}
                      placeholder="যেমন: ১৫০"
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className={labelClass}>ইনস্ট্যান্ট ডিসকাউন্ট</label>
                    <div className="h-9 rounded-xl bg-orange-500/10 text-orange-600 text-xs font-bold font-sans flex items-center justify-center border border-orange-500/10 uppercase">
                      {(() => {
                        const rp = editRegularPrice.trim() ? Number(editRegularPrice) : 0;
                        const sp = Number(editPrice);
                        if (rp > sp) {
                          return `${Math.round(((rp - sp) / rp) * 100)}% ছাড় (Auto)`;
                        }
                        return '০% ছাড়';
                      })()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>নির্ধারিত ট্যাগ অফার</label>
                    <input
                      type="text"
                      value={editOffer}
                      onChange={(e) => setEditOffer(e.target.value)}
                      className={inputClass}
                      placeholder="যেমন: কিনলে ফ্রী"
                    />
                  </div>
                </div>

                {/* Stock counters, Unit, Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>ওজন ও একক *</label>
                    <input
                      type="text"
                      required
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>স্টক সংখ্যা *</label>
                    <input
                      type="number"
                      required
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>ক্যাটাগরি</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as any)}
                      className={selectClass}
                    >
                      <option value="pickle" className={isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>আচার</option>
                      <option value="dried_fish" className={isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>शूटকী</option>
                      <option value="burmese" className={isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>বার্মিজ পণ্য</option>
                      <option value="handicraft" className={isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>হস্তশিল্প</option>
                      <option value="fresh_fish" className={isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>তাজা মাছ</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className={labelClass}>পণ্য বিবরণ</label>
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Image selection / direct upload */}
                <div className={`space-y-1 p-3 rounded-2xl border border-dashed ${
                  isDarkMode ? 'bg-slate-950/10 border-slate-800' : 'bg-slate-50 border-slate-300'
                }`}>
                  <label className={labelClass}>পণ্যের মূল ছবি আপলোড করুন</label>
                  <ImageUploaderWithCrop
                    isDarkMode={isDarkMode}
                    value={editImage}
                    onChange={(url) => setEditImage(url)}
                  />
                  
                  {/* Fallback override URL */}
                  <div className="pt-2">
                    <label className={isDarkMode ? "text-[10px] text-slate-400 font-mono block mb-1" : "text-[10px] text-slate-600 font-mono font-bold block mb-1"}>Image URL Manual Override (optional)</label>
                    <input
                      type="text"
                      value={editImage}
                      onChange={(e) => setEditImage(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 py-3 text-xs rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold font-sans cursor-pointer transition text-center"
                  >
                    <span className="bangla-text">বাতিল করুন</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-xs rounded-2xl font-bold font-sans text-white bg-gradient-to-r from-orange-500 to-amber-600 shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition flex items-center justify-center gap-1.5"
                  >
                    <Check size={15} />
                    <span className="bangla-text">পরিবর্তন সেভ করুন</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
