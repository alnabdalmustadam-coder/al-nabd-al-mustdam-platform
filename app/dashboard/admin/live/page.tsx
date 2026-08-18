'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Calendar,
  Clock,
  Users,
  Plus,
  Video,
  Play,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  X,
} from 'lucide-react';

interface LiveSession {
  id: string;
  title: string;
  courseTitle: string;
  instructor: string;
  dateTime: string;
  durationMinutes: number;
  registeredStudents: number;
  status: 'upcoming' | 'live' | 'ended';
  meetingUrl: string;
}

export default function AdminLiveSessionsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // New Session Form State
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionCourse, setSessionCourse] = useState('دبلوم التسامح والسلام والمواطنة الصالحة');
  const [sessionInstructor, setSessionInstructor] = useState('د. عبدالله بن محمد الشمري');
  const [sessionDate, setSessionDate] = useState('اليوم، 8:00 مساءً');
  const [sessionDuration, setSessionDuration] = useState('90');
  const [sessionUrl, setSessionUrl] = useState('https://sustainpulse.org/live/room-101');

  const [sessions, setSessions] = useState<LiveSession[]>([
    {
      id: 'ls-1',
      title: 'اللقاء المباشر التفاعلي: ورشة عمل الحوار وتطبيقات التسامح',
      courseTitle: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      instructor: 'د. عبدالله بن محمد الشمري',
      dateTime: 'اليوم، 8:00 مساءً بتوقيت مكة',
      durationMinutes: 90,
      registeredStudents: 420,
      status: 'live',
      meetingUrl: 'https://sustainpulse.org/live/room-101',
    },
    {
      id: 'ls-2',
      title: 'الجلسة الإرشادية لمهارات التفكير الناقد والمواطنة',
      courseTitle: 'المهارات الأكاديمية والتفكير الناقد',
      instructor: 'د. سارة بنت خالد العتيبي',
      dateTime: 'غداً، 7:30 مساءً بتوقيت مكة',
      durationMinutes: 60,
      registeredStudents: 280,
      status: 'upcoming',
      meetingUrl: 'https://sustainpulse.org/live/room-102',
    },
    {
      id: 'ls-3',
      title: 'محاضرة ختامية: مراجعة المنهج واجابة الاستفسارات',
      courseTitle: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      instructor: 'د. عبدالله بن محمد الشمري',
      dateTime: '25 يوليو 2026 (مسجلة)',
      durationMinutes: 120,
      registeredStudents: 510,
      status: 'ended',
      meetingUrl: 'https://sustainpulse.org/live/recording-103',
    },
  ]);

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleScheduleSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim()) return;

    const newSess: LiveSession = {
      id: `ls-${Date.now()}`,
      title: sessionTitle,
      courseTitle: sessionCourse,
      instructor: sessionInstructor,
      dateTime: sessionDate,
      durationMinutes: parseInt(sessionDuration) || 60,
      registeredStudents: 0,
      status: 'upcoming',
      meetingUrl: sessionUrl,
    };

    setSessions([newSess, ...sessions]);
    setSessionTitle('');
    setIsScheduleModalOpen(false);
  };

  const totalRegistered = sessions.reduce((acc, curr) => acc + curr.registeredStudents, 0);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#173A7C]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-20 left-10 w-[30rem] h-[30rem] bg-rose-500/8 rounded-full blur-[160px]" />
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
              <div className="admin-hero-tag bg-rose-500/10 text-rose-800 border border-rose-500/20">
                <Radio className="w-4 h-4 text-rose-600 animate-pulse shrink-0" />
                <span>إدارة البث المباشر واللقاءات التفاعلية الافتراضية</span>
              </div>
              <h1 className="text-sm sm:text-2xl lg:text-3xl font-black student-heading-h1 student-name-gradient leading-snug">
                اللقاءات والقاعات <span className="inline-block whitespace-nowrap">الافتراضية المباشرة 🔴</span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs lg:text-sm text-slate-600 font-medium max-w-xl leading-relaxed">
              جدولة جلسات البث المباشر عبر الغرف التفاعلية، توزيع روابط القاعات، ومتابعة تسجيل الحضور والتسجيل الآلي.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsScheduleModalOpen(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#173A7C] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#173A7C]/20 cursor-pointer border border-white/25 shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>جدولة بث مباشر جديد ⚡</span>
          </motion.button>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-[#173A7C]/10">
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">إجمالي الجلسات</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-[#173A7C]">{sessions.length} جلسات</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">الطلاب المسجلين</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-emerald-700">{totalRegistered.toLocaleString('en-US')} حضور</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">الجلسات الحالية</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-rose-700">1 بث مباشر الآن 🔴</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">التسجيل والأرشفة</p>
            <p className="text-xs sm:text-sm lg:text-base font-black text-emerald-700">تلقائي 100% 🟢</p>
          </div>
        </div>
      </motion.div>

      {/* Live Sessions Grid */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="liquid-glass-card liquid-glass-hover rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/70 space-y-4 relative group overflow-hidden student-card-accent"
          >
            <div className="specular-card-reflection" />

            <div className="space-y-2 pb-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold bg-[#173A7C]/8 text-[#173A7C] border border-[#173A7C]/15 leading-relaxed break-words">
                  {session.courseTitle}
                </span>

                {session.status === 'live' && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold bg-rose-500/10 text-rose-800 border border-rose-500/30 flex items-center gap-1.5 animate-pulse shrink-0 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                    <span>بث مباشر الآن 🔴</span>
                  </span>
                )}

                {session.status === 'upcoming' && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold bg-amber-500/10 text-amber-900 border border-amber-500/30 flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>قادم قريباً 🟡</span>
                  </span>
                )}

                {session.status === 'ended' && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3 text-slate-500" />
                    <span>منتهي (مسجلة) ⚪</span>
                  </span>
                )}
              </div>

              <h3 className="text-xs sm:text-sm font-extrabold text-[#152C5B] student-heading-h3 leading-snug">
                {session.title}
              </h3>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl text-xs font-bold liquid-glass-inset border border-white/70">
              <div>
                <span className="block text-[10px] text-slate-500 font-bold">المحاضر المسؤول</span>
                <span className="text-[#152C5B] font-extrabold text-xs sm:text-sm">{session.instructor}</span>
              </div>
              <div className="border-r border-l border-[#173A7C]/10 sm:px-3">
                <span className="block text-[10px] text-slate-500 font-bold">موعد الجلسة والمدة</span>
                <span className="text-slate-800 font-extrabold">{session.dateTime} ({session.durationMinutes} دقيقة)</span>
              </div>
              <div className="sm:px-3">
                <span className="block text-[10px] text-slate-500 font-bold">المؤكد حضورهم</span>
                <span className="text-[#173A7C] font-black">{session.registeredStudents} طالب مسجل</span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2">
              <button
                onClick={() => handleCopyLink(session.meetingUrl, session.id)}
                className="w-full py-2 px-2.5 sm:px-4 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer min-h-[38px]"
              >
                {copiedId === session.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#173A7C] shrink-0" />
                )}
                <span className="truncate">{copiedId === session.id ? 'تم النسخ!' : 'نسخ رابط القاعة'}</span>
              </button>

              <a
                href={session.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-2.5 sm:px-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-[#173A7C]/20 border border-white/20 transition-all min-h-[38px]"
              >
                <span className="truncate">دخول القاعة الافتراضية</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* SCHEDULE MODAL */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white/95 backdrop-blur-xl text-slate-900 rounded-xl sm:rounded-2xl border border-white/80 p-6 sm:p-8 space-y-5 shadow-2xl overflow-hidden relative my-8"
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-rose-500 via-[#173A7C] to-emerald-400" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[#152C5B] student-heading-h3">جدولة بث مباشر جديد</h3>
                    <p className="text-xs text-slate-500 font-bold">تحديد موعد الجلسة ورابط القاعة الافتراضية</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleScheduleSession} className="space-y-4 text-xs font-bold">
                <div className="space-y-1.5">
                  <label className="text-slate-700 block">عنوان اللقاء التفاعلي</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: ورشة عمل الحوار وتطبيقات التسامح..."
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 block">المساق أو الدبلوم المرتبط</label>
                  <input
                    type="text"
                    value={sessionCourse}
                    onChange={(e) => setSessionCourse(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">المحاضر المسؤول</label>
                    <input
                      type="text"
                      value={sessionInstructor}
                      onChange={(e) => setSessionInstructor(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">المدة المقدرة (بالدقائق)</label>
                    <input
                      type="number"
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 block">رابط القاعة الافتراضية (Zoom / Teams / Live Room)</label>
                  <input
                    type="text"
                    value={sessionUrl}
                    onChange={(e) => setSessionUrl(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all font-mono"
                  />
                </div>

                <div className="pt-4 flex gap-3 border-t border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-bold shadow-lg shadow-[#173A7C]/25 cursor-pointer transition-all border border-white/20"
                  >
                    جدولة وتأكيد البث ⚡
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
