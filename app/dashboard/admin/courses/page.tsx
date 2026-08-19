'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
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
  Image as ImageIcon,
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
  
  // Hierarchical Sections & Sub-Lessons State
  const [formSections, setFormSections] = useState<FormSectionItem[]>([]);
  
  // Attachments Bag (PDF / Word / Study Guides)
  const [formAttachments, setFormAttachments] = useState<FormAttachmentItem[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
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
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  // Video Player Preview Modal
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

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

  // Fetch Courses from Server
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
  }, []);

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

    // Initial Section with 1 Sub-video
    setFormSections([
      {
        id: `sec-${Date.now()}-1`,
        title: 'الوحدة الأولى: مدخل ومفاهيم أساسية',
        duration: '45 دقيقة',
        videoUrl: 'MmHWTPJMzbQ',
        type: 'video',
        isLocked: false,
        subItems: [
          {
            id: `sub-${Date.now()}-1-1`,
            title: 'المقطع 1: أهداف البرنامج والتعريف بالمسار',
            duration: '15 دقيقة',
            videoUrl: 'MmHWTPJMzbQ',
            type: 'video',
            isLocked: false,
          },
          {
            id: `sub-${Date.now()}-1-2`,
            title: 'المقطع 2: التطبيق التفاعلي والأدوات المساعدة',
            duration: '20 دقيقة',
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
    setFormCategory(course.rawCategory || 'tech');
    setFormTrainer(course.trainer);
    setFormPrice(String(course.rawPrice ?? 500));
    setFormHours(String(course.hours ?? 30));
    setFormDescription(course.description || '');
    setFormImage(course.image || '/logo.webp');
    setFormAttachments((course.attachments as any) || []);

    if (course.finalExam && course.finalExam.questions && course.finalExam.questions.length > 0) {
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
            // Backwards compatibility for lessons list
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
          videoUrl: 'MmHWTPJMzbQ',
          type: 'video',
          isLocked: false,
          subItems: [
            {
              id: `sub-${Date.now()}-1-1`,
              title: 'الدرس الأول: مقدمة تمهيدية وأهداف البرنامج',
              duration: '20 دقيقة',
              videoUrl: 'MmHWTPJMzbQ',
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
  // BUNNY STREAM VIDEO UPLOAD IN MODAL
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

    setLessonUploadProgress(5);

    try {
      // 1. Create Video on Bunny Stream
      const createRes = await fetch('/api/bunny/create-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `${formTitle || 'دورة'} - ${targetTitle}` }),
      });

      const createData = await createRes.json();
      if (!createRes.ok || !createData.success) {
        throw new Error(createData.error || 'فشل إنشاء الفيديو على خادم Bunny');
      }

      const { videoId } = createData;
      setLessonUploadProgress(25);

      // 2. Direct Upload to Bunny Stream
      const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || '729792';
      const apiKey = process.env.NEXT_PUBLIC_BUNNY_API_KEY || '20059e98-ea4c-4e3a-b8ae029fcf95-9bf8-466d';

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`);
        xhr.setRequestHeader('AccessKey', apiKey);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 70) + 25;
            setLessonUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setLessonUploadProgress(100);
            resolve();
          } else {
            reject(new Error(`فشل رفع الفيديو إلى السيرفر (${xhr.status})`));
          }
        };

        xhr.onerror = () => reject(new Error('حدث خطأ في شبكة الاتصال أثناء الرفع'));
        xhr.send(file);
      });

      // 3. Update Video ID in State
      if (subIdx !== undefined) {
        handleUpdateSubItem(secIdx, subIdx, 'videoUrl', videoId);
      } else {
        handleUpdateSection(secIdx, 'videoUrl', videoId);
      }

      showToast(`تم رفع الفيديو ومعالجته بنجاح على Bunny Stream!`);
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

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      const res = await fetch('/api/admin/courses/upload-attachment', {
        method: 'POST',
        body: formData,
      });

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
      console.error('Attachment upload failed:', err);
      showToast(err.message || 'فشل رفع الملف', 'error');
    } finally {
      setIsUploadingAttachment(false);
      setUploadingAttachmentTarget(null);
    }
  };

  // Course-level Attachment Bag Upload
  const handleCourseBagAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAttachment(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      const res = await fetch('/api/admin/courses/upload-attachment', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل رفع الملف المرفق');
      }

      const newAttachment: FormAttachmentItem = {
        id: `att-${Date.now()}`,
        title: data.fileName || file.name,
        fileUrl: data.fileUrl,
        fileType: data.fileType || 'pdf',
        fileSize: data.fileSize || '2 MB',
      };

      setFormAttachments((prev) => [...prev, newAttachment]);
      showToast(`تم إضافة الملف (${newAttachment.title}) إلى حقيبة الدورة بنجاح!`);
    } catch (err: any) {
      console.error('Course attachment upload error:', err);
      showToast(err.message || 'فشل رفع الملف', 'error');
    } finally {
      setIsUploadingAttachment(false);
      if (attachmentFileInputRef.current) attachmentFileInputRef.current.value = '';
    }
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // COURSE COVER IMAGE UPLOAD
  // ═════════════════════════════════════════════════════════════════════════════

  const handleCourseImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/courses/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.imageUrl) {
        setFormImage(data.imageUrl);
        showToast('تم رفع صورة الغلاف بنجاح');
      } else {
        showToast(data.error || 'فشل رفع الصورة', 'error');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      showToast('حدث خطأ أثناء رفع الصورة', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // SAVE COURSE WITH SECTIONS, SUB-LESSONS, ATTACHMENTS & QUIZ
  // ═════════════════════════════════════════════════════════════════════════════

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('يرجى كتابة عنوان الدورة التدريبية', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const priceNum = parseFloat(formPrice.replace(/[^\d.]/g, '')) || 0;
      const hoursNum = parseInt(formHours.replace(/[^\d]/g, ''), 10) || 20;

      // Transform Hierarchical Sections into Curriculum Data
      const formattedCurriculum = formSections
        .filter((sec) => sec.title.trim().length > 0)
        .map((sec, sIdx) => {
          const validSubItems = (sec.subItems || [])
            .filter((sub) => sub.title.trim().length > 0)
            .map((sub, subIdx) => ({
              id: sub.id || `sub-${Date.now()}-${sIdx + 1}-${subIdx + 1}`,
              title: sub.title.trim(),
              duration: sub.duration.trim() || '15 دقيقة',
              videoUrl: sub.videoUrl.trim() || '',
              type: sub.type || 'video',
              fileUrl: sub.fileUrl || undefined,
              fileName: sub.fileName || undefined,
              fileSize: sub.fileSize || undefined,
              isLocked: sub.isLocked ?? false,
              quizData: sub.quizData || undefined,
            }));

          // Pick primary video URL from section or first sub-item
          const firstSubVideo = validSubItems.find((s) => s.videoUrl && s.videoUrl.length > 0);
          const primaryVideoUrl = sec.videoUrl?.trim() || firstSubVideo?.videoUrl || 'MmHWTPJMzbQ';

          return {
            id: sec.id || `sec-${Date.now()}-${sIdx + 1}`,
            title: sec.title.trim(),
            duration: sec.duration.trim() || '30 دقيقة',
            videoUrl: primaryVideoUrl,
            type: sec.type || 'video',
            fileUrl: sec.fileUrl || undefined,
            fileName: sec.fileName || undefined,
            fileSize: sec.fileSize || undefined,
            isLocked: sec.isLocked ?? false,
            items: validSubItems,
            quizData: sec.quizData || undefined,
            lessons: validSubItems.length > 0 ? validSubItems.map((s) => s.title) : [sec.title.trim()],
          };
        });

      const totalLessonsCount = formattedCurriculum.reduce(
        (acc, sec) => acc + (sec.items && sec.items.length > 0 ? sec.items.length : 1),
        0
      );

      const payload: any = {
        title: formTitle.trim(),
        slug: formSlug.trim() || undefined,
        category: formCategory,
        level: formLevel,
        instructor: formTrainer.trim(),
        price: priceNum,
        duration: `${hoursNum} ساعة`,
        description: formDescription.trim() || 'برنامج تدريبي معتمد وشامل.',
        image: formImage.trim() || '/logo.webp',
        curriculum: formattedCurriculum.length > 0 ? formattedCurriculum : undefined,
        attachments: formAttachments.length > 0 ? formAttachments : undefined,
        finalExam: hasFinalExam && formFinalExam?.questions?.length > 0 ? formFinalExam : undefined,
        lessonsCount: totalLessonsCount,
      };

      if (editingCourse) {
        payload.id = Number(editingCourse.id);
        payload.slug = editingCourse.slug;
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

        // Trigger background sync
        loadCourses();
      } else {
        showToast(data.error || 'حدث خطأ أثناء حفظ الدورة', 'error');
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

  // Standalone Direct Video Upload
  const handleDirectVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCourseForLessons) return;

    setIsUploading(true);
    setUploadProgress(5);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const createRes = await fetch('/api/bunny/create-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${selectedCourseForLessons.title} - ${newLessonTitle || file.name}`,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok || !createData.success) {
        throw new Error(createData.error || 'فشل إنشاء الفيديو في Bunny Stream');
      }

      const { videoId } = createData;
      setUploadProgress(25);

      const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || '729792';
      const apiKey = process.env.NEXT_PUBLIC_BUNNY_API_KEY || '20059e98-ea4c-4e3a-b8ae029fcf95-9bf8-466d';

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`);
        xhr.setRequestHeader('AccessKey', apiKey);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 70) + 25;
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadProgress(100);
            resolve();
          } else {
            reject(new Error(`فشل رفع الفيديو إلى السيرفر (${xhr.status})`));
          }
        };

        xhr.onerror = () => reject(new Error('خطأ في شبكة الاتصال أثناء الرفع'));
        xhr.send(file);
      });

      setNewLessonUrl(videoId);
      setUploadSuccess(`تم رفع الفيديو وتشفيره بنجاح! كود الفيديو: ${videoId}`);
      showToast('تم رفع ومعالجة الفيديو بنجاح');
    } catch (err: any) {
      console.error('Direct video upload failed:', err);
      setUploadError(err.message || 'حدث خطأ أثناء رفع الفيديو');
    } finally {
      setIsUploading(false);
    }
  };

  // Filtered courses list
  const filteredCourses = courses.filter((c) => {
    const matchesCategory = selectedCategory === 'all' || c.rawCategory === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.trainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-black text-white ${
              toastMessage.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & Action Header */}
      <div className="bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#0c234b] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>نظام إدارة الدورات والوسائط والمرفقات المتقدم</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">إدارة الدورات التدريبية والوسائط المتقدمة</h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl font-medium leading-relaxed">
            أنشئ الدورات وقسّم المنهج إلى وحدات ومقاطع فرعية، وارفع ملفات PDF وWord التفاعلية والاختبارات التقييمية بسهولة تامة ⚡
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 w-full sm:w-auto">
          <button
            onClick={loadCourses}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10 shadow-xs"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#0D5C3A] to-[#147A4E] hover:from-[#117349] hover:to-[#178C5A] text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/20 hover:shadow-emerald-950/30 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة دورة تدريبية جديدة</span>
          </button>
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

      {/* Courses Grid */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <motion.div
              key={course.slug || course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Course Image Header */}
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                  <img
                    src={course.image || '/logo.webp'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.webp';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-[#173A7C]/90 backdrop-blur-md text-white text-[10px] font-black border border-white/10">
                      {course.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white text-[11px] font-bold">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{course.students} متدرب</span>
                    </span>
                    <span className="text-emerald-300 font-black text-xs">
                      {course.price}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-3">
                  <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2" title={course.title}>
                    {course.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold border-y border-slate-100 py-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{course.hours} ساعة</span>
                    </span>
                    <span className="flex items-center gap-1 text-[#173A7C]">
                      <Video className="w-3.5 h-3.5" />
                      <span>{course.lessonsCount} درس / مقطع</span>
                    </span>
                    {course.attachments && course.attachments.length > 0 && (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{course.attachments.length} ملف</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
                    {course.description || 'برنامج تدريبي معتمد وشامل يغطي المهارات الأساسية والمتقدمة.'}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-0 space-y-2">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[94vh]"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#0c234b] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15">
                    <BookOpen className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black">
                      {editingCourse ? 'تعديل بيانات ومنهج ومرفقات الدورة' : 'إضافة دورة تدريبية جديدة مع المنهج والمرفقات'}
                    </h3>
                    <p className="text-xs text-blue-100">
                      دعم كامل لتقسيم الوحدات لمقاطع فرعية متعددة، ملفات PDF/Word، واختبارات تفاعلية ⚡
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Navigation Tabs */}
              <div className="flex items-center border-b border-slate-200 bg-slate-50/90 px-5 sm:px-6 pt-2 shrink-0 gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setModalActiveTab('basic')}
                  className={`py-3 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    modalActiveTab === 'basic'
                      ? 'border-[#173A7C] text-[#173A7C] bg-white rounded-t-xl shadow-xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>1. البيانات الأساسية والغلاف</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalActiveTab('curriculum')}
                  className={`py-3 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    modalActiveTab === 'curriculum'
                      ? 'border-[#173A7C] text-[#173A7C] bg-white rounded-t-xl shadow-xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Video className="w-4 h-4 text-blue-600" />
                  <span>2. الوحدات والمقاطع الفرعية ({formSections.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalActiveTab('attachments')}
                  className={`py-3 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    modalActiveTab === 'attachments'
                      ? 'border-[#173A7C] text-[#173A7C] bg-white rounded-t-xl shadow-xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Paperclip className="w-4 h-4 text-emerald-600" />
                  <span>3. الحقيبة والمرفقات PDF ({formAttachments.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalActiveTab('exam')}
                  className={`py-3 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    modalActiveTab === 'exam'
                      ? 'border-[#173A7C] text-[#173A7C] bg-white rounded-t-xl shadow-xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span>4. الاختبار النهائي {hasFinalExam ? '✓' : ''}</span>
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveCourse} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
                {/* ═══════════════════════════════════════════════════════════ */}
                {/* TAB 1: BASIC INFO & COVER */}
                {/* ═══════════════════════════════════════════════════════════ */}
                {modalActiveTab === 'basic' && (
                  <div className="space-y-6 animate-fade-in-up">
                    {/* Course Cover Image Section */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <label className="block text-xs font-black text-slate-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-[#173A7C]" />
                          <span>صورة وغلاف الدورة التدريبية (Thumbnail)</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">يتم الحفظ في Supabase والموقع فوراً</span>
                      </label>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Live Preview Box */}
                        <div className="w-32 h-24 rounded-2xl bg-gradient-to-br from-[#0c234b] to-[#173A7C] p-2 flex items-center justify-center shrink-0 border border-slate-200 shadow-xs relative overflow-hidden">
                          <img
                            src={formImage || '/logo.webp'}
                            alt="Preview"
                            className="max-h-20 max-w-full object-contain drop-shadow-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo.webp';
                            }}
                          />
                        </div>

                        <div className="flex-1 w-full space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={formImage}
                              onChange={(e) => setFormImage(e.target.value)}
                              placeholder="رابط الصورة (URL) أو اختر ملف من جهازك..."
                              className="flex-1 px-3.5 py-2 text-xs font-bold text-slate-800 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C]"
                            />
                            <button
                              type="button"
                              onClick={() => courseImageInputRef.current?.click()}
                              disabled={isUploadingImage}
                              className="px-4 py-2 rounded-xl bg-[#173A7C] hover:bg-[#1E4D9D] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                            >
                              {isUploadingImage ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <UploadCloud className="w-4 h-4" />
                              )}
                              <span>رفع صورة</span>
                            </button>
                            <input
                              ref={courseImageInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleCourseImageUpload}
                              className="hidden"
                            />
                          </div>

                          {/* Presets */}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold">
                            <span>أغلفة جاهزة:</span>
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
                        <div>
                          <label className="block text-xs font-black text-slate-700 mb-1.5">التصنيف الأكاديمي</label>
                          <select
                            value={formCategory}
                            onChange={(e) => setFormCategory(e.target.value)}
                            className="w-full px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C]"
                          >
                            <option value="tech">تقنية وبرمجة</option>
                            <option value="admin">أعمال مكتبية</option>
                            <option value="data">إدخال بيانات</option>
                            <option value="languages">لغات وترجمة</option>
                            <option value="corporate">إدارة وأعمال وسلامة</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-black text-slate-700 mb-1.5">المحاضر المعتمد</label>
                          <input
                            type="text"
                            value={formTrainer}
                            onChange={(e) => setFormTrainer(e.target.value)}
                            placeholder="اسم المدرب"
                            className="w-full px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C]"
                          />
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
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-[#173A7C] font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <UploadCloud className="w-3.5 h-3.5" />
                                <span>{sec.fileName ? 'تغيير الملف' : 'إرفاق ملف PDF للوحدة'}</span>
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

                                      <div className="w-20">
                                        <input
                                          type="text"
                                          value={sub.duration}
                                          onChange={(e) => handleUpdateSubItem(secIdx, subIdx, 'duration', e.target.value)}
                                          placeholder="15 دقيقة"
                                          className="w-full px-2 py-1 text-[11px] font-bold text-slate-700 bg-white rounded-lg border border-slate-200"
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
                                          placeholder="معرف فيديو Bunny Stream (GUID) أو رابط YouTube..."
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
                                              <span>رفع فيديو Bunny</span>
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
                                    <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200 text-xs">
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
                                        className="px-3 py-1 rounded-lg bg-[#173A7C] text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                                      >
                                        <UploadCloud className="w-3.5 h-3.5" />
                                        <span>رفع ملف المستند</span>
                                      </button>
                                    </div>
                                  )}

                                  {sub.type === 'quiz' && (
                                    <div className="p-3 bg-white rounded-lg border border-amber-200 space-y-2 text-xs">
                                      <div className="flex items-center justify-between font-bold text-slate-800">
                                        <span className="flex items-center gap-1 text-amber-700">
                                          <HelpCircle className="w-4 h-4" />
                                          <span>اختبار قصير للوحدة ({sub.quizData?.questions?.length || 1} أسئلة)</span>
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 font-medium">
                                        سيتمكن الطالب من أداء هذا الاختبار التفاعلي وحساب نتيجته فوراً في منصة الطالب.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* ➕ Add Sub-Lesson / Sub-Video Button */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => handleAddSubItemToSection(secIdx, 'video')}
                                className="flex-1 py-2 px-3 rounded-xl border border-dashed border-[#173A7C]/40 bg-blue-50/50 hover:bg-blue-50 text-[#173A7C] text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5 text-blue-600" />
                                <span>➕ إضافة مقطع / فيديو فرعي داخل هذا الدرس</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleAddSubItemToSection(secIdx, 'pdf')}
                                className="py-2 px-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                                title="إضافة ملف PDF فرعي"
                              >
                                <Paperclip className="w-3.5 h-3.5" />
                                <span>+ ملف PDF</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleAddSubItemToSection(secIdx, 'quiz')}
                                className="py-2 px-3 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-50 text-amber-800 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                                title="إضافة كويز تقييمي"
                              >
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>+ كويز</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Add Section Button */}
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#2A65C7] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
                    >
                      <Plus className="w-4 h-4 text-emerald-300" />
                      <span>إضافة وحدة / درس رئيسي جديد للمنهج التدريبي</span>
                    </button>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* TAB 3: COURSE ATTACHMENTS (PDF / WORD / STUDY BAG) */}
                {/* ═══════════════════════════════════════════════════════════ */}
                {modalActiveTab === 'attachments' && (
                  <div className="space-y-6 animate-fade-in-up">
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/50 via-slate-50 to-emerald-50/30 border-2 border-emerald-200/80 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#0D5C3A] text-white flex items-center justify-center shadow-xs">
                            <Paperclip className="w-5 h-5 text-emerald-300" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                              <span>الحقيبة التدريبية والمرفقات العامة للدورة</span>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-black">
                                {formAttachments.length} ملفات
                              </span>
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                              ارفع العروض التدريبية (PowerPoint)، ملخصات الدورة (PDF)، كراسات التمارين، ونماذج العمل (Word) 📄
                            </p>
                          </div>
                        </div>

                        <div>
                          <input
                            ref={attachmentFileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                            onChange={handleCourseBagAttachmentUpload}
                            className="hidden"
                            id="course-bag-upload-input"
                          />
                          <label
                            htmlFor="course-bag-upload-input"
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D5C3A] hover:bg-[#117349] text-white text-xs font-black cursor-pointer shadow-xs transition-all ${
                              isUploadingAttachment ? 'opacity-50 pointer-events-none' : ''
                            }`}
                          >
                            {isUploadingAttachment ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>جاري الرفع...</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="w-4 h-4" />
                                <span>رفع ملف جديد للحقيبة</span>
                              </>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Attachments List */}
                      {formAttachments.length === 0 ? (
                        <div className="p-8 rounded-xl bg-white border border-slate-200 text-center space-y-2">
                          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                          <div className="text-xs font-black text-slate-700">لم يتم إرفاق ملفات بالحقيبة حتى الآن</div>
                          <p className="text-[11px] text-slate-400">
                            اضغط على زر "رفع ملف جديد للحقيبة" أعلاه لإضافة كتب أو عروض PDF أو ملفات Word
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {formAttachments.map((att, attIdx) => (
                            <div
                              key={att.id || attIdx}
                              className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-2xs hover:border-emerald-300 transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <h5 className="font-bold text-slate-800 text-xs truncate" title={att.title}>
                                    {att.title}
                                  </h5>
                                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    {att.fileSize} · {att.fileType.toUpperCase()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <a
                                  href={att.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors"
                                  title="معاينة وتحميل"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => setFormAttachments((prev) => prev.filter((_, idx) => idx !== attIdx))}
                                  className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                  title="حذف هذا الملف"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* TAB 4: FINAL COURSE EXAM BUILDER */}
                {/* ═══════════════════════════════════════════════════════════ */}
                {modalActiveTab === 'exam' && (
                  <div className="space-y-6 animate-fade-in-up">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900">الاختبار النهائي الشامل للدورة</h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                              يؤديه المتدرب بعد إكمال كافة الدروس لإصدار شهادة الإتمام المعتمدة 🎓
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

                {/* Modal Footer Controls */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>

                  <div className="flex items-center gap-2">
                    {modalActiveTab !== 'basic' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (modalActiveTab === 'exam') setModalActiveTab('attachments');
                          else if (modalActiveTab === 'attachments') setModalActiveTab('curriculum');
                          else if (modalActiveTab === 'curriculum') setModalActiveTab('basic');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
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
                        className="px-4 py-2.5 rounded-xl bg-[#173A7C] hover:bg-[#1E4D9D] text-white font-bold text-xs cursor-pointer"
                      >
                        التالي ➔
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>جاري الحفظ والمزامنة السحابية...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{editingCourse ? 'حفظ وتحديث كامل التعديلات ⚡' : 'نشر الدورة مع المنهج والمرفقات 🚀'}</span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#0c234b] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                    <Video className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-black">
                        Bunny Stream DRM
                      </span>
                      <span className="text-xs text-emerald-300 font-bold">مكتبة رقم: #729792</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black mt-0.5">{selectedCourseForLessons.title}</h3>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCourseForLessons(null);
                    setPreviewVideoUrl(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* 1. Add New Lesson & Upload Section */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#173A7C]" />
                      <span>إضافة محاضرة أو درس جديد للدورة</span>
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setUploadMethod('file')}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition-colors cursor-pointer ${
                          uploadMethod === 'file'
                            ? 'bg-[#173A7C] text-white'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        رفع فيديو مباشر (Bunny Stream)
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
                          المدة التقريبية
                        </label>
                        <input
                          type="text"
                          value={newLessonDuration}
                          onChange={(e) => setNewLessonDuration(e.target.value)}
                          placeholder="مثال: 30 دقيقة"
                          className="w-full px-3.5 py-2 text-xs font-bold text-slate-800 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C]"
                        />
                      </div>
                    </div>

                    {uploadMethod === 'file' ? (
                      <div className="p-4 rounded-xl bg-white border-2 border-dashed border-slate-200 text-center space-y-2">
                        <UploadCloud className="w-8 h-8 text-[#173A7C] mx-auto" />
                        <div className="text-xs font-black text-slate-700">
                          اختر ملف الفيديو للرفع المباشر إلى Bunny.net Stream
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                          يدعم صيغ MP4, MOV, MKV المشفرة والمحمية ضد القرصنة الرقمية
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
                          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 text-right flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{uploadSuccess}</span>
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
                        <label className="block text-[11px] font-black text-slate-700 mb-1">
                          معرف الفيديو من Bunny.net (Video ID / GUID) أو كود التضمين
                        </label>
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
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
                        <PlayCircle className="w-4 h-4" />
                        <span>معاينة مشغل الفيديو التفاعلي</span>
                      </div>
                      <button
                        onClick={() => setPreviewVideoUrl(null)}
                        className="text-xs text-slate-400 hover:text-white cursor-pointer"
                      >
                        إغلاق المشغل
                      </button>
                    </div>
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                      {previewVideoUrl.includes('-') && previewVideoUrl.length > 20 ? (
                        <iframe
                          src={`https://iframe.mediadelivery.net/embed/729792/${previewVideoUrl}?autoplay=true&loop=false&muted=false&preload=true`}
                          loading="lazy"
                          className="border-0 absolute top-0 left-0 h-full w-full"
                          allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                          allowFullScreen={true}
                        />
                      ) : (
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${previewVideoUrl}?autoplay=1`}
                          className="border-0 absolute top-0 left-0 h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
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
                                      ? `Bunny: ${lesson.videoUrl.substring(0, 10)}...`
                                      : `YouTube: ${lesson.videoUrl}`
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
                                onClick={() => setPreviewVideoUrl(lesson.videoUrl)}
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
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>جميع الفيديوهات مشفرة تلقائياً وتعمل مع تقنية الحماية من القرصنة وتوثيق الطالب</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCourseForLessons(null);
                    setPreviewVideoUrl(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black cursor-pointer transition-colors"
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
