'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as tus from 'tus-js-client';
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
import { DeviceImageUploader } from '@/components/dashboard/DeviceImageUploader';

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

// â”€â”€ Video Duration Helper: Calculates actual video file duration in the browser â”€â”€
function formatVideoDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '15 Ø¯Ù‚ÙŠÙ‚Ø©';
  const totalSec = Math.round(seconds);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  if (hrs > 0) {
    return `${hrs} Ø³Ø§Ø¹Ø© Ùˆ ${mins} Ø¯Ù‚ÙŠÙ‚Ø©`;
  }
  if (mins > 0 && secs > 0) {
    return `${mins} Ø¯Ù‚ÙŠÙ‚Ø© Ùˆ ${secs} Ø«Ø§Ù†ÙŠØ©`;
  }
  if (mins > 0) {
    return `${mins} Ø¯Ù‚ÙŠÙ‚Ø©`;
  }
  return `${secs} Ø«Ø§Ù†ÙŠØ©`;
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
        resolve('15 Ø¯Ù‚ÙŠÙ‚Ø©');
      };

      setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve('15 Ø¯Ù‚ÙŠÙ‚Ø©');
      }, 3500);
    } catch {
      resolve('15 Ø¯Ù‚ÙŠÙ‚Ø©');
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
    throw new Error(credentials.error || 'ØªØ¹Ø°Ø± Ø¥Ù†Ø´Ø§Ø¡ Ø·Ù„Ø¨ Ø±ÙØ¹ Ø¢Ù…Ù†');
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
  const [formTrainer, setFormTrainer] = useState('Ø¯. Ù…Ø­Ù…Ø¯ Ø§Ù„Ù‚Ø­Ø·Ø§Ù†ÙŠ');
  const [formPrice, setFormPrice] = useState('500');
  const [formHours, setFormHours] = useState('30');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('/logo.webp');

  // Dynamic Categories & Instructors State
  const [categoriesList, setCategoriesList] = useState<{ id: string; label: string }[]>([
    { id: 'tech', label: 'ØªÙ‚Ù†ÙŠØ© ÙˆØ¨Ø±Ù…Ø¬Ø©' },
    { id: 'admin', label: 'Ø£Ø¹Ù…Ø§Ù„ Ù…ÙƒØªØ¨ÙŠØ©' },
    { id: 'data', label: 'Ø¥Ø¯Ø®Ø§Ù„ Ø¨ÙŠØ§Ù†Ø§Øª ÙˆÙ…Ø¹Ø§Ù„Ø¬Ø© Ù†ØµÙˆØµ' },
    { id: 'languages', label: 'Ù„ØºØ§Øª ÙˆØªØ±Ø¬Ù…Ø©' },
    { id: 'corporate', label: 'Ø¥Ø¯Ø§Ø±Ø© ÙˆØ£Ø¹Ù…Ø§Ù„ ÙˆØ³Ù„Ø§Ù…Ø©' },
    { id: 'cyber', label: 'Ø£Ù…Ù† Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ ÙˆØ´Ø¨ÙƒØ§Øª' },
    { id: 'design', label: 'ØªØµÙ…ÙŠÙ… ÙˆÙ…ÙˆÙ†ØªØ§Ø¬' },
  ]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [instructorsList, setInstructorsList] = useState<string[]>([
    'Ø¯. Ù…Ø­Ù…Ø¯ Ø§Ù„Ù‚Ø­Ø·Ø§Ù†ÙŠ',
    'Ø£. Ø¯. Ø³Ø§Ø±Ø© Ø§Ù„Ø¹ØªÙŠØ¨ÙŠ',
    'Ø¯. Ø®Ø§Ù„Ø¯ Ø§Ù„Ø¯ÙˆØ³Ø±ÙŠ',
    'Ù…. ÙÙ‡Ø¯ Ø§Ù„Ø³Ø¨ÙŠØ¹ÙŠ',
    'Ø£. Ø±ÙŠÙ… Ø§Ù„Ø¬Ù‡Ù†ÙŠ',
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
    title: 'Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ Ù„Ù„Ø¨Ø±Ù†Ø§Ù…Ø¬ Ø§Ù„ØªØ¯Ø±ÙŠØ¨ÙŠ',
    passingScore: 70,
    questions: [
      {
        id: 'q-1',
        question: 'Ù…Ø§ Ù‡Ùˆ Ø§Ù„Ù‡Ø¯Ù Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ù…Ù† ØªØ·Ø¨ÙŠÙ‚ Ù…Ø¹Ø§ÙŠÙŠØ± Ø§Ù„Ø§Ø³ØªØ¯Ø§Ù…Ø© ÙˆØ§Ù„Ø­ÙˆÙƒÙ…Ø© ÙÙŠ Ø§Ù„Ù…Ø¤Ø³Ø³Ø§ØªØŸ',
        options: [
          'ØªØ­Ù‚ÙŠÙ‚ Ø§Ù„ÙƒÙØ§Ø¡Ø© Ø§Ù„ØªØ´ØºÙŠÙ„ÙŠØ© ÙˆØ§Ù„Ø§Ù…ØªØ«Ø§Ù„ Ù„Ù„Ù…Ø¹Ø§ÙŠÙŠØ± Ø§Ù„Ø¯ÙˆÙ„ÙŠØ©',
          'Ø²ÙŠØ§Ø¯Ø© Ø§Ù„ØªÙƒØ§Ù„ÙŠÙ Ø§Ù„Ø¥Ø¯Ø§Ø±ÙŠØ© ÙˆØ§Ù„ØªØ´ØºÙŠÙ„ÙŠØ© ÙÙ‚Ø·',
          'Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ù„ÙˆØ§Ø¦Ø­ Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠØ© ÙˆØ§Ù„Ø¨ÙŠØ¦ÙŠØ©',
          'ØªÙ‚Ù„ÙŠØµ Ø­Ø¬Ù… Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ© Ø¨Ø§Ù„Ù…Ø¤Ø³Ø³Ø©',
        ],
        correctIndex: 0,
        explanation: 'ØªØ³Ø§Ø¹Ø¯ Ù…Ø¹Ø§ÙŠÙŠØ± Ø§Ù„Ø§Ø³ØªØ¯Ø§Ù…Ø© Ø¹Ù„Ù‰ Ø±ÙØ¹ ÙƒÙØ§Ø¡Ø© Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„ØªØ´ØºÙŠÙ„ÙŠØ© ÙˆØ¶Ù…Ø§Ù† Ø§Ù„Ø§Ù…ØªØ«Ø§Ù„ Ø§Ù„Ù†Ø¸Ø§Ù…ÙŠ.',
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

  // Video Player Preview Modal & Token Generation
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [previewSignedIframeUrl, setPreviewSignedIframeUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Standalone Lesson Upload State
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('20 Ø¯Ù‚ÙŠÙ‚Ø©');
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
          .filter((u: any) => u.role === 'Ù…Ø¯Ø±Ø¨' || u.role === 'INSTRUCTOR' || u.role === 'Ø£Ø¯Ù…Ù†')
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
      showToast('ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¯ÙˆØ±Ø§Øª Ù…Ù† Ø§Ù„Ø®Ø§Ø¯Ù…', 'error');
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

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // MODAL INITIALIZATION & ACTIONS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  const openCreateModal = () => {
    setEditingCourse(null);
    setModalActiveTab('basic');
    setFormTitle('');
    setFormSlug('');
    setFormCategory('tech');
    setFormLevel('all');
    setFormTrainer('Ø¯. Ù…Ø­Ù…Ø¯ Ø§Ù„Ù‚Ø­Ø·Ø§Ù†ÙŠ');
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
        title: 'Ø§Ù„ÙˆØ­Ø¯Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰: Ù…Ø¯Ø®Ù„ ÙˆÙ…ÙØ§Ù‡ÙŠÙ… Ø£Ø³Ø§Ø³ÙŠØ©',
        duration: '30 Ø¯Ù‚ÙŠÙ‚Ø©',
        videoUrl: '',
        type: 'video',
        isLocked: false,
        subItems: [
          {
            id: `sub-${Date.now()}-1-1`,
            title: 'Ø§Ù„Ø¯Ø±Ø³ Ø§Ù„Ø£ÙˆÙ„: Ù…Ù‚Ø¯Ù…Ø© ØªÙ…Ù‡ÙŠØ¯ÙŠØ© ÙˆØ£Ù‡Ø¯Ø§Ù Ø§Ù„Ø¨Ø±Ù†Ø§Ù…Ø¬',
            duration: '15 Ø¯Ù‚ÙŠÙ‚Ø©',
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
    setFormTrainer(course.trainer || 'Ø¯. Ù…Ø­Ù…Ø¯ Ø§Ù„Ù‚Ø­Ø·Ø§Ù†ÙŠ');
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
          title: att.title || 'Ù…Ø±ÙÙ‚ ØªØ¯Ø±ÙŠØ¨ÙŠ',
          fileUrl: att.fileUrl,
          fileType: att.fileType || 'pdf',
          fileSize: att.fileSize || 'Ù…Ù„Ù Ø±Ù‚Ù…ÙŠ',
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
              title: it.title || `Ù…Ù‚Ø·Ø¹ ${subIdx + 1}`,
              duration: it.duration || '15 Ø¯Ù‚ÙŠÙ‚Ø©',
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
              duration: '15 Ø¯Ù‚ÙŠÙ‚Ø©',
              videoUrl: subIdx === 0 ? (sec.videoUrl || '') : '',
              type: 'video',
              isLocked: false,
            }));
          } else {
            parsedSubItems = [
              {
                id: `sub-${Date.now()}-${idx + 1}-1`,
                title: sec.title || `Ø§Ù„Ù…Ù‚Ø·Ø¹ 1`,
                duration: sec.duration || '20 Ø¯Ù‚ÙŠÙ‚Ø©',
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
            title: sec.title || `Ø§Ù„ÙˆØ­Ø¯Ø© ${idx + 1}`,
            duration: sec.duration || '30 Ø¯Ù‚ÙŠÙ‚Ø©',
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
          title: 'Ø§Ù„ÙˆØ­Ø¯Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰: Ù…Ø¯Ø®Ù„ ÙˆÙ…ÙØ§Ù‡ÙŠÙ… Ø£Ø³Ø§Ø³ÙŠØ©',
          duration: '30 Ø¯Ù‚ÙŠÙ‚Ø©',
          videoUrl: '',
          type: 'video',
          isLocked: false,
          subItems: [
            {
              id: `sub-${Date.now()}-1-1`,
              title: 'Ø§Ù„Ø¯Ø±Ø³ Ø§Ù„Ø£ÙˆÙ„: Ù…Ù‚Ø¯Ù…Ø© ØªÙ…Ù‡ÙŠØ¯ÙŠØ© ÙˆØ£Ù‡Ø¯Ø§Ù Ø§Ù„Ø¨Ø±Ù†Ø§Ù…Ø¬',
              duration: '20 Ø¯Ù‚ÙŠÙ‚Ø©',
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

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // SECTION & SUB-LESSON HANDLERS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  const handleAddSection = () => {
    const nextNum = formSections.length + 1;
    setFormSections((prev) => [
      ...prev,
      {
        id: `sec-${Date.now()}-${nextNum}`,
        title: `Ø§Ù„ÙˆØ­Ø¯Ø© ${nextNum}: `,
        duration: '40 Ø¯Ù‚ÙŠÙ‚Ø©',
        videoUrl: '',
        type: 'video',
        isLocked: false,
        subItems: [
          {
            id: `sub-${Date.now()}-${nextNum}-1`,
            title: `Ø§Ù„Ù…Ù‚Ø·Ø¹ 1: Ø´Ø±Ø­ Ø§Ù„Ù…ÙØ§Ù‡ÙŠÙ… Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©`,
            duration: '15 Ø¯Ù‚ÙŠÙ‚Ø©',
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
      showToast('ÙŠØ¬Ø¨ Ø£Ù† ØªØ­ØªÙˆÙŠ Ø§Ù„Ø¯ÙˆØ±Ø© Ø¹Ù„Ù‰ ÙˆØ­Ø¯Ø© ØªØ¹Ù„ÙŠÙ…ÙŠØ© ÙˆØ§Ø­Ø¯Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„', 'error');
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
            ? `Ø§Ù„Ù…Ù‚Ø·Ø¹ ${nextSubNum}: `
            : defaultType === 'pdf'
            ? `Ù…Ù„Ù Ù…Ù„Ø®Øµ Ø§Ù„ÙˆØ­Ø¯Ø© PDF`
            : `Ø§Ø®ØªØ¨Ø§Ø± ØªÙ‚ÙŠÙŠÙ…ÙŠ Ù‚ØµÙŠØ± Ù„Ù„ÙˆØ­Ø¯Ø©`,
          duration: defaultType === 'video' ? '15 Ø¯Ù‚ÙŠÙ‚Ø©' : '10 Ø¯Ù‚Ø§Ø¦Ù‚',
          videoUrl: '',
          type: defaultType,
          isLocked: false,
          quizData: defaultType === 'quiz' ? {
            title: `Ø§Ø®ØªØ¨Ø§Ø± ${sec.title || 'Ø§Ù„ÙˆØ­Ø¯Ø©'}`,
            passingScore: 70,
            questions: [
              {
                id: `q-${Date.now()}-1`,
                question: 'Ø§ÙƒØªØ¨ Ø§Ù„Ø³Ø¤Ø§Ù„ Ø§Ù„ØªÙ‚ÙŠÙŠÙ…ÙŠ Ù‡Ù†Ø§...',
                options: ['Ø§Ù„Ø®ÙŠØ§Ø± Ø§Ù„Ø£ÙˆÙ„ (Ø§Ù„ØµØ­ÙŠØ­)', 'Ø§Ù„Ø®ÙŠØ§Ø± Ø§Ù„Ø«Ø§Ù†ÙŠ', 'Ø§Ù„Ø®ÙŠØ§Ø± Ø§Ù„Ø«Ø§Ù„Ø«', 'Ø§Ù„Ø®ÙŠØ§Ø± Ø§Ù„Ø±Ø§Ø¨Ø¹'],
                correctIndex: 0,
                explanation: 'Ø´Ø±Ø­ ÙˆØªÙˆØ¶ÙŠØ­ Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ÙŠØ©.',
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
          showToast('ÙŠØ¬Ø¨ Ø£Ù† ØªØ­ØªÙˆÙŠ Ø§Ù„ÙˆØ­Ø¯Ø© Ø¹Ù„Ù‰ Ù…Ù‚Ø·Ø¹ Ø£Ùˆ Ø¹Ù†ØµØ± ÙˆØ§Ø­Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„', 'error');
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

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // BUNNY STREAM VIDEO UPLOAD IN MODAL (WITH AUTO DURATION DETECTION)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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
      ? formSections[secIdx]?.subItems?.[subIdx]?.title || 'Ø¯Ø±Ø³ ÙØ±Ø¹ÙŠ'
      : formSections[secIdx]?.title || 'Ø¯Ø±Ø³';

    // â”€â”€ 1. Calculate duration directly from the video file â”€â”€
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
        `${formTitle || 'Ø¯ÙˆØ±Ø©'} - ${targetTitle}`,
        setLessonUploadProgress,
      );

      // 4. Update Video ID in State
      if (subIdx !== undefined) {
        handleUpdateSubItem(secIdx, subIdx, 'videoUrl', videoId);
      } else {
        handleUpdateSection(secIdx, 'videoUrl', videoId);
      }

      showToast(`ØªÙ… Ø±ÙØ¹ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ ÙˆÙ…Ø¹Ø§Ù„Ø¬ØªÙ‡ Ø¨Ù†Ø¬Ø§Ø­ Ø¹Ù„Ù‰ Bunny Stream! (Ø§Ù„Ù…Ø¯Ø©: ${calculatedDuration})`);
    } catch (err: any) {
      console.error('Lesson video upload failed:', err);
      showToast(err.message || 'ÙØ´Ù„ Ø±ÙØ¹ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ', 'error');
    } finally {
      setUploadingTarget(null);
      setLessonUploadProgress(0);
    }
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ATTACHMENT UPLOAD HANDLERS (SUPABASE STORAGE)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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
        throw new Error(data.error || 'ÙØ´Ù„ Ø±ÙØ¹ Ø§Ù„Ù…Ù„Ù Ø§Ù„Ù…Ø±ÙÙ‚');
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

      showToast(`ØªÙ… Ø±ÙØ¹ Ø§Ù„Ù…Ù„Ù Ø§Ù„Ù…Ø±ÙÙ‚ (${data.fileName}) Ø¨Ù†Ø¬Ø§Ø­!`);
    } catch (err: any) {
      clearInterval(progressTimer);
      console.error('Attachment upload failed:', err);
      showToast(err.message || 'ÙØ´Ù„ Ø±ÙØ¹ Ø§Ù„Ù…Ù„Ù', 'error');
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
        throw new Error(data.error || 'ÙØ´Ù„ Ø±ÙØ¹ Ø§Ù„Ù…Ù„Ù Ø§Ù„Ù…Ø±ÙÙ‚');
      }

      const newAtt: FormAttachmentItem = {
        id: `att-${Date.now()}`,
        title: data.fileName || file.name,
        fileUrl: data.fileUrl,
        fileType: (data.fileType as any) || 'pdf',
        fileSize: data.fileSize || 'Ù…Ù„Ù Ø±Ù‚Ù…ÙŠ',
      };

      setFormAttachments((prev) => [...prev, newAtt]);
      showToast(`ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ù„Ù Ø§Ù„Ù…Ø±ÙÙ‚ (${data.fileName}) Ù„Ø­Ù‚ÙŠØ¨Ø© Ø§Ù„Ø¯ÙˆØ±Ø© Ø¨Ù†Ø¬Ø§Ø­!`);
    } catch (err: any) {
      clearInterval(progressTimer);
      console.error('Attachment bag upload failed:', err);
      showToast(err.message || 'ÙØ´Ù„ Ø±ÙØ¹ Ø§Ù„Ù…Ù„Ù', 'error');
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
        showToast('ØªÙ… Ø±ÙØ¹ ÙˆØªØ­Ø¯ÙŠØ« ØµÙˆØ±Ø© Ø§Ù„Ø¯ÙˆØ±Ø© Ø¨Ù†Ø¬Ø§Ø­');
      } else {
        throw new Error(data.error || 'ÙØ´Ù„ Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±Ø©');
      }
    } catch (err: any) {
      console.error('Upload image error:', err);
      showToast(err.message || 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±Ø©', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle Save Course
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('ÙŠØ±Ø¬Ù‰ ÙƒØªØ§Ø¨Ø© Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø¯ÙˆØ±Ø©', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const priceNum = parseFloat(formPrice.replace(/[^\d.]/g, '')) || 0;
      const hoursNum = parseInt(formHours.replace(/[^\d]/g, ''), 10) || 20;

      // Transform form sections to storage format
      const formattedCurriculum = formSections.map((sec, idx) => ({
        id: sec.id || `sec-${idx + 1}`,
        title: sec.title.trim() || `Ø§Ù„ÙˆØ­Ø¯Ø© ${idx + 1}`,
        duration: sec.duration || '30 Ø¯Ù‚ÙŠÙ‚Ø©',
        videoUrl: sec.videoUrl || '',
        type: sec.type || 'video',
        fileUrl: sec.fileUrl,
        fileName: sec.fileName,
        fileSize: sec.fileSize,
        isLocked: sec.isLocked,
        quizData: sec.quizData,
        items: sec.subItems.map((sub, sIdx) => ({
          id: sub.id || `sub-${idx + 1}-${sIdx + 1}`,
          title: sub.title.trim() || `Ø§Ù„Ù…Ù‚Ø·Ø¹ ${sIdx + 1}`,
          duration: sub.duration || '15 Ø¯Ù‚ÙŠÙ‚Ø©',
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
        duration: `${hoursNum} Ø³Ø§Ø¹Ø© ØªØ¯Ø±ÙŠØ¨ÙŠØ© Ù…Ø¹ØªÙ…Ø¯Ø©`,
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
        showToast(editingCourse ? 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø¨ÙŠØ§Ù†Ø§Øª ÙˆÙ…Ù†Ù‡Ø¬ ÙˆÙ…Ø±ÙÙ‚Ø§Øª Ø§Ù„Ø¯ÙˆØ±Ø© Ø¨Ù†Ø¬Ø§Ø­' : 'ØªÙ… Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ø¯ÙˆØ±Ø© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© Ù…Ø¹ ÙƒØ§Ù…Ù„ Ø§Ù„Ù…Ù†Ù‡Ø¬ ÙˆØ§Ù„Ù…Ø±ÙÙ‚Ø§Øª Ø¨Ù†Ø¬Ø§Ø­');
        setIsModalOpen(false);

        // Optimistic UI state update
        const savedC = data.course;
        let categoryLabel = 'ØªÙ‚Ù†ÙŠØ© ÙˆØ­Ø§Ø³Ø¨';
        const cat = String(savedC.category || '');
        if (cat === 'admin' || cat === 'office') categoryLabel = 'Ø£Ø¹Ù…Ø§Ù„ Ù…ÙƒØªØ¨ÙŠØ©';
        else if (cat === 'data') categoryLabel = 'Ø¥Ø¯Ø®Ø§Ù„ Ø¨ÙŠØ§Ù†Ø§Øª';
        else if (cat === 'languages' || cat === 'english') categoryLabel = 'Ù„ØºØ§Øª';
        else if (cat === 'corporate' || cat === 'management' || cat === 'finance') categoryLabel = 'Ø¥Ø¯Ø§Ø±Ø© ÙˆØ£Ø¹Ù…Ø§Ù„';
        else if (cat === 'safety' || cat === 'osha' || cat === 'nebosh') categoryLabel = 'Ø³Ù„Ø§Ù…Ø© Ù…Ù‡Ù†ÙŠØ©';
        else if (cat === 'qudurat' || cat === 'aptitude') categoryLabel = 'ØªØ£Ù‡ÙŠÙ„ ÙˆØ§Ø®ØªØ¨Ø§Ø±Ø§Øª';
        else if (cat) categoryLabel = cat;

        const optimisticItem: CourseItem = {
          id: String(savedC.id),
          slug: savedC.slug,
          title: savedC.title,
          category: categoryLabel,
          rawCategory: savedC.category,
          type: 'online',
          trainer: savedC.instructor || formTrainer.trim(),
          price: savedC.price > 0 ? `${savedC.price.toLocaleString('en-US')} Ø±.Ø³` : 'Ù…Ø¬Ø§Ù†ÙŠØ©',
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
        showToast(data.error || data.message || 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø­ÙØ¸ Ø§Ù„Ø¯ÙˆØ±Ø©', 'error');
      }
    } catch (err: any) {
      console.error('Error saving course:', err);
      showToast('ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„Ø¯ÙˆØ±Ø© ÙÙŠ Ø§Ù„Ø®Ø§Ø¯Ù…', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Course
  const handleDeleteCourse = async (course: CourseItem) => {
    if (!confirm(`Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø­Ø°Ù Ø¯ÙˆØ±Ø© "${course.title}" Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹ Ù…Ù† Ø§Ù„Ù†Ø¸Ø§Ù…ØŸ`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/courses?id=${course.id}&slug=${course.slug}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('ØªÙ… Ø­Ø°Ù Ø§Ù„Ø¯ÙˆØ±Ø© Ø§Ù„ØªØ¯Ø±ÙŠØ¨ÙŠØ© Ø¨Ù†Ø¬Ø§Ø­');
        setCourses((prev) => prev.filter((c) => c.id !== course.id && c.slug !== course.slug));
      } else {
        showToast(data.error || 'ÙØ´Ù„ Ø­Ø°Ù Ø§Ù„Ø¯ÙˆØ±Ø©', 'error');
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      showToast('ØªØ¹Ø°Ø± Ø¥ØªÙ…Ø§Ù… Ø¹Ù…Ù„ÙŠØ© Ø§Ù„Ø­Ø°Ù', 'error');
    }
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // STANDALONE LESSONS STUDIO MODAL METHODS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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
      showToast('ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø¯Ø±ÙˆØ³ Ø§Ù„Ø¯ÙˆØ±Ø©', 'error');
    } finally {
      setLessonsLoading(false);
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForLessons) return;
    if (!newLessonTitle.trim()) {
      setUploadError('ÙŠØ±Ø¬Ù‰ ÙƒØªØ§Ø¨Ø© Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ù…Ø­Ø§Ø¶Ø±Ø©');
      return;
    }

    try {
      const res = await fetch(`/api/admin/courses/${selectedCourseForLessons.slug}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newLessonTitle.trim(),
          duration: newLessonDuration.trim() || '20 Ø¯Ù‚ÙŠÙ‚Ø©',
          videoUrl: newLessonUrl.trim(),
          type: 'video',
          isLocked: false,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ø­Ø§Ø¶Ø±Ø© Ø¨Ù†Ø¬Ø§Ø­');
        setNewLessonTitle('');
        setNewLessonUrl('');
        setUploadSuccess('ØªÙ… Ø­ÙØ¸ Ø§Ù„Ù…Ø­Ø§Ø¶Ø±Ø© ÙÙŠ Ø§Ù„Ù…Ù†Ù‡Ø¬ Ø¨Ù†Ø¬Ø§Ø­!');
        if (data.curriculum) {
          setCourseLessons(data.curriculum);
        }
        loadCourses();
      } else {
        setUploadError(data.error || 'ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„Ù…Ø­Ø§Ø¶Ø±Ø©');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø®Ø§Ø¯Ù…');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!selectedCourseForLessons) return;
    if (!confirm('Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø­Ø°Ù Ù‡Ø°Ø§ Ø§Ù„Ø¯Ø±Ø³ØŸ')) return;

    try {
      const res = await fetch(`/api/admin/courses/${selectedCourseForLessons.slug}/lessons?lessonId=${lessonId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('ØªÙ… Ø­Ø°Ù Ø§Ù„Ø¯Ø±Ø³ Ø¨Ù†Ø¬Ø§Ø­');
        if (data.curriculum) {
          setCourseLessons(data.curriculum);
        } else {
          setCourseLessons((prev) => prev.filter((l: any) => l.id !== lessonId));
        }
        loadCourses();
      } else {
        showToast(data.error || 'ÙØ´Ù„ Ø­Ø°Ù Ø§Ù„Ø¯Ø±Ø³', 'error');
      }
    } catch (err) {
      showToast('ØªØ¹Ø°Ø± Ø¥ØªÙ…Ø§Ù… Ø¹Ù…Ù„ÙŠØ© Ø§Ù„Ø­Ø°Ù', 'error');
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
      setUploadSuccess(`ØªÙ… Ø±ÙØ¹ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ ÙˆØªØ´ÙÙŠØ±Ù‡ Ø¨Ù†Ø¬Ø§Ø­! ÙƒÙˆØ¯ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ: ${videoId} (Ø§Ù„Ù…Ø¯Ø©: ${calculatedDuration})`);
      showToast(`ØªÙ… Ø±ÙØ¹ ÙˆÙ…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø¨Ù†Ø¬Ø§Ø­ (Ø§Ù„Ù…Ø¯Ø©: ${calculatedDuration})`);
    } catch (err: any) {
      console.error('Direct video upload failed:', err);
      setUploadError(err.message || 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø±ÙØ¹ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ');
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
        setPreviewError('Ù„Ø§ ÙŠÙˆØ¬Ø¯ ÙÙŠØ¯ÙŠÙˆ Ù…Ø±ÙÙ‚ Ù„Ù‡Ø°Ø§ Ø§Ù„Ø¯Ø±Ø³ Ø¨Ø¹Ø¯.');
        setPreviewLoading(false);
        return;
      }

      // 1. Bunny Stream GUID extraction (36-character UUID)
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
        setPreviewError('Ù…Ø¹Ø±Ù‘Ù Ø§Ù„ÙÙŠØ¯ÙŠÙˆ ØºÙŠØ± ØµØ§Ù„Ø­. ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ù…Ø¹Ø±Ù‘Ù Bunny Stream GUID Ø£Ùˆ Ø±Ø§Ø¨Ø· ÙÙŠØ¯ÙŠÙˆ Ù…Ø¨Ø§Ø´Ø±.');
      }
    } catch (err: any) {
      console.error('Error fetching preview token:', err);
      setPreviewError('ØªØ¹Ø°Ø± ØªØ¬Ù‡ÙŠØ² Ù…Ø´ØºÙ„ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ù„Ù„Ù…Ø¹Ø§ÙŠÙ†Ø©');
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
              <span>Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø³Ø§Ù‚Ø§Øª ÙˆÙ…ÙƒØªØ¨Ø© Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø§Ù„Ø°ÙƒÙŠØ©</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#173A7C]">
              Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¯ÙˆØ±Ø§Øª ÙˆØ§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠ ğŸ“š
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed">
              ØªØ­ÙƒÙ… ÙƒØ§Ù…Ù„ ÙÙŠ Ø§Ù„Ø¨Ø±Ø§Ù…Ø¬ Ø§Ù„ØªØ¯Ø±ÙŠØ¨ÙŠØ© Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© ({courses.length} Ø¯ÙˆØ±Ø§Øª Ù†Ø´Ø·Ø©). Ø£Ø¶Ù Ø¨Ø±Ø§Ù…Ø¬ Ø¬Ø¯ÙŠØ¯Ø©ØŒ Ø¹Ø¯Ù„ Ø§Ù„Ø£Ø³Ø¹Ø§Ø±ØŒ Ø§Ù„ØµÙˆØ± ÙˆØ§Ù„Ø£ØºÙ„ÙØ©ØŒ ÙˆØ§Ø±ÙØ¹ ÙÙŠØ¯ÙŠÙˆÙ‡Ø§Øª Ù…Ø´ÙØ±Ø© ÙÙˆØ±ÙŠØ§Ù‹ Ù„Ù„Ù…Ù†ØµØ©.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={openCreateModal}
              className="px-5 py-3 rounded-xl sm:rounded-2xl bg-[#173A7C] hover:bg-[#1E4D9D] text-white text-xs sm:text-sm font-black shadow-lg shadow-[#173A7C]/20 transition-all flex items-center gap-2 cursor-pointer hover:-translate-y-0.5 active:scale-95"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
              <span>Ø¥Ø¶Ø§ÙØ© Ø¯ÙˆØ±Ø© ØªØ¯Ø±ÙŠØ¨ÙŠØ© Ø¬Ø¯ÙŠØ¯Ø©</span>
            </button>
            <button
              onClick={loadCourses}
              className="p-3 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-xs transition-all cursor-pointer hover:rotate-180 duration-500"
              title="ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª"
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
            placeholder="Ø¨Ø­Ø« Ø¨Ø§Ø³Ù… Ø§Ù„Ø¯ÙˆØ±Ø© Ø£Ùˆ Ø§Ù„Ù…Ø¯Ø±Ø¨..."
            className="w-full pl-4 pr-10 py-2 text-xs font-bold text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C] focus:bg-white transition-all"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs font-bold">
          {[
            { id: 'all', label: 'Ø¬Ù…ÙŠØ¹ Ø§Ù„ØªØµÙ†ÙŠÙØ§Øª' },
            { id: 'tech', label: 'ØªÙ‚Ù†ÙŠØ© ÙˆØ¨Ø±Ù…Ø¬Ø©' },
            { id: 'admin', label: 'Ø£Ø¹Ù…Ø§Ù„ Ù…ÙƒØªØ¨ÙŠØ©' },
            { id: 'data', label: 'Ø¥Ø¯Ø®Ø§Ù„ Ø¨ÙŠØ§Ù†Ø§Øª' },
            { id: 'languages', label: 'Ù„ØºØ§Øª ÙˆØªØ±Ø¬Ù…Ø©' },
            { id: 'corporate', label: 'Ø¥Ø¯Ø§Ø±Ø© ÙˆØ£Ø¹Ù…Ø§Ù„' },
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
          <span>Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¯ÙˆØ±Ø§Øª Ø§Ù„ØªØ¯Ø±ÙŠØ¨ÙŠØ© Ù…Ù† Ø§Ù„Ø³Ø­Ø§Ø¨Ø©...</span>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-800">Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¯ÙˆØ±Ø§Øª Ù…Ø·Ø§Ø¨Ù‚Ø©</h3>
            <p className="text-xs text-slate-500">Ø¬Ø±Ø¨ Ø§Ù„Ø¨Ø­Ø« Ø¨ÙƒÙ„Ù…Ø§Øª Ø£Ø®Ø±Ù‰ Ø£Ùˆ Ø£Ø¶Ù Ø¯ÙˆØ±Ø© ØªØ¯Ø±ÙŠØ¨ÙŠØ© Ø¬Ø¯ÙŠØ¯Ø©</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#173A7C] text-white text-xs font-black cursor-pointer shadow-sm hover:bg-[#1E4D9D] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ø¥Ø¶Ø§ÙØ© Ø£ÙˆÙ„ Ø¯ÙˆØ±Ø©</span>
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
                <div className="relative h-44 sm:h-48 rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 p-6 flex items-center justify-center overflow-hidden border border-slate-100/90 group-hover:border-blue-100 transition-colors mb-4">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={course.image || '/logo.webp'}
                      alt={course.title}
                      className="max-h-28 sm:max-h-32 w-auto object-contain p-2 opacity-95 group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.webp';
                      }}
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
                      Ù…Ù†Ø´ÙˆØ±Ø© âš¡
                    </span>
                  </div>
                </div>

                {/* 2. Course Title & Description */}
                <div className="space-y-2">
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#173A7C] transition-colors leading-snug line-clamp-2" title={course.title}>
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                    {course.description || 'Ø¨Ø±Ù†Ø§Ù…Ø¬ ØªØ¯Ø±ÙŠØ¨ÙŠ Ù…Ø¹ØªÙ…Ø¯ ÙˆØ´Ø§Ù…Ù„ ÙŠØºØ·ÙŠ Ø§Ù„Ù…Ù‡Ø§Ø±Ø§Øª Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ© ÙˆØ§Ù„Ù…ØªÙ‚Ø¯Ù…Ø©.'}
                  </p>
                </div>
              </div>

              {/* 3. Course Details & Trainer */}
              <div className="space-y-3.5 pt-4 mt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#173A7C]" />
                    <span>{course.hours} Ø³Ø§Ø¹Ø©</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#0D5C3A]" />
                    <span>{course.lessonsCount} Ø¯Ø±Ø³ / Ù…Ù‚Ø·Ø¹</span>
                  </span>
                  <span className="text-emerald-700 font-black">
                    {course.price}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#173A7C]" />
                    <span className="text-slate-500 text-[11px]">Ø§Ù„Ù…Ø­Ø§Ø¶Ø±:</span>
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
                    <span>Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¯Ø±ÙˆØ³ ÙˆØ§Ù„Ù…ÙŠØ¯ÙŠØ§ ({course.lessonsCount})</span>
                  </button>

                  <button
                    onClick={() => openEditModal(course)}
                    className="p-2.5 rounded-xl bg-white hover:bg-blue-50 text-slate-600 hover:text-[#173A7C] border border-slate-200 hover:border-blue-200 transition-all cursor-pointer shadow-xs"
                    title="ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø¯ÙˆØ±Ø© ÙˆØ§Ù„Ù…Ù†Ù‡Ø¬ ÙˆØ§Ù„Ù…Ø±ÙÙ‚Ø§Øª"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course)}
                    className="p-2.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer shadow-xs"
                    title="Ø­Ø°Ù Ø§Ù„Ø¯ÙˆØ±Ø© Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* 1. ADVANCED CREATE / EDIT COURSE MODAL WITH TABS & SUB-LESSONS STUDIO */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[94vh]"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-6 bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#0c234b] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15 shrink-0">
                    <BookOpen className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-lg font-black">
                      {editingCourse ? 'ØªØ¹Ø¯ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª ÙˆÙ…Ù†Ù‡Ø¬ ÙˆÙ…Ø±ÙÙ‚Ø§Øª Ø§Ù„Ø¯ÙˆØ±Ø©' : 'Ø¥Ø¶Ø§ÙØ© Ø¯ÙˆØ±Ø© ØªØ¯Ø±ÙŠØ¨ÙŠØ© Ø¬Ø¯ÙŠØ¯Ø© Ù…Ø¹ Ø§Ù„Ù…Ù†Ù‡Ø¬ ÙˆØ§Ù„Ù…Ø±ÙÙ‚Ø§Øª'}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-blue-100">
                      Ø¯Ø¹Ù… ÙƒØ§Ù…Ù„ Ù„ØªÙ‚Ø³ÙŠÙ… Ø§Ù„ÙˆØ­Ø¯Ø§Øª Ù„Ù…Ù‚Ø§Ø·Ø¹ ÙØ±Ø¹ÙŠØ© Ù…ØªØ¹Ø¯Ø¯Ø©ØŒ Ù…Ù„ÙØ§Øª PDF/WordØŒ ÙˆØ§Ø®ØªØ¨Ø§Ø±Ø§Øª ØªÙØ§Ø¹Ù„ÙŠØ© âš¡
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
                    <span className="truncate">1. Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙˆØ§Ù„ØºÙ„Ø§Ù</span>
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
                    <span className="truncate">2. Ø§Ù„Ù…Ù†Ù‡Ø¬ ÙˆØ§Ù„Ù…Ù‚Ø§Ø·Ø¹ ({formSections.length})</span>
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
                    <span className="truncate">3. Ø§Ù„Ù…Ø±ÙÙ‚Ø§Øª PDF ({formAttachments.length})</span>
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
                    <span className="truncate">4. Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø± {hasFinalExam ? 'âœ“' : ''}</span>
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveCourse} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
                {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                {/* TAB 1: BASIC INFO & COVER */}
                {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                {modalActiveTab === 'basic' && (
                  <div className="space-y-6 animate-fade-in-up">
                    {/* Course Cover Image Section */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <label className="block text-xs font-black text-slate-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-[#173A7C]" />
                          <span>ØµÙˆØ±Ø© ÙˆØºÙ„Ø§Ù Ø§Ù„Ø¯ÙˆØ±Ø© Ø§Ù„ØªØ¯Ø±ÙŠØ¨ÙŠØ© (Thumbnail)</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">ÙŠØªÙ… Ø§Ù„Ø­ÙØ¸ ÙÙŠ Supabase ÙˆØ§Ù„Ù…ÙˆÙ‚Ø¹ ÙÙˆØ±Ø§Ù‹</span>
                      </label>

                      <DeviceImageUploader
                        value={formImage}
                        onChange={(url) => setFormImage(url)}
                        folder="courses"
                        slug={formSlug || 'course'}
                        label="ØµÙˆØ±Ø© ÙˆØºÙ„Ø§Ù Ø§Ù„Ø¯ÙˆØ±Ø© Ø§Ù„ØªØ¯Ø±ÙŠØ¨ÙŠØ© (Ø±ÙØ¹ Ù…Ø¨Ø§Ø´Ø± Ù…Ù† Ø¬Ù‡Ø§Ø²Ùƒ Ù…Ø¹ Ø¶ØºØ· WebP)"
                        recommendedSize="Ø§Ù„Ù…Ù‚Ø§Ø³ Ø§Ù„Ù…Ø«Ø§Ù„ÙŠ: 1280 Ã— 720 Ø¨ÙƒØ³Ù„ (WebP / JPG / PNG)"
                        aspectRatio="video"
                      />

                      {/* Presets#]<Ókh‘éì¶»§q«^tÜİX‹™š[S˜[YH	öava6`HˆÈÛÜ™6.¶b¶,H6av,v`vb6.IßBˆÜÜ[‚ˆÜ[ˆÛ\ÜÓ˜[YOH^VÌLH^\Û]KM›Û[[Û›È‚ˆÜİX‹™š[TÚ^™H	öava6`H6av,ö*¶a¶+ÉßBˆÜÜ[‚ˆÙ]‚ˆÙ]‚‚ˆ]Û‚ˆ\OH˜]Ûˆ‚ˆÛÛXÚÏ^Ê
HOˆšYÙÙ\]XÚY[\ØY›Ü•\™Ù]
ÙXÒYİX’Y
_Bˆ\ØX›Y^Ú\Õ\ØY[™Ğ]XÚY[BˆÛ\ÜÓ˜[YOHœLÈKLKH›İ[™Y[È™ËVÈÌMÌĞMĞ×Hİ™\˜™ËVÈÌQMQH^]Ú]H›ÛX›Û^^È›^][\ËXÙ[\ˆØ\LHİ\œÛÜ‹\Ú[\ˆ˜[œÚ][Û‹X[\ØX›Y›ÜXÚ]KMLÚš[šËLÚYİË^È‚ˆ‚ˆİ\ØY[™Ğ]XÚY[\™Ù]ËœÙXÒYOOHÙXÒY	‰ˆ\ØY[™Ğ]XÚY[\™Ù]ËœİX’YOOHİX’YÈ
ˆ‚ˆØY\ŒˆÛ\ÜÓ˜[YOHËLËHLËH[š[X]K\Ü[ˆˆÏ‚ˆÜ[¶+6)ö,vbˆ6)öa6,v`v.HØ]XÚY[\ØY›ÙÜ™\ÜßIOÜÜ[‚ˆÏ‚ˆ
Hˆ
ˆ‚ˆ\ØYÛİYÛ\ÜÓ˜[YOHËLËHLËHˆÏ‚ˆÜ[ÜİX‹™š[U\›È	ö*¶.¶b¶b¶,H6)öa6ava6`IÈˆ	ö,v`v.H6ava6`H‹ÕÛÜ™	ßOÜÜ[‚ˆÏ‚ˆ
_BˆØ]Û‚ˆÙ]‚‚ˆËÊˆ[š[X]Y›ÙÜ™\ÜÈ˜\ˆ›ÜˆİX‹R][HØİ[Y[
‹ßBˆİ\ØY[™Ğ]XÚY[\™Ù]ËœÙXÒYOOHÙXÒY	‰ˆ\ØY[™Ğ]XÚY[\™Ù]ËœİX’YOOHİX’Y	‰ˆ
ˆ]ˆÛ\ÜÓ˜[YOHËY[ÜXÙK^KLHLH‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆ\İYKX™]ÙY[ˆ^VÌL\H›ÛX›Û^X›YKMÌ‚ˆÜ[¶+6)ö,vbˆ6,v`v.H6b6av.v)öa6+6*H6)öa6av,ö*¶a¶+Ë‹‹ÜÜ[‚ˆÜ[ˆÛ\ÜÓ˜[YOH™›Û[[Û›ÈØ]XÚY[\ØY›ÙÜ™\ÜßIOÜÜ[‚ˆÙ]‚ˆ]ˆÛ\ÜÓ˜[YOHËY[™Ë\Û]KLL›İ[™YY[LKHİ™\™›İËZY[ˆ›Ü™\ˆ›Ü™\‹\Û]KLŒ‚ˆ]‚ˆÛ\ÜÓ˜[YOH˜™ËYÜ˜YY[]Ë\ˆœ›ÛKX›YKMŒËY[Y\˜[MLY[›İ[™YY[˜[œÚ][Û‹X[\˜][Û‹LÌ‚ˆİ[O^ŞÈÚYˆ	Ø]XÚY[\ØY›ÙÜ™\ÜßIX_BˆÏ‚ˆÙ]‚ˆÙ]‚ˆ
_BˆÙ]‚ˆ
_B‚ˆÜİX‹\HOOH	Ü]Z^‰È	‰ˆ
ˆ]ˆÛ\ÜÓ˜[YOHœLÈ™ËX[X™\‹MLÍÌ›İ[™Y[È›Ü™\ˆ›Ü™\‹X[X™\‹LŒÎÜXÙK^KLˆ‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆ\İYKX™]ÙY[ˆ‚ˆÜ[ˆÛ\ÜÓ˜[YOH^^È›ÛX›XÚÈ^X[X™\‹NL›^][\ËXÙ[\ˆØ\LKH‚ˆ[Ú\˜ÛHÛ\ÜÓ˜[YOHËMM^X[X™\‹MŒˆÏ‚ˆÜ[¶(ö,ö)¶a6*H6`öb6b¶,ˆ6)öa6b6+v+ö*H
ÜİX‹œ]Z^‘]OËœ]Y\İ[ÛœÏË›[™İH6(ö,ö)¶a6*JOÜÜ[‚ˆÜÜ[‚ˆ]Û‚ˆ\OH˜]Ûˆ‚ˆÛÛXÚÏ^Ê
HOˆÂˆÛÛœİİ\œ™[]Y\İ[ÛœÈHİX‹œ]Z^‘]OËœ]Y\İ[ÛœÈ×NÂˆÛÛœİ™^Nˆ]Z^”]Y\İ[ÛˆHÂˆYˆKIÑ]K››İÊ
_KIØİ\œ™[]Y\İ[ÛœË›[™İ
È_Xˆ]Y\İ[Ûˆ6)öa6,ö)6)öa	Øİ\œ™[]Y\İ[ÛœË›[™İ
È_NˆˆÜ[ÛœÎˆÉö)öa6+¶b¶)ö,HH
6)öa6-v+vb¶+JIË	ö)öa6+¶b¶)ö,H‰Ë	ö)öa6+¶b¶)ö,HÉË	ö)öa6+¶b¶)ö,H	×KˆÛÜœ™Xİ[™^ˆˆ^[˜][Ûˆ	ö-6,v+H6)öa6)v+6)ö*6*H6)öa6-v+vb¶+v*K‰ËˆNÂˆ[™U\]TİX’][JÙXÒYİX’Y	Ü]Z^‘]IËÂˆ]Nˆ6)ö+¶*¶*6)ö,H	ÜİX‹]_Xˆ\ÜÚ[™ÔØÛÜ™NˆÌˆ]Y\İ[ÛœÎˆË‹‹˜İ\œ™[]Y\İ[ÛœË™^WKˆJNÂˆ_BˆÛ\ÜÓ˜[YOH^VÌL\H›ÛX›Û^VÈÌMÌĞMĞ×Hİ™\[™\›[™Hİ\œÛÜ‹\Ú[\ˆ›^][\ËXÙ[\ˆØ\LH‚ˆ‚ˆ\ÈÛ\ÜÓ˜[YOHËLÈLÈˆÏ‚ˆÜ[¶)v-¶)ö`v*H6,ö)6)öa6a6a6`öb6b¶,ÜÜ[‚ˆØ]Û‚ˆÙ]‚‚ˆÜİX‹œ]Z^‘]OËœ]Y\İ[ÛœÏË›X\

KRY
HOˆ
ˆ]ˆÙ^O^ÜKšYRYHÛ\ÜÓ˜[YOHœL‹H™Ë]Ú]H›İ[™Y›Ü™\ˆ›Ü™\‹X[X™\‹LLÜXÙK^KLKH^^È‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆ\İYKX™]ÙY[ˆ‚ˆÜ[ˆÛ\ÜÓ˜[YOH™›ÛX›Û^\Û]KN¶)öa6,ö)6)öaŞÜRY
È_OÜÜ[‚ˆÜİX‹œ]Z^‘]HKœ]Y\İ[ÛœË›[™İˆH	‰ˆ
ˆ]Û‚ˆ\OH˜]Ûˆ‚ˆÛÛXÚÏ^Ê
HOˆÂˆÛÛœİš[\™YHİX‹œ]Z^‘]HKœ]Y\İ[ÛœË™š[\Š
ËY
HOˆYOOHRY
NÂˆ[™U\]TİX’][JÙXÒYİX’Y	Ü]Z^‘]IËÂˆ‹‹œİX‹œ]Z^‘]Kˆ]Y\İ[ÛœÎˆš[\™YˆJNÂˆ_BˆÛ\ÜÓ˜[YOH^\›ÜÙKMLİ™\^\›ÜÙKMÌ^VÌLH›ÛX›Û‚ˆ‚ˆ6+v,6`BˆØ]Û‚ˆ
_BˆÙ]‚ˆ[œ]ˆ\OH^‚ˆ˜[YO^ÜKœ]Y\İ[ÛŸBˆÛÚ[™ÙO^ÊJHOˆÂˆÛÛœİ\]YHË‹‹œİX‹œ]Z^‘]HKœ]Y\İ[Ûœ×NÂˆ\]YÜRYKœ]Y\İ[ÛˆHK\™Ù]˜[YNÂˆ[™U\]TİX’][JÙXÒYİX’Y	Ü]Z^‘]IËÂˆ‹‹œİX‹œ]Z^‘]Kˆ]Y\İ[ÛœÎˆ\]YˆJNÂˆ_BˆXÙZÛ\H¶a¶-H6)öa6,ö)6)öa‹‹ˆ‚ˆÛ\ÜÓ˜[YOHËY[LˆKLH^^È›ÛX›Û™Ë\Û]KML›Ü™\ˆ›Ü™\‹\Û]KLŒ›İ[™Y‚ˆÏ‚ˆÙ]‚ˆ
J_BˆÙ]‚ˆ
_BˆÙ]‚ˆ
J_BˆÙ]‚‚ˆËÊˆYİX‹R][HXİ[ÛœÈ
‹ßBˆ]ˆÛ\ÜÓ˜[YOHœLˆ›^›^]Ü˜\][\ËXÙ[\ˆØ\Lˆ‚ˆ]Û‚ˆ\OH˜]Ûˆ‚ˆÛÛXÚÏ^Ê
HOˆ[™PYİX’][UÔÙXİ[ÛŠÙXÒY	İšY[ÉÊ_BˆÛ\ÜÓ˜[YOHœLÈKLKH›İ[™Y[È™ËX›YKMLİ™\˜™ËX›YKLL^VÈÌMÌĞMĞ×H›ÛX›XÚÈ^^È›^][\ËXÙ[\ˆØ\LKH˜[œÚ][Û‹XÛÛÜœÈİ\œÛÜ‹\Ú[\ˆ›Ü™\ˆ›Ü™\‹X›YKLŒ‚ˆ‚ˆ\ĞÚ\˜ÛHÛ\ÜÓ˜[YOHËLËHLËH^X›YKMŒˆÏ‚ˆÜ[¶)v-¶)ö`v*H6av`¶-ö.HÈ6`vb¶+öb¶b6`v,v.vbÜÜ[‚ˆØ]Û‚‚ˆ]Û‚ˆ\OH˜]Ûˆ‚ˆÛÛXÚÏ^Ê
HOˆ[™PYİX’][UÔÙXİ[ÛŠÙXÒY	Ü‰Ê_BˆÛ\ÜÓ˜[YOHœLÈKLKH›İ[™Y[È™ËY[Y\˜[MLİ™\˜™ËY[Y\˜[LL^Y[Y\˜[N›ÛX›Û^^È›^][\ËXÙ[\ˆØ\LH˜[œÚ][Û‹XÛÛÜœÈİ\œÛÜ‹\Ú[\ˆ›Ü™\ˆ›Ü™\‹Y[Y\˜[LŒ‚ˆ‚ˆš[T\ÈÛ\ÜÓ˜[YOHËLËHLËH^Y[Y\˜[MŒˆÏ‚ˆÜ[¶ava6`Hˆ6`v,v.vbÜÜ[‚ˆØ]Û‚‚ˆ]Û‚ˆ\OH˜]Ûˆ‚ˆÛÛXÚÏ^Ê
HOˆ[™PYİX’][UÔÙXİ[ÛŠÙXÒY	Ü]Z^‰Ê_BˆÛ\ÜÓ˜[YOHœLÈKLKH›İ[™Y[È™ËX[X™\‹MLİ™\˜™ËX[X™\‹LL^X[X™\‹N›ÛX›Û^^È›^][\ËXÙ[\ˆØ\LH˜[œÚ][Û‹XÛÛÜœÈİ\œÛÜ‹\Ú[\ˆ›Ü™\ˆ›Ü™\‹X[X™\‹LŒ‚ˆ‚ˆ[Ú\˜ÛHÛ\ÜÓ˜[YOHËLËHLËH^X[X™\‹MŒˆÏ‚ˆÜ[¶`öb6b¶,ˆ6a6a6b6+v+ö*OÜÜ[‚ˆØ]Û‚ˆÙ]‚ˆÙ]‚ˆÙ]‚ˆ
J_BˆÙ]‚ˆÙ]‚ˆ
_B‚ˆËÊˆ8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d
‹ßBˆËÊˆPˆÎˆUPÒQS•È	ˆ‘TÓÕTÑTÈQÈ
‹ßBˆËÊˆ8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d
‹ßBˆÛ[Ù[Xİ]™UXˆOOH	Ø]XÚY[ÉÈ	‰ˆ
ˆ]ˆÛ\ÜÓ˜[YOHœÜXÙK^KMˆ[š[X]KY˜YKZ[‹]\‚ˆ]ˆÛ\ÜÓ˜[YOH™›^›^XÛÛÛN™›^\›İÈÛNš][\ËXÙ[\ˆ\İYKX™]ÙY[ˆØ\Lˆ›Ü™\‹Xˆ›Ü™\‹\Û]KLŒ‹LÈ‚ˆ]‚ˆÛ\ÜÓ˜[YOH^\ÛH›ÛX›XÚÈ^\Û]KNL›^][\ËXÙ[\ˆØ\Lˆ‚ˆ\\˜Û\Û\ÜÓ˜[YOHËMM^VÈÌMÌĞMĞ×HˆÏ‚ˆÜ[¶)öa6+v`¶b¶*6*H6)öa6*¶+ö,vb¶*6b¶*H6b6ava6`v)ö*ˆ6)öa6+öb6,v*H6)öa6av,v`v`¶*H
ˆÈÛÜ™È’T
OÜÜ[‚ˆÚ‚ˆÛ\ÜÓ˜[YOH^VÌL\H^\Û]KML›Û[YY][H]LH‚ˆ6)öa6ava6`v)ö*ˆ6)öa6av,v`vb6.v*H6aöa¶)È6,ö*¶`öb6aˆ6av*¶)ö+v*H6a6+6avb¶.H6)öa6-öa6)ö*6)öa6av,ö+6a6b¶aˆ6*6)öa6+öb6,v*H6`vbˆ6*¶*6b6b¶*6)öa6av,v`v`¶)ö*ˆ<'äáˆÜ‚ˆÙ]‚‚ˆ]Û‚ˆ\OH˜]Ûˆ‚ˆÛÛXÚÏ^Ê
HOˆ]XÚY[š[R[œ]™Y‹˜İ\œ™[Ë˜ÛXÚÊ
_Bˆ\ØX›Y^Ú\Õ\ØY[™Ğ]XÚY[BˆÛ\ÜÓ˜[YOHœMKLˆ›İ[™Y^™ËYÜ˜YY[]Ë\ˆœ›ÛKY[Y\˜[MLË]X[MŒİ™\™œ›ÛKY[Y\˜[MŒİ™\Ë]X[MÌ^]Ú]H^^È›ÛX›XÚÈ›^][\ËXÙ[\ˆØ\LKHÚYİË^È˜[œÚ][Û‹X[İ\œÛÜ‹\Ú[\ˆÙ[‹\İ\ÛNœÙ[‹X]]È‚ˆ‚ˆÚ\Õ\ØY[™Ğ]XÚY[È
ˆ‚ˆØY\ŒˆÛ\ÜÓ˜[YOHËMM[š[X]K\Ü[ˆˆÏ‚ˆÜ[¶+6)ö,vbˆ6,v`v.H6)öa6ava6`K‹‹ÜÜ[‚ˆÏ‚ˆ
Hˆ
ˆ‚ˆ\ØYÛİYÛ\ÜÓ˜[YOHËMMˆÏ‚ˆÜ[¶,v`v.H6ava6`H6+6+öb¶+È6a6a6+v`¶b¶*6*H
‹ÕÛÜ™
OÜÜ[‚ˆÏ‚ˆ
_BˆØ]Û‚ˆ[œ]ˆ™Y^Ø]XÚY[š[R[œ]™YŸBˆ\OH™š[H‚ˆXØÙ\H‹œ‹™ØË™ØŞœœš\œ˜\ˆ‚ˆÛÚ[™ÙO^Ú[™PÛİ\œÙP˜YĞ]XÚY[\ØYBˆÛ\ÜÓ˜[YOHšY[ˆ‚ˆÏ‚ˆÙ]‚‚ˆÙ›Ü›P]XÚY[Ë›[™İOOHÈ
ˆ]ˆÛ\ÜÓ˜[YOHœN›İ[™YL™Ë\Û]KML›Ü™\‹Lˆ›Ü™\‹Y\ÚY›Ü™\‹\Û]KLŒ^XÙ[\ˆÜXÙK^KLÈ‚ˆ›Û\“Ü[ˆÛ\ÜÓ˜[YOHËLLLL^\Û]KM^X]]ÈˆÏ‚ˆ]ˆÛ\ÜÓ˜[YOH^^È›ÛX›XÚÈ^\Û]KMÌ¶a6aH6b¶*¶aH6,v`v.H6ava6`v)ö*ˆ6a6+v`¶b¶*6*H6aö,6aÈ6)öa6+öb6,v*H6*6.v+ÏÙ]‚ˆÛ\ÜÓ˜[YOH^VÌL\H^\Û]KMX^]Ë[Y^X]]È‚ˆ6)ö-¶.¶-È6.va6bH6,¶,H6)öa6,v`v.H6(ö.va6)öaÈ6a6)v-¶)ö`v*H6)öa6+v`¶b¶*6*H6)öa6*¶+ö,vb¶*6b¶*v#6)öa6`ö*¶*6)öa6av.v*¶av+ö*v#6(öb6(öb6,v)ö`ˆ6)öa6.vava6*6*¶a¶,öb¶`ˆˆ6(öbÛÜ™‚ˆÜ‚ˆÙ]‚ˆ
Hˆ
ˆ]ˆÛ\ÜÓ˜[YOHœÜXÙK^KLÈ‚ˆÙ›Ü›P]XÚY[Ë›X\

]Y
HOˆ
ˆ]‚ˆÙ^O^Ø]šYYBˆÛ\ÜÓ˜[YOHœM›İ[™YL™Ë\Û]KML›Ü™\ˆ›Ü™\‹\Û]KLŒ›^][\ËXÙ[\ˆ\İYKX™]ÙY[ˆØ\LÈİ™\˜›Ü™\‹\Û]KLÌ˜[œÚ][Û‹X[‚ˆ‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆØ\LÈZ[‹]ËL‚ˆ]ˆÛ\ÜÓ˜[YOHËLLLL›İ[™Y^™ËX›YKLL^VÈÌMÌĞMĞ×H›^][\ËXÙ[\ˆ\İYKXÙ[\ˆÚš[šËL‚ˆš[U^Û\ÜÓ˜[YOHËMHMHˆÏ‚ˆÙ]‚ˆ]ˆÛ\ÜÓ˜[YOH›Z[‹]ËL‚ˆ[œ]ˆ\OH^‚ˆ˜[YO^Ø]]_BˆÛÚ[™ÙO^ÊJHOˆÂˆÛÛœİ\]YHË‹‹™›Ü›P]XÚY[×NÂˆ\]YÚYK]HHK\™Ù]˜[YNÂˆÙ]›Ü›P]XÚY[Ê\]Y
NÂˆ_BˆÛ\ÜÓ˜[YOH^^È›ÛX›XÚÈ^\Û]KNL™Ë]Ú]HLˆKLH›İ[™Y›Ü™\ˆ›Ü™\‹\Û]KLŒ›Øİ\Î›İ][™K[›Û™H›Øİ\Î˜›Ü™\‹VÈÌMÌĞMĞ×HËY[X^]Ë\ÛH‚ˆXÙZÛ\H¶.va¶b6)öaˆ6)öa6ava6`H6)öa6av,v`v`ˆ‚ˆÏ‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆØ\Lˆ^VÌLH^\Û]KML›Û[[Û›È]LH‚ˆÜ[Ø]™š[TÚ^™_OÜÜ[‚ˆÜ[¸ (ÜÜ[‚ˆÜ[ˆÛ\ÜÓ˜[YOH\\˜Ø\ÙHØ]™š[U\_OÜÜ[‚ˆÙ]‚ˆÙ]‚ˆÙ]‚‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆØ\LˆÚš[šËL‚ˆBˆ™Y^Ø]™š[U\›Bˆ\™Ù]H—Ø›[šÈ‚ˆ™[H››ÛÜ[™\ˆ›Ü™Y™\œ™\ˆ‚ˆÛ\ÜÓ˜[YOHœLˆ›İ[™Y^™Ë]Ú]Hİ™\˜™ËX›YKML^VÈÌMÌĞMĞ×H›Ü™\ˆ›Ü™\‹\Û]KLŒ^^È›ÛX›Û›^][\ËXÙ[\ˆØ\LH˜[œÚ][Û‹XÛÛÜœÈ‚ˆ‚ˆİÛ›ØYÛ\ÜÓ˜[YOHËLËHLËHˆÏ‚ˆÜ[¶*¶+vavb¶aÜÜ[‚ˆØO‚ˆ]Û‚ˆ\OH˜]Ûˆ‚ˆÛÛXÚÏ^Ê
HOˆ[™T™[[İ™P]XÚY[œ›ÛP˜YÊ]šY
_BˆÛ\ÜÓ˜[YOHœLˆ›İ[™Y^™Ë]Ú]Hİ™\˜™Ë\›ÜÙKML^\Û]KMİ™\^\›ÜÙKMŒ›Ü™\ˆ›Ü™\‹\Û]KLŒ˜[œÚ][Û‹XÛÛÜœÈİ\œÛÜ‹\Ú[\ˆ‚ˆ]OH¶+v,6`H6)öa6ava6`H‚ˆ‚ˆ˜\ÚˆÛ\ÜÓ˜[YOHËLËHLËHˆÏ‚ˆØ]Û‚ˆÙ]‚ˆÙ]‚ˆ
J_BˆÙ]‚ˆ
_BˆÙ]‚ˆ
_B‚ˆËÊˆ8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d
‹ßBˆËÊˆPˆˆ’SSÓÕT”ÑHVSH•RSTˆ
‹ßBˆËÊˆ8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d
‹ßBˆÛ[Ù[Xİ]™UXˆOOH	Ù^[IÈ	‰ˆ
ˆ]ˆÛ\ÜÓ˜[YOHœÜXÙK^KMˆ[š[X]KY˜YKZ[‹]\‚ˆ]ˆÛ\ÜÓ˜[YOHœM›İ[™YL™Ë\Û]KML›Ü™\ˆ›Ü™\‹\Û]KLŒÜXÙK^KM‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆ\İYKX™]ÙY[ˆ›Ü™\‹Xˆ›Ü™\‹\Û]KLŒ‹LÈ‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆØ\L‹H‚ˆ]ˆÛ\ÜÓ˜[YOHËNHNH›İ[™Y^™ËX[X™\‹LL^X[X™\‹MÌ›^][\ËXÙ[\ˆ\İYKXÙ[\ˆ‚ˆ]Ø\™Û\ÜÓ˜[YOHËMHMHˆÏ‚ˆÙ]‚ˆ]‚ˆÛ\ÜÓ˜[YOH^^È›ÛX›XÚÈ^\Û]KN¶)öa6)ö+¶*¶*6)ö,H6)öa6a¶aö)ö)¶bˆ6)öa6-6)öava6a6a6+öb6,v*OÚ‚ˆÛ\ÜÓ˜[YOH^VÌLH^\Û]KML›Û[YY][H‚ˆ6b¶)6+öbˆ6)öa6av*¶+ö,v*6)öa6)ö+¶*¶*6)ö,H6b6*¶-v+ö,H6)öa6-6aö)ö+ö*H6)öa6av.v*¶av+ö*H6`vb6,H6)ö+6*¶b¶)ö,¶aÈ6*6a¶+6)ö+BˆÜ‚ˆÙ]‚ˆÙ]‚‚ˆX™[Û\ÜÓ˜[YOH™›^][\ËXÙ[\ˆØ\Lˆ^^È›ÛX›XÚÈ^\Û]KNİ\œÛÜ‹\Ú[\ˆ‚ˆ[œ]ˆ\OH˜ÚXÚØ›Ş‚ˆÚXÚÙY^Ú\Ñš[˜[^[_BˆÛÚ[™ÙO^ÊJHOˆÙ]\Ñš[˜[^[JK\™Ù]˜ÚXÚÙY
_BˆÛ\ÜÓ˜[YOHËMM^VÈÌMÌĞMĞ×H›İ[™Yİ\œÛÜ‹\Ú[\ˆ‚ˆÏ‚ˆÜ[¶*¶`v.vb¶a6)öa6)ö+¶*¶*6)ö,H6)öa6a¶aö)ö)¶bˆ6a6a6+öb6,v*OÜÜ[‚ˆÛX™[‚ˆÙ]‚‚ˆÚ\Ñš[˜[^[H	‰ˆ
ˆ]ˆÛ\ÜÓ˜[YOHœÜXÙK^KMH‚ˆ]ˆÛ\ÜÓ˜[YOH™ÜšYÜšYXÛÛËLHÛN™ÜšYXÛÛËLˆØ\M‚ˆ]‚ˆX™[Û\ÜÓ˜[YOH˜›ØÚÈ^^È›ÛX›XÚÈ^\Û]KMÌX‹LH¶.va¶b6)öaˆ6)öa6)ö+¶*¶*6)ö,OÛX™[‚ˆ[œ]ˆ\OH^‚ˆ˜[YO^Ù›Ü›Qš[˜[^[K]_BˆÛÚ[™ÙO^ÊJHOˆÙ]›Ü›Qš[˜[^[JÈ‹‹™›Ü›Qš[˜[^[K]NˆK\™Ù]˜[YHJ_BˆXÙZÛ\H¶av*ö)öaˆ6)öa6)ö+¶*¶*6)ö,H6)öa6a¶aö)ö)¶bˆ6a6a6*6,va¶)öav+6)öa6*¶+ö,vb¶*6bˆ‚ˆÛ\ÜÓ˜[YOHËY[LËHKLˆ^^È›ÛX›Û^\Û]KN™Ë]Ú]H›İ[™Y^›Ü™\ˆ›Ü™\‹\Û]KLŒ›Øİ\Î›İ][™K[›Û™H›Øİ\Î˜›Ü™\‹VÈÌMÌĞMĞ×H‚ˆÏ‚ˆÙ]‚‚ˆ]‚ˆX™[Û\ÜÓ˜[YOH˜›ØÚÈ^^È›ÛX›XÚÈ^\Û]KMÌX‹LH¶a¶,ö*6*H6)öa6a¶+6)ö+H6)öa6av-öa6b6*6*H
	JOÛX™[‚ˆ[œ]ˆ\OH›[X™\ˆ‚ˆZ[^ÍLBˆX^^ÌLBˆ˜[YO^Ù›Ü›Qš[˜[^[Kœ\ÜÚ[™ÔØÛÜ™HÌBˆÛÚ[™ÙO^ÊJHOˆÙ]›Ü›Qš[˜[^[JÈ‹‹™›Ü›Qš[˜[^[K\ÜÚ[™ÔØÛÜ™Nˆ\œÙR[
K\™Ù]˜[YKL
HÌJ_BˆXÙZÛ\HÌ‚ˆÛ\ÜÓ˜[YOHËY[LËHKLˆ^^È›ÛX›Û^\Û]KN™Ë]Ú]H›İ[™Y^›Ü™\ˆ›Ü™\‹\Û]KLŒ›Øİ\Î›İ][™K[›Û™H›Øİ\Î˜›Ü™\‹VÈÌMÌĞMĞ×H‚ˆÏ‚ˆÙ]‚ˆÙ]‚‚ˆËÊˆ]Y\İ[ÛœÈ\İ
‹ßBˆ]ˆÛ\ÜÓ˜[YOHœÜXÙK^KM‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆ\İYKX™]ÙY[ˆ‚ˆHÛ\ÜÓ˜[YOH^^È›ÛX›XÚÈ^\Û]KN‚ˆ6*6a¶`È6(ö,ö)¶a6*H6)öa6)ö+¶*¶*6)ö,H
Ù›Ü›Qš[˜[^[Kœ]Y\İ[ÛœÏË›[™İH6(ö,ö)¶a6*JBˆÚO‚‚ˆ]Û‚ˆ\OH˜]Ûˆ‚ˆÛÛXÚÏ^Ê
HOˆÂˆÛÛœİ™^S[HH
›Ü›Qš[˜[^[Kœ]Y\İ[ÛœÏË›[™İ
H
ÈNÂˆÙ]›Ü›Qš[˜[^[JÂˆ‹‹™›Ü›Qš[˜[^[Kˆ]Y\İ[ÛœÎˆÂˆ‹‹Š›Ü›Qš[˜[^[Kœ]Y\İ[ÛœÈ×JKˆÂˆYˆKIÑ]K››İÊ
_KIÛ™^S[_Xˆ]Y\İ[Ûˆ6)öa6,ö)6)öa	Û™^S[_NˆˆÜ[ÛœÎˆÉö)öa6+¶b¶)ö,H6(È
6)öa6-v+vb¶+JIË	ö)öa6+¶b¶)ö,H6*	Ë	ö)öa6+¶b¶)ö,H6+	Ë	ö)öa6+¶b¶)ö,H6+É×KˆÛÜœ™Xİ[™^ˆˆ^[˜][Ûˆ	ö*¶b6-¶b¶+H6)öa6)v+6)ö*6*H6)öa6-v+vb¶+v*K‰ËˆKˆKˆJNÂˆ_BˆÛ\ÜÓ˜[YOHœLÈKLKH›İ[™Y^™ËX[X™\‹MLİ™\˜™ËX[X™\‹MŒ^]Ú]H›ÛX›XÚÈ^^È›^][\ËXÙ[\ˆØ\LHİ\œÛÜ‹\Ú[\ˆ‚ˆ‚ˆ\ÈÛ\ÜÓ˜[YOHËLËHLËHˆÏ‚ˆÜ[¶)v-¶)ö`v*H6,ö)6)öa6+6+öb¶+ÏÜÜ[‚ˆØ]Û‚ˆÙ]‚‚ˆÙ›Ü›Qš[˜[^[Kœ]Y\İ[ÛœÏË›X\

KRY
HOˆ
ˆ]‚ˆÙ^O^ÜKšYRYBˆÛ\ÜÓ˜[YOHœM›İ[™Y^™Ë]Ú]H›Ü™\ˆ›Ü™\‹\Û]KLŒÜXÙK^KLÈÚYİËLÈ‚ˆ‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆ\İYKX™]ÙY[ˆØ\Lˆ›Ü™\‹Xˆ›Ü™\‹\Û]KLL‹Lˆ‚ˆÜ[ˆÛ\ÜÓ˜[YOH^^È›ÛX›XÚÈ^VÈÌMÌĞMĞ×H¶)öa6,ö)6)öaŞÜRY
È_OÜÜ[‚ˆÙ›Ü›Qš[˜[^[Kœ]Y\İ[ÛœË›[™İˆH	‰ˆ
ˆ]Û‚ˆ\OH˜]Ûˆ‚ˆÛÛXÚÏ^Ê
HOˆÂˆÙ]›Ü›Qš[˜[^[JÂˆ‹‹™›Ü›Qš[˜[^[Kˆ]Y\İ[ÛœÎˆ›Ü›Qš[˜[^[Kœ]Y\İ[ÛœË™š[\Š
ËY
HOˆYOOHRY
KˆJNÂˆ_BˆÛ\ÜÓ˜[YOHœLH^\Û]KMİ™\^\›ÜÙKMŒ›İ[™Yİ\œÛÜ‹\Ú[\ˆ‚ˆ]OH¶+v,6`H6aö,6)È6)öa6,ö)6)öa‚ˆ‚ˆ˜\ÚˆÛ\ÜÓ˜[YOHËLËHLËHˆÏ‚ˆØ]Û‚ˆ
_BˆÙ]‚‚ˆ]‚ˆX™[Û\ÜÓ˜[YOH˜›ØÚÈ^VÌL\H›ÛX›XÚÈ^\Û]KMŒX‹LH¶a¶-H6)öa6,ö)6)öa
ÛX™[‚ˆ[œ]ˆ\OH^‚ˆ™\]Z\™Yˆ˜[YO^ÜKœ]Y\İ[ÛŸBˆÛÚ[™ÙO^ÊJHOˆÂˆÛÛœİ\]YHË‹‹™›Ü›Qš[˜[^[Kœ]Y\İ[Ûœ×NÂˆ\]YÜRYKœ]Y\İ[ÛˆHK\™Ù]˜[YNÂˆÙ]›Ü›Qš[˜[^[JÈ‹‹™›Ü›Qš[˜[^[K]Y\İ[ÛœÎˆ\]YJNÂˆ_BˆXÙZÛ\H¶)ö`ö*¶*6a¶-H6)öa6,ö)6)öa6aöa¶)Ë‹‹ˆ‚ˆÛ\ÜÓ˜[YOHËY[LÈKLˆ^^È›ÛX›Û^\Û]KN™Ë\Û]KML›İ[™Y[È›Ü™\ˆ›Ü™\‹\Û]KLŒ›Øİ\Î›İ][™K[›Û™H›Øİ\Î˜›Ü™\‹VÈÌMÌĞMĞ×H‚ˆÏ‚ˆÙ]‚‚ˆ]ˆÛ\ÜÓ˜[YOHœÜXÙK^KLˆ‚ˆX™[Û\ÜÓ˜[YOH˜›ØÚÈ^VÌL\H›ÛX›XÚÈ^\Û]KMŒ‚ˆ6+¶b¶)ö,v)ö*ˆ6)öa6)v+6)ö*6*H
6+v+ö+È6)öa6+ö)ö)¶,v*H6*6+6)öa¶*6)öa6)v+6)ö*6*H6)öa6-v+vb¶+v*JN‚ˆÛX™[‚ˆ]ˆÛ\ÜÓ˜[YOH™ÜšYÜšYXÛÛËLHÛN™ÜšYXÛÛËLˆØ\Lˆ‚ˆÜK›Ü[ÛœË›X\

ÜÜY
HOˆ
ˆ]‚ˆÙ^O^ÛÜYBˆÛ\ÜÓ˜[YO^Ø›^][\ËXÙ[\ˆØ\LˆLˆ›İ[™Y[È›Ü™\ˆ˜[œÚ][Û‹X[	ÂˆK˜ÛÜœ™Xİ[™^OOHÜYˆÈ	Ø™ËY[Y\˜[MLÍÌ›Ü™\‹Y[Y\˜[LÌ	Âˆˆ	Ø™Ë\Û]KML›Ü™\‹\Û]KLŒ	ÂˆXBˆ‚ˆ[œ]ˆ\OHœ˜Y[È‚ˆ˜[YO^ØKIÜRYKXÛÜœ™XİBˆÚXÚÙY^ÜK˜ÛÜœ™Xİ[™^OOHÜYBˆÛÚ[™ÙO^Ê
HOˆÂˆÛÛœİ\]YHË‹‹™›Ü›Qš[˜[^[Kœ]Y\İ[Ûœ×NÂˆ\]YÜRYK˜ÛÜœ™Xİ[™^HÜYÂˆÙ]›Ü›Qš[˜[^[JÈ‹‹™›Ü›Qš[˜[^[K]Y\İ[ÛœÎˆ\]YJNÂˆ_BˆÛ\ÜÓ˜[YOHËMM^Y[Y\˜[MŒİ\œÛÜ‹\Ú[\ˆ‚ˆÏ‚ˆ[œ]ˆ\OH^‚ˆ˜[YO^ÛÜBˆÛÚ[™ÙO^ÊJHOˆÂˆÛÛœİ\]YHË‹‹™›Ü›Qš[˜[^[Kœ]Y\İ[Ûœ×NÂˆ\]YÜRYK›Ü[ÛœÖÛÜYHHK\™Ù]˜[YNÂˆÙ]›Ü›Qš[˜[^[JÈ‹‹™›Ü›Qš[˜[^[K]Y\İ[ÛœÎˆ\]YJNÂˆ_BˆXÙZÛ\^Ø6)öa6+¶b¶)ö,H	ÛÜY
È_XBˆÛ\ÜÓ˜[YOH™›^LHLˆKLH^^È›ÛX›Û^\Û]KN™Ë]Ú]H›İ[™Y›Ü™\ˆ›Ü™\‹\Û]KLŒ‚ˆÏ‚ˆÙ]‚ˆ
J_BˆÙ]‚ˆÙ]‚ˆÙ]‚ˆ
J_BˆÙ]‚ˆÙ]‚ˆ
_BˆÙ]‚ˆÙ]‚ˆ
_B‚ˆËÊˆ[Ù[›Ûİ\ˆÛÛ›ÛÈ
‹ßBˆ]ˆÛ\ÜÓ˜[YOHœM›Ü™\‹]›Ü™\‹\Û]KLŒ›^][\ËXÙ[\ˆ\İYKX™]ÙY[ˆØ\LÈ‚ˆ]Û‚ˆ\OH˜]Ûˆ‚ˆÛÛXÚÏ^Ê
HOˆÙ]\Ó[Ù[Ü[Š˜[ÙJ_BˆÛ\ÜÓ˜[YOHœMHKL‹H›İ[™Y^™Ë\Û]KLLİ™\˜™Ë\Û]KLŒ^\Û]KMÌ›ÛX›XÚÈ^^È˜[œÚ][Û‹XÛÛÜœÈİ\œÛÜ‹\Ú[\ˆ‚ˆ‚ˆ6)va6.¶)ö(BˆØ]Û‚‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆØ\Lˆ‚ˆÛ[Ù[Xİ]™UXˆOOH	Ø˜\ÚXÉÈ	‰ˆ
ˆ]Û‚ˆ\OH˜]Ûˆ‚ˆÛÛXÚÏ^Ê
HOˆÂˆYˆ
[Ù[Xİ]™UXˆOOH	Ù^[IÊHÙ][Ù[Xİ]™UXŠ	Ø]XÚY[ÉÊNÂˆ[ÙHYˆ
[Ù[Xİ]™UXˆOOH	Ø]XÚY[ÉÊHÙ][Ù[Xİ]™UXŠ	Øİ\œšXİ[[IÊNÂˆ[ÙHYˆ
[Ù[Xİ]™UXˆOOH	Øİ\œšXİ[[IÊHÙ][Ù[Xİ]™UXŠ	Ø˜\ÚXÉÊNÂˆ_BˆÛ\ÜÓ˜[YOHœMKL‹H›İ[™Y^™Ë\Û]KLLİ™\˜™Ë\Û]KLŒ^\Û]KMÌ›ÛX›Û^^Èİ\œÛÜ‹\Ú[\ˆ‚ˆ‚ˆ6)öa6,ö)ö*6`‚ˆØ]Û‚ˆ
_B‚ˆÛ[Ù[Xİ]™UXˆOOH	Ù^[IÈ	‰ˆ
ˆ]Û‚ˆ\OH˜]Ûˆ‚ˆÛÛXÚÏ^Ê
HOˆÂˆYˆ
[Ù[Xİ]™UXˆOOH	Ø˜\ÚXÉÊHÙ][Ù[Xİ]™UXŠ	Øİ\œšXİ[[IÊNÂˆ[ÙHYˆ
[Ù[Xİ]™UXˆOOH	Øİ\œšXİ[[IÊHÙ][Ù[Xİ]™UXŠ	Ø]XÚY[ÉÊNÂˆ[ÙHYˆ
[Ù[Xİ]™UXˆOOH	Ø]XÚY[ÉÊHÙ][Ù[Xİ]™UXŠ	Ù^[IÊNÂˆ_BˆÛ\ÜÓ˜[YOHœMKL‹H›İ[™Y^™ËVÈÌMÌĞMĞ×Hİ™\˜™ËVÈÌQMQH^]Ú]H›ÛX›Û^^Èİ\œÛÜ‹\Ú[\ˆ‚ˆ‚ˆ6)öa6*¶)öa6bˆ8§¥ˆØ]Û‚ˆ
_B‚ˆ]Û‚ˆ\OHœİX›Z]‚ˆ\ØX›Y^Ú\ÔİX›Z][™ßBˆÛ\ÜÓ˜[YOHœMÈKL‹H›İ[™Y^™ËYÜ˜YY[]Ë\ˆœ›ÛKY[Y\˜[MŒË]X[MÌİ™\™œ›ÛKY[Y\˜[MÌİ™\Ë]X[N^]Ú]H›ÛX›XÚÈ^^ÈÚYİË[Y˜[œÚ][Û‹X[İ\œÛÜ‹\Ú[\ˆ›^][\ËXÙ[\ˆØ\LKH\ØX›Y›ÜXÚ]KMLXİ]™NœØØ[KNMH‚ˆ‚ˆÚ\ÔİX›Z][™ÈÈ
ˆ‚ˆØY\ŒˆÛ\ÜÓ˜[YOHËMM[š[X]K\Ü[ˆˆÏ‚ˆÜ[¶+6)ö,vbˆ6)öa6+v`v.6b6)öa6av,¶)öava¶*H6)öa6,ö+v)ö*6b¶*K‹‹ÜÜ[‚ˆÏ‚ˆ
Hˆ
ˆ‚ˆÚXÚÈÛ\ÜÓ˜[YOHËMMˆÏ‚ˆÜ[ÙY][™ĞÛİ\œÙHÈ	ö+v`v.6b6*¶+v+öb¶*È6`ö)öava6)öa6*¶.v+öb¶a6)ö*ˆ8¦¨IÈˆ	öa¶-6,H6)öa6+öb6,v*H6av.H6)öa6ava¶aö+6b6)öa6av,v`v`¶)ö*ˆ<'æ 	ßOÜÜ[‚ˆÏ‚ˆ
_BˆØ]Û‚ˆÙ]‚ˆÙ]‚ˆÙ›Ü›O‚ˆÛ[İ[Û‹™]‚ˆÙ]‚ˆ
_BˆĞ[š[X]T™\Ù[˜ÙO‚‚ˆËÊˆ8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d
‹ßBˆËÊˆ‹ˆÕS‘SÓ‘HQQPH	ˆTÔÓÓ”ÈÕQSÈSÑS
‹ßBˆËÊˆ8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d8¥d
‹ßBˆ[š[X]T™\Ù[˜ÙO‚ˆÜÙ[XİYÛİ\œÙQ›Ü“\ÜÛÛœÈ	‰ˆ
ˆ]ˆÛ\ÜÓ˜[YOH™š^Y[œÙ]L‹ML›^][\ËXÙ[\ˆ\İYKXÙ[\ˆLÈÛNœM™Ë\Û]KNLÍÌ˜XÚÙ›ÜX›\‹\ÛH‚ˆ[İ[Û‹™]‚ˆ[š]X[^ŞÈÜXÚ]NˆØØ[NˆMKNˆŒ_Bˆ[š[X]O^ŞÈÜXÚ]NˆKØØ[NˆKNˆ_Bˆ^]^ŞÈÜXÚ]NˆØØ[NˆMKNˆŒ_BˆÛ\ÜÓ˜[YOHËY[X^]ËM^™Ë]Ú]H›İ[™YLŞÚYİËL›Ü™\ˆ›Ü™\‹\Û]KLLİ™\™›İËZY[ˆ›^›^XÛÛX^ZVÎLšH‚ˆ‚ˆËÊˆ[Ù[XY\ˆ
‹ßBˆ]ˆÛ\ÜÓ˜[YOHœMHÛNœMˆ™ËYÜ˜YY[]Ë\ˆœ›ÛKVÈÌMÌĞMĞ×HšXKVÈÌQMQHËVÈÌÌŒÍ—H^]Ú]H›^][\ËXÙ[\ˆ\İYKX™]ÙY[ˆÚš[šËL‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆØ\LÈ‚ˆ]ˆÛ\ÜÓ˜[YOHËLLHLLH›İ[™YL™ËY[Y\˜[MLÌŒ›Ü™\ˆ›Ü™\‹Y[Y\˜[MÌÌ›^][\ËXÙ[\ˆ\İYKXÙ[\ˆ‚ˆšY[ÈÛ\ÜÓ˜[YOHËMHMH^Y[Y\˜[LÌˆÏ‚ˆÙ]‚ˆ]‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆØ\Lˆ‚ˆÜ[ˆÛ\ÜÓ˜[YOHœLˆKLH›İ[™Y[Y™Ë]Ú]KÌŒ^VÌLH›ÛX›XÚÈ‚ˆ[›Hİ™X[H“BˆÜÜ[‚ˆÜ[ˆÛ\ÜÓ˜[YOH^^È^Y[Y\˜[LÌ›ÛX›Û¶av`ö*¶*6*H6,v`¶aNˆÍÌMÎLÜÜ[‚ˆÙ]‚ˆÈÛ\ÜÓ˜[YOH^X˜\ÙHÛN^[È›ÛX›XÚÈ]LHÜÙ[XİYÛİ\œÙQ›Ü“\ÜÛÛœË]_OÚÏ‚ˆÙ]‚ˆÙ]‚ˆ]Û‚ˆÛÛXÚÏ^Ê
HOˆÂˆÙ]Ù[XİYÛİ\œÙQ›Ü“\ÜÛÛœÊ[
NÂˆÙ]™]šY]ÕšY[Õ\›
[
NÂˆÙ]™]šY]ÔÚYÛ™YYœ˜[YU\›
[
NÂˆÙ]™]šY]Ñ\œ›ÜŠ[
NÂˆ_BˆÛ\ÜÓ˜[YOHËNN›İ[™YY[™Ë]Ú]KÌLİ™\˜™Ë]Ú]KÌŒ›^][\ËXÙ[\ˆ\İYKXÙ[\ˆ^]Ú]H˜[œÚ][Û‹XÛÛÜœÈİ\œÛÜ‹\Ú[\ˆ‚ˆ‚ˆÛ\ÜÓ˜[YOHËMMˆÏ‚ˆØ]Û‚ˆÙ]‚‚ˆËÊˆ[Ù[›ÙH
‹ßBˆ]ˆÛ\ÜÓ˜[YOHœMˆİ™\™›İË^KX]]ÈÜXÙK^KMˆ›^LH‚ˆËÊˆKˆY™]È\ÜÛÛˆ	ˆ\ØYÙXİ[Ûˆ
‹ßBˆ]ˆÛ\ÜÓ˜[YOHœMH›İ[™YL™Ë\Û]KML›Ü™\ˆ›Ü™\‹\Û]KLŒÜXÙK^KM‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆ\İYKX™]ÙY[ˆ‚ˆÛ\ÜÓ˜[YOH^^È›ÛX›XÚÈ^\Û]KN›^][\ËXÙ[\ˆØ\Lˆ‚ˆ\ÈÛ\ÜÓ˜[YOHËMM^VÈÌMÌĞMĞ×HˆÏ‚ˆÜ[¶)v-¶)ö`v*H6av+v)ö-¶,v*H6(öb6+ö,v,È6+6+öb¶+È6a6a6+öb6,v*OÜÜ[‚ˆÚ‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆØ\Lˆ‚ˆ]Û‚ˆ\OH˜]Ûˆ‚ˆÛÛXÚÏ^Ê
HOˆÙ]\ØYY]Ù
	Ùš[IÊ_BˆÛ\ÜÓ˜[YO^ØLÈKLH›İ[™Y[È^^È›ÛX›XÚÈ˜[œÚ][Û‹XÛÛÜœÈİ\œÛÜ‹\Ú[\ˆ	Âˆ\ØYY]ÙOOH	Ùš[IÂˆÈ	Ø™ËVÈÌMÌĞMĞ×H^]Ú]IÂˆˆ	Ø™Ë]Ú]H^\Û]KMŒ›Ü™\ˆ›Ü™\‹\Û]KLŒ	ÂˆXBˆ‚ˆ6,v`v.H6`vb¶+öb¶b6av*6)ö-6,H
[›Hİ™X[JBˆØ]Û‚ˆ]Û‚ˆ\OH˜]Ûˆ‚ˆÛÛXÚÏ^Ê
HOˆÙ]\ØYY]Ù
	İ\›	Ê_BˆÛ\ÜÓ˜[YO^ØLÈKLH›İ[™Y[È^^È›ÛX›XÚÈ˜[œÚ][Û‹XÛÛÜœÈİ\œÛÜ‹\Ú[\ˆ	Âˆ\ØYY]ÙOOH	İ\›	ÂˆÈ	Ø™ËVÈÌMÌĞMĞ×H^]Ú]IÂˆˆ	Ø™Ë]Ú]H^\Û]KMŒ›Ü™\ˆ›Ü™\‹\Û]KLŒ	ÂˆXBˆ‚ˆ6)v+ö+¶)öa6`öb6+È6)öa6`vb¶+öb¶bÈ6,v)ö*6-ÂˆØ]Û‚ˆÙ]‚ˆÙ]‚‚ˆ›Ü›HÛ”İX›Z]^Ú[™TØ]™S\ÜÛÛŸHÛ\ÜÓ˜[YOHœÜXÙK^KLÈ‚ˆ]ˆÛ\ÜÓ˜[YOH™ÜšYÜšYXÛÛËLHÛN™ÜšYXÛÛËLÈØ\LÈ‚ˆ]ˆÛ\ÜÓ˜[YOHœÛN˜ÛÛ\Ü[‹Lˆ‚ˆX™[Û\ÜÓ˜[YOH˜›ØÚÈ^VÌL\H›ÛX›XÚÈ^\Û]KMÌX‹LH‚ˆ6.va¶b6)öaˆ6)öa6av+v)ö-¶,v*H6(öb6)öa6+ö,v,È
‚ˆÛX™[‚ˆ[œ]ˆ\OH^‚ˆ™\]Z\™Yˆ˜[YO^Û™]Ó\ÜÛÛ•]_BˆÛÚ[™ÙO^ÊJHOˆÙ]™]Ó\ÜÛÛ•]JK\™Ù]˜[YJ_BˆXÙZÛ\H¶av*ö)öaˆ6)öa6+ö,v,È6)öa6(öb6aˆ6)öa6*¶(ö,öb¶,È6b6)öa6av`v)öaöb¶aH6)öa6+6b6aö,vb¶*H‚ˆÛ\ÜÓ˜[YOHËY[LËHKLˆ^^È›ÛX›Û^\Û]KN™Ë]Ú]H›İ[™Y^›Ü™\ˆ›Ü™\‹\Û]KLŒ›Øİ\Î›İ][™K[›Û™H›Øİ\Î˜›Ü™\‹VÈÌMÌĞMĞ×H‚ˆÏ‚ˆÙ]‚ˆ]‚ˆX™[Û\ÜÓ˜[YOH˜›ØÚÈ^VÌL\H›ÛX›XÚÈ^\Û]KMÌX‹LH‚ˆ6)öa6av+ö*H
6*¶cö+v,ö*6*¶a6`¶)ö)¶b¶)öbÊBˆÛX™[‚ˆ[œ]ˆ\OH^‚ˆ˜[YO^Û™]Ó\ÜÛÛ‘\˜][ÛŸBˆÛÚ[™ÙO^ÊJHOˆÙ]™]Ó\ÜÛÛ‘\˜][ÛŠK\™Ù]˜[YJ_BˆXÙZÛ\H¶*¶cö+v,ö*6*¶a6`¶)ö)¶b¶)öbÈ6.va¶+È6,v`v.H6)öa6`vb¶+öb¶b‚ˆÛ\ÜÓ˜[YOHËY[LËHKLˆ^^È›ÛX›Û^\Û]KN™Ë]Ú]H›İ[™Y^›Ü™\ˆ›Ü™\‹\Û]KLŒ›Øİ\Î›İ][™K[›Û™H›Øİ\Î˜›Ü™\‹VÈÌMÌĞMĞ×H‚ˆÏ‚ˆÙ]‚ˆÙ]‚‚ˆİ\ØYY]ÙOOH	Ùš[IÈÈ
ˆ]ˆÛ\ÜÓ˜[YOHœM›İ[™Y^™Ë]Ú]H›Ü™\‹Lˆ›Ü™\‹Y\ÚY›Ü™\‹\Û]KLŒ^XÙ[\ˆÜXÙK^KLˆ‚ˆ\ØYÛİYÛ\ÜÓ˜[YOHËNN^VÈÌMÌĞMĞ×H^X]]ÈˆÏ‚ˆ]ˆÛ\ÜÓ˜[YOH^^È›ÛX›XÚÈ^\Û]KMÌ‚ˆ6)ö+¶*¶,H6ava6`H6)öa6`vb¶+öb¶b6a6a6,v`v.H6)öa6av*6)ö-6,H6)va6bH[›K›™]İ™X[BˆÙ]‚ˆÛ\ÜÓ˜[YOH^VÌL\H^\Û]KM›Û[YY][H‚ˆ6b¶*¶aH6)ö+v*¶,ö)ö*6b6*¶.v*6)¶*H6av+ö*H6)öa6`vb¶+öb¶b6*¶a6`¶)ö)¶b¶)öbÈ6`vb6,H6)ö+¶*¶b¶)ö,vaÂˆÜ‚‚ˆ]ˆÛ\ÜÓ˜[YOHœLˆ‚ˆ[œ]ˆ™Y^Üİ[™[Û™Qš[R[œ]™YŸBˆ\OH™š[H‚ˆXØÙ\HšY[ËÊˆ‚ˆÛÚ[™ÙO^Ú[™Q\™XİšY[Õ\ØYBˆ\ØX›Y^Ú\Õ\ØY[™ßBˆÛ\ÜÓ˜[YOHšY[ˆ‚ˆYHœİ[™[Û™K]šY[Ë]\ØYZ[œ]‚ˆÏ‚ˆX™[ˆ[›ÜHœİ[™[Û™K]šY[Ë]\ØYZ[œ]‚ˆÛ\ÜÓ˜[YO^Ø[›[™KY›^][\ËXÙ[\ˆØ\LˆMHKL‹H›İ[™Y^™ËVÈÌMÌĞMĞ×Hİ™\˜™ËVÈÌQMQH^]Ú]H^^È›ÛX›XÚÈİ\œÛÜ‹\Ú[\ˆ˜[œÚ][Û‹X[ÚYİË^È	Âˆ\Õ\ØY[™ÈÈ	ÛÜXÚ]KMLÚ[\‹Y]™[Ë[›Û™IÈˆ	ÉÂˆXBˆ‚ˆÚ\Õ\ØY[™ÈÈ
ˆ‚ˆØY\ŒˆÛ\ÜÓ˜[YOHËMM[š[X]K\Ü[ˆˆÏ‚ˆÜ[¶+6)ö,vbˆ6)öa6,v`v.H6b6)öa6av.v)öa6+6*H
İ\ØY›ÙÜ™\ÜßIJK‹‹ÜÜ[‚ˆÏ‚ˆ
Hˆ
ˆ‚ˆ\ØYÛİYÛ\ÜÓ˜[YOHËMMˆÏ‚ˆÜ[¶)ö+¶*¶b¶)ö,H6ava6`H6`vb¶+öb¶b6avaˆ6+6aö)ö,¶`ÏÜÜ[‚ˆÏ‚ˆ
_BˆÛX™[‚ˆÙ]‚‚ˆÚ\Õ\ØY[™È	‰ˆ
ˆ]ˆÛ\ÜÓ˜[YOHËY[™Ë\Û]KLL›İ[™YY[Lˆİ™\™›İËZY[ˆ]LÈ‚ˆ]‚ˆÛ\ÜÓ˜[YOH˜™ËY[Y\˜[MLY[˜[œÚ][Û‹X[\˜][Û‹LÌ‚ˆİ[O^ŞÈÚYˆ	İ\ØY›ÙÜ™\ÜßIX_BˆÏ‚ˆÙ]‚ˆ
_B‚ˆİ\ØYİXØÙ\ÜÈ	‰ˆ
ˆ]ˆÛ\ÜÓ˜[YOHœLÈ›İ[™Y^™ËY[Y\˜[ML^Y[Y\˜[N^^È›ÛX›Û›Ü™\ˆ›Ü™\‹Y[Y\˜[LŒ^\šYÚ›^›^XÛÛÛN™›^\›İÈÛNš][\ËXÙ[\ˆ\İYKX™]ÙY[ˆØ\Lˆ‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆØ\Lˆ‚ˆÚXÚĞÚ\˜ÛLˆÛ\ÜÓ˜[YOHËMM^Y[Y\˜[MŒÚš[šËLˆÏ‚ˆÜ[İ\ØYİXØÙ\ÜßOÜÜ[‚ˆÙ]‚ˆÛ™]Ó\ÜÛÛ•\›	‰ˆ
ˆ]Û‚ˆ\OH˜]Ûˆ‚ˆÛÛXÚÏ^Ê
HOˆ[™T™]šY]ÕšY[Ê™]Ó\ÜÛÛ•\›
_BˆÛ\ÜÓ˜[YOHœLÈKLKH›İ[™Y[È™ËVÈÌMÌĞMĞ×Hİ™\˜™ËVÈÌQMQH^]Ú]H^VÌL\H›ÛX›XÚÈ˜[œÚ][Û‹X[İ\œÛÜ‹\Ú[\ˆÚš[šËLÚYİË^È›^][\ËXÙ[\ˆØ\LKHÙ[‹\İ\ÛNœÙ[‹X]]È‚ˆ‚ˆ^PÚ\˜ÛHÛ\ÜÓ˜[YOHËLËHLËH^Y[Y\˜[LÌˆÏ‚ˆÜ[¶av.v)öb¶a¶*H6)öa6`vb¶+öb¶b6)öa6(¶aÜÜ[‚ˆØ]Û‚ˆ
_BˆÙ]‚ˆ
_B‚ˆİ\ØY\œ›Üˆ	‰ˆ
ˆ]ˆÛ\ÜÓ˜[YOHœL‹H›İ[™Y[È™Ë\›ÜÙKML^\›ÜÙKN^^È›ÛX›Û›Ü™\ˆ›Ü™\‹\›ÜÙKLŒ^\šYÚ›^][\ËXÙ[\ˆØ\Lˆ‚ˆ[\Ú\˜ÛHÛ\ÜÓ˜[YOHËMM^\›ÜÙKMŒÚš[šËLˆÏ‚ˆÜ[İ\ØY\œ›ÜŸOÜÜ[‚ˆÙ]‚ˆ
_BˆÙ]‚ˆ
Hˆ
ˆ]‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆ\İYKX™]ÙY[ˆX‹LH‚ˆX™[Û\ÜÓ˜[YOH˜›ØÚÈ^VÌL\H›ÛX›XÚÈ^\Û]KMÌ‚ˆ6av.v,v`H6)öa6`vb¶+öb¶b6avaˆ[›K›™]
šY[ÈQÈÕRQ
H6(öb6`öb6+È6)öa6*¶-¶avb¶a‚ˆÛX™[‚ˆÛ™]Ó\ÜÛÛ•\›	‰ˆ
ˆ]Û‚ˆ\OH˜]Ûˆ‚ˆÛÛXÚÏ^Ê
HOˆ[™T™]šY]ÕšY[Ê™]Ó\ÜÛÛ•\›
_BˆÛ\ÜÓ˜[YOH^VÌL\H^VÈÌMÌĞMĞ×Hİ™\[™\›[™H›ÛX›Û›^][\ËXÙ[\ˆØ\LHİ\œÛÜ‹\Ú[\ˆ‚ˆ‚ˆ^PÚ\˜ÛHÛ\ÜÓ˜[YOHËLËHLËH^X›YKMŒˆÏ‚ˆÜ[¶av.v)öb¶a¶*H6)öa6,v)ö*6-È6)öa6av`ö*¶b6*ÜÜ[‚ˆØ]Û‚ˆ
_BˆÙ]‚ˆ[œ]ˆ\OH^‚ˆ™\]Z\™Yˆ˜[YO^Û™]Ó\ÜÛÛ•\›BˆÛÚ[™ÙO^ÊJHOˆÙ]™]Ó\ÜÛÛ•\›
K\™Ù]˜[YJ_BˆXÙZÛ\H¶av*ö)öaˆYLŒ‹LŒKMMX™ŒY‹MLÌÌÍ˜X˜M6(öb6av.v,v`H6b¶b6*¶b¶b6*‚ˆÛ\ÜÓ˜[YOHËY[LËHKLˆ^^È›ÛX›Û^\Û]KN™Ë]Ú]H›İ[™Y^›Ü™\ˆ›Ü™\‹\Û]KLŒ›Øİ\Î›İ][™K[›Û™H›Øİ\Î˜›Ü™\‹VÈÌMÌĞMĞ×H‚ˆÏ‚ˆÙ]‚ˆ
_B‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆ\İYKY[™Lˆ‚ˆ]Û‚ˆ\OHœİX›Z]‚ˆ\ØX›Y^Ú\Õ\ØY[™ßBˆÛ\ÜÓ˜[YOHœMˆKL‹H›İ[™Y^™ËYÜ˜YY[]Ë\ˆœ›ÛKY[Y\˜[MLË]X[MŒİ™\™œ›ÛKY[Y\˜[MŒİ™\Ë]X[MÌ^]Ú]H›ÛX›XÚÈ^^ÈÚYİË[Y˜[œÚ][Û‹X[›^][\ËXÙ[\ˆØ\Lˆİ\œÛÜ‹\Ú[\ˆXİ]™NœØØ[KNMH‚ˆ‚ˆ\ÈÛ\ÜÓ˜[YOHËMMˆÏ‚ˆÜ[¶)v-¶)ö`v*H6)öa6av+v)ö-¶,v*H6a6a6ava¶aö+ÜÜ[‚ˆØ]Û‚ˆÙ]‚ˆÙ›Ü›O‚ˆÙ]‚‚ˆËÊˆ‹ˆšY[È™]šY]È^Y\ˆ
YˆÙ[XİY
H
‹ßBˆÜ™]šY]ÕšY[Õ\›	‰ˆ
ˆ]ˆÛ\ÜÓ˜[YOHœM›İ[™YL™Ë\Û]KNL^]Ú]HÜXÙK^KLÈÚYİË^›Ü™\ˆ›Ü™\‹\Û]KN[š[X]KY˜YKZ[‹]\‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆ\İYKX™]ÙY[ˆ‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆØ\Lˆ^^È›ÛX›XÚÈ^Y[Y\˜[M‚ˆ^PÚ\˜ÛHÛ\ÜÓ˜[YOHËMMˆÏ‚ˆÜ[¶av.v)öb¶a¶*H6av-6.¶a6)öa6`vb¶+öb¶b6)öa6*¶`v)ö.va6bˆ6b6)öa6(¶avaˆ
[›H“Hİ™X[JOÜÜ[‚ˆÙ]‚ˆ]Û‚ˆÛÛXÚÏ^Ê
HOˆÂˆÙ]™]šY]ÕšY[Õ\›
[
NÂˆÙ]™]šY]ÔÚYÛ™YYœ˜[YU\›
[
NÂˆÙ]™]šY]Ñ\œ›ÜŠ[
NÂˆ_BˆÛ\ÜÓ˜[YOH^^È^\Û]KMİ™\^]Ú]HL‹HKLH›İ[™Y[Èİ™\˜™Ë\Û]KN˜[œÚ][Û‹XÛÛÜœÈİ\œÛÜ‹\Ú[\ˆ‚ˆ‚ˆ8§%H6)v.¶a6)ö`ˆ6)öa6av-6.¶aˆØ]Û‚ˆÙ]‚‚ˆ]ˆÛ\ÜÓ˜[YOHœ™[]]™H\ÜXİ]šY[ÈËY[›İ[™Y^İ™\™›İËZY[ˆ™ËX›XÚÈ›^][\ËXÙ[\ˆ\İYKXÙ[\ˆ›Ü™\ˆ›Ü™\‹\Û]KNÚYİËZ[›™\ˆ‚ˆÜ™]šY]ÓØY[™ÈÈ
ˆ]ˆÛ\ÜÓ˜[YOH™›^›^XÛÛ][\ËXÙ[\ˆ\İYKXÙ[\ˆØ\LÈ^\Û]KLÌ^^È›ÛX›ÛN‚ˆØY\ŒˆÛ\ÜÓ˜[YOHËNN[š[X]K\Ü[ˆ^Y[Y\˜[MˆÏ‚ˆÜ[¶+6)ö,vbˆ6)v.v+ö)ö+È6av-6.¶a6)öa6`vb¶+öb¶b6b6*¶b6a6b¶+È6*¶-v,vb¶+H6)öa6av-6)öaö+ö*H6)öa6(¶ava‹‹‹ÜÜ[‚ˆÙ]‚ˆ
Hˆ™]šY]Ñ\œ›ÜˆÈ
ˆ]ˆÛ\ÜÓ˜[YOH™›^›^XÛÛ][\ËXÙ[\ˆ\İYKXÙ[\ˆØ\Lˆ^\›ÜÙKM^^È›ÛX›ÛN^XÙ[\ˆ‚ˆ[\Ú\˜ÛHÛ\ÜÓ˜[YOHËMÈMÈ^\›ÜÙKMLˆÏ‚ˆÜ[Ü™]šY]Ñ\œ›ÜŸOÜÜ[‚ˆ]Û‚ˆÛÛXÚÏ^Ê
HOˆ[™T™]šY]ÕšY[Ê™]šY]ÕšY[Õ\›
_BˆÛ\ÜÓ˜[YOH›]LˆLËHKLKH™Ë\Û]KNİ™\˜™Ë\Û]KMÌ›İ[™Y[È^]Ú]H^^È›ÛX›XÚÈ˜[œÚ][Û‹XÛÛÜœÈİ\œÛÜ‹\Ú[\ˆ‚ˆ‚ˆ6)v.v)ö+ö*H6)öa6av+v)öb6a6*BˆØ]Û‚ˆÙ]‚ˆ
Hˆ™]šY]ÔÚYÛ™YYœ˜[YU\›È
ˆYœ˜[YBˆÜ˜Ï^Ü™]šY]ÔÚYÛ™YYœ˜[YU\›BˆØY[™ÏH›^H‚ˆÛ\ÜÓ˜[YOH˜›Ü™\‹LXœÛÛ]HÜLYLY[ËY[‚ˆ[İÏH˜XØÙ[\›ÛY]\ÙŞ\›ÜØÛÜNØ]]Ü^NÙ[˜Ü\Y[YYXNÜXİ\™KZ[‹\Xİ\™NÈ‚ˆ[İÑ[ØÜ™Y[^İY_BˆÏ‚ˆ
Hˆ
ˆ]ˆÛ\ÜÓ˜[YOH^\Û]KM^^È›ÛX›Û¶a6)È6b¶b6+6+È6,v)ö*6-È6`vb¶+öb¶b6av*¶)ö+H6a6a6av.v)öb¶a¶*OÙ]‚ˆ
_BˆÙ]‚ˆÙ]‚ˆ
_B‚ˆËÊˆËˆ^\İ[™È\ÜÛÛœÈ\İ
‹ßBˆ]ˆÛ\ÜÓ˜[YOHœÜXÙK^KLÈ‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆ\İYKX™]ÙY[ˆ‚ˆÛ\ÜÓ˜[YOH^^È›ÛX›XÚÈ^\Û]KN‚ˆ6`¶)ö)¶av*H6+ö,vb6,È6b6av+v)ö-¶,v)ö*ˆ6)öa6+öb6,v*H
ØÛİ\œÙS\ÜÛÛœË›[™İH6+ö,v,ÊBˆÚ‚ˆÜ[ˆÛ\ÜÓ˜[YOH^VÌL\H^\Û]KML›ÛX›Û‚ˆ6b¶*¶aH6+v`v.6)öa6*¶,v*¶b¶*6b6)öa6av-6)öaö+ö)ö*ˆ6*¶a6`¶)ö)¶b¶)öbÂˆÜÜ[‚ˆÙ]‚‚ˆÛ\ÜÛÛœÓØY[™ÈÈ
ˆ]ˆÛ\ÜÓ˜[YOHœN^XÙ[\ˆ^\Û]KML^^È›ÛX›Û›^][\ËXÙ[\ˆ\İYKXÙ[\ˆØ\Lˆ‚ˆØY\ŒˆÛ\ÜÓ˜[YOHËMHMH[š[X]K\Ü[ˆ^VÈÌMÌĞMĞ×HˆÏ‚ˆÜ[¶+6)ö,vbˆ6*¶+vavb¶a6)öa6+ö,vb6,Ë‹‹ÜÜ[‚ˆÙ]‚ˆ
HˆÛİ\œÙS\ÜÛÛœË›[™İOOHÈ
ˆ]ˆÛ\ÜÓ˜[YOHœN›İ[™YL™Ë\Û]KML›Ü™\ˆ›Ü™\‹\Û]KLŒ^XÙ[\ˆÜXÙK^KLˆ‚ˆšY[ÈÛ\ÜÓ˜[YOHËNN^\Û]KM^X]]ÈˆÏ‚ˆ]ˆÛ\ÜÓ˜[YOH^^È›ÛX›XÚÈ^\Û]KMÌ¶a6aH6b¶*¶aH6)v-¶)ö`v*H6+ö,vb6,È6*6.v+ÏÙ]‚ˆÛ\ÜÓ˜[YOH^VÌL\H^\Û]KM‚ˆ6)ö,ö*¶+¶+öaH6)öa6a¶avb6,6+6(ö.va6)öaÈ6a6,v`v.H6(öb6a6`vb¶+öb¶b6(öb6+ö,v,È6a6aö,6aÈ6)öa6+öb6,v*BˆÜ‚ˆÙ]‚ˆ
Hˆ
ˆ]ˆÛ\ÜÓ˜[YOHœÜXÙK^KL‹H‚ˆØÛİ\œÙS\ÜÛÛœË›X\

\ÜÛÛˆ[KYˆ[X™\ŠHOˆ
ˆ]‚ˆÙ^O^Û\ÜÛÛ‹šYYBˆÛ\ÜÓ˜[YOHœLËH›İ[™YL™Ë]Ú]H›Ü™\ˆ›Ü™\‹\Û]KLŒ›^][\ËXÙ[\ˆ\İYKX™]ÙY[ˆØ\LÈİ™\˜›Ü™\‹\Û]KLÌ˜[œÚ][Û‹X[‚ˆ‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆØ\LÈ‚ˆÜ[ˆÛ\ÜÓ˜[YOHËMÈMÈ›İ[™Y^™Ë\Û]KLL^\Û]KMÌ^^È›ÛX›XÚÈ›^][\ËXÙ[\ˆ\İYKXÙ[\ˆÚš[šËL‚ˆÚY
È_BˆÜÜ[‚ˆ]‚ˆHÛ\ÜÓ˜[YOH^^È›ÛX›XÚÈ^\Û]KNLÛ\ÜÛÛ‹]_OÚO‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆØ\Lˆ^VÌLH^\Û]KML›Û[YY][H]LH‚ˆÜ[ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆØ\LH‚ˆÛØÚÈÛ\ÜÓ˜[YOHËLÈLÈ^\Û]KMˆÏ‚ˆÜ[Û\ÜÛÛ‹™\˜][ÛŸOÜÜ[‚ˆÜÜ[‚ˆÜ[¸ (ÜÜ[‚ˆÜ[ˆÛ\ÜÓ˜[YOH^X›YKMŒ›Û[[Û›È‚ˆÛ\ÜÛÛ‹šY[Õ\›ˆÈ\ÜÛÛ‹šY[Õ\›š[˜ÛY\Ê	ËIÊH	‰ˆ\ÜÛÛ‹šY[Õ\››[™İˆŒˆÈ[›Nˆ	Û\ÜÛÛ‹šY[Õ\›œİXœİš[™ÊL
_K‹‹˜ˆˆ6`vb¶+öb¶bˆ	Û\ÜÛÛ‹šY[Õ\›œİXœİš[™ÊMJ_K‹‹˜ˆˆ	ö*6+öb6aˆ6`vb¶+öb¶b	ßBˆÜÜ[‚ˆÛ\ÜÛÛ‹š][\È	‰ˆ\ÜÛÛ‹š][\Ë›[™İˆ	‰ˆ
ˆ‚ˆÜ[¸ (ÜÜ[‚ˆÜ[ˆÛ\ÜÓ˜[YOH^Y[Y\˜[MÌ›ÛX›Û‚ˆÛ\ÜÛÛ‹š][\Ë›[™İH6av`¶)ö-ö.H6`v,v.vb¶*BˆÜÜ[‚ˆÏ‚ˆ
_BˆÙ]‚ˆÙ]‚ˆÙ]‚‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆØ\Lˆ‚ˆÛ\ÜÛÛ‹šY[Õ\›	‰ˆ
ˆ]Û‚ˆÛÛXÚÏ^Ê
HOˆ[™T™]šY]ÕšY[Ê\ÜÛÛ‹šY[Õ\›
_BˆÛ\ÜÓ˜[YOHœLÈKLKH›İ[™Y^™ËX›YKMLİ™\˜™ËX›YKLL^VÈÌMÌĞMĞ×H^VÌL\H›ÛX›XÚÈ˜[œÚ][Û‹XÛÛÜœÈ›^][\ËXÙ[\ˆØ\LHİ\œÛÜ‹\Ú[\ˆ‚ˆ‚ˆ^PÚ\˜ÛHÛ\ÜÓ˜[YOHËLËHLËH^X›YKMŒˆÏ‚ˆÜ[¶av.v)öb¶a¶*OÜÜ[‚ˆØ]Û‚ˆ
_B‚ˆ]Û‚ˆÛÛXÚÏ^Ê
HOˆ[™Q[]S\ÜÛÛŠ\ÜÛÛ‹šY
_BˆÛ\ÜÓ˜[YOHœLKH›İ[™Y^™Ë\Û]KLLİ™\˜™Ë\›ÜÙKML^\Û]KMİ™\^\›ÜÙKMŒ˜[œÚ][Û‹XÛÛÜœÈİ\œÛÜ‹\Ú[\ˆ‚ˆ]OH¶+v,6`H6)öa6+ö,v,È‚ˆ‚ˆ˜\ÚˆÛ\ÜÓ˜[YOHËMMˆÏ‚ˆØ]Û‚ˆÙ]‚ˆÙ]‚ˆ
J_BˆÙ]‚ˆ
_BˆÙ]‚ˆÙ]‚‚ˆËÊˆ[Ù[›Ûİ\ˆ
‹ßBˆ]ˆÛ\ÜÓ˜[YOHœM™Ë\Û]KML›Ü™\‹]›Ü™\‹\Û]KLL›^][\ËXÙ[\ˆ\İYKX™]ÙY[ˆ^^È^\Û]KML›ÛX›Û‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆØ\Lˆ‚ˆÚY[ÚXÚÈÛ\ÜÓ˜[YOHËMM^Y[Y\˜[MŒˆÏ‚ˆÜ[¶+6avb¶.H6)öa6`vb¶+öb¶b6aö)ö*ˆ6av-6`v,v*H6*¶a6`¶)ö)¶b¶)öbÈ6b6*¶.vava6av.H6*¶`¶a¶b¶*H6)öa6+vav)öb¶*H6avaˆ6)öa6`¶,v-va¶*H6b6*¶b6*öb¶`ˆ6)öa6-ö)öa6*ÜÜ[‚ˆÙ]‚ˆ]Û‚ˆ\OH˜]Ûˆ‚ˆÛÛXÚÏ^Ê
HOˆÂˆÙ]Ù[XİYÛİ\œÙQ›Ü“\ÜÛÛœÊ[
NÂˆÙ]™]šY]ÕšY[Õ\›
[
NÂˆÙ]™]šY]ÔÚYÛ™YYœ˜[YU\›
[
NÂˆÙ]™]šY]Ñ\œ›ÜŠ[
NÂˆ_BˆÛ\ÜÓ˜[YOHœMHKLˆ›İ[™Y^™Ë\Û]KLŒİ™\˜™Ë\Û]KLÌ^\Û]KN›ÛX›XÚÈİ\œÛÜ‹\Ú[\ˆ˜[œÚ][Û‹XÛÛÜœÈ‚ˆ‚ˆ6)v.¶a6)ö`‚ˆØ]Û‚ˆÙ]‚ˆÛ[İ[Û‹™]‚ˆÙ]‚ˆ
_BˆĞ[š[X]T™\Ù[˜ÙO‚ˆÙ]‚ˆ
NÂŸB