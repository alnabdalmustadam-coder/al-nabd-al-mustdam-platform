'use client';

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  Headphones,
  Send,
  HelpCircle,
  MessageSquare,
  Clock,
  CheckCircle,
  FileText,
  Paperclip,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';

const sectionFadeVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.16,
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.12,
      delayChildren: custom * 0.16 + 0.08,
    },
  }),
};

const textItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function StudentSupportPage() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'new' | 'faq'>('tickets');

  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('academic');
  const [ticketDetails, setTicketDetails] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const [ticketsList, setTicketsList] = useState([
    {
      id: 'TICK-802',
      subject: 'استفسار بخصوص تاريخ ميعاد الاختبار النهائي لدبلوم التسامح',
      category: 'أكاديمي',
      date: '25 يوليو 2026',
      status: 'answered',
      statusLabel: 'تم الرد من الأستاذ',
      lastReply: 'تم تحديد تاريخ الاختبار يوم 10 أغسطس، يمكنك الاطلاع على الجدول في صفحة الكورس.',
    },
    {
      id: 'TICK-710',
      subject: 'طلب توثيق اسم الشهادة المعتمدة باللغة الإنجليزية',
      category: 'شهادات واعتمادات',
      date: '18 يوليو 2026',
      status: 'closed',
      statusLabel: 'مغلقة - تم الإنجاز',
      lastReply: 'تم تعديل وتحديث صيغة اسمك بالشهادة بنجاح.',
    },
  ]);

  const faqs = [
    {
      q: 'كيف يمكنني الحصول على الشهادة بعد إكمال الدورة التدريبية؟',
      a: 'تظهر الشهادة تلقائياً في صفحة "شهاداتي المعتمدة" بمجرد مشاهدة كافة الدروس واجتياز الاختبار النهائي بنجاح.',
    },
    {
      q: 'ما هي شروط احتساب نسبة الحضور والإنجاز؟',
      a: 'يتم احتساب النسبة آلياً بمجرد مشاهدة كل فيديو تعليمي بالكامل والضغط على زر "تحديد كـ مكتمل".',
    },
    {
      q: 'هل يمكنني التواصل المباشر مع محاضر المادة؟',
      a: 'نعم، من خلال تبويب "النقاش مع الأستاذ" الموجود بصفحة الدرس، أو من خلال إرسال استفسار عبر هذه اللوحة.',
    },
    {
      q: 'ماذا أفعل إذا واجهت مشكلة في تشغيل الفيديو؟',
      a: 'تأكد أولاً من جودة الاتصال بالإنترنت، وفي حال استمرار المشكلة تواصل معنا عبر زر تقديم تذكرة دعم فني جديدة.',
    },
  ];

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDetails.trim()) return;

    const newTicket = {
      id: `TICK-${Math.floor(100 + Math.random() * 900)}`,
      subject: ticketSubject,
      category: ticketCategory === 'academic' ? 'أكاديمي' : ticketCategory === 'technical' ? 'تقني' : 'مالي',
      date: 'اليوم',
      status: 'pending',
      statusLabel: 'قيد المعالجة والمراجعة',
      lastReply: 'جاري مراجعة الطلب من فريق الدعم والرد عليك في أقرب وقت.',
    };

    setTicketsList([newTicket, ...ticketsList]);
    setSubmittedSuccess(true);
    setTicketSubject('');
    setTicketDetails('');
    setTimeout(() => {
      setSubmittedSuccess(false);
      setActiveTab('tickets');
    }, 2000);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner Ultra Premium - Liquid Glass Theme (Unified with Student Dashboard) */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="relative z-20 liquid-glass-hero p-6 sm:p-8 md:p-9 space-y-4 liquid-glass-hover overflow-hidden student-card-accent rounded-2xl sm:rounded-3xl"
      >
        {/* Ambient Liquid Glowing Orbs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-emerald-400/20 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-br from-blue-600/15 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3 pr-2">
            <motion.div variants={textItemVariants} className="student-tag-badge bg-blue-50 text-[#173A7C] border border-blue-200/80 shadow-xs">
              <Headphones className="w-3.5 h-3.5 text-[#173A7C]" />
              <span>مركز الدعم الأكاديمي والخدمات الذاتية</span>
            </motion.div>

            <motion.h1 variants={textItemVariants} className="student-heading-h1">
              الدعم و<span className="student-name-gradient">المساعدة الأكاديمية</span> 🎧
            </motion.h1>

            <motion.p variants={textItemVariants} className="student-text-body max-w-xl pr-0.5 pt-1.5 sm:pt-2 leading-relaxed">
              تواصل مع الفريق الأكاديمي والتقني، تتبع تذاكر استفساراتك، أو تصفح الأسئلة الشائعة.
            </motion.p>
          </div>

          {/* Tabs - Multi-Row Grid on Mobile to prevent overflow */}
          <motion.div variants={textItemVariants} className="grid grid-cols-2 xs:grid-cols-3 sm:flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/90 border border-white/80 backdrop-blur-md w-full sm:w-auto shrink-0 shadow-sm">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                activeTab === 'tickets'
                  ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20'
                  : 'text-slate-600 hover:text-[#173A7C] hover:bg-slate-100/60'
              }`}
            >
              تذاكري ({ticketsList.length})
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20'
                  : 'text-slate-600 hover:text-[#173A7C] hover:bg-slate-100/60'
              }`}
            >
              + تقديم تذكرة
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center col-span-2 xs:col-span-1 cursor-pointer ${
                activeTab === 'faq'
                  ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20'
                  : 'text-slate-600 hover:text-[#173A7C] hover:bg-slate-100/60'
              }`}
            >
              الأسئلة الشائعة
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* TAB 1: My Tickets List */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <motion.h2
            variants={sectionFadeVariants}
            initial="hidden"
            animate="visible"
            custom={1}
            className="student-heading-h2 flex items-center gap-2.5 pr-2.5 border-r-4 border-emerald-400"
          >
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <span>تذاكر الاستفسارات النشطة والحساب</span>
          </motion.h2>

          <div className="space-y-4">
            {ticketsList.map((ticket, idx) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + idx * 0.14, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-2xl sm:rounded-[28px] p-6 sm:p-8 space-y-4 liquid-glass-card liquid-glass-hover student-card-accent"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-200/50">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-black text-[#173A7C] text-xs bg-blue-50/90 px-3.5 py-1.5 rounded-xl border border-blue-200/80 shadow-2xs">
                      {ticket.id}
                    </span>
                    <span className="px-3.5 py-1.5 rounded-xl bg-slate-100/80 text-slate-500 font-bold text-xs border border-slate-200/60">
                      {ticket.date}
                    </span>
                    <span className="text-xs font-black text-slate-700 bg-slate-100/90 px-3.5 py-1.5 rounded-full border border-slate-200/60">
                      القسم: {ticket.category}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-black px-4 py-1.5 rounded-full border shadow-xs whitespace-nowrap ${ticket.status === 'answered'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : ticket.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                  >
                    {ticket.statusLabel}
                  </span>
                </div>

                <div>
                  <h3 className="student-heading-h3 text-xs sm:text-base mb-2">
                    {ticket.subject}
                  </h3>
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs text-slate-600 font-bold leading-relaxed space-y-1">
                    <span className="text-[#173A7C] font-black block text-xs">آخر الردود والتحديثات:</span>
                    <p className="text-slate-700">{ticket.lastReply}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Submit New Ticket */}
      {activeTab === 'new' && (
        <motion.div
          variants={sectionFadeVariants}
          initial="hidden"
          animate="visible"
          custom={1}
          className="relative overflow-hidden rounded-2xl sm:rounded-[28px] p-6 sm:p-8 space-y-6 liquid-glass-card liquid-glass-hover student-card-accent"
        >
          <div className="space-y-1">
            <h2 className="student-heading-h2 flex items-center gap-2.5 pr-2.5 border-r-4 border-emerald-400">
              <Send className="w-5 h-5 text-emerald-400" />
              <span>تقديم تذكرة استفسار جديدة</span>
            </h2>
            <p className="text-xs text-slate-500 font-bold pr-3.5 pt-1">
              اختر القسم المخصص واكتب تفاصيل استفسارك وسيتم الرد عليك في أقرب وقت.
            </p>
          </div>

          {submittedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#5CB07C]" />
              <span>تم إرسال تذكرتك بنجاح وجاري إحالتها للقسم المختص!</span>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">عنوان الاستفسار</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="مثال: استفسار بخصوص موعد الاختبار النهائي"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#173A7C] bg-white/70"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">تحديد القسم</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#173A7C] bg-white/70"
                >
                  <option value="academic">استفسار أكاديمي / شؤون تعليمية</option>
                  <option value="technical">الدعم التقني والمشغل</option>
                  <option value="billing">المالية والفواتير</option>
                  <option value="certificates">الشهادات والاعتمادات</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">تفاصيل الاستفسار والرسالة</label>
              <textarea
                required
                rows={5}
                value={ticketDetails}
                onChange={(e) => setTicketDetails(e.target.value)}
                placeholder="اكتب جميع التفاصيل المطلوبة لمساعدتك بسرعة وبشكل دقيق..."
                className="w-full p-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#173A7C] bg-white/70 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#173A7C]/20 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>إرسال التذكرة الآن</span>
            </button>
          </form>
        </motion.div>
      )}

      {/* TAB 3: FAQ Accordions */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          <motion.h2
            variants={sectionFadeVariants}
            initial="hidden"
            animate="visible"
            custom={1}
            className="student-heading-h2 flex items-center gap-2.5 pr-2.5 border-r-4 border-emerald-400"
          >
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <span>الأسئلة الشائعة والخدمات الذاتية</span>
          </motion.h2>

          <div className="space-y-3.5">
            {faqs.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + idx * 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl space-y-2.5 liquid-glass-card liquid-glass-hover student-card-accent"
              >
                <h3 className="student-heading-h3 text-xs sm:text-base flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5CB07C] shrink-0" />
                  <span>{item.q}</span>
                </h3>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed pr-5">
                  {item.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
