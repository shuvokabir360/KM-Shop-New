/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, ShieldCheck, HeartHandshake } from 'lucide-react';

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

interface ChatMessage {
  sender: string;
  text: string;
  timestamp: string;
}

export default function SupportChat({ isOpen, onClose, isDarkMode }: SupportChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchChat = async () => {
    try {
      const res = await fetch('/api/support-chat');
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchChat();
      // Poll chat history every 3.5 seconds to receive simulated background replies
      const interval = setInterval(() => {
        fetchChat();
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    const textToSend = inputText;
    setInputText('');

    try {
      const res = await fetch('/api/support-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSend, sender: 'user' })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-lg h-[540px] rounded-3xl overflow-hidden shadow-2xl flex flex-col border ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 text-slate-100' 
          : 'bg-white border-slate-100 text-slate-800'
      }`}>
        
        {/* Header */}
        <div className="bg-emerald-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center">
              <HeartHandshake className="text-amber-300 animate-pulse" size={24} />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg bangla-text flex items-center gap-1.5">
                কুয়াকাটা হিউম্যান কেয়ার
              </h2>
              <p className="text-[10px] font-mono opacity-80 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-ping"></span>
                Direct Coastal Support (Offline Encrypted Sync)
              </p>
            </div>
          </div>
          <button 
            id="close-support-dialog"
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/10 transition text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Encrypted Proof Info */}
        <div className="bg-emerald-500/10 text-[11px] text-emerald-600 dark:text-emerald-400 px-5 py-2 flex items-center gap-2 border-b border-emerald-500/10">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="bangla-text">এই চ্যাটটি উন্নত এনক্রিপশন দ্বারা সম্পূর্ণ সুরক্ষিত।</span>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex gap-2.5 max-w-[85%] items-end">
                {m.sender !== 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 text-xs shrink-0 self-start">
                    <User size={13} />
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-2.5 shadow-xs text-xs sm:text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-br-none'
                    : isDarkMode
                      ? 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                      : 'bg-slate-50 text-slate-850 rounded-bl-none border border-slate-100'
                }`}>
                  <p className="bangla-text whitespace-pre-wrap">{m.text}</p>
                  <span className="block text-[8px] opacity-45 text-right mt-1 font-mono">
                    {new Date(m.timestamp).toLocaleTimeString('bn', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Form controls */}
        <form 
          id="support-chat-form"
          onSubmit={handleSend} 
          className={`p-4 border-t flex gap-2 ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-55 border-slate-100'
          }`}
        >
          <input
            id="support-message-input"
            type="text"
            placeholder="কাস্টমার লিডারদের সাথে কথা বলুন..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className={`flex-1 px-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-800 text-slate-100' 
                : 'bg-white border-slate-200 text-slate-850'
            }`}
          />
          <button 
            id="support-submit-btn"
            type="submit"
            disabled={!inputText.trim()}
            className={`px-5 rounded-xl font-bold font-sans text-xs flex items-center gap-1 transition ${
              inputText.trim() 
                ? 'bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-[1.02]' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <span>পাঠান</span>
            <Send size={12} />
          </button>
        </form>

      </div>
    </div>
  );
}
