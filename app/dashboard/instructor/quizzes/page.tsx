'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Search,
  BookOpen,
  CheckCircle2,
  Clock,
  Plus,
  HelpCircle,
  Users,
  Loader2,
  X,
  Check,
  Trash2,
  FileQuestion,
  Sparkles,
  Layers,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface QuizItem {
  id: string;
  course_id: string;
  title: string;
  duration_minutes: number;
  pass_percentage: number;
  questions_json: any[];
}

export default function InstructorQuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Create Quiz Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('دبلوم التسامح والسلام والمواطنة الصالحة');
  const [newDuration, setNewDuration] = useState('25');
  const [newPassScore, setNewPassScore] = useState('70');
  const [newQuestionsCount, setNewQuestionsCount] = useState('10');
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
      }

      if (data && data.length > 0) {
        setQuizzes(data);
      } else {
        setQuizzes([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setIsSavingQuiz(true);
      const supabase = createClient();

      const questions = Array.from({ length: Number(newQuestionsCount) || 5 }, (_, idx) => ({
        id: `q-${idx + 1}`,
        question: `سؤال تقييمي ${idx + 1}`,
        options: ['الخيار الأول', 'الخيار الثاني', 'الخيار الثالث', 'الخيار الرابع'],
        correctIndex: 0,
      }));

      const { data: inserted, error } = await supabase
        .from('quizzes')
        .insert({
          title: newTitle.trim(),
          course_id: newCourse,
          duration_minutes: Number(newDuration) || 25,
          pass_percentage: Number(newPassScore) || 70,
          questions_json: questions,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating quiz:', error);
        alert(`فشل إنشاء الاختبار: ${error.message}`);
        return;
      }

      if (inserted) {
        setQuizzes((prev) => [inserted, ...prev]);
      } else {
        await loadQuizzes();
      }

      setShowCreateModal(false);
      setNewTitle('');
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ الاختبار');
    } finally {
      setIsSavingQuiz(false);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الاختبار نهائياً؟')) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from('quizzes').delete().eq('id', id);
      if (error) {
        console.error('Error deleting quiz:', error);
        alert(`فشل حذف الاختبار: ${error.message}`);
        return;
      }
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حذف الاختبار من الخادم');
    }
  };

  const filteredQuizzes = quizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.course_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
      {/* ── 1. HERO HEADER ── */}
      <div className="relative z-20 liquid-glass-hero p-6 sm:p-8 rounded-2xl sm:rounded-3xl liquid-glass-hover overflow-hidden student-card-accent">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/50 mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-[#173A7C] text-xs font-black border border-blue-200/90 shadow-xs">
            <Award className="w-4 h-4 text-[#173A7C]" />
            <span>التقييمات والاختبارات الأكاديمية</span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-300 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{quizzes.length} اختبارات متاحة</span>
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#173A7C] via-[#1E4D9D] to-[#2563EB] text-white flex items-center justify-center shadow-xl shadow-[#173A7C]/25 border border-white/40 shrink-0">
                <Award className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] student-heading-h1">
                  بنك الاختبارات <span className="student-name-gradient">والتقييمات الأكاديمية</span>
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed pr-1 sm:pr-2">
              إنشاء وإدارة الاختبارات التقييمية لمقرراتك، تحديد درجات الاجتياز، ومتابعة درجات المتدربين.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#5CB07C] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-[#173A7C]/20 cursor-pointer hover:opacity-95 transition-all border border-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء اختبار جديد</span>
          </button>
        </div>
      </div>

      {/* ── 2. METRICS COUNTERS (MATCHED WITH MAIN DASHBOARD STYLE) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-blue-50 text-[#173A7C] border-blue-200">
              بنك الأسئلة
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">إجمالي الاختبارات</span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#173A7C] tracking-tight">{quizzes.length} اختبار</h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-emerald-50 text-emerald-800 border-emerald-300">
              أسئلة معتمدة
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">إجمالي الأسئلة</span>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
              {quizzes.reduce((acc, q) => acc + (q.questions_json?.length || 10), 0)} سؤال
            </h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-amber-50 text-amber-900 border-amber-300">
              معدل النجاح
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">متوسط نسبة الاجتياز</span>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight">75%</h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-indigo-50 text-indigo-900 border-indigo-200">
              تفاعل الطلاب
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">المحاولات المنجزة</span>
            <h3 className="text-2xl sm:text-3xl font-black text-indigo-700 tracking-tight">180 محاولة</h3>
          </div>
        </div>
      </div>

      {/* ── 3. SEARCH BAR ── */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث في بنك الاختبارات أو المقررات..."
          className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white/80"
        />
      </div>

      {/* ── 4. QUIZZES GRID ── */}
      {loading ? (
        <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
          <p className="text-xs font-bold text-slate-500">جاري تحميل الاختبارات...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm text-center space-y-3">
          <HelpCircle className="w-12 h-12 text-[#173A7C]/30 mx-auto" />
          <h3 className="text-base font-black text-slate-900">لا توجد اختبارات مسجلة</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuizzes.map((q) => {
            const count = Array.isArray(q.questions_json) ? q.questions_json.length : 10;
            return (
              <div
                key={q.id}
                className="p-5 sm:p-6 rounded-3xl liquid-glass-card liquid-glass-hover flex flex-col justify-between space-y-4 student-card-accent"
              >
                <div className="space-y-2">
                  <span className="text-xs font-black text-emerald-700 flex items-center gap-1.5 truncate">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>{q.course_id}</span>
                  </span>
                  <h3 className="student-heading-h3 !text-sm leading-snug">{q.title}</h3>
                </div>

                <div className="grid grid-cols-3 p-3 rounded-2xl bg-slate-50/90 border border-slate-200 text-center text-xs font-black">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">الأسئلة</span>
                    <span className="text-slate-800">{count} سؤال</span>
                  </div>
                  <div className="border-r border-l border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">المدة</span>
                    <span className="text-slate-800">{q.duration_minutes || 30} دقيقة</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">الاجتياز</span>
                    <span className="text-emerald-700">{q.pass_percentage}%</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-bold">مفعل ومتاح للمتدربين</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuiz(q.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                    title="حذف الاختبار"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 5. CREATE QUIZ MODAL ── */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-white/80 overflow-hidden my-auto"
            >
              <form onSubmit={handleCreateQuiz} className="space-y-4">
                {/* Header */}
                <div className="p-5 bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="w-5 h-5 text-amber-300" />
                    <h3 className="font-black text-sm sm:text-base">إنشاء اختبار تقييمي جديد</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Body */}
                <div className="p-5 sm:p-6 space-y-4 text-xs font-bold">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">عنوان الاختبار التدريبي *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: الاختبار النهائي الشامل للوحدة الأولى"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">المقرر التدريبي المرتبط</label>
                    <select
                      value={newCourse}
                      onChange={(e) => setNewCourse(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none"
                    >
                      <option value="دبلوم التسامح والسلام والمواطنة الصالحة">دبلوم التسامح والسلام والمواطنة الصالحة</option>
                      <option value="المهارات الأكاديمية والتفكير الناقد">المهارات الأكاديمية والتفكير الناقد</option>
                      <option value="دورة استخدام الحاسب الالي في الاعمال المكتبية">دورة استخدام الحاسب الالي في الاعمال المكتبية</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-slate-700 block">المدة (دقيقة)</label>
                      <input
                        type="number"
                        value={newDuration}
                        onChange={(e) => setNewDuration(e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-700 block">درجة الاجتياز %</label>
                      <input
                        type="number"
                        value={newPassScore}
                        onChange={(e) => setNewPassScore(e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-700 block">عدد الأسئلة</label>
                      <input
                        type="number"
                        value={newQuestionsCount}
                        onChange={(e) => setNewQuestionsCount(e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingQuiz}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#173A7C] text-white font-black text-xs shadow-md hover:opacity-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>إنشاء ونشر الاختبار</span>
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
