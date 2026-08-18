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
  ThumbsUp,
  Sparkles
} from 'lucide-react';
import { StudentVideoPlayer } from '@/components/student/student-video-player';
import {
  getCompletedLessons,
  saveCompletedLessons,
  getLessonNotes,
  saveLessonNote,
  saveQuizAttempt,
} from '@/lib/actions/student-actions';
import { getCourseBySlug, courses as catalogCourses } from '@/data/courses';
import { Course } from '@/types';
import { createClient } from '@/utils/supabase/client';

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
  const rawSlug = (params?.courseSlug as string) || 'free-trial-course';
  const courseSlug = rawSlug.replace(/^course-/, '');
  const lessonId = (params?.lessonId as string) || 'lesson-1';

  // Dynamic course state
  const [courseData, setCourseData] = useState<Course>(() => {
    return getCourseBySlug(courseSlug) || catalogCourses.find(c => c.slug === courseSlug) || catalogCourses[0];
  });

  // Fetch live course from server API
  useEffect(() => {
    async function loadLiveCourseData() {
      try {
        const res = await fetch('/api/courses', { cache: 'no-store' });
        const data = await res.json();
        if (data.success && Array.isArray(data.courses) && data.courses.length > 0) {
          const matched = data.courses.find((c: any) => {
            const clean = (c.slug || '').replace(/^course-/, '').toLowerCase().trim();
            const target = courseSlug.replace(/^course-/, '').toLowerCase().trim();
            return (
              clean === target ||
              c.slug === courseSlug ||
              (c.ghlCourseId && c.ghlCourseId.replace(/^course-/, '').toLowerCase().trim() === target) ||
              String(c.id) === target
            );
          });
          if (matched) {
            setCourseData(matched);
          }
        }
      } catch (err) {
        console.error('Error loading live course in lesson player:', err);
      }
    }

    loadLiveCourseData();
  }, [courseSlug]);

  const [activeTab, setActiveTab] = useState<'notes' | 'attachments' | 'quiz' | 'discussion'>('notes');
  const [userNote, setUserNote] = useState('');
  const [notesList, setNotesList] = useState<{ id: string; text: string; date: string }[]>([
    { id: '1', text: '[02:15] ملاحظة هامة: تم استيعاب المفهوم الأساسي للدرس بنجاح.', date: 'اليوم، 10:15 ص' },
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
        const itemTitle = sec.title || `المحاضرة ${sIdx + 1}`;
        const itemUniqueId = sec.id || `les-${sIdx + 1}`;
        const rawVideo = sec.videoUrl || '';

        return {
          id: `chap-${sIdx + 1}`,
          title: itemTitle,
          lessons: [
            {
              id: itemUniqueId,
              title: itemTitle,
              duration: sec.duration || '20 دقيقة',
              isCompleted: false,
              videoUrl: rawVideo,
              type: (sec.type as any) || 'video',
            },
          ],
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
    if (!allLessons || allLessons.length === 0) return 0;
    const exactMatch = allLessons.findIndex((l) => l.id === lessonId);
    if (exactMatch >= 0) return exactMatch;
    // If URL is lesson-1 and exact ID differs, pick first lesson
    if (lessonId === 'lesson-1' || !lessonId) return 0;
    return 0;
  }, [allLessons, lessonId]);

  const currentLesson = allLessons[currentIndex] || allLessons[0];
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const totalLessons = Math.max(1, allLessons.length);
  const completedLessons = allLessons.filter(l => completedSet.has(l.id)).length;
  const progressPercent = Math.min(100, Math.round((completedLessons / totalLessons) * 100));

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

  /* ── Persistent State ── */
  useEffect(() => {
    async function initProgress() {
      const localCompleted = getCompletedLessons(courseSlug);
      setCompletedSet(localCompleted);
      setNotesList(getLessonNotes(lessonId));

      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          const userEmail = authData.user.email?.toLowerCase().trim();

          // If local storage has progress, sync it to server API route immediately
          if (localCompleted.size > 0 && totalLessons > 0) {
            const calculatedProgress = Math.min(100, Math.round((localCompleted.size / totalLessons) * 100));
            fetch('/api/courses/update-progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: userEmail,
                courseSlug,
                courseTitle: courseData?.title,
                progress: calculatedProgress,
              }),
            }).catch(console.error);
          } else {
            // Otherwise fetch from database if available
            const matchIds = Array.from(new Set([
              courseSlug,
              `course-${courseSlug}`,
              courseData?.slug,
              courseData?.ghlCourseId,
              courseData?.ghlCourseId?.replace(/^course-/, ''),
            ])).filter(Boolean);

            const orQuery = [
              ...matchIds.map(id => `course_id.eq.${id}`),
              ...(courseData?.title ? [`course_title.eq.${courseData.title}`] : []),
            ].join(',');

            const { data: enrollRow } = await supabase
              .from('enrollments')
              .select('progress')
              .eq('email', userEmail)
              .or(orQuery)
              .maybeSingle();

            if (enrollRow?.progress && enrollRow.progress > 0) {
              const calculatedCompletedCount = Math.round((enrollRow.progress / 100) * totalLessons);
              const loadedSet = new Set<string>();
              allLessons.slice(0, calculatedCompletedCount).forEach(l => loadedSet.add(l.id));
              if (loadedSet.size > 0) {
                setCompletedSet(loadedSet);
                saveCompletedLessons(courseSlug, loadedSet);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error syncing lesson progress on init:', err);
      }
    }

    initProgress();
  }, [courseSlug, lessonId, totalLessons, allLessons, courseData]);

  /* ── Handlers ── */
  const toggleChapter = (chapId: string) => {
    setCollapsedChapters(prev => {
      const isCurrentlyCollapsed = prev.has(chapId);
      if (isCurrentlyCollapsed) {
        // Open ONLY this chapter, and collapse all other chapters
        const allOtherChaps = new Set(chapters.map(c => c.id).filter(id => id !== chapId));
        return allOtherChaps;
      } else {
        // Collapse this chapter
        const next = new Set(prev);
        next.add(chapId);
        return next;
      }
    });
  };

  const handleToggleComplete = useCallback(async (lessonItemId: string, e?: React.MouseEvent) => {
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

      // ── Sync with Supabase Database via API Route (Service Role) ──
      const allFlat = chapters.flatMap(ch => ch.lessons);
      const newProgress = Math.min(100, Math.round((next.size / Math.max(1, allFlat.length)) * 100));

      (async () => {
        try {
          const supabase = createClient();
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            const userEmail = authData.user.email?.toLowerCase().trim();

            await fetch('/api/courses/update-progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: userEmail,
                courseSlug,
                courseTitle: courseData?.title,
                progress: newProgress,
              }),
            });
          }
        } catch (syncErr) {
          console.error('Error syncing progress with API route:', syncErr);
        }
      })();

      return next;
    });
  }, [router, courseSlug, chapters, courseData]);

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

  const handleQuizSubmit = async () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) score += 50;
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    saveQuizAttempt(lessonId, score);

    // Auto-issue certificate if passed
    if (score >= 50) {
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        const studentEmail = user?.email?.toLowerCase().trim();
        let studentName = user?.user_metadata?.full_name || 'المتدرب المتميز';

        if (user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .maybeSingle();
          if (profile?.full_name) {
            studentName = profile.full_name;
          }
        }

        await fetch('/api/student/certificates/auto-issue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName,
            studentEmail,
            courseSlug,
            courseTitle: courseData?.title,
            grade: `ممتاز (%${score})`,
            hours: '30 ساعة تدريبية معتمدة',
          }),
        });
      } catch (err) {
        console.error('Error auto issuing certificate after quiz:', err);
      }
    }
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

  const quizQuestions = [
    {
      id: 1,
      question: 'ما هي الركيزة الأساسية لتحقيق أعلى استفادة من هذا المساق التدريبي؟',
      options: ['التطبيق العملي المستمر ومراجعة المخرجات', 'المشاهدة السريعة بدون تدوين', 'تجاوز الاختبارات التقييمية', 'تجنب المشاركة في المناقشات'],
      correctIndex: 0,
    },
    {
      id: 2,
      question: 'كيف يتم التحقق من استحقاق الشهادة الرقمية المعتمدة؟',
      options: ['إتمام كافة متطلبات الدروس ورصد التقدم بنسبة 100%', 'التسجيل في الدورة فقط دون الحضور', 'عدم إكمال الواجبات', 'تخطي الوحدات الأساسية'],
      correctIndex: 0,
    },
  ];

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

            {/* Chapters & Lessons Accordion */}
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

            <div className="pt-2 border-t border-slate-200 text-center shrink-0">
              <span className="text-[11px] font-bold text-[#5CB07C]">
                النبض المستدام — تسجيل التقدم ومزامنته تلقائياً ✓
              </span>
            </div>
          </div>

          {/* Video Player */}
          <div className="col-span-1 lg:col-span-8 xl:col-span-8 flex flex-col justify-between w-full">
            <StudentVideoPlayer
              lessonId={currentLesson?.id || lessonId}
              lessonTitle={currentLesson?.title || courseData?.title || 'الدرس التدريبي'}
              videoUrl={currentLesson?.videoUrl || 'https://www.youtube.com/watch?v=1BEWMhAuBd4'}
              onLessonComplete={() => handleToggleComplete(currentLesson?.id || lessonId)}
              nextLessonUrl={nextLesson ? makeLessonUrl(nextLesson.id) : undefined}
              prevLessonUrl={prevLesson ? makeLessonUrl(prevLesson.id) : undefined}
              onOpenLessonsDrawer={() => setIsMobilePlaylistOpen(true)}
              onAddNoteAtTimestamp={handleAddTimestampNote}
              isCompleted={completedSet.has(currentLesson?.id || lessonId)}
              onToggleComplete={() => handleToggleComplete(currentLesson?.id || lessonId)}
            />
          </div>

        </div>
      </div>

      {/* Interactive Tabs Workspace */}
      <div className="w-full bg-white/85 backdrop-blur-2xl border border-white/60 rounded-3xl p-4 sm:p-7 shadow-xl space-y-6 text-slate-800">
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
            <span className="truncate">اختبار الوحدة</span>
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

        {/* Tab 2: Attachments */}
        {activeTab === 'attachments' && (
          <div className="space-y-4">
            <h4 className="student-heading-h3 !text-xs sm:!text-sm flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-[#173A7C]" />
              الملفات والمكتسبات المرفقة بالبرنامج التدريبي
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-lg bg-blue-100 text-[#173A7C] shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs sm:text-sm">حقيبة الدورة - العرض التدريبي.pdf</h5>
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
                    <h5 className="font-bold text-slate-800 text-xs sm:text-sm">دليل التطبيقات العملية والشهادة.pdf</h5>
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
                اختبار تقييمي قصير لمخرجات الدورة
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

              {quizSubmitted && quizScore !== null && quizScore >= 50 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-500/30 text-slate-900 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2.5 text-emerald-800 font-black text-xs sm:text-sm">
                    <Award className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>تهانينا! لقد اجتزت الاختبار بنجاح وتم إصدار شهادتك المعتمدة فوراً 📜</span>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    تم توثيق إنجازك الأكاديمي وإصدار شهادة معتمدة بالمركز الوطني بالتصميم والقالب الرسمي المخصص.
                  </p>
                  <div className="pt-1">
                    <Link
                      href="/dashboard/student/certificates"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-teal-600 hover:to-emerald-600 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
                    >
                      <Award className="w-4 h-4" />
                      <span>معاينة وتحميل شهادتي المعتمدة الآن ⚡</span>
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                  className="px-5 py-2.5 bg-[#173A7C] text-white rounded-xl text-xs font-bold hover:bg-[#1E4D9D] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {quizSubmitted ? 'إعادة اعتماد الإجابات' : 'اعتماد إجابات الاختبار'}
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
                  <h3 className="text-sm font-black text-slate-800">فهرس دروس المساق</h3>
                  <p className="text-[11px] font-bold text-slate-500">{completedLessons} من {totalLessons} مكتمل (%{progressPercent})</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobilePlaylistOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto space-y-2.5 no-scrollbar"
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
                      <div className="p-1.5 space-y-1.5 bg-white">
                        {chap.lessons.map((les) => {
                          const isCurrent = les.id === (currentLesson?.id || lessonId);
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
                              >
                                {isDone ? (
                                  <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                ) : (
                                  <Circle className={`w-4 h-4 ${isCurrent ? 'text-white/60' : 'text-slate-300'}`} />
                                )}
                              </button>

                              <Link
                                href={makeLessonUrl(les.id)}
                                onClick={() => setIsMobilePlaylistOpen(false)}
                                className="flex-1 flex items-center justify-between gap-2 min-w-0 cursor-pointer"
                              >
                                <span className={`text-xs font-bold truncate ${isCurrent ? 'text-white font-extrabold' : 'text-slate-800'}`}>
                                  {les.title}
                                </span>

                                <span className={`text-[10px] font-mono ${isCurrent ? 'text-blue-200' : 'text-slate-400'}`}>
                                  {les.duration}
                                </span>
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
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
