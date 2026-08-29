'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Users,
  Award,
  Search,
  ExternalLink,
  PlayCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  Layers,
  Video,
  FileText,
  DollarSign,
  Star,
  Check,
  X,
  Loader2,
  Upload,
  BarChart3,
  Sliders,
} from 'lucide-react';
import { Course, CurriculumSection, SubLessonItem } from '@/types';

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Course Modal State (Create / Edit)
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [isSavingCourse, setIsSavingCourse] = useState(false);

  // Lessons Curriculum Modal State
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [curriculumCourse, setCurriculumCourse] = useState<Course | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('20 دقيقة');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');
  const [newLessonDescription, setNewLessonDescription] = useState('');
  const [isSavingCurriculum, setIsSavingCurriculum] = useState(false);

  // Load Courses from API
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success && Array.isArray(data.courses)) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error('Error fetching instructor courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Open Create Course Modal
  const handleOpenCreateModal = () => {
    setEditingCourse({
      title: '',
      slug: '',
      category: 'tech',
      level: 'all',
      price: 199,
      duration: '30 ساعة تدريبية',
      lessonsCount: 10,
      description: '',
      image: '/1.png',
      featured: false,
      outcomes: ['إتقان المهارات العملية والتطبيقية', 'الحصول على شهادة مهنية معتمدة'],
      curriculum: [
        {
          title: 'الوحدة الأولى: المفاهيم والأسس العامة',
          duration: '4 ساعات',
          lessons: ['مقدمة تمهيدية وأهداف البرنامج', 'المحاور الأساسية للتطبيق'],
        },
      ],
    });
    setIsCourseModalOpen(true);
  };

  // Open Edit Course Modal
  const handleOpenEditModal = (course: Course) => {
    setEditingCourse({ ...course });
    setIsCourseModalOpen(true);
  };

  // Save Course (Create or Update)
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editingCourse.title?.trim()) {
      alert('يرجى كتابة عنوان الدورة التدريبية');
      return;
    }

    try {
      setIsSavingCourse(true);
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCourse),
      });
      const data = await res.json();

      if (data.success) {
        setIsCourseModalOpen(false);
        setEditingCourse(null);
        await fetchCourses();
      } else {
        alert(data.error || 'تعذر حفظ الدورة التدريبية');
      }
    } catch (err) {
      console.error('Error saving course:', err);
      alert('حدث خطأ أثناء حفظ الدورة');
    } finally {
      setIsSavingCourse(false);
    }
  };

  // Delete Course
  const handleDeleteCourse = async (courseId: number | string, courseTitle: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الدورة التدريبية "${courseTitle}" نهائياً؟`)) {
      return;
    }

    try {
      const res = await fetch(`/api/courses?id=${courseId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await fetchCourses();
      } else {
        alert(data.error || 'تعذر حذف الدورة');
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      alert('حدث خطأ أثناء حذف الدورة');
    }
  };

  // Open Lessons Manager
  const handleOpenCurriculumModal = (course: Course) => {
    setCurriculumCourse(course);
    setNewLessonTitle('');
    setNewLessonVideoUrl('');
    setIsCurriculumModalOpen(true);
  };

  // Add Lesson to Curriculum
  const handleAddLesson = async () => {
    if (!curriculumCourse || !newLessonTitle.trim()) return;

    const updatedCurriculum = [...(curriculumCourse.curriculum || [])];
    if (updatedCurriculum.length === 0) {
      updatedCurriculum.push({
        title: 'الوحدة التدريبية الأولى',
        duration: newLessonDuration || '20 دقيقة',
        lessons: [],
      });
    }

    const firstSection = updatedCurriculum[0];
    const newLessonObj: SubLessonItem = {
      id: `lesson-${Date.now()}`,
      title: newLessonTitle.trim(),
      duration: newLessonDuration || '20 دقيقة',
      type: 'video',
      videoUrl: newLessonVideoUrl.trim() || undefined,
    };

    if (!firstSection.lessons) {
      firstSection.lessons = [];
    }
    firstSection.lessons.push(newLessonObj as any);

    const updatedCourse: Course = {
      ...curriculumCourse,
      curriculum: updatedCurriculum,
      lessonsCount: (curriculumCourse.lessonsCount || 0) + 1,
    };

    try {
      setIsSavingCurriculum(true);
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCourse),
      });
      const data = await res.json();
      if (data.success) {
        setCurriculumCourse(updatedCourse);
        setNewLessonTitle('');
        setNewLessonVideoUrl('');
        await fetchCourses();
      }
    } catch (err) {
      console.error('Error adding lesson:', err);
    } finally {
      setIsSavingCurriculum(false);
    }
  };

  // Delete Lesson from Curriculum
  const handleDeleteLesson = async (sectionIdx: number, lessonIdx: number) => {
    if (!curriculumCourse) return;
    const updatedCurriculum = JSON.parse(JSON.stringify(curriculumCourse.curriculum || []));
    if (updatedCurriculum[sectionIdx]?.lessons) {
      updatedCurriculum[sectionIdx].lessons.splice(lessonIdx, 1);
    }

    const updatedCourse: Course = {
      ...curriculumCourse,
      curriculum: updatedCurriculum,
      lessonsCount: Math.max(0, (curriculumCourse.lessonsCount || 1) - 1),
    };

    try {
      setIsSavingCurriculum(true);
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCourse),
      });
      const data = await res.json();
      if (data.success) {
        setCurriculumCourse(updatedCourse);
        await fetchCourses();
      }
    } catch (err) {
      console.error('Error deleting lesson:', err);
    } finally {
      setIsSavingCurriculum(false);
    }
  };

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categoriesList = [
    { id: 'all', label: 'كافة الدورات والمقررات' },
    { id: 'tech', label: 'التقنية والبرمجة' },
    { id: 'corporate', label: 'الدبلومات المهنية' },
    { id: 'management', label: 'التطوير الإداري' },
    { id: 'languages', label: 'اللغات والترجمة' },
    { id: 'security', label: 'الأمن السيبراني' },
    { id: 'design', label: 'التصميم والوسائط' },
  ];

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
      {/* ── 1. HERO HEADER WITH QUICK ACTION ── */}
      <div className="relative z-20 liquid-glass-hero p-6 sm:p-8 rounded-2xl sm:rounded-3xl liquid-glass-hover overflow-hidden student-card-accent">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#173A7C] text-xs font-black border border-blue-200">
              <BookOpen className="w-3.5 h-3.5" />
              <span>إدارة البرامج والمقررات والمناهج الدراسية</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black student-heading-h1">
              دوراتي ومقرراتي <span className="student-name-gradient">التدريبية</span> 📚
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-2xl">
              يمكنك إضافة دورات وبرامج تدريبية جديدة، تعديل المحتوى والمناهج، وإدارة الدروس والوسائط التفاعلية ومتابعة أداء الطلاب.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#5CB07C] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-[#173A7C]/20 hover:opacity-95 transition-all cursor-pointer border border-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة دورة تدريبية جديدة</span>
          </button>
        </div>
      </div>

      {/* ── 2. METRICS & COUNTERS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 backdrop-blur-md space-y-1 shadow-xs">
          <span className="text-[11px] text-slate-500 font-bold block">إجمالي الدورات</span>
          <div className="text-xl font-black text-[#173A7C] font-mono">{courses.length} مقرر</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 backdrop-blur-md space-y-1 shadow-xs">
          <span className="text-[11px] text-slate-500 font-bold block">إجمالي المتدربين</span>
          <div className="text-xl font-black text-emerald-700 font-mono">
            {courses.reduce((acc, c) => acc + (c.studentsCount || c.enrollees || 0), 0) || 330} طالب
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 backdrop-blur-md space-y-1 shadow-xs">
          <span className="text-[11px] text-slate-500 font-bold block">إجمالي الدروس المعتمدة</span>
          <div className="text-xl font-black text-amber-700 font-mono">
            {courses.reduce((acc, c) => acc + (c.lessonsCount || 0), 0)} درس
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 backdrop-blur-md space-y-1 shadow-xs">
          <span className="text-[11px] text-slate-500 font-bold block">متوسط تقييم المحاضر</span>
          <div className="text-xl font-black text-indigo-700 font-mono">4.92 / 5.0 ⭐</div>
        </div>
      </div>

      {/* ── 3. SEARCH & CATEGORY FILTER BAR ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في المقررات والدورات التدريبية..."
            className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-slate-50/80"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
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

      {/* ── 4. COURSES GRID ── */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#173A7C]" />
          <p className="text-xs font-bold">جاري تحميل المقررات والدورات التدريبية...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-12 text-center bg-white/70 rounded-3xl border border-slate-200 space-y-4">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300" />
          <div className="space-y-1">
            <h3 className="font-black text-slate-700">لا توجد مقررات تدريبية مطابقة</h3>
            <p className="text-xs text-slate-500 font-bold">يمكنك إنشاء دورة جديدة بضغطة زر وتعيين محتواها الآن.</p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-[#173A7C] text-white text-xs font-black hover:bg-[#1E4D9D] transition-colors cursor-pointer"
          >
            + إضافة أول دورة تدريبية
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((c) => (
            <div
              key={c.id || c.slug}
              className="p-5 sm:p-6 rounded-3xl liquid-glass-card liquid-glass-hover flex flex-col justify-between space-y-4 student-card-accent group relative overflow-hidden"
            >
              {/* Header Badges */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-[#173A7C] border border-blue-200 truncate">
                    {c.category === 'tech'
                      ? 'التقنية والبرمجة'
                      : c.category === 'languages'
                      ? 'اللغات والترجمة'
                      : c.category === 'security'
                      ? 'الأمن السيبراني'
                      : c.category === 'management'
                      ? 'التطوير الإداري'
                      : 'الدبلومات المهنية'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300">
                      معتمد ومفعل
                    </span>
                    <span className="font-mono font-black text-xs text-[#173A7C] bg-slate-100 px-2 py-0.5 rounded-lg">
                      {c.price ? `${c.price} ر.س` : 'مجانية'}
                    </span>
                  </div>
                </div>

                <h3 className="student-heading-h3 !text-sm leading-snug line-clamp-2 min-h-[40px]">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {c.description || 'برنامج تدريبي متكامل يؤهل المتدرب للحصول على شهادة معتمدة وإتقان المهارات العملية.'}
                </p>
              </div>

              {/* Course Meta Info */}
              <div className="grid grid-cols-3 p-3 rounded-2xl bg-slate-50/90 border border-slate-200 text-center text-xs font-black">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">الطلاب</span>
                  <span className="text-slate-800">{c.studentsCount || c.enrollees || 85}</span>
                </div>
                <div className="border-r border-l border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">الدروس</span>
                  <span className="text-slate-800">{c.lessonsCount || (c.curriculum?.[0]?.lessons?.length || 8)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">المدة</span>
                  <span className="text-emerald-700">{c.duration || '20 ساعة'}</span>
                </div>
              </div>

              {/* Action Buttons Hub */}
              <div className="space-y-2 pt-2 border-t border-slate-200/80">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenCurriculumModal(c)}
                    className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-[#173A7C] text-[#173A7C] hover:text-white text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-blue-200"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>إدارة الدروس ({c.lessonsCount || 8})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(c)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل الدورة</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <Link
                    href={`/courses/${c.slug}`}
                    target="_blank"
                    className="text-slate-500 hover:text-[#173A7C] font-bold flex items-center gap-1 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>معاينة في الموقع</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDeleteCourse(c.id || c.slug, c.title)}
                    className="text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 5. CREATE & EDIT COURSE MODAL ── */}
      <AnimatePresence>
        {isCourseModalOpen && editingCourse && (
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
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-white/80 overflow-hidden my-auto"
            >
              <form onSubmit={handleSaveCourse} className="flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-5 bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-black text-sm sm:text-base">
                      {editingCourse.id ? 'تعديل بيانات الدورة التدريبية' : 'إضافة وإنشاء دورة تدريبية جديدة'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCourseModalOpen(false)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body Form */}
                <div className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs font-bold">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">عنوان الدورة التدريبية *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: دبلوم الذكاء الاصطناعي وهندسة الأوامر المتقدمة"
                      value={editingCourse.title || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-slate-700 block">التصنيف والمسار</label>
                      <select
                        value={editingCourse.category || 'tech'}
                        onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value as any })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none"
                      >
                        <option value="tech">التقنية والبرمجة (tech)</option>
                        <option value="corporate">الدبلومات المهنية (corporate)</option>
                        <option value="management">التطوير الإداري (management)</option>
                        <option value="languages">اللغات والترجمة (languages)</option>
                        <option value="security">الأمن السيبراني (security)</option>
                        <option value="design">التصميم والوسائط (design)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-700 block">المستوى التدريبي</label>
                      <select
                        value={editingCourse.level || 'all'}
                        onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value as any })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none"
                      >
                        <option value="all">كافة المستويات (شامل)</option>
                        <option value="beginner">مبتدئ</option>
                        <option value="intermediate">متوسط</option>
                        <option value="advanced">متقدم</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-slate-700 block">السعر (ر.س)</label>
                      <input
                        type="number"
                        value={editingCourse.price ?? 199}
                        onChange={(e) => setEditingCourse({ ...editingCourse, price: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-700 block">المدة التدريبية</label>
                      <input
                        type="text"
                        placeholder="مثال: 30 ساعة"
                        value={editingCourse.duration || ''}
                        onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-700 block">عدد الدروس</label>
                      <input
                        type="number"
                        value={editingCourse.lessonsCount ?? 10}
                        onChange={(e) => setEditingCourse({ ...editingCourse, lessonsCount: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">وصف ونبذة موجزة عن البرنامج</label>
                    <textarea
                      rows={3}
                      placeholder="اكتب نبذة تشرح أهداف ومخرجات الدورة..."
                      value={editingCourse.description || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">رابط صورة الغلاف أو الإطار</label>
                    <input
                      type="text"
                      placeholder="/1.png أو رابط صورة خارجية"
                      value={editingCourse.image || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, image: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none"
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCourseModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingCourse}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-[#173A7C] text-white font-black text-xs shadow-md hover:opacity-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingCourse ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>حفظ الدورة التدريبية</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 6. CURRICULUM & LESSONS MANAGER MODAL ── */}
      <AnimatePresence>
        {isCurriculumModalOpen && curriculumCourse && (
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
              className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-white/80 overflow-hidden my-auto"
            >
              <div className="flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="p-5 bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-5 h-5 text-amber-300" />
                    <div>
                      <h3 className="font-black text-sm sm:text-base">إدارة دروس ومحتوى المقرر</h3>
                      <p className="text-xs text-blue-100 font-bold truncate max-w-md">{curriculumCourse.title}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCurriculumModalOpen(false)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-5 sm:p-6 space-y-5 overflow-y-auto text-xs font-bold">
                  {/* Add New Lesson Box */}
                  <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-3">
                    <h4 className="font-black text-[#173A7C] flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      <span>إضافة درس تعليمي جديد للمقرر</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-6">
                        <input
                          type="text"
                          placeholder="عنوان الدرس الجديد..."
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          className="w-full p-2 rounded-xl bg-white border border-slate-300 focus:border-[#173A7C] outline-none text-xs"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          placeholder="المدة (مثال: 25 دقيقة)"
                          value={newLessonDuration}
                          onChange={(e) => setNewLessonDuration(e.target.value)}
                          className="w-full p-2 rounded-xl bg-white border border-slate-300 focus:border-[#173A7C] outline-none text-xs"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <button
                          type="button"
                          disabled={isSavingCurriculum || !newLessonTitle.trim()}
                          onClick={handleAddLesson}
                          className="w-full h-full py-2 rounded-xl bg-[#173A7C] hover:bg-[#1E4D9D] text-white font-black flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          {isSavingCurriculum ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          <span>إضافة الدرس</span>
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="رابط الفيديو (YouTube / Vimeo / MP4 - اختياري)..."
                      value={newLessonVideoUrl}
                      onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-slate-300 focus:border-[#173A7C] outline-none text-xs"
                    />
                  </div>

                  {/* Lessons Roster */}
                  <div className="space-y-3">
                    <h4 className="text-slate-700 font-black">قائمة الدروس الحالية في المقرر:</h4>
                    {curriculumCourse.curriculum && curriculumCourse.curriculum.length > 0 ? (
                      curriculumCourse.curriculum.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
                          <div className="font-black text-slate-800 text-xs flex items-center justify-between">
                            <span>{section.title}</span>
                            <span className="text-slate-400 font-mono text-[11px]">{section.duration}</span>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            {section.lessons && section.lessons.length > 0 ? (
                              section.lessons.map((les, lIdx) => {
                                const titleStr = typeof les === 'string' ? les : les.title;
                                const durStr = typeof les === 'string' ? '15 دقيقة' : les.duration || '15 دقيقة';

                                return (
                                  <div
                                    key={lIdx}
                                    className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs"
                                  >
                                    <div className="flex items-center gap-2">
                                      <PlayCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                      <span className="font-bold text-slate-800">{titleStr}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                                        {durStr}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteLesson(sIdx, lIdx)}
                                        className="p-1 rounded text-rose-500 hover:bg-rose-50 cursor-pointer"
                                        title="حذف الدرس"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-[11px] text-slate-400 p-2 text-center">لا توجد دروس بعد في هذه الوحدة.</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-slate-400 p-4">لا توجد وحدات أو دروس مضافة بعد.</p>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCurriculumModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-[#173A7C] text-white font-bold text-xs cursor-pointer hover:bg-[#1E4D9D]"
                  >
                    تم وإغلاق
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
