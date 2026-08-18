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
  X,
  Inbox,
  Check,
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
  const [searchQuery, setSearchQuery] = useState('');

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
      lastMessage: 'الفيديو يتوقف عند الدقيقة 12، يرجى التكرم بالمساعدة للوصول للمحتوى التفاعلي.',
    },
    {
      id: 'tck-103',
      studentName: 'فهد بن سليمان العنزي',
      subject: 'طلب تعديل الاسم في الفاتورة المعتمدة',
      category: 'السجل المالي',
      date: '25 يوليو 2026',
      status: 'resolved',
      priority: 'low',
      lastMessage: 'تم إصدار الفاتورة المعدلة بنجاح وشكراً لكم على سرعة الاستجابة والتجاوب.',
    },
  ];

  const filteredTickets = tickets.filter((t) => {
    const matchesFilter = filter === 'all' ? true : t.status === filter;
    const matchesSearch =
      t.studentName.includes(searchQuery) ||
      t.subject.includes(searchQuery) ||
      t.id.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#173A7C]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-20 left-10 w-[30rem] h-[30rem] bg-blue-500/8 rounded-full blur-[160px]" />
      </div>

      {/* Header Banner - Liquid Glass Hero */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-7 liquid-glass-hero border border-white/80 student-card-accent"
      >
        <div className="specular-card-reflection" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-3 sm:space-y-3.5">
            <div className="flex flex-col items-start">
              <div className="admin-hero-tag bg-[#173A7C]/10 text-[#173A7C] border border-[#173A7C]/15">
                <Headphones className="w-4 h-4 text-[#173A7C] shrink-0" />
                <span>إدارة تذاكر الدعم وخدمة المتدربين والعملاء</span>
              </div>
              <h1 className="text-sm sm:text-2xl lg:text-3xl font-black student-heading-h1 student-name-gradient leading-snug">
                مركز الدعم الفني <span className="inline-block whitespace-nowrap">وخدمة المتدربين 🎧</span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs lg:text-sm text-slate-600 font-medium max-w-xl leading-relaxed">
              متابعة استفسارات المتدربين، الاستجابة السريعة للملاحظات والحلول التقنية والمالية على مدار الساعة.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70 shrink-0 w-full sm:w-auto justify-around">
            <div className="text-center px-2 sm:px-3 border-l border-[#173A7C]/15">
              <span className="block text-base sm:text-xl font-black font-mono text-amber-600">{openCount}</span>
              <span className="text-[10px] text-slate-500 font-bold">تذكرة مفتوحة</span>
            </div>
            <div className="text-center px-2 sm:px-3 border-l border-[#173A7C]/15">
              <span className="block text-base sm:text-xl font-black font-mono text-[#173A7C]">{inProgressCount}</span>
              <span className="text-[10px] text-slate-500 font-bold">قيد المعالجة</span>
            </div>
            <div className="text-center px-2 sm:px-3">
              <span className="block text-base sm:text-xl font-black font-mono text-emerald-700">99.2%</span>
              <span className="text-[10px] text-slate-500 font-bold">معدل الرضا</span>
            </div>
          </div>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-[#173A7C]/10">
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">إجمالي التذاكر</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-[#173A7C]">{tickets.length} تذكرة</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">زمن الاستجابة</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-emerald-700">أقل من 15 دقيقة ⚡</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">التذاكر المحلولة</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-[#173A7C]">{resolvedCount} مكتملة 🟢</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">التغطية والدعم</p>
            <p className="text-xs sm:text-sm lg:text-base font-black text-emerald-700">24/7 متواصل 🟢</p>
          </div>
        </div>
      </motion.div>

      {/* Filter and Search Bar */}
      <div className="liquid-glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/60 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {[
            { key: 'all', label: `الكل (${tickets.length})` },
            { key: 'open', label: `مفتوحة (${openCount})` },
            { key: 'in_progress', label: `قيد المعالجة (${inProgressCount})` },
            { key: 'resolved', label: `مغلقة (${resolvedCount})` },
          ].map((tab) => {
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-2 px-2 sm:px-4 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                  isActive
                    ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20 border border-[#173A7C]'
                    : 'bg-white/80 text-slate-700 hover:bg-white hover:text-[#173A7C] border border-slate-200/80'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم المتدرب، الموضوع، أو رقم التذكرة..."
            className="w-full py-2 pr-9 pl-3.5 text-xs font-bold text-slate-800 bg-white/90 rounded-lg sm:rounded-xl border border-slate-200/80 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="liquid-glass-card liquid-glass-hover rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/70 space-y-3 cursor-pointer relative group student-card-accent"
            onClick={() => setSelectedTicket(ticket)}
          >
            <div className="specular-card-reflection" />

            <div className="space-y-2 pb-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold bg-[#173A7C]/8 text-[#173A7C] border border-[#173A7C]/15 leading-relaxed break-words">
                  #{ticket.id} • {ticket.category}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  {ticket.status === 'open' && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold bg-amber-500/10 text-amber-900 border border-amber-500/25 shrink-0 whitespace-nowrap">
                      مفتوحة 🟡
                    </span>
                  )}
                  {ticket.status === 'in_progress' && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold bg-blue-500/10 text-blue-900 border border-blue-500/25 shrink-0 whitespace-nowrap">
                      جاري المعالجة 🔵
                    </span>
                  )}
                  {ticket.status === 'resolved' && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold bg-emerald-500/10 text-emerald-900 border border-emerald-500/25 flex items-center gap-1 shrink-0 whitespace-nowrap">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>محلولة 🟢</span>
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-xs sm:text-sm font-extrabold text-[#152C5B] student-heading-h3 leading-snug">
                {ticket.subject}
              </h3>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#173A7C]" />
                <span>
                  المتدرب: <strong className="text-[#152C5B] font-extrabold">{ticket.studentName}</strong>
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">{ticket.date}</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 font-bold p-3.5 rounded-xl liquid-glass-inset border border-white/70">
              "{ticket.lastMessage}"
            </p>

            <div className="flex justify-end pt-1">
              <span className="text-xs text-[#173A7C] font-extrabold flex items-center gap-1 hover:underline">
                <span>فتح التذكرة والرد المباشر</span>
                <ChevronLeft className="w-4 h-4" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg overflow-hidden rounded-xl sm:rounded-2xl p-6 sm:p-8 bg-white/95 backdrop-blur-xl shadow-2xl space-y-5 text-right border border-white/80 my-8"
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#5CB07C] via-[#173A7C] to-emerald-400" />

              <div className="flex justify-between items-center border-b border-slate-200/70 pb-3">
                <div>
                  <h3 className="font-black text-lg text-[#152C5B] student-heading-h3">{selectedTicket.subject}</h3>
                  <p className="text-xs text-slate-500 font-bold">
                    #{selectedTicket.id} • المتدرب: {selectedTicket.studentName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-bold space-y-1">
                <span className="text-[10px] text-slate-400">رسالة المتدرب:</span>
                <p className="leading-relaxed">{selectedTicket.lastMessage}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800">اكتب الرد الرسمي للمتدرب:</label>
                <textarea
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="عزيزي المتدرب، نفيدك بأنه تم اعتماد طلبك بنجاح..."
                  className="w-full p-3.5 rounded-xl border border-slate-200/80 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200/70">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    alert('تم إرسال الرد وتحديث التذكرة بنجاح!');
                    setSelectedTicket(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#173A7C]/25 transition-all border border-white/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال الرد وتحديث الحالة ⚡</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
