'use client';

import React, { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface ChatMessage {
  id: string;
  sender: string;
  role: 'student' | 'instructor' | 'admin';
  text: string;
  time: string;
}

interface LiveSessionItem {
  id: string;
  title: string;
  description?: string;
  course_id?: string;
  courseName: string;
  instructor: string;
  date: string;
  time: string;
  scheduled_at: string;
  status: string;
  isLiveNow: boolean;
  joinUrl: string;
  platform: string;
  recording_url?: string;
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
  const [liveSessions, setLiveSessions] = useState<LiveSessionItem[]>([]);
  const [pastRecordings, setPastRecordings] = useState<LiveSessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveChatMessages, setLiveChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'المشرف الأكاديمي', role: 'admin', text: 'أهلاً بكم في القاعة التفاعلية. نتمنى لكم جلسة تدريبية ممتعة ومفيدة!', time: '08:00 م' },
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');

  useEffect(() => {
    async function loadLiveSessions() {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from('live_sessions')
          .select('*')
          .order('scheduled_at', { ascending: true });

        if (error) {
          console.error('Error fetching live sessions:', error);
          setLoading(false);
          return;
        }

        const now = new Date();
        const upcomingList: LiveSessionItem[] = [];
        const pastList: LiveSessionItem[] = [];

        (data || []).forEach((s: any) => {
          const sched = new Date(s.scheduled_at);
          const isLiveNow = s.status === 'live' || (sched <= now && now.getTime() - sched.getTime() <= (s.duration_minutes || 60) * 60000);
          const isPast = s.status === 'completed' || sched < now && !isLiveNow;

          const dateStr = sched.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
          const timeStr = `${sched.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })} (${s.duration_minutes || 60} دقيقة)`;

          const item: LiveSessionItem = {
            id: s.id,
            title: s.title,
            description: s.description,
            course_id: s.course_id,
            courseName: s.course_id || 'برنامج تدريبي عام',
            instructor: 'المدرب المعتمد',
            date: dateStr,
            time: timeStr,
            scheduled_at: s.scheduled_at,
            status: s.status,
            isLiveNow,
            joinUrl: s.meeting_url || 'https://zoom.us',
            platform: s.platform || 'Zoom Meeting',
            recording_url: s.recording_url,
          };

          if (isPast && s.recording_url) {
            pastList.push(item);
          } else {
            upcomingList.push(item);
          }
        });

        // Fallback default sample if empty
        if (upcomingList.length === 0 && pastList.length === 0) {
          upcomingList.push({
            id: 'live-sample-1',
            title: 'ورشة عمل تفاعلية: استراتيجيات التفكير الإبداعي وحل المشكلات',
            courseName: 'المهارات الأكاديمية والتفكير الناقد',
            instructor: 'د. سارة العتيبي',
            date: 'الأربعاء القادم',
            time: '08:00 مساءً (بتوقيت مكة)',
            scheduled_at: new Date().toISOString(),
            status: 'scheduled',
            isLiveNow: false,
            joinUrl: 'https://zoom.us',
            platform: 'Zoom Meeting',
          });
        }

        setLiveSessions(upcomingList);
        setPastRecordings(pastList);
      } catch (err) {
        console.error('Live sessions error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLiveSessions();
  }, []);

  const handleSendMessage = () => {
    if (!newChatMessage.trim()) return;
    const msg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: 'أنت (المتدرب)',
      role: 'student',
      text: newChatMessage.trim(),
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };
    setLiveChatMessages((prev) => [...prev, msg]);
    setNewChatMessage('');
  };

  const activeLive = liveSessions.find((s) => s.isLiveNow) || liveSessions[0];

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-3 font-[family-name:var(--font-cairo)]" dir="rtl">
      {/* Header Banner Ultra Premium */}
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 liquid-glass-hero p-5 sm:p-7 md:p-8 space-y-3.5 liquid-glass-hover overflow-hidden student-card-accent rounded-2xl sm:rounded-3xl"
      >
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
          <motion.div variants={textFadeVariants} className="premium-tabs grid grid-cols-2 sm:flex sm:flex-row items-center gap-2 p-1.5 rounded-2xl border border-white/80 bg-white/90 backdrop-blur-md shadow-sm w-full sm:w-auto shrink-0">
            <button
              onClick={() => setFilter('upcoming')}
              className={`premium-tab px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer text-center flex-1 sm:flex-none ${
                filter === 'upcoming'
                  ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20'
                  : 'text-slate-600 hover:text-[#173A7C] hover:bg-slate-100/60 bg-slate-50/60 sm:bg-transparent'
              }`}
            >
              <span className="premium-tab-label">الجلسات المجدولة ({liveSessions.length})</span>
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`premium-tab px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer text-center flex-1 sm:flex-none ${
                filter === 'past'
                  ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20'
                  : 'text-slate-600 hover:text-[#173A7C] hover:bg-slate-100/60 bg-slate-50/60 sm:bg-transparent'
              }`}
            >
              <span className="premium-tab-label">أرشيف التسجيلات ({pastRecordings.length})</span>
            </button>
          </motion.div>
        </div>
      </motion.div>

      {loading ? (
        <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
          <p className="text-xs font-bold text-slate-500">جاري تحميل القاعات المباشرة...</p>
        </div>
      ) : filter === 'upcoming' ? (
        <div className="space-y-4">
          {/* Main stream viewport */}
          {activeLive && (
            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4 items-stretch"
            >
              <motion.div variants={textFadeVariants} className="lg:col-span-2 flex flex-col justify-between gap-2.5">
                <div className="rounded-2xl sm:rounded-[24px] overflow-hidden border border-slate-300/80 shadow-xl relative bg-slate-950 flex-1">
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-white shadow-xl">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    <span className="text-[10px] font-black text-red-400 tracking-wide">
                      {activeLive.isLiveNow ? 'مباشر الآن' : 'جلسة مجدولة'}
                    </span>
                  </div>

                  <div className="relative aspect-video w-full flex items-center justify-center bg-slate-900">
                    {activeLive.joinUrl.includes('youtube.com') ? (
                      <iframe
                        src={`${activeLive.joinUrl}?autoplay=0&controls=1`}
                        className="w-full h-full border-0"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="text-center p-8 space-y-4 text-white">
                        <Video className="w-16 h-16 text-emerald-400 mx-auto" />
                        <div className="space-y-1">
                          <h3 className="text-lg font-black">{activeLive.title}</h3>
                          <p className="text-xs text-slate-300">{activeLive.date} - {activeLive.time}</p>
                        </div>
                        <a
                          href={activeLive.joinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-lg hover:shadow-xl transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>الانضمام عبر {activeLive.platform}</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 liquid-glass-card liquid-glass-hover student-card-accent">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700">
                      <Video className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{activeLive.courseName}</span>
                    </div>
                    <h2 className="student-heading-h3 !text-xs sm:!text-sm leading-snug">
                      {activeLive.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100/90 px-3.5 py-1.5 rounded-xl border border-slate-200/80 shrink-0">
                    <Radio className="w-3.5 h-3.5 text-[#173A7C]" />
                    <span>{activeLive.platform}</span>
                  </div>
                </div>
              </motion.div>

              {/* Chat box */}
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

                <div className="flex-1 overflow-y-auto py-2.5 space-y-2 min-h-0">
                  {liveChatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2.5 rounded-xl text-xs space-y-1 ${
                        msg.role === 'admin' || msg.role === 'instructor'
                          ? 'bg-blue-50/80 border border-blue-200/60'
                          : 'bg-slate-50/80 border border-slate-200/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-[#173A7C] text-[11px]">{msg.sender}</span>
                        <span className="text-[9px] text-slate-400">{msg.time}</span>
                      </div>
                      <p className="text-slate-700 text-[11px] font-bold">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex gap-2">
                  <input
                    type="text"
                    value={newChatMessage}
                    onChange={(e) => setNewChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="اكتب سؤالك أو مشاركتك..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white/70"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-2 rounded-xl bg-[#173A7C] text-white hover:bg-[#1E4D9D] transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* List of other upcoming sessions */}
          {liveSessions.length > 1 && (
            <div className="space-y-3 pt-2">
              <h3 className="student-heading-h3 !text-sm">باقي الجلسات المجدولة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {liveSessions.slice(1).map((s) => (
                  <div key={s.id} className="p-4 rounded-2xl liquid-glass-card space-y-2">
                    <span className="text-[11px] font-black text-emerald-700">{s.courseName}</span>
                    <h4 className="text-xs font-black text-slate-900">{s.title}</h4>
                    <p className="text-[11px] text-slate-500 font-bold">{s.date} - {s.time}</p>
                    <a
                      href={s.joinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-black text-[#173A7C] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>رابط الحضور ({s.platform})</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Past recordings tab */
        <div className="space-y-4">
          {pastRecordings.length === 0 ? (
            <div className="p-10 sm:p-14 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#173A7C]/10 text-[#173A7C] flex items-center justify-center mx-auto">
                <Video className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">لا توجد تسجيلات مؤرشفة حالياً</h3>
                <p className="text-xs font-bold text-slate-500 max-w-md mx-auto">
                  سيتم أرشفة تسجيلات اللقاءات المباشرة فور انتهاء كل ورشة ليتسنى لك الرجوع إليها في أي وقت.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pastRecordings.map((rec) => (
                <div key={rec.id} className="p-6 rounded-3xl liquid-glass-card space-y-3">
                  <span className="text-xs font-black text-emerald-700">{rec.courseName}</span>
                  <h3 className="text-sm font-black text-slate-900">{rec.title}</h3>
                  <p className="text-xs text-slate-500 font-bold">{rec.date}</p>
                  {rec.recording_url && (
                    <a
                      href={rec.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#173A7C] text-white text-xs font-black"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>مشاهدة التسجيل</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
