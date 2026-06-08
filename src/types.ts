/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string; // Bangla Name
  englishName: string;
  price: number;
  unit: string; // যেমন: ১ কেজি, ৫০০ গ্রাম, ১ ডজন
  category: 'pickle' | 'dried_fish' | 'burmese' | 'handicraft' | 'fresh_fish';
  description: string;
  image: string;
  rating: number;
  reviews: Review[];
  vendorId: string;
  vendorName: string;
  stock: number;
  isPopular?: boolean;
  regularPrice?: number; // Original regular/retail price before discount
  specialOffer?: string; // e.g. "১০% ছাড়", "বাই ১ গেট ১"
  sliderImage?: string; // Opt-in slider image for homepage slider section
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'bkash' | 'nagad' | 'card' | 'cod';
  deliveryType: 'standard' | 'express'; // Fast delivery option
  createdAt: string;
  estimatedDelivery: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  text: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'offer' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  role?: 'customer' | 'seller' | 'admin';
  createdAt: string;
}

export interface VendorStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  popularProducts: string[];
}
