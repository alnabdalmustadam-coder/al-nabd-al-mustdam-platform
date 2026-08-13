'use client';

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
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
} from 'lucide-react';

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
  title: string;
  courseTitle: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'approved';
  grade?: string;
  maxGrade: string;
  description: string;
  submittedFile?: string;
  feedback?: string;
}

export default function StudentProjectsPage() {
  const [activeUploadModal, setActiveUploadModal] = useState<ProjectItem | null>(null);

  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: 'proj-1',
      title: 'مشروع التخرج: تصميم خطة استراتيجية لتعزيز الحوار والتسامح في المنشآت',
      courseTitle: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      dueDate: '15 أغسطس 2026',
      status: 'pending',
      maxGrade: '100 درجة (إجباري للتخرج)',
      description: 'تقديم مشروع تخرج متكامل يشمل تشخيص الواقع الراهن، وضع المبادرات التنفيذية، وتحديد مؤشرات الأداء (KPIs) لتعزيز قيم السلام والمواطنة.',
    },
    {
      id: 'proj-2',
      title: 'التطبيق العملي الأول: قياس أثر برامج التسامح في البيئة التعليمية',
      courseTitle: 'المهارات الأكاديمية والتفكير الناقد',
      dueDate: 'تم التسليم - 20 يوليو 2026',
      status: 'approved',
      grade: '96 / 100',
      maxGrade: '100 درجة',
      description: 'دراسة ميدانية مصغرة تقيس استجابة الطلاب لمبادرات التسامح والمسؤولية المجتمعية.',
      submittedFile: 'دراسة_أثر_برامج_التسامح_عبدالله.pdf',
      feedback: 'مشروع ممتاز وتطبيق احترافي للمنهجية الأكاديمية. تم اعتماد المشروع رسمياً.',
    },
  ]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner Ultra Premium - Liquid Glass Theme */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="relative z-20 liquid-glass-hero p-6 sm:p-8 md:p-9 space-y-4 liquid-glass-hover overflow-hidden student-card-accent rounded-2xl sm:rounded-3xl"
      >
        {/* Ambient Liquid Glowing Orbs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-emerald-400/20 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-br from-blue-600/15 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3 pr-2">
            <motion.div variants={textItemVariants} className="student-tag-badge bg-blue-50/90 text-[#173A7C] border border-blue-200/80 shadow-xs">
              <FolderGit2 className="w-3.5 h-3.5 text-[#173A7C]" />
              <span>المشاريع والتطبيقات الميدانية</span>
            </motion.div>

            <motion.h1 variants={textItemVariants} className="student-heading-h1">
              مشاريع التخرج و<span className="student-name-gradient">التطبيقات</span> 🚀
            </motion.h1>

            <motion.p variants={textItemVariants} className="student-text-body max-w-xl pr-0.5 pt-1.5 sm:pt-2 leading-relaxed">
              تابع تسليم مشاريع التخرج والتطبيقات الميدانية المطلوبة لاعتماد الشهادات الأكاديمية والمهنية.
            </motion.p>
          </div>

          <motion.div variants={textItemVariants} className="flex items-center justify-around gap-2 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white/90 border border-white/80 backdrop-blur-md shadow-sm shrink-0">
            <div className="text-center px-3 border-l border-slate-200/60">
              <span className="block text-base sm:text-lg font-black text-amber-600">1</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold whitespace-nowrap">مشروع مطلوب</span>
            </div>
            <div className="text-center px-3">
              <span className="block text-base sm:text-lg font-black text-[#0D5C3A]">1</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold whitespace-nowrap">مشروع معتمد</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((proj, idx) => (
          <motion.div
            key={proj.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + idx * 0.14, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 liquid-glass-card liquid-glass-hover space-y-5 student-card-accent"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/40 pb-4">
              <div className="space-y-1 min-w-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#0D5C3A] mb-1" style={{ textShadow: '0 1px 0px rgba(255,255,255,0.6)' }}>
                  <BookOpen className="w-3.5 h-3.5 text-[#0D5C3A]" />
                  <span>{proj.courseTitle}</span>
                </span>
                <h3 className="student-heading-h3">{proj.title}</h3>
              </div>

              {proj.status === 'pending' && (
                <span className="px-4 py-1.5 rounded-full text-xs font-black bg-amber-100/90 text-amber-800 border border-amber-200 flex items-center gap-1.5 shrink-0">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>الموعد النهائي: {proj.dueDate}</span>
                </span>
              )}

              {proj.status === 'approved' && (
                <span className="px-4 py-1.5 rounded-full text-xs font-black bg-emerald-100/90 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>معتمد - النتيجة: {proj.grade}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 font-bold leading-relaxed">{proj.description}</p>

            {proj.submittedFile && (
              <div className="p-3.5 sm:p-4 rounded-xl flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2.5 sm:gap-3 text-xs font-bold border border-slate-200/40 liquid-glass-inner">
                <div className="flex items-center gap-2 min-w-0 flex-1 max-w-full">
                  <Paperclip className="w-4 h-4 text-[#173A7C] shrink-0" />
                  <span className="text-slate-700 truncate min-w-0">الملف المستلم: <strong className="text-[#173A7C] truncate">{proj.submittedFile}</strong></span>
                </div>
                <button className="text-xs text-[#173A7C] font-black hover:underline flex items-center gap-1.5 shrink-0 whitespace-nowrap bg-blue-50/90 px-3.5 py-1.5 rounded-xl border border-blue-200/80 shadow-2xs">
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span>تحميل النسخة</span>
                </button>
              </div>
            )}

            {proj.feedback && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 font-black text-xs">
                  <MessageSquare className="w-4 h-4 text-[#5CB07C]" />
                  <span>ملاحظات وتقييم أستاذ المادة:</span>
                </div>
                <p className="text-xs text-emerald-900 font-bold mr-6">{proj.feedback}</p>
              </div>
            )}

            <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-500 font-extrabold">الدرجة المخصصة: {proj.maxGrade}</span>

              {proj.status === 'pending' && (
                <button
                  onClick={() => setActiveUploadModal(proj)}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-[#173A7C]/20 transition-all hover:-translate-y-0.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Upload className="w-4 h-4 shrink-0" />
                  <span>رفع مشروع التخرج</span>
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upload Modal */}
      {activeUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl p-6 sm:p-8 bg-white shadow-2xl border border-white/60 text-right space-y-5">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="student-heading-h3">{activeUploadModal.title}</h3>
                <p className="text-xs text-slate-400 font-bold">{activeUploadModal.courseTitle}</p>
              </div>
              <button onClick={() => setActiveUploadModal(null)} className="p-1 text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-8 rounded-2xl border-2 border-dashed border-[#173A7C]/30 bg-slate-50 text-center space-y-3">
              <Upload className="w-8 h-8 text-[#173A7C] mx-auto" />
              <p className="text-xs font-black text-slate-800">اسحب ملف المشروع النهائي هنا (PDF أو ZIP)</p>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button onClick={() => setActiveUploadModal(null)} className="px-4 py-2 text-xs font-bold text-slate-600">إلغاء</button>
              <button
                onClick={() => {
                  if (activeUploadModal) {
                    setProjects((prev) =>
                      prev.map((p) =>
                        p.id === activeUploadModal.id
                          ? { ...p, status: 'submitted', submittedFile: 'مشروع_التخرج_النهائي_عبدالله.pdf' }
                          : p
                      )
                    );
                  }
                  alert('تم رفع مشروع التخرج بنجاح وجاري المراجعة والأعتماد!');
                  setActiveUploadModal(null);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white rounded-xl text-xs font-black cursor-pointer"
              >
                تأكيد التسليم
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
