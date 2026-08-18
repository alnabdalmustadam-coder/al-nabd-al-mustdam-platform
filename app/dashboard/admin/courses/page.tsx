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
} from 'lucide-react';

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
}

interface LessonItem {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  isLocked?: boolean;
  type?: string;
  subLessons?: string[];
}

interface FormLessonItem {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  type: string;
  isLocked: boolean;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
  const [formLessons, setFormLessons] = useState<FormLessonItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const courseImageInputRef = useRef<HTMLInputElement | null>(null);

  // Lesson Video Uploading State within Course Form
  const [uploadingLessonIndex, setUploadingLessonIndex] = useState<number | null>(null);
  const [lessonUploadProgress, setLessonUploadProgress] = useState<number>(0);
  const [activeUploadLessonIndex, setActiveUploadLessonIndex] = useState<number | null>(null);
  const formLessonVideoInputRef = useRef<HTMLInputElement | null>(null);

  // Lessons Studio Modal State (For standalone studio editing)
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<CourseItem | null>(null);
  const [courseLessons, setCourseLessons] = useState<LessonItem[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  // New Lesson Form for Standalone Studio
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('20 دقيقة');
  const [newLessonUrl, setNewLessonUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Courses from Server with Cache Busting
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

  // Fetch Lessons for Selected Course in Standalone Studio
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
        const formatted = data.curriculum.map((c: any, idx: number) => ({
          id: c.id || `les-${idx + 1}`,
          title: c.title,
          duration: c.duration || '20 دقيقة',
          videoUrl: c.videoUrl || '',
          isLocked: c.isLocked ?? false,
          type: c.type || 'video',
          subLessons: c.lessons || [],
        }));
        setCourseLessons(formatted);
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

  // Open Create Modal with default initial lesson ready
  const openCreateModal = () => {
    setEditingCourse(null);
    setFormTitle('');
    setFormSlug('');
    setFormCategory('tech');
    setFormLevel('all');
    setFormTrainer('د. محمد القحطاني');
    setFormPrice('500');
    setFormHours('30');
    setFormDescription('');
    setFormImage('/logo.webp');
    setFormLessons([
      {
        id: `les-${Date.now()}-1`,
        title: 'الدرس الأول: مقدمة تمهيدية وأهداف البرنامج',
        duration: '20 دقيقة',
        videoUrl: 'MmHWTPJMzbQ',
        type: 'video',
        isLocked: false,
      },
    ]);
    setIsModalOpen(true);
  };

  // Open Edit Modal and load existing curriculum
  const openEditModal = (course: CourseItem) => {
    setEditingCourse(course);
    setFormTitle(course.title);
    setFormSlug(course.slug);
    setFormCategory(course.rawCategory || 'tech');
    setFormTrainer(course.trainer);
    setFormPrice(String(course.rawPrice ?? 500));
    setFormHours(String(course.hours ?? 30));
    setFormDescription(course.description || '');
    setFormImage(course.image || '/logo.webp');

    if (Array.isArray(course.curriculum) && course.curriculum.length > 0) {
      setFormLessons(
        course.curriculum.map((c: any, idx: number) => ({
          id: c.id || `les-${Date.now()}-${idx + 1}`,
          title: c.title || `الدرس ${idx + 1}`,
          duration: c.duration || '20 دقيقة',
          videoUrl: c.videoUrl || '',
          type: c.type || 'video',
          isLocked: c.isLocked ?? false,
        }))
      );
    } else {
      setFormLessons([
        {
          id: `les-${Date.now()}-1`,
          title: 'الدرس الأول: مقدمة تمهيدية وأهداف البرنامج',
          duration: '20 دقيقة',
          videoUrl: 'MmHWTPJMzbQ',
          type: 'video',
          isLocked: false,
        },
      ]);
    }
    setIsModalOpen(true);
  };

  // Methods for In-Modal Lesson Management
  const handleAddLessonToForm = () => {
    const nextNum = formLessons.length + 1;
    setFormLessons((prev) => [
      ...prev,
      {
        id: `les-${Date.now()}-${nextNum}`,
        title: `الدرس ${nextNum}: `,
        duration: '25 دقيقة',
        videoUrl: '',
        type: 'video',
        isLocked: false,
      },
    ]);
  };

  const handleUpdateLessonInForm = (index: number, field: keyof FormLessonItem, value: any) => {
    setFormLessons((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleRemoveLessonFromForm = (index: number) => {
    setFormLessons((prev) => prev.filter((_, i) => i !== index));
  };

  const triggerLessonVideoUpload = (index: number) => {
    setActiveUploadLessonIndex(index);
    formLessonVideoInputRef.current?.click();
  };

  const handleFormLessonVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeUploadLessonIndex === null) return;

    const lessonIdx = activeUploadLessonIndex;
    setUploadingLessonIndex(lessonIdx);
    setLessonUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', formLessons[lessonIdx]?.title || file.name.replace(/\.[^/.]+$/, ''));
      formData.append('courseSlug', formSlug || 'new-course');

      setLessonUploadProgress(50);

      const res = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      setLessonUploadProgress(85);

      const data = await res.json();
      if (res.ok && data.success && data.videoId) {
        setLessonUploadProgress(100);
        handleUpdateLessonInForm(lessonIdx, 'videoUrl', data.videoId);
        showToast(`تم رفع الفيديو إلى Bunny Stream بنجاح! (${data.videoId})`);
      } else {
        throw new Error(data.error || 'فشل رفع الفيديو إلى خادم Bunny.net');
      }
    } catch (err: any) {
      console.error('Lesson video upload error:', err);
      showToast(err.message || 'حدث خطأ أثناء رفع الفيديو', 'error');
    } finally {
      setUploadingLessonIndex(null);
      setLessonUploadProgress(0);
      setActiveUploadLessonIndex(null);
      if (e.target) e.target.value = '';
    }
  };

  // Handle Upload Course Image
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

  // Handle Save Course (Create or Edit with All Lessons Included)
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

      const formattedCurriculum = formLessons
        .filter((l) => l.title.trim().length > 0)
        .map((l, index) => ({
          id: l.id || `les-${Date.now()}-${index + 1}`,
          title: l.title.trim(),
          duration: l.duration.trim() || '20 دقيقة',
          videoUrl: l.videoUrl.trim() || 'MmHWTPJMzbQ',
          type: l.type || 'video',
          isLocked: l.isLocked ?? false,
          lessons: [l.title.trim()],
        }));

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
        lessonsCount: formattedCurriculum.length,
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
        showToast(editingCourse ? 'تم تحديث بيانات وغلاف ودروس الدورة بنجاح' : 'تم إضافة الدورة الجديدة مع دروسها بنجاح');
        setIsModalOpen(false);

        // Reset category filter & search to 'all' so new course is guaranteed immediately visible
        setSelectedCategory('all');
        setSearchQuery('');

        // Optimistic UI state update so it renders in 0ms
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
          lessonsCount: savedC.curriculum ? savedC.curriculum.length : formattedCurriculum.length,
          hours: hoursNum,
          status: 'published',
          description: savedC.description || formDescription,
          curriculum: savedC.curriculum || formattedCurriculum,
          image: savedC.image || formImage,
        };

        setCourses((prev) => {
          const filtered = prev.filter((c) => c.slug !== optimisticItem.slug && c.id !== optimisticItem.id);
          return [optimisticItem, ...filtered];
        });

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('nabd_courses_updated'));
          localStorage.setItem('nabd_courses_timestamp', String(Date.now()));
        }

        await loadCourses();
      } else {
        throw new Error(data.error || 'فشل حفظ الدورة');
      }
    } catch (err: any) {
      console.error('Error saving course:', err);
      showToast(err.message || 'حدث خطأ أثناء حفظ الدورة', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Course
  const handleDeleteCourse = async (course: CourseItem) => {
    const confirmDelete = window.confirm(`هل أنت متأكد من حذف دورة "${course.title}" نهائياً من المنصة؟`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/courses?slug=${encodeURIComponent(course.slug)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`تم حذف دورة "${course.title}" بنجاح`);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('nabd_courses_updated'));
          localStorage.setItem('nabd_courses_timestamp', String(Date.now()));
        }
        await loadCourses();
      } else {
        throw new Error(data.error || 'فشل حذف الدورة');
      }
    } catch (err: any) {
      console.error('Error deleting course:', err);
      showToast(err.message || 'حدث خطأ أثناء حذف الدورة', 'error');
    }
  };

  // Upload Video File to Bunny.net Stream API
  const handleDirectVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedCourseForLessons) {
      showToast('يرجى اختيار الدورة أولاً', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', newLessonTitle.trim() || file.name.replace(/\.[^/.]+$/, ''));
      formData.append('courseSlug', selectedCourseForLessons.slug);

      setUploadProgress(35);

      const res = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(75);

      const data = await res.json();
      if (res.ok && data.success && data.videoId) {
        setUploadProgress(100);
        setNewLessonUrl(data.videoId);
        setUploadSuccess(`تم رفع ومعالجة الفيديو بنجاح على سيرفر Bunny.net! (معرف الفيديو: ${data.videoId})`);
        showToast('تم رفع الفيديو إلى Bunny Stream بنجاح!');
      } else {
        throw new Error(data.error || 'فشل رفع الفيديو إلى خادم Bunny.net');
      }
    } catch (err: any) {
      console.error('Video upload error:', err);
      setUploadError(err.message || 'حدث خطأ أثناء رفع الفيديو');
      showToast('فشل رفع الفيديو', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Save Lesson to Course
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForLessons) return;
    if (!newLessonTitle.trim()) {
      showToast('يرجى إدخال عنوان الدرس', 'error');
      return;
    }
    if (!newLessonUrl.trim()) {
      showToast('يرجى توفير رابط أو معرف الفيديو من Bunny.net', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/admin/courses/${selectedCourseForLessons.slug}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newLessonTitle.trim(),
          duration: newLessonDuration.trim(),
          videoUrl: newLessonUrl.trim(),
          type: 'video',
          isLocked: false,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('تمت إضافة المحاضرة بنجاح إلى المنهج');
        setNewLessonTitle('');
        setNewLessonUrl('');
        setUploadSuccess(null);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('nabd_courses_updated'));
          localStorage.setItem('nabd_courses_timestamp', String(Date.now()));
        }
        await openLessonsManager(selectedCourseForLessons);
        await loadCourses();
      } else {
        throw new Error(data.error || 'فشل حفظ الدرس');
      }
    } catch (err: any) {
      console.error('Error saving lesson:', err);
      showToast(err.message || 'حدث خطأ أثناء حفظ الدرس', 'error');
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (lessonId: string) => {
    if (!selectedCourseForLessons) return;
    const confirmDelete = window.confirm('هل أنت متأكد من حذف هذا الدرس من المنهج؟');
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `/api/admin/courses/${selectedCourseForLessons.slug}/lessons?lessonId=${encodeURIComponent(lessonId)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('تم حذف الدرس بنجاح');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('nabd_courses_updated'));
          localStorage.setItem('nabd_courses_timestamp', String(Date.now()));
        }
        await openLessonsManager(selectedCourseForLessons);
        await loadCourses();
      } else {
        throw new Error(data.error || 'فشل حذف الدرس');
      }
    } catch (err: any) {
      console.error('Error deleting lesson:', err);
      showToast(err.message || 'حدث خطأ أثناء حذف الدرس', 'error');
    }
  };

  // Filter Courses
  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      course.rawCategory === selectedCategory ||
      course.category.includes(selectedCategory);

    const matchesSearch =
      searchQuery.trim() === '' ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.trainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const totalStudents = courses.reduce((acc, c) => acc + (c.students || 0), 0);
  const totalHours = courses.reduce((acc, c) => acc + (c.hours || 0), 0);
  const totalLessons = courses.reduce((acc, c) => acc + (c.lessonsCount || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-7 font-[family-name:var(--font-cairo)]" dir="rtl">
      {/* Toast Alert */}
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

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadCourses}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/90 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200/80 transition-all shadow-xs backdrop-blur-md cursor-pointer active:scale-95"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 text-[#173A7C] ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث البيانات</span>
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#173A7C] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-black text-xs sm:text-sm transition-all shadow-md shadow-[#173A7C]/20 hover:-translate-y-0.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-5 h-5 text-emerald-300" />
              <span>إضافة دورة جديدة</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row - Liquid Glass Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-[0_10px_30px_-10px_rgba(23,58,124,0.06)] hover:shadow-lg transition-all flex items-center gap-4 group">
          <div className="w-13 h-13 rounded-2xl bg-[#173A7C]/10 text-[#173A7C] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">إجمالي الدورات المعتمدة</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{courses.length} دورة</div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-[0_10px_30px_-10px_rgba(23,58,124,0.06)] hover:shadow-lg transition-all flex items-center gap-4 group">
          <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">إجمالي الطلاب المسجلين</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">+{totalStudents.toLocaleString('en-US')} متدرب</div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-[0_10px_30px_-10px_rgba(23,58,124,0.06)] hover:shadow-lg transition-all flex items-center gap-4 group">
          <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">ساعات التدريب المعتمدة</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{totalHours} ساعة</div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-[0_10px_30px_-10px_rgba(23,58,124,0.06)] hover:shadow-lg transition-all flex items-center gap-4 group">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">إجمالي المحاضرات والدروس</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{totalLessons} محاضرة</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xs">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { key: 'all', label: 'كافة التصنيفات' },
            { key: 'admin', label: 'أعمال مكتبية' },
            { key: 'data', label: 'إدخال بيانات' },
            { key: 'languages', label: 'لغات' },
            { key: 'tech', label: 'تقنية' },
            { key: 'corporate', label: 'إدارة وأعمال' },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-[#173A7C] text-white shadow-md'
                  : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم الدورة أو المحاضر..."
            className="w-full py-2.5 pr-9 pl-4 text-xs font-bold text-slate-800 placeholder-slate-400 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Courses List Grid - Fully Unified Visual Identity */}
      {loading ? (
        <div className="p-16 rounded-3xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
          <p className="text-xs font-bold text-slate-500">جاري تحميل وتحديث الدورات المعتمدة...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-800">لا توجد دورات تطابق البحث</h3>
          <p className="text-xs text-slate-500 font-medium">جرب تغيير مصطلح البحث أو التصنيف المحدد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 bg-white/95"
            >
              <div>
                {/* 1. Clean Bright Image Section (Matches Student Pathways Exactly) */}
                <div className="relative h-44 sm:h-48 rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 p-6 flex items-center justify-center overflow-hidden border border-slate-100/90 group-hover:border-blue-100 transition-colors mb-4">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={course.image || '/logo.webp'}
                      alt={course.title}
                      className="max-h-28 sm:max-h-32 w-auto object-contain p-2 opacity-95 group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
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
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#173A7C] transition-colors leading-snug line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                    {course.description}
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
                    <span>{course.lessonsCount} درس تفاعلي</span>
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
                    <span>إدارة الدروس والفيديو ({course.lessonsCount})</span>
                  </button>

                  <button
                    onClick={() => openEditModal(course)}
                    className="p-2.5 rounded-xl bg-white hover:bg-blue-50 text-slate-600 hover:text-[#173A7C] border border-slate-200 hover:border-blue-200 transition-all cursor-pointer shadow-xs"
                    title="تعديل الدورة والغلاف"
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
    {/* 1. CREATE / EDIT COURSE MODAL WITH INLINE LESSONS & BUNNY STREAM BUILDER */}
    {/* ═════════════════════════════════════════════════════════════════════════════ */}
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#0c234b] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15">
                  <BookOpen className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-lg font-black">{editingCourse ? 'تعديل بيانات ومنهج وغلاف الدورة' : 'إضافة دورة تدريبية جديدة مع دروسها'}</h3>
                  <p className="text-xs text-blue-100">تظهر الدورة فوراً في صفحة الدورات الرئيسية ولدى الطلاب مع كافة المحاضرات ⚡</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="p-6 overflow-y-auto space-y-6 flex-1">
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
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="اكتب وصفاً مفصلاً يوضح أهداف البرنامج والمخرجات التعليمية..."
                    className="w-full px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C]"
                  />
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* INLINE LESSONS & CURRICULUM BUILDER */}
              {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 border-2 border-blue-200/70 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#173A7C] text-white flex items-center justify-center shadow-xs">
                        <Video className="w-4 h-4 text-emerald-300" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                          <span>منهج ومحاضرات الدورة التدريبية (الفيديوهات والدروس)</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-[#173A7C] font-black">
                            {formLessons.length} دروس
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          أضف الدروس فوراً وارفع الفيديوهات لخادم Bunny Stream مباشرة مع الدورة 🎬
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddLessonToForm}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0D5C3A] hover:bg-[#117349] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة درس جديد</span>
                    </button>
                  </div>

                  {/* Lessons Rows */}
                  <div className="space-y-3">
                    {formLessons.map((lesson, idx) => (
                      <div
                        key={lesson.id || idx}
                        className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3 transition-all hover:border-blue-300"
                      >
                        {/* Lesson Row Header */}
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#173A7C] font-black text-xs flex items-center justify-center border border-blue-100">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-black text-slate-700">بيانات الدرس والمحاضرة</span>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Free Preview Toggle */}
                            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!lesson.isLocked}
                                onChange={(e) => handleUpdateLessonInForm(idx, 'isLocked', !e.target.checked)}
                                className="w-3.5 h-3.5 text-[#173A7C] rounded focus:ring-0 cursor-pointer"
                              />
                              <span>معاينة مجانية</span>
                            </label>

                            {/* Delete Lesson Button */}
                            {formLessons.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveLessonFromForm(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="حذف هذا الدرس"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Lesson Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-black text-slate-600 mb-1">
                              عنوان الدرس / المحاضرة *
                            </label>
                            <input
                              type="text"
                              required
                              value={lesson.title}
                              onChange={(e) => handleUpdateLessonInForm(idx, 'title', e.target.value)}
                              placeholder="مثال: مدخل إلى أساسيات المسار"
                              className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-[#173A7C] focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-black text-slate-600 mb-1">
                              المدة التقديرية
                            </label>
                            <input
                              type="text"
                              value={lesson.duration}
                              onChange={(e) => handleUpdateLessonInForm(idx, 'duration', e.target.value)}
                              placeholder="مثال: 25 دقيقة"
                              className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-[#173A7C] focus:bg-white"
                            />
                          </div>
                        </div>

                        {/* Video URL or Direct Bunny Upload */}
                        <div>
                          <label className="block text-[11px] font-black text-slate-600 mb-1 flex items-center justify-between">
                            <span>رابط أو معرف الفيديو (Bunny Stream ID أو YouTube)</span>
                            {lesson.videoUrl && (
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>تم ربط الفيديو بنجاح</span>
                              </span>
                            )}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={lesson.videoUrl}
                              onChange={(e) => handleUpdateLessonInForm(idx, 'videoUrl', e.target.value)}
                              placeholder="معرف فيديو Bunny (GUID) أو رابط YouTube أو رابط MP4 مباشر..."
                              className="flex-1 px-3 py-2 text-xs font-mono text-slate-800 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-[#173A7C] focus:bg-white"
                            />

                            <button
                              type="button"
                              onClick={() => triggerLessonVideoUpload(idx)}
                              disabled={uploadingLessonIndex === idx}
                              className="px-3 py-2 rounded-lg bg-[#173A7C] hover:bg-[#1E4D9D] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                            >
                              {uploadingLessonIndex === idx ? (
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

                          {uploadingLessonIndex === idx && (
                            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${lessonUploadProgress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Lesson Button at Bottom */}
                  <button
                    type="button"
                    onClick={handleAddLessonToForm}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-blue-300 hover:border-[#173A7C] bg-white hover:bg-blue-50 text-[#173A7C] font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>➕ إضافة درس أو محاضرة أخرى للمنهج</span>
                  </button>
                </div>

                {/* Hidden Global Input for Form Lesson Video Upload */}
                <input
                  ref={formLessonVideoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFormLessonVideoFile}
                  className="hidden"
                />

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري حفظ ونشر الدورة والدروس...</span>
                      </>
                    ) : (
                      <span>{editingCourse ? 'تحديث الدورة والدروس والصورة' : 'حفظ ونشر الدورة والدروس فوراً ⚡'}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═════════════════════════════════════════════════════════════════════════════ */}
      {/* 2. LESSONS & BUNNY.NET STREAM STUDIO MODAL */}
      {/* ═════════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedCourseForLessons && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#0c234b] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                    <Video className="w-6 h-6 text-emerald-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-black">
                        Bunny Stream DRM
                      </span>
                      <span className="text-xs text-emerald-300 font-bold">مكتبة رقم: #729792</span>
                    </div>
                    <h3 className="text-lg font-black mt-0.5">{selectedCourseForLessons.title}</h3>
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
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            onChange={handleDirectVideoUpload}
                            disabled={isUploading}
                            className="hidden"
                            id="video-upload-input"
                          />
                          <label
                            htmlFor="video-upload-input"
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

                        {/* Progress Bar */}
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
                      {courseLessons.map((lesson, idx) => (
                        <div
                          key={lesson.id}
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
