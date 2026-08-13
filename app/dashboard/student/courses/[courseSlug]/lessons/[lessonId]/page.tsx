'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  HelpCircle,
  MessageSquare,
  Paperclip,
  Play,
  ArrowRight,
  Send,
  Download,
  Bookmark,
  Award,
  ChevronLeft,
  BookOpen,
  Clock,
  Circle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  Trash2,
  ThumbsUp
} from 'lucide-react';
import { StudentVideoPlayer } from '@/components/student/student-video-player';
import {
  getCompletedLessons,
  saveCompletedLessons,
  getLessonNotes,
  saveLessonNote,
  saveQuizAttempt,
} from '@/lib/actions/student-actions';

/* ── Types ── */
interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  isCurrent?: boolean;
  videoUrl: string;
  type?: 'video' | 'quiz' | 'article';
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export default function StudentLessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = (params?.courseSlug as string) || 'diploma-tolerance-citizenship';
  const lessonId = (params?.lessonId as string) || 'lesson-1';

  const [activeTab, setActiveTab] = useState<'notes' | 'attachments' | 'quiz' | 'discussion'>('notes');
  const [userNote, setUserNote] = useState('');
  const [notesList, setNotesList] = useState<{ id: string; text: string; date: string }[]>([
    { id: '1', text: '[02:15] ملاحظة مهمة: التسامح قيمة إسلامية أصيلة ترتبط بالعدالة والمواطنة الصالحة.', date: 'اليوم، 10:15 ص' },
  ]);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  /* ── Playlist Search Filter State ── */
  const [searchQuery, setSearchQuery] = useState('');

  /* ── Completion state ── */
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set(['lesson-1']));

  /* ── Collapsed chapters & mobile playlist state ── */
  const [collapsedChapters, setCollapsedChapters] = useState<Set<string>>(new Set());
  const [isMobilePlaylistOpen, setIsMobilePlaylistOpen] = useState(false);

  /* ── Discussion comments ── */
  const [discussionComments, setDiscussionComments] = useState<
    { id: string; author: string; avatar: string; role: string; content: string; date: string; likes: number }[]
  >([
    {
      id: 'c1',
      author: 'د. عبدالله الشمري',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'استشاري التسامح والسلام',
      content: 'أهلاً بكم جميعاً في هذا المساق. يسرني الإجابة على كافة تساؤلاتكم حول مفاهيم المواطنة الإيجابية.',
      date: 'منذ ساعتين',
      likes: 12,
    },
    {
      id: 'c2',
      author: 'سارة خالد',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      role: 'متدربة',
      content: 'شرح رائع جداً للمفهوم الأكاديمي للتسامح. هل توجد مراجع إضافية حول الحوار الفعال؟',
      date: 'منذ 45 دقيقة',
      likes: 4,
    },
  ]);
  const [newCommentText, setNewCommentText] = useState('');

  const chapters: Chapter[] = [
    {
      id: 'chap-1',
      title: 'الفصل الأول: المفاهيم الأساسية للتسامح والمواطنة',
      lessons: [
        { id: 'lesson-1', title: 'مدخل إلى قيم التسامح والسلام', duration: '15 دقيقة', isCompleted: true, videoUrl: 'https://www.youtube.com/watch?v=1BEWMhAuBd4', type: 'video' },
        { id: 'lesson-2', title: 'أبعاد المواطنة الصالحة والمسؤولية', duration: '20 دقيقة', isCompleted: false, videoUrl: 'https://www.youtube.com/watch?v=1BEWMhAuBd4', type: 'video' },
        { id: 'lesson-3', title: 'التعايش السلمي في المنظومة الأكاديمية', duration: '18 دقيقة', isCompleted: false, videoUrl: 'https://www.youtube.com/watch?v=1BEWMhAuBd4', type: 'article' },
      ],
    },
    {
      id: 'chap-2',
      title: 'الفصل الثاني: المهارات العملية للتكامل الاجتماعي',
      lessons: [
        { id: 'lesson-4', title: 'الحوار الفعال وبناء الجسور', duration: '25 دقيقة', isCompleted: false, videoUrl: 'https://www.youtube.com/watch?v=1BEWMhAuBd4', type: 'video' },
        { id: 'lesson-5', title: 'تطبيقات التسامح في البيئة المؤسسية', duration: '22 دقيقة', isCompleted: false, videoUrl: 'https://www.youtube.com/watch?v=1BEWMhAuBd4', type: 'quiz' },
      ],
    },
  ];

  /* ── Derived data ── */
  const allLessons = useMemo(() => chapters.flatMap((ch) => ch.lessons), []);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter(l => completedSet.has(l.id)).length;
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  const makeLessonUrl = (id: string) => `/dashboard/student/courses/${courseSlug}/lessons/${id}`;

  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return chapters;
    const q = searchQuery.toLowerCase();
    return chapters
      .map(chap => ({
        ...chap,
        lessons: chap.lessons.filter(l => l.title.toLowerCase().includes(q)),
      }))
      .filter(chap => chap.lessons.length > 0);
  }, [chapters, searchQuery]);

  /* ── Persistent State ── */
  useEffect(() => {
    setCompletedSet(getCompletedLessons(courseSlug));
    setNotesList(getLessonNotes(lessonId));
  }, [courseSlug, lessonId]);

  /* ── Handlers ── */
  const toggleChapter = (chapId: string) => {
    setCollapsedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapId)) next.delete(chapId);
      else next.add(chapId);
      return next;
    });
  };

  const handleToggleComplete = useCallback((lessonItemId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setCompletedSet(prev => {
      const next = new Set(prev);
      if (next.has(lessonItemId)) {
        next.delete(lessonItemId);
      } else {
        next.add(lessonItemId);

        const allFlat = chapters.flatMap(ch => ch.lessons);
        const idx = allFlat.findIndex(l => l.id === lessonItemId);
        if (idx >= 0 && idx < allFlat.length - 1) {
          const nextUncompleted = allFlat.slice(idx + 1).find(l => !next.has(l.id));
          if (nextUncompleted) {
            setTimeout(() => {
              router.push(makeLessonUrl(nextUncompleted.id));
            }, 600);
          }
        }
      }
      saveCompletedLessons(courseSlug, next);
      return next;
    });
  }, [router, courseSlug, chapters]);

  const handleAddNote = () => {
    if (!userNote.trim()) return;
    const updatedNotes = saveLessonNote(lessonId, userNote.trim());
    setNotesList(updatedNotes);
    setUserNote('');
  };

  const handleAddTimestampNote = (timestampStr: string) => {
    setActiveTab('notes');
    setUserNote(prev => `[${timestampStr}] ` + prev);
  };

  const handleQuizSubmit = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) score += 50;
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    saveQuizAttempt(lessonId, score);
  };

  const handlePostComment = () => {
    if (!newCommentText.trim()) return;
    const newC = {
      id: `c_${Date.now()}`,
      author: 'طالب معتمد',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      role: 'متدرب',
      content: newCommentText.trim(),
      date: 'الآن',
      likes: 0,
    };
    setDiscussionComments([newC, ...discussionComments]);
    setNewCommentText('');
  };

  const quizQuestions = [
    {
      id: 1,
      question: 'ما هي الركيزة الأساسية لترسيخ قيم التسامح والمواطنة الصالحة؟',
      options: ['الالتزام بالحوار الفعال والعدالة', 'التغاضي السلبي بدون حوار', 'تحديد الصلاحيات الفردية فقط', 'تجنب المسؤولية الاجتماعية'],
      correctIndex: 0,
    },
    {
      id: 2,
      question: 'أي من العناصر التالية يعتبر مقياساً رئيساً للتميز الأكاديمي في المواطنة؟',
      options: ['المشاركة الإيجابية والاحترام المتبادل', 'الانعزال الأكاديمي', 'تجاهل اللوائح', 'العمل الفردي فقط'],
      correctIndex: 0,
    },
  ];

  return (
    <div className="w-full pt-2 sm:pt-0 sm:-mt-2 sm:-mb-10 font-[family-name:var(--font-cairo)] text-white" dir="rtl">
      {/* Top Breadcrumb Navigation: BORDERLESS WHITE TEXT ONLY */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 text-[10.5px] sm:text-xs font-bold mb-3.5 sm:mb-4 min-w-0">
        <Link
          href="/dashboard/student"
          className="inline-flex items-center gap-1 sm:gap-1.5 text-white hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 font-black"
        >
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
          <span>العودة للوحة التحكم</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-1.5 text-white/90 min-w-0 font-bold">
          <Link href="/dashboard/student/courses" className="text-white hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0">
            الدورات التدريبية
          </Link>
          <ChevronLeft className="w-3 h-3 text-white/60 shrink-0" />
          <span className="text-white font-extrabold truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none whitespace-nowrap">
            دبلوم التسامح والسلام
          </span>
        </div>
      </div>

      {/* ===== SINGLE UNIFIED MASTER CARD CONTAINER WITH REDUCED TRANSPARENCY (bg-white/85) ===== */}
      <div className="w-full bg-white/85 backdrop-blur-2xl border border-white/60 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden p-2 sm:p-5 mb-6 sm:mb-8 text-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* ── RIGHT COLUMN (RTL Right, lg:col-span-4): Playlist Index (DESKTOP ONLY) ── */}
          <div className="hidden lg:flex lg:col-span-4 xl:col-span-4 flex-col justify-between space-y-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
            {/* Header & Overall Progress */}
            <div className="space-y-3 pb-3 border-b border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-2 rounded-xl bg-[#173A7C] text-white shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="student-heading-h3 !text-sm truncate">فهرس المساق والدروس</h3>
                    <p className="text-[11px] text-slate-500 font-bold">{completedLessons} من {totalLessons} مكتمل</p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#173A7C] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg shrink-0">
                  %{progressPercent}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#5CB07C] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Search Bar */}
              <div className="relative pt-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في الدروس..."
                  className="w-full text-xs font-bold py-2 pr-9 pl-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#173A7C]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-2.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Chapters & Lessons Accordion List */}
            <div
              className="flex-1 overflow-y-auto space-y-3 max-h-[580px] lg:max-h-[700px] pr-0.5"
              style={{ scrollbarWidth: 'thin' }}
            >
              {filteredChapters.map((chap, chIdx) => {
                const isChapCollapsed = collapsedChapters.has(chap.id);
                const chapCompletedCount = chap.lessons.filter(l => completedSet.has(l.id)).length;

                return (
                  <div key={chap.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                    <button
                      onClick={() => toggleChapter(chap.id)}
                      className="w-full p-2.5 text-right flex items-center justify-between gap-2 bg-slate-100/90 hover:bg-slate-100 transition-colors cursor-pointer border-b border-slate-200"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex items-center justify-center w-5 h-5 rounded-lg bg-[#173A7C] text-white text-[10px] font-black shrink-0">
                          {chIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {chap.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {chapCompletedCount}/{chap.lessons.length}
                        </span>
                        {isChapCollapsed ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {!isChapCollapsed && (
                      <div className="p-1.5 space-y-1.5 bg-white">
                        {chap.lessons.map((les) => {
                          const isCurrent = les.id === lessonId;
                          const isDone = completedSet.has(les.id);

                          return (
                            <div
                              key={les.id}
                              className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                                isCurrent
                                  ? 'bg-[#173A7C] text-white border-[#173A7C] shadow-xs'
                                  : isDone
                                  ? 'bg-emerald-50/90 text-slate-800 border-emerald-200/90'
                                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <button
                                onClick={(e) => handleToggleComplete(les.id, e)}
                                className="shrink-0 cursor-pointer"
                                title={isDone ? 'إلغاء الإكمال' : 'تحديد كمكتمل'}
                              >
                                {isDone ? (
                                  <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                ) : (
                                  <Circle className={`w-4 h-4 ${isCurrent ? 'text-white/60' : 'text-slate-300'}`} />
                                )}
                              </button>

                              <Link
                                href={makeLessonUrl(les.id)}
                                className="flex-1 flex items-center justify-between gap-2 min-w-0 cursor-pointer"
                              >
                                <span className={`text-xs font-bold truncate ${isCurrent ? 'text-white font-extrabold' : 'text-slate-800'}`}>
                                  {les.title}
                                </span>

                                <div className="flex items-center gap-1 shrink-0">
                                  <span className={`text-[10px] font-mono ${isCurrent ? 'text-blue-200' : 'text-slate-400'}`}>
                                    {les.duration}
                                  </span>
                                </div>
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Footer Info */}
            <div className="pt-2 border-t border-slate-200 text-center">
              <span className="text-[11px] font-bold text-[#5CB07C]">
                منصة النبض المستدام — تتبع التحصيل الأكاديمي تلقائياً ✓
              </span>
            </div>
          </div>

          {/* ── LEFT COLUMN (RTL Left, lg:col-span-8): Clean Video Player ── */}
          <div className="col-span-1 lg:col-span-8 xl:col-span-8 flex flex-col justify-between w-full">
            <StudentVideoPlayer
              lessonId={lessonId}
              lessonTitle={
                allLessons.find((les) => les.id === lessonId)?.title ||
                'مدخل إلى قيم التسامح والسلام'
              }
              videoUrl={
                allLessons.find((les) => les.id === lessonId)?.videoUrl ||
                'https://www.youtube.com/watch?v=1BEWMhAuBd4'
              }
              onLessonComplete={() => handleToggleComplete(lessonId)}
              nextLessonUrl={nextLesson ? makeLessonUrl(nextLesson.id) : undefined}
              prevLessonUrl={prevLesson ? makeLessonUrl(prevLesson.id) : undefined}
              onOpenLessonsDrawer={() => setIsMobilePlaylistOpen(true)}
              onAddNoteAtTimestamp={handleAddTimestampNote}
              isCompleted={completedSet.has(lessonId)}
              onToggleComplete={() => handleToggleComplete(lessonId)}
            />
          </div>

        </div>
      </div>

      {/* ===== BOTTOM INTERACTIVE TABS WORKSPACE WITH REDUCED TRANSPARENCY (bg-white/85) ===== */}
      <div className="w-full bg-white/85 backdrop-blur-2xl border border-white/60 rounded-3xl p-4 sm:p-7 shadow-xl space-y-6 text-slate-800">
        {/* Navigation Tabs Bar: EXACT EQUAL SIZE (grid-cols-2 sm:grid-cols-4) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab('notes')}
            className={`w-full h-11 sm:h-12 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-[#173A7C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">الملاحظات ({notesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('attachments')}
            className={`w-full h-11 sm:h-12 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'attachments'
                ? 'bg-[#173A7C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Paperclip className="w-4 h-4 shrink-0" />
            <span className="truncate">الملحقات (2)</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`w-full h-11 sm:h-12 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-[#173A7C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">اختبار الدرس</span>
          </button>

          <button
            onClick={() => setActiveTab('discussion')}
            className={`w-full h-11 sm:h-12 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'discussion'
                ? 'bg-[#173A7C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="truncate">المناقشات ({discussionComments.length})</span>
          </button>
        </div>

        {/* Tab 1: Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="student-heading-h3 !text-xs sm:!text-sm flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#5CB07C]" />
                تدوين ملاحظات خاصة بهذا الدرس
              </h4>
            </div>

            <div className="space-y-3">
              <textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="اكتب ملاحظاتك الهامة هنا... يمكنك الاستعانة بزر [ملاحظة ⏱️] بأعلى المشغل لربط الملاحظة بدقيقة محددة."
                className="w-full text-xs sm:text-sm font-medium p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#173A7C] min-h-[90px] resize-y"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddNote}
                  disabled={!userNote.trim()}
                  className="px-5 py-2 bg-[#5CB07C] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>حفظ الملاحظة</span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {notesList.map((note) => (
                <div
                  key={note.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {note.text}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400">{note.date}</span>
                  </div>
                  <button
                    onClick={() => setNotesList(notesList.filter((n) => n.id !== note.id))}
                    className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 cursor-pointer"
                    title="حذف الملاحظة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Attachments */}
        {activeTab === 'attachments' && (
          <div className="space-y-4">
            <h4 className="student-heading-h3 !text-xs sm:!text-sm flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-[#173A7C]" />
              الملفات والمكتسبات المرفقة بالدرس
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-lg bg-blue-100 text-[#173A7C] shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs sm:text-sm">حقيبة الدرس الأول - عرض التقديم.pdf</h5>
                    <p className="text-[11px] text-slate-500">حجم الملف: 4.2 ميجابايت · PDF</p>
                  </div>
                </div>
                <button className="p-2 rounded-lg bg-[#173A7C] text-white hover:bg-[#1E4D9D] transition-colors cursor-pointer shrink-0">
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-lg bg-emerald-100 text-[#5CB07C] shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs sm:text-sm">دليل المهارات والتطبيقات العملية.pdf</h5>
                    <p className="text-[11px] text-slate-500">حجم الملف: 1.8 ميجابايت · PDF</p>
                  </div>
                </div>
                <button className="p-2 rounded-lg bg-[#173A7C] text-white hover:bg-[#1E4D9D] transition-colors cursor-pointer shrink-0">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Quiz */}
        {activeTab === 'quiz' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="student-heading-h3 !text-xs sm:!text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                اختبار تقييمي قصير لمخرجات الدرس
              </h4>
              {quizSubmitted && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                  النتيجة: %{quizScore}
                </span>
              )}
            </div>

            <div className="space-y-4">
              {quizQuestions.map((q, qIdx) => (
                <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <h5 className="student-heading-h3 !text-xs sm:!text-sm">
                    السؤال {qIdx + 1}: {q.question}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[qIdx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx })}
                          className={`p-2.5 rounded-lg text-right text-xs font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-[#173A7C] text-white border-[#173A7C]'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                  className="px-5 py-2.5 bg-[#173A7C] text-white rounded-xl text-xs font-bold hover:bg-[#1E4D9D] transition-all disabled:opacity-50 cursor-pointer"
                >
                  اعتماد إجابات الاختبار
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Discussion */}
        {activeTab === 'discussion' && (
          <div className="space-y-5">
            <h4 className="student-heading-h3 !text-xs sm:!text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              مجتمع النقاش والأسئلة حول الدرس
            </h4>

            <div className="space-y-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="اطرح سؤالك هنا على المدرب وزملائك..."
                className="w-full text-xs font-medium p-3 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#173A7C] min-h-[70px]"
              />
              <div className="flex justify-end">
                <button
                  onClick={handlePostComment}
                  disabled={!newCommentText.trim()}
                  className="px-4 py-2 bg-[#173A7C] text-white rounded-lg text-xs font-bold hover:bg-[#1E4D9D] transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>نشر التعليق</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {discussionComments.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={c.avatar} alt={c.author} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                      <div>
                        <h6 className="text-xs font-bold text-[#173A7C]">{c.author}</h6>
                        <span className="text-[10px] font-bold text-[#5CB07C]">{c.role}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{c.date}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed pr-9">
                    {c.content}
                  </p>
                  <div className="flex justify-end pt-1">
                    <button className="text-[10px] text-slate-400 hover:text-[#173A7C] font-bold flex items-center gap-1 cursor-pointer">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{c.likes} إعجاب</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Slide-Over Full-Screen Lessons Drawer (Mobile Only) ── */}
      <AnimatePresence>
        {isMobilePlaylistOpen && (
          <div className="lg:hidden fixed inset-0 z-[1100]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobilePlaylistOpen(false)}
              className="fixed inset-0 bg-slate-950/70"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-[1200] w-[90vw] max-w-sm h-full p-4 flex flex-col font-[family-name:var(--font-cairo)] text-right overflow-hidden bg-white text-slate-800 shadow-2xl"
            >
              {/* Header & Overall Progress */}
              <div className="space-y-2.5 pb-3 border-b border-slate-200 shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-[#173A7C] text-white shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="student-heading-h3 !text-xs sm:!text-sm truncate">فهرس دروس المساق</h3>
                      <p className="text-[10px] text-slate-500 font-bold">{completedLessons} من {totalLessons} مكتمل</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-black text-[#173A7C] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                      %{progressPercent}
                    </span>
                    <button
                      onClick={() => setIsMobilePlaylistOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg shrink-0 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                  <div
                    className="h-full rounded-full bg-[#5CB07C] transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Search Bar */}
                <div className="relative pt-0.5">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث في دروس المساق..."
                    className="w-full text-xs font-bold py-1.5 pr-8 pl-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#173A7C]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lessons List */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2.5 min-h-0">
                {filteredChapters.map((chap, chIdx) => {
                  const isChapCollapsed = collapsedChapters.has(chap.id);
                  const chapCompletedCount = chap.lessons.filter(l => completedSet.has(l.id)).length;

                  return (
                    <div key={chap.id} className="space-y-1">
                      <button
                        onClick={() => toggleChapter(chap.id)}
                        className="w-full text-xs font-bold text-[#173A7C] p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between gap-2 text-right cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex items-center justify-center w-5 h-5 rounded bg-[#173A7C] text-white text-[10px] font-bold shrink-0">
                            {chIdx + 1}
                          </span>
                          <span className="truncate">{chap.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {chapCompletedCount}/{chap.lessons.length}
                          </span>
                          {isChapCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                      </button>

                      {!isChapCollapsed && (
                        <div className="space-y-1 pt-1">
                          {chap.lessons.map((les) => {
                            const isCurrentLesson = les.id === lessonId;
                            const isDone = completedSet.has(les.id);
                            return (
                              <div key={les.id} className="flex items-center gap-1.5">
                                <button
                                  onClick={(e) => handleToggleComplete(les.id, e)}
                                  className="shrink-0 p-0.5 rounded-full cursor-pointer"
                                  title={isDone ? 'إلغاء الإكمال' : 'تحديد كمكتمل'}
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-slate-300" />
                                  )}
                                </button>
                                <Link
                                  href={makeLessonUrl(les.id)}
                                  onClick={() => setIsMobilePlaylistOpen(false)}
                                  className={`flex-1 flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all min-w-0 ${
                                    isCurrentLesson
                                      ? 'bg-[#173A7C] text-white shadow-xs'
                                      : isDone
                                      ? 'text-slate-600 bg-emerald-50/70 border border-emerald-200/70'
                                      : 'text-slate-700 bg-slate-50 border border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <Play className={`w-3 h-3 shrink-0 ${isCurrentLesson ? 'text-white' : 'text-slate-400'}`} />
                                    <span className="truncate">{les.title}</span>
                                  </div>
                                  <span className={`text-[10px] shrink-0 ${isCurrentLesson ? 'text-blue-200' : 'text-slate-400'}`}>{les.duration}</span>
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
