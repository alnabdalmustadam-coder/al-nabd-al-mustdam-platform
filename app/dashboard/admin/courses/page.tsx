'use client';

import { CourseEditorFrame } from '@/components/courses/editor/course-editor-frame';
import { CourseBasicSettings, type BasicSettings } from '@/components/courses/editor/course-basic-settings';
import { CourseCurriculumEditor } from '@/components/courses/editor/course-curriculum-editor';
import { JourneySettingsEditor } from '@/components/courses/editor/journey-settings-editor';
import { CourseFilesEditor } from '@/components/courses/editor/course-files-editor';
import { EditorEmptyState, EditorSectionHeading, EditorToggle } from '@/components/courses/editor/editor-ui';
import { curriculumToEditor, editorToCurriculum, type EditorLesson, type EditorSection } from '@/lib/courses/editor-model';
import { ClipboardCheck } from 'lucide-react';
import { CourseQuizEditor } from '@/components/quizzes/course-quiz-editor';
import { createCourseQuizDraft, prepareCourseQuizForEditing } from '@/lib/quizzes/course-quiz-draft';
import React, { useState, useEffect, useRef } from 'react';
import * as tus from 'tus-js-client';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Search, Clock, Edit3, Trash2, CheckCircle2, Video, GraduationCap, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { QuizData, CourseAttachment, LearningJourneySettings } from '@/types';

import { CardImage } from '@/components/ui/CardImage';
import { useMobileDialogScrollLock } from '@/components/dashboard/useMobileDialogScrollLock';
import { createClient } from '@/utils/supabase/client';
import heroStyles from '@/components/admin/admin-page-hero.module.css';

interface CourseItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  rawCategory?: string;
  level?: string;
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
  professionalDevelopment?: boolean;
  learningJourney?: LearningJourneySettings;
  outcomes?: string[];
}

