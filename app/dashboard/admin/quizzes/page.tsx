'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Plus,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Edit3,
  Trash2,
  X,
  FileQuestion,
  Search,
  Check,
  Layers,
} from 'lucide-react';

interface QuizItem {
  id: string;
  courseTitle: string;
  quizTitle: string;
  questionsCount: number;
  passPercentage: number;
  status: 'active' | 'draft';
}

export default function AdminQuizzesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New Quiz Form State
  const [courseTitle, setCourseTitle] = useState('دبلوم التسامح والسلام والمواطنة الصالحة');
  const [quizTitle, setQuizTitle] = useState('اختبار الوحدة الأولى: المفاهيم الأساسية');
  const [passPercentage, setPassPercentage] = useState('70');

  const [quizzes, setQuizzes] = useState<QuizItem[]>([
    {
      id: 'qz-1',
      courseTitle: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      quizTitle: 'اختبار الوحدة الأولى: المفاهيم الأساسية للتسامح والمواطنة',
      questionsCount: 10,
      passPercentage: 70,
      status: 'active',
    },
    {
      id: 'qz-2',
      courseTitle: 'برنامج القيادة المستدامة والمسؤولية المجتمعية',
      quizTitle: 'الاختبار النهائي: استراتيجيات التقييم المؤسسي',
      questionsCount: 20,
      passPercentage: 75,
      status: 'active',
    },
    {
      id: 'qz-3',
      courseTitle: 'الشهادة الاحترافية في إدارة الاستدامة البيئية',
      quizTitle: 'اختبار التقييم الذاتي للسلامة البيئية',
      questionsCount: 15,
      passPercentage: 80,
      status: 'draft',
    },
  ]);

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) return;

    const newQ: QuizItem = {
      id: `qz-${Date.now()}`,
      courseTitle,
      quizTitle,
      questionsCount: 10,
      passPercentage: parseInt(passPercentage) || 70,
      status: 'active',
    };

    setQuizzes([newQ, ...quizzes]);
    setIsModalOpen(false);
  };

  const filteredQuizzes = quizzes.filter(
    (q) => q.quizTitle.includes(searchQuery) || q.courseTitle.includes(searchQuery)
  );

  const totalQuestions = quizzes.reduce((acc, curr) => acc + curr.questionsCount, 0);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#173A7C]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-20 left-10 w-[30rem] h-[30rem] bg-[#5CB07C]/8 rounded-full blur-[160px]" />
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
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#173A7C]/10 text-[#173A7C] text-[10px] sm:text-xs font-black border border-[#173A7C]/15 shrink-0 whitespace-nowrap mb-3 sm:mb-4">
                <FileQuestion className="w-3.5 h-3.5 text-[#173A7C] shrink-0" />
                <span>إدارة بنك الأسئلة والاختبارات الأكاديمية</span>
              </div>
              <h1 className="text-sm sm:text-2xl lg:text-3xl font-black student-heading-h1 student-name-gradient leading-snug">
                إدارة بنك الاختبارات <span className="inline-block whitespace-nowrap">والتقييمات 📝</span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs lg:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
              بناء بنك الأسئلة المتعددة، تحديد معايير ونسب الاجتياز، ربط الاختبارات بالوحدات التعليمية، وأتمتة التصحيح الفوري وإصدار النتائج.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#173A7C] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#173A7C]/20 cursor-pointer border border-white/25 shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>إنشاء اختبار جديد ⚡</span>
          </motion.button>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-[#173A7C]/10">
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">إجمالي الاختبارات</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-[#173A7C]">{quizzes.length} اختبار</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">بنك الأسئلة</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-emerald-700">{totalQuestions} سؤال معتمد</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">متوسط نسبة الاجتياز</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-amber-600">84.5% 🎯</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">التصحيح الإلكتروني</p>
            <p className="text-xs sm:text-sm lg:text-base font-black text-emerald-700">فوري ومؤتمت 🟢</p>
          </div>
        </div>
      </motion.div>

      {/* Filter and Search Bar */}
      <div className="liquid-glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/60 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#173A7C]" />
          <span>قائمة الاختبارات والوحدات التقييمية النشطة</span>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute top-3.5 right-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم الاختبار أو المساق..."
            className="w-full py-2.5 pr-10 pl-4 text-xs font-bold text-slate-800 bg-white/90 rounded-xl border border-slate-200/80 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredQuizzes.map((quiz) => (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="liquid-glass-card liquid-glass-hover rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/70 space-y-4 relative group overflow-hidden student-card-accent"
          >
            <div className="specular-card-reflection" />

            {/* Badges Row */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-[#173A7C]/8 text-[#173A7C] border border-[#173A7C]/15 truncate max-w-[190px] sm:max-w-none">
                {quiz.courseTitle}
              </span>

              <span
                className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold border shrink-0 whitespace-nowrap ${
                  quiz.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25'
                    : 'bg-amber-500/10 text-amber-800 border-amber-500/25'
                }`}
              >
                {quiz.status === 'active' ? 'مفعل 🟢' : 'مسودة 🟡'}
              </span>
            </div>

            {/* Quiz Title */}
            <h3 className="font-extrabold text-xs sm:text-sm text-[#152C5B] student-heading-h3 leading-snug">
              {quiz.quizTitle}
            </h3>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs font-bold pt-1">
              <div className="liquid-glass-inset p-3 rounded-xl border border-white/70 flex items-center justify-between">
                <span className="text-slate-500">عدد الأسئلة:</span>
                <span className="font-black font-mono text-[#173A7C]">{quiz.questionsCount} أسئلة</span>
              </div>

              <div className="liquid-glass-inset p-3 rounded-xl border border-white/70 flex items-center justify-between">
                <span className="text-slate-500">درجة النجاح:</span>
                <span className="font-black font-mono text-emerald-700">{quiz.passPercentage}%</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-bold text-xs shadow-md shadow-[#173A7C]/15 transition-all cursor-pointer border border-white/20">
                إدارة الأسئلة والإجابات 📝
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CREATE QUIZ MODAL */}
      <AnimatePresence>
        {isModalOpen && (
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
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#5CB07C] via-[#173A7C] to-emerald-400" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[#152C5B] student-heading-h3">إنشاء اختبار أكاديمي جديد</h3>
                    <p className="text-xs text-slate-500 font-bold">تحديد المساق وضوابط الاجتياز الآلي</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateQuiz} className="space-y-4 text-xs font-bold">
                <div className="space-y-1.5">
                  <label className="text-slate-700 block">اختيار المساق الأكاديمي</label>
                  <input
                    type="text"
                    required
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 block">عنوان الاختبار</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: اختبار الوحدة الأولى..."
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 block">نسبة درجة النجاح المطلوبة (%)</label>
                  <input
                    type="number"
                    value={passPercentage}
                    onChange={(e) => setPassPercentage(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 font-mono font-black focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                  />
                </div>

                <div className="pt-4 flex items-center gap-3 border-t border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-bold shadow-lg shadow-[#173A7C]/25 cursor-pointer transition-all border border-white/20"
                  >
                    تأكيد وإضافة الاختبار ⚡
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
