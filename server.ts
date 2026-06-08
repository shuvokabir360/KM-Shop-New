/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Ensure GEMINI_API_KEY is available
const apiKey = process.env.GEMINI_API_KEY;

// Register Gemini Client
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory simple database simulation for persistent products, orders, messages, and notification logs
// This acts as a robust relational/Document DB simulation that coordinates with the offline sync logic
import { INITIAL_PRODUCTS } from './src/data/mockProducts.js';
import { Product, Order, Notification, Customer } from './src/types';

// Let's populate the initial products list
let dbProducts: Product[] = [...INITIAL_PRODUCTS];
let dbCustomers: Customer[] = [
  {
    id: 'c-1',
    name: 'শামসুল আরেফিন',
    phone: '01712345678',
    password: '',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c-2',
    name: 'সাবিহা চৌধুরী',
    phone: '01898765432',
    password: '',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  }
];
let dbOrders: Order[] = [
  {
    id: 'KQM-98432',
    customerName: 'শামসুল আরেফিন',
    customerPhone: '01712345678',
    customerEmail: 'shamsul@example.com',
    shippingAddress: 'সেক্টর ৪, উত্তরা, ঢাকা',
    items: [
      { productId: 'p1', productName: 'কুয়াকাটার আসল টক-মিষ্টি আমরার আচার', price: 320, quantity: 2 },
      { productId: 'p8', productName: 'কুয়াকাটার তাজা লাল সুস্বাদু গলদা চিংড়ি', price: 1200, quantity: 1 }
    ],
    totalAmount: 1840,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'bkash',
    deliveryType: 'express', // Ultra-fast direct cold-chain carrier
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'KQM-10254',
    customerName: 'সাবিহা চৌধুরী',
    customerPhone: '01898765432',
    customerEmail: 'sabiha@example.com',
    shippingAddress: 'হালিশহর, চট্টগ্রাম',
    items: [
      { productId: 'p3', productName: 'কুয়াকাটার বিখ্যাত লইট্টা শুটকী (প্রিমিয়াম)', price: 450, quantity: 1 }
    ],
    totalAmount: 450,
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'nagad',
    deliveryType: 'standard',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }
];

let dbNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'কুয়াকাটা মাল্টিমিডিয়া প্ল্যাটফর্মে আপনাকে স্বাগতম!',
    message: 'আমাদের এখানে পাবেন খাঁটি আচার, রোদ্রে শুকানো শুটকী, আসল বার্মিজ আইটেম, হস্তশিল্প এবং সমুদ্রের তাজা মাছের এক্সপ্রেস ডিল।',
    type: 'system',
    isRead: false,
    createdAt: new Date().toISOString()
  }
];

// Simple in-memory direct team chat messages
let supportMessages = [
  { sender: 'agent', text: 'আসসালামু আলাইকুম! কুয়াকাটা মাল্টিমিডিয়া কাস্টমার কেয়ার টিম থেকে আমি তানভীর বলছি। আপনাকে কীভাবে সহযোগিতা করতে পারি?', timestamp: new Date().toISOString() }
];

// Global Site Customization State - In memory server store
let dbSettings = {
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
};

// --- API Endpoints ---

// API Products list (includes dynamic seller items)
app.get('/api/products', (req, res) => {
  res.json({ success: true, count: dbProducts.length, data: dbProducts });
});

