'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Search,
  BookOpen,
  CheckCircle2,
  Clock,
  Send,
  FileCheck,
  Paperclip,
  X,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface SubmissionItem {
  id: string;
  assignment_id: string;
  user_id?: string;
  email?: string;
  studentName: string;
  assignmentTitle: string;
  file_url?: string;
  notes?: string;
  grade?: number;
  feedback?: string;
  status: string;
  submitted_at: string;
}

export default function InstructorAssignmentsPage() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<SubmissionItem | null>(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignments (
            title,
            course_id,
            max_grade
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error(error);
      }

      if (data && data.length > 0) {
        const mapped: SubmissionItem[] = data.map((s: any) => ({
          id: s.id,
          assignment_id: s.assignment_id,
          user_id: s.user_id,
          email: s.email,
          studentName: s.email ? s.email.split('@')[0] : 'متدرب',
          assignmentTitle: s.assignments?.title || 'واجب دراسي',
          file_url: s.file_url,
          notes: s.notes,
          grade: s.grade,
          feedback: s.feedback,
          status: s.status,
          submitted_at: s.submitted_at,
        }));
        setSubmissions(mapped);
      } else {
        setSubmissions([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    try {
      setSavingGrade(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const numGrade = parseFloat(gradeInput);

      const { error } = await supabase
        .from('assignment_submissions')
        .update({
          grade: numGrade,
          feedback: feedbackInput || null,
          status: 'graded',
          graded_at: new Date().toISOString(),
          graded_by: user?.id || null,
        })
        .eq('id', selectedSub.id);

      if (error) {
        console.error(error);
        alert('حدث خطأ أثناء حفظ التقييم.');
        return;
      }

      alert('تم حفظ واعتماد تقييم الواجب بنجاح!');
      setSelectedSub(null);
      setGradeInput('');
      setFeedbackInput('');
      loadSubmissions();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingGrade(false);
    }
  };

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
      {/* Hero Header */}
      <div className="relative z-20 liquid-glass-hero p-6 sm:p-8 rounded-2xl sm:rounded-3xl liquid-glass-hover overflow-hidden student-card-accent">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/50 mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-[#173A7C] text-xs font-black border border-blue-200/90 shadow-xs">
            <ClipboardList className="w-4 h-4 text-[#173A7C]" />
            <span>تصحيح التكليفات والواجبات الميدانية</span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 text-amber-900 text-xs font-black border border-amber-300 shadow-xs">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{submissions.filter((s) => s.status !== 'graded').length} مهام بانتظار التقييم</span>
          </span>
        </div>

        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center shadow-xl shadow-amber-500/25 border border-white/40 shrink-0">
              <ClipboardList className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] student-heading-h1">
                تسليمات المتدربين <span className="student-name-gradient">ورصد الدرجات</span>
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed pr-1 sm:pr-2">
            مراجعة ملفات الواجبات المسلمة من الطلاب، كتابة الملاحظات التوجيهية، ورصد الدرجات المستحقة.
          </p>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
          <p className="text-xs font-bold text-slate-500">جاري تحميل تسليمات الطلاب...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm text-center space-y-3">
          <FileCheck className="w-12 h-12 text-[#173A7C]/30 mx-auto" />
          <h3 className="text-base font-black text-slate-900">لا توجد تسليمات حالياً</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-4 student-card-accent"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">{sub.studentName}</span>
                    <span className="text-[11px] text-slate-400">({sub.email})</span>
                  </div>
                  <h3 className="student-heading-h3 !text-sm pt-1">{sub.assignmentTitle}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black border ${
                      sub.status === 'graded' || sub.grade !== undefined
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {sub.grade !== undefined ? `تم التقييم: ${sub.grade} / 100` : 'بانتظار التصحيح ⏳'}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedSub(sub);
                      setGradeInput(sub.grade ? String(sub.grade) : '');
                      setFeedbackInput(sub.feedback || '');
                    }}
                    className="px-4 py-1.5 rounded-xl bg-[#173A7C] text-white text-xs font-black hover:bg-[#1E4D9D] transition-colors cursor-pointer"
                  >
                    <span>{sub.grade !== undefined ? 'تعديل الدرجة' : 'رصد الدرجة'}</span>
                  </button>
                </div>
              </div>

              {sub.notes && (
                <p className="text-xs text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[#173A7C] font-black block mb-0.5">ملاحظات الطالب:</span>
                  {sub.notes}
                </p>
              )}

              {sub.file_url && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Paperclip className="w-4 h-4 text-[#173A7C]" />
                  <span>المرفق: <strong>{sub.file_url}</strong></span>
                </div>
              )}

              {sub.feedback && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
                  <span className="font-black block">ملاحظاتك للمتدرب:</span>
                  <p>{sub.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Grade Modal */}
      <AnimatePresence>
        {selectedSub && (
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
                <div>
                  <h3 className="student-heading-h3">رصد درجة الواجب</h3>
                  <p className="text-xs text-slate-400 font-bold">{selectedSub.studentName}</p>
                </div>
                <button
                  onClick={() => setSelectedSub(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleGradeSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">الدرجة المستحقة (من 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    placeholder="مثال: 95"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">الملاحظات التوجيهية والتعليق</label>
                  <textarea
                    rows={4}
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="اكتب ملاحظاتك التشجيعية وتوجيهاتك للمتدرب..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setSelectedSub(null)}
                    className="px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={savingGrade}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {savingGrade ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{savingGrade ? 'جاري الحفظ...' : 'اعتماد الدرجة'}</span>
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