type FormSubLessonItem = EditorLesson;
type FormSectionItem = EditorSection;
type FormAttachmentItem = CourseAttachment;

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
  const [contentMode, setContentMode] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('tech');
  const [formLevel, setFormLevel] = useState('all');
  const [formTrainer, setFormTrainer] = useState('د. محمد القحطاني');
  const [formPrice, setFormPrice] = useState('500');
  const [formHours, setFormHours] = useState('30');
  const [formDescription, setFormDescription] = useState('');
  const [formProfessionalDevelopment, setFormProfessionalDevelopment] = useState(false);
  const [formImage, setFormImage] = useState('');
  const [platformLogo, setPlatformLogo] = useState('/logo.webp');

  useEffect(() => {
    const loadPlatformLogo = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('platform_settings').select('value').eq('key', 'platformLogo').maybeSingle();
        if (data?.value) setPlatformLogo(data.value);
      } catch (error) {
        console.warn('Could not load platform logo fallback:', error);
      }
    };
    void loadPlatformLogo();
  }, []);

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

  const [instructorsList, setInstructorsList] = useState<string[]>([
    'د. محمد القحطاني',
    'أ. د. سارة العتيبي',
    'د. خالد الدوسري',
    'م. فهد السبيعي',
    'أ. ريم الجهني',
  ]);

  // Hierarchical Sections & Sub-Lessons State
  const [formSections, setFormSections] = useState<FormSectionItem[]>([]);
  
  // Attachments Bag (PDF / Word / Study Guides)
  const [formAttachments, setFormAttachments] = useState<FormAttachmentItem[]>([]);

  // Final Course Exam State
  const [hasFinalExam, setHasFinalExam] = useState(false);
  const [formFinalExam, setFormFinalExam] = useState<QuizData>(createCourseQuizDraft);
  const [formJourney, setFormJourney] = useState<LearningJourneySettings>(() => ({ enabled: true, introduction: '', summary: '', preAssessment: createCourseQuizDraft() }));
  const [formOutcomes, setFormOutcomes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resourceUploads, setResourceUploads] = useState(0);
  const onResourceBusy = (busy: boolean) => setResourceUploads((count) => Math.max(0, count + (busy ? 1 : -1)));
  const changeBasicSettings = (patch: Partial<BasicSettings>) => {
    if (patch.title !== undefined) setFormTitle(patch.title);
    if (patch.slug !== undefined) setFormSlug(patch.slug);
    if (patch.category !== undefined) setFormCategory(patch.category);
    if (patch.level !== undefined) setFormLevel(patch.level);
    if (patch.trainer !== undefined) setFormTrainer(patch.trainer);
    if (patch.price !== undefined) setFormPrice(patch.price);
    if (patch.hours !== undefined) setFormHours(patch.hours);
    if (patch.description !== undefined) setFormDescription(patch.description);
    if (patch.image !== undefined) setFormImage(patch.image);
    if (patch.professionalDevelopment !== undefined) setFormProfessionalDevelopment(patch.professionalDevelopment);
  };

  // Video Uploading State per Sub-Lesson or Section
  const [uploadingTarget, setUploadingTarget] = useState<{ secIdx: number; subIdx?: number } | null>(null);
  const [lessonUploadProgress, setLessonUploadProgress] = useState<number>(0);
  const formLessonVideoInputRef = useRef<HTMLInputElement | null>(null);

  useMobileDialogScrollLock(isModalOpen);

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

  // ═════════════════════════════════════════════════════════════════════════════
  // MODAL INITIALIZATION & ACTIONS
  // ═════════════════════════════════════════════════════════════════════════════

  const openCreateModal = () => {
    setContentMode(false);
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
    setFormProfessionalDevelopment(false);
    setFormJourney({ enabled: true, introduction: '', summary: '', preAssessment: createCourseQuizDraft() });
    setFormOutcomes('');
    setFormImage('');
    setFormAttachments([]);
    setHasFinalExam(false);
    setFormFinalExam(createCourseQuizDraft());

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

  const openEditModal = (course: CourseItem, contentOnly = false) => {
    setEditingCourse(course);
    setContentMode(contentOnly);
    setModalActiveTab(contentOnly ? 'curriculum' : 'basic');
    setFormTitle(course.title);
    setFormSlug(course.slug);
    setFormLevel(course.level || 'all');
    setFormCategory(course.rawCategory || course.category || 'tech');
    setFormTrainer(course.trainer || 'د. محمد القحطاني');
    setFormPrice(String(course.rawPrice ?? 500));
    setFormHours(String(course.hours ?? 30));
    setFormDescription(course.description || '');
    setFormProfessionalDevelopment(course.professionalDevelopment === true);
    setFormJourney({ enabled: true, introduction: course.learningJourney?.introduction || '', summary: course.learningJourney?.summary || '', preAssessment: prepareCourseQuizForEditing(course.learningJourney?.preAssessment) || createCourseQuizDraft() });
    setFormOutcomes((course.outcomes || []).join('\n'));
    setFormImage(course.image || '');

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
      setFormFinalExam(prepareCourseQuizForEditing(course.finalExam) || createCourseQuizDraft());
    } else {
      setHasFinalExam(false);
      setFormFinalExam(createCourseQuizDraft());
    }

    if (Array.isArray(course.curriculum) && course.curriculum.length > 0) {
      setFormSections(curriculumToEditor(course.curriculum));
    } else if (contentOnly) {
      setFormSections([]);
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

    setLessonUploadProgress(1);
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

  // Handle Save Course
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || resourceUploads > 0 || lessonUploadProgress > 0) return;
    if (!formTitle.trim()) {
      showToast('يرجى كتابة عنوان الدورة', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const priceNum = parseFloat(formPrice.replace(/[^\d.]/g, '')) || 0;
      const hoursNum = parseInt(formHours.replace(/[^\d]/g, ''), 10) || 20;

      // Transform form sections to storage format
      const formattedCurriculum = editorToCurriculum(formSections);

      // Count total lessons
      const totalLessonsCount = formattedCurriculum.reduce(
        (acc, sec) => acc + (sec.items?.length || 1),
        0
      );

      const payload: Record<string, unknown> = contentMode && editingCourse ? {
        id: editingCourse.id, slug: editingCourse.slug, title: editingCourse.title,
        curriculum: formattedCurriculum, attachments: formAttachments,
        finalExam: hasFinalExam || formProfessionalDevelopment ? formFinalExam : null,
      } : {
        title: formTitle.trim(),
        slug: formSlug.trim() || undefined,
        category: formCategory,
        level: formLevel,
        instructor: formTrainer.trim(),
        price: priceNum,
        duration: `${hoursNum} ساعة تدريبية معتمدة`,
        description: formDescription.trim(),
        professionalDevelopment: formProfessionalDevelopment,
        image: formImage.trim(),
        curriculum: formattedCurriculum,
        attachments: formAttachments,
        finalExam: hasFinalExam || formProfessionalDevelopment ? formFinalExam : null,
      };

      if (formProfessionalDevelopment || editingCourse?.learningJourney) {
        payload.learningJourney = { ...formJourney, enabled: formProfessionalDevelopment };
        payload.outcomes = formOutcomes.split('\n').map((line) => line.trim()).filter(Boolean);
      }

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
        showToast(contentMode ? 'تم حفظ محتوى الدورة وملفاتها بنجاح' : editingCourse ? 'تم تحديث بيانات ومنهج ومرفقات الدورة بنجاح' : 'تم إضافة الدورة الجديدة مع كامل المنهج والمرفقات بنجاح');
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
          level: savedC.level,
          type: 'online',
          trainer: savedC.instructor || formTrainer.trim(),
          price: savedC.price > 0 ? `${savedC.price.toLocaleString('en-US')} ر.س` : 'مجانية',
          rawPrice: savedC.price,
          students: savedC.enrollees || 0,
          lessonsCount: totalLessonsCount,
          hours: hoursNum,
          status: savedC.status === 'published' ? 'published' : 'draft',
          description: savedC.description || formDescription,
          curriculum: savedC.curriculum || formattedCurriculum,
          attachments: savedC.attachments || formAttachments,
          professionalDevelopment: savedC.professionalDevelopment === true,
          learningJourney: savedC.learningJourney,
          outcomes: savedC.outcomes,
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

  const openLessonsManager = (course: CourseItem) => openEditModal(course, true);

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

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            role={toastMessage.type === 'error' ? 'alert' : 'status'}
            aria-atomic="true"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-max max-w-[calc(100%-2rem)] px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-black border backdrop-blur-md ${
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
      <div className={`${heroStyles.hero} relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-9 liquid-glass-hero border border-white/80 shadow-[0_10px_35px_-10px_rgba(23,58,124,0.08)]`}>
        {/* Subtle Ambient Reflections */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#173A7C]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#5CB07C]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="specular-card-reflection" />

        <div className={`${heroStyles.layout} relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6`}>
          <div className={`${heroStyles.intro} space-y-2.5`}>
            <div className={`${heroStyles.badge} admin-hero-tag bg-[#173A7C]/10 text-[#173A7C] border border-[#173A7C]/15`}>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span className="sm:hidden">المساقات والمحتوى التدريبي</span>
              <span className="hidden sm:inline">إدارة المساقات ومكتبة الفيديو الذكية</span>
            </div>
            <h1 className={`${heroStyles.title} text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#173A7C]`}>
              <BookOpen aria-hidden="true" className="sm:hidden" />
              <span className="sm:hidden">إدارة الدورات والمحتوى</span>
              <span className="hidden sm:inline">إدارة الدورات والمحتوى الأكاديمي 📚</span>
            </h1>
            <p className={`${heroStyles.description} text-slate-600 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed`}>
              تحكم كامل في البرامج التدريبية المعتمدة ({courses.length} دورات نشطة). أضف برامج جديدة، عدل الأسعار، الصور والأغلفة، وارفع فيديوهات مشفرة فورياً للمنصة.
            </p>
          </div>

          <div className={`${heroStyles.actions} flex items-center gap-3 shrink-0`}>
            <button
              onClick={openCreateModal}
              className="px-5 py-3 rounded-xl sm:rounded-2xl bg-[#173A7C] hover:bg-[#1E4D9D] text-white text-xs sm:text-sm font-black shadow-lg shadow-[#173A7C]/20 transition-all flex items-center gap-2 cursor-pointer hover:-translate-y-0.5 active:scale-95"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
              <span className="sm:hidden">إضافة دورة جديدة</span>
              <span className="hidden sm:inline">إضافة دورة تدريبية جديدة</span>
            </button>
            <button
              onClick={loadCourses}
              className="group p-3 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-xs transition-all cursor-pointer duration-500"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-4 h-4 text-slate-500 transition-transform duration-500 group-hover:rotate-180" />
              <span className="sm:hidden">تحديث البيانات</span>
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
                      src={course.image || platformLogo}
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
                    <span>إدارة المحتوى والميديا ({course.lessonsCount})</span>
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
        {isModalOpen && <CourseEditorFrame mode={contentMode ? 'content' : 'course'} title={formTitle} editing={Boolean(editingCourse)} tab={modalActiveTab} onTabChange={setModalActiveTab}
          onClose={() => setIsModalOpen(false)} onSubmit={handleSaveCourse} onInvalid={() => showToast('يرجى إكمال الحقول المطلوبة قبل حفظ الدورة', 'error')}
          busy={isSubmitting} uploading={resourceUploads > 0 || lessonUploadProgress > 0}>
          {modalActiveTab === 'basic' && <CourseBasicSettings value={{ title: formTitle, slug: formSlug, category: formCategory, level: formLevel,
            trainer: formTrainer, price: formPrice, hours: formHours, description: formDescription, image: formImage, professionalDevelopment: formProfessionalDevelopment }}
            onChange={changeBasicSettings} categories={categoriesList} onAddCategory={(name) => setCategoriesList((list) => list.some((item) => item.id === name) ? list : [...list, { id: name, label: name }])}
            trainers={instructorsList} onAddTrainer={(name) => setInstructorsList((list) => list.includes(name) ? list : [...list, name])} onImageBusyChange={onResourceBusy} />}
          {modalActiveTab === 'curriculum' && <div className="space-y-7">{formProfessionalDevelopment && <JourneySettingsEditor value={formJourney} outcomes={formOutcomes} onChange={setFormJourney} onOutcomesChange={setFormOutcomes} />}<CourseCurriculumEditor courseSlug={editingCourse?.slug || formSlug || undefined} value={formSections} onChange={setFormSections} onUploadVideo={triggerVideoUpload}
            videoUpload={lessonUploadProgress > 0 ? uploadingTarget : null} videoProgress={lessonUploadProgress} onFileBusyChange={onResourceBusy} disabled={isSubmitting || resourceUploads > 0} /></div>}
          {modalActiveTab === 'attachments' && <div className="space-y-7">
            <EditorSectionHeading kind="files" eyebrow="مرفقات الدورة" title="ملفات تدعم الدورة بالكامل" description="أضف الحقيبة التدريبية أو الملفات العامة التي يحتاجها الطالب طوال الدورة. لملفات درس أو وحدة بعينها، استخدم قسم المنهج والدروس." />
            <div data-editor-panel className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><CourseFilesEditor title="ملفات عامة للتحميل" description="يمكن إضافة أكثر من مستند أو ملف مضغوط، وتعديل الاسم الذي يظهر للطالب." files={formAttachments} onChange={(update) => setFormAttachments(update)} onBusyChange={onResourceBusy} documentsOnly={false} /></div>
          </div>}
          {modalActiveTab === 'exam' && <div className="space-y-7">
            <EditorSectionHeading kind="exam" eyebrow="تقييم التعلّم" title={formProfessionalDevelopment ? 'الاختبار القبلي والبعدي' : 'الاختبار النهائي للدورة'} description={formProfessionalDevelopment ? 'اختبار قبلي لقياس المعرفة السابقة، واختبار بعدي مستقل يشترط اجتيازه لإكمال الرحلة.' : 'فعّل الاختبار، ثم أضف أسئلة الاختيار من متعدد أو التوصيل وحدّد نسبة الاجتياز.'} />
            {formProfessionalDevelopment && <section data-editor-panel className="space-y-5 rounded-2xl border border-emerald-200 bg-white p-5 sm:p-7"><h3 className="text-base font-semibold text-emerald-900">الاختبار القبلي</h3><p className="text-sm leading-7 text-slate-500">يُسجّل مستوى الطالب قبل التعلّم. تسليم الإجابات يفتح المحتوى مهما كانت النتيجة.</p><CourseQuizEditor diagnostic value={formJourney.preAssessment || { title: '', passingScore: 70, questions: [] }} onChange={(preAssessment) => setFormJourney((current) => ({ ...current, preAssessment }))} /></section>}
            {!formProfessionalDevelopment && <EditorToggle icon={ClipboardCheck} title="تفعيل الاختبار النهائي" description="عند تفعيله يظهر الاختبار للطالب ضمن الدورة، وتُحفظ أسئلته مع بياناتها." enabled={hasFinalExam} onChange={setHasFinalExam} />}
            {hasFinalExam || formProfessionalDevelopment ? <div data-editor-panel className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">{formProfessionalDevelopment && <h3 className="text-base font-semibold text-blue-950">الاختبار البعدي</h3>}<CourseQuizEditor value={formFinalExam} onChange={setFormFinalExam} /></div>
              : <EditorEmptyState kind="exam" title="جهّز التقييم الختامي للدورة" description="فعّل الاختبار من الأعلى، ثم أضف أسئلته وحدّد نسبة الاجتياز المناسبة." />}
          </div>}
        </CourseEditorFrame>}
      </AnimatePresence>


    </div>
  );
}
