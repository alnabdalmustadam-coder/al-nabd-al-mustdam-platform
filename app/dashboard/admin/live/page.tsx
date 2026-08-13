'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

  const sessions: LiveSession[] = [
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
  ];

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
              <Radio className="w-3.5 h-3.5" />
              <span>إدارة البث المباشر واللقاءات التفاعلية</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">اللقاءات والقاعات الافتراضية 🔴</h1>
            <p className="text-xs text-slate-500 font-normal max-w-xl leading-relaxed">
              جدولة جلسات البث المباشر، توزيع رابط القاعة الافتراضية، ومتابعة تسجيل الحضور الآلي.
            </p>
          </div>

          <button
            onClick={() => alert('إضافة لقاء مباشر جديد')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#173A7C] text-white font-semibold text-xs flex items-center gap-2 shadow-md hover:-translate-y-0.5 shrink-0 cursor-pointer border border-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>جدولة بث مباشر جديد</span>
          </button>
        </div>
      </div>

      {/* Live Sessions Grid */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl p-6 border border-slate-200/80 space-y-4 ultra-card-hover"
            style={glassCard}
          >
            <div className="absolute top-0 right-0 left-0 h-1 bg-[#173A7C]" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/40 pb-4">
              <div className="space-y-1 pr-2 border-r-3 border-[#173A7C]">
                <span className="inline-block text-[10px] font-medium text-[#5CB07C] bg-[#5CB07C]/10 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {session.courseTitle}
                </span>
                <h3 className="text-base font-bold text-slate-900 pr-1">{session.title}</h3>
              </div>

              {session.status === 'live' && (
                <span className="px-4 py-1.5 rounded-full text-xs font-black bg-red-100 text-red-700 border border-red-200 flex items-center gap-2 animate-pulse shrink-0">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <span>بث مباشر جاري الآن 🔴</span>
                </span>
              )}

              {session.status === 'upcoming' && (
                <span className="px-4 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5 shrink-0">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>قادم قريباً</span>
                </span>
              )}

              {session.status === 'ended' && (
                <span className="px-4 py-1.5 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-slate-500" />
                  <span>منتهي (المحاضرة مسجلة)</span>
                </span>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl text-xs font-bold" style={glassInner}>
              <div>
                <span className="block text-[10px] text-slate-400 font-extrabold">المحاضر المسؤول</span>
                <span className="text-slate-800 font-black">{session.instructor}</span>
              </div>
              <div className="border-r border-l border-slate-200/50">
                <span className="block text-[10px] text-slate-400 font-extrabold">موعد الجلسة والمدة</span>
                <span className="text-slate-800 font-black">{session.dateTime} ({session.durationMinutes} دقيقة)</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-extrabold">المؤكد حضورهم</span>
                <span className="text-[#173A7C] font-black">{session.registeredStudents} طالب مسجل</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleCopyLink(session.meetingUrl, session.id)}
                className="px-4 py-2 rounded-xl text-xs font-black border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5"
              >
                {copiedId === session.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === session.id ? 'تم نسخ رابط القاعة' : 'نسخ رابط القاعة'}</span>
              </button>

              <a
                href={session.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white text-xs font-black flex items-center gap-2 shadow-md shadow-[#173A7C]/20 hover:opacity-95"
              >
                <span>دخول القاعة الآن</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
