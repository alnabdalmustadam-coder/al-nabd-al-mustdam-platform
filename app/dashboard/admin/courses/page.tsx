'use client';

import React, { useState } from 'react';
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
  ExternalLink,
} from 'lucide-react';

interface CourseItem {
  id: string;
  title: string;
  category: string;
  type: 'online' | 'in-person' | 'diploma';
  trainer: string;
  price: string;
  students: number;
  lessonsCount: number;
  hours: number;
  status: 'published' | 'draft';
  location?: string;
}

interface LessonItem {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  isEncrypted: boolean;
}

export default function AdminCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'online' | 'in-person' | 'diploma'>('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<CourseItem | null>(null);

  // New Course Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('الاستدامة والحوكمة');
  const [newType, setNewType] = useState<'online' | 'in-person' | 'diploma'>('online');
  const [newTrainer, setNewTrainer] = useState('د. محمد القحطاني');
  const [newPrice, setNewPrice] = useState('1,500 ر.س');
  const [newHours, setNewHours] = useState('30');
  const [newLocation, setNewLocation] = useState('قاعة الفنادق الكبرى - الرياض');

  // Lessons Manager State
  const [courseLessons, setCourseLessons] = useState<LessonItem[]>([
    { id: 'l-1', title: 'الدرس الأول: المفاهيم الأساسية والاستدامة', duration: '20 دقيقة', videoUrl: 'https://www.youtube.com/watch?v=1BEWMhAuBd4', isEncrypted: true },
    { id: 'l-2', title: 'الدرس الثاني: أبعاد الحوكمة المؤسسية والمسؤولية', duration: '25 دقيقة', videoUrl: 'https://www.youtube.com/watch?v=1BEWMhAuBd4', isEncrypted: true },
  ]);

  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('20 دقيقة');
  const [newLessonUrl, setNewLessonUrl] = useState('');

  const [courses, setCourses] = useState<CourseItem[]>([
    {
      id: 'c-1',
      title: 'برنامج القيادة المستدامة والمسؤولية المجتمعية',
      category: 'الاستدامة والحوكمة',
      type: 'online',
      trainer: 'د. محمد القحطاني',
      price: '1,250 ر.س',
      students: 4850,
      lessonsCount: 24,
      hours: 30,
      status: 'published',
    },
    {
      id: 'c-2',
      title: 'دبلوم التسامح والسلام والمواطنة الصالحة الأكاديمي',
      category: 'الدبلومات العليا',
      type: 'diploma',
      trainer: 'د. خالد الدوسري',
      price: '2,500 ر.س',
      students: 3200,
      lessonsCount: 36,
      hours: 60,
      status: 'published',
    },
    {
      id: 'c-3',
      title: 'ورشة عمل التميز المؤسسي والجودة الحوكمية',
      category: 'البيئة والطاقة',
      type: 'in-person',
      trainer: 'أ. د. سارة العتيبي',
      price: '1,800 ر.س',
      students: 1790,
      lessonsCount: 18,
      hours: 25,
      status: 'published',
      location: 'قاعة الأكاديمية - الرياض',
    },
    {
      id: 'c-4',
      title: 'دبلوم الحوكمة المؤسسية والتميز التطبيقي',
      category: 'الحوكمة والإدارة',
      type: 'diploma',
      trainer: 'د. عبدالمحسن الغامدي',
      price: '3,100 ر.س',
      students: 940,
      lessonsCount: 40,
      hours: 75,
      status: 'draft',
    },
  ]);

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newC: CourseItem = {
      id: `c-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      type: newType,
      trainer: newTrainer,
      price: newPrice,
      students: 0,
      lessonsCount: 12,
      hours: parseInt(newHours) || 30,
      status: 'published',
      location: newType === 'in-person' ? newLocation : undefined,
    };

    setCourses([newC, ...courses]);
    setNewTitle('');
    setIsCreateModalOpen(false);
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;

    const newL: LessonItem = {
      id: `l-${Date.now()}`,
      title: newLessonTitle,
      duration: newLessonDuration,
      videoUrl: newLessonUrl || 'https://www.youtube.com/watch?v=1BEWMhAuBd4',
      isEncrypted: true,
    };

    setCourseLessons([...courseLessons, newL]);
    setNewLessonTitle('');
    setNewLessonUrl('');
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.includes(searchQuery) || c.trainer.includes(searchQuery);
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalStudents = courses.reduce((acc, curr) => acc + curr.students, 0);
  const totalHours = courses.reduce((acc, curr) => acc + curr.hours, 0);

  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#173A7C]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-20 left-10 w-[30rem] h-[30rem] bg-[#5CB07C]/8 rounded-full blur-[160px]" />
      </div>

      {/* Header Banner - Liquid Glass Hero */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-7 liquid-glass-hero border border-white/80 student-card-accent"
      >
        <div className="specular-card-reflection" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-3 sm:space-y-3.5">
            <div className="flex flex-col items-start">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#173A7C]/10 text-[#173A7C] text-[10px] sm:text-xs font-black border border-[#173A7C]/15 shrink-0 whitespace-nowrap mb-3 sm:mb-4">
                <BookOpen className="w-3.5 h-3.5 text-[#173A7C] shrink-0" />
                <span>إدارة المساقات والمناهج المعتمدة</span>
              </div>
              <h1 className="text-sm sm:text-2xl lg:text-3xl font-black student-heading-h1 student-name-gradient leading-snug">
                إدارة الدورات والحقائب <span className="inline-block whitespace-nowrap">والدبلومات الأكاديمية 🎓</span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs lg:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
              تحكم متكامل في المساقات المباشرة والحضورية، الدبلومات المعتمدة، وإدارة مقاطع الفيديو والدروس المشفرة وفق معايير المركز الوطني (NELC).
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#173A7C] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#173A7C]/20 cursor-pointer border border-white/25 shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>إضافة مساق أو دبلوم جديد ⚡</span>
          </motion.button>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-[#173A7C]/10">
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70 space-y-0.5">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">إجمالي البرامج</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-[#173A7C]">{courses.length} مساق</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70 space-y-0.5">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">إجمالي المتدربين</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-emerald-700">{totalStudents.toLocaleString()} طالب</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70 space-y-0.5">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">ساعات التدريب</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-[#173A7C]">{totalHours} ساعة معتمدة</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70 space-y-0.5">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">حالة الاعتماد</p>
            <p className="text-xs sm:text-sm lg:text-base font-black text-emerald-700 flex items-center gap-1">
              <span>معتمدة 100%</span>
              <span>🟢</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs & Search Bar */}
      <div className="liquid-glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/60 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* 2x2 Grid on Mobile, Flex on Desktop */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {[
            { id: 'all', label: 'كافة المساقات', icon: BookOpen },
            { id: 'online', label: 'دورات أونلاين', icon: Video },
            { id: 'in-person', label: 'دورات حضورية', icon: MapPin },
            { id: 'diploma', label: 'دبلومات معتمدة', icon: GraduationCap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = typeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id as any)}
                className={`py-2 px-2 sm:px-4 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 w-full sm:w-auto shrink-0 whitespace-nowrap ${isActive
                    ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-sm shadow-[#173A7C]/20 border border-[#173A7C]'
                    : 'bg-white/80 text-slate-700 hover:bg-white hover:text-[#173A7C] border border-slate-200/80'
                  }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="shrink-0 whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute top-3 right-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم المساق أو المحاضر..."
            className="w-full py-2 pr-9 pl-3.5 text-xs font-bold text-slate-800 bg-white/90 rounded-lg sm:rounded-xl border border-slate-200/80 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6">
        {filteredCourses.map((course) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="liquid-glass-card liquid-glass-hover rounded-lg sm:rounded-xl p-4 sm:p-5.5 border border-white/70 space-y-3.5 sm:space-y-4 relative group overflow-hidden student-card-accent"
          >
            <div className="specular-card-reflection" />

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 sm:space-y-2.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9.5px] sm:text-[10.5px] font-black bg-[#173A7C]/10 text-[#173A7C] border border-[#173A7C]/20 shrink-0 whitespace-nowrap">
                    {course.category}
                  </span>
                  {course.type === 'in-person' && (
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9.5px] sm:text-[10.5px] font-black bg-amber-500/10 text-amber-900 border border-amber-500/20 flex items-center gap-1 shrink-0 whitespace-nowrap">
                      <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                      <span>حضوري</span>
                    </span>
                  )}
                  {course.type === 'diploma' && (
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9.5px] sm:text-[10.5px] font-black bg-emerald-500/10 text-emerald-900 border border-emerald-500/20 flex items-center gap-1 shrink-0 whitespace-nowrap">
                      <GraduationCap className="w-3 h-3 text-emerald-700 shrink-0" />
                      <span>دبلوم معتمد</span>
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-black text-xs sm:text-sm text-[#152C5B] student-heading-h3 leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-[10.5px] sm:text-xs text-slate-500 font-bold">المحاضر: {course.trainer}</p>
                  {course.location && (
                    <p className="text-[10px] sm:text-[11px] text-amber-800 font-bold flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>المقر: {course.location}</span>
                    </p>
                  )}
                </div>
              </div>

              <span className="font-mono font-black text-emerald-700 text-xs sm:text-sm shrink-0 bg-emerald-500/10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-emerald-500/20 shadow-2xs whitespace-nowrap">
                {course.price}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs font-bold pt-1">
              <div className="liquid-glass-inset p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-white/70 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#173A7C]/10 text-[#173A7C] flex items-center justify-center shrink-0">
                  <Users className="w-3 h-3" />
                </div>
                <span className="text-slate-700 text-[11px] sm:text-xs">{course.students.toLocaleString()} متدرب</span>
              </div>

              <div className="liquid-glass-inset p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-white/70 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-3 h-3" />
                </div>
                <span className="text-slate-700 text-[11px] sm:text-xs">{course.lessonsCount} درساً ({course.hours}س)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 gap-2">
              <span
                className={`px-2.5 py-0.5 sm:py-1 rounded-full text-[9.5px] sm:text-[10.5px] font-black border shrink-0 whitespace-nowrap ${course.status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25'
                    : 'bg-amber-500/10 text-amber-800 border-amber-500/25'
                  }`}
              >
                {course.status === 'published' ? 'نشط ومعتمد 🟢' : 'مسودة 🟡'}
              </span>

              <button
                onClick={() => setSelectedCourseForLessons(course)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-bold text-[10.5px] sm:text-xs shadow-sm shadow-[#173A7C]/15 transition-all cursor-pointer flex items-center gap-1.5 border border-white/20 shrink-0 whitespace-nowrap"
              >
                <Video className="w-3 h-3 shrink-0" />
                <span>إدارة الدروس والمحتوى</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CREATE NEW COURSE MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl bg-white/95 backdrop-blur-xl text-slate-900 rounded-xl sm:rounded-2xl border border-white/80 p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-2xl overflow-hidden relative my-4 sm:my-8"
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#5CB07C] via-[#173A7C] to-emerald-400" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[#152C5B] student-heading-h3">إضافة مساق / دبلوم جديد</h3>
                    <p className="text-xs text-slate-500 font-bold">تعبئة البيانات الأساسية للمنهج الأكاديمي</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-4 text-xs font-bold">
                <div className="space-y-1.5">
                  <label className="text-slate-700 block">عنوان المساق الأكاديمي</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: دبلوم الابتكار والاستدامة المؤسسية"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">نوع المساق</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                    >
                      <option value="online">دورة أونلاين 💻</option>
                      <option value="in-person">دورة حضورية بقاعات 🏫</option>
                      <option value="diploma">دبلوم أكاديمي معتمد 📜</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">التصنيف الرئيسي</label>
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">المحاضر المعتمد</label>
                    <input
                      type="text"
                      value={newTrainer}
                      onChange={(e) => setNewTrainer(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">سعر الدورة</label>
                    <input
                      type="text"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">عدد الساعات</label>
                    <input
                      type="number"
                      value={newHours}
                      onChange={(e) => setNewHours(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                    />
                  </div>
                </div>

                {newType === 'in-person' && (
                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">مقر القاعة التدريبية الحضورية</label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="مثال: قاعة الفنادق الكبرى - الرياض"
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                    />
                  </div>
                )}

                <div className="pt-4 flex items-center gap-3 border-t border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-bold shadow-lg shadow-[#173A7C]/25 cursor-pointer transition-all border border-white/20"
                  >
                    تأكيد وإضافة المساق ⚡
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LESSONS MANAGER MODAL */}
      <AnimatePresence>
        {selectedCourseForLessons && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white/95 backdrop-blur-xl text-slate-900 rounded-xl sm:rounded-2xl border border-white/80 p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-2xl overflow-hidden relative my-4 sm:my-8"
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#5CB07C] via-[#173A7C] to-emerald-400" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[#152C5B] student-heading-h3">
                      إدارة دروس: {selectedCourseForLessons.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold">إضافة وتشفير مقاطع الفيديو والمصادر</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCourseForLessons(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Add New Lesson Form */}
              <form onSubmit={handleAddLesson} className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
                <h4 className="text-xs font-black text-[#173A7C] flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>إضافة درس فيديو جديد</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="عنوان الدرس..."
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                  />
                  <input
                    type="text"
                    placeholder="مدة الدرس (مثال: 25 دقيقة)..."
                    value={newLessonDuration}
                    onChange={(e) => setNewLessonDuration(e.target.value)}
                    className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2.5">
                  <input
                    type="text"
                    placeholder="رابط الفيديو (YouTube / Vimeo / HLS .m3u8)..."
                    value={newLessonUrl}
                    onChange={(e) => setNewLessonUrl(e.target.value)}
                    className="flex-1 p-3 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-[#173A7C] hover:bg-[#1E4D9D] text-white text-xs font-bold cursor-pointer shrink-0 transition-colors shadow-md shadow-[#173A7C]/20"
                  >
                    إضافة الدرس
                  </button>
                </div>
              </form>

              {/* Lessons List */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                <h4 className="text-xs font-black text-slate-700">قائمة الدروس الحالية ({courseLessons.length}):</h4>
                {courseLessons.map((les, idx) => (
                  <div
                    key={les.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between text-xs font-bold shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-[#173A7C]/10 text-[#173A7C] text-[11px] font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate text-slate-800">{les.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-slate-400 font-medium">{les.duration}</span>
                      <span className="text-[10px] text-emerald-800 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        مشفر
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200/70 flex justify-end">
                <button
                  onClick={() => setSelectedCourseForLessons(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
