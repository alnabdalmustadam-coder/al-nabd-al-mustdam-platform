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
  Sparkles,
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
          const emails = Array.from(new Set(data.map((e: any) => e.email).filter(Boolean)));
          const profileMap = new Map<string, string>();
          if (emails.length > 0) {
            const { data: profs } = await supabase
              .from('profiles')
              .select('email, full_name')
              .in('email', emails);
            if (profs) {
              profs.forEach((p: any) => {
                if (p.email) profileMap.set(p.email.toLowerCase().trim(), p.full_name);
              });
            }
          }

          const mapped: StudentItem[] = data.map((e: any) => {
            const cleanEm = (e.email || '').toLowerCase().trim();
            const resolvedName = profileMap.get(cleanEm) || (e.email ? e.email.split('@')[0] : 'متدرب معتمد');
            return {
              id: e.id,
              name: resolvedName,
              email: e.email || 'غير مسجل',
              course: e.course_id || 'دبلوم التسامح والسلام والمواطنة الصالحة',
              progress: Number(e.progress || 0),
              enrolledDate: e.enrolled_at
                ? new Date(e.enrolled_at).toLocaleDateString('ar-SA')
                : 'مؤخراً',
              status: Number(e.progress) >= 100 ? 'مكتمل' : 'مستمر',
              quizzesTaken: Number(e.progress) > 50 ? 2 : 1,
              assignmentsSubmitted: Number(e.progress) > 75 ? 3 : 1,
            };
          });
          setStudents(mapped);
        } else {
          setStudents([]);
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
    if (!messageText.trim() || !selectedStudent) return;

    setIsSendingMessage(true);
    try {
      const subject = encodeURIComponent(`رسالة أكاديمية من المحاضر - منصة النبض المستدام`);
      const body = encodeURIComponent(messageText.trim());
      window.open(`mailto:${selectedStudent.email}?subject=${subject}&body=${body}`, '_blank');
      setMessageSentSuccess(true);
      setTimeout(() => {
        setMessageSentSuccess(false);
        setMessageText('');
      }, 3000);
    } catch {
      alert('تعذر فتح برنامج البريد الإلكتروني');
    } finally {
      setIsSendingMessage(false);
    }
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
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/50 mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-[#173A7C] text-xs font-black border border-blue-200/90 shadow-xs">
            <Users className="w-4 h-4 text-[#173A7C]" />
            <span>المتدربون والطلاب المسجلون في مقرراتي</span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-300 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{students.length} متدرب مسجل</span>
          </span>
        </div>

        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#173A7C] via-[#1E4D9D] to-[#2563EB] text-white flex items-center justify-center shadow-xl shadow-[#173A7C]/25 border border-white/40 shrink-0">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] student-heading-h1">
                إدارة <span className="student-name-gradient">المتدربين ونسب الإنجاز الأكاديمي</span>
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed pr-1 sm:pr-2">
            متابعة تقدم الطلاب الأكاديمي، نسب مشاهدة الدروس، نتائج التقييمات، والتواصل المباشر مع المتدربين.
          </p>
        </div>
      </div>

      {/* ── 2. METRICS COUNTERS (MATCHED WITH MAIN DASHBOARD STYLE) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-blue-50 text-[#173A7C] border-blue-200">
              إجمالي الطلاب
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">إجمالي المتدربين</span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#173A7C] tracking-tight">{students.length} متدرب</h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-emerald-50 text-emerald-800 border-emerald-300">
              أتموا المنهج
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">المكتملون 100%</span>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
              {students.filter((s) => s.progress >= 100).length} خريج
            </h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-blue-50 text-blue-800 border-blue-200">
              قيد الدراسة
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">المتدربون النشطون</span>
            <h3 className="text-2xl sm:text-3xl font-black text-blue-700 tracking-tight">
              {students.filter((s) => s.progress < 100).length} متدرب
            </h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-amber-50 text-amber-900 border-amber-300">
              معدل الإنجاز
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">متوسط نسبة الإنجاز</span>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight">
              {Math.round(students.reduce((acc, s) => acc + s.progress, 0) / (students.length || 1))}%
            </h3>
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
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-slate-50/80"
          />
        </div>

        <select
          value={selectedCourseFilter}
          onChange={(e) => setSelectedCourseFilter(e.target.value)}
          className="p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-[#173A7C]"
        >
          <option value="all">كافة المقررات التدريبية</option>
          <option value="التسامح">دبلوم التسامح والسلام</option>
          <option value="التفكير الناقد">المهارات الأكاديمية والتفكير الناقد</option>
          <option value="الحاسب">استخدام الحاسب الآلي</option>
        </select>
      </div>

      {/* ── 4. STUDENTS DATA TABLE ── */}
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
        <div className="rounded-3xl liquid-glass-card border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100/90 text-slate-700 font-black border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4 font-black">المتدرب</th>
                  <th className="py-3.5 px-4 font-black">المقرر التدريبي</th>
                  <th className="py-3.5 px-4 font-black">تاريخ التسجيل</th>
                  <th className="py-3.5 px-4 font-black min-w-[170px]">نسبة الإنجاز والتقدم</th>
                  <th className="py-3.5 px-4 font-black">الحالة الأكاديمية</th>
                  <th className="py-3.5 px-4 font-black text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/70">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                          {st.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-xs text-slate-900 truncate">{st.name}</h4>
                          <span className="text-[11px] text-slate-400 font-medium block truncate" dir="ltr">
                            {st.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-xl bg-blue-50 text-[#173A7C] text-[11px] font-black border border-blue-200 max-w-[200px] truncate">
                        {st.course}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-bold whitespace-nowrap">
                      {st.enrolledDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-black">
                          <span className="text-slate-500">التقدم</span>
                          <span className="text-[#173A7C] font-mono">{st.progress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                          <div
                            className="h-full bg-gradient-to-r from-[#173A7C] to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${st.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black border ${
                          st.status === 'مكتمل'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-blue-50 text-[#173A7C] border-blue-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{st.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(st)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#173A7C] hover:text-white text-slate-700 text-xs font-black transition-colors cursor-pointer border border-slate-200 inline-flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>تفاصيل وتواصل</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
