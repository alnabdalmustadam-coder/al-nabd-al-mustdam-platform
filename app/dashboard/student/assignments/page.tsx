'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  FileText,
  Upload,
  Clock,
  CheckCircle2,
  Download,
  Send,
  MessageSquare,
  Paperclip,
  FileCheck,
  BookOpen,
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface AssignmentItem {
  id: string;
  course_id: string;
  courseTitle: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  rawDueDate?: string;
  maxGrade: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: string;
  instructorFeedback?: string;
  submittedFile?: string;
  submissionId?: string;
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

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'غير محدد';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function StudentAssignmentsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [activeUploadModal, setActiveUploadModal] = useState<AssignmentItem | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const userEmail = user.email?.toLowerCase().trim() || '';

      // Get enrolled course IDs
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .or(`email.eq.${userEmail},user_id.eq.${user.id}`);

      const enrolledCourseIds = (enrollments || []).map((e: any) => e.course_id);

      // Fetch active assignments
      const { data: assignmentsData, error: asgError } = await supabase
        .from('assignments')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (asgError) {
        console.error('Error fetching assignments:', asgError);
        setLoading(false);
        return;
      }

      // Filter by enrolled courses if enrolled list exists, or show all if empty
      const relevantAssignments = (assignmentsData || []).filter((a: any) =>
        enrolledCourseIds.length === 0 || enrolledCourseIds.includes(a.course_id)
      );

      // Fetch user's submissions
      const assignmentIds = relevantAssignments.map((a: any) => a.id);
      let submissionsMap: Record<string, any> = {};

      if (assignmentIds.length > 0) {
        const { data: subsData } = await supabase
          .from('assignment_submissions')
          .select('*')
          .in('assignment_id', assignmentIds)
          .or(`email.eq.${userEmail},user_id.eq.${user.id}`)
          .order('submitted_at', { ascending: false });

        (subsData || []).forEach((sub: any) => {
          if (!submissionsMap[sub.assignment_id]) {
            submissionsMap[sub.assignment_id] = sub;
          }
        });
      }

      const mapped: AssignmentItem[] = relevantAssignments.map((a: any) => {
        const sub = submissionsMap[a.id];
        let status: 'pending' | 'submitted' | 'graded' = 'pending';
        let grade: string | undefined;
        let instructorFeedback: string | undefined;
        let submittedFile: string | undefined;
        let submissionId: string | undefined;

        if (sub) {
          submissionId = sub.id;
          submittedFile = sub.file_url || sub.notes || 'تم تسليم الملف';
          if (sub.grade !== null && sub.grade !== undefined) {
            status = 'graded';
            grade = `${sub.grade} / ${a.max_grade || 100}`;
            instructorFeedback = sub.feedback;
          } else {
            status = 'submitted';
          }
        }

        return {
          id: a.id,
          course_id: a.course_id,
          courseTitle: a.course_id,
          title: a.title,
          description: a.description || 'لا يوجد وصف إضافي للواجب.',
          instructions: a.instructions,
          dueDate: formatDate(a.due_date),
          rawDueDate: a.due_date,
          maxGrade: `${a.max_grade || 100} درجة`,
          status,
          grade,
          instructorFeedback,
          submittedFile,
          submissionId,
        };
      });

      setAssignments(mapped);
    } catch (err) {
      console.error('Error in loadAssignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleFileSubmit = async () => {
    if (!uploadedFileName && !submissionNotes) {
      alert('يرجى اختيار ملف أو كتابة نص التسليم أولاً!');
      return;
    }

    if (!activeUploadModal) return;

    try {
      setSubmitting(true);
      let fileRef = '';
      if (uploadedFile) {
        const formData = new FormData();
        formData.set('file', uploadedFile);
        formData.set('kind', 'assignment');
        formData.set('resourceId', activeUploadModal.id);
        formData.set('courseId', activeUploadModal.course_id);
        const uploadResponse = await fetch('/api/student/submissions/upload', { method: 'POST', body: formData });
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(uploadResult.message || 'تعذر رفع الملف');
        }
        fileRef = uploadResult.fileRef;
      }

      const response = await fetch('/api/student/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: activeUploadModal.id,
          fileRef,
          notes: submissionNotes,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'تعذر تسليم الواجب');

      setActiveUploadModal(null);
      setUploadedFileName('');
      setUploadedFile(null);
      setSubmissionNotes('');
      loadAssignments();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'حدث خطأ أثناء التسليم');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (filter === 'pending') return a.status === 'pending';
    if (filter === 'submitted') return a.status === 'submitted';
    if (filter === 'graded') return a.status === 'graded';
    return true;
  });

  const totalCount = assignments.length;
  const pendingCount = assignments.filter((a) => a.status === 'pending').length;
  const submittedCount = assignments.filter((a) => a.status === 'submitted').length;
  const gradedCount = assignments.filter((a) => a.status === 'graded').length;

  return (
    <div className="space-y-6 pt-2.5 sm:pt-0 font-[family-name:var(--font-cairo)]" dir="rtl">
      {/* Header Banner Ultra Premium - Liquid Glass Theme */}
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
              <FileText className="w-3 h-3 text-[#173A7C]" />
              <span>المهام والتسليمات الأكاديمية</span>
            </motion.div>

            <motion.h1 variants={textItemVariants} className="student-heading-h1">
              الواجبات والتكليفات 📝
            </motion.h1>

            <motion.p variants={textItemVariants} className="student-text-body max-w-xl pr-0.5 pt-1.5 sm:pt-2 leading-relaxed">
              ارفع ملفات الواجبات المطلوبة في مواعيدها المحددة، واطلع على ملاحظات وتقييمات الأساتذة فور صدورها.
            </motion.p>
          </div>

          {/* Quick Counter Stats */}
          <motion.div variants={textItemVariants} className="flex items-center justify-around gap-2 sm:gap-4 liquid-glass-inner p-3.5 sm:p-4 rounded-2xl shadow-xs">
            <div className="text-center px-2 sm:px-3 border-l border-slate-200/60">
              <span className="block text-base sm:text-lg font-black text-amber-600">{pendingCount}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold whitespace-nowrap">واجب مطلوب</span>
            </div>
            <div className="text-center px-2 sm:px-3 border-l border-slate-200/60">
              <span className="block text-base sm:text-lg font-black text-[#173A7C]">{submittedCount}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold whitespace-nowrap">قيد التصحيح</span>
            </div>
            <div className="text-center px-2 sm:px-3">
              <span className="block text-base sm:text-lg font-black text-[#0D5C3A]">{gradedCount}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold whitespace-nowrap">تم تقييمها</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Filter Tabs & Header Line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="premium-tabs grid grid-cols-2 sm:flex sm:flex-row items-center gap-1.5 p-1.5 rounded-2xl border border-white/80 bg-white/90 backdrop-blur-md shadow-sm w-full sm:w-auto">
          {[
            { key: 'all', label: `الكل (${totalCount})` },
            { key: 'pending', label: `بانتظار التسليم (${pendingCount})` },
            { key: 'submitted', label: `قيد التقييم (${submittedCount})` },
            { key: 'graded', label: `تمت المراجعة (${gradedCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`premium-tab px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all duration-200 text-center cursor-pointer flex-1 sm:flex-none ${
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
          <FileCheck className="w-3.5 h-3.5 text-[#0D5C3A] shrink-0" />
          <span>الملفات المقبولة: PDF, DOCX, ZIP (بحد أقصى 25 ميجابايت)</span>
        </div>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
          <p className="text-xs font-bold text-slate-500">جاري تحميل الواجبات والتكليفات...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="p-10 sm:p-14 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#173A7C]/10 text-[#173A7C] flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">لا توجد واجبات {filter !== 'all' ? 'في هذا القسم' : 'مطلوبة حالياً'}</h3>
            <p className="text-xs font-bold text-slate-500 max-w-md mx-auto">
              ستظهر هنا جميع التكليفات والأنشطة المكلف بها في مقرراتك الدراسية.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {filteredAssignments.map((assignment, idx) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + idx * 0.14, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 liquid-glass-card liquid-glass-hover space-y-5 student-card-accent"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 border-b border-slate-200/60 pb-4">
                <div className="space-y-1.5 min-w-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#0D5C3A]">
                    <BookOpen className="w-3.5 h-3.5 text-[#0D5C3A] shrink-0" />
                    <span>{assignment.courseTitle}</span>
                  </span>
                  <h3 className="student-heading-h3 pt-1">{assignment.title}</h3>
                </div>

                {assignment.status === 'pending' && (
                  <span className="px-4 py-1.5 rounded-full text-xs font-black bg-amber-500 text-white border border-amber-400 shadow-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                    <Clock className="w-4 h-4 text-white" />
                    <span>آخر موعد: {assignment.dueDate}</span>
                  </span>
                )}

                {assignment.status === 'submitted' && (
                  <span className="px-4 py-1.5 rounded-full text-xs font-black bg-[#173A7C] text-white border border-blue-400 shadow-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                    <FileCheck className="w-4 h-4 text-white" />
                    <span>تم التسليم - قيد المراجعة</span>
                  </span>
                )}

                {assignment.status === 'graded' && (
                  <span className="px-4 py-1.5 rounded-full text-xs font-black bg-emerald-500 text-white border border-emerald-400 shadow-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>تم التقييم: {assignment.grade}</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-700 font-bold leading-relaxed">{assignment.description}</p>

              {assignment.submittedFile && (
                <div className="p-3.5 rounded-2xl flex flex-wrap xs:flex-nowrap items-center justify-between gap-2.5 text-xs font-bold border border-slate-200/90 bg-slate-100/90 shadow-inner min-w-0 overflow-hidden">
                  <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                    <Paperclip className="w-4 h-4 text-[#173A7C] shrink-0" />
                    <span className="text-slate-800 truncate min-w-0">
                      ملف التسليم: <strong className="text-[#173A7C]">{assignment.submittedFile.startsWith('storage://') ? 'مرفق محفوظ بأمان' : assignment.submittedFile}</strong>
                    </span>
                  </div>
                  {assignment.submittedFile.startsWith('storage://') && (
                    <a
                      href={`/api/student/submissions/file?ref=${encodeURIComponent(assignment.submittedFile)}`}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-[#173A7C]"
                      title="تنزيل ملف التسليم"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}

              {assignment.instructorFeedback && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/90 shadow-inner space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-800 font-black text-xs">
                    <MessageSquare className="w-4 h-4 text-[#5CB07C]" />
                    <span>ملاحظات الأستاذ المحاضر:</span>
                  </div>
                  <p className="text-xs text-emerald-900 font-bold mr-6 leading-relaxed">{assignment.instructorFeedback}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 font-extrabold">الدرجة الكلية: {assignment.maxGrade}</span>

                {assignment.status === 'pending' && (
                  <button
                    onClick={() => setActiveUploadModal(assignment)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-[#173A7C]/20 transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>تسليم الواجب الآن</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Assignment Modal */}
      <AnimatePresence>
        {activeUploadModal && (
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
                <div>
                  <h3 className="student-heading-h3">{activeUploadModal.title}</h3>
                  <p className="text-xs text-slate-400 font-bold">{activeUploadModal.courseTitle}</p>
                </div>
                <button
                  onClick={() => setActiveUploadModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* File upload or note */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-700">مرفق الواجب (ملف / رابط)</label>
                <div className="p-6 rounded-2xl border-2 border-dashed border-[#173A7C]/40 bg-slate-50/80 flex flex-col items-center justify-center text-center space-y-2 relative">
                  <Upload className="w-8 h-8 text-[#173A7C]" />
                  <p className="text-xs font-black text-slate-800">اختر ملفاً من جهازك أو اكتب اسمه/رابطه بالأسفل</p>
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.7z"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setUploadedFile(file);
                      setUploadedFileName(file?.name || '');
                    }}
                  />
                </div>
                {uploadedFileName && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs font-black text-emerald-800">
                    <span className="truncate">{uploadedFileName}</span>
                    <span className="text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded font-bold">جاهز</span>
                  </div>
                )}

                <div className="space-y-1 pt-2">
                  <label className="text-xs font-black text-slate-700">ملاحظات إضافية أو رابط الحل</label>
                  <textarea
                    rows={3}
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    placeholder="يمكنك كتابة ملاحظاتك للمدرب أو رابط Google Drive / GitHub..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#173A7C] bg-white/70"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/60">
                <button
                  onClick={() => {
                    setActiveUploadModal(null);
                    setUploadedFileName('');
                    setUploadedFile(null);
                    setSubmissionNotes('');
                  }}
                  className="px-5 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  disabled={submitting}
                  onClick={handleFileSubmit}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-[#173A7C]/20 transition-all cursor-pointer disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{submitting ? 'جاري الإرسال...' : 'تأكيد التسليم'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
