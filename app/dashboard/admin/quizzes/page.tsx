'use client';

import React, { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface QuizItem {
  id: string;
  course_id: string;
  title: string;
  questions_json: any[];
  duration_minutes: number;
  pass_percentage: number;
  is_active: boolean;
}

export default function AdminQuizzesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // New Quiz Form State
  const [courseId, setCourseId] = useState('computer-basics-office');
  const [quizTitle, setQuizTitle] = useState('');
  const [passPercentage, setPassPercentage] = useState('70');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [sampleQuestionsCount, setSampleQuestionsCount] = useState('10');

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quizzes:', error);
      }

      if (data && data.length > 0) {
        setQuizzes(data);
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
    if (!quizTitle.trim()) return;

    try {
      setCreating(true);
      const supabase = createClient();

      const questions = Array.from({ length: parseInt(sampleQuestionsCount) || 10 }, (_, i) => ({
        id: `q-${i + 1}`,
        text: `سؤال تقييمي رقم ${i + 1}`,
        options: ['الخيار الأول (صحيح)', 'الخيار الثاني', 'الخيار الثالث', 'الخيار الرابع'],
        correctIndex: 0,
      }));

      const { error } = await supabase.from('quizzes').insert({
        course_id: courseId,
        title: quizTitle,
        questions_json: questions,
        duration_minutes: parseInt(durationMinutes) || 30,
        pass_percentage: parseInt(passPercentage) || 70,
        is_active: true,
      });

      if (error) {
        console.error(error);
        alert(`خطأ: ${error.message}`);
        return;
      }

      alert('تم إنشاء بنك أسئلة الاختبار بنجاح!');
      setIsModalOpen(false);
      setQuizTitle('');
      loadQuizzes();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاختبار؟')) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from('quizzes').delete().eq('id', id);
      if (error) {
        console.error('Delete quiz error:', error);
        alert(`فشل حذف الاختبار: ${error.message}`);
        return;
      }
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في الاتصال بالخادم');
    }
  };

  const filteredQuizzes = quizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.course_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
      {/* Hero Header */}
      <div className="relative z-20 liquid-glass-hero p-6 sm:p-8 rounded-2xl sm:rounded-3xl liquid-glass-hover overflow-hidden student-card-accent">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="admin-hero-tag bg-blue-50 text-[#173A7C] border border-blue-200">
              <FileQuestion className="w-4 h-4 text-blue-600 shrink-0" />
              <span>بنك الأسئلة والتقييمات الأكاديمية</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black student-heading-h1">
              إدارة <span className="student-name-gradient">الاختبارات والتقييمات</span> 📝
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-xl">
              إنشاء اختبارات الدورات، ضبط نسب النجاح، وتحديد مدد الأسئلة للمتدربين.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-[#173A7C]/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء اختبار جديد</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الاختبار أو الدورة..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white/80"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
          <p className="text-xs font-bold text-slate-500">جاري تحميل الاختبارات...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm text-center space-y-3">
          <FileQuestion className="w-12 h-12 text-[#173A7C]/30 mx-auto" />
          <h3 className="text-base font-black text-slate-900">لا توجد اختبارات مسجلة</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuizzes.map((q) => {
            const count = Array.isArray(q.questions_json) ? q.questions_json.length : 0;
            return (
              <div
                key={q.id}
                className="p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-4 student-card-accent"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-emerald-700 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{q.course_id}</span>
                    </span>
                    <h3 className="student-heading-h3">{q.title}</h3>
                  </div>

                  <button
                    onClick={() => handleDeleteQuiz(q.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs font-black text-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">الأسئلة</span>
                    <span>{count} سؤال</span>
                  </div>
                  <div className="border-r border-l border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">المدة</span>
                    <span>{q.duration_minutes || 30} دقيقة</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">نسبة النجاح</span>
                    <span className="text-emerald-700">{q.pass_percentage}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
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
                <h3 className="student-heading-h3">إنشاء اختبار دورة جديد</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateQuiz} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">عنوان الاختبار</label>
                  <input
                    type="text"
                    required
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="مثال: الاختبار النصفي للمهارات الإدارية"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">رمز الدورة / المسار</label>
                  <input
                    type="text"
                    required
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    placeholder="computer-basics-office"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">نسبة النجاح (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={passPercentage}
                      onChange={(e) => setPassPercentage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">المدة (بالدقائق)</label>
                    <input
                      type="number"
                      min="5"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">عدد الأسئلة</label>
                    <input
                      type="number"
                      min="1"
                      value={sampleQuestionsCount}
                      onChange={(e) => setSampleQuestionsCount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>{creating ? 'جاري الحفظ...' : 'حفظ ونشر الاختبار'}</span>
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
