/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { Message } from '../types';

interface ChatbotProps {
  isDarkMode: boolean;
}

export default function Chatbot({ isDarkMode }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      sender: 'bot',
      text: 'আসসালামু আলাইকুম! **কুয়াকাটা মাল্টিমিডিয়া** কাস্টমার কেয়ার এআই সাহায্যকারী প্যানেলে আপনাকে স্বাগতম। 🌊\n\nআমি আপনাকে আমাদের কুয়াকাটার তাজা মাছ ও গলদা চিংড়ি ডেলিভারি, রোদ্রে শুকনো শুটকী, রাখাইন থামী, সুস্বাদু আচার এবং উন্নত পেমেন্ট নিরাপত্তা সম্পর্কে তথ্য প্রদান করতে পারি। আপনাকে কীভাবে সাহায্য করতে পারি?',
      timestamp: new Date().toLocaleTimeString('bn', { hour: 'numeric', minute: 'numeric', hour12: true })
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    'মাছ ডেলিভারির সুবিধা কেমন?',
    'পেমেন্ট সিকিউরিটি কতটা নিরাপদ?',
    'অফলাইন ডাটা সিঙ্ক কীভাবে করে?',
    'আমি কি কুয়াকাটা ডট কমে বিক্রেতা হতে পারব?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('bn', { hour: 'numeric', minute: 'numeric', hour12: true })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }))
        })
      });

      const data = await response.json();
      
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: data.text || 'দুঃখিত, কোনো সাড়া পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
        timestamp: new Date().toLocaleTimeString('bn', { hour: 'numeric', minute: 'numeric', hour12: true })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      const errorMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: 'আসসালামু আলাইকুম! কাস্টমার কেয়ার সার্ভারের সাথে সাময়িক যোগাযোগ করতে সমস্যা হচ্ছে। আমাদের **কুয়াকাটা স্পেশাল তাজা মাছ, কেমিক্যালমুক্ত শুটকী, আসল বার্মিজ থামি এবং টক-মিষ্টি আমরার আচার** আমাদের দক্ষ চালক দ্বারা ঢাকার যেকোনো স্থানে ২৪ ঘণ্টায় এবং উপকূলবর্তী অঞ্চলে ৪ ঘণ্টায় কোল্ড-চেইন বক্সে ডেলিভারি করা হয়। পেমেন্ট গেটওয়ের জন্য আমাদের সাইটে উন্নত এনক্রিপশন ব্যবহৃত হয়।',
        timestamp: new Date().toLocaleTimeString('bn', { hour: 'numeric', minute: 'numeric', hour12: true })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Minimal helper to render markdown snippets safely (bold, links, breaks)
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Process Bold **text**
      let renderedLine: React.ReactNode = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      
      if (line.match(boldRegex)) {
        const parts = line.split(boldRegex);
        renderedLine = parts.map((part, i) => {
          if (i % 2 === 1) {
            return <strong key={i} className="font-bold text-amber-600 dark:text-amber-400">{part}</strong>;
          }
          return part;
        });
      }

      return (
        <p key={idx} className="min-h-[1.25em] mb-1 leading-relaxed text-sm">
          {renderedLine}
        </p>
      );
    });
  };

  return (
    <>
      {/* Absolute floating Chatbot Launcher Button */}
      <button
        id="chatbot-launcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-full p-4 shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center gap-1.5 focus:outline-none focus:ring-4 focus:ring-emerald-300"
        title="এআই কাস্টমার সাপোর্ট অ্যাসিস্ট্যান্ট"
      >
        <Sparkles size={20} className="animate-pulse" />
        <span className="hidden sm:inline font-semibold text-xs pr-1 bangla-text">এআই চ্যাটবট</span>
      </button>

      {/* Slide Out Panel Drawer Chat UI */}
      {isOpen && (
        <div className={`fixed bottom-24 right-4 sm:right-6 z-40 w-[92vw] sm:w-[410px] h-[520px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border transition-all duration-300 ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : 'bg-white border-slate-100 text-slate-800'
        }`}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 px-5 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                <Bot size={22} className="text-amber-300 animate-bounce" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide bangla-text">কুয়াকাটা মাল্টিমিডিয়া এআই</h3>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <p className="text-[10px] font-mono opacity-80 uppercase tracking-widest">Powered by Gemini 3.5</p>
                </div>
              </div>
            </div>
            <button 
              id="chatbot-close-btn"
              onClick={() => setIsOpen(false)} 
              className="p-1 rounded-full hover:bg-white/10 text-white transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Notice */}
          <div className="bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400 px-4 py-1.5 flex items-center gap-1.5 border-b border-amber-500/10">
            <AlertCircle size={12} />
            <span className="bangla-text">নিরাপদ AES-256 এনক্রিপ্ট পেমেন্ট গেটওয়ে যুক্ত করা আছে।</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-xs sm:text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : isDarkMode
                      ? 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none'
                }`}>
                  <div className="space-y-0.5">
                    {renderMessageContent(msg.text)}
                  </div>
                  <span className="block text-[9px] text-right mt-1 opacity-55 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className={`rounded-2xl px-4 py-3 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} rounded-bl-none flex items-center gap-1.5`}>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 overflow-x-auto whitespace-nowrap flex gap-1.5 border-t border-slate-100 dark:border-slate-800 scrollbar-none bg-slate-50/50 dark:bg-slate-900/50">
            {quickQuestions.map((q, idx) => (
              <button
                id={`quick-query-${idx}`}
                key={idx}
                onClick={() => handleSendMessage(q)}
                type="button"
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition cursor-pointer bangla-text ${
                  isDarkMode
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Type Area Input */}
          <form
            id="chatbot-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputVal);
            }}
            className={`p-3 border-t flex gap-2 ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'
            }`}
          >
            <input
              id="chatbot-message-input"
              type="text"
              placeholder="প্রশ্ন টাইপ করুন..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-slate-100 focus:bg-slate-850' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
              }`}
            />
            <button
              id="chatbot-submit"
              type="submit"
              disabled={!inputVal.trim() || isLoading}
              className={`p-2.5 rounded-xl text-white transition flex items-center justify-center cursor-pointer ${
                inputVal.trim() && !isLoading
                  ? 'bg-emerald-600 hover:bg-emerald-500 hover:scale-105'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <Send size={15} />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
