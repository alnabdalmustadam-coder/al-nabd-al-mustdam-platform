'use client';

import React, { useState } from 'react';
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

  const glassNeumorphicCard = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(241,245,249,0.90) 100%)',
    backdropFilter: 'blur(16px) saturate(1.4)',
    WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08), 0 10px 28px rgba(15, 23, 42, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.6)',
  };

  const glassNeumorphicInset = {
    background: 'rgba(241, 245, 249, 0.7)',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
  };

  return (
    <div className="space-y-6" dir="rtl">

      {/* Header Banner - Ultra Premium Glass style matching Main Dashboard */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 animate-fade-in-up ultra-card-hover" style={glassNeumorphicCard}>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 pr-2 border-r-4 border-[#173A7C]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#173A7C] text-xs font-semibold border border-blue-200">
              <FileQuestion className="w-4 h-4 text-[#173A7C]" />
              <span>إدارة بنك الأسئلة والاختبارات الأكاديمية</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              إدارة بنك الاختبارات والأسئلة 📝
            </h1>
            <p className="text-xs text-slate-500 font-normal max-w-2xl leading-relaxed">
              بناء بنك الأسئلة، تحديد نسب النجاح، ربط الاختبارات بالمساقات، وأتمتة التصحيح الفوري.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#173A7C] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer border border-white/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء اختبار جديد ⚡</span>
          </button>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="rounded-2xl p-6 border space-y-4 transition-all ultra-card-hover relative overflow-hidden group"
            style={glassNeumorphicCard}
          >
            <div className="absolute top-0 right-0 left-0 h-1 bg-[#173A7C]" />
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 pr-2 border-r-3 border-[#173A7C]">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-[#173A7C] border border-blue-200">
                  {quiz.courseTitle}
                </span>
                <h3 className="font-bold text-base text-slate-900 leading-snug pr-1">{quiz.quizTitle}</h3>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-[10px] font-medium border shrink-0 ${quiz.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
              >
                {quiz.status === 'active' ? 'مفعل 🟢' : 'مسودة 🟡'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-2 border-t border-slate-200/50">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-500">عدد الأسئلة:</span>
                <span className="font-black font-mono text-[#173A7C]">{quiz.questionsCount} أسئلة</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-500">درجة النجاح:</span>
                <span className="font-black font-mono text-emerald-700">{quiz.passPercentage}%</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded-xl bg-[#173A7C] hover:bg-[#1E4D9D] text-white font-black text-xs shadow-md transition-all cursor-pointer">
                إدارة الأسئلة والإجابات 📝
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE QUIZ MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white text-slate-900 rounded-[32px] border border-slate-200 p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-black text-base text-slate-900">إنشاء اختبار أكاديمي جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
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
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#173A7C]"
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
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#173A7C]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 block">نسبة درجة النجاح المطلوبة (%)</label>
                <input
                  type="number"
                  value={passPercentage}
                  onChange={(e) => setPassPercentage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-black focus:outline-none focus:border-[#173A7C]"
                />
              </div>

              <div className="pt-3 flex gap-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-black cursor-pointer">
                  إلغاء
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-[#173A7C] text-white font-black shadow-lg cursor-pointer">
                  تأكيد وإضافة الاختبار ⚡
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
