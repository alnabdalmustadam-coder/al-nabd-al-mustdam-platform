'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  ShieldCheck,
  Upload,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  Paperclip,
  MessageSquare,
  Award,
  ChevronLeft,
  BookOpen,
  FolderGit2,
  Loader2,
  X,
  Send,
  Plus
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

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

interface ProjectItem {
  id: string;
  course_id: string;
  title: string;
  courseTitle: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  grade?: string;
  maxGrade: string;
  description: string;
  submittedFile?: string;
  repositoryUrl?: string;
  feedback?: string;
  submittedAt?: string;
}

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUploadModal, setActiveUploadModal] = useState<ProjectItem | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCourseId, setNewCourseId] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadProjects = async () => {
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

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .or(`email.eq.${userEmail},user_id.eq.${user.id}`)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
      }

      if (data && data.length > 0) {
        const mapped: ProjectItem[] = data.map((p: any) => ({
          id: p.id,
          course_id: p.course_id,
          title: p.title,
          courseTitle: p.course_id || 'مشروع تخرج تطبيقي',
          dueDate: p.submitted_at ? new Date(p.submitted_at).toLocaleDateString('ar-SA') : 'مفتوح',
          status: p.status === 'graded' || p.grade ? 'approved' : (p.status || 'submitted'),
          grade: p.grade ? `${p.grade} / 100` : undefined,
          maxGrade: '100 درجة (إجباري للتخرج)',
          description: p.description || 'مشروع تخرج تطبيقي للمقرر التدريبي.',
          submittedFile: p.file_url,
          repositoryUrl: p.repository_url,
          feedback: p.feedback,
          submittedAt: p.submitted_at,
        }));
        setProjects(mapped);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setSubmitting(true);
      if (!newCourseId.trim()) throw new Error('يرجى تحديد الدورة المرتبط بها المشروع');
      if (!newFile && !newRepoUrl.trim()) throw new Error('يرجى اختيار ملف أو إضافة رابط مستودع آمن');

      let fileRef = '';
      if (newFile) {
        const formData = new FormData();
        formData.set('file', newFile);
        formData.set('kind', 'project');
        formData.set('resourceId', 'draft');
        formData.set('courseId', newCourseId.trim());
        const uploadResponse = await fetch('/api/student/submissions/upload', { method: 'POST', body: formData });
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(uploadResult.message || 'تعذر رفع ملف المشروع');
        }
        fileRef = uploadResult.fileRef;
      }

      const response = await fetch('/api/student/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: newCourseId.trim(),
          title: newTitle,
          description: newDesc,
          fileRef,
          repositoryUrl: newRepoUrl,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'تعذر تسليم المشروع');

      setShowNewProjectModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewFile(null);
      setNewRepoUrl('');
      loadProjects();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'حدث خطأ أثناء تسليم المشروع');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)]" dir="rtl">
      {/* Header Banner Ultra Premium - Liquid Glass Theme */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="relative z-20 liquid-glass-hero p-6 sm:p-8 md:p-9 space-y-4 liquid-glass-hover overflow-hidden student-card-accent rounded-2xl sm:rounded-3xl"
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-emerald-400/20 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-br from-blue-600/15 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3 pr-2">
            <motion.div variants={textItemVariants} className="student-tag-badge bg-blue-50 text-[#173A7C] border border-blue-200/80 shadow-xs">
              <FolderGit2 className="w-3.5 h-3.5 text-[#173A7C]" />
              <span>المشاريع العملية ومشاريع التخرج المعتمدة</span>
            </motion.div>

            <motion.h1 variants={textItemVariants} className="student-heading-h1">
              المشاريع والتطبيقات <span className="student-name-gradient">العملية</span> 📁
            </motion.h1>

            <motion.p variants={textItemVariants} className="student-text-body max-w-xl pr-0.5 pt-1.5 sm:pt-2 leading-relaxed">
              ارفع وتابع مشاريع التخرج والتطبيقات الميدانية المطلوبة لاعتماد الشهادات الأكاديمية والمهنية.
            </motion.p>
          </div>

          <motion.div variants={textItemVariants} className="flex items-center gap-3">
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-[#173A7C]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تسليم مشروع جديد</span>
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Projects list */}
      {loading ? (
        <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
          <p className="text-xs font-bold text-slate-500">جاري تحميل المشاريع...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-10 sm:p-14 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#173A7C]/10 text-[#173A7C] flex items-center justify-center mx-auto">
            <FolderGit2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">لا توجد مشاريع مسجلة حالياً</h3>
            <p className="text-xs font-bold text-slate-500 max-w-md mx-auto">
              يمكنك رفع مشروع التخرج الخاص بك أو التطبيقات العملية لتقييمها واعتمادها من قِبل اللجنة الأكاديمية.
            </p>
          </div>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white font-black text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>رفع وتسليم مشروعك الآن</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.12, duration: 0.6 }}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 liquid-glass-card liquid-glass-hover space-y-4 student-card-accent"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-black text-emerald-700 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{project.courseTitle}</span>
                  </span>
                  <h3 className="student-heading-h3">{project.title}</h3>
                </div>

                {project.status === 'approved' && (
                  <span className="px-4 py-1.5 rounded-full text-xs font-black bg-emerald-500 text-white border border-emerald-400 shadow-xs flex items-center gap-1.5 whitespace-nowrap">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>معتمد: {project.grade || 'ناجح'}</span>
                  </span>
                )}

                {project.status === 'submitted' && (
                  <span className="px-4 py-1.5 rounded-full text-xs font-black bg-[#173A7C] text-white border border-blue-400 shadow-xs flex items-center gap-1.5 whitespace-nowrap">
                    <FileCheck className="w-4 h-4 text-white" />
                    <span>قيد المراجعة الأكاديمية</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-700 font-bold leading-relaxed">{project.description}</p>

              {project.submittedFile && (
                <div className="p-3.5 rounded-2xl flex items-center justify-between gap-2.5 text-xs font-bold border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-4 h-4 text-[#173A7C]" />
                    <span className="truncate">ملف المشروع: <strong>{project.submittedFile.startsWith('storage://') ? 'مرفق محفوظ بأمان' : project.submittedFile}</strong></span>
                  </div>
                  {project.submittedFile.startsWith('storage://') && (
                    <a
                      href={`/api/student/submissions/file?ref=${encodeURIComponent(project.submittedFile)}`}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-[#173A7C]"
                      title="تنزيل ملف المشروع"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}

              {project.feedback && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 space-y-1">
                  <span className="font-black text-emerald-800 block">تقييم المشرف الأكاديمي:</span>
                  <p>{project.feedback}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      <AnimatePresence>
        {showNewProjectModal && (
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
                <h3 className="student-heading-h3">تسليم مشروع عملي جديد</h3>
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">عنوان المشروع</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: الخطة التنفيذية لتعزيز الحوار المؤسسي"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">رمز الدورة / البرنامج التدريبي</label>
                  <input
                    type="text"
                    required
                    value={newCourseId}
                    onChange={(e) => setNewCourseId(e.target.value)}
                    placeholder="مثال: diploma-tolerance-citizenship"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">وصف وملخص المشروع</label>
                  <textarea
                    rows={3}
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="اكتب نبذة عن أهداف ومنهجية المشروع والنتائج المتوقعة..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">ملف المشروع</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.7z"
                      onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">رابط الكود/المستودع (اختياري)</label>
                    <input
                      type="url"
                      value={newRepoUrl}
                      onChange={(e) => setNewRepoUrl(e.target.value)}
                      placeholder="GitHub / GitLab URL"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setShowNewProjectModal(false)}
                    className="px-5 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-[#173A7C]/20 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{submitting ? 'جاري الحفظ...' : 'تسليم المشروع'}</span>
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
