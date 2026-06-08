/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { X, ShoppingBag, Clock, Store, MapPin, RefreshCw, LogOut, PackageCheck, AlertCircle } from 'lucide-react';
import { Order } from '../types';

interface CustomerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  customerPhone: string;
  customerName: string;
  onLogout: () => void;
  onReorder: (orderItems: Array<{ productId: string; productName: string; price: number; quantity: number }>) => void;
}

export default function CustomerDashboardModal({
  isOpen,
  onClose,
  isDarkMode,
  customerPhone,
  customerName,
  onLogout,
  onReorder
}: CustomerDashboardModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/customer/orders?phone=${encodeURIComponent(customerPhone)}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
      } else {
        setError('অর্ডার ডাটা রিট্রিভ করতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      setError('সার্ভার কানেকশন ত্রুটি, পুনরায় লোড ও ট্রাই করুন।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && customerPhone) {
      fetchOrders();
    }
  }, [isOpen, customerPhone]);

  if (!isOpen) return null;

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400 border border-yellow-250/20';
      case 'processing': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-250/20';
      case 'shipped': return 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-250/20';
      case 'delivered': return 'bg-emerald-105 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-250/20';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'অপেক্ষমান (Pending)';
      case 'processing': return 'প্যাকেজিং হচ্ছে (Processing)';
      case 'shipped': return 'কুরিয়ারে পাঠানো হয়েছে (Shipped)';
      case 'delivered': return 'ডেলিভারি সম্পন্ন (Delivered)';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col border transition-all duration-300 overflow-hidden ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-800'
      }`}>
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <ShoppingBag className="text-amber-300" size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold bangla-text">কাস্টমার প্রোফাইল ও ড্যাশবোর্ড</h3>
              <p className="text-[10px] opacity-75 font-mono uppercase tracking-wider">Kuakata Customer Hub</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              id="refresh-dashboard-btn"
              onClick={fetchOrders}
              className="p-1 px-2 text-xs rounded-lg hover:bg-white/15 transition text-white flex items-center gap-1 cursor-pointer"
              title="অর্ডার হিস্টোরি রিফ্রেশ"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline bangla-text text-[11px]">রিফ্রেশ</span>
            </button>
            <button
              id="dashboard-logout-btn"
              onClick={() => { onLogout(); onClose(); }}
              className="p-1 px-2.5 text-xs bg-rose-600 hover:bg-rose-500 rounded-lg transition text-white flex items-center gap-1 cursor-pointer font-bold"
              title="লগআউট করুন"
            >
              <LogOut size={13} />
              <span className="bangla-text text-[11px] text-white">লগআউট</span>
            </button>
            <button 
              id="close-customer-dashboard"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white cursor-pointer ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Customer Info Card bar */}
        <div className={`p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
          isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-emerald-600 dark:text-emerald-400 bangla-text">
              স্বাগতম, {customerName}! 👋
            </h4>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-0.5">
              <span className="font-mono">মোবাইল: {customerPhone}</span>
              <span className="text-slate-300">•</span>
              <span className="bangla-text font-medium text-emerald-500/80">নিবন্ধিত কাস্টমার প্রোফাইল</span>
            </div>
          </div>
          <div className="bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-500/10 bangla-text shrink-0">
            মোট অর্ডার: {orders.length} টি
          </div>
        </div>

        {/* Orders list Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading && (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="animate-spin text-emerald-600 mx-auto" size={32} />
              <p className="text-xs text-slate-400 bangla-text">আপনার অর্ডার হিস্টোরি লোড হচ্ছে...</p>
            </div>
          )}

          {!loading && error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-xl flex items-start gap-2 max-w-md mx-auto">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="bangla-text text-[11px]">{error}</p>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <PackageCheck size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold bangla-text">আপনার কোনো অর্ডার হিস্টোরি পাওয়া যায়নি</p>
                <p className="text-[11px] text-slate-400 bangla-text">
                  আপনি কুয়াকাটা মাল্টিমিডিয়া প্ল্যাটফর্ম থেকে পণ্য অর্ডার করার সাথে সাথে অর্ডার সমূহ এখানে স্বয়ংক্রিয়ভাবে তালিকাভুক্ত হবে।
                </p>
              </div>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="space-y-4 text-xs sm:text-xs font-sans">
              <h5 className="font-bold text-[13px] text-slate-500 dark:text-slate-400 bangla-text border-b pb-1.5">
                আপনার সকল পূর্ববর্তী অর্ডারসমূহ:
              </h5>
              
              {orders.map((order) => (
                <div 
                  key={order.id}
                  className={`rounded-2xl border p-4.5 space-y-3.5 transition hover:shadow-md ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Order metadata line */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">আইডি:</span>
                      <span className="font-extrabold text-emerald-600 font-mono select-all">{order.id}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock size={11} className="text-slate-400" />
                      <span className="text-[11px] font-mono opacity-80">
                        {new Date(order.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full bangla-text ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  {/* Order items stack list */}
                  <div className="space-y-2 pl-1">
                    {order.items.map((item, id) => (
                      <div key={id} className="flex justify-between items-center text-slate-650 dark:text-slate-250">
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-500 font-bold font-mono">●</span>
                          <span className="bangla-text text-[11px] max-w-[240px] sm:max-w-[340px] truncate">{item.productName}</span>
                        </div>
                        <span className="text-[11px] font-medium font-mono text-slate-400 shrink-0">
                          (৳{item.price} × {item.quantity})
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial calculation & actions bottom strip */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[11px] text-slate-400 bangla-text">ডেলিভারি সহ মোট পরিশোধিত:</span>
                      <span className="text-sm font-black text-amber-500 font-mono">৳{order.totalAmount}</span>
                      <span className="text-[9px] text-emerald-504 font-mono">({order.paymentMethod.toUpperCase()})</span>
                    </div>

                    {/* REORDER BUTTON triggers prop */}
                    <button
                      id={`reorder-btn-${order.id}`}
                      onClick={() => onReorder(order.items)}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold py-2 px-4 rounded-xl transition duration-150 transform hover:scale-[1.01] active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-[11px]"
                    >
                      <RefreshCw size={11} className="text-white animate-spin-slow shrink-0" />
                      <span className="bangla-text font-bold text-[11px] text-white">এই পণ্যগুলো পুনরায় অর্ডার করুন (Re-order)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
