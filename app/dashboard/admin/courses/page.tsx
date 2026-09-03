'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as tus from 'tus-js-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Users,
  Clock,
  DollarSign,
  Edit3,
  Trash2,
  CheckCircle2,
  Sparkles,
  X,
  Layers,
  MapPin,
  Video,
  Radio,
  FileText,
  PlayCircle,
  Settings,
  GraduationCap,
  ChevronLeft,
  Lock,
  Unlock,
  ExternalLink,
  UploadCloud,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Eye,
  RefreshCw,
  Play,
  Check,
  Paperclip,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Award,
  FilePlus,
  FileCheck,
  ListOrdered,
  PlusCircle,
  FileCode,
  FolderOpen,
} from 'lucide-react';
import { QuizData, QuizQuestion, CourseAttachment, SubLessonItem } from '@/types';
import { DeviceImageUploader } from '@/components/dashboard/DeviceImageUploader';
import { CardImage } from '@/components/ui/CardImage';
import { useMobileDialogScrollLock } from '@/components/dashboard/useMobileDialogScrollLock';

interface CourseItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  rawCategory?: string;
  type: string;
  trainer: string;
  price: string;
  rawPrice?: number;
  students: number;
  lessonsCount: number;
  hours: number;
  status: 'published' | 'draft';
  description?: string;
  image?: string;
  curriculum?: any[];
  attachments?: CourseAttachment[];
  finalExam?: QuizData;
}

interface FormSubLessonItem {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  type: 'video' | 'pdf' | 'doc' | 'quiz';
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  isLocked: boolean;
  quizData?: QuizData;
}

interface FormSectionItem {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  type: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  isLocked: boolean;
  subItems: FormSubLessonItem[];
  quizData?: QuizData;
  showAttachmentUploader?: boolean;
  showQuizEditor?: boolean;
}

interface FormAttachmentItem {
  id: string;
  title: string;
  fileUrl: string;
  fileType: 'pdf' | 'word' | 'ppt' | 'zip' | 'other';
  fileSize: string;
}

// ── Video Duration Helper: Calculates actual video file duration in the browser ──
function formatVideoDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '15 دقيقة';
  const totalSec = Math.round(seconds);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  if (hrs > 0) {
    return `${hrs} ساعة و ${mins} دقيقة`;
  }
  if (mins > 0 && secs > 0) {
    return `${mins} دقيقة و ${secs} ثانية`;
  }
  if (mins > 0) {
    return `${mins} دقيقة`;
  }
  return `${secs} ثانية`;
}

function extractVideoDuration(file: File): Promise<string> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const url = URL.createObjectURL(file);
      video.src = url;

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        const durationFormatted = formatVideoDuration(video.duration);
        resolve(durationFormatted);
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve('15 دقيقة');
      };

      setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve('15 دقيقة');
      }, 3500);
    } catch {
      resolve('15 دقيقة');
    }
  });
}