// Create product (multi-vendor seller listing)
app.post('/api/products', (req, res) => {
  try {
    const { name, englishName, price, regularPrice, unit, category, description, image, sliderImage, vendorId, vendorName, stock, specialOffer } = req.body;
    
    if (!name || !price || !category || !vendorName) {
      return res.status(400).json({ success: false, error: 'পণ্যের নাম, মূল্য, ক্যাটাগরি এবং বিক্রেতার নাম অবশ্যই প্রদান করতে হবে।' });
    }

    const newProduct: Product = {
      id: `p-${Date.now()}`,
      name,
      englishName: englishName || 'Seller Product',
      price: Number(price),
      regularPrice: regularPrice ? Number(regularPrice) : undefined,
      unit: unit || '১ পিস',
      category,
      description: description || 'বিক্রেতার পক্ষ থেকে কোনো বিবরণ প্রদান করা হয়নি।',
      image: image || 'https://images.unsplash.com/photo-1544526226-d4568090ffb8?auto=format&fit=crop&q=80&w=400',
      sliderImage: sliderImage || undefined,
      rating: 5.0,
      reviews: [],
      vendorId: vendorId || 'seller-1',
      vendorName,
      stock: Number(stock) || 10,
      specialOffer: specialOffer || undefined
    };

    dbProducts.unshift(newProduct);
    
    // Add offering notification
    dbNotifications.unshift({
      id: `n-${Date.now()}`,
      title: 'নতুন পন্য যুক্ত হয়েছে!',
      message: `আমাদের সম্মানিত বিক্রেতা "${vendorName}" তার চমৎকার "${name}" পন্যটি বিক্রির জন্য আপলোড করেছেন। এখনই ঘুরে আসুন!`,
      type: 'offer',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Edit/Update product details, stock, or price
app.put('/api/products/:id', (req, res) => {
  const { name, englishName, price, regularPrice, unit, category, description, image, sliderImage, stock, specialOffer } = req.body;
  const prod = dbProducts.find(p => p.id === req.params.id);
  if (!prod) {
    return res.status(404).json({ success: false, error: 'পণ্যটি পাওয়া যায়নি।' });
  }
  if (name !== undefined) prod.name = name;
  if (englishName !== undefined) prod.englishName = englishName;
  if (price !== undefined) prod.price = Number(price);
  if (regularPrice !== undefined) prod.regularPrice = regularPrice ? Number(regularPrice) : undefined;
  if (unit !== undefined) prod.unit = unit;
  if (category !== undefined) prod.category = category;
  if (description !== undefined) prod.description = description;
  if (image !== undefined) prod.image = image;
  if (sliderImage !== undefined) prod.sliderImage = sliderImage;
  if (stock !== undefined) prod.stock = Number(stock);
  if (specialOffer !== undefined) prod.specialOffer = specialOffer;
  res.json({ success: true, data: prod });
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const index = dbProducts.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'পণ্যটি পাওয়া যায়নি।' });
  }
  const deleted = dbProducts.splice(index, 1)[0];
  res.json({ success: true, data: deleted });
});

// Sync offline data
app.post('/api/sync', (req, res) => {
  const { localOrders, localProducts } = req.body;

  if (localProducts && Array.isArray(localProducts)) {
    localProducts.forEach((prod: Product) => {
      if (!dbProducts.some(p => p.id === prod.id)) {
        dbProducts.unshift(prod);
      }
    });
  }

  if (localOrders && Array.isArray(localOrders)) {
    localOrders.forEach((ord: Order) => {
      if (!dbOrders.some(o => o.id === ord.id)) {
        dbOrders.unshift(ord);
      }
    });
  }

  res.json({
    success: true,
    message: 'অফলাইন ডাটা সফলভাবে সার্ভারের সাথে সিঙ্ক করা হয়েছে!',
    syncedProductsCount: localProducts?.length || 0,
    syncedOrdersCount: localOrders?.length || 0
  });
});

// Orders creation
app.post('/api/orders', (req, res) => {
  try {
    const { customerName, customerPhone, customerEmail, shippingAddress, items, totalAmount, paymentMethod, deliveryType } = req.body;

    if (!customerName || !customerPhone || !shippingAddress || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'গ্রাহকের নাম, মোবাইল নম্বর, ঠিকানা এবং কার্ট আইটেম অবশ্যই প্রয়োজন।' });
    }

    const orderId = `KQM-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    
    // Delivery hours calculation
    // Express - within 2 to 4 hours in Kuakata/nearby, otherwise 24 hrs with cold chain icing
    const deliveryHours = deliveryType === 'express' ? 3 : 48;
    const estimatedDelivery = new Date(now.getTime() + deliveryHours * 60 * 60 * 1000).toISOString();

    const newOrder: Order = {
      id: orderId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || 'guest@example.com',
      shippingAddress,
      items,
      totalAmount,
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      paymentMethod,
      deliveryType: deliveryType || 'standard',
      createdAt: now.toISOString(),
      estimatedDelivery
    };

    // Deduct stock
    items.forEach((item: any) => {
      const prod = dbProducts.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });

    // Auto-create customer if they don't exist yet with this phone number
    const phoneTrimmed = customerPhone.trim();
    let existingCustomer = dbCustomers.find(c => c.phone === phoneTrimmed);
    if (!existingCustomer) {
      existingCustomer = {
        id: `c-${Date.now()}`,
        name: customerName,
        phone: phoneTrimmed,
        password: '', // will be set during first customer login
        createdAt: now.toISOString()
      };
      dbCustomers.push(existingCustomer);
    } else {
      // Just keep customer name synced
      existingCustomer.name = customerName;
    }

    dbOrders.unshift(newOrder);

    // Send notification
    dbNotifications.unshift({
      id: `n-${Date.now()}`,
      title: 'নতুন অর্ডার প্লেসড!',
      message: `অভিনন্দন! আপনার অর্ডার ${orderId} সফলভাবে গৃহীত হয়েছে। মোট মূল্য: ৳${totalAmount}।`,
      type: 'order',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ success: true, orderId, data: newOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all orders list (for Admin)
app.get('/api/orders', (req, res) => {
  res.json({ success: true, data: dbOrders });
});

// Get single order info and status tracking
app.get('/api/orders/:id', (req, res) => {
  const order = dbOrders.find(o => o.id.toUpperCase() === req.params.id.toUpperCase());
  if (!order) {
    return res.status(404).json({ success: false, error: 'অর্ডারটি খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক আইডি টাইপ করুন।' });
  }
  res.json({ success: true, data: order });
});

// Get notifications
app.get('/api/notifications', (req, res) => {
  res.json({ success: true, data: dbNotifications });
});

// Mark notifications as read
app.post('/api/notifications/read', (req, res) => {
  dbNotifications.forEach(n => n.isRead = true);
  res.json({ success: true });
});

// Update order status or details
app.put('/api/orders/:id', (req, res) => {
  const { status, paymentStatus } = req.body;
  const order = dbOrders.find(o => o.id.toUpperCase() === req.params.id.toUpperCase());
  if (!order) {
    return res.status(404).json({ success: false, error: 'অর্ডারটি পাওয়া যায়নি।' });
  }
  if (status !== undefined) order.status = status;
  if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;
  res.json({ success: true, data: order });
});

// Create custom administrator broadcast notification
app.post('/api/notifications', (req, res) => {
  const { title, message, type } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, error: 'শিরোনাম এবং বার্তা উপাদান অবশ্যই প্রয়োজন।' });
  }
  const customAlert = {
    id: `n-sys-${Date.now()}`,
    title,
    message,
    type: type || 'system',
    isRead: false,
    createdAt: new Date().toISOString()
  };
  dbNotifications.unshift(customAlert);
  res.status(201).json({ success: true, data: customAlert });
});

// GET site customization settings
app.get('/api/settings', (req, res) => {
  res.json({ success: true, data: dbSettings });
});

// POST site customization settings save
app.post('/api/settings', (req, res) => {
  try {
    const { 
      siteName, 
      siteTagline, 
      announcement, 
      heroTitle, 
      heroSub, 
      heroDesc, 
      heroTheme,
      enableAiChat,
      enableSupportChat,
      enableOrderTracker,
      enableSellerMode,
      promoSectionTitle,
      categorySectionTitle,
      productSectionTitle,
      footerDesc,
      footerContact,
      footerAddress
    } = req.body;

    if (siteName !== undefined) dbSettings.siteName = siteName;
    if (siteTagline !== undefined) dbSettings.siteTagline = siteTagline;
    if (announcement !== undefined) dbSettings.announcement = announcement;
    if (heroTitle !== undefined) dbSettings.heroTitle = heroTitle;
    if (heroSub !== undefined) dbSettings.heroSub = heroSub;
    if (heroDesc !== undefined) dbSettings.heroDesc = heroDesc;
    if (heroTheme !== undefined) dbSettings.heroTheme = heroTheme;
    
    if (enableAiChat !== undefined) dbSettings.enableAiChat = Boolean(enableAiChat);
    if (enableSupportChat !== undefined) dbSettings.enableSupportChat = Boolean(enableSupportChat);
    if (enableOrderTracker !== undefined) dbSettings.enableOrderTracker = Boolean(enableOrderTracker);
    if (enableSellerMode !== undefined) dbSettings.enableSellerMode = Boolean(enableSellerMode);

    if (promoSectionTitle !== undefined) dbSettings.promoSectionTitle = promoSectionTitle;
    if (categorySectionTitle !== undefined) dbSettings.categorySectionTitle = categorySectionTitle;
    if (productSectionTitle !== undefined) dbSettings.productSectionTitle = productSectionTitle;
    if (footerDesc !== undefined) dbSettings.footerDesc = footerDesc;
    if (footerContact !== undefined) dbSettings.footerContact = footerContact;
    if (footerAddress !== undefined) dbSettings.footerAddress = footerAddress;

    res.json({ success: true, message: 'সাইটের সেটিংস সফলভাবে আপগ্রেড হয়েছে!', data: dbSettings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// --- Super Admin Password & Authentication Endpoints ---

let adminPassword = 'admin123';
let adminPasswordChanged = false;

// Unified database lookup helper
const findUserByIdentifier = (identifier: string) => {
  if (!identifier) return null;
  const cleanId = identifier.trim().toLowerCase();

  // Special match: is it the super-admin?
  if (cleanId === 'shuvokuakata27@gmail.com' || cleanId === '01999999999') {
    return {
      id: 'admin-master',
      name: 'Super Admin',
      phone: '01999999999',
      email: 'shuvokuakata27@gmail.com',
      password: adminPassword,
      role: 'admin' as const,
      createdAt: new Date().toISOString()
    };
  }

  return dbCustomers.find(user => 
    (user.phone && user.phone.trim() === cleanId) || 
    (user.email && user.email.trim().toLowerCase() === cleanId)
  );
};

// Password recovery tokens (in-memory database)
const activeRecoveries = new Map<string, { identifier: string; email: string; expires: number }>();

// Password Recovery API Endpoints (For Super Admin, Customer, Seller/Vendor)
app.post('/api/auth/recover-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'অনুগ্রহ করে আপনার নিবন্ধিত ইমেইল এড্রেসটি দিন।' });
  }

  const cleanEmail = email.trim().toLowerCase();
  let foundUser = null;

  if (cleanEmail === 'shuvokuakata27@gmail.com') {
    foundUser = {
      id: 'admin-master',
      name: 'Super Admin',
      email: 'shuvokuakata27@gmail.com',
      role: 'admin'
    };
  } else {
    // Search dbCustomers
    const user = dbCustomers.find(cu => cu.email && cu.email.trim().toLowerCase() === cleanEmail);
    if (user) {
      foundUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
    }
  }

  if (!foundUser) {
    return res.status(404).json({ success: false, error: 'দুঃখিত, এই ইমেইল এড্রেস দিয়ে কোনো নিবন্ধিত অ্যাকাউন্ট পাওয়া যায়নি।' });
  }

  // Generate a unique token
  const token = `rectok-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  activeRecoveries.set(token, {
    identifier: foundUser.id,
    email: cleanEmail,
    expires: Date.now() + 15 * 60 * 1000 // 15 mins expiry
  });

  res.json({
    success: true,
    message: 'পাসওয়ার্ড রি-সেট মেইল সফলভাবে প্রস্তুত করা হয়েছে!',
    token,
    user: foundUser
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, error: 'টোকেন এবং নতুন পাসওয়ার্ড প্রদান করা আবশ্যক।' });
  }

  if (newPassword.trim().length < 4) {
    return res.status(400).json({ success: false, error: 'নিরাপত্তার স্বার্থে পাসওয়ার্ডটি কমপক্ষে ৪ সংখ্যার হতে হবে।' });
  }

  const recovery = activeRecoveries.get(token);
  if (!recovery) {
    return res.status(400).json({ success: false, error: 'দুঃখিত, পাসওয়ার্ড পরিবর্তনের লিঙ্ক বা টোকেনটি অবৈধ।' });
  }

  if (Date.now() > recovery.expires) {
    activeRecoveries.delete(token);
    return res.status(400).json({ success: false, error: 'দুঃখিত, পাসওয়ার্ড পরিবর্তনের লিঙ্কটির মেয়াদ উত্তীর্ণ হয়ে গেছে। অনুগ্রহ করে আবার চেষ্টা করুন।' });
  }

  // Update password
  if (recovery.identifier === 'admin-master') {
    adminPassword = newPassword.trim();
    adminPasswordChanged = true;
  } else {
    const userIndex = dbCustomers.findIndex(cu => cu.id === recovery.identifier);
    if (userIndex !== -1) {
      dbCustomers[userIndex].password = newPassword.trim();
    } else {
      return res.status(404).json({ success: false, error: 'ব্যবহারকারীকে খুঁজে পাওয়া যায়নি!' });
    }
  }

  // Clean up token after successful reset
  activeRecoveries.delete(token);

  res.json({
    success: true,
    message: 'আপনার পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।'
  });
});

