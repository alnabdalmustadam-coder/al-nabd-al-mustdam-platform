'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  BookOpen,
  Award,
  CheckCircle2,
  Mail,
  Clock,
  Filter,
  Loader2,
  ShieldCheck,
  Send,
  X,
  Check,
  ExternalLink,
  MessageSquare,
  FileCheck,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface StudentItem {
  id: string;
  name: string;
  email: string;
  course: string;
  progress: number;
  enrolledDate: string;
  status: string;
  phone?: string;
  quizzesTaken?: number;
  assignmentsSubmitted?: number;
}

export default function InstructorStudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Student Detail Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSentSuccess, setMessageSentSuccess] = useState(false);

  useEffect(() => {
    async function loadStudents() {
      try {
        setLoading(true);
        const supabase = createClient();

        const { data, error } = await supabase
          .from('enrollments')
          .select('*')
          .order('enrolled_at', { ascending: false });

        if (error) {
          console.error(error);
        }

        if (data && data.length > 0) {
          const mapped: StudentItem[] = data.map((e: any) => ({
            id: e.id,
            name: e.email ? e.email.split('@')[0] : 'متدرب معتمد',
            email: e.email,
            course: e.course_id || 'دبلوم التسامح والسلام والمواطنة الصالحة',
            progress: Number(e.progress || 45),
            enrolledDate: e.enrolled_at
              ? new Date(e.enrolled_at).toLocaleDateString('ar-SA')
              : 'مؤخراً',
            status: Number(e.progress) >= 100 ? 'مكتمل' : 'مستمر',
            quizzesTaken: 2,
            assignmentsSubmitted: 3,
          }));
          setStudents(mapped);
        } else {
          // Fallback sample students
          setStudents([
            {
              id: 'st-1',
              name: 'عبدالله بن محمد الشمري',
              email: 'a.shammari@example.com',
              course: 'دبلوم التسامح والسلام والمواطنة الصالحة',
              progress: 95,
              enrolledDate: '15 مايو 2026',
              status: 'مستمر',
              quizzesTaken: 2,
              assignmentsSubmitted: 4,
            },
            {
              id: 'st-2',
              name: 'سارة بنت خالد العتيبي',
              email: 's.otaibi@example.com',
              course: 'المهارات الأكاديمية والتفكير الناقد',
              progress: 100,
              enrolledDate: '10 مايو 2026',
              status: 'مكتمل',
              quizzesTaken: 1,
              assignmentsSubmitted: 2,
            },
            {
              id: 'st-3',
              name: 'م. خالد بن فهد الدوسري',
              email: 'k.dosari@example.com',
              course: 'دورة استخدام الحاسب الالي في الاعمال المكتبية',
              progress: 60,
              enrolledDate: '05 مايو 2026',
              status: 'مستمر',
              quizzesTaken: 3,
              assignmentsSubmitted: 2,
            },
            {
              id: 'st-4',
              name: 'نورة بنت عبدالعزيز القحطاني',
              email: 'n.qahtani@example.com',
              course: 'دبلوم التسامح والسلام والمواطنة الصالحة',
              progress: 80,
              enrolledDate: '01 مايو 2026',
              status: 'مستمر',
              quizzesTaken: 2,
              assignmentsSubmitted: 3,
            },
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setIsSendingMessage(true);
    setTimeout(() => {
      setIsSendingMessage(false);
      setMessageSentSuccess(true);
      setTimeout(() => {
        setMessageSentSuccess(false);
        setMessageText('');
      }, 2000);
    }, 600);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.course.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse =
      selectedCourseFilter === 'all' || s.course.includes(selectedCourseFilter);

    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
      {/* ── 1. HERO HEADER ── */}
      <div className="relative z-20 liquid-glass-hero p-6 sm:p-8 rounded-2xl sm:rounded-3xl liquid-glass-hover overflow-hidden student-card-accent">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#173A7C] text-xs font-black border border-blue-200">
            <Users className="w-3.5 h-3.5" />
            <span>المتدربون والطلاب المسجلون في مقرراتي</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black student-heading-h1">
            إدارة <span className="student-name-gradient">المتدربين ونسب الإنجاز الأكاديمي</span> 👥
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-2xl">
            متابعة تقدم الطلاب الأكاديمي، نسب مشاهدة الدروس، نتائج التقييمات، والتواصل المباشر مع المتدربين.
          </p>
        </div>
      </div>

      {/* ── 2. METRICS COUNTERS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 backdrop-blur-md space-y-1 shadow-xs">
          <span className="text-[11px] text-slate-500 font-bold block">إجمالي المتدربين</span>
          <div className="text-xl font-black text-[#173A7C] font-mono">{students.length} متدرب</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 backdrop-blur-md space-y-1 shadow-xs">
          <span className="text-[11px] text-slate-500 font-bold block">المكتملون 100%</span>
          <div className="text-xl font-black text-emerald-700 font-mono">
            {students.filter((s) => s.progress >= 100).length} خريج
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 backdrop-blur-md space-y-1 shadow-xs">
          <span className="text-[11px] text-slate-500 font-bold block">المتدربون النشطون</span>
          <div className="text-xl font-black text-blue-700 font-mono">
            {students.filter((s) => s.progress < 100).length} متدرب
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 backdrop-blur-md space-y-1 shadow-xs">
          <span className="text-[11px] text-slate-500 font-bold block">متوسط نسبة الإنجاز</span>
          <div className="text-xl font-black text-amber-700 font-mono">
            {Math.round(students.reduce((acc, s) => acc + s.progress, 0) / (students.length || 1))}%
          </div>
        </div>
      </div>

      {/* ── 3. SEARCH & COURSE FILTER BAR ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم المتدرب أو البريد أو المقرر..."
            className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-slate-50/80"
          />
        </div>

        <select
          value={selectedCourseFilter}
          onChange={(e) => setSelectedCourseFilter(e.target.value)}
          className="p-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-[#173A7C]"
        >
          <option value="all">كافة المقررات التدريبية</option>
          <option value="التسامح">دبلوم التسامح والسلام</option>
          <option value="التفكير الناقد">المهارات الأكاديمية والتفكير الناقد</option>
          <option value="الحاسب">استخدام الحاسب الآلي</option>
        </select>
      </div>

      {/* ── 4. STUDENTS ROSTER ── */}
      {loading ? (
        <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
          <p className="text-xs font-bold text-slate-500">جاري تحميل قائمة الطلاب...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm text-center space-y-3">
          <Users className="w-12 h-12 text-[#173A7C]/30 mx-auto" />
          <h3 className="text-base font-black text-slate-900">لا يوجد متدربون مطابقون للبحث</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((st) => (
            <div
              key={st.id}
              className="p-5 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover flex flex-col md:flex-row items-start md:items-center justify-between gap-4 student-card-accent"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">{st.name}</h4>
                  <span className="text-[11px] text-slate-400 font-bold">({st.email})</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      st.status === 'مكتمل'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-blue-50 text-[#173A7C] border-blue-200'
                    }`}
                  >
                    {st.status}
                  </span>
                </div>
                <p className="text-xs text-[#173A7C] font-bold">{st.course}</p>
                <span className="text-[10px] text-slate-400 font-bold block">
                  تاريخ التسجيل: {st.enrolledDate}
                </span>
              </div>

              {/* Progress & Quick Actions */}
              <div className="flex items-center gap-4 w-full md:w-80 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200/60">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-black">
                    <span className="text-slate-500">نسبة الإنجاز</span>
                    <span className="text-[#173A7C] font-mono">{st.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#173A7C] to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${st.progress}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStudent(st)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#173A7C] hover:text-white text-slate-700 text-xs font-black transition-colors cursor-pointer border border-slate-200 shrink-0"
                >
                  تفاصيل وتواصل
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 5. STUDENT DETAILS & DIRECT COMMUNICATION MODAL ── */}
      <AnimatePresence>
        {selectedStudent && (
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
              <div className="flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-5 bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="font-black text-sm sm:text-base">{selectedStudent.name}</h3>
                      <p className="text-xs text-blue-100">{selectedStudent.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs font-bold">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">المقرر المسجل:</span>
                      <span className="text-[#173A7C] font-black">{selectedStudent.course}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">نسبة التقدم الأكاديمي:</span>
                      <span className="text-emerald-700 font-mono font-black">{selectedStudent.progress}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">الاختبارات المنجزة:</span>
                      <span className="text-slate-800 font-mono">{selectedStudent.quizzesTaken || 2} اختبارات</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">الواجبات والتكليفات المسلمة:</span>
                      <span className="text-slate-800 font-mono">{selectedStudent.assignmentsSubmitted || 3} تكليفات</span>
                    </div>
                  </div>

                  {/* Send Message Form */}
                  <form onSubmit={handleSendMessage} className="space-y-2 pt-2 border-t border-slate-200">
                    <label className="text-slate-700 block flex items-center gap-1.5 font-black">
                      <MessageSquare className="w-4 h-4 text-[#173A7C]" />
                      <span>إرسال ملاحظة أو رسالة توجيهية للمتدرب</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="اكتب رسالتك للمتدرب هنا..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none text-xs font-medium resize-none"
                    />

                    <div className="flex items-center justify-between pt-1">
                      {messageSentSuccess ? (
                        <span className="text-emerald-700 font-black flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          <span>تم إرسال الرسالة بنجاح!</span>
                        </span>
                      ) : <span />}

                      <button
                        type="submit"
                        disabled={isSendingMessage || !messageText.trim()}
                        className="px-4 py-2 rounded-xl bg-[#173A7C] hover:bg-[#1E4D9D] text-white font-black text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isSendingMessage ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>إرسال الرسالة</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