async function uploadVideoSecurely(
  file: File,
  title: string,
  onProgress: (progress: number) => void,
): Promise<string> {
  const credentialResponse = await fetch('/api/videos/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  const credentials = await credentialResponse.json();

  if (!credentialResponse.ok || !credentials.success) {
    throw new Error(credentials.error || 'تعذر إنشاء طلب رفع آمن');
  }

  return await new Promise<string>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: credentials.uploadUrl,
      retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
      headers: {
        AuthorizationSignature: credentials.signature,
        AuthorizationExpire: String(credentials.expirationTime),
        VideoId: credentials.videoId,
        LibraryId: credentials.libraryId,
      },
      metadata: {
        filetype: file.type,
        title,
      },
      onProgress(bytesUploaded, bytesTotal) {
        onProgress(Math.max(1, Math.round((bytesUploaded / bytesTotal) * 100)));
      },
      onError(error) {
        reject(error);
      },
      onSuccess() {
        onProgress(100);
        resolve(credentials.videoId);
      },
    });

    upload.start();
  });
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal Active Tab: 'basic' | 'curriculum' | 'attachments' | 'exam'
  const [modalActiveTab, setModalActiveTab] = useState<'basic' | 'curriculum' | 'attachments' | 'exam'>('basic');

  // Create / Edit Course Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('tech');
  const [formLevel, setFormLevel] = useState('all');
  const [formTrainer, setFormTrainer] = useState('د. محمد القحطاني');
  const [formPrice, setFormPrice] = useState('500');
  const [formHours, setFormHours] = useState('30');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('/logo.webp');

  // Dynamic Categories & Instructors State
  const [categoriesList, setCategoriesList] = useState<{ id: string; label: string }[]>([
    { id: 'tech', label: 'تقنية وبرمجة' },
    { id: 'admin', label: 'أعمال مكتبية' },
    { id: 'data', label: 'إدخال بيانات ومعالجة نصوص' },
    { id: 'languages', label: 'لغات وترجمة' },
    { id: 'corporate', label: 'إدارة وأعمال وسلامة' },
    { id: 'cyber', label: 'أمن سيبراني وشبكات' },
    { id: 'design', label: 'تصميم ومونتاج' },
  ]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [instructorsList, setInstructorsList] = useState<string[]>([
    'د. محمد القحطاني',
    'أ. د. سارة العتيبي',
    'د. خالد الدوسري',
    'م. فهد السبيعي',
    'أ. ريم الجهني',
  ]);
  const [isAddingNewInstructor, setIsAddingNewInstructor] = useState(false);
  const [newInstructorName, setNewInstructorName] = useState('');
  
  // Hierarchical Sections & Sub-Lessons State
  const [formSections, setFormSections] = useState<FormSectionItem[]>([]);
  
  // Attachments Bag (PDF / Word / Study Guides)
  const [formAttachments, setFormAttachments] = useState<FormAttachmentItem[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [attachmentUploadProgress, setAttachmentUploadProgress] = useState(0);
  const attachmentFileInputRef = useRef<HTMLInputElement | null>(null);

  // Final Course Exam State
  const [hasFinalExam, setHasFinalExam] = useState(false);
  const [formFinalExam, setFormFinalExam] = useState<QuizData>({
    title: 'الاختبار النهائي للبرنامج التدريبي',
    passingScore: 70,
    questions: [
      {
        id: 'q-1',
        question: 'ما هو الهدف الأساسي من تطبيق معايير الاستدامة والحوكمة في المؤسسات؟',
        options: [
          'تحقيق الكفاءة التشغيلية والامتثال للمعايير الدولية',
          'زيادة التكاليف الإدارية والتشغيلية فقط',
          'إلغاء اللوائح التنظيمية والبيئية',
          'تقليص حجم الموارد البشرية بالمؤسسة',
        ],
        correctIndex: 0,
        explanation: 'تساعد معايير الاستدامة على رفع كفاءة العمليات التشغيلية وضمان الامتثال النظامي.',
      },
    ],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const courseImageInputRef = useRef<HTMLInputElement | null>(null);

  // Video Uploading State per Sub-Lesson or Section
  const [uploadingTarget, setUploadingTarget] = useState<{ secIdx: number; subIdx?: number } | null>(null);
  const [lessonUploadProgress, setLessonUploadProgress] = useState<number>(0);
  const formLessonVideoInputRef = useRef<HTMLInputElement | null>(null);

  // Attachment Uploading State per Section or Sub-Lesson
  const [uploadingAttachmentTarget, setUploadingAttachmentTarget] = useState<{ secIdx: number; subIdx?: number } | null>(null);
  const sectionAttachmentInputRef = useRef<HTMLInputElement | null>(null);

  // Standalone Studio Modal State
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<CourseItem | null>(null);
  useMobileDialogScrollLock(isModalOpen || selectedCourseForLessons !== null);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  // Video Player Preview Modal & Token Generation
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [previewSignedIframeUrl, setPreviewSignedIframeUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Standalone Lesson Upload State
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('20 دقيقة');
  const [newLessonUrl, setNewLessonUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const standaloneFileInputRef = useRef<HTMLInputElement | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Courses & Instructors from Server
  const loadInstructors = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok && Array.isArray(data.users)) {
        const dbTrainers = data.users
          .filter((u: any) => u.role === 'مدرب' || u.role === 'INSTRUCTOR' || u.role === 'أدمن')
          .map((u: any) => u.name)
          .filter(Boolean);
        if (dbTrainers.length > 0) {
          setInstructorsList((prev) => Array.from(new Set([...prev, ...dbTrainers])));
        }
      }
    } catch (err) {
      console.error('Error fetching instructors for courses:', err);
    }
  };

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/courses?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache',
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.courses)) {
        setCourses(data.courses);

        // Populate any unique trainers and categories found in loaded courses
        const existingTrainers = data.courses.map((c: any) => c.trainer).filter(Boolean);
        if (existingTrainers.length > 0) {
          setInstructorsList((prev) => Array.from(new Set([...prev, ...existingTrainers])));
        }
      }
    } catch (err) {
      console.error('Error fetching admin courses:', err);
      showToast('تعذر تحميل الدورات من الخادم', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
    loadInstructors();
  }, []);

  const handleAddNewCategory = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (!categoriesList.some((c) => c.id === trimmed || c.label === trimmed)) {
      setCategoriesList((prev) => [...prev, { id: trimmed, label: trimmed }]);
    }
    setFormCategory(trimmed);
    setNewCategoryName('');
    setIsAddingNewCategory(false);
  };

  const handleAddNewInstructor = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const trimmed = newInstructorName.trim();
    if (!trimmed) return;
    if (!instructorsList.includes(trimmed)) {
      setInstructorsList((prev) => [...prev, trimmed]);
    }
    setFormTrainer(trimmed);
    setNewInstructorName('');
    setIsAddingNewInstructor(false);
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // MODAL INITIALIZATION & ACTIONS
  // ═════════════════════════════════════════════════════════════════════════════

  const openCreateModal = () => {
    setEditingCourse(null);
    setModalActiveTab('basic');
    setFormTitle('');
    setFormSlug('');
    setFormCategory('tech');
    setFormLevel('all');
    setFormTrainer('د. محمد القحطاني');
    setFormPrice('500');
    setFormHours('30');
    setFormDescription('');
    setFormImage('/logo.webp');
    setFormAttachments([]);
    setHasFinalExam(false);
    setIsAddingNewCategory(false);
    setIsAddingNewInstructor(false);
    setNewCategoryName('');
    setNewInstructorName('');

    // Initial Section with 1 Sub-video
    setFormSections([
      {
        id: `sec-${Date.now()}-1`,
        title: 'الوحدة الأولى: مدخل ومفاهيم أساسية',
        duration: '30 دقيقة',
        videoUrl: '',
        type: 'video',
        isLocked: false,
        subItems: [
          {
            id: `sub-${Date.now()}-1-1`,
            title: 'الدرس الأول: مقدمة تمهيدية وأهداف البرنامج',
            duration: '15 دقيقة',
            videoUrl: '',
            type: 'video',
            isLocked: false,
          },
        ],
      },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (course: CourseItem) => {
    setEditingCourse(course);
    setModalActiveTab('basic');
    setFormTitle(course.title);
    setFormSlug(course.slug);
    setFormCategory(course.rawCategory || course.category || 'tech');
    setFormTrainer(course.trainer || 'د. محمد القحطاني');
    setFormPrice(String(course.rawPrice ?? 500));
    setFormHours(String(course.hours ?? 30));
    setFormDescription(course.description || '');
    setFormImage(course.image || '/logo.webp');
    setIsAddingNewCategory(false);
    setIsAddingNewInstructor(false);
    setNewCategoryName('');
    setNewInstructorName('');

    // Ensure course category is in list
    const activeCatId = course.rawCategory || course.category;
    if (activeCatId && !categoriesList.some((c) => c.id === activeCatId || c.label === activeCatId)) {
      setCategoriesList((prev) => [...prev, { id: activeCatId, label: course.category || activeCatId }]);
    }
    // Ensure course trainer is in list
    if (course.trainer && !instructorsList.includes(course.trainer)) {
      setInstructorsList((prev) => [...prev, course.trainer]);
    }

    // Attachments
    if (Array.isArray(course.attachments) && course.attachments.length > 0) {
      setFormAttachments(
        course.attachments.map((att: any, idx: number) => ({
          id: att.id || `att-${Date.now()}-${idx}`,
          title: att.title || 'مرفق تدريبي',
          fileUrl: att.fileUrl,
          fileType: att.fileType || 'pdf',
          fileSize: att.fileSize || 'ملف رقمي',
        }))
      );
    } else {
      setFormAttachments([]);
    }

    // Final Exam
    if (course.finalExam && Array.isArray(course.finalExam.questions) && course.finalExam.questions.length > 0) {
      setHasFinalExam(true);
      setFormFinalExam(course.finalExam);
    } else {
      setHasFinalExam(false);
    }

    if (Array.isArray(course.curriculum) && course.curriculum.length > 0) {
      setFormSections(
        course.curriculum.map((sec: any, idx: number) => {
          let parsedSubItems: FormSubLessonItem[] = [];

          if (Array.isArray(sec.items) && sec.items.length > 0) {
            parsedSubItems = sec.items.map((it: any, subIdx: number) => ({
              id: it.id || `sub-${Date.now()}-${idx + 1}-${subIdx + 1}`,
              title: it.title || `مقطع ${subIdx + 1}`,
              duration: it.duration || '15 دقيقة',
              videoUrl: it.videoUrl || '',
              type: it.type || 'video',
              fileUrl: it.fileUrl,
              fileName: it.fileName,
              fileSize: it.fileSize,
              isLocked: it.isLocked ?? false,
              quizData: it.quizData,
            }));
          } else if (Array.isArray(sec.lessons) && sec.lessons.length > 1) {
            parsedSubItems = sec.lessons.map((lesName: string, subIdx: number) => ({
              id: `sub-${Date.now()}-${idx + 1}-${subIdx + 1}`,
              title: lesName,
              duration: '15 دقيقة',
              videoUrl: subIdx === 0 ? (sec.videoUrl || '') : '',
              type: 'video',
              isLocked: false,
            }));
          } else {
            parsedSubItems = [
              {
                id: `sub-${Date.now()}-${idx + 1}-1`,
                title: sec.title || `المقطع 1`,
                duration: sec.duration || '20 دقيقة',
                videoUrl: sec.videoUrl || '',
                type: (sec.type as any) || 'video',
                fileUrl: sec.fileUrl,
                fileName: sec.fileName,
                fileSize: sec.fileSize,
                isLocked: sec.isLocked ?? false,
                quizData: sec.quizData,
              },
            ];
          }

          return {
            id: sec.id || `sec-${Date.now()}-${idx + 1}`,
            title: sec.title || `الوحدة ${idx + 1}`,
            duration: sec.duration || '30 دقيقة',
            videoUrl: sec.videoUrl || '',
            type: sec.type || 'video',
            fileUrl: sec.fileUrl,
            fileName: sec.fileName,
            fileSize: sec.fileSize,
            isLocked: sec.isLocked ?? false,
            subItems: parsedSubItems,
            quizData: sec.quizData,
          };
        })
      );
    } else {
      setFormSections([
        {
          id: `sec-${Date.now()}-1`,
          title: 'الوحدة الأولى: مدخل ومفاهيم أساسية',
          duration: '30 دقيقة',
          videoUrl: '',
          type: 'video',
          isLocked: false,
          subItems: [
            {
              id: `sub-${Date.now()}-1-1`,
              title: 'الدرس الأول: مقدمة تمهيدية وأهداف البرنامج',
              duration: '20 دقيقة',
              videoUrl: '',
              type: 'video',
              isLocked: false,
            },
          ],
        },
      ]);
    }
    setIsModalOpen(true);
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // SECTION & SUB-LESSON HANDLERS
  // ═════════════════════════════════════════════════════════════════════════════

  const handleAddSection = () => {
    const nextNum = formSections.length + 1;
    setFormSections((prev) => [
      ...prev,
      {
        id: `sec-${Date.now()}-${nextNum}`,
        title: `الوحدة ${nextNum}: `,
        duration: '40 دقيقة',
        videoUrl: '',
        type: 'video',
        isLocked: false,
        subItems: [
          {
            id: `sub-${Date.now()}-${nextNum}-1`,
            title: `المقطع 1: شرح المفاهيم الأساسية`,
            duration: '15 دقيقة',
            videoUrl: '',
            type: 'video',
            isLocked: false,
          },
        ],
      },
    ]);
  };

  const handleRemoveSection = (secIdx: number) => {
    if (formSections.length <= 1) {
      showToast('يجب أن تحتوي الدورة على وحدة تعليمية واحدة على الأقل', 'error');
      return;
    }
    setFormSections((prev) => prev.filter((_, idx) => idx !== secIdx));
  };

  const handleUpdateSection = (secIdx: number, field: keyof FormSectionItem, value: any) => {
    setFormSections((prev) => {
      const updated = [...prev];
      if (updated[secIdx]) {
        updated[secIdx] = { ...updated[secIdx], [field]: value };
      }
      return updated;
    });
  };

  // Sub-Item operations inside a section
  const handleAddSubItemToSection = (secIdx: number, defaultType: 'video' | 'pdf' | 'quiz' = 'video') => {
    setFormSections((prev) => {
      const updated = [...prev];
      const sec = updated[secIdx];
      if (sec) {
        const nextSubNum = (sec.subItems?.length || 0) + 1;
        const newSub: FormSubLessonItem = {
          id: `sub-${Date.now()}-${secIdx + 1}-${nextSubNum}`,
          title: defaultType === 'video'
            ? `المقطع ${nextSubNum}: `
            : defaultType === 'pdf'
            ? `ملف ملخص الوحدة PDF`
            : `اختبار تقييمي قصير للوحدة`,
          duration: defaultType === 'video' ? '15 دقيقة' : '10 دقائق',
          videoUrl: '',
          type: defaultType,
          isLocked: false,
          quizData: defaultType === 'quiz' ? {
            title: `اختبار ${sec.title || 'الوحدة'}`,
            passingScore: 70,
            questions: [
              {
                id: `q-${Date.now()}-1`,
                question: 'اكتب السؤال التقييمي هنا...',
                options: ['الخيار الأول (الصحيح)', 'الخيار الثاني', 'الخيار الثالث', 'الخيار الرابع'],
                correctIndex: 0,
                explanation: 'شرح وتوضيح الإجابة النموذجية.',
              },
            ],
          } : undefined,
        };
        sec.subItems = [...(sec.subItems || []), newSub];
      }
      return updated;
    });
  };

  const handleRemoveSubItem = (secIdx: number, subIdx: number) => {
    setFormSections((prev) => {
      const updated = [...prev];
      const sec = updated[secIdx];
      if (sec) {
        if (sec.subItems.length <= 1) {
          showToast('يجب أن تحتوي الوحدة على مقطع أو عنصر واحد على الأقل', 'error');
          return prev;
        }
        sec.subItems = sec.subItems.filter((_, idx) => idx !== subIdx);
      }
      return updated;
    });
  };

  const handleUpdateSubItem = (secIdx: number, subIdx: number, field: keyof FormSubLessonItem, value: any) => {
    setFormSections((prev) => {
      const updated = [...prev];
      const sec = updated[secIdx];
      if (sec && sec.subItems && sec.subItems[subIdx]) {
        sec.subItems[subIdx] = { ...sec.subItems[subIdx], [field]: value };
      }
      return updated;
    });
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // BUNNY STREAM VIDEO UPLOAD IN MODAL (WITH AUTO DURATION DETECTION)
  // ═════════════════════════════════════════════════════════════════════════════

  const triggerVideoUpload = (secIdx: number, subIdx?: number) => {
    setUploadingTarget({ secIdx, subIdx });
    if (formLessonVideoInputRef.current) {
      formLessonVideoInputRef.current.value = '';
      formLessonVideoInputRef.current.click();
    }
  };

  const handleLessonVideoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingTarget === null) return;

    const { secIdx, subIdx } = uploadingTarget;
    const targetTitle = subIdx !== undefined
      ? formSections[secIdx]?.subItems?.[subIdx]?.title || 'درس فرعي'
      : formSections[secIdx]?.title || 'درس';

    // ── 1. Calculate duration directly from the video file ──
    const calculatedDuration = await extractVideoDuration(file);
    if (subIdx !== undefined) {
      handleUpdateSubItem(secIdx, subIdx, 'duration', calculatedDuration);
    } else {
      handleUpdateSection(secIdx, 'duration', calculatedDuration);
    }

    setLessonUploadProgress(5);

    try {
      const videoId = await uploadVideoSecurely(
        file,
        `${formTitle || 'دورة'} - ${targetTitle}`,
        setLessonUploadProgress,
      );

      // 4. Update Video ID in State
      if (subIdx !== undefined) {
        handleUpdateSubItem(secIdx, subIdx, 'videoUrl', videoId);
      } else {
        handleUpdateSection(secIdx, 'videoUrl', videoId);
      }

      showToast(`تم رفع الفيديو وتجهيزه بنجاح (المدة: ${calculatedDuration})`);
    } catch (err: any) {
      console.error('Lesson video upload failed:', err);
      showToast(err.message || 'فشل رفع الفيديو', 'error');
    } finally {
      setUploadingTarget(null);
      setLessonUploadProgress(0);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // ATTACHMENT UPLOAD HANDLERS (SUPABASE STORAGE)
  // ═════════════════════════════════════════════════════════════════════════════

  const triggerAttachmentUploadForTarget = (secIdx: number, subIdx?: number) => {
    setUploadingAttachmentTarget({ secIdx, subIdx });
    if (sectionAttachmentInputRef.current) {
      sectionAttachmentInputRef.current.value = '';
      sectionAttachmentInputRef.current.click();
    }
  };

  const handleAttachmentFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingAttachmentTarget === null) return;

    const { secIdx, subIdx } = uploadingAttachmentTarget;
    setIsUploadingAttachment(true);
    setAttachmentUploadProgress(15);

    const progressTimer = setInterval(() => {
      setAttachmentUploadProgress((prev) => (prev < 90 ? prev + 12 : prev));
    }, 140);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      const res = await fetch('/api/admin/courses/upload-attachment', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressTimer);
      setAttachmentUploadProgress(100);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل رفع الملف المرفق');
      }

      if (subIdx !== undefined) {
        handleUpdateSubItem(secIdx, subIdx, 'fileUrl', data.fileUrl);
        handleUpdateSubItem(secIdx, subIdx, 'fileName', data.fileName);
        handleUpdateSubItem(secIdx, subIdx, 'fileSize', data.fileSize);
      } else {
        handleUpdateSection(secIdx, 'fileUrl', data.fileUrl);
        handleUpdateSection(secIdx, 'fileName', data.fileName);
        handleUpdateSection(secIdx, 'fileSize', data.fileSize);
      }

      showToast(`تم رفع الملف المرفق (${data.fileName}) بنجاح!`);
    } catch (err: any) {
      clearInterval(progressTimer);
      console.error('Attachment upload failed:', err);
      showToast(err.message || 'فشل رفع الملف', 'error');
    } finally {
      setTimeout(() => {
        setIsUploadingAttachment(false);
        setUploadingAttachmentTarget(null);
        setAttachmentUploadProgress(0);
      }, 500);
    }
  };

  // Course-level Attachment Bag Upload
  const handleCourseBagAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAttachment(true);
    setAttachmentUploadProgress(15);

    const progressTimer = setInterval(() => {
      setAttachmentUploadProgress((prev) => (prev < 90 ? prev + 12 : prev));
    }, 140);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      const res = await fetch('/api/admin/courses/upload-attachment', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressTimer);
      setAttachmentUploadProgress(100);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل رفع الملف المرفق');
      }

      const newAtt: FormAttachmentItem = {
        id: `att-${Date.now()}`,
        title: data.fileName || file.name,
        fileUrl: data.fileUrl,
        fileType: (data.fileType as any) || 'pdf',
        fileSize: data.fileSize || 'ملف رقمي',
      };

      setFormAttachments((prev) => [...prev, newAtt]);
      showToast(`تمت إضافة الملف المرفق (${data.fileName}) لحقيبة الدورة بنجاح!`);
    } catch (err: any) {
      clearInterval(progressTimer);
      console.error('Attachment bag upload failed:', err);
      showToast(err.message || 'فشل رفع الملف', 'error');
    } finally {
      setTimeout(() => {
        setIsUploadingAttachment(false);
        setAttachmentUploadProgress(0);
        if (attachmentFileInputRef.current) {
          attachmentFileInputRef.current.value = '';
        }
      }, 500);
    }
  };

  const handleRemoveAttachmentFromBag = (attId: string) => {
    setFormAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  // Handle Upload Course Image
  const handleCourseImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (formSlug) formData.append('courseSlug', formSlug);
      if (formImage) formData.append('existingImageUrl', formImage);

      const res = await fetch('/api/admin/courses/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.imageUrl) {
        setFormImage(data.imageUrl);
        showToast('تم رفع وتحديث صورة الدورة بنجاح');
      } else {
        throw new Error(data.error || 'فشل رفع الصورة');
      }
    } catch (err: any) {
      console.error('Upload image error:', err);
      showToast(err.message || 'حدث خطأ أثناء رفع الصورة', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle Save Course
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('يرجى كتابة عنوان الدورة', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const priceNum = parseFloat(formPrice.replace(/[^\d.]/g, '')) || 0;
      const hoursNum = parseInt(formHours.replace(/[^\d]/g, ''), 10) || 20;

      // Transform form sections to storage format
      const formattedCurriculum = formSections.map((sec, idx) => ({
        id: sec.id || `sec-${idx + 1}`,
        title: sec.title.trim() || `الوحدة ${idx + 1}`,
        duration: sec.duration || '30 دقيقة',
        videoUrl: sec.videoUrl || '',
        type: sec.type || 'video',
        fileUrl: sec.fileUrl,
        fileName: sec.fileName,
        fileSize: sec.fileSize,
        isLocked: sec.isLocked,
        quizData: sec.quizData,
        items: sec.subItems.map((sub, sIdx) => ({
          id: sub.id || `sub-${idx + 1}-${sIdx + 1}`,
          title: sub.title.trim() || `المقطع ${sIdx + 1}`,
          duration: sub.duration || '15 دقيقة',
          videoUrl: sub.videoUrl || '',
          type: sub.type || 'video',
          fileUrl: sub.fileUrl,
          fileName: sub.fileName,
          fileSize: sub.fileSize,
          isLocked: sub.isLocked,
          quizData: sub.quizData,
        })),
        lessons: sec.subItems.map((sub) => sub.title),
      }));

      // Count total lessons
      const totalLessonsCount = formattedCurriculum.reduce(
        (acc, sec) => acc + (sec.items?.length || 1),
        0
      );

      const payload: any = {
        title: formTitle.trim(),
        slug: formSlug.trim() || undefined,
        category: formCategory,
        level: formLevel,
        instructor: formTrainer.trim(),
        price: priceNum,
        duration: `${hoursNum} ساعة تدريبية معتمدة`,
        description: formDescription.trim(),
        image: formImage.trim() || '/logo.webp',
        curriculum: formattedCurriculum,
        attachments: formAttachments,
        finalExam: hasFinalExam ? formFinalExam : undefined,
      };

      if (editingCourse?.id) {
        payload.id = editingCourse.id;
      }

      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success && data.course) {
        showToast(editingCourse ? 'تم تحديث بيانات ومنهج ومرفقات الدورة بنجاح' : 'تم إضافة الدورة الجديدة مع كامل المنهج والمرفقات بنجاح');
        setIsModalOpen(false);

        // Optimistic UI state update
        const savedC = data.course;
        let categoryLabel = 'تقنية وحاسب';
        const cat = String(savedC.category || '');
        if (cat === 'admin' || cat === 'office') categoryLabel = 'أعمال مكتبية';
        else if (cat === 'data') categoryLabel = 'إدخال بيانات';
        else if (cat === 'languages' || cat === 'english') categoryLabel = 'لغات';
        else if (cat === 'corporate' || cat === 'management' || cat === 'finance') categoryLabel = 'إدارة وأعمال';
        else if (cat === 'safety' || cat === 'osha' || cat === 'nebosh') categoryLabel = 'سلامة مهنية';
        else if (cat === 'qudurat' || cat === 'aptitude') categoryLabel = 'تأهيل واختبارات';
        else if (cat) categoryLabel = cat;

        const optimisticItem: CourseItem = {
          id: String(savedC.id),
          slug: savedC.slug,
          title: savedC.title,
          category: categoryLabel,
          rawCategory: savedC.category,
          type: 'online',
          trainer: savedC.instructor || formTrainer.trim(),
          price: savedC.price > 0 ? `${savedC.price.toLocaleString('en-US')} ر.س` : 'مجانية',
          rawPrice: savedC.price,
          students: savedC.enrollees || 0,
          lessonsCount: totalLessonsCount,
          hours: hoursNum,
          status: 'published',
          description: savedC.description || formDescription,
          curriculum: savedC.curriculum || formattedCurriculum,
          attachments: savedC.attachments || formAttachments,
          finalExam: savedC.finalExam || (hasFinalExam ? formFinalExam : undefined),
          image: savedC.image || formImage,
        };

        setCourses((prev) => {
          const exists = prev.some((c) => c.slug === optimisticItem.slug || c.id === optimisticItem.id);
          if (exists) {
            return prev.map((c) => (c.slug === optimisticItem.slug || c.id === optimisticItem.id ? optimisticItem : c));
          }
          return [optimisticItem, ...prev];
        });

        loadCourses();
      } else {
        showToast(data.error || data.message || 'حدث خطأ أثناء حفظ الدورة', 'error');
      }
    } catch (err: any) {
      console.error('Error saving course:', err);
      showToast('تعذر حفظ الدورة في الخادم', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Course
  const handleDeleteCourse = async (course: CourseItem) => {
    if (!confirm(`هل أنت متأكد من حذف دورة "${course.title}" نهائياً من النظام؟`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/courses?id=${course.id}&slug=${course.slug}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('تم حذف الدورة التدريبية بنجاح');
        setCourses((prev) => prev.filter((c) => c.id !== course.id && c.slug !== course.slug));
      } else {
        showToast(data.error || 'فشل حذف الدورة', 'error');
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      showToast('تعذر إتمام عملية الحذف', 'error');
    }
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // STANDALONE LESSONS STUDIO MODAL METHODS
  // ═════════════════════════════════════════════════════════════════════════════

  const openLessonsManager = async (course: CourseItem) => {
    setSelectedCourseForLessons(course);
    setLessonsLoading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setNewLessonTitle('');
    setNewLessonUrl('');
    setPreviewVideoUrl(null);
    setPreviewSignedIframeUrl(null);
    setPreviewError(null);

    try {
      const res = await fetch(`/api/admin/courses/${course.slug}/lessons?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.curriculum)) {
        setCourseLessons(data.curriculum);
      } else {
        setCourseLessons([]);
      }
    } catch (err) {
      console.error('Error loading lessons:', err);
      showToast('تعذر تحميل دروس الدورة', 'error');
    } finally {
      setLessonsLoading(false);
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForLessons) return;
    if (!newLessonTitle.trim()) {
      setUploadError('يرجى كتابة عنوان المحاضرة');
      return;
    }

    try {
      const res = await fetch(`/api/admin/courses/${selectedCourseForLessons.slug}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newLessonTitle.trim(),
          duration: newLessonDuration.trim() || '20 دقيقة',
          videoUrl: newLessonUrl.trim(),
          type: 'video',
          isLocked: false,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('تمت إضافة المحاضرة بنجاح');
        setNewLessonTitle('');
        setNewLessonUrl('');
        setUploadSuccess('تم حفظ المحاضرة في المنهج بنجاح!');
        if (data.curriculum) {
          setCourseLessons(data.curriculum);
        }
        loadCourses();
      } else {
        setUploadError(data.error || 'تعذر حفظ المحاضرة');
      }
    } catch (err: any) {
      setUploadError(err.message || 'حدث خطأ في الاتصال بالخادم');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!selectedCourseForLessons) return;
    if (!confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;

    try {
      const res = await fetch(`/api/admin/courses/${selectedCourseForLessons.slug}/lessons?lessonId=${lessonId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('تم حذف الدرس بنجاح');
        if (data.curriculum) {
          setCourseLessons(data.curriculum);
        } else {
          setCourseLessons((prev) => prev.filter((l: any) => l.id !== lessonId));
        }
        loadCourses();
      } else {
        showToast(data.error || 'فشل حذف الدرس', 'error');
      }
    } catch (err) {
      showToast('تعذر إتمام عملية الحذف', 'error');
    }
  };

  // Standalone Direct Video Upload (with auto duration calculation)
  const handleDirectVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCourseForLessons) return;

    // Automatically calculate video duration from file
    const calculatedDuration = await extractVideoDuration(file);
    setNewLessonDuration(calculatedDuration);

    setIsUploading(true);
    setUploadProgress(5);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const videoId = await uploadVideoSecurely(
        file,
        `${selectedCourseForLessons.title} - ${newLessonTitle || file.name}`,
        setUploadProgress,
      );

      setNewLessonUrl(videoId);
      setUploadSuccess(`تم رفع الفيديو وتشفيره بنجاح! كود الفيديو: ${videoId} (المدة: ${calculatedDuration})`);
      showToast(`تم رفع ومعالجة الفيديو بنجاح (المدة: ${calculatedDuration})`);
    } catch (err: any) {
      console.error('Direct video upload failed:', err);
      setUploadError(err.message || 'حدث خطأ أثناء رفع الفيديو');
    } finally {
      setIsUploading(false);
    }
  };

  // Safe Preview with DRM Token Authentication
  const handlePreviewVideo = async (rawUrl: string) => {
    if (!rawUrl) return;
    const trimmed = rawUrl.trim();
    setPreviewVideoUrl(trimmed);
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewSignedIframeUrl(null);

    try {
      if (!trimmed) {
        setPreviewError('لا يوجد فيديو مرفق لهذا الدرس بعد.');
        setPreviewLoading(false);
        return;
      }

      // 1. Secure video GUID extraction (36-character UUID)
      const guidMatch = trimmed.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
      const videoGuid = guidMatch ? guidMatch[0] : (trimmed.length === 36 ? trimmed : null);

      if (videoGuid) {
        const res = await fetch('/api/videos/playback-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoId: videoGuid,
            courseSlug: selectedCourseForLessons?.slug || 'admin-preview',
          }),
        });
        const data = await res.json();
        if (res.ok && data.success && data.iframeUrl) {
          setPreviewSignedIframeUrl(data.iframeUrl);
        } else {
          // Fallback to direct embed
          setPreviewSignedIframeUrl(`https://iframe.mediadelivery.net/embed/729792/${videoGuid}?autoplay=true&preload=true`);
        }
      } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        setPreviewSignedIframeUrl(trimmed);
      } else {
        setPreviewError('معرّف الفيديو غير صالح. يرجى إدخال معرّف الفيديو أو رابط مباشر.');
      }
    } catch (err: any) {
      console.error('Error fetching preview token:', err);
      setPreviewError('تعذر تجهيز مشغل الفيديو للمعاينة');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Filtered courses list
  const filteredCourses = courses.filter((c) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      c.rawCategory === selectedCategory ||
      c.category.includes(selectedCategory);

    const matchesSearch =
      searchQuery.trim() === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.trainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full space-y-6 sm:space-y-7 font-[family-name:var(--font-cairo)]" dir="rtl">
      {/* Hidden File Inputs for Triggers */}
      <input
        ref={formLessonVideoInputRef}
        type="file"
        accept="video/*"
        onChange={handleLessonVideoFileSelected}
        className="hidden"
      />
      <input
        ref={sectionAttachmentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
        onChange={handleAttachmentFileSelected}
        className="hidden"
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-black border backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 shadow-emerald-950/40'
                : 'bg-rose-950/90 text-rose-200 border-rose-500/40 shadow-rose-950/40'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner - Unified Liquid Glass Brand Theme */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-9 liquid-glass-hero border border-white/80 shadow-[0_10px_35px_-10px_rgba(23,58,124,0.08)]">
        {/* Subtle Ambient Reflections */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#173A7C]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#5CB07C]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="specular-card-reflection" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="admin-hero-tag bg-[#173A7C]/10 text-[#173A7C] border border-[#173A7C]/15">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>إدارة المساقات ومكتبة الفيديو الذكية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#173A7C]">
              إدارة الدورات والمحتوى الأكاديمي 📚
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed">
              تحكم كامل في البرامج التدريبية المعتمدة ({courses.length} دورات نشطة). أضف برامج جديدة، عدل الأسعار، الصور والأغلفة، وارفع فيديوهات مشفرة فورياً للمنصة.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={openCreateModal}
              className="px-5 py-3 rounded-xl sm:rounded-2xl bg-[#173A7C] hover:bg-[#1E4D9D] text-white text-xs sm:text-sm font-black shadow-lg shadow-[#173A7C]/20 transition-all flex items-center gap-2 cursor-pointer hover:-translate-y-0.5 active:scale-95"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
              <span>إضافة دورة تدريبية جديدة</span>
            </button>
            <button
              onClick={loadCourses}
              className="p-3 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-xs transition-all cursor-pointer hover:rotate-180 duration-500"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الدورة أو المدرب..."
            className="w-full pl-4 pr-10 py-2 text-xs font-bold text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C] focus:bg-white transition-all"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs font-bold">
          {[
            { id: 'all', label: 'جميع التصنيفات' },
            { id: 'tech', label: 'تقنية وبرمجة' },
            { id: 'admin', label: 'أعمال مكتبية' },
            { id: 'data', label: 'إدخال بيانات' },
            { id: 'languages', label: 'لغات وترجمة' },
            { id: 'corporate', label: 'إدارة وأعمال' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer text-xs ${
                selectedCategory === cat.id
                  ? 'bg-[#173A7C] text-white font-black shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid - Restored Clean Brand Card Design */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 text-sm font-bold flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
          <span>جاري تحميل الدورات التدريبية من السحابة...</span>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-800">لا توجد دورات مطابقة</h3>
            <p className="text-xs text-slate-500">جرب البحث بكلمات أخرى أو أضف دورة تدريبية جديدة</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#173A7C] text-white text-xs font-black cursor-pointer shadow-sm hover:bg-[#1E4D9D] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة أول دورة</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id || course.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 bg-white/95"
            >
              <div>
                {/* 1. Clean Bright Image Section (Matches Original Platform Theme) */}
                <div className="relative rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 overflow-hidden border border-slate-100/90 group-hover:border-blue-100 transition-colors mb-4">
                  <div className="relative w-full">
                    <CardImage
                      src={course.image || '/logo.webp'}
                      alt={course.title}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  </div>

                  {/* Category Badge on Top-Right */}
                  <div className="absolute top-3 right-3 z-20">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-white/90 text-[#173A7C] border border-blue-100/80 shadow-xs backdrop-blur-md">
                      {course.category}
                    </span>
                  </div>

                  {/* Status Badge on Top-Left */}
                  <div className="absolute top-3 left-3 z-20">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-slate-900/75 text-white shadow-xs backdrop-blur-md">
                      منشورة ⚡
                    </span>
                  </div>
                </div>

                {/* 2. Course Title & Description */}
                <div className="space-y-2">
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#173A7C] transition-colors leading-snug line-clamp-2" title={course.title}>
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                    {course.description || 'برنامج تدريبي معتمد وشامل يغطي المهارات الأساسية والمتقدمة.'}
                  </p>
                </div>
              </div>

              {/* 3. Course Details & Trainer */}
              <div className="space-y-3.5 pt-4 mt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#173A7C]" />
                    <span>{course.hours} ساعة</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#0D5C3A]" />
                    <span>{course.lessonsCount} درس / مقطع</span>
                  </span>
                  <span className="text-emerald-700 font-black">
                    {course.price}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#173A7C]" />
                    <span className="text-slate-500 text-[11px]">المحاضر:</span>
                    <span className="text-slate-800 font-black">{course.trainer}</span>
                  </div>
                </div>

                {/* 4. Action Buttons Footer */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => openLessonsManager(course)}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#2A65C7] text-white font-black text-xs shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
                  >
                    <Video className="w-4 h-4 text-emerald-300" />
                    <span>إدارة الدروس والميديا ({course.lessonsCount})</span>
                  </button>

                  <button
                    onClick={() => openEditModal(course)}
                    className="p-2.5 rounded-xl bg-white hover:bg-blue-50 text-slate-600 hover:text-[#173A7C] border border-slate-200 hover:border-blue-200 transition-all cursor-pointer shadow-xs"
                    title="تعديل الدورة والمنهج والمرفقات"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course)}
                    className="p-2.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer shadow-xs"
                    title="حذف الدورة نهائياً"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════════ */}
      {/* 1. ADVANCED CREATE / EDIT COURSE MODAL WITH TABS & SUB-LESSONS STUDIO */}
      {/* ═════════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-stretch justify-stretch bg-slate-900/70 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="flex h-[100dvh] w-full max-w-none flex-col overflow-hidden rounded-none border-0 bg-white shadow-2xl sm:h-auto sm:max-h-[94vh] sm:max-w-5xl sm:rounded-3xl sm:border sm:border-slate-100"
            >
              {/* Modal Header */}
              <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#0c234b] px-4 py-3 text-white sm:p-6">
                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 sm:h-11 sm:w-11 sm:rounded-2xl">
                    <BookOpen className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black sm:text-lg">
                      <span className="sm:hidden">{editingCourse ? 'تعديل الدورة' : 'إضافة دورة جديدة'}</span>
                      <span className="hidden sm:inline">
                        {editingCourse ? 'تعديل بيانات ومنهج ومرفقات الدورة' : 'إضافة دورة تدريبية جديدة مع المنهج والمرفقات'}
                      </span>
                    </h3>
                    <p className="hidden text-[11px] text-blue-100 sm:block sm:text-xs">
                      دعم كامل لتقسيم الوحدات لمقاطع فرعية متعددة، ملفات PDF/Word، واختبارات تفاعلية ⚡
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Modal Navigation Tabs - Single Row Grid (No Horizontal Scrollbar) */}
              <div className="border-b border-slate-200 bg-slate-50/90 px-3 sm:px-6 pt-2 shrink-0">
                <div className="grid grid-cols-4 gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setModalActiveTab('basic')}
                    className={`py-2 sm:py-2.5 px-1 sm:px-3 text-[10px] sm:text-xs font-black border-b-2 flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer truncate ${
                      modalActiveTab === 'basic'
                        ? 'border-[#173A7C] text-[#173A7C] bg-white rounded-t-xl shadow-xs'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5 shrink-0" />
                    <span className="sm:hidden">البيانات</span>
                    <span className="hidden truncate sm:inline">1. البيانات والغلاف</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalActiveTab('curriculum')}
                    className={`py-2 sm:py-2.5 px-1 sm:px-3 text-[10px] sm:text-xs font-black border-b-2 flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer truncate ${
                      modalActiveTab === 'curriculum'
                        ? 'border-[#173A7C] text-[#173A7C] bg-white rounded-t-xl shadow-xs'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="sm:hidden">المنهج</span>
                    <span className="hidden truncate sm:inline">2. المنهج والمقاطع ({formSections.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalActiveTab('attachments')}
                    className={`py-2 sm:py-2.5 px-1 sm:px-3 text-[10px] sm:text-xs font-black border-b-2 flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer truncate ${
                      modalActiveTab === 'attachments'
                        ? 'border-[#173A7C] text-[#173A7C] bg-white rounded-t-xl shadow-xs'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Paperclip className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="sm:hidden">المرفقات</span>
                    <span className="hidden truncate sm:inline">3. المرفقات PDF ({formAttachments.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalActiveTab('exam')}
                    className={`py-2 sm:py-2.5 px-1 sm:px-3 text-[10px] sm:text-xs font-black border-b-2 flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer truncate ${
                      modalActiveTab === 'exam'
                        ? 'border-[#173A7C] text-[#173A7C] bg-white rounded-t-xl shadow-xs'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="sm:hidden">الاختبار</span>
                    <span className="hidden truncate sm:inline">4. الاختبار {hasFinalExam ? '✓' : ''}</span>
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveCourse} className="flex min-h-0 flex-1 flex-col overflow-hidden sm:block sm:space-y-6 sm:overflow-y-auto sm:p-6">
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-4 sm:contents">
                {/* ═══════════════════════════════════════════════════════════ */}
                {/* TAB 1: BASIC INFO & COVER */}
                {/* ═══════════════════════════════════════════════════════════ */}
                {modalActiveTab === 'basic' && (
                  <div className="space-y-6 animate-fade-in-up">
                    {/* Course Cover Image Section */}
                    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-3 sm:p-4">
                      <DeviceImageUploader
                        value={formImage}
                        onChange={(url) => setFormImage(url)}
                        folder="courses"
                        slug={formSlug || 'course'}
                        label="صورة غلاف الدورة"
                        recommendedSize="المقاس الموصى به: 1280 × 720 بكسل"
                        aspectRatio="video"
                      />

                      {/* Presets */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-bold text-slate-500">
                        <span>أو اختر من النماذج الجاهزة:</span>
                        {['/logo.webp', '/1.png', '/2.png'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setFormImage(preset)}
                            className={`px-2 py-0.5 rounded-lg border text-[10px] transition-colors cursor-pointer ${
                              formImage === preset
                                ? 'bg-blue-50 border-blue-300 text-[#173A7C] font-black'
                                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
                            }`}
                          >
                            {preset === '/logo.webp' ? 'شعار المعهد' : preset === '/1.png' ? 'نموذج 1' : 'نموذج 2'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Course Core Details */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-1.5">عنوان الدورة التدريبية *</label>
                        <input
                          type="text"
                          required
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="مثال: دورة هندسة الأوامر والذكاء الاصطناعي المتقدم"
                          className="w-full px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C] focus:bg-white transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* 1. Academic Category */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-black text-slate-700">التصنيف الأكاديمي</label>
                            <button
                              type="button"
                              onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                              className="text-[11px] text-[#173A7C] hover:text-[#1E4D9D] hover:underline font-black cursor-pointer flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{isAddingNewCategory ? 'اختيار من القائمة' : 'إضافة تصنيف جديد'}</span>
                            </button>
                          </div>

                          {isAddingNewCategory ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                autoFocus
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddNewCategory();
                                  }
                                }}
                                placeholder="اكتب اسم التصنيف الجديد..."
                                className="flex-1 px-3.5 py-2.5 text-xs font-bold text-slate-800 bg-white rounded-xl border-2 border-[#173A7C] focus:outline-none focus:ring-2 focus:ring-[#173A7C]/20"
                              />
                              <button
                                type="button"
                                onClick={handleAddNewCategory}
                                className="px-3.5 py-2.5 rounded-xl bg-[#173A7C] hover:bg-[#1E4D9D] text-white text-xs font-black transition-all cursor-pointer shrink-0 shadow-xs"
                              >
                                إضافة
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsAddingNewCategory(false)}
                                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer shrink-0"
                                title="إلغاء"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <select
                              value={formCategory}
                              onChange={(e) => {
                                if (e.target.value === '__add_new__') {
                                  setIsAddingNewCategory(true);
                                } else {
                                  setFormCategory(e.target.value);
                                }
                              }}
                              className="w-full px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C] cursor-pointer"
                            >
                              {categoriesList.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.label}
                                </option>
                              ))}
                              <option value="__add_new__" className="text-[#173A7C] font-black bg-blue-50">
                                إضافة تصنيف جديد...
                              </option>
                            </select>
                          )}
                        </div>

                        {/* 2. Certified Instructor */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-black text-slate-700">المحاضر المعتمد</label>
                            <button
                              type="button"
                              onClick={() => setIsAddingNewInstructor(!isAddingNewInstructor)}
                              className="text-[11px] text-[#173A7C] hover:text-[#1E4D9D] hover:underline font-black cursor-pointer flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{isAddingNewInstructor ? 'اختيار من المسجلين' : 'إضافة مدرب جديد'}</span>
                            </button>
                          </div>

                          {isAddingNewInstructor ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                autoFocus
                                value={newInstructorName}
                                onChange={(e) => setNewInstructorName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddNewInstructor();
                                  }
                                }}
                                placeholder="اكتب اسم المحاضر / المدرب..."
                                className="flex-1 px-3.5 py-2.5 text-xs font-bold text-slate-800 bg-white rounded-xl border-2 border-[#173A7C] focus:outline-none focus:ring-2 focus:ring-[#173A7C]/20"
                              />
                              <button
                                type="button"
                                onClick={handleAddNewInstructor}
                                className="px-3.5 py-2.5 rounded-xl bg-[#173A7C] hover:bg-[#1E4D9D] text-white text-xs font-black transition-all cursor-pointer shrink-0 shadow-xs"
                              >
                                إضافة
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsAddingNewInstructor(false)}
                                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer shrink-0"
                                title="إلغاء"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <select
                              value={formTrainer}
                              onChange={(e) => {
                                if (e.target.value === '__add_new__') {
                                  setIsAddingNewInstructor(true);
                                } else {
                                  setFormTrainer(e.target.value);
                                }
                              }}
                              className="w-full px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C] cursor-pointer"
                            >
                              {instructorsList.map((tName) => (
                                <option key={tName} value={tName}>
                                  {tName}
                                </option>
                              ))}
                              <option value="__add_new__" className="text-[#173A7C] font-black bg-blue-50">
                                إضافة مدرب / محاضر جديد...
                              </option>
                            </select>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black text-slate-700 mb-1.5">رسوم الدورة (ر.س)</label>
                          <input
                            type="number"
                            value={formPrice}
                            onChange={(e) => setFormPrice(e.target.value)}
                            placeholder="0 للدورات المجانية"
                            className="w-full px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-black text-slate-700 mb-1.5">عدد الساعات المعتمدة</label>
                          <input
                            type="number"
                            value={formHours}
                            onChange={(e) => setFormHours(e.target.value)}
                            placeholder="عدد الساعات (مثال: 30)"
                            className="w-full px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-1.5">نبذة ووصف الدورة</label>
                        <textarea
                          rows={3}
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          placeholder="اكتب وصفاً مفصلاً يوضح أهداف البرنامج والمخرجات التعليمية..."
                          className="w-full px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* TAB 2: CURRICULUM WITH SECTIONS & SUB-LESSONS STUDIO */}
                {/* ═══════════════════════════════════════════════════════════ */}
                {modalActiveTab === 'curriculum' && (
                  <div className="space-y-6 animate-fade-in-up">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#173A7C]" />
                          <span>الوحدات والمقاطع الفرعية للمنهج التدريبي</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-[#173A7C] font-black">
                            {formSections.length} وحدات
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          يمكنك إضافة عدة مقاطع وفيديوهات وملفات PDF فرعية داخل كل وحدة تعليمية 🎬
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddSection}
                        className="px-4 py-2 rounded-xl bg-[#173A7C] hover:bg-[#1E4D9D] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة وحدة تعليمية جديدة</span>
                      </button>
                    </div>

                    {/* Sections Container */}
                    <div className="space-y-5">
                      {formSections.map((sec, secIdx) => (
                        <div
                          key={sec.id || secIdx}
                          className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200/90 shadow-xs space-y-4 transition-all hover:border-blue-300"
                        >
                          {/* Section Card Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 bg-white p-3 rounded-xl">
                            <div className="flex items-center gap-2.5 flex-1">
                              <span className="w-7 h-7 rounded-lg bg-[#173A7C] text-white font-black text-xs flex items-center justify-center shadow-xs">
                                {secIdx + 1}
                              </span>
                              <div className="flex-1">
                                <label className="block text-[10px] font-black text-slate-500 mb-0.5">
                                  عنوان الوحدة / الدرس الرئيسي *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={sec.title}
                                  onChange={(e) => handleUpdateSection(secIdx, 'title', e.target.value)}
                                  placeholder="مثال: الوحدة الأولى: أساسيات الذكاء الاصطناعي"
                                  className="w-full px-3 py-1.5 text-xs font-black text-slate-800 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-[#173A7C] focus:bg-white"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div className="w-28">
                                <label className="block text-[10px] font-black text-slate-500 mb-0.5">المدة</label>
                                <input
                                  type="text"
                                  value={sec.duration}
                                  onChange={(e) => handleUpdateSection(secIdx, 'duration', e.target.value)}
                                  placeholder="45 دقيقة"
                                  className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-[#173A7C]"
                                />
                              </div>

                              <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 cursor-pointer pt-3">
                                <input
                                  type="checkbox"
                                  checked={!sec.isLocked}
                                  onChange={(e) => handleUpdateSection(secIdx, 'isLocked', !e.target.checked)}
                                  className="w-3.5 h-3.5 text-[#173A7C] rounded cursor-pointer"
                                />
                                <span>معاينة مجانية</span>
                              </label>

                              {formSections.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSection(secIdx)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer mt-3"
                                  title="حذف هذه الوحدة بالكامل"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Section Attachment (Optional PDF summary for whole module) */}
                          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white/70 rounded-xl border border-slate-200 text-xs">
                            <div className="flex items-center gap-2">
                              <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                              <span className="font-bold text-slate-700">ملحق الوحدة (PDF / وورد):</span>
                              {sec.fileName ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[11px] border border-emerald-200 flex items-center gap-1">
                                  <FileCheck className="w-3 h-3" />
                                  <span>{sec.fileName} ({sec.fileSize || 'PDF'})</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400">لا يوجد ملحق حالياً</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => triggerAttachmentUploadForTarget(secIdx)}
                                disabled={isUploadingAttachment}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-[#173A7C] font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {uploadingAttachmentTarget?.secIdx === secIdx && uploadingAttachmentTarget?.subIdx === undefined ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#173A7C]" />
                                    <span>جاري الرفع {attachmentUploadProgress}%</span>
                                  </>
                                ) : (
                                  <>
                                    <UploadCloud className="w-3.5 h-3.5" />
                                    <span>{sec.fileName ? 'تغيير الملف' : 'إرفاق ملف PDF للوحدة'}</span>
                                  </>
                                )}
                              </button>

                              {sec.fileName && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateSection(secIdx, 'fileUrl', undefined);
                                    handleUpdateSection(secIdx, 'fileName', undefined);
                                  }}
                                  className="text-rose-500 hover:text-rose-700 text-[10px] font-bold"
                                >
                                  إلغاء
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Progress bar for module attachment */}
                          {uploadingAttachmentTarget?.secIdx === secIdx && uploadingAttachmentTarget?.subIdx === undefined && (
                            <div className="w-full space-y-1 p-2 bg-blue-50 rounded-xl border border-blue-200">
                              <div className="flex items-center justify-between text-[11px] font-bold text-[#173A7C]">
                                <span>جاري رفع ومعالجة ملحق الوحدة (PDF / Word)...</span>
                                <span className="font-mono">{attachmentUploadProgress}%</span>
                              </div>
                              <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-[#173A7C] to-emerald-500 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${attachmentUploadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* ── SUB-ITEMS / SUB-LESSONS LIST ── */}
                          <div className="space-y-3 bg-white p-4 rounded-xl border border-blue-100 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                <Video className="w-3.5 h-3.5 text-emerald-600" />
                                <span>المقاطع والمحاضرات الفرعية داخل هذا الدرس ({sec.subItems?.length || 0})</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                يمكنك إضافة عدة فيديوهات أو ملفات للمحاضرة الواحدة
                              </span>
                            </div>

                            <div className="space-y-3">
                              {sec.subItems?.map((sub, subIdx) => (
                                <div
                                  key={sub.id || subIdx}
                                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 transition-all hover:border-slate-300"
                                >
                                  {/* Sub-Item Top Bar */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                                    <div className="flex items-center gap-2 flex-1">
                                      <span className="w-5 h-5 rounded-md bg-blue-100 text-[#173A7C] font-black text-[10px] flex items-center justify-center">
                                        {secIdx + 1}.{subIdx + 1}
                                      </span>
                                      <input
                                        type="text"
                                        required
                                        value={sub.title}
                                        onChange={(e) => handleUpdateSubItem(secIdx, subIdx, 'title', e.target.value)}
                                        placeholder="عنوان المقطع أو المحاضرة الفرعية..."
                                        className="flex-1 px-3 py-1 text-xs font-bold text-slate-800 bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-[#173A7C]"
                                      />
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      {/* Type Selector */}
                                      <select
                                        value={sub.type}
                                        onChange={(e) => handleUpdateSubItem(secIdx, subIdx, 'type', e.target.value)}
                                        className="px-2 py-1 text-[11px] font-bold bg-white text-slate-700 rounded-lg border border-slate-200"
                                      >
                                        <option value="video">🎬 فيديو</option>
                                        <option value="pdf">📄 ملف PDF / وورد</option>
                                        <option value="quiz">❓ اختبار / كويز</option>
                                      </select>

                                      <div className="w-24">
                                        <input
                                          type="text"
                                          value={sub.duration}
                                          onChange={(e) => handleUpdateSubItem(secIdx, subIdx, 'duration', e.target.value)}
                                          placeholder="15 دقيقة"
                                          className="w-full px-2 py-1 text-[11px] font-bold text-slate-700 bg-white rounded-lg border border-slate-200"
                                          title="يتم احتساب المدة تلقائياً فور رفع الفيديو أو يمكنك تعديلها"
                                        />
                                      </div>

                                      {sec.subItems.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveSubItem(secIdx, subIdx)}
                                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                          title="حذف هذا المقطع الفرعي"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Sub-Item Content By Type */}
                                  {sub.type === 'video' && (
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={sub.videoUrl}
                                          onChange={(e) => handleUpdateSubItem(secIdx, subIdx, 'videoUrl', e.target.value)}
                                          placeholder="معرّف الفيديو أو رابط الفيديو المعتمد..."
                                          className="flex-1 px-3 py-1.5 text-xs font-mono text-slate-800 bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-[#173A7C]"
                                        />

                                        <button
                                          type="button"
                                          onClick={() => triggerVideoUpload(secIdx, subIdx)}
                                          disabled={uploadingTarget?.secIdx === secIdx && uploadingTarget?.subIdx === subIdx}
                                          className="px-3 py-1.5 rounded-lg bg-[#173A7C] hover:bg-[#1E4D9D] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                                        >
                                          {uploadingTarget?.secIdx === secIdx && uploadingTarget?.subIdx === subIdx ? (
                                            <>
                                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                              <span>{lessonUploadProgress}%</span>
                                            </>
                                          ) : (
                                            <>
                                              <UploadCloud className="w-3.5 h-3.5" />
                                              <span>رفع فيديو</span>
                                            </>
                                          )}
                                        </button>
                                      </div>

                                      {/* Upload Progress */}
                                      {uploadingTarget?.secIdx === secIdx && uploadingTarget?.subIdx === subIdx && (
                                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                                          <div
                                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: `${lessonUploadProgress}%` }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {sub.type === 'pdf' && (
                                    <div className="flex flex-col gap-2 p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                          <div className="min-w-0">
                                            <span className="font-bold text-slate-800 truncate block">
                                              {sub.fileName || 'ملف PDF / Word غير مرفوع'}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                              {sub.fileSize || 'ملف مستند'}
                                            </span>
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => triggerAttachmentUploadForTarget(secIdx, subIdx)}
                                          disabled={isUploadingAttachment}
                                          className="px-3 py-1.5 rounded-lg bg-[#173A7C] hover:bg-[#1E4D9D] text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50 shrink-0 shadow-xs"
                                        >
                                          {uploadingAttachmentTarget?.secIdx === secIdx && uploadingAttachmentTarget?.subIdx === subIdx ? (
                                            <>
                                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                              <span>جاري الرفع {attachmentUploadProgress}%</span>
                                            </>
                                          ) : (
                                            <>
                                              <UploadCloud className="w-3.5 h-3.5" />
                                              <span>{sub.fileUrl ? 'تغيير الملف' : 'رفع ملف PDF/Word'}</span>
                                            </>
                                          )}
                                        </button>
                                      </div>

                                      {/* Animated Progress Bar for Sub-Item Document */}
                                      {uploadingAttachmentTarget?.secIdx === secIdx && uploadingAttachmentTarget?.subIdx === subIdx && (
                                        <div className="w-full space-y-1 pt-1">
                                          <div className="flex items-center justify-between text-[11px] font-bold text-blue-700">
                                            <span>جاري رفع ومعالجة المستند...</span>
                                            <span className="font-mono">{attachmentUploadProgress}%</span>
                                          </div>
                                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                                            <div
                                              className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-300"
                                              style={{ width: `${attachmentUploadProgress}%` }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {sub.type === 'quiz' && (
                                    <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200/80 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                                          <HelpCircle className="w-4 h-4 text-amber-600" />
                                          <span>أسئلة كويز الوحدة ({sub.quizData?.questions?.length || 0} أسئلة)</span>
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const currentQuestions = sub.quizData?.questions || [];
                                            const nextQ: QuizQuestion = {
                                              id: `q-${Date.now()}-${currentQuestions.length + 1}`,
                                              question: `السؤال ${currentQuestions.length + 1}: `,
                                              options: ['الخيار 1 (الصحيح)', 'الخيار 2', 'الخيار 3', 'الخيار 4'],
                                              correctIndex: 0,
                                              explanation: 'شرح الإجابة الصحيحة.',
                                            };
                                            handleUpdateSubItem(secIdx, subIdx, 'quizData', {
                                              title: `اختبار ${sub.title}`,
                                              passingScore: 70,
                                              questions: [...currentQuestions, nextQ],
                                            });
                                          }}
                                          className="text-[11px] font-bold text-[#173A7C] hover:underline cursor-pointer flex items-center gap-1"
                                        >
                                          <Plus className="w-3 h-3" />
                                          <span>إضافة سؤال للكويز</span>
                                        </button>
                                      </div>

                                      {sub.quizData?.questions?.map((q, qIdx) => (
                                        <div key={q.id || qIdx} className="p-2.5 bg-white rounded border border-amber-100 space-y-1.5 text-xs">
                                          <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-800">السؤال #{qIdx + 1}</span>
                                            {sub.quizData!.questions.length > 1 && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const filtered = sub.quizData!.questions.filter((_, idx) => idx !== qIdx);
                                                  handleUpdateSubItem(secIdx, subIdx, 'quizData', {
                                                    ...sub.quizData,
                                                    questions: filtered,
                                                  });
                                                }}
                                                className="text-rose-500 hover:text-rose-700 text-[10px] font-bold"
                                              >
                                                حذف
                                              </button>
                                            )}
                                          </div>
                                          <input
                                            type="text"
                                            value={q.question}
                                            onChange={(e) => {
                                              const updated = [...sub.quizData!.questions];
                                              updated[qIdx].question = e.target.value;
                                              handleUpdateSubItem(secIdx, subIdx, 'quizData', {
                                                ...sub.quizData,
                                                questions: updated,
                                              });
                                            }}
                                            placeholder="نص السؤال..."
                                            className="w-full px-2 py-1 text-xs font-bold bg-slate-50 border border-slate-200 rounded"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Add Sub-Item Actions */}
                            <div className="pt-2 flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleAddSubItemToSection(secIdx, 'video')}
                                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#173A7C] font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200"
                              >
                                <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                                <span>إضافة مقطع / فيديو فرعي</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleAddSubItemToSection(secIdx, 'pdf')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-emerald-200"
                              >
                                <FilePlus className="w-3.5 h-3.5 text-emerald-600" />
                                <span>ملف PDF فرعي</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleAddSubItemToSection(secIdx, 'quiz')}
                                className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-amber-200"
                              >
                                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                                <span>كويز للوحدة</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* TAB 3: ATTACHMENTS & RESOURCES BAG */}
                {/* ═══════════════════════════════════════════════════════════ */}
                {modalActiveTab === 'attachments' && (
                  <div className="space-y-6 animate-fade-in-up">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-[#173A7C]" />
                          <span>الحقيبة التدريبية وملفات الدورة المرفقة (PDF / Word / ZIP)</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          الملفات المرفوعة هنا ستكون متاحة لجميع الطلاب المسجلين بالدورة في تبويب المرفقات 📄
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => attachmentFileInputRef.current?.click()}
                        disabled={isUploadingAttachment}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                      >
                        {isUploadingAttachment ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>جاري رفع الملف...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4" />
                            <span>رفع ملف جديد للحقيبة (PDF/Word)</span>
                          </>
                        )}
                      </button>
                      <input
                        ref={attachmentFileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                        onChange={handleCourseBagAttachmentUpload}
                        className="hidden"
                      />
                    </div>

                    {formAttachments.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 text-center space-y-3">
                        <FolderOpen className="w-10 h-10 text-slate-400 mx-auto" />
                        <div className="text-xs font-black text-slate-700">لم يتم رفع ملفات لحقيبة هذه الدورة بعد</div>
                        <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                          اضغط على زر الرفع أعلاه لإضافة الحقيبة التدريبية، الكتب المعتمدة، أو أوراق العمل بتنسيق PDF أو Word.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formAttachments.map((att, idx) => (
                          <div
                            key={att.id || idx}
                            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#173A7C] flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <input
                                  type="text"
                                  value={att.title}
                                  onChange={(e) => {
                                    const updated = [...formAttachments];
                                    updated[idx].title = e.target.value;
                                    setFormAttachments(updated);
                                  }}
                                  className="text-xs font-black text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-[#173A7C] w-full max-w-sm"
                                  placeholder="عنوان الملف المرفق"
                                />
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-1">
                                  <span>{att.fileSize}</span>
                                  <span>•</span>
                                  <span className="uppercase">{att.fileType}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={att.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-white hover:bg-blue-50 text-[#173A7C] border border-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>تحميل</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachmentFromBag(att.id)}
                                className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                                title="حذف الملف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* TAB 4: FINAL COURSE EXAM BUILDER */}
                {/* ═══════════════════════════════════════════════════════════ */}
                {modalActiveTab === 'exam' && (
                  <div className="space-y-6 animate-fade-in-up">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800">الاختبار النهائي الشامل للدورة</h4>
                            <p className="text-[10px] text-slate-500 font-medium">
                              يؤدي المتدرب الاختبار وتصدر الشهادة المعتمدة فور اجتيازه بنجاح
                            </p>
                          </div>
                        </div>

                        <label className="flex items-center gap-2 text-xs font-black text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasFinalExam}
                            onChange={(e) => setHasFinalExam(e.target.checked)}
                            className="w-4 h-4 text-[#173A7C] rounded cursor-pointer"
                          />
                          <span>تفعيل الاختبار النهائي للدورة</span>
                        </label>
                      </div>

                      {hasFinalExam && (
                        <div className="space-y-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-black text-slate-700 mb-1">عنوان الاختبار</label>
                              <input
                                type="text"
                                value={formFinalExam.title}
                                onChange={(e) => setFormFinalExam({ ...formFinalExam, title: e.target.value })}
                                placeholder="مثال: الاختبار النهائي للبرنامج التدريبي"
                                className="w-full px-3.5 py-2 text-xs font-bold text-slate-800 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C]"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-black text-slate-700 mb-1">نسبة النجاح المطلوبة (%)</label>
                              <input
                                type="number"
                                min={50}
                                max={100}
                                value={formFinalExam.passingScore || 70}
                                onChange={(e) => setFormFinalExam({ ...formFinalExam, passingScore: parseInt(e.target.value, 10) || 70 })}
                                placeholder="70"
                                className="w-full px-3.5 py-2 text-xs font-bold text-slate-800 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C]"
                              />
                            </div>
                          </div>

                          {/* Questions List */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-black text-slate-800">
                                بنك أسئلة الاختبار ({formFinalExam.questions?.length || 0} أسئلة)
                              </h5>

                              <button
                                type="button"
                                onClick={() => {
                                  const nextQNum = (formFinalExam.questions?.length || 0) + 1;
                                  setFormFinalExam({
                                    ...formFinalExam,
                                    questions: [
                                      ...(formFinalExam.questions || []),
                                      {
                                        id: `q-${Date.now()}-${nextQNum}`,
                                        question: `السؤال ${nextQNum}: `,
                                        options: ['الخيار أ (الصحيح)', 'الخيار ب', 'الخيار ج', 'الخيار د'],
                                        correctIndex: 0,
                                        explanation: 'توضيح الإجابة الصحيحة.',
                                      },
                                    ],
                                  });
                                }}
                                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>إضافة سؤال جديد</span>
                              </button>
                            </div>

                            {formFinalExam.questions?.map((q, qIdx) => (
                              <div
                                key={q.id || qIdx}
                                className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs"
                              >
                                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                  <span className="text-xs font-black text-[#173A7C]">السؤال #{qIdx + 1}</span>
                                  {formFinalExam.questions.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFormFinalExam({
                                          ...formFinalExam,
                                          questions: formFinalExam.questions.filter((_, idx) => idx !== qIdx),
                                        });
                                      }}
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                      title="حذف هذا السؤال"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-[11px] font-black text-slate-600 mb-1">نص السؤال *</label>
                                  <input
                                    type="text"
                                    required
                                    value={q.question}
                                    onChange={(e) => {
                                      const updated = [...formFinalExam.questions];
                                      updated[qIdx].question = e.target.value;
                                      setFormFinalExam({ ...formFinalExam, questions: updated });
                                    }}
                                    placeholder="اكتب نص السؤال هنا..."
                                    className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-[#173A7C]"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label className="block text-[11px] font-black text-slate-600">
                                    خيارات الإجابة (حدد الدائرة بجانب الإجابة الصحيحة):
                                  </label>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {q.options.map((opt, optIdx) => (
                                      <div
                                        key={optIdx}
                                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                                          q.correctIndex === optIdx
                                            ? 'bg-emerald-50/70 border-emerald-300'
                                            : 'bg-slate-50 border-slate-200'
                                        }`}
                                      >
                                        <input
                                          type="radio"
                                          name={`q-${qIdx}-correct`}
                                          checked={q.correctIndex === optIdx}
                                          onChange={() => {
                                            const updated = [...formFinalExam.questions];
                                            updated[qIdx].correctIndex = optIdx;
                                            setFormFinalExam({ ...formFinalExam, questions: updated });
                                          }}
                                          className="w-4 h-4 text-emerald-600 cursor-pointer"
                                        />
                                        <input
                                          type="text"
                                          value={opt}
                                          onChange={(e) => {
                                            const updated = [...formFinalExam.questions];
                                            updated[qIdx].options[optIdx] = e.target.value;
                                            setFormFinalExam({ ...formFinalExam, questions: updated });
                                          }}
                                          placeholder={`الخيار ${optIdx + 1}`}
                                          className="flex-1 px-2 py-1 text-xs font-bold text-slate-800 bg-white rounded border border-slate-200"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                </div>
                {/* Modal Footer Controls */}
                <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:mt-6 sm:gap-3 sm:bg-transparent sm:p-0 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="hidden cursor-pointer rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-black text-slate-700 transition-colors hover:bg-slate-200 sm:block"
                  >
                    إلغاء
                  </button>

                  <div className="flex w-full items-center gap-2 sm:w-auto">
                    {modalActiveTab !== 'basic' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (modalActiveTab === 'exam') setModalActiveTab('attachments');
                          else if (modalActiveTab === 'attachments') setModalActiveTab('curriculum');
                          else if (modalActiveTab === 'curriculum') setModalActiveTab('basic');
                        }}
                        className="flex-1 cursor-pointer rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 sm:flex-none sm:px-4"
                      >
                        السابق
                      </button>
                    )}

                    {modalActiveTab !== 'exam' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (modalActiveTab === 'basic') setModalActiveTab('curriculum');
                          else if (modalActiveTab === 'curriculum') setModalActiveTab('attachments');
                          else if (modalActiveTab === 'attachments') setModalActiveTab('exam');
                        }}
                        className="flex-1 cursor-pointer rounded-xl bg-[#173A7C] px-3 py-2.5 text-xs font-bold text-white hover:bg-[#1E4D9D] sm:flex-none sm:px-4"
                      >
                        التالي ➔
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex flex-[1.35] cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-3 py-2.5 text-xs font-black text-white shadow-md transition-all hover:from-emerald-700 hover:to-teal-800 active:scale-95 disabled:opacity-50 sm:flex-none sm:px-7"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>جاري حفظ الدورة...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="sm:hidden">{editingCourse ? 'حفظ الدورة' : 'نشر الدورة'}</span>
                          <span className="hidden sm:inline">
                            {editingCourse ? 'حفظ وتحديث كامل التعديلات ⚡' : 'نشر الدورة مع المنهج والمرفقات 🚀'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═════════════════════════════════════════════════════════════════════════════ */}
      {/* 2. STANDALONE MEDIA & LESSONS STUDIO MODAL */}
      {/* ═════════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedCourseForLessons && (
          <div className="fixed inset-0 z-[100] flex items-stretch justify-stretch bg-slate-900/70 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="flex h-[100dvh] w-full max-w-none flex-col overflow-hidden rounded-none border-0 bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:max-w-5xl sm:rounded-3xl sm:border sm:border-slate-100"
            >
              {/* Modal Header */}
              <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#0c234b] px-4 py-3 text-white sm:p-6">
                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/20 sm:h-11 sm:w-11 sm:rounded-2xl">
                    <Video className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="hidden items-center gap-2 sm:flex">
                      <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-black">
                        بث فيديو آمن
                      </span>
                      <span className="text-xs text-emerald-300 font-bold">محتوى محمي</span>
                    </div>
                    <h3 className="mt-0.5 truncate text-sm font-black sm:text-lg">{selectedCourseForLessons.title}</h3>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCourseForLessons(null);
                    setPreviewVideoUrl(null);
                    setPreviewSignedIframeUrl(null);
                    setPreviewError(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
                {/* 1. Add New Lesson & Upload Section */}
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#173A7C]" />
                      <span>إضافة محاضرة أو درس جديد للدورة</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                      <button
                        type="button"
                        onClick={() => setUploadMethod('file')}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition-colors cursor-pointer ${
                          uploadMethod === 'file'
                            ? 'bg-[#173A7C] text-white'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        رفع فيديو مباشر
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMethod('url')}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition-colors cursor-pointer ${
                          uploadMethod === 'url'
                            ? 'bg-[#173A7C] text-white'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        إدخال كود الفيديو / رابط
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSaveLesson} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-black text-slate-700 mb-1">
                          عنوان المحاضرة أو الدرس *
                        </label>
                        <input
                          type="text"
                          required
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          placeholder="مثال: الدرس الأول: التأسيس والمفاهيم الجوهرية"
                          className="w-full px-3.5 py-2 text-xs font-bold text-slate-800 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-slate-700 mb-1">
                          المدة (تُحسب تلقائياً)
                        </label>
                        <input
                          type="text"
                          value={newLessonDuration}
                          onChange={(e) => setNewLessonDuration(e.target.value)}
                          placeholder="تُحسب تلقائياً عند رفع الفيديو"
                          className="w-full px-3.5 py-2 text-xs font-bold text-slate-800 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C]"
                        />
                      </div>
                    </div>

                    {uploadMethod === 'file' ? (
                      <div className="p-4 rounded-xl bg-white border-2 border-dashed border-slate-200 text-center space-y-2">
                        <UploadCloud className="w-8 h-8 text-[#173A7C] mx-auto" />
                        <div className="text-xs font-black text-slate-700">
                          اختر ملف الفيديو لرفعه إلى مكتبة الدورة
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                          يتم احتساب وتعبئة مدة الفيديو تلقائياً فور اختياره
                        </p>

                        <div className="pt-2">
                          <input
                            ref={standaloneFileInputRef}
                            type="file"
                            accept="video/*"
                            onChange={handleDirectVideoUpload}
                            disabled={isUploading}
                            className="hidden"
                            id="standalone-video-upload-input"
                          />
                          <label
                            htmlFor="standalone-video-upload-input"
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#173A7C] hover:bg-[#1E4D9D] text-white text-xs font-black cursor-pointer transition-all shadow-xs ${
                              isUploading ? 'opacity-50 pointer-events-none' : ''
                            }`}
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>جاري الرفع والمعالجة ({uploadProgress}%)...</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="w-4 h-4" />
                                <span>اختيار ملف فيديو من جهازك</span>
                              </>
                            )}
                          </label>
                        </div>

                        {isUploading && (
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-3">
                            <div
                              className="bg-emerald-500 h-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        )}

                        {uploadSuccess && (
                          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 text-right flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>{uploadSuccess}</span>
                            </div>
                            {newLessonUrl && (
                              <button
                                type="button"
                                onClick={() => handlePreviewVideo(newLessonUrl)}
                                className="px-3 py-1.5 rounded-lg bg-[#173A7C] hover:bg-[#1E4D9D] text-white text-[11px] font-black transition-all cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                              >
                                <PlayCircle className="w-3.5 h-3.5 text-emerald-300" />
                                <span>معاينة الفيديو الآن</span>
                              </button>
                            )}
                          </div>
                        )}

                        {uploadError && (
                          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200 text-right flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>{uploadError}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-black text-slate-700">
                            معرّف الفيديو أو الرابط أو كود التضمين
                          </label>
                          {newLessonUrl && (
                            <button
                              type="button"
                              onClick={() => handlePreviewVideo(newLessonUrl)}
                              className="text-[11px] text-[#173A7C] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <PlayCircle className="w-3.5 h-3.5 text-blue-600" />
                              <span>معاينة الرابط المكتوب</span>
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          value={newLessonUrl}
                          onChange={(e) => setNewLessonUrl(e.target.value)}
                          placeholder="مثال: 425e04f2-2081-48a4-bf1f-53042736aba4 أو معرف يوتيوب"
                          className="w-full px-3.5 py-2 text-xs font-bold text-slate-800 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C]"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isUploading}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة المحاضرة للمنهج</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. Video Preview Player (If Selected) */}
                {previewVideoUrl && (
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-xl border border-slate-800 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
                        <PlayCircle className="w-4 h-4" />
                        <span>معاينة مشغل الفيديو الآمن</span>
                      </div>
                      <button
                        onClick={() => {
                          setPreviewVideoUrl(null);
                          setPreviewSignedIframeUrl(null);
                          setPreviewError(null);
                        }}
                        className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        ✕ إغلاق المشغل
                      </button>
                    </div>

                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 shadow-inner">
                      {previewLoading ? (
                        <div className="flex flex-col items-center justify-center gap-3 text-slate-300 text-xs font-bold p-8">
                          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                          <span>جاري إعداد مشغل الفيديو وتوليد تصريح المشاهدة الآمن...</span>
                        </div>
                      ) : previewError ? (
                        <div className="flex flex-col items-center justify-center gap-2 text-rose-400 text-xs font-bold p-8 text-center">
                          <AlertCircle className="w-7 h-7 text-rose-500" />
                          <span>{previewError}</span>
                          <button
                            onClick={() => handlePreviewVideo(previewVideoUrl)}
                            className="mt-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-xs font-black transition-colors cursor-pointer"
                          >
                            إعادة المحاولة
                          </button>
                        </div>
                      ) : previewSignedIframeUrl ? (
                        <iframe
                          src={previewSignedIframeUrl}
                          loading="lazy"
                          className="border-0 absolute top-0 left-0 h-full w-full"
                          allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                          allowFullScreen={true}
                        />
                      ) : (
                        <div className="text-slate-400 text-xs font-bold">لا يوجد رابط فيديو متاح للمعاينة</div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Existing Lessons List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-800">
                      قائمة دروس ومحاضرات الدورة ({courseLessons.length} درس)
                    </h4>
                    <span className="text-[11px] text-slate-500 font-bold">
                      يتم حفظ الترتيب والمشاهدات تلقائياً
                    </span>
                  </div>

                  {lessonsLoading ? (
                    <div className="p-8 text-center text-slate-500 text-xs font-bold flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#173A7C]" />
                      <span>جاري تحميل الدروس...</span>
                    </div>
                  ) : courseLessons.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                      <Video className="w-8 h-8 text-slate-400 mx-auto" />
                      <div className="text-xs font-black text-slate-700">لم يتم إضافة دروس بعد</div>
                      <p className="text-[11px] text-slate-400">
                        استخدم النموذج أعلاه لرفع أول فيديو أو درس لهذه الدورة
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {courseLessons.map((lesson: any, idx: number) => (
                        <div
                          key={lesson.id || idx}
                          className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <h5 className="text-xs font-black text-slate-900">{lesson.title}</h5>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{lesson.duration}</span>
                                </span>
                                <span>•</span>
                                  <span className="text-blue-600 font-mono">
                                    {lesson.videoUrl
                                      ? lesson.videoUrl.includes('-') && lesson.videoUrl.length > 20
                                        ? `فيديو محمي: ${lesson.videoUrl.substring(0, 10)}...`
                                        : `فيديو: ${lesson.videoUrl.substring(0, 15)}...`
                                      : 'بدون فيديو'}
                                  </span>
                                {lesson.items && lesson.items.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="text-emerald-700 font-bold">
                                      {lesson.items.length} مقاطع فرعية
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {lesson.videoUrl && (
                              <button
                                onClick={() => handlePreviewVideo(lesson.videoUrl)}
                                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#173A7C] text-[11px] font-black transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <PlayCircle className="w-3.5 h-3.5 text-blue-600" />
                                <span>معاينة</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="حذف الدرس"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50 p-3 text-xs font-bold text-slate-500 sm:p-4">
                <div className="hidden items-center gap-2 sm:flex">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>جميع الفيديوهات مشفرة تلقائياً وتعمل مع تقنية الحماية من القرصنة وتوثيق الطالب</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCourseForLessons(null);
                    setPreviewVideoUrl(null);
                    setPreviewSignedIframeUrl(null);
                    setPreviewError(null);
                  }}
                  className="w-full cursor-pointer rounded-xl bg-slate-200 px-5 py-2.5 font-black text-slate-800 transition-colors hover:bg-slate-300 sm:w-auto sm:py-2"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