// Unified Auth Endpoints

// 1. Check if user exists by email or mobile
app.post('/api/auth/check', (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ success: false, error: 'ইমেইল অথবা মোবাইল নম্বর প্রদান করুন।' });
  }

  const user = findUserByIdentifier(identifier);
  const isEmail = identifier.includes('@');

  if (!user) {
    return res.json({ 
      success: true, 
      exists: false, 
      hasPassword: false, 
      name: '', 
      role: 'customer',
      identifierType: isEmail ? 'email' : 'phone' 
    });
  }

  res.json({
    success: true,
    exists: true,
    hasPassword: !!user.password,
    name: user.name,
    role: user.role || 'customer',
    identifierType: isEmail ? 'email' : 'phone'
  });
});

// 2. Unified Registration (Saves only Customer accounts from public form)
app.post('/api/auth/register', (req, res) => {
  const { name, phone, email, password, role } = req.body;

  if (role && role !== 'customer') {
    return res.status(403).json({ success: false, error: 'সেলার, ভেন্ডর অথবা এডমিন অ্যাকাউন্ট আপনি নিজে অনলাইন থেকে তৈরি করতে পারবেন না। এই অ্যাকাউন্টগুলো শুধুমাত্র সুপার এডমিন প্যানেল থেকে তৈরি করার নিয়ম রয়েছে।' });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'আপনার সম্পূর্ণ নাম প্রদান করুন।' });
  }

  if (!phone && !email) {
    return res.status(400).json({ success: false, error: 'নিবন্ধনের জন্য কমপক্ষে একটি ইমেইল অথবা মোবাইল নম্বর প্রদান করুন।' });
  }

  if (!password) {
    return res.status(400).json({ success: false, error: 'একটি সিকিউর পাসওয়ার্ড প্রদান করুন।' });
  }

  if (password.length < 4) {
    return res.status(400).json({ success: false, error: 'পাসওয়ার্ড অত্যন্ত ৪ লাইনের বা সংখ্যার হতে হবে।' });
  }

  if (phone) {
    const cleanPhone = phone.trim();
    if (findUserByIdentifier(cleanPhone)) {
      return res.status(400).json({ success: false, error: 'এই মোবাইল নম্বরটি ইতিমধ্যে নিবন্ধিত রয়েছে!' });
    }
  }

  if (email) {
    const cleanEmail = email.trim().toLowerCase();
    if (findUserByIdentifier(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'এই ইমেইল এড্রেসটি ইতিমধ্যে নিবন্ধিত রয়েছে!' });
    }
  }

  const newUser: Customer = {
    id: `u-${Date.now()}`,
    name: name.trim(),
    phone: phone ? phone.trim() : '',
    email: email ? email.trim().toLowerCase() : '',
    password: password,
    role: 'customer', // Online self-registration is strictly restricted to regular customer accounts
    createdAt: new Date().toISOString()
  };

  dbCustomers.push(newUser);

  res.json({
    success: true,
    message: 'নিবন্ধন সফলভাবে সম্পন্ন হয়েছে!',
    user: {
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
      role: newUser.role
    }
  });
});

