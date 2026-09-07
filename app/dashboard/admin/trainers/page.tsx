'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  Search,
  Plus,
  Mail,
  Phone,
  Star,
  BookOpen,
  Award,
  MoreVertical,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Download,
  Users,
  Sparkles,
  X,
  GraduationCap,
  Loader2,
  Lock,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Pencil,
  UploadCloud,
  Camera,
  Layers,
} from 'lucide-react';

interface Trainer {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  avatarUrl?: string | null;
  coursesCount: number;
  studentsCount: number;
  rating: number;
  status: 'active' | 'on_leave';
  avatarInitials: string;
  assignedCourseSlugs?: string[];
  assignedCourseTitles?: string[];
  createdAt?: string;
}

interface CourseOption {
  id: number | string;
  slug: string;
  title: string;
}

export default function AdminTrainersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'on_leave'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState<Trainer | null>(null);

  // Edit Trainer State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [editName, setEditName] = useState('');
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<'active' | 'on_leave'>('active');
  const [editAssignedCourses, setEditAssignedCourses] = useState<string[]>([]);
  const [isUploadingEditAvatar, setIsUploadingEditAvatar] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  // New Trainer Form State
  const [newTrainerName, setNewTrainerName] = useState('');
  const [newTrainerSpecialty, setNewTrainerSpecialty] = useState('');
  const [newTrainerEmail, setNewTrainerEmail] = useState('');
  const [newTrainerPassword, setNewTrainerPassword] = useState(() => generatePassword());
  const [newTrainerPhone, setNewTrainerPhone] = useState('');
  const [newTrainerAvatarUrl, setNewTrainerAvatarUrl] = useState<string | null>(null);
  const [newTrainerCourses, setNewTrainerCourses] = useState<string[]>([]);
  const [isUploadingNewAvatar, setIsUploadingNewAvatar] = useState(false);
  const newFileInputRef = useRef<HTMLInputElement>(null);

  // Created Success Credentials Modal
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    name: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Load trainers from the unified dynamic API
  const loadTrainers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/trainers');
      const data = await res.json();

      if (res.ok && Array.isArray(data.trainers)) {
        setTrainers(data.trainers);
      } else {
        console.error('Failed to load trainers:', data.message);
      }
    } catch (err) {
      console.error('Error fetching trainers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load available courses for assignments
  const loadCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success && Array.isArray(data.courses)) {
        setAvailableCourses(
          data.courses.map((c: any) => ({
            id: c.id,
            slug: c.slug,
            title: c.title,
          }))
        );
      }
    } catch (err) {
      console.error('Error loading courses:', err);
    }
  };

  useEffect(() => {
    loadTrainers();
    loadCourses();
  }, []);

  // Avatar upload handler
  const handleUploadImage = async (file: File, isEdit: boolean) => {
    try {
      if (isEdit) setIsUploadingEditAvatar(true);
      else setIsUploadingNewAvatar(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'trainers');
      formData.append('slug', (isEdit ? editName : newTrainerName).trim() || 'trainer');

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || 'فشل رفع صورة المدرب');
        return;
      }

      if (isEdit) {
        setEditAvatarUrl(json.publicUrl);
      } else {
        setNewTrainerAvatarUrl(json.publicUrl);
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      alert('حدث خطأ أثناء رفع الصورة');
    } finally {
      if (isEdit) setIsUploadingEditAvatar(false);
      else setIsUploadingNewAvatar(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setEditName(trainer.name);
    setEditSpecialty(trainer.specialty);
    setEditEmail(trainer.email);
    setEditPhone(trainer.phone === 'غير مسجل' ? '' : trainer.phone);
    setEditPassword('');
    setEditAvatarUrl(trainer.avatarUrl || null);
    setEditStatus(trainer.status);
    setEditAssignedCourses(trainer.assignedCourseSlugs || []);
    setShowEditModal(true);
  };

  // Save Trainer Edit
  const handleSaveEditTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrainer) return;

    if (!editName.trim() || !editEmail.trim()) {
      alert('يرجى ملء الاسم والبريد الإلكتروني على الأقل');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/admin/trainers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTrainer.id,
          fullName: editName.trim(),
          specialty: editSpecialty.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim(),
          password: editPassword.trim() || undefined,
          avatarUrl: editAvatarUrl,
          status: editStatus,
          assignedCourseSlugs: editAssignedCourses,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.message || 'حدث خطأ أثناء حفظ التعديلات');
        return;
      }

      setShowEditModal(false);
      setEditingTrainer(null);
      await loadTrainers();
    } catch (err) {
      console.error('Save edit trainer error:', err);
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSaving(false);
    }
  };

  // Add New Trainer
  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainerName.trim() || !newTrainerEmail.trim() || !newTrainerPassword.trim()) {
      alert('يرجى ملء الاسم، البريد الإلكتروني، وكلمة المرور');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/admin/trainers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newTrainerName.trim(),
          email: newTrainerEmail.trim(),
          password: newTrainerPassword.trim(),
          specialty: newTrainerSpecialty.trim(),
          phone: newTrainerPhone.trim(),
          avatarUrl: newTrainerAvatarUrl,
          assignedCourseSlugs: newTrainerCourses,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.message || 'حدث خطأ أثناء إنشاء حساب المدرب');
        return;
      }

      setCreatedCredentials({
        name: newTrainerName,
        email: newTrainerEmail,
        password: newTrainerPassword,
      });

      setShowAddModal(false);
      setNewTrainerName('');
      setNewTrainerSpecialty('');
      setNewTrainerEmail('');
      setNewTrainerPhone('');
      setNewTrainerAvatarUrl(null);
      setNewTrainerCourses([]);
      setNewTrainerPassword(generatePassword());
      await loadTrainers();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSaving(false);
    }
  };

  // Delete Trainer
  const handleDeleteTrainer = async () => {
    if (!trainerToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(
        `/api/admin/users?userId=${trainerToDelete.id}&email=${encodeURIComponent(trainerToDelete.email)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'حدث خطأ أثناء حذف حساب المدرب');
        return;
      }
      setTrainers((prev) => prev.filter((t) => t.id !== trainerToDelete.id && t.email !== trainerToDelete.email));
      setTrainerToDelete(null);
    } catch (err) {
      console.error('Delete trainer error:', err);
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `بيانات الدخول لحساب المدرب - منصة النبض المستدام:
الاسم: ${createdCredentials.name}
البريد الإلكتروني: ${createdCredentials.email}
كلمة المرور: ${createdCredentials.password}
رابط الدخول: ${window.location.origin}/auth/login`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Filter Trainers
  const filteredTrainers = trainers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && t.status === 'active') ||
      (statusFilter === 'on_leave' && t.status === 'on_leave');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 sm:space-y-8" dir="rtl">
      {/* Page Header */}
      <div className="p-6 sm:p-8 rounded-3xl liquid-glass border border-white/60 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#173A7C]/10 text-[#173A7C] text-xs font-black">
            <GraduationCap className="w-4 h-4" />
            <span>الهيئة التدريبية والأكاديمية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>إدارة المدربين والمحاضرين</span>
            <span>👨‍🏫</span>
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-xl">
            إدارة حسابات المدربين، تحديث الصور والبيانات، تعيين الدورات المعتمدة، وإحصائيات الطلاب الحية.
          </p>
        </div>

        <div className="z-10 flex items-center gap-3">
          <button
            onClick={() => {
              setNewTrainerPassword(generatePassword());
              setShowAddModal(true);
            }}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-lg shadow-[#173A7C]/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة وتفعيل مدرب جديد</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم، التخصص، أو البريد الإلكتروني..."
            className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#173A7C] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {[
            { key: 'all', label: 'جميع المدربين' },
            { key: 'active', label: 'على رأس العمل' },
            { key: 'on_leave', label: 'إجازة / غير متاح' },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setStatusFilter(st.key as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st.key
                  ? 'bg-[#173A7C] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trainers Grid */}
      {loading ? (
        <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
          <p className="text-xs font-bold text-slate-500">جاري تحميل بيانات المدربين المعتمدين...</p>
        </div>
      ) : filteredTrainers.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm text-center space-y-3">
          <Users className="w-12 h-12 text-[#173A7C]/30 mx-auto" />
          <h3 className="text-base font-black text-slate-900">لا يوجد مدربون يطابقون معايير البحث</h3>
          <p className="text-xs text-slate-500 font-bold">يمكنك إضافة مدرب جديد بالنقر على زر الإضافة أعلاه.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTrainers.map((t) => (
            <div
              key={t.id}
              className="p-6 rounded-3xl liquid-glass-card liquid-glass-hover space-y-5 student-card-accent transition-all duration-300 border border-white/70 shadow-lg hover:shadow-xl"
            >
              {/* Header: Avatar, Name, Specialty, and Actions */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                  {t.avatarUrl ? (
                    <img
                      src={t.avatarUrl}
                      alt={t.name}
                      className="w-20 h-20 rounded-2xl object-cover shadow-md border-2 border-white/80 shrink-0 bg-slate-100"
                    />
                  ) : (
                    <img
                      src={
                        /أمال|ميسون|عهود|سارة|نورة|فاطمة|المدربة|دكتورة|محامية/.test(t.name)
                          ? '/trainer-default-female.webp'
                          : '/trainer-default-male.webp'
                      }
                      alt={t.name}
                      className="w-20 h-20 rounded-2xl object-cover shadow-md border-2 border-white/80 shrink-0 bg-slate-100"
                    />
                  )}
                  <div className="space-y-0.5">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">{t.name}</h3>
                    <p className="text-xs text-[#0D5C3A] font-bold">{t.specialty}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                      t.status === 'active'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {t.status === 'active' ? 'على رأس العمل 🟢' : 'إجازة 🟡'}
                  </span>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-2 rounded-xl bg-[#173A7C]/10 hover:bg-[#173A7C] text-[#173A7C] hover:text-white transition-all cursor-pointer border border-[#173A7C]/20 shadow-xs"
                    title="تعديل بيانات المدرب والصورة"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setTrainerToDelete(t)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition-all cursor-pointer border border-rose-200 shadow-xs"
                    title="حذف حساب المدرب"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 font-bold bg-white/50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-[#173A7C] shrink-0" />
                  <span className="truncate font-mono" dir="ltr">{t.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-mono" dir="ltr">{t.phone}</span>
                </div>
              </div>

              {/* Assigned Courses Badges (if any) */}
              {t.assignedCourseTitles && t.assignedCourseTitles.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 block">الدورات المسندة للمدرب:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {t.assignedCourseTitles.map((title, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200/80 truncate max-w-xs"
                      >
                        📚 {title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Statistics Row */}
              <div className="grid grid-cols-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-center text-xs font-black text-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">الدورات</span>
                  <span className="text-sm font-black text-[#173A7C]">{t.coursesCount}</span>
                </div>
                <div className="border-r border-l border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">إجمالي الطلاب</span>
                  <span className="text-sm font-black text-emerald-700">{t.studentsCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">التقييم</span>
                  <span className="text-amber-600 flex items-center justify-center gap-1 font-black text-sm">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{t.rating}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════ EDIT TRAINER MODAL ════════════════════════ */}
      <AnimatePresence>
        {showEditModal && editingTrainer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 bg-white shadow-2xl border border-white/60 text-right space-y-5 my-8"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="student-heading-h3 text-base sm:text-lg">تعديل بيانات المدرب الكاملة</h3>
                  <p className="text-xs text-slate-400 font-bold">تعديل الاسم، التخصص، الصورة، الدورات، وكلمة المرور</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTrainer(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditTrainer} className="space-y-4">
                {/* Avatar Section */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="relative group">
                    {editAvatarUrl ? (
                      <img
                        src={editAvatarUrl}
                        alt="Trainer preview"
                        className="w-20 h-20 rounded-2xl object-cover shadow-md border-2 border-white"
                      />
                    ) : (
                      <img
                        src={
                          /أمال|ميسون|عهود|سارة|نورة|فاطمة|المدربة|دكتورة|محامية/.test(editName)
                            ? '/trainer-default-female.webp'
                            : '/trainer-default-male.webp'
                        }
                        alt="Default preview"
                        className="w-20 h-20 rounded-2xl object-cover shadow-md border-2 border-white"
                      />
                    )}
                    {isUploadingEditAvatar && (
                      <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center text-white">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <p className="text-xs font-black text-slate-800">صورة المدرب الرسمية</p>
                    <p className="text-[11px] text-slate-500 font-medium">يتم ضغطها وتحويلها لـ WebP فائق السرعة تلقائياً</p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="file"
                        ref={editFileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadImage(file, true);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        disabled={isUploadingEditAvatar}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-[#173A7C] border border-[#173A7C]/30 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{editAvatarUrl ? 'تغيير الصورة' : 'رفع صورة'}</span>
                      </button>
                      {editAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => setEditAvatarUrl(null)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold cursor-pointer"
                        >
                          إزالة الصورة
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name & Specialty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">الاسم الكامل / اللقب</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">التخصص والمسمى التدريبي</label>
                    <input
                      type="text"
                      value={editSpecialty}
                      onChange={(e) => setEditSpecialty(e.target.value)}
                      placeholder="مثال: استشاري الحوار والمسؤولية المجتمعية"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">البريد الإلكتروني</label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">رقم الهاتف</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+966 50 000 0000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>
                </div>

                {/* Password Reset & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">
                      تغيير كلمة المرور <span className="text-slate-400 font-normal">(اتركها فارغة إذا لم ترغب بالتغيير)</span>
                    </label>
                    <input
                      type="text"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="كلمة مرور جديدة..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">حالة الحساب</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white"
                    >
                      <option value="active">على رأس العمل (نشط ومتاح)</option>
                      <option value="on_leave">إجازة / غير متاح حالياً</option>
                    </select>
                  </div>
                </div>

                {/* Assigned Courses Section */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#173A7C]" />
                      <span>تخصيص وإسناد الدورات للمدرب:</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-bold">
                      {editAssignedCourses.length} دورة محددة
                    </span>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    {availableCourses.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-2">لا توجد دورات مسجلة بالمنصة</p>
                    ) : (
                      availableCourses.map((c) => {
                        const checked = editAssignedCourses.includes(c.slug);
                        return (
                          <label
                            key={c.slug}
                            className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                              checked ? 'bg-[#173A7C]/10 text-[#173A7C]' : 'hover:bg-white text-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditAssignedCourses((prev) => [...prev, c.slug]);
                                } else {
                                  setEditAssignedCourses((prev) => prev.filter((s) => s !== c.slug));
                                }
                              }}
                              className="rounded text-[#173A7C] focus:ring-0"
                            />
                            <span className="flex-1 truncate">{c.title}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingTrainer(null);
                    }}
                    className="px-5 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-[#173A7C]/20 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════ ADD TRAINER MODAL ════════════════════════ */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 bg-white shadow-2xl border border-white/60 text-right space-y-5 my-8"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="student-heading-h3 text-base sm:text-lg">إضافة وتفعيل مدرب جديد</h3>
                  <p className="text-xs text-slate-400 font-bold">إنشاء حساب رسمي للمدرب وتعيين صلاحيات الدخول والدورات</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTrainer} className="space-y-4">
                {/* Avatar Section (Optional) */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="relative">
                    {newTrainerAvatarUrl ? (
                      <img
                        src={newTrainerAvatarUrl}
                        alt="New trainer avatar"
                        className="w-20 h-20 rounded-2xl object-cover shadow-md border-2 border-white"
                      />
                    ) : (
                      <img
                        src={
                          /أمال|ميسون|عهود|سارة|نورة|فاطمة|المدربة|دكتورة|محامية/.test(newTrainerName)
                            ? '/trainer-default-female.webp'
                            : '/trainer-default-male.webp'
                        }
                        alt="Default trainer avatar"
                        className="w-20 h-20 rounded-2xl object-cover shadow-md border-2 border-white opacity-85"
                      />
                    )}
                    {isUploadingNewAvatar && (
                      <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center text-white">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 flex-1">
                    <p className="text-xs font-black text-slate-800">صورة المدرب (اختيارية)</p>
                    <p className="text-[11px] text-slate-500 font-medium">يمكنك رفعها الآن، أو يمكن للمدرب إضافتها بنفسه لاحقاً</p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="file"
                        ref={newFileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadImage(file, false);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => newFileInputRef.current?.click()}
                        disabled={isUploadingNewAvatar}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-[#173A7C] border border-[#173A7C]/30 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{newTrainerAvatarUrl ? 'تغيير الصورة' : 'رفع صورة الآن'}</span>
                      </button>
                      {newTrainerAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => setNewTrainerAvatarUrl(null)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold cursor-pointer"
                        >
                          إزالة
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name & Specialty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">الاسم الكامل / اللقب الأكاديمي</label>
                    <input
                      type="text"
                      required
                      value={newTrainerName}
                      onChange={(e) => setNewTrainerName(e.target.value)}
                      placeholder="مثال: د. محمد بن إبراهيم القحطاني"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">التخصص والمسمى التدريبي</label>
                    <input
                      type="text"
                      value={newTrainerSpecialty}
                      onChange={(e) => setNewTrainerSpecialty(e.target.value)}
                      placeholder="مثال: استشاري الحوار والمسؤولية المجتمعية"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>
                </div>

                {/* Email & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">البريد الإلكتروني (لتسجيل الدخول)</label>
                    <input
                      type="email"
                      required
                      value={newTrainerEmail}
                      onChange={(e) => setNewTrainerEmail(e.target.value)}
                      placeholder="trainer@sustainpulse.org"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">كلمة المرور للحساب</label>
                    <input
                      type="text"
                      required
                      value={newTrainerPassword}
                      onChange={(e) => setNewTrainerPassword(e.target.value)}
                      placeholder="8 أحرف على الأقل"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">رقم الهاتف (اختياري)</label>
                  <input
                    type="text"
                    value={newTrainerPhone}
                    onChange={(e) => setNewTrainerPhone(e.target.value)}
                    placeholder="+966 50 000 0000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                {/* Assigned Courses Section */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#173A7C]" />
                    <span>إسناد دورات مبدئية للمدرب (اختياري):</span>
                  </label>

                  <div className="max-h-36 overflow-y-auto space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    {availableCourses.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-2">لا توجد دورات مسجلة بالمنصة</p>
                    ) : (
                      availableCourses.map((c) => {
                        const checked = newTrainerCourses.includes(c.slug);
                        return (
                          <label
                            key={c.slug}
                            className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                              checked ? 'bg-[#173A7C]/10 text-[#173A7C]' : 'hover:bg-white text-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewTrainerCourses((prev) => [...prev, c.slug]);
                                } else {
                                  setNewTrainerCourses((prev) => prev.filter((s) => s !== c.slug));
                                }
                              }}
                              className="rounded text-[#173A7C] focus:ring-0"
                            />
                            <span className="flex-1 truncate">{c.title}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-[#173A7C]/20 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>{saving ? 'جاري الإنشاء والتفعيل...' : 'إنشاء وتفعيل حساب المدرب'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Credentials Modal */}
      <AnimatePresence>
        {createdCredentials && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl p-6 sm:p-8 bg-white shadow-2xl border border-white/60 text-right space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="student-heading-h3 !text-base">تم إنشاء وتفعيل حساب المدرب بنجاح! 🎉</h3>
                <p className="text-xs text-slate-500 font-bold">
                  يمكن للمدرب ({createdCredentials.name}) الآن تسجيل الدخول مباشرة للوحة تحكم المدرب.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold space-y-2 text-right">
                <div>
                  <span className="text-slate-400 block text-[10px]">البريد الإلكتروني:</span>
                  <span className="font-mono text-[#173A7C] font-black">{createdCredentials.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">كلمة المرور:</span>
                  <span className="font-mono text-slate-900 font-black">{createdCredentials.password}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">الصلاحية:</span>
                  <span className="text-emerald-700 font-black">مدرب ومحاضر معتمد (INSTRUCTOR)</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCopyCredentials}
                  className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'تم نسخ بيانات الدخول!' : 'نسخ بيانات الدخول للمدرب'}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCreatedCredentials(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black cursor-pointer"
                  >
                    إغلاق
                  </button>
                  <a
                    href="/auth/login"
                    target="_blank"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md hover:opacity-95"
                  >
                    <span>صفحة الدخول</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Trainer Confirmation Modal */}
      <AnimatePresence>
        {trainerToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 1 }}
              className="w-full max-w-md bg-white rounded-2xl border border-rose-200 p-6 space-y-4 shadow-2xl relative text-right font-[family-name:var(--font-cairo)]"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-rose-100">
                <div className="p-3 rounded-xl bg-rose-100 text-rose-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">تأكيد حذف حساب المدرب</h3>
                  <p className="text-xs text-rose-600 font-bold">هذا الإجراء سيحذف حساب المعلم بالكامل</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-bold leading-relaxed">
                هل أنت متأكد من رغبتك في حذف حساب المدرب <strong className="text-slate-900">{trainerToDelete.name}</strong> ({trainerToDelete.email})؟
              </p>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={handleDeleteTrainer}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحذف...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>نعم، احذف الحساب الآن</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setTrainerToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
