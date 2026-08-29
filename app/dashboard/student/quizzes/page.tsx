'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  RotateCcw,
  FileCheck,
  HelpCircle,
  ChevronLeft,
  BookOpen,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface QuizItem {
  id: string;
  title: string;
  course_id: string;
  courseTitle: string;
  questionsCount: number;
  durationMinutes: number;
  passPercentage: number;
  status: 'pending' | 'passed' | 'failed';
  score?: number;
  attemptsUsed: number;
  maxAttempts: number;
}

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

export default function StudentQuizzesPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [activeQuizModal, setActiveQuizModal] = useState<QuizItem | null>(null);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuizzes() {
      try {
        const response = await fetch('/api/quizzes', {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || 'تعذر تحميل الاختبارات');
        }

        setQuizzes(payload.quizzes as QuizItem[]);
      } catch (err) {
        console.error('Error loading quizzes:', err);
      } finally {
        setLoading(false);
      }
    }

    loadQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter((q) => {
    if (filter === 'pending') return q.status === 'pending';
    if (filter === 'completed') return q.status === 'passed' || q.status === 'failed';
    return true;
  });

  const totalQuizzes = quizzes.length;
  const pendingCount = quizzes.filter(q => q.status === 'pending').length;
  const bestScore = quizzes.reduce((max, q) => Math.max(max, q.score || 0), 0);

  return (
    <div className="space-y-6 pt-2.5 sm:pt-0 font-[family-name:var(--font-cairo)]" dir="rtl">

      {/* Header Banner */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="relative z-20 liquid-glass-hero p-6 sm:p-8 md:p-9 space-y-4 liquid-glass-hover overflow-hidden student-card-accent rounded-2xl sm:rounded-3xl"
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#173A7C]/8 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3 pr-2">
            <motion.div variants={textItemVariants} className="student-tag-badge bg-blue-50/90 text-[#173A7C] border border-blue-200/80 shadow-xs">
              <Award className="w-3 h-3 text-[#173A7C]" />
              <span>التقييمات والاختبارات الأكاديمية</span>
            </motion.div>

            <motion.h1 variants={textItemVariants} className="student-heading-h1">
              اختباراتي وتقييمات المنهج 🎯
            </motion.h1>

            <motion.p variants={textItemVariants} className="student-text-body max-w-xl pr-0.5 pt-1.5 sm:pt-2 leading-relaxed">
              تابع كافة الاختبارات المطلوبة، درجات الفهم، وفرص الإعادة المتاحة لك للحصول على الشهادات المعتمدة.
            </motion.p>
          </div>

          <motion.div variants={textItemVariants} className="flex items-center justify-around gap-2 sm:gap-4 liquid-glass-inner p-3.5 sm:p-4 rounded-2xl shadow-xs">
            <div className="text-center px-2 sm:px-3 border-l border-slate-200/60">
              <span className="block text-base sm:text-lg font-black text-[#5CB07C]">{totalQuizzes}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold whitespace-nowrap">إجمالي الاختبارات</span>
            </div>
            <div className="text-center px-2 sm:px-3 border-l border-slate-200/60">
              <span className="block text-base sm:text-lg font-black text-amber-600">{pendingCount}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold whitespace-nowrap">متبقية</span>
            </div>
            <div className="text-center px-2 sm:px-3">
              <span className="block text-base sm:text-lg font-black text-[#173A7C]">{bestScore > 0 ? `${bestScore}%` : '—'}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold whitespace-nowrap">أعلى درجة</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="premium-tabs grid grid-cols-2 sm:flex sm:flex-row items-center gap-1.5 p-1.5 rounded-2xl border border-white/80 bg-white/90 backdrop-blur-md shadow-sm w-full sm:w-auto">
          {[
            { key: 'all', label: `كافة الاختبارات (${totalQuizzes})` },
            { key: 'pending', label: `المطلوبة (${pendingCount})` },
            { key: 'completed', label: `المكتملة (${totalQuizzes - pendingCount})` },
          ].map((tab, idx) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`premium-tab px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all duration-200 text-center cursor-pointer flex-1 sm:flex-none ${
                idx === 2 ? 'col-span-2 sm:col-span-1' : ''
              } ${
                filter === tab.key
                  ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20'
                  : 'text-slate-600 hover:text-[#173A7C] hover:bg-white/60 bg-slate-50/60 sm:bg-transparent'
              }`}
            >
              <span className="premium-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="text-[10px] sm:text-xs text-slate-700 font-extrabold flex items-center gap-1.5 drop-shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#0D5C3A] shrink-0" />
          <span>فرص الإعادة متاحة للاختبارات غير المجتازة</span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
          <p className="text-xs font-bold text-slate-500">جاري تحميل الاختبارات...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="p-10 sm:p-14 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#173A7C]/10 text-[#173A7C] flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">لا توجد اختبارات {filter !== 'all' ? 'في هذا التصنيف' : 'متاحة حالياً'}</h3>
            <p className="text-xs font-bold text-slate-500 max-w-md mx-auto">
              ستظهر هنا الاختبارات المرتبطة بالدورات المسجل فيها بمجرد إضافتها من المدرب.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredQuizzes.map((quiz, idx) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + idx * 0.14, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 liquid-glass-card liquid-glass-hover flex flex-col justify-between group student-card-accent min-h-[320px]"
            >
              <div className="space-y-3.5 mb-5">
                <div className="flex items-center justify-between gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#0D5C3A] leading-relaxed break-words" style={{ textShadow: '0 1px 0px rgba(255,255,255,0.6)' }}>
                    <BookOpen className="w-3.5 h-3.5 text-[#0D5C3A] shrink-0" />
                    <span>{quiz.courseTitle}</span>
                  </span>

                  {quiz.status === 'passed' && (
                    <span className="shrink-0 px-4 py-1.5 rounded-full text-xs font-black bg-emerald-500 text-white border border-emerald-400 shadow-xs flex items-center gap-1.5 whitespace-nowrap">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ناجح ({quiz.score}%)</span>
                    </span>
                  )}
                  {quiz.status === 'failed' && (
                    <span className="shrink-0 px-4 py-1.5 rounded-full text-xs font-black bg-rose-500 text-white border border-rose-400 shadow-xs flex items-center gap-1.5 whitespace-nowrap">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>لم يجتاز ({quiz.score}%)</span>
                    </span>
                  )}
                  {quiz.status === 'pending' && (
                    <span className="shrink-0 px-4 py-1.5 rounded-full text-xs font-black bg-amber-500 text-white border border-amber-400 shadow-xs flex items-center gap-1.5 whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5" />
                      <span>متاح الآن</span>
                    </span>
                  )}
                </div>

                <h3 className="student-heading-h3 group-hover:text-[#173A7C] transition-colors pt-1">
                  {quiz.title}
                </h3>
              </div>

              <div className="grid grid-cols-3 p-4 rounded-2xl mb-5 text-center border border-slate-200/90 bg-slate-100/90 shadow-inner">
                <div className="px-2">
                  <span className="block text-[11px] text-slate-500 font-bold mb-0.5">عدد الأسئلة</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900">{quiz.questionsCount} سؤال</span>
                </div>
                <div className="px-2 border-r border-l border-slate-300/80 shadow-[inset_1px_0_0_rgba(255,255,255,0.8),inset_-1px_0_0_rgba(255,255,255,0.8)]">
                  <span className="block text-[11px] text-slate-500 font-bold mb-0.5">المدة المحددة</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900">{quiz.durationMinutes} دقيقة</span>
                </div>
                <div className="px-2">
                  <span className="block text-[11px] text-slate-500 font-bold mb-0.5">نسبة النجاح</span>
                  <span className="text-xs sm:text-sm font-black text-[#173A7C]">{quiz.passPercentage}%</span>
                </div>
              </div>

              <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3 pt-4 border-t border-slate-200/60">
                <span className="text-xs text-slate-600 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>المحاولات: {quiz.attemptsUsed} / {quiz.maxAttempts}</span>
                </span>

                {quiz.status === 'pending' && (
                  <button
                    onClick={() => setActiveQuizModal(quiz)}
                    className="w-full xs:w-auto px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-[#173A7C]/20 transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>بدء الاختبار</span>
                  </button>
                )}

                {quiz.status === 'failed' && quiz.attemptsUsed < quiz.maxAttempts && (
                  <button
                    onClick={() => setActiveQuizModal(quiz)}
                    className="w-full xs:w-auto px-5 py-2.5 sm:py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>إعادة الاختبار ({quiz.attemptsUsed}/{quiz.maxAttempts})</span>
                  </button>
                )}

                {quiz.status === 'passed' && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setActiveQuizModal(quiz)}
                      className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-xs border border-slate-300/90 shadow-xs flex items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-[#173A7C]" />
                      <span>تفاصيل الإجابات</span>
                    </button>
                    <Link
                      href="/dashboard/student/certificates"
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-teal-600 hover:to-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>عرض الشهادة 📜</span>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quiz Modal */}
      <AnimatePresence>
        {activeQuizModal && (
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
              className="relative w-full max-w-lg overflow-hidden rounded-3xl p-6 sm:p-8 bg-white shadow-2xl border border-white/60 text-right space-y-5"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#173A7C]/10 text-[#173A7C]">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="student-heading-h3">{activeQuizModal.title}</h3>
                    <p className="text-xs text-slate-400 font-bold">{activeQuizModal.courseTitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveQuizModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 font-bold leading-relaxed p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <h4 className="font-black text-slate-800 text-sm">تعليمات الاختبار المهمة:</h4>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                  <li>عدد الأسئلة المتضمنة: <strong className="text-[#173A7C]">{activeQuizModal.questionsCount} سؤال</strong></li>
                  <li>الزمن المتاح للإجابة: <strong className="text-[#173A7C]">{activeQuizModal.durationMinutes} دقيقة</strong> (سيبدأ العداد فور البدء)</li>
                  <li>درجة النجاح المطلوبة: <strong className="text-[#5CB07C]">{activeQuizModal.passPercentage}%</strong></li>
                  <li>محاولات التشغيل المتاحة: <strong>{activeQuizModal.maxAttempts - activeQuizModal.attemptsUsed} من {activeQuizModal.maxAttempts}</strong></li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setActiveQuizModal(null)}
                  className="px-5 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => { setActiveQuizModal(null); alert('سيتم تفعيل واجهة الاختبار التفاعلية قريباً'); }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-[#173A7C]/20 hover:opacity-95 cursor-pointer"
                >
                  <span>تأكيد والبدء الآن</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