// 2.5 Super Admin Only Account Provisioning Router 
app.post('/api/admin/create-user', (req, res) => {
  const { name, phone, email, password, role } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'সম্পূর্ণ নাম প্রদান করুন।' });
  }

  if (!phone && !email) {
    return res.status(400).json({ success: false, error: 'মোবাইল নম্বর অথবা ইমেইল যেকোনো একটি টাইপ করুন।' });
  }

  if (!password || password.trim().length < 4) {
    return res.status(400).json({ success: false, error: 'অন্তত ৪ ডিজিটের একটি পাসওয়ার্ড টাইপ করুন।' });
  }

  if (phone) {
    const cleanPhone = phone.trim();
    if (findUserByIdentifier(cleanPhone)) {
      return res.status(400).json({ success: false, error: 'এই মোবাইল নম্বরটি দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে।' });
    }
  }

  if (email) {
    const cleanEmail = email.trim().toLowerCase();
    if (findUserByIdentifier(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'এই ইমেইল এড্রেসটি দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা আছে।' });
    }
  }

  const newUser: Customer = {
    id: `u-${Date.now()}`,
    name: name.trim(),
    phone: phone ? phone.trim() : '',
    email: email ? email.trim().toLowerCase() : '',
    password: password,
    role: role || 'customer',
    createdAt: new Date().toISOString()
  };

  dbCustomers.push(newUser);

  res.json({
    success: true,
    message: 'নতুন মেম্বারশিপ অ্যাকাউন্ট সফলভাবে তৈরি ও সক্রিয় করা হয়েছে!',
    user: {
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
      role: newUser.role
    }
  });
});

