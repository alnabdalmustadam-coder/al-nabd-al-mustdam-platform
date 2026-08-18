'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
  Radio,
  Video,
  Calendar,
  Clock,
  User,
  ExternalLink,
  PlayCircle,
  GraduationCap,
  Send,
  MessageSquare,
  Eye,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  role: 'student' | 'instructor' | 'admin';
  text: string;
  time: string;
}

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.06,
    },
  },
};

const textFadeVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function StudentLivePage() {
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [liveChatMessages, setLiveChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'أ. د. سارة العتيبي', role: 'instructor', text: 'أهلاً بكم جميعاً في الورشة المباشرة! سنبدأ خلال دقائق معدودة.', time: '08:02 م' },
    { id: '2', sender: 'عبدالله الشمري', role: 'student', text: 'السلام عليكم ورحمة الله، الصوت والصورة واضحان تماماً بحمد الله.', time: '08:03 م' },
    { id: '3', sender: 'م. خالد الدوسري', role: 'student', text: 'هل سيتم رفع العرض التقديمي للورشة بعد انتهاء البث الحقيقي؟', time: '08:05 م' },
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');

  const handleSendMessage = () => {
    if (!newChatMessage.trim()) return;
    const msg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: 'عبدالله الشمري (أنت)',
      role: 'student',
      text: newChatMessage.trim(),
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };
    setLiveChatMessages((prev) => [...prev, msg]);
    setNewChatMessage('');
  };

  const upcomingSessions = [
    {
      id: 'live-1',
      title: 'ورشة عمل تفاعلية: تطبيقات الحوار الإيجابي وتجنب النزاعات المؤسسية',
      courseName: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      instructor: 'د. محمد القحطاني',
      date: 'الأربعاء، 29 يوليو 2026',
      time: '08:00 مساءً - 09:30 مساءً (بتوقيت مكة)',
      status: 'upcoming',
      isLiveNow: true,
      joinUrl: 'https://www.youtube.com/embed/1BEWMhAuBd4',
      platform: 'البث الحي المباشر HD',
    },
    {
      id: 'live-2',
      title: 'ندوة حوارية مفتوحة: الحوكمة والتميز في المؤسسات الحديثة',
      courseName: 'شهادة التميز المؤسسي والجودة الحوكمية',
      instructor: 'د. خالد الدوسري',
      date: 'الأحد، 2 أغسطس 2026',
      time: '07:00 مساءً - 08:30 مساءً (بتوقيت مكة)',
      status: 'scheduled',
      isLiveNow: false,
      joinUrl: 'https://zoom.us',
      platform: 'Microsoft Teams',
    },
  ];

  const pastRecordings = [
    {
      id: 'rec-1',
      title: 'المحاضرة المباشرة الأولى: مدخل في استخدام الحاسب الآلي',
      courseName: 'دورة استخدام الحاسب الالي في الاعمال المكتبية',
      instructor: 'د. محمد القحطاني',
      date: '20 يوليو 2026',
      duration: 'ساعة و 20 دقيقة',
      recordingUrl: '/dashboard/student/courses/computer-basics-office/lessons/lesson-1',
    },
    {
      id: 'rec-2',
      title: 'ورشة الذكاء الاصطناعي وتطبيقاته في الأعمال',
      courseName: 'دورة الذكاء الاصطناعي',
      instructor: 'د. خالد الدوسري',
      date: '15 يوليو 2026',
      duration: 'ساعة و 45 دقيقة',
      recordingUrl: '/dashboard/student/courses/ai-course/lessons/lesson-1',
    },
  ];

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-3 font-[family-name:var(--font-cairo)]" dir="rtl">

      {/* Header Banner Ultra Premium */}
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 liquid-glass-hero p-5 sm:p-7 md:p-8 space-y-3.5 liquid-glass-hover overflow-hidden student-card-accent rounded-2xl sm:rounded-3xl"
      >
        {/* Ambient Liquid Glowing Orbs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-emerald-400/20 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-br from-blue-600/15 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3 pr-1">
            <motion.div variants={textFadeVariants} className="student-tag-badge bg-red-50/90 text-red-700 border border-red-200/80 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <span>اللقاءات والتغطية المباشرة (Live Classroom)</span>
            </motion.div>

            <motion.h1 variants={textFadeVariants} className="student-heading-h1 !text-base sm:!text-xl lg:!text-2xl">
              القاعة المباشرة و<span className="student-name-gradient">الورش التفاعلية</span> 🔴
            </motion.h1>

            <motion.p variants={textFadeVariants} className="student-text-body !text-xs sm:!text-sm max-w-xl pr-0.5 pt-1.5 sm:pt-2 leading-relaxed">
              انضم للبث الحي التفاعلي، شارك بالتساؤلات في الشات الفوري، واستعرض التسجيلات الموثقة.
            </motion.p>
          </div>

          {/* Filter Tabs */}
          <motion.div variants={textFadeVariants} className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2 p-1.5 rounded-2xl border border-white/80 bg-white/90 backdrop-blur-md shadow-sm w-full sm:w-auto shrink-0">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer text-center flex-1 sm:flex-none ${filter === 'upcoming'
                  ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20'
                  : 'text-slate-600 hover:text-[#173A7C] hover:bg-slate-100/60 bg-slate-50/60 sm:bg-transparent'
                }`}
            >
              الجلسات القادمة ({upcomingSessions.length})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer text-center flex-1 sm:flex-none ${filter === 'past'
                  ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20'
                  : 'text-slate-600 hover:text-[#173A7C] hover:bg-slate-100/60 bg-slate-50/60 sm:bg-transparent'
                }`}
            >
              أرشيف التسجيلات ({pastRecordings.length})
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Active Live Session Viewport & Clean Live Chat Box (100% Desktop Viewport Fit) */}
      {filter === 'upcoming' && (
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4 items-stretch"
        >
          {/* Live Video Player Stream */}
          <motion.div variants={textFadeVariants} className="lg:col-span-2 flex flex-col justify-between gap-2.5">
            <div className="rounded-2xl sm:rounded-[24px] overflow-hidden border border-slate-300/80 shadow-xl relative bg-slate-950 flex-1">
              {/* Floating Live Indicator Badge */}
              <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-white shadow-xl">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-[10px] font-black text-red-400 tracking-wide">مباشر الآن</span>
              </div>

              {/* Floating Viewers Count */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-emerald-300 shadow-xl text-[10px] font-black">
                <Eye className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>142 يتابع الآن</span>
              </div>

              {/* Video Player - No Autoplay */}
              <div className="relative aspect-video w-full">
                <iframe
                  src="https://www.youtube.com/embed/1BEWMhAuBd4?autoplay=0&controls=1&modestbranding=1"
                  className="w-full h-full border-0"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Video Title Pill Card Below Video (Liquid Glass, Compact on Desktop) */}
            <div className="p-4 sm:p-5 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 liquid-glass-card liquid-glass-hover student-card-accent">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700">
                  <Video className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>ورشة تدريبية تفاعلية حية</span>
                </div>
                <h2 className="student-heading-h3 !text-xs sm:!text-sm leading-snug">
                  ورشة عمل: تطبيقات الحوار الإيجابي وتجنب النزاعات
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100/90 px-3.5 py-1.5 rounded-xl border border-slate-200/80 shrink-0 self-start sm:self-auto">
                <Radio className="w-3.5 h-3.5 text-[#173A7C]" />
                <span>بث عالي الدقة Full HD</span>
              </div>
            </div>
          </motion.div>

          {/* Real-time Student Chat Box */}
          <motion.div
            variants={textFadeVariants}
            className="p-4 sm:p-5 flex flex-col h-[380px] lg:h-full rounded-2xl sm:rounded-[24px] relative overflow-hidden liquid-glass-card liquid-glass-hover student-card-accent"
          >
            <div className="pb-3 border-b border-slate-200/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-xs">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="student-heading-h3 !text-xs sm:!text-sm">الشات المباشر والتساؤلات</h3>
                  <p className="text-[10px] text-slate-500 font-bold">تفاعل لحظي مع الأستاذ والمتدربين</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto py-2.5 space-y-2 min-h-0 no-scrollbar">
              {liveChatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${msg.role === 'instructor'
                      ? 'bg-blue-50/90 border-blue-200/80 text-blue-900 shadow-2xs'
                      : 'bg-white/90 border-slate-200/80 text-slate-800 shadow-2xs'
                    }`}
                >
                  <div className="flex items-center justify-between font-black">
                    <span className="flex items-center gap-1 text-xs">
                      {msg.role === 'instructor' && <GraduationCap className="w-3.5 h-3.5 text-[#173A7C]" />}
                      {msg.sender}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{msg.time}</span>
                  </div>
                  <p className="text-xs font-bold leading-relaxed text-slate-700">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Send Input */}
            <div className="pt-2.5 border-t border-slate-200/60 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="اكتب استفسارك المباشر هنا..."
                className="flex-1 px-3.5 py-2.5 text-xs font-bold text-slate-800 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C] shadow-xs"
              />
              <button
                onClick={handleSendMessage}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white hover:opacity-90 transition-opacity cursor-pointer shrink-0 shadow-xs active:scale-95"
                title="إرسال"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Main Sessions Grid List - Taller Cards & Spaced Layout */}
      {filter === 'upcoming' ? (
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4 pt-2"
        >
          <motion.h2 variants={textFadeVariants} className="student-heading-h2 flex items-center gap-2.5 pr-2.5 border-r-4 border-[#5CB07C] !text-sm sm:!text-base">
            <div className="p-1.5 rounded-xl text-[#0D5C3A] bg-emerald-100/90 border border-emerald-300/80 shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <span>جدول الجلسات والندوات القادمة</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
            {upcomingSessions.map((session) => (
              <motion.div
                key={session.id}
                variants={textFadeVariants}
                whileHover={{ y: -3 }}
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4 transition-all duration-300 liquid-glass-card liquid-glass-hover student-card-accent hover:shadow-xl bg-white/90"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    {session.isLiveNow ? (
                      <span className="px-3.5 py-1 rounded-full bg-red-600 text-white font-black flex items-center gap-1.5 animate-pulse shadow-md shadow-red-500/25 text-xs">
                        <Radio className="w-3.5 h-3.5" />
                        <span>مباشر الآن Live</span>
                      </span>
                    ) : (
                      <span className="px-3.5 py-1 rounded-full bg-blue-50 text-[#173A7C] font-black border border-blue-200/80 shadow-2xs text-xs">
                        مجدولة قريباً
                      </span>
                    )}

                    <span className="text-slate-500 font-extrabold text-[11px] bg-slate-100/80 px-2.5 py-0.5 rounded-lg border border-slate-200/60 truncate max-w-[200px]">
                      {session.courseName}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="student-heading-h3 !text-sm sm:!text-base leading-snug font-black text-slate-900 line-clamp-2">
                    {session.title}
                  </h3>

                  {/* Chips: Instructor, Date, Time */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700 pt-1">
                    <div className="flex items-center gap-1.5 bg-slate-100/90 px-3 py-1.5 rounded-xl border border-slate-200/80 text-xs">
                      <User className="w-3.5 h-3.5 text-[#173A7C]" />
                      <span>{session.instructor}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-50/90 px-3 py-1.5 rounded-xl border border-emerald-200/80 text-emerald-800 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-[#5CB07C]" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-50/90 px-3 py-1.5 rounded-xl border border-amber-200/80 text-amber-800 text-xs">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{session.time}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Platform & CTA Button */}
                <div className="pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <span className="text-[11px] font-extrabold text-slate-500">
                    المنصة: <strong className="text-[#173A7C]">{session.platform}</strong>
                  </span>
                  <a
                    href={session.joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md active:scale-95 cursor-pointer ${session.isLiveNow
                        ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-500/25 animate-pulse'
                        : 'bg-[#173A7C] hover:bg-[#1E4D9D] text-white shadow-[#173A7C]/20'
                      }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{session.isLiveNow ? 'الانضمام للبث التفاعلي 🔴' : 'رابط القاعة'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
            {pastRecordings.map((rec) => (
              <motion.div
                key={rec.id}
                variants={textFadeVariants}
                whileHover={{ y: -3 }}
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4 transition-all duration-300 liquid-glass-card liquid-glass-hover student-card-accent hover:shadow-xl bg-white/90"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Video className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تسجيل مسجل HD</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-lg">
                      {rec.duration}
                    </span>
                  </div>

                  <h3 className="student-heading-h3 !text-sm sm:!text-base font-black text-slate-900 leading-snug line-clamp-2">
                    {rec.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-600 pt-1">
                    <span className="bg-slate-100/90 px-2.5 py-1 rounded-lg border border-slate-200">المساق: {rec.courseName}</span>
                    <span className="bg-slate-100/90 px-2.5 py-1 rounded-lg border border-slate-200">المحاضر: {rec.instructor}</span>
                    <span className="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-800">التاريخ: {rec.date}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex justify-end">
                  <Link
                    href={rec.recordingUrl}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#173A7C]/20 active:scale-95"
                  >
                    <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>مشاهدة التسجيل</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
