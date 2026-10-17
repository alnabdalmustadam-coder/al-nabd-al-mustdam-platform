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
  ThumbsUp,
  Sparkles,
  Video as VideoIcon,
  ExternalLink,
  Layers,
  FileCheck,
  Loader2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { InternalQuizPanel } from '@/components/student/internal-quiz-panel';
import { StudentVideoPlayer } from '@/components/student/student-video-player';
import { CourseDocumentViewer, AttachmentPreview } from '@/components/student/course-document-viewer';
import { SatisfactionHeart } from '@/components/student/satisfaction-heart';
import { getCourseContent, isLessonUnlocked } from '@/lib/learning/course-content';
import {
  saveCompletedLessons,
  getLessonNotes,
  saveLessonNote,
} from '@/lib/actions/student-actions';
import { usePublicCourses } from '@/lib/hooks/use-public-courses';
import { findCourseByIdentifier } from '@/lib/public-courses';
import { CourseAttachment, QuizData, SubLessonItem } from '@/types';

/* ── Types ── */
interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  isCurrent?: boolean;
  videoUrl: string;
  type?: 'video' | 'pdf' | 'doc' | 'ppt' | 'quiz' | 'article';
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  quizData?: QuizData;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export default function StudentLessonPage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = (params?.courseSlug as string) || '';
  const courseSlug = rawSlug.replace(/^course-/, '');
  const lessonId = (params?.lessonId as string) || 'lesson-1';

  const { courses: catalog, loading: isLoadingCourse, error: courseError, reload } = usePublicCourses();
  const courseData = findCourseByIdentifier(catalog, courseSlug) || null;

  const [activeTab, setActiveTab] = useState<'notes' | 'attachments' | 'quiz' | 'discussion'>('notes');
  const [userNote, setUserNote] = useState('');
  const [notesList, setNotesList] = useState<{ id: string; text: string; date: string }[]>([
    { id: '1', text: '[02:15] ملاحظة هامة: تم استيعاب المفهوم الأساسي للدرس بنجاح.', date: 'اليوم، 10:15 ص' },
  ]);


  /* ── Playlist Search Filter State ── */
  const [searchQuery, setSearchQuery] = useState('');

  /* ── Completion state ── */
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());
  const [savingLessonId, setSavingLessonId] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [serverProgressPercent, setServerProgressPercent] = useState(0);
  const [completionPendingAssessment, setCompletionPendingAssessment] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [videoVerified, setVideoVerified] = useState(false);

  /* ── Collapsed chapters & mobile playlist state ── */
  const [collapsedChapters, setCollapsedChapters] = useState<Set<string>>(new Set());
  const [isMobilePlaylistOpen, setIsMobilePlaylistOpen] = useState(false);

  /* ── Discussion comments ── */
  const [discussionComments, setDiscussionComments] = useState<
    { id: string; author: string; avatar: string; role: string; content: string; date: string; likes: number }[]
  >([
    {
      id: 'c1',
      author: courseData?.instructor || 'د. محمد القحطاني',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'المدرب المعتمد',
      content: 'أهلاً بكم جميعاً في هذا البرنامج التدريبي المعتمد. يسرني الإجابة على استفساراتكم ومتابعة تقدمكم.',
      date: 'منذ ساعتين',
      likes: 12,
    },
    {
      id: 'c2',
      author: 'سارة خالد',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      role: 'متدربة',
      content: 'شرح متميز وواضح جداً! شكراً لكم.',
      date: 'منذ 45 دقيقة',
      likes: 4,
    },
  ]);
  const [newCommentText, setNewCommentText] = useState('');

  /* ── Build Chapters dynamically from live course curriculum ── */
  const chapters: Chapter[] = useMemo(() => {
    if (courseData && Array.isArray(courseData.curriculum) && courseData.curriculum.length > 0) {
      return courseData.curriculum.map((sec: any, sIdx: number) => {
        const itemTitle = sec.title || `الوحدة ${sIdx + 1}`;
        const itemUniqueId = sec.id || `sec-${sIdx + 1}`;

        let secLessons: Lesson[] = [];

        if (Array.isArray(sec.items) && sec.items.length > 0) {
          secLessons = sec.items.map((it: any, subIdx: number) => ({
            id: it.id || `sub-${sIdx + 1}-${subIdx + 1}`,
            title: it.title || `المقطع ${subIdx + 1}`,
            duration: it.duration || '15 دقيقة',
            isCompleted: false,
            videoUrl: it.videoUrl || '',
            type: it.type || 'video',
            fileUrl: it.fileUrl,
            fileName: it.fileName,
            fileSize: it.fileSize,
            quizData: it.quizData,
          }));
        } else if (Array.isArray(sec.lessons) && sec.lessons.length > 1) {
          secLessons = (sec.lessons as Array<string | SubLessonItem>).map((lesson, subIdx: number) => {
            const lessonData = typeof lesson === 'string' ? null : lesson;
            return {
              id: lessonData?.id || `sub-${sIdx + 1}-${subIdx + 1}`,
              title: lessonData?.title || String(lesson),
              duration: lessonData?.duration || '15 دقيقة',
              isCompleted: false,
              videoUrl: lessonData?.videoUrl || (subIdx === 0 ? (sec.videoUrl || '') : ''),
              type: lessonData?.type || 'video',
              fileUrl: lessonData?.fileUrl,
              fileName: lessonData?.fileName,
              fileSize: lessonData?.fileSize,
              quizData: lessonData?.quizData,
            };
          });
        } else {
          secLessons = [
            {
              id: itemUniqueId,
              title: itemTitle,
              duration: sec.duration || '20 دقيقة',
              isCompleted: false,
              videoUrl: sec.videoUrl || '',
              type: (sec.type as any) || 'video',
              fileUrl: sec.fileUrl,
              fileName: sec.fileName,
              fileSize: sec.fileSize,
              quizData: sec.quizData,
            },
          ];
        }

        return {
          id: `chap-${sIdx + 1}`,
          title: itemTitle,
          lessons: secLessons,
        };
      });
    }

    // Default Fallback chapter if curriculum is empty
    return [
      {
        id: 'chap-1',
        title: `الوحدة الأولى: مدخل إلى ${courseData?.title || 'الدورة'}`,
        lessons: [
          {
            id: 'lesson-1',
            title: 'المفاهيم الأساسية والأهداف التدريبية',
            duration: '15 دقيقة',
            isCompleted: true,
            videoUrl: '',
            type: 'video',
          },
        ],
      },
    ];
  }, [courseData]);

  /* ── Derived data ── */
  const allLessons = useMemo(() => chapters.flatMap((ch) => ch.lessons), [chapters]);
  
  const currentIndex = useMemo(() => {
    if (!allLessons || allLessons.length === 0) return -1;
    const exactMatch = allLessons.findIndex((l) => l.id === lessonId);
    if (exactMatch >= 0) return exactMatch;
    if (lessonId === 'lesson-1' || !lessonId) return 0;
    return -1;
  }, [allLessons, lessonId]);

  const currentLesson = currentIndex >= 0 ? allLessons[currentIndex] : null;
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = (currentIndex >= 0 && currentIndex < allLessons.length - 1) ? allLessons[currentIndex + 1] : null;

  const totalLessons = Math.max(1, allLessons.length);
  const completedLessons = allLessons.filter(l => completedSet.has(l.id)).length;
  const progressPercent = serverProgressPercent;

  const makeLessonUrl = (id: string) => `/dashboard/student/courses/${courseSlug}/lessons/${id}`;
  const cpd = courseData?.professionalDevelopment === true;
  const lessonAllowed = (id: string) => !cpd || (progressLoaded && isLessonUnlocked(allLessons.map((item) => item.id), completedSet, id));
  const currentAllowed = Boolean(currentLesson && lessonAllowed(currentLesson.id));
  const lessonContent = courseData ? getCourseContent(courseData).find((item) => item.id === currentLesson?.id) : null;

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

  // Set non-active chapters collapsed by default so modules open one by one
  useEffect(() => {
    if (chapters.length > 0) {
      const activeLessonId = currentLesson?.id || lessonId;
      const activeChap = chapters.find(ch => ch.lessons.some(l => l.id === activeLessonId));
      const activeChapId = activeChap ? activeChap.id : chapters[0]?.id;

      const collapsed = new Set<string>();
      chapters.forEach(ch => {
        if (ch.id !== activeChapId) {
          collapsed.add(ch.id);
        }
      });
      setCollapsedChapters(collapsed);
    }
  }, [chapters, lessonId, currentLesson?.id]);

  /* ── Dynamic Attachments Compilation ── */
  const allAttachments = useMemo(() => {
    const list: Array<{ id: string; title: string; fileUrl: string; fileSize?: string; fileType?: string }> = [];

    // 1. Course Level Attachments
    if (Array.isArray(courseData?.attachments)) {
      courseData.attachments.forEach((att) => {
        if (att.fileUrl) list.push(att);
      });
    }

    // 2. Section & Sub-lesson Attachments
    if (Array.isArray(courseData?.curriculum)) {
      courseData.curriculum.forEach((sec: any) => {
        const sectionLessons = getCourseContent(courseData).filter((item) => item.sectionId === (sec.id || `sec-${courseData.curriculum.indexOf(sec) + 1}`));
        if (sec.fileUrl && (!cpd || sectionLessons.every((item) => completedSet.has(item.id))) && !list.some((l) => l.fileUrl === sec.fileUrl)) {
          list.push({
            id: `sec-${sec.id || sec.title}`,
            title: sec.fileName || `${sec.title} - ملخص الوحدة`,
            fileUrl: sec.fileUrl,
            fileSize: sec.fileSize || 'PDF',
            fileType: sec.type || 'pdf',
          });
        }
        if (Array.isArray(sec.items)) {
          sec.items.forEach((it: any) => {
            if (it.fileUrl && (!cpd || (progressLoaded && isLessonUnlocked(allLessons.map((item) => item.id), completedSet, it.id))) && !list.some((l) => l.fileUrl === it.fileUrl)) {
              list.push({
                id: `item-${it.id || it.title}`,
                title: it.fileName || `${it.title} - المرفق`,
                fileUrl: it.fileUrl,
                fileSize: it.fileSize || 'PDF',
                fileType: it.type || 'pdf',
              });
            }
          });
        }
      });
    }

    return list;
  }, [courseData, cpd, completedSet, progressLoaded, allLessons]);


  useEffect(() => {
    const controller = new AbortController();
    setProgressLoaded(false);
    setVideoVerified(false);
    async function initProgress() {
      setNotesList(getLessonNotes(lessonId));

      try {
        const response = await fetch(
          `/api/courses/complete-lesson?courseId=${encodeURIComponent(courseSlug)}`,
          { cache: 'no-store', signal: controller.signal },
        );
        const result = await response.json();
        if (controller.signal.aborted) return;

        if (!response.ok || !result.success || !Array.isArray(result.completedLessonIds)) {
          throw new Error(result.message || 'تعذر تحميل تقدم الدورة');
        }

        const serverCompleted = new Set<string>(result.completedLessonIds);
        setCompletedSet(serverCompleted);
        setServerProgressPercent(Number(result.progress) || 0);
        setCompletionPendingAssessment(Boolean(result.completionPendingAssessment));
        saveCompletedLessons(courseSlug, serverCompleted);
        setCompletionError(null);
        setProgressLoaded(true);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Error syncing lesson progress on init:', err);
        setCompletionError(err instanceof Error ? err.message : 'تعذر تحميل تقدم الدورة');
      }
    }

    initProgress();
    return () => controller.abort();
  }, [courseSlug, lessonId, cpd]);

  const toggleChapter = (chapId: string) => {
    setCollapsedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapId)) {
        next.delete(chapId);
        return next;
      } else {
        const single = new Set<string>();
        chapters.forEach(c => {
          if (c.id !== chapId) single.add(c.id);
        });
        return single;
      }
    });
  };

  const handleToggleComplete = useCallback(async (lessonItemId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (completedSet.has(lessonItemId) || savingLessonId === lessonItemId) return;

    setSavingLessonId(lessonItemId);
    setCompletionError(null);

    try {
      const response = await fetch('/api/courses/complete-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: courseSlug,
          lessonId: lessonItemId,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذر حفظ إكمال الدرس');
      }

      const next = new Set(completedSet);
      next.add(lessonItemId);
      setCompletedSet(next);
      setServerProgressPercent(Number(result.progress) || 0);
      setCompletionPendingAssessment(Boolean(result.completionPendingAssessment));
      saveCompletedLessons(courseSlug, next);

      const allFlat = chapters.flatMap(ch => ch.lessons);
      const idx = allFlat.findIndex(l => l.id === lessonItemId);
      if (idx >= 0 && idx < allFlat.length - 1) {
        const nextUncompleted = allFlat.slice(idx + 1).find(l => !next.has(l.id));
        if (nextUncompleted) {
          setTimeout(() => {
            router.push(`/dashboard/student/courses/${courseSlug}/lessons/${nextUncompleted.id}`);
          }, 600);
        }
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      setCompletionError(error instanceof Error ? error.message : 'تعذر حفظ تقدم الدرس');
    } finally {
      setSavingLessonId(null);
    }
  }, [chapters, completedSet, courseSlug, router, savingLessonId]);

  const handleAddNote = () => {
    if (!userNote.trim()) return;
    const updatedNotes = saveLessonNote(lessonId, userNote.trim());
    setNotesList(updatedNotes);
    setUserNote('');
  };

  const handleAddTimestampNote = (timestampStr: string) => {
    setActiveTab('notes');
    setUserNote(prev => `[${timestampStr}] ` + prev);
    setTimeout(() => {
      const noteArea = document.getElementById('lesson-note-textarea');
      if (noteArea) {
        noteArea.focus();
        noteArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handlePostComment = () => {
    if (!newCommentText.trim()) return;
    const newC = {
      id: `c_${Date.now()}`,
      author: 'متدرب معتمد',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      role: 'متدرب',
      content: newCommentText.trim(),
      date: 'الآن',
      likes: 0,
    };
    setDiscussionComments([newC, ...discussionComments]);
    setNewCommentText('');
  };

  if (isLoadingCourse) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center space-y-4 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
        <p className="text-sm font-bold text-slate-600">جاري تحميل محتوى الدورة التدريبية...</p>
      </div>
    );
  }

  if (courseError || !courseData) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-5 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900">{courseError ? 'تعذر تحميل الدورة' : 'الدورة التدريبية غير متاحة'}</h2>
          <p className="text-xs text-slate-500 font-bold leading-relaxed">
            {courseError || 'لم نتمكن من العثور على الدورة التدريبية المطلوبة. يرجى التحقق من صحة الرابط أو الرجوع إلى قائمة دوراتك المسجلة.'}
          </p>
        </div>
        <Link
          href="/dashboard/student/courses"
          className="px-6 py-3 rounded-xl bg-[#173A7C] text-white text-xs font-black hover:bg-[#122e62] transition-colors shadow-md"
        >
          العودة إلى دوراتي
        </Link>
        {courseError && <button type="button" onClick={reload} className="font-bold text-[#173A7C] underline">إعادة المحاولة</button>}
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-5 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
        <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#173A7C] shadow-sm">
          <BookOpen className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900">الدرس المطلوب غير موجود</h2>
          <p className="text-xs text-slate-500 font-bold leading-relaxed">
            لم يتم العثور على الدرس المطلوب في هذه الدورة. قد يكون تم تحديث خطة الدورة التدريبية أو تعديل ترتيب المحتوى.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          {allLessons.length > 0 && (
            <Link
              href={`/dashboard/student/courses/${courseSlug}/lessons/${allLessons[0].id}`}
              className="px-5 py-2.5 rounded-xl bg-[#173A7C] text-white text-xs font-black hover:bg-[#122e62] transition-colors shadow-md"
            >
              الانتقال إلى أول درس متاح
            </Link>
          )}
          <Link
            href="/dashboard/student/courses"
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            العودة إلى قائمة الدورات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-1.5 sm:pt-2.5 -mt-1 sm:-mt-2 lg:-mt-[3.8vh] -mb-6 sm:-mb-10 font-[family-name:var(--font-cairo)] text-slate-900" dir="rtl">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold mb-2.5 sm:mb-3.5 min-w-0">
        <Link
          href="/dashboard/student"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-[#173A7C] hover:text-[#1E4D9D] border border-slate-200/80 shadow-xs transition-all whitespace-nowrap shrink-0 font-black"
        >
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#173A7C] shrink-0" />
          <span>العودة للوحة التحكم</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-1.5 text-slate-700 min-w-0 font-bold bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
          <Link href="/dashboard/student/courses" className="text-slate-700 hover:text-[#173A7C] transition-colors whitespace-nowrap shrink-0">
            الدورات التدريبية
          </Link>
          <ChevronLeft className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="text-[#173A7C] font-black truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none whitespace-nowrap">
            {courseData?.title || 'الدورة التدريبية'}
          </span>
        </div>
      </div>

      {/* Main Unified Container */}
      <div className="w-full bg-white/85 backdrop-blur-2xl border border-white/60 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden p-2 sm:p-5 mb-6 sm:mb-8 text-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Playlist Index (DESKTOP) */}
          <div className="hidden lg:flex lg:col-span-4 xl:col-span-4 flex-col justify-between space-y-3 bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 h-full max-h-[640px] xl:max-h-[720px]">
            <div className="space-y-3 pb-3 border-b border-slate-200 shrink-0">
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
                  placeholder="ابحث في الدروس والمقاطع..."
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

            {/* Chapters & Sub-Lessons Accordion */}
            <div
              className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
                      <div className="p-1.5 space-y-1.5 bg-white animate-fade-in-up">
                        {chap.lessons.map((les) => {
                          const isCurrent = les.id === (currentLesson?.id || lessonId);
                          const isDone = completedSet.has(les.id);
                          const isLocked = !lessonAllowed(les.id);

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
                                disabled={isDone || savingLessonId === les.id || cpd}
                                className="shrink-0 cursor-pointer disabled:cursor-default"
                                title={isDone ? 'الدرس مكتمل' : 'تحديد كمكتمل'}
                              >
                                {isDone ? (
                                  <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                ) : isLocked ? <Lock className="h-4 w-4 text-slate-400" /> : (
                                  <Circle className={`w-4 h-4 ${isCurrent ? 'text-white/60' : 'text-slate-300'}`} />
                                )}
                              </button>

                              <Link
                                href={makeLessonUrl(les.id)}
                                aria-disabled={isLocked}
                                onClick={(event) => { if (isLocked) { event.preventDefault(); setCompletionError('أكمل الدروس السابقة أولاً لفتح هذا الدرس'); } }}
                                className="flex-1 flex items-center justify-between gap-2 min-w-0 cursor-pointer"
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {les.type === 'pdf' ? (
                                    <FileText className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-emerald-300' : 'text-blue-600'}`} />
                                  ) : les.type === 'quiz' ? (
                                    <HelpCircle className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-amber-300' : 'text-amber-500'}`} />
                                  ) : (
                                    <VideoIcon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-blue-200' : 'text-slate-400'}`} />
                                  )}
                                  <span className={`text-xs font-bold truncate ${isCurrent ? 'text-white font-extrabold' : 'text-slate-800'}`}>
                                    {les.title}
                                  </span>
                                </div>

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

            <div className="pt-2 border-t border-slate-200 text-center shrink-0">
              <span className="text-[11px] font-bold text-[#5CB07C]">
                النبض المستدام — تسجيل التقدم ومزامنته تلقائياً ✓
              </span>
            </div>
          </div>

          {/* Video Player or Content Pane */}
          <div className="col-span-1 lg:col-span-8 xl:col-span-8 flex flex-col justify-between w-full">
            {cpd && currentAllowed && lessonContent?.requiredQuiz && <p className="mb-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs font-bold leading-6 text-blue-900">يتطلب إكمال هذا الدرس اجتياز الاختبار المرتبط به من تبويب «الاختبار والتقييم».</p>}
            {!currentAllowed ? <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <Lock className="h-10 w-10 text-blue-900" /><h3 className="text-base font-black text-slate-900">{progressLoaded ? 'هذا الدرس مغلق حالياً' : completionError ? 'تعذر تحميل تقدمك' : 'جاري التحقق من تقدمك'}</h3>
              <p className="text-sm text-slate-600">{progressLoaded ? 'أكمل الدروس السابقة بالترتيب لفتح المحتوى.' : completionError || 'يتم تحميل تقدم الدورة من حسابك.'}</p>
              {completionError && !progressLoaded && <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-xl bg-blue-900 px-5 py-3 text-xs font-bold text-white">إعادة تحميل الدرس</button>}
            </div> : currentLesson?.type === 'quiz' ? (
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-[#173A7C] to-slate-900 p-6 text-center text-white shadow-xl">
                <HelpCircle className="h-12 w-12 text-amber-300" />
                <h3 className="text-lg font-black">{currentLesson.title}</h3>
                <p className="text-xs leading-6 text-blue-100">أجب عن أسئلة الدرس وراجع نتيجتك بعد التسليم.</p>
                <button type="button" className="min-h-11 rounded-xl bg-white px-6 py-3 text-xs font-black text-blue-900"
                  onClick={() => { setActiveTab('quiz'); requestAnimationFrame(() => document.getElementById('internal-assessment')?.scrollIntoView({ behavior: 'smooth', block: 'start' })); }}>فتح الاختبار</button>
                {cpd && <button type="button" disabled={completedSet.has(currentLesson.id) || savingLessonId === currentLesson.id} onClick={() => void handleToggleComplete(currentLesson.id)} className="min-h-11 rounded-xl border border-white/30 px-5 py-3 text-xs font-bold disabled:opacity-50">{completedSet.has(currentLesson.id) ? 'الدرس مكتمل' : 'إكمال الدرس بعد اجتياز الاختبار'}</button>}
              </div>
            ) : currentLesson?.fileUrl && ['pdf', 'doc', 'ppt'].includes(currentLesson.type || '') ? (
              <div className="space-y-3">
                <CourseDocumentViewer fileUrl={currentLesson.fileUrl} title={currentLesson.title} type={currentLesson.type} />
                <button type="button" onClick={() => void handleToggleComplete(currentLesson.id)} disabled={completedSet.has(currentLesson.id) || savingLessonId === currentLesson.id} className="min-h-11 rounded-xl bg-blue-900 px-5 py-3 text-xs font-black text-white disabled:opacity-50">{completedSet.has(currentLesson.id) ? 'تمت القراءة' : 'أتممت قراءة المحتوى'}</button>
              </div>
            ) : (
              <StudentVideoPlayer
                key={`${courseSlug}:${currentLesson?.id || lessonId}`}
                courseSlug={courseSlug}
                lessonId={currentLesson?.id || lessonId}
                lessonTitle={currentLesson?.title || courseData?.title || 'الدرس التدريبي'}
                videoUrl={currentLesson?.videoUrl || ''}
                onLessonComplete={() => handleToggleComplete(currentLesson?.id || lessonId)}
                nextLessonUrl={nextLesson && lessonAllowed(nextLesson.id) ? makeLessonUrl(nextLesson.id) : undefined}
                prevLessonUrl={prevLesson ? makeLessonUrl(prevLesson.id) : undefined}
                onOpenLessonsDrawer={() => setIsMobilePlaylistOpen(true)}
                onAddNoteAtTimestamp={handleAddTimestampNote}
                isCompleted={completedSet.has(currentLesson?.id || lessonId)}
                isSavingCompletion={savingLessonId === (currentLesson?.id || lessonId)}
                onToggleComplete={() => handleToggleComplete(currentLesson?.id || lessonId)}
                professionalDevelopment={cpd && currentLesson?.type !== 'article'}
                onVideoVerified={() => setVideoVerified(true)}
                completionDisabled={cpd && currentLesson?.type !== 'article' && !videoVerified}
              />
            )}
          </div>

          {completionError && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700" role="alert">
              {completionError}
            </div>
          )}

          {completionPendingAssessment && !completionError && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800" role="status">
              اكتملت جميع الدروس. تتاح الشهادة بعد اعتماد إكمال متطلبات الدورة في سجل اشتراكك.
            </div>
          )}

        </div>
      </div>

      {/* Interactive Tabs Workspace */}
      <div hidden={!currentAllowed} className="w-full bg-white/85 backdrop-blur-2xl border border-white/60 rounded-3xl p-4 sm:p-7 shadow-xl space-y-6 text-slate-800">
        <div className="premium-tabs grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab('notes')}
            className={`premium-tab w-full h-11 sm:h-12 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-[#173A7C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="premium-tab-label truncate">الملاحظات ({notesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('attachments')}
            className={`premium-tab w-full h-11 sm:h-12 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'attachments'
                ? 'bg-[#173A7C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Paperclip className="w-4 h-4 shrink-0" />
            <span className="premium-tab-label truncate">المرفقات ({allAttachments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`premium-tab w-full h-11 sm:h-12 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-[#173A7C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span className="premium-tab-label truncate">الاختبار والتقييم</span>
          </button>

          <button
            onClick={() => setActiveTab('discussion')}
            className={`premium-tab w-full h-11 sm:h-12 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'discussion'
                ? 'bg-[#173A7C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="premium-tab-label truncate">المناقشات ({discussionComments.length})</span>
          </button>
        </div>

        {/* Tab 1: Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <h4 className="student-heading-h3 !text-xs sm:!text-sm flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#5CB07C]" />
              تدوين ملاحظات خاصة بهذا الدرس
            </h4>

            <div className="space-y-3">
              <textarea
                id="lesson-note-textarea"
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="اكتب ملاحظاتك الهامة هنا... يمكنك الاستعانة برابط الدقيقة لحفظ وقت الملاحظة."
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

        {/* Tab 2: Attachments (PDF / Word / Resources) */}
        {activeTab === 'attachments' && (
          <div className="space-y-4">
            <h4 className="student-heading-h3 !text-xs sm:!text-sm flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-[#173A7C]" />
              الملفات والمكتسبات المرفقة بالبرنامج التدريبي
            </h4>

            {allAttachments.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-xs font-bold text-slate-700">لا توجد ملفات مرفقة إضافية لهذا المساق حالياً</div>
                <p className="text-[11px] text-slate-400">كافة المكتسبات العلمية مشمولة ضمن المحاضرات التفاعلية</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allAttachments.map((att, idx) => (
                  <div
                    key={att.id || idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2.5 rounded-lg bg-blue-100 text-[#173A7C] shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-slate-800 text-xs sm:text-sm truncate" title={att.title}>
                          {att.title}
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          {att.fileSize || 'ملف رقمي'} · {att.fileType?.toUpperCase() || 'PDF'}
                        </p>
                      </div>
                    </div>
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="p-2 rounded-lg bg-[#173A7C] text-white hover:bg-[#1E4D9D] transition-colors cursor-pointer shrink-0"
                      title="تحميل الملف"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <AttachmentPreview fileUrl={att.fileUrl} title={att.title} type={att.fileType} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Authenticated, server-graded internal quiz */}
        {activeTab === 'quiz' && currentAllowed && <div id="internal-assessment"><InternalQuizPanel key={`${courseSlug}:${currentLesson?.id || lessonId}`} courseId={courseSlug} lessonId={currentLesson?.id || lessonId} /></div>}
        {currentAllowed && <SatisfactionHeart key={`${courseSlug}:${currentLesson?.id}:${activeTab === 'quiz' ? 'quiz' : 'lesson'}`} courseId={courseSlug} lessonId={currentLesson?.id || lessonId} kind={activeTab === 'quiz' ? 'quiz' : 'lesson'} />}

        {/* Tab 4: Discussion */}
        {activeTab === 'discussion' && (
          <div className="space-y-5">
            <h4 className="student-heading-h3 !text-xs sm:!text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              مجتمع النقاش والأسئلة حول الدورة
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

      {/* Mobile Playlist Drawer */}
      {isMobilePlaylistOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in-up">
          <div className="bg-white rounded-t-3xl border-t border-slate-200 max-h-[80vh] flex flex-col p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#173A7C] text-white">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="student-heading-h3 !text-sm">فهرس المحاضرات</h3>
                  <p className="text-[11px] text-slate-500 font-bold">{completedLessons} من {totalLessons} مكتمل</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobilePlaylistOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5">
              {filteredChapters.map((chap, chIdx) => (
                <div key={chap.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="p-2.5 bg-slate-50 font-bold text-xs text-slate-800 flex items-center justify-between border-b border-slate-100">
                    <span>{chap.title}</span>
                    <span className="text-[10px] text-slate-500">
                      {chap.lessons.filter(l => completedSet.has(l.id)).length}/{chap.lessons.length}
                    </span>
                  </div>
                  <div className="p-1.5 space-y-1.5">
                    {chap.lessons.map((les) => {
                      const isCurrent = les.id === (currentLesson?.id || lessonId);
                      const isDone = completedSet.has(les.id);
                      return (
                        <Link
                          key={les.id}
                          href={makeLessonUrl(les.id)}
                          aria-disabled={!lessonAllowed(les.id)}
                          onClick={(event) => { if (!lessonAllowed(les.id)) { event.preventDefault(); setCompletionError('أكمل الدروس السابقة أولاً'); } else setIsMobilePlaylistOpen(false); }}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs font-bold ${
                            isCurrent
                              ? 'bg-[#173A7C] text-white border-[#173A7C]'
                              : isDone
                              ? 'bg-emerald-50 text-slate-800 border-emerald-200'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {!lessonAllowed(les.id) && <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                          <span className="truncate">{les.title}</span>
                          <span className="text-[10px] font-mono shrink-0">{les.duration}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