// 2.6 Fetch All Users List for Admin Audit Panel
app.get('/api/admin/users', (req, res) => {
  res.json({
    success: true,
    users: dbCustomers.map(u => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      email: u.email,
      role: u.role || 'customer',
      createdAt: u.createdAt || new Date().toISOString()
    }))
  });
});

// 3. Unified Login for Customers, Sellers, and Administrators using Email or Mobile
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, error: 'ইমেইল/মোবাইল এবং পাসওয়ার্ড প্রদান করুন।' });
  }

  const user = findUserByIdentifier(identifier);

  if (!user) {
    return res.status(404).json({ success: false, error: 'এই ইমেইল বা মোবাইল নম্বরটি দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।' });
  }

  const expectedPassword = user.id === 'admin-master' ? adminPassword : user.password;

  if (expectedPassword !== password) {
    return res.status(401).json({ success: false, error: 'ভুল পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিন।' });
  }

  res.json({
    success: true,
    message: 'লগইন সফল হয়েছে!',
    isFirstLogin: user.id === 'admin-master' ? !adminPasswordChanged : false,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email || '',
      role: user.role || 'customer'
    }
  });
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'ইমেইল এবং পাসওয়ার্ড প্রদান করুন।' });
  }

  const emailTrimmed = email.trim().toLowerCase();
  if (emailTrimmed !== 'shuvokuakata27@gmail.com') {
    return res.status(401).json({ success: false, error: 'দুঃখিত, এই ইমেইলটি সুপার এডমিন হিসেবে নিবন্ধিত নয়!' });
  }

  if (password !== adminPassword) {
    return res.status(401).json({ success: false, error: 'ভুল পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিন।' });
  }

  res.json({
    success: true,
    isFirstLogin: !adminPasswordChanged,
    user: {
      email: 'shuvokuakata27@gmail.com',
      displayName: 'Super Admin'
    }
  });
});

