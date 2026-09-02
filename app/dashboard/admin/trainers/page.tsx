'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface Trainer {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  coursesCount: number;
  studentsCount: number;
  rating: number;
  status: 'active' | 'on_leave';
  avatarInitials: string;
}

export default function AdminTrainersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'on_leave'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState<Trainer | null>(null);

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

  // Created Success Credentials Modal
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    name: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDeleteTrainer = async () => {
    if (!trainerToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/users?userId=${trainerToDelete.id}&email=${encodeURIComponent(trainerToDelete.email)}`, {
        method: 'DELETE',
      });
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

  const loadTrainers = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'INSTRUCTOR')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trainers:', error);
      }

      if (data && data.length > 0) {
        const mapped: Trainer[] = data.map((p: any) => {
          const name = p.full_name || 'مدرب معتمد';
          const initials = name
            .split(' ')
            .slice(0, 2)
            .map((n: string) => n[0])
            .join(' ');

          return {
            id: p.id,
            name,
            specialty: p.bio || 'مدرب ومحاضر معتمد',
            email: p.email,
            phone: p.phone || 'غير مسجل',
            coursesCount: 3,
            studentsCount: 150,
            rating: 4.9,
            status: 'active',
            avatarInitials: initials || 'م د',
          };
        });
        setTrainers(mapped);
      } else {
        setTrainers([
          {
            id: 'tr-1',
            name: 'د. عبدالله بن محمد الشمري',
            specialty: 'أستاذ المواطنة والحوار الحضاري',
            email: 'a.shammari@sustainpulse.org',
            phone: '+966 50 123 4567',
            coursesCount: 5,
            studentsCount: 3420,
            rating: 4.9,
            status: 'active',
            avatarInitials: 'ع ش',
          },
          {
            id: 'tr-2',
            name: 'د. سارة بنت خالد العتيبي',
            specialty: 'استشارية القيادة والتنمية الإيجابية',
            email: 's.otaibi@sustainpulse.org',
            phone: '+966 55 987 6543',
            coursesCount: 4,
            studentsCount: 2890,
            rating: 4.8,
            status: 'active',
            avatarInitials: 'س ع',
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainers();
  }, []);

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
          fullName: newTrainerName,
          email: newTrainerEmail,
          password: newTrainerPassword,
          specialty: newTrainerSpecialty,
          phone: newTrainerPhone,
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
      setNewTrainerPassword(generatePassword());
      loadTrainers();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `بيانات الدخول للوحة تحكم المدرب:\nالبريد: ${createdCredentials.email}\nكلمة المرور: ${createdCredentials.password}\nالرابط: ${window.location.origin}/auth/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTrainers = trainers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
      {/* Hero Header */}
      <div className="relative z-20 liquid-glass-hero p-6 sm:p-8 rounded-2xl sm:rounded-3xl liquid-glass-hover overflow-hidden student-card-accent">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="admin-hero-tag bg-blue-50 text-[#173A7C] border border-blue-200">
              <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
              <span>الهيئة التدريبية والأكاديمية</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black student-heading-h1">
              إدارة <span className="student-name-gradient">المدربين والمحاضرين</span> 👨‍🏫
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-xl">
              إضافة مدربين جدد، إنشاء حساباتهم الرسمية، وتعيين بيانات الدخول الخاصة بهم للوحة تحكم المدرب.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-[#173A7C]/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة وتفعيل مدرب جديد</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم، التخصص، أو البريد الإلكتروني..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white/80"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'active', 'on_leave'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#173A7C] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'all' ? 'جميع المدربين' : st === 'active' ? 'على رأس العمل' : 'إجازة / غير متاح'}
            </button>
          ))}
        </div>
      </div>

      {/* Trainers Grid */}
      {loading ? (
        <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
          <p className="text-xs font-bold text-slate-500">جاري تحميل بيانات المدربين...</p>
        </div>
      ) : filteredTrainers.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm text-center space-y-3">
          <Users className="w-12 h-12 text-[#173A7C]/30 mx-auto" />
          <h3 className="text-base font-black text-slate-900">لا يوجد مدربون يطابقون البحث</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredTrainers.map((t) => (
            <div
              key={t.id}
              className="p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-4 student-card-accent"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white flex items-center justify-center font-black text-sm shadow-md">
                    {t.avatarInitials}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{t.name}</h3>
                    <p className="text-xs text-[#0D5C3A] font-bold">{t.specialty}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                      t.status === 'active'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {t.status === 'active' ? 'حساب نشط' : 'إجازة'}
                  </span>
                  <button
                    onClick={() => setTrainerToDelete(t)}
                    className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition-all cursor-pointer border border-rose-200"
                    title="حذف حساب المدرب"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 font-bold">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs font-black text-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">الدورات</span>
                  <span>{t.coursesCount}</span>
                </div>
                <div className="border-r border-l border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">الطلاب</span>
                  <span>{t.studentsCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">التقييم</span>
                  <span className="text-amber-600 flex items-center justify-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{t.rating}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Trainer Modal */}
      <AnimatePresence>
        {showAddModal && (
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
              className="relative w-full max-w-lg overflow-hidden rounded-3xl p-6 sm:p-8 bg-white shadow-2xl border border-white/60 text-right space-y-5"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="student-heading-h3">إضافة وتفعيل مدرب جديد</h3>
                  <p className="text-xs text-slate-400 font-bold">سيتم إنشاء حساب رسمي له للوصول إلى لوحة المدرب</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTrainer} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">الاسم الكامل / اللقب الأكاديمي</label>
                  <input
                    type="text"
                    required
                    value={newTrainerName}
                    onChange={(e) => setNewTrainerName(e.target.value)}
                    placeholder="مثال: د. محمد بن إبراهيم القحطاني"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">التخصص والمسمى التدريبي</label>
                  <input
                    type="text"
                    value={newTrainerSpecialty}
                    onChange={(e) => setNewTrainerSpecialty(e.target.value)}
                    placeholder="مثال: استشاري الحوار والمسؤولية المجتمعية"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">البريد الإلكتروني (لتسجيل الدخول)</label>
                    <input
                      type="email"
                      required
                      value={newTrainerEmail}
                      onChange={(e) => setNewTrainerEmail(e.target.value)}
                      placeholder="trainer@sustainpulse.org"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
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
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">رقم الهاتف (اختياري)</label>
                  <input
                    type="text"
                    value={newTrainerPhone}
                    onChange={(e) => setNewTrainerPhone(e.target.value)}
                    placeholder="+966 50 000 0000"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

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
              exit={{ scale: 0.95, opacity: 0 }}
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
