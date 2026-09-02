'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as tus from 'tus-js-client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Search,
  Users,
  Clock,
  DollarSign,
  Edit3,
  Trash2,
  CheckCircle2,
  Sparkles,
  X,
  Layers,
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
import { QuizData, QuizQuestion, CourseAttachment, SubLessonItem, Course } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { DeviceImageUploader } from '@/components/dashboard/DeviceImageUploader';

interface CourseItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  rawCategory?: string;
  type?: string;
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
  onProgress: (progress: number) => void
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

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [instructorName, setInstructorName] = useState('المدرب المعتمد');

  const [modalActiveTab, setModalActiveTab] = useState<'basic' | 'curriculum' | 'attachments' | 'exam'>('basic');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('tech');
  const [formLevel, setFormLevel] = useState('all');
  const [formTrainer, setFormTrainer] = useState('المدرب المعتمد');
  const [formPrice, setFormPrice] = useState('500');
  const [formHours, setFormHours] = useState('30');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('/1.png');

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

  const [formSections, setFormSections] = useState<FormSectionItem[]>([]);

  const [formAttachments, setFormAttachments] = useState<FormAttachmentItem[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [attachmentUploadProgress, setAttachmentUploadProgress] = useState(0);
  const attachmentFileInputRef = useRef<HTMLInputElement | null>(null);

  const [hasFinalExam, setHasFinalExam] = useState(false);
  const [formFinalExam, setFormFinalExam] = useState<QuizData>({
    title: 'الاختبار النهائي للبرنامج التدريبي',
    passingScore: 70,
    questions: [
      {
        id: 'q-1',
        question: 'ما هو المبدأ الأساسي في تطبيق معايير الجودة والتحسين المستمر؟',
        options: [
          'التقييم المستمر وقياس مؤشرات الأداء',
          'زيادة الإجراءات الروتينية غير الضرورية',
          'إلغاء التوثيق المؤسسي',
          'تقليل تدريب الكوادر البشرية',
        ],
        correctIndex: 0,
        explanation: 'التحسين المستمر يقوم على المتابعة الدورية وقياس مؤشرات الأداء.',
      },
    ],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const courseImageInputRef = useRef<HTMLInputElement | null>(null);

  const [uploadingTarget, setUploadingTarget] = useState<{ secIdx: number; subIdx?: number } | null>(null);
  const [lessonUploadProgress, setLessonUploadProgress] = useState<number>(0);
  const formLessonVideoInputRef = useRef<HTMLInputElement | null>(null);

  const [uploadingAttachmentTarget, setUploadingAttachmentTarget] = useState<{ secIdx: number; subIdx?: number } | null>(null);
  const sectionAttachmentInputRef = useRef<HTMLInputElement | null>(null);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadCourses = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        if (profile?.full_name) {
          setInstructorName(profile.full_name);
        }
      }

      const res = await fetch(`/api/courses?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.courses)) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error('Error fetching instructor courses:', err);
      showToast('تعذر تحميل الدورات من الخادم', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
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

  const openCreateModal = () => {
    setEditingCourse(null);
    setModalActiveTab('basic');
    setFormTitle('');
    setFormSlug('');
    setFormCategory('tech');
    setFormLevel('all');
    setFormTrainer(instructorName);
    setFormPrice('500');
    setFormHours('30');
    setFormDescription('');
    setFormImage('/1.png');
    setFormAttachments([]);
    setHasFinalExam(false);
    setIsAddingNewCategory(false);
    setNewCategoryName('');

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
    setFormTrainer(course.trainer || instructorName);
    setFormPrice(String(course.rawPrice ?? 500));
    setFormHours(String(course.hours ?? 30));
    setFormDescription(course.description || '');
    setFormImage(course.image || '/1.png');
    setIsAddingNewCategory(false);
    setNewCategoryName('');

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
            duration: '20 دقيقة',
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
      showToast('يجب أن تحتوي الدورة على وحدة تدريبية واحدة على الأقل', 'error');
      return;
    }
    setFormSections((prev) => prev.filter((_, idx) => idx !== secIdx));
  };

  const handleUpdateSection = (secIdx: number, field: keyof FormSectionItem, value: any) => {
    setFormSections((prev) => {
      const copy = [...prev];
      copy[secIdx] = { ...copy[secIdx], [field]: value };
      return copy;
    });
  };

  const handleAddSubItem = (secIdx: number) => {
    setFormSections((prev) => {
      const copy = [...prev];
      const nextSubNum = (copy[secIdx].subItems?.length || 0) + 1;
      const newSub: FormSubLessonItem = {
        id: `sub-${Date.now()}-${secIdx + 1}-${nextSubNum}`,
        title: `الدرس ${nextSubNum}: `,
        duration: '15 دقيقة',
        videoUrl: '',
        type: 'video',
        isLocked: false,
      };
      copy[secIdx].subItems = [...(copy[secIdx].subItems || []), newSub];
      return copy;
    });
  };

  const handleRemoveSubItem = (secIdx: number, subIdx: number) => {
    setFormSections((prev) => {
      const copy = [...prev];
      if (copy[secIdx].subItems.length <= 1) {
        showToast('يجب أن تحتوي الوحدة على درس واحد على الأقل', 'error');
        return copy;
      }
      copy[secIdx].subItems = copy[secIdx].subItems.filter((_, idx) => idx !== subIdx);
      return copy;
    });
  };

  const handleUpdateSubItem = (secIdx: number, subIdx: number, field: keyof FormSubLessonItem, value: any) => {
    setFormSections((prev) => {
      const copy = [...prev];
      const subCopy = [...copy[secIdx].subItems];
      subCopy[subIdx] = { ...subCopy[subIdx], [field]: value };
      copy[secIdx].subItems = subCopy;
      return copy;
    });
  };

  const triggerVideoUploadForTarget = (secIdx: number, subIdx?: number) => {
    setUploadingTarget({ secIdx, subIdx });
    if (formLessonVideoInputRef.current) {
      formLessonVideoInputRef.current.value = '';
      formLessonVideoInputRef.current.click();
    }
  };

  const handleVideoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingTarget === null) return;

    const { secIdx, subIdx } = uploadingTarget;
    const lessonTitle =
      subIdx !== undefined
        ? formSections[secIdx]?.subItems?.[subIdx]?.title || 'درس جديد'
        : formSections[secIdx]?.title || 'وحدة جديدة';

    setLessonUploadProgress(1);

    try {
      const calculatedDuration = await extractVideoDuration(file);
      const videoId = await uploadVideoSecurely(file, `${formTitle} - ${lessonTitle}`, (progress) => {
        setLessonUploadProgress(progress);
      });

      if (subIdx !== undefined) {
        handleUpdateSubItem(secIdx, subIdx, 'videoUrl', videoId);
        handleUpdateSubItem(secIdx, subIdx, 'duration', calculatedDuration);
      } else {
        handleUpdateSection(secIdx, 'videoUrl', videoId);
        handleUpdateSection(secIdx, 'duration', calculatedDuration);
      }

      showToast(`تم رفع ومعالجة الفيديو بنجاح على سيرفر البث (${calculatedDuration})`);
    } catch (err: any) {
      console.error('Video upload error:', err);
      showToast(err.message || 'فشل رفع الفيديو', 'error');
    } finally {
      setUploadingTarget(null);
      setLessonUploadProgress(0);
    }
  };

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
        showToast('تم رفع وتحديث صورة غلاف الدورة بنجاح');
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

      const formattedCurriculum = formSections.map((sec, idx) => ({
        id: sec.id || `sec-${idx + 1}`,
        title: sec.title.trim() || `الوحدة ${idx + 1}`,
        duration: sec.duration || '30 دقيقة',
        videoUrl: sec.videoUrl || '',
        type: sec.type || 'video',
        fileUrl: sec.fileUrl,
        fileName: sec.fileName,
        fileSize: sec.fileSize,
        isLocked: sec.isLocked ?? false,
        quizData: sec.quizData,
        items: (sec.subItems || []).map((sub, subIdx) => ({
          id: sub.id || `sub-${idx + 1}-${subIdx + 1}`,
          title: sub.title.trim() || `الدرس ${subIdx + 1}`,
          duration: sub.duration || '15 دقيقة',
          videoUrl: sub.videoUrl || '',
          type: sub.type || 'video',
          fileUrl: sub.fileUrl,
          fileName: sub.fileName,
          fileSize: sub.fileSize,
          isLocked: sub.isLocked ?? false,
          quizData: sub.quizData,
        })),
      }));

      const totalLessons = formattedCurriculum.reduce(
        (acc, sec) => acc + (sec.items && sec.items.length > 0 ? sec.items.length : 1),
        0
      );

      const coursePayload: any = {
        title: formTitle.trim(),
        slug: formSlug.trim() || formTitle.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0621-\u064A-]+/g, ''),
        category: formCategory,
        trainer: formTrainer || instructorName,
        price: priceNum,
        hours: hoursNum,
        duration: `${hoursNum} ساعة تدريبية`,
        lessonsCount: totalLessons,
        description: formDescription.trim(),
        image: formImage || '/1.png',
        curriculum: formattedCurriculum,
        attachments: formAttachments,
        finalExam: hasFinalExam ? formFinalExam : undefined,
      };

      if (editingCourse?.id) {
        coursePayload.id = editingCourse.id;
      }

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coursePayload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(editingCourse ? 'تم تحديث الدورة والمناهج بنجاح!' : 'تم إنشاء الدورة التدريبية بنجاح!');
        setIsModalOpen(false);
        setEditingCourse(null);
        await loadCourses();
      } else {
        throw new Error(data.error || 'تعذر حفظ الدورة');
      }
    } catch (err: any) {
      console.error('Save course error:', err);
      showToast(err.message || 'حدث خطأ أثناء حفظ الدورة', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الدورة "${courseTitle}" نهائياً؟`)) {
      return;
    }

    try {
      const res = await fetch(`/api/courses?id=${courseId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('تم حذف الدورة التدريبية بنجاح');
        await loadCourses();
      } else {
        throw new Error(data.error || 'فشل حذف الدورة');
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast(err.message || 'حدث خطأ أثناء الحذف', 'error');
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory || c.rawCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
      <input
        type="file"
        ref={formLessonVideoInputRef}
        onChange={handleVideoFileSelected}
        accept="video/*"
        className="hidden"
      />
      <input
        type="file"
        ref={sectionAttachmentInputRef}
        onChange={handleAttachmentFileSelected}
        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
        className="hidden"
      />
      <input
        type="file"
        ref={attachmentFileInputRef}
        onChange={handleCourseBagAttachmentUpload}
        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
        className="hidden"
      />
      <input
        type="file"
        ref={courseImageInputRef}
        onChange={handleCourseImageUpload}
        accept="image/*"
        className="hidden"
      />

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-black backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600/95 text-white border-emerald-400 shadow-emerald-600/20'
                : 'bg-rose-600/95 text-white border-rose-400 shadow-rose-600/20'
            }`}
          >
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20 liquid-glass-hero p-6 sm:p-8 rounded-2xl sm:rounded-3xl liquid-glass-hover overflow-hidden student-card-accent">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/50 mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-[#173A7C] text-xs font-black border border-blue-200/90 shadow-xs">
            <BookOpen className="w-4 h-4 text-[#173A7C]" />
            <span>إدارة البرامج والمقررات والمناهج الدراسية</span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-300 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{courses.length} دورات معتمدة</span>
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#173A7C] via-[#1E4D9D] to-[#2563EB] text-white flex items-center justify-center shadow-xl shadow-[#173A7C]/25 border border-white/40 shrink-0">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] student-heading-h1">
                  دوراتي ومقرراتي <span className="student-name-gradient">التدريبية</span>
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed pr-1 sm:pr-2">
              إضافة وتعديل البرامج التدريبية، رفع الفيديوهات المباشرة، إدارة المناهج التفاعلية، وإرفاق الحقائب والاختبارات النهائية.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#5CB07C] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-[#173A7C]/20 hover:opacity-95 transition-all cursor-pointer border border-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة دورة تدريبية جديدة</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-blue-50 text-[#173A7C] border-blue-200">
              مقرراتي
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">إجمالي المقررات النشطة</span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#173A7C] tracking-tight">{courses.length} مقرر</h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-emerald-50 text-emerald-800 border-emerald-300">
              المتدربون
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">إجمالي المتدربين المسجلين</span>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">284 متدرب</h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md">
              <Video className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-indigo-50 text-indigo-900 border-indigo-200">
              المحتوى المرئي
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">إجمالي الدروس المسجلة</span>
            <h3 className="text-2xl sm:text-3xl font-black text-indigo-700 tracking-tight">
              {courses.reduce((acc, c) => acc + (c.lessonsCount || 8), 0)} درس
            </h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <Clock className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-amber-50 text-amber-900 border-amber-300">
              الساعات الأكاديمية
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">إجمالي الساعات المعتمدة</span>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight">
              {courses.reduce((acc, c) => acc + (c.hours || 30), 0)} ساعة
            </h3>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في المقررات والمناهج والوحدات..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-slate-50/80"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#173A7C] text-white shadow-sm font-black'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            كافة المقررات
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#173A7C] text-white shadow-sm font-black'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
          <p className="text-xs font-bold text-slate-500">جاري تحميل المقررات...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm text-center space-y-3">
          <BookOpen className="w-12 h-12 text-[#173A7C]/30 mx-auto" />
          <h3 className="text-base font-black text-slate-900">لا توجد دورات مطابقة للبحث</h3>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-[#173A7C] text-white text-xs font-black cursor-pointer"
          >
            + إضافة دورة تدريبية جديدة
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="p-4 sm:p-5 rounded-3xl liquid-glass-card liquid-glass-hover flex flex-col justify-between space-y-4 student-card-accent group relative overflow-hidden"
            >
              <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
                <img
                  src={course.image || '/1.png'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/1.png';
                  }}
                />

                <div className="absolute top-3 right-3 left-3 flex items-center justify-between gap-2 pointer-events-none">
                  <span className="px-3 py-1 rounded-xl text-[11px] font-black bg-white/95 text-[#173A7C] shadow-md backdrop-blur-md border border-slate-200/60">
                    {course.category || 'تقنية وبرمجة'}
                  </span>

                  <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-[#173A7C]/90 text-white shadow-md backdrop-blur-md border border-white/20">
                    {course.price ? `${course.price} ر.س` : 'معتمد'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="student-heading-h3 !text-sm sm:!text-[15px] leading-snug line-clamp-2 min-h-[42px]">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                  {course.description || 'برنامج تدريبي متكامل يؤهل المتدرب للحصول على شهادة معتمدة وإتقان المهارات العملية.'}
                </p>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50/90 border border-slate-200 text-center text-xs font-bold text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">الدروس</span>
                    <span className="font-black text-[#173A7C]">{course.lessonsCount || 10} درس</span>
                  </div>
                  <div className="border-r border-l border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">المدة</span>
                    <span className="font-black text-slate-800">{course.hours || 30} س</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">المتدربون</span>
                    <span className="font-black text-emerald-700">{course.students || 45}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-200/80">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(course)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#173A7C] text-white hover:bg-[#1E4D9D] text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>إدارة المنهج والدروس</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCourse(course.id, course.title)}
                    className="w-full py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-700 text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <Link
                    href={`/courses/${course.slug || course.id}`}
                    target="_blank"
                    className="text-[#173A7C] hover:underline font-black flex items-center gap-1"
                  >
                    <span>معاينة صفحة الدورة</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    منشور ومتاح
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
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
              className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-white/80 overflow-hidden my-auto flex flex-col max-h-[90vh]"
            >
              <div className="p-5 bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#173A7C] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                    <BookOpen className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-black text-base sm:text-lg">
                      {editingCourse ? `إدارة وتعديل: ${editingCourse.title}` : 'إنشاء دورة تدريبية جديدة'}
                    </h3>
                    <p className="text-xs text-blue-100 font-bold">بوابة المحاضر لإدارة المناهج والوسائط والاختبارات</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar shrink-0">
                <button
                  type="button"
                  onClick={() => setModalActiveTab('basic')}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
                    modalActiveTab === 'basic'
                      ? 'bg-[#173A7C] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>1. البيانات الأساسية والغلاف</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalActiveTab('curriculum')}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
                    modalActiveTab === 'curriculum'
                      ? 'bg-[#173A7C] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>2. المناهج والدروس والفيديوهات ({formSections.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalActiveTab('attachments')}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
                    modalActiveTab === 'attachments'
                      ? 'bg-[#173A7C] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Paperclip className="w-4 h-4" />
                  <span>3. الحقيبة والمرفقات ({formAttachments.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalActiveTab('exam')}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
                    modalActiveTab === 'exam'
                      ? 'bg-[#173A7C] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>4. الاختبار النهائي {hasFinalExam && '✓'}</span>
                </button>
              </div>

              <form onSubmit={handleSaveCourse} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {modalActiveTab === 'basic' && (
                  <div className="space-y-4 text-xs font-bold">
                    <div className="space-y-1">
                      <label className="text-slate-700 block">عنوان الدورة التدريبية *</label>
                      <input
                        type="text"
                        required
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="مثال: دبلوم التسامح والسلام والمواطنة الصالحة..."
                        className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none text-xs font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-slate-700 block">التصنيف والمسار *</label>
                          <button
                            type="button"
                            onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                            className="text-[#173A7C] text-[10px] hover:underline font-black cursor-pointer"
                          >
                            {isAddingNewCategory ? 'إلغاء' : '+ تصنيف جديد'}
                          </button>
                        </div>

                        {isAddingNewCategory ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder="اسم التصنيف الجديد..."
                              className="w-full p-2 rounded-xl border border-blue-300 outline-none text-xs"
                            />
                            <button
                              type="button"
                              onClick={handleAddNewCategory}
                              className="px-2.5 py-2 rounded-xl bg-[#173A7C] text-white text-xs cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <select
                            value={formCategory}
                            onChange={(e) => setFormCategory(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none bg-white text-xs font-bold"
                          >
                            {categoriesList.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-700 block">المحاضر المعتمد</label>
                        <input
                          type="text"
                          value={formTrainer}
                          onChange={(e) => setFormTrainer(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none bg-slate-50 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-700 block">المستوى الأكاديمي</label>
                        <select
                          value={formLevel}
                          onChange={(e) => setFormLevel(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none bg-white text-xs font-bold"
                        >
                          <option value="all">كافة المستويات</option>
                          <option value="beginner">مبتدئ</option>
                          <option value="intermediate">متوسط</option>
                          <option value="advanced">متقدم</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-slate-700 block">السعر (ر.س) *</label>
                        <input
                          type="text"
                          required
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          placeholder="500"
                          className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none text-xs font-black text-[#173A7C]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-700 block">عدد الساعات المعتمدة *</label>
                        <input
                          type="text"
                          required
                          value={formHours}
                          onChange={(e) => setFormHours(e.target.value)}
                          placeholder="30"
                          className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none text-xs"
                        />
                      </div>
                    </div>

                    <DeviceImageUploader
                      value={formImage}
                      onChange={(url) => setFormImage(url)}
                      folder="courses"
                      slug={formSlug || 'course'}
                      label="صورة وغلاف الدورة التدريبية (رفع مباشر من جهازك مع ضغط WebP)"
                      recommendedSize="المقاس المثالي: 1280 × 720 بكسل (WebP / JPG / PNG)"
                      aspectRatio="video"
                    />

                    <div className="space-y-1">
                      <label className="text-slate-700 block">وصف البرنامج التدريبي ومخرجات التعلم *</label>
                      <textarea
                        rows={4}
                        required
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="اشرح أهداف البرنامج والمحاور الرئيسية والفئة المستهدفة..."
                        className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none resize-none text-xs font-medium leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {modalActiveTab === 'curriculum' && (
                  <div className="space-y-5">
                    {lessonUploadProgress > 0 && (
                      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs font-black space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                            <span>جاري رفع ومعالجة الفيديو على سيرفر البث الآمن (Bunny Stream)...</span>
                          </span>
                          <span className="font-mono">{lessonUploadProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-indigo-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 transition-all duration-300"
                            style={{ width: `${lessonUploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">هيكلية المناهج والوحدات والدروس</h4>
                        <p className="text-[11px] text-slate-500 font-bold">يمكنك تقسيم المقرر لوحدات، وداخل كل وحدة مقاطع ودروس تفاعلية</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSection}
                        className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-900 hover:bg-indigo-100 font-black text-xs flex items-center gap-1.5 cursor-pointer border border-indigo-200"
                      >
                        <PlusCircle className="w-4 h-4 text-indigo-600" />
                        <span>+ إضافة وحدة تدريبية</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formSections.map((sec, secIdx) => (
                        <div
                          key={sec.id || secIdx}
                          className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                            <div className="flex-1 flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-[#173A7C] text-white flex items-center justify-center text-xs font-black shrink-0">
                                {secIdx + 1}
                              </span>
                              <input
                                type="text"
                                value={sec.title}
                                onChange={(e) => handleUpdateSection(secIdx, 'title', e.target.value)}
                                placeholder="عنوان الوحدة التدريبية..."
                                className="flex-1 p-2 rounded-xl border border-slate-300 bg-white text-xs font-black outline-none focus:border-[#173A7C]"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={sec.duration}
                                onChange={(e) => handleUpdateSection(secIdx, 'duration', e.target.value)}
                                placeholder="المدة (مثال: 45 دقيقة)"
                                className="w-28 p-2 rounded-xl border border-slate-300 bg-white text-xs font-bold outline-none text-center"
                              />

                              <button
                                type="button"
                                onClick={() => handleRemoveSection(secIdx)}
                                className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                                title="حذف الوحدة"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3 pr-2 sm:pr-4 border-r-2 border-indigo-200">
                            <div className="flex items-center justify-between text-xs font-black text-slate-700">
                              <span>الدروس والمقاطع داخل الوحدة ({sec.subItems?.length || 0})</span>
                              <button
                                type="button"
                                onClick={() => handleAddSubItem(secIdx)}
                                className="text-[#173A7C] hover:underline flex items-center gap-1 cursor-pointer text-xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>إضافة درس للمقطع</span>
                              </button>
                            </div>

                            {(sec.subItems || []).map((sub, subIdx) => (
                              <div
                                key={sub.id || subIdx}
                                className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3"
                              >
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                                  <div className="flex-1 flex items-center gap-2">
                                    <span className="text-slate-400 text-xs font-black shrink-0">
                                      {secIdx + 1}.{subIdx + 1}
                                    </span>
                                    <input
                                      type="text"
                                      value={sub.title}
                                      onChange={(e) => handleUpdateSubItem(secIdx, subIdx, 'title', e.target.value)}
                                      placeholder="عنوان الدرس أو المقطع..."
                                      className="flex-1 p-2 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-[#173A7C]"
                                    />
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={sub.duration}
                                      onChange={(e) => handleUpdateSubItem(secIdx, subIdx, 'duration', e.target.value)}
                                      placeholder="المدة"
                                      className="w-24 p-2 rounded-xl border border-slate-200 text-xs font-bold text-center"
                                    />

                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSubItem(secIdx, subIdx)}
                                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs font-bold">
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-600">فيديو الدرس (بث آمن)</span>
                                      <button
                                        type="button"
                                        onClick={() => triggerVideoUploadForTarget(secIdx, subIdx)}
                                        className="text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer text-[11px]"
                                      >
                                        <UploadCloud className="w-3.5 h-3.5" />
                                        <span>رفع فيديو من الجهاز</span>
                                      </button>
                                    </div>
                                    <input
                                      type="text"
                                      value={sub.videoUrl}
                                      onChange={(e) => handleUpdateSubItem(secIdx, subIdx, 'videoUrl', e.target.value)}
                                      placeholder="معرف الفيديو أو الرابط..."
                                      className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-600">مرفق الدرس (PDF / كود)</span>
                                      <button
                                        type="button"
                                        onClick={() => triggerAttachmentUploadForTarget(secIdx, subIdx)}
                                        className="text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer text-[11px]"
                                      >
                                        <Paperclip className="w-3.5 h-3.5" />
                                        <span>رفع ملف مرفق</span>
                                      </button>
                                    </div>
                                    <input
                                      type="text"
                                      value={sub.fileUrl || ''}
                                      onChange={(e) => handleUpdateSubItem(secIdx, subIdx, 'fileUrl', e.target.value)}
                                      placeholder="رابط الملف المرفق..."
                                      className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {modalActiveTab === 'attachments' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">حقيبة الدورة والمرفقات العامة</h4>
                        <p className="text-[11px] text-slate-500 font-bold">الملفات الدراسية، الكتب الإلكترونية، والمراجع القابلة للتحميل</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => attachmentFileInputRef.current?.click()}
                        disabled={isUploadingAttachment}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingAttachment ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>جاري الرفع {attachmentUploadProgress}%</span>
                          </>
                        ) : (
                          <>
                            <Paperclip className="w-4 h-4" />
                            <span>رفع ملف جديد للحقيبة</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Visual Progress Bar for Attachment Bag */}
                    {isUploadingAttachment && (
                      <div className="w-full space-y-1.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                        <div className="flex items-center justify-between text-xs font-black text-emerald-900">
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                            <span>جاري رفع ومعالجة المستند (PDF / Word)...</span>
                          </span>
                          <span className="font-mono text-emerald-700">{attachmentUploadProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-300 rounded-full"
                            style={{ width: `${attachmentUploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {formAttachments.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 text-xs font-bold text-slate-500">
                        <FolderOpen className="w-8 h-8 text-slate-400 mx-auto" />
                        <p>لا توجد ملفات مرفقة بالحقيبة حتى الآن</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {formAttachments.map((att) => (
                          <div
                            key={att.id}
                            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-black text-slate-900 block">{att.title}</span>
                                <span className="text-[10px] text-slate-400 font-normal">{att.fileSize}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveAttachmentFromBag(att.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {modalActiveTab === 'exam' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">تفعيل الاختبار النهائي للدورة</h4>
                        <p className="text-[11px] text-slate-500 font-bold">إلزام المتدرب باجتياز الاختبار للحصول على الشهادة</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={hasFinalExam}
                        onChange={(e) => setHasFinalExam(e.target.checked)}
                        className="w-5 h-5 accent-[#173A7C] cursor-pointer"
                      />
                    </div>

                    {hasFinalExam && (
                      <div className="space-y-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-200 text-xs font-bold">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-slate-700 block">عنوان الاختبار النهائي</label>
                            <input
                              type="text"
                              value={formFinalExam.title}
                              onChange={(e) => setFormFinalExam({ ...formFinalExam, title: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-700 block">نسبة درجة الاجتياز (%)</label>
                            <input
                              type="number"
                              min="50"
                              max="100"
                              value={formFinalExam.passingScore || 70}
                              onChange={(e) => setFormFinalExam({ ...formFinalExam, passingScore: Number(e.target.value) })}
                              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-slate-700 font-black">
                            عدد الأسئلة المسجلة في بنك الاختبار: {formFinalExam.questions?.length || 0}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-emerald-600 text-white font-black text-xs shadow-md hover:opacity-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري حفظ المناهج والدورة...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>حفظ واعتماد التعديلات بالكامل</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
