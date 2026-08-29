'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Calendar,
  Clock,
  Plus,
  Video,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  X,
  Trash2,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface LiveSession {
  id: string;
  title: string;
  course_id?: string;
  meeting_url?: string;
  platform?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
}

export default function InstructorLivePage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('diploma-tolerance-citizenship');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('20:00');
  const [duration, setDuration] = useState('60');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [platform, setPlatform] = useState('Zoom');
  const [saving, setSaving] = useState(false);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .order('scheduled_at', { ascending: false });

      if (error) {
        console.error(error);
      }

      if (data && data.length > 0) {
        setSessions(data);
      } else {
        setSessions([
          {
            id: 'ls-inst-1',
            title: 'ورشة عمل تفاعلية: تطبيقات الحوار الإيجابي وتجنب النزاعات المؤسسية',
            course_id: 'دبلوم التسامح والسلام والمواطنة الصالحة',
            meeting_url: 'https://zoom.us',
            platform: 'Zoom',
            scheduled_at: new Date().toISOString(),
            duration_minutes: 90,
            status: 'scheduled',
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSaving(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const scheduledDateTime = date
        ? new Date(`${date}T${time || '20:00'}:00`).toISOString()
        : new Date().toISOString();

      const { error } = await supabase.from('live_sessions').insert({
        title,
        course_id: courseId,
        instructor_id: user?.id || null,
        meeting_url: meetingUrl || 'https://zoom.us',
        platform,
        scheduled_at: scheduledDateTime,
        duration_minutes: parseInt(duration) || 60,
        status: 'scheduled',
      });

      if (error) {
        console.error(error);
        alert(`خطأ: ${error.message}`);
        return;
      }

      alert('تمت جدولة الجلسة بنجاح!');
      setShowModal(false);
      setTitle('');
      setMeetingUrl('');
      loadSessions();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = (id: string, url?: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
      {/* Hero Header */}
      <div className="relative z-20 liquid-glass-hero p-6 sm:p-8 rounded-2xl sm:rounded-3xl liquid-glass-hover overflow-hidden student-card-accent">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-black border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>القاعات الافتراضية واللقاءات الحية</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black student-heading-h1">
              جلساتي وورشي <span className="student-name-gradient">المباشرة</span> 🔴
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-xl">
              جدولة الورش الحية مع الطلاب، إطلاق البث المباشر، ومشاركة روابط قاعات التدريب الافتراضية.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-600/20 hover:opacity-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>جدولة ورشة جديدة</span>
          </button>
        </div>
      </div>

      {/* Sessions list */}
      {loading ? (
        <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
          <p className="text-xs font-bold text-slate-500">جاري تحميل الجلسات...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm text-center space-y-3">
          <Radio className="w-12 h-12 text-[#173A7C]/30 mx-auto" />
          <h3 className="text-base font-black text-slate-900">لا توجد جلسات مجدولة حالياً</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => {
            const schedDate = new Date(s.scheduled_at);
            const dateStr = schedDate.toLocaleDateString('ar-SA', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            const timeStr = schedDate.toLocaleTimeString('ar-SA', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={s.id}
                className="p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-4 student-card-accent"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                  <div>
                    <span className="text-xs font-black text-emerald-700">{s.course_id}</span>
                    <h3 className="student-heading-h3 pt-1">{s.title}</h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black border ${
                      s.status === 'live'
                        ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                        : 'bg-blue-50 text-[#173A7C] border-blue-300'
                    }`}
                  >
                    {s.status === 'live' ? 'مباشر الآن 🔴' : 'مجدول 📅'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#173A7C]" />
                      <span>{dateStr}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#173A7C]" />
                      <span>{timeStr} ({s.duration_minutes} دقيقة)</span>
                    </span>
                  </div>

                  {s.meeting_url && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyLink(s.id, s.meeting_url)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedId === s.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>نسخ الرابط</span>
                      </button>
                      <a
                        href={s.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-1.5 rounded-xl bg-[#173A7C] text-white text-xs font-black flex items-center gap-1.5 hover:bg-[#1E4D9D]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>فتح القاعة ({s.platform || 'Zoom'})</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl p-6 sm:p-8 bg-white shadow-2xl border border-white/60 text-right space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="student-heading-h3">جدولة ورشة عمل مباشرة جديدة</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSession} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">عنوان الورشة التدريبية</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: تطبيقات الحوار المؤسسي"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">المقرر / الدورة</label>
                  <input
                    type="text"
                    required
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    placeholder="diploma-tolerance-citizenship"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">تاريخ الورشة</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">وقت البدء</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">المدة (بالدقائق)</label>
                    <input
                      type="number"
                      min="15"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">المنصة</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    >
                      <option value="Zoom">Zoom</option>
                      <option value="Microsoft Teams">Microsoft Teams</option>
                      <option value="Google Meet">Google Meet</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">رابط القاعة (URL)</label>
                  <input
                    type="url"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="https://zoom.us/j/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>{saving ? 'جاري الحفظ...' : 'نشر وجدولة الجلسة'}</span>
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