app.post('/api/admin/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'বর্তমান পাসওয়ার্ড এবং নতুন পাসওয়ার্ড প্রয়োজন।' });
  }

  if (currentPassword !== adminPassword) {
    return res.status(400).json({ success: false, error: 'বর্তমান পাসওয়ার্ড ভুল হযেছে।' });
  }

  if (newPassword.length < 5) {
    return res.status(400).json({ success: false, error: 'নতুন পাসওয়ার্ড অন্তত ৫ অক্ষরের হতে হবে।' });
  }

  adminPassword = newPassword;
  adminPasswordChanged = true;

  res.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!' });
});


// --- Customer-related API Endpoints ---

// Check customer status by phone
app.post('/api/customer/check', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, error: 'মোবাইল নম্বর প্রদান করুন।' });
  }
  const phoneTrimmed = phone.trim();
  const customer = dbCustomers.find(c => c.phone === phoneTrimmed);
  if (!customer) {
    return res.json({ success: true, exists: false, hasPassword: false, name: '' });
  }
  res.json({
    success: true,
    exists: true,
    hasPassword: !!customer.password,
    name: customer.name
  });
});

// Register or set first-time password
app.post('/api/customer/register-password', (req, res) => {
  const { phone, name, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ success: false, error: 'মোবাইল নম্বর এবং পাসওয়ার্ড প্রয়োজন।' });
  }

  const phoneTrimmed = phone.trim();
  let customer = dbCustomers.find(c => c.phone === phoneTrimmed);

  if (!customer) {
    customer = {
      id: `c-${Date.now()}`,
      name: name || 'গ্রাহক',
      phone: phoneTrimmed,
      password: password,
      createdAt: new Date().toISOString()
    };
    dbCustomers.push(customer);
  } else {
    if (name) {
      customer.name = name;
    }
    customer.password = password;
  }

  res.json({
    success: true,
    message: 'পাসওয়ার্ড সফলভাবে সেট করা হয়েছে। আপনি এখন লগইন আছেন!',
    customer: {
      id: customer.id,
      name: customer.name,
      phone: customer.phone
    }
  });
});

// Regular password login
app.post('/api/customer/login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ success: false, error: 'মোবাইল নম্বর এবং পাসওয়ার্ড প্রয়োজন।' });
  }

  const phoneTrimmed = phone.trim();
  const customer = dbCustomers.find(c => c.phone === phoneTrimmed);

  if (!customer) {
    return res.status(404).json({ success: false, error: 'এই মোবাইল নম্বরটি দিয়ে কোনো গ্রাহক নিবন্ধিত নেই।' });
  }

  if (!customer.password) {
    return res.status(400).json({ success: false, error: 'আপনার কোনো পাসওয়ার্ড সেট করা নেই। দয়া করে প্রথমে পাসওয়ার্ড সেট করুন।' });
  }

  if (customer.password !== password) {
    return res.status(401).json({ success: false, error: 'ভুল পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিয়ে চেষ্টা করুন।' });
  }

  res.json({
    success: true,
    message: 'লগইন সফল হয়েছে!',
    customer: {
      id: customer.id,
      name: customer.name,
      phone: customer.phone
    }
  });
});

// Fetch customer orders by phone
app.get('/api/customer/orders', (req, res) => {
  const { phone } = req.query;
  if (!phone) {
    return res.status(450).json({ success: false, error: 'মোবাইল নম্বর প্রয়োজন।' });
  }

  const phoneTrimmed = (phone as string).trim();
  const customerOrders = dbOrders.filter(o => o.customerPhone === phoneTrimmed);
  res.json({ success: true, data: customerOrders });
});

