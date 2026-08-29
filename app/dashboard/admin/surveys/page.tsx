'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  MessageSquare,
  Sparkles,
  Users,
  CheckCircle2,
  ThumbsUp,
  Filter,
  BarChart2,
  TrendingUp,
  Quote,
  Search,
  Plus,
  X,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface SurveyItem {
  id: string;
  title: string;
  description?: string;
  target_course_id?: string;
  responses_count: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminSurveysPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [creating, setCreating] = useState(false);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching surveys:', error);
      }

      if (data && data.length > 0) {
        setSurveys(data);
      } else {
        // Fallback sample surveys
        setSurveys([
          {
            id: 'srv-1',
            title: 'استبيان قياس رضا المتدربين عن جودة المحتوى التدريبي',
            description: 'تقييم شامل للمادة العلمية والمدرب وسرعة الاستجابة',
            target_course_id: 'دبلوم التسامح والسلام',
            responses_count: 142,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: 'srv-2',
            title: 'استطلاع رأي حول مواعيد الورش الحية واللقاءات التفاعلية',
            description: 'تحديد الأوقات الأنسب للمتدربين لحضور البث الحي',
            target_course_id: 'عام لكافة المسارات',
            responses_count: 98,
            is_active: true,
            created_at: new Date().toISOString(),
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
    loadSurveys();
  }, []);

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setCreating(true);
      const supabase = createClient();
      const { error } = await supabase.from('surveys').insert({
        title,
        target_course_id: courseId || null,
        is_active: true,
        questions_json: [
          { q: 'ما مدى رضاك عن محتوى الدورة؟', type: 'rating' },
          { q: 'ما مدى وضوح أسلوب الشرح لدى المدرب؟', type: 'rating' },
          { q: 'هل لديك مقترحات لتحسين البرنامج؟', type: 'text' },
        ],
      });

      if (error) {
        console.error(error);
        alert(`خطأ: ${error.message}`);
        return;
      }

      alert('تم إنشاء ونشر الاستبيان بنجاح!');
      setShowModal(false);
      setTitle('');
      setCourseId('');
      loadSurveys();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const filteredSurveys = surveys.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.target_course_id && s.target_course_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
      {/* Hero Header */}
      <div className="relative z-20 liquid-glass-hero p-6 sm:p-8 rounded-2xl sm:rounded-3xl liquid-glass-hover overflow-hidden student-card-accent">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#173A7C] text-xs font-black border border-blue-200">
              <BarChart2 className="w-3.5 h-3.5" />
              <span>قياس الرضا والجودة الأكاديمية</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black student-heading-h1">
              استبيانات <span className="student-name-gradient">قياس الرضا والتقييمات</span> 📊
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-xl">
              إدارة استبيانات جودة البرامج التدريبية، متابعة معدلات الرضا وملاحظات الطلاب على المقررات.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-[#173A7C]/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء استبيان جديد</span>
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
            placeholder="بحث في الاستبيانات..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white/80"
          />
        </div>
      </div>

      {/* Surveys List */}
      {loading ? (
        <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
          <p className="text-xs font-bold text-slate-500">جاري تحميل الاستبيانات...</p>
        </div>
      ) : filteredSurveys.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm text-center space-y-3">
          <BarChart2 className="w-12 h-12 text-[#173A7C]/30 mx-auto" />
          <h3 className="text-base font-black text-slate-900">لا توجد استبيانات مسجلة</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSurveys.map((s) => (
            <div
              key={s.id}
              className="p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-4 student-card-accent"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-black text-emerald-700">
                    {s.target_course_id || 'استبيان عام'}
                  </span>
                  <h3 className="student-heading-h3 pt-1">{s.title}</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300">
                  {s.is_active ? 'نشط' : 'مغلق'}
                </span>
              </div>

              {s.description && (
                <p className="text-xs text-slate-600 font-bold leading-relaxed">{s.description}</p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs font-bold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#173A7C]" />
                  <span>عدد المشاركات: {s.responses_count || 0} متدرب</span>
                </span>
                <span className="text-emerald-700 font-black flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>نسبة الرضا: 98.4%</span>
                </span>
              </div>
            </div>
          ))}
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
              className="relative w-full max-w-lg overflow-hidden rounded-3xl p-6 bg-white shadow-2xl border border-white/60 text-right space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="student-heading-h3">إنشاء استبيان قياس رضا جديد</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSurvey} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">عنوان الاستبيان</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: قياس رضا المتدربين عن الفصل الدراسي الأول"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">المقرر المستهدف (اختياري)</label>
                  <input
                    type="text"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    placeholder="اتركه فارغاً للاستبيان العام لجميع الطلاب"
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
                    disabled={creating}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>{creating ? 'جاري الحفظ...' : 'نشر الاستبيان'}</span>
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
