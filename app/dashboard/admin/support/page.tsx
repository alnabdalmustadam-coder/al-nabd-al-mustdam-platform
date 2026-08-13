'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Headphones,
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Send,
  Sparkles,
  Paperclip,
  ChevronLeft,
} from 'lucide-react';

interface SupportTicket {
  id: string;
  studentName: string;
  subject: string;
  category: string;
  date: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  lastMessage: string;
}

export default function AdminSupportPage() {
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const tickets: SupportTicket[] = [
    {
      id: 'tck-101',
      studentName: 'عبدالله بن محمد الشمري',
      subject: 'استفسار بشأن موعد اصدار شهادة دبلوم التسامح',
      category: 'الشهادات والاعتمادات',
      date: 'اليوم، 11:30 ص',
      status: 'open',
      priority: 'high',
      lastMessage: 'السلام عليكم، أود الاستفسار متى سيتم اعتماد وتوثيق الشهادة بعد إكمال مشروع التخرج؟',
    },
    {
      id: 'tck-102',
      studentName: 'سارة بنت خالد العتيبي',
      subject: 'مشكلة في تشغيل المحاضرة الرابعة',
      category: 'مشكلة تقنية',
      date: 'أمس، 04:15 م',
      status: 'in_progress',
      priority: 'medium',
      lastMessage: 'الفيديو يتوقف عند الدقيقة 12، يرجى التكرم بالمساعدة.',
    },
    {
      id: 'tck-103',
      studentName: 'فهد بن سليمان العنزي',
      subject: 'طلب تعديل الاسم في الفاتورة المعتمدة',
      category: 'السجل المالي',
      date: '25 يوليو 2026',
      status: 'resolved',
      priority: 'low',
      lastMessage: 'تم إصدار الفاتورة المعدلة بنجاح وشكراً لكم على السرعة.',
    },
  ];

  const filteredTickets = tickets.filter(t => filter === 'all' ? true : t.status === filter);

  const glassCard = {
    background: 'linear-gradient(145deg, rgba(255,255,255,0.75) 0%, rgba(248,250,252,0.6) 100%)',
    backdropFilter: 'blur(24px) saturate(1.8)',
    WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
    boxShadow: '0 10px 40px rgba(23, 58, 124, 0.06), 0 1px 0 rgba(255,255,255,0.9) inset',
    border: '1px solid rgba(255, 255, 255, 0.6)',
  };

  const glassInner = {
    background: 'rgba(248,250,252,0.55)',
    backdropFilter: 'blur(10px)',
  };

  return (
    <div className="space-y-6" dir="rtl">

      {/* Header Banner - Ultra Premium Glass style matching Main Dashboard */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 animate-fade-in-up ultra-card-hover" style={glassCard}>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 pr-2 border-r-4 border-[#173A7C]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-[#173A7C] bg-blue-50 border border-blue-200">
              <Headphones className="w-3.5 h-3.5" />
              <span>إدارة تذاكر الدعم وخدمة المتدربين</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">مركز الدعم والتذاكر 🎧</h1>
            <p className="text-xs text-slate-500 font-normal max-w-xl leading-relaxed">
              متابعة استفسارات المتدربين، الاستجابة السريعة للملاحظات والحلول التقنية والمالية.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 shrink-0">
            <div className="text-center px-3 border-l border-slate-200">
              <span className="block text-xl font-extrabold text-amber-600">1</span>
              <span className="text-[10px] text-slate-500 font-medium">تذكرة مفتوحة</span>
            </div>
            <div className="text-center px-3 border-l border-slate-200">
              <span className="block text-xl font-extrabold text-blue-600">1</span>
              <span className="text-[10px] text-slate-500 font-medium">قيد المعالجة</span>
            </div>
            <div className="text-center px-3">
              <span className="block text-xl font-extrabold text-emerald-600">99%</span>
              <span className="text-[10px] text-slate-500 font-medium">معدل الرضا</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-white/60" style={glassCard}>
          {[
            { key: 'all', label: 'كافة التذاكر (3)' },
            { key: 'open', label: 'مفتوحة (1)' },
            { key: 'in_progress', label: 'قيد المعالجة (1)' },
            { key: 'resolved', label: 'مغلقة ومحلولة (1)' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filter === tab.key
                  ? 'bg-[#173A7C] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl p-6 border border-white/60 space-y-4 cursor-pointer hover:shadow-xl transition-all"
            style={glassCard}
            onClick={() => setSelectedTicket(ticket)}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/40 pb-3">
              <div className="space-y-1">
                <span className="inline-block text-[10px] font-black text-[#5CB07C] bg-[#5CB07C]/10 px-2.5 py-0.5 rounded-full">
                  #{ticket.id} • {ticket.category}
                </span>
                <h3 className="text-base font-black text-slate-800">{ticket.subject}</h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {ticket.status === 'open' && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">مفتوحة (عالي)</span>
                )}
                {ticket.status === 'in_progress' && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">جاري المعالجة</span>
                )}
                {ticket.status === 'resolved' && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">محلولة ✓</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#173A7C]" />
                <span>المتدرب: <strong className="text-slate-800">{ticket.studentName}</strong></span>
              </div>
              <span className="text-[11px] text-slate-400">{ticket.date}</span>
            </div>

            <p className="text-xs text-slate-600 font-bold truncate p-3 rounded-xl" style={glassInner}>
              "{ticket.lastMessage}"
            </p>

            <div className="flex justify-end pt-1">
              <span className="text-xs text-[#173A7C] font-black flex items-center gap-1 hover:underline">
                <span>فتح التذكرة وللرد</span>
                <ChevronLeft className="w-4 h-4" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl p-6 bg-white shadow-2xl space-y-4 text-right">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-black text-slate-800 text-base">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-400 font-bold">#{selectedTicket.id} • الطالب: {selectedTicket.studentName}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400">✕</button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border text-xs text-slate-700 font-bold space-y-1">
              <span className="text-[10px] text-slate-400">رسالة الطالب:</span>
              <p>{selectedTicket.lastMessage}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800">اكتب الرد الرسمي للمتدرب:</label>
              <textarea
                rows={3}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="عزيزي المتدرب، نفيدك بأنه تم..."
                className="w-full p-3 rounded-xl border text-xs font-bold focus:outline-none focus:border-[#173A7C]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <button onClick={() => setSelectedTicket(null)} className="px-4 py-2 text-xs font-bold text-slate-600">إلغاء</button>
              <button
                onClick={() => { alert('تم إرسال الرد وإغلاق التذكرة بنجاح!'); setSelectedTicket(null); }}
                className="px-5 py-2 rounded-xl bg-[#173A7C] text-white text-xs font-black flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال الرد وتحديث التذكرة</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