// Simulating secured encryption-based online payment integration (AES-256 simulation key Exchange)
app.post('/api/payment/encrypt-gateway', (req, res) => {
  const { amount, method, cardNumber, bKashNumber, pin } = req.body;
  
  if (!method || (!bKashNumber && !cardNumber)) {
    return res.status(400).json({ success: false, error: 'পেমেন্ট গেটওয়েতে ভুল বিবরণ এসেছে।' });
  }

  // Generate simulated secure session and transaction key hashes to prove security
  const sessionToken = `sec_aes_${Buffer.from(Math.random().toString()).toString('base64').slice(0, 16)}`;
  const hashKey = Buffer.from(`${method}_gateway_token_secure_${amount}`).toString('hex').slice(0, 32);

  res.json({
    success: true,
    message: 'পেমেন্ট আধুনিক SHA-256 এনক্রিপশনের মাধ্যমে অত্যন্ত নিরাপদে সম্পন্ন হয়েছে!',
    transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
    sessionToken,
    hashKey,
    timestamp: new Date().toISOString()
  });
});

// Chatbot endpoint with Server-side Gemini API
app.post('/api/chatbot', async (req, res) => {
  const { message, chatHistory } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'বার্তা খালি হতে পারে না।' });
  }

  if (!ai) {
    // Elegant hardcoded response backup in case API Key is missing or invalid
    return res.json({
      success: true,
      text: `আসসালামু আলাইকুম! **কুয়াকাটা মাল্টিমিডিয়া** কাস্টমার কেয়ার অ্যাসিস্ট্যান্ট হিসেবে আপনাকে স্বাগত জানাই। 🌊🍓🐟\n\nবর্তমানে আমাদের ট্রেইন্ড এআই মডেল কি-টিস্ট সক্রিয় করতে পারছি না, তবে আমাদের সেবা সম্পর্কে তথ্য দিচ্ছি:\n\n১. **তাজা লাল চিংড়ি ও কোল্ড চেইন ডেলিভারি**: কুয়াকাটা উপকূল থেকে সরাসরি সংগৃহীত মাছ বিশেষ বরফ-বাক্সে অতি দ্রুত ডেলিভারি করা হয়।\n২. **ঐতিহ্যবাহী শুটকী ও আচার**: একদম বালুমুক্ত ও শতভাগ রাসায়নিকমুক্ত লইট্টা ও রূপচাঁদা শুটকী এবং খাঁটি সরিষার তেলে তৈরি আমরার বিখ্যাত আচার।\n৩. **অর্ডার ট্র্যাকিং ও অনলাইন পেমেন্ট**: bKash, Nagad এবং ক্রিপ্টো-সিকিউরড কার্ড পেমেন্ট গেটওয়ের মাধ্যমে অতি সহজে বুক করে রিয়েল-টাইমে ট্র্যাক করতে পারবেন।\n\nআপনি কী অর্ডার করতে আগ্রহী? আমাকে সাহায্য করতে দিন!`
    });
  }

  try {
    const chatConfig = {
      systemInstruction: `আপনি 'কুয়াকাটা মাল্টিমিডিয়া কাস্টমার কেয়ার এআই সাহায্যকারী'। কুয়াকাটা অঞ্চলের ঐতিহ্যবাহী খাবার ও পন্যদ্রব্য (আচার, শুটকী, বার্মিজ খেলনা ও পন্য, রাখাইন তাত সামগ্রী, হস্তশিল্প এবং সমূদ্রের তাজা গলদা চিংড়ি/ইলিশ মাছ) সরাসরি সমূদ্র সৈকত থেকে গ্রাহকদের নিকট বিক্রয় ও দ্রুত সরবরাহের দায়িত্বে নিয়োজিত।
গ্রাহকের কুয়োরি অনুসারে উত্তর দিবেন।
- **তাজা মাছ দ্রুত ডেলিভারি**: আমরা বিশেষ ফাস্ট-ট্র্যাক কোল্ড চেইন ওয়াটারপ্রুফ ক্যারিয়ার যুক্ত করেছি যা ৪ থেকে ১২ ঘণ্টার মধ্যে নির্দিষ্ট এরিয়ায় এবং ঢাকায় ২৪ ঘণ্টার মধ্যে বিশেষ আইস বক্সে খাবার ফ্রেশ রেখে পৌঁছে দেয়।
- **নিরাপদ গেটওয়ে**: আমাদের অনলাইন বুকিংয়ে bKash, Nagad এবং কার্ড পেমেন্টে আধুনিক AES-256 এনক্রিপশন সিস্টেম সংযুক্ত রয়েছে।
- **মাল্টি ভেন্ডর সেবা**: সেলাররা চাইলে সহজেই সেলার ড্যাশবোর্ডে গিয়ে পন্য আপলোড করে কাস্টমারদের কাছে সরাসরি বিক্রি করতে পারে।
- **অফলাইন মোড**: কোনো কারণে ইন্টারনেট সাময়িক চলে গেলেও আমাদের সাইটের অফলাইন ডাটা সিঙ্কিং মোড আপনার কার্ট ও ব্রাউজিং ইনফো ধরে রাখে এবং নেট আসার সাথে সাথে সার্ভারে সিঙ্ক করে।
সব উত্তর চমৎকার, সাবলীল এবং মার্জিত বাংলায় প্রদান করবেন। অপ্রয়োজনীয় ইংরেজি পরিহার করে মিষ্টি হাসি ও কুয়াকাটার আতিথেয়তার সাথে উত্তর দিন। খুব বড় বাক্য তৈরি করবেন না, গুরুত্বপূর্ণ বিষয়গুলোকে বোল্ড করে পয়েন্ট আকারে উপস্থাপন করুন।`,
    };

    // Format query correctly for `@google/genai`
    const prompt = message;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: chatConfig
    });

    const botReply = response.text || 'দুঃখিত, কোনো সাড়া পাওয়া যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।';
    res.json({ success: true, text: botReply });

  } catch (error: any) {
    console.error('Gemini call error:', error);
    res.json({
      success: true,
      text: `আসসালামু আলাইকুম কাস্টমার! কুয়াকাটা মাল্টিমিডিয়াতে যোগাযোগ করার জন্য ধন্যবাদ। জেনারেটিভ এআই সংযোগের সমস্যার কারণে আমি এখন কুয়াকাটার তাজা গলদা চিংড়ির ডেলিভারি, তাজা শুটকী, আসল রাখাইন থামি ও হস্তশিল্পের তথ্যসমূহ জানাচ্ছি। আমাদের **পেমেন্ট গেটওয়ে সম্পূর্ণ সুরক্ষিত এবং এন্ড-টু-এন্ড এনক্রিপ্টেড**। আপনি কী ধরনের পণ্য খুঁজছেন আমাদের জানালে সাহায্য করতে পারি।`
    });
  }
});

