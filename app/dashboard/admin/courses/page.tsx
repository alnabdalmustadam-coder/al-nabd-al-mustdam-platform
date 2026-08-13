'use client';

import React, { useState } from 'react';
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

  const glassNeumorphicCard = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(241,245,249,0.90) 100%)',
    backdropFilter: 'blur(16px) saturate(1.4)',
    WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08), 0 10px 28px rgba(15, 23, 42, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.6)',
  };

  const glassNeumorphicInset = {
    background: 'rgba(241, 245, 249, 0.7)',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
  };

  return (
    <div className="space-y-6" dir="rtl">

      {/* Header Banner - Ultra Premium Glass style matching Main Dashboard */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 animate-fade-in-up ultra-card-hover" style={glassNeumorphicCard}>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 pr-2 border-r-4 border-[#173A7C]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#173A7C] text-xs font-semibold border border-blue-200/80">
              <BookOpen className="w-4 h-4 text-[#173A7C]" />
              <span>إدارة المساقات والمناهج المعتمدة</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              إدارة الدورات المباشرة والحضورية والدبلومات 🎓
            </h1>
            <p className="text-xs text-slate-500 font-normal max-w-2xl leading-relaxed">
              تحكم كامل في الدورات أونلاين، القاعات الحضورية، الدبلومات الأكاديمية، وإضافة دروس الفيديو المشفرة.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#173A7C] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer border border-white/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مساق أو دبلوم جديد ⚡</span>
          </button>
        </div>
      </div>

      {/* Category & Course Type Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl" style={glassNeumorphicInset}>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'كافة المساقات' },
            { id: 'online', label: 'دورات أونلاين 💻' },
            { id: 'in-person', label: 'دورات حضورية 🏫' },
            { id: 'diploma', label: 'الدبلومات المعتمدة 📜' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${typeFilter === tab.id
                  ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md'
                  : 'bg-white/80 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم المساق أو المحاضر..."
            className="w-full py-2 pr-9 pl-4 text-xs font-medium text-slate-800 bg-white/80 rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C]"
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="rounded-2xl p-6 border space-y-5 transition-all ultra-card-hover relative group overflow-hidden"
            style={glassNeumorphicCard}
          >
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#5CB07C] opacity-80 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 pr-2 border-r-3 border-[#173A7C]">
                <div className="flex items-center gap-2 pr-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-[#173A7C] border border-blue-200">
                    {course.category}
                  </span>
                  {course.type === 'in-person' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      حضوري
                    </span>
                  )}
                  {course.type === 'diploma' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                      دبلوم معتمد
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-base text-slate-900 leading-snug pr-1">{course.title}</h3>
                <p className="text-xs text-slate-500 font-normal pr-1">المحاضر: {course.trainer}</p>
                {course.location && (
                  <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1 mt-1 pr-1">
                    <MapPin className="w-3.5 h-3.5" />
                    المقر: {course.location}
                  </p>
                )}
              </div>

              <span className="font-mono font-bold text-emerald-600 text-sm shrink-0 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                {course.price}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-semibold pt-2 border-t border-slate-200/50">
              <div className="p-3 rounded-xl flex items-center gap-2" style={glassNeumorphicInset}>
                <Users className="w-4 h-4 text-blue-600" />
                <span>{course.students.toLocaleString()} متدرب</span>
              </div>

              <div className="p-3 rounded-xl flex items-center gap-2" style={glassNeumorphicInset}>
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>{course.lessonsCount} درساً ({course.hours} ساعة)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-medium border ${course.status === 'published'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
              >
                {course.status === 'published' ? 'نشط ومعتمد 🟢' : 'مسودة 🟡'}
              </span>

              <button
                onClick={() => setSelectedCourseForLessons(course)}
                className="px-4 py-2 rounded-xl bg-[#173A7C] hover:bg-[#1E4D9D] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5" />
                <span>إدارة الدروس والمحتوى</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE NEW COURSE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white text-slate-900 rounded-[32px] border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#5CB07C] via-[#173A7C] to-emerald-400" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#173A7C] text-white font-black">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">إضافة مساق / دبلوم جديد</h3>
                  <p className="text-xs text-slate-500 font-bold">تعبئة البيانات الأساسية للمنهج الأكاديمي</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
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
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#173A7C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 block">نوع المساق</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#173A7C]"
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
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#173A7C]"
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
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 block">سعر الدورة</label>
                  <input
                    type="text"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 block">عدد الساعات</label>
                  <input
                    type="number"
                    value={newHours}
                    onChange={(e) => setNewHours(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#173A7C]"
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
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#173A7C]"
                  />
                </div>
              )}

              <div className="pt-4 flex items-center gap-3 border-t">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-black cursor-pointer">
                  إلغاء
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white font-black shadow-lg cursor-pointer">
                  تأكيد وإضافة المساق ⚡
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LESSONS MANAGER MODAL */}
      {selectedCourseForLessons && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white text-slate-900 rounded-[32px] border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#5CB07C] via-[#173A7C] to-emerald-400" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">إدارة دروس: {selectedCourseForLessons.title}</h3>
                  <p className="text-xs text-slate-500 font-bold">إضافة روابط الفيديو والدروس المشفرة</p>
                </div>
              </div>
              <button onClick={() => setSelectedCourseForLessons(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Lesson Form */}
            <form onSubmit={handleAddLesson} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-black text-[#173A7C] flex items-center gap-1.5">
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
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                />
                <input
                  type="text"
                  placeholder="مدة الدرس (مثال: 25 دقيقة)..."
                  value={newLessonDuration}
                  onChange={(e) => setNewLessonDuration(e.target.value)}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="رابط الفيديو (YouTube / Vimeo / HLS .m3u8)..."
                  value={newLessonUrl}
                  onChange={(e) => setNewLessonUrl(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                />
                <button type="submit" className="px-4 py-2.5 rounded-xl bg-[#173A7C] text-white text-xs font-black cursor-pointer shrink-0">
                  إضافة الدرس
                </button>
              </div>
            </form>

            {/* Lessons List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <h4 className="text-xs font-black text-slate-700">قائمة الدروس الحالية ({courseLessons.length}):</h4>
              {courseLessons.map((les, idx) => (
                <div key={les.id} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#173A7C] text-[10px] font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="truncate">{les.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400">{les.duration}</span>
                    <span className="text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-black border border-emerald-200">
                      مشفر 🔒
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setSelectedCourseForLessons(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-black text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
