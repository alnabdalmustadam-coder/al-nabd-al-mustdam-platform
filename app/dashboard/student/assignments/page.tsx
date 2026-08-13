'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  courseTitle: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: string;
  maxGrade: string;
  description: string;
  instructorFeedback?: string;
  submittedFile?: string;
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

export default function StudentAssignmentsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [activeUploadModal, setActiveUploadModal] = useState<Assignment | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: 'asg-1',
      title: 'إعداد دراسة حالة: تطبيق قيم الحوار التسامحي في البيئة الوظيفية',
      courseTitle: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      dueDate: 'أغسطس 5، 2026',
      status: 'pending',
      maxGrade: '100 درجة',
      description: 'قم بإعداد تقرير مفصل لا يقل عن 3 صفحات يتضمن تحليلاً عملياً لكيفية تعزيز قيم التسامح والمسؤولية المجتمعية داخل بيئة العمل.',
    },
    {
      id: 'asg-2',
      title: 'واجب الوحدة الثانية: صياغة مبادرة مجتمعية للسلام الدائم',
      courseTitle: 'المهارات الأكاديمية والتفكير الناقد',
      dueDate: 'تم التسليم - 28 يوليو 2026',
      status: 'graded',
      grade: '98 / 100',
      maxGrade: '100 درجة',
      description: 'تقديم اقتراح لمشروع مجتمعي يهدف لنشر قيم التعايش الإيجابي بين فئات الشباب.',
      instructorFeedback: 'عمل ممتااااز جداً! تميزت المبادرة بالواقعية وإمكانية التطبيق المباشر. استمر في هذا التميز.',
      submittedFile: 'مبادرة_السلام_المجتمعي_عبدالله.pdf',
    },
    {
      id: 'asg-3',
      title: 'ملخص المقال الأكاديمي حول المواطنة الصالحة والمسؤولية الفردية',
      courseTitle: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      dueDate: 'تم التسليم - 29 يوليو 2026',
      status: 'submitted',
      maxGrade: '50 درجة',
      description: 'ملخص قراءة للورقة العلمية المنشورة في ملتقى المواطنة لعام 2026.',
      submittedFile: 'ملخص_الورقة_العلمية_عبدالله.pdf',
    },
  ]);

  const filteredAssignments = assignments.filter((a) => {
    if (filter === 'pending') return a.status === 'pending';
    if (filter === 'submitted') return a.status === 'submitted';
    if (filter === 'graded') return a.status === 'graded';
    return true;
  });

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
              ارفع ملفات الواجبات المطلوبة في مواعيدها المحسوبة، واطلع على ملاحظات وتقييمات الأساتذة فور صدورها.
            </motion.p>
          </div>

          {/* Quick Counter Stats */}
          <motion.div variants={textItemVariants} className="flex items-center justify-around gap-2 sm:gap-4 liquid-glass-inner p-3.5 sm:p-4 rounded-2xl shadow-xs">
            <div className="text-center px-2 sm:px-3 border-l border-slate-200/60">
              <span className="block text-base sm:text-lg font-black text-amber-600">1</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold whitespace-nowrap">واجب مطلوب</span>
            </div>
            <div className="text-center px-2 sm:px-3 border-l border-slate-200/60">
              <span className="block text-base sm:text-lg font-black text-[#173A7C]">1</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold whitespace-nowrap">قيد التصحيح</span>
            </div>
            <div className="text-center px-2 sm:px-3">
              <span className="block text-base sm:text-lg font-black text-[#0D5C3A]">98%</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold whitespace-nowrap">متوسط درجاتي</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Filter Tabs & Crisp White Text Header Line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-1.5 p-1.5 rounded-2xl border border-white/80 bg-white/90 backdrop-blur-md shadow-sm w-full sm:w-auto">
          {[
            { key: 'all', label: 'الكل (3)' },
            { key: 'pending', label: 'بانتظار التسليم (1)' },
            { key: 'submitted', label: 'قيد التقييم (1)' },
            { key: 'graded', label: 'تمت المراجعة (1)' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all duration-200 text-center cursor-pointer flex-1 sm:flex-none ${
                filter === tab.key
                  ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20'
                  : 'text-slate-600 hover:text-[#173A7C] hover:bg-white/60 bg-slate-50/60 sm:bg-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* High-Contrast Clear White Text on Dark Background */}
        <div className="text-[10px] sm:text-xs text-slate-200 font-extrabold flex items-center gap-1.5 drop-shadow-xs">
          <FileCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>الملفات المقبولة: PDF, DOCX (بحد أقصى 25 ميجابايت)</span>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4 sm:space-y-5">
        {filteredAssignments.map((assignment, idx) => (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + idx * 0.14, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 liquid-glass-card liquid-glass-hover space-y-5 student-card-accent"
          >
            {/* Header row with Spacing & Vivid Badges */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 border-b border-slate-200/60 pb-4">
              <div className="space-y-1.5 min-w-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#0D5C3A]" style={{ textShadow: '0 1px 0px rgba(255,255,255,0.6)' }}>
                  <BookOpen className="w-3.5 h-3.5 text-[#0D5C3A] shrink-0" />
                  <span>{assignment.courseTitle}</span>
                </span>
                <h3 className="student-heading-h3 pt-1">{assignment.title}</h3>
              </div>

              {/* Vivid Crisp Status Badges */}
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

            {/* Description */}
            <p className="text-xs text-slate-700 font-bold leading-relaxed">{assignment.description}</p>

            {/* Submitted File Info / Instructor Feedback - Engraved Containers */}
            {assignment.submittedFile && (
              <div className="p-3.5 rounded-2xl flex flex-wrap xs:flex-nowrap items-center justify-between gap-2.5 text-xs font-bold border border-slate-200/90 bg-slate-100/90 shadow-inner min-w-0 overflow-hidden">
                <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                  <Paperclip className="w-4 h-4 text-[#173A7C] shrink-0" />
                  <span className="text-slate-800 truncate min-w-0">
                    الملف المرفق: <strong className="text-[#173A7C] truncate inline-block align-bottom max-w-[130px] xs:max-w-none">{assignment.submittedFile}</strong>
                  </span>
                </div>
                <button className="text-[11px] text-[#173A7C] font-black hover:underline flex items-center gap-1 shrink-0 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs cursor-pointer">
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل</span>
                </button>
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

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-extrabold">الدرجة الكلية: {assignment.maxGrade}</span>

              {assignment.status === 'pending' && (
                <button
                  onClick={() => setActiveUploadModal(assignment)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-[#173A7C]/20 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>رفع الواجب الآن</span>
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

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
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              {/* Interactive Drag & Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = e.dataTransfer.files;
                  if (files && files[0]) {
                    setUploadedFileName(files[0].name);
                  }
                }}
                className="p-8 rounded-2xl border-2 border-dashed border-[#173A7C]/40 bg-slate-50/80 flex flex-col items-center justify-center text-center space-y-3 hover:border-[#173A7C] hover:bg-blue-50/30 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#173A7C]/10 to-emerald-500/10 text-[#173A7C] group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-[#173A7C]" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">اسحب الملف وادهن هنا أو اضغط للاختيار من جهازك</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">صيغ الملفات المسموحة: PDF, DOCX, ZIP (أقصى حجم 25MB)</p>
                </div>

                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  id="file-upload"
                  onChange={(e) => setUploadedFileName(e.target.files?.[0]?.name || '')}
                />
              </div>

              {uploadedFileName && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs font-black text-emerald-800">
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck className="w-4 h-4 text-[#5CB07C] shrink-0" />
                    <span className="truncate">{uploadedFileName}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded font-bold shrink-0">جاهز للإرسال</span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/60">
                <button
                  onClick={() => {
                    setActiveUploadModal(null);
                    setUploadedFileName('');
                  }}
                  className="px-5 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    if (!uploadedFileName) {
                      alert('يرجى اختيار ملف أولاً قبل الإرسال!');
                      return;
                    }
                    if (activeUploadModal) {
                      setAssignments((prev) =>
                        prev.map((a) =>
                          a.id === activeUploadModal.id
                            ? { ...a, status: 'submitted', submittedFile: uploadedFileName }
                            : a
                        )
                      );
                    }
                    alert(`تم تسليم الواجب بنجاح: (${uploadedFileName})!`);
                    setActiveUploadModal(null);
                    setUploadedFileName('');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-[#173A7C]/20 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>تأكيد الإرسال والرفع</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