// Human Direct Chat logs
app.get('/api/support-chat', (req, res) => {
  res.json({ success: true, data: supportMessages });
});

app.post('/api/support-chat', (req, res) => {
  const { text, sender } = req.body;
  if (!text) {
    return res.status(400).json({ success: false });
  }

  const userMsg = { sender: sender || 'user', text, timestamp: new Date().toISOString() };
  supportMessages.push(userMsg);

  // Auto trigger friendly support response simulation from admin team in 1.5 seconds
  if (sender === 'user') {
    setTimeout(() => {
      const responseTemplates = [
        'জি ভাইয়া/আপু, আপনার মেসেজটি আমরা পেয়েছি। আমাদের কুয়াকাটার তাজা মাছ সরাসরি কোল্ড চেইনে কুরিয়ার করা হচ্ছে। আপনি কোন এরিয়া থেকে অর্ডার করতে চাচ্ছেন?',
        'আমাদের সব শুটকী কেমিক্যাল মুক্ত এবং বালুমুক্ত সুনিশ্চিত প্রসেসে শুকাতে দেওয়া হয়। আপনি কোন কোন শুটকী অর্ডার করবেন জানাবেন কি?',
        'আমাদের গেটওয়েতে আধুনিক SHA-256 এনক্রিপ্ট প্রযুক্তি আছে, তাই আপনি নিশ্চিন্তে পেমেন্ট করতে পারেন। অর্ডার করার পর ট্র্যাকিং সেকশন থেকে চেক করতে পারবেন।',
        'নিশ্চয়ই, আমরা অর্ডারটি অতি দ্রুত কুরিয়ার করতেছি। আপনাকে একটি ট্র্যাকিং মেসেজ শীঘ্রই পাঠিয়ে দেওয়া হবে।'
      ];
      const randomText = responseTemplates[Math.floor(Math.random() * responseTemplates.length)];
      supportMessages.push({ sender: 'agent', text: randomText, timestamp: new Date().toISOString() });
    }, 1500);
  }

  res.json({ success: true, data: supportMessages });
});

// --- Vite & Build Configurations Integration ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Mounting Vite server
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Static production paths serving bundler content
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Kuakata Multimedia Backend Server] running on http://localhost:${PORT}`);
  });
}

startServer();
