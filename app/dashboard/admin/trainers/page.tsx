'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

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

  // New Trainer Form State
  const [newTrainerName, setNewTrainerName] = useState('');
  const [newTrainerSpecialty, setNewTrainerSpecialty] = useState('');
  const [newTrainerEmail, setNewTrainerEmail] = useState('');
  const [newTrainerPhone, setNewTrainerPhone] = useState('');

  const [trainers, setTrainers] = useState<Trainer[]>([
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
    {
      id: 'tr-3',
      name: 'أ. فهد بن سليمان الحارثي',
      specialty: 'خبير التفكير الناقد والمنهجيات الأكاديمية',
      email: 'f.harthi@sustainpulse.org',
      phone: '+966 53 456 7890',
      coursesCount: 3,
      studentsCount: 1950,
      rating: 4.7,
      status: 'active',
      avatarInitials: 'ف ح',
    },
    {
      id: 'tr-4',
      name: 'د. نورة بنت فهد الدوسري',
      specialty: 'متخصصة الحوار الأسري والتماسك المجتمعي',
      email: 'n.dosari@sustainpulse.org',
      phone: '+966 54 321 0987',
      coursesCount: 2,
      studentsCount: 1200,
      rating: 4.9,
      status: 'on_leave',
      avatarInitials: 'ن د',
    },
  ]);

  const handleAddTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainerName.trim() || !newTrainerEmail.trim()) return;

    const initials = newTrainerName
      .split(' ')
      .slice(0, 2)
      .map((n) => n.charAt(0))
      .join(' ');

    const newTr: Trainer = {
      id: `tr-${Date.now()}`,
      name: newTrainerName,
      specialty: newTrainerSpecialty || 'خبير التنمية الأكاديمية',
      email: newTrainerEmail,
      phone: newTrainerPhone || '+966 50 000 0000',
      coursesCount: 1,
      studentsCount: 0,
      rating: 5.0,
      status: 'active',
      avatarInitials: initials || 'م خ',
    };

    setTrainers([newTr, ...trainers]);
    setNewTrainerName('');
    setNewTrainerSpecialty('');
    setNewTrainerEmail('');
    setNewTrainerPhone('');
    setShowAddModal(false);
  };

  const filteredTrainers = trainers.filter((t) => {
    const matchesSearch =
      t.name.includes(searchTerm) || t.specialty.includes(searchTerm) || t.email.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' ? true : t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalStudents = trainers.reduce((acc, curr) => acc + curr.studentsCount, 0);

  return (
    <div className="space-y-6" dir="rtl">
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
              <div className="admin-hero-tag bg-[#173A7C]/10 text-[#173A7C] border border-[#173A7C]/15">
                <UserCheck className="w-4 h-4 text-[#173A7C] shrink-0" />
                <span>إدارة الهيئة التدريبية والأكاديمية</span>
              </div>
              <h1 className="text-sm sm:text-2xl lg:text-3xl font-black student-heading-h1 student-name-gradient leading-snug">
                المدربين والمحاضرين <span className="inline-block whitespace-nowrap">والخبراء 👨‍🏫</span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs lg:text-sm text-slate-600 font-medium max-w-xl leading-relaxed">
              إدارة صلاحيات المحاضرين المعتمدين، متابعة التقييمات والأداء الأكاديمي، وإسناد الجلسات التدريبية المباشرة.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#173A7C] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#173A7C]/20 cursor-pointer border border-white/25 shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>إضافة مدرب جديد ⚡</span>
          </motion.button>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-[#173A7C]/10">
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">هيئة التدريس</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-[#173A7C]">{trainers.length} مدرب معتمد</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">إجمالي المتدربين</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-emerald-700">{totalStudents.toLocaleString('en-US')} طالب</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">متوسط التقييم</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-amber-600 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <span>4.85 / 5.0</span>
            </p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">حالة الاعتماد</p>
            <p className="text-xs sm:text-sm lg:text-base font-black text-emerald-700">موثقين رسمياً 🟢</p>
          </div>
        </div>
      </motion.div>

      {/* Filter and Search Bar */}
      <div className="liquid-glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/60 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {[
            { key: 'all', label: `الكل (${trainers.length})` },
            { key: 'active', label: `نشط (${trainers.filter((t) => t.status === 'active').length})` },
            { key: 'on_leave', label: `إجازة (${trainers.filter((t) => t.status === 'on_leave').length})` },
          ].map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key as any)}
                className={`flex-1 sm:flex-none px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${isActive
                    ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20 border border-[#173A7C]'
                    : 'bg-white/80 text-slate-700 hover:bg-white hover:text-[#173A7C] border border-slate-200/80'
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute top-3.5 right-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="بحث باسم المدرب، التخصص، البريد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2.5 pr-10 pl-4 text-xs font-bold text-slate-800 bg-white/90 rounded-xl border border-slate-200/80 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTrainers.map((trainer) => (
          <motion.div
            key={trainer.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="liquid-glass-card liquid-glass-hover rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/70 space-y-4 relative group overflow-hidden student-card-accent"
          >
            <div className="specular-card-reflection" />

            {/* Header / Avatar */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white flex items-center justify-center font-black text-sm sm:text-base shadow-md shadow-[#173A7C]/20 border border-white/25 shrink-0">
                  {trainer.avatarInitials}
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-xs sm:text-sm text-[#152C5B] student-heading-h3 leading-snug">
                    {trainer.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-emerald-700 font-bold">{trainer.specialty}</p>
                </div>
              </div>

              <span
                className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold border shrink-0 whitespace-nowrap ${trainer.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25'
                    : 'bg-amber-500/10 text-amber-800 border-amber-500/25'
                  }`}
              >
                {trainer.status === 'active' ? 'نشط 🟢' : 'إجازة 🟡'}
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl text-center liquid-glass-inset border border-white/70">
              <div>
                <span className="block text-[10px] text-slate-500 font-bold">المساقات</span>
                <span className="text-xs font-black text-[#173A7C]">{trainer.coursesCount} دورات</span>
              </div>
              <div className="border-r border-l border-[#173A7C]/10">
                <span className="block text-[10px] text-slate-500 font-bold">المتدربين</span>
                <span className="text-xs font-black text-emerald-700">{trainer.studentsCount.toLocaleString('en-US')}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-bold">التقييم العام</span>
                <span className="text-xs font-black text-amber-600 flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {trainer.rating}
                </span>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-2 text-xs text-slate-600 font-bold border-t border-[#173A7C]/10 pt-3">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#173A7C]" />
                <span className="font-mono text-[11px]">{trainer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono" dir="ltr">{trainer.phone}</span>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-2 gap-2">
              <button className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-sm">
                تعديل الصلاحيات
              </button>
              <button className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white transition-all shadow-md shadow-[#173A7C]/15 border border-white/20">
                عرض الملف الكامل
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Trainer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg overflow-hidden rounded-xl sm:rounded-2xl p-6 sm:p-8 bg-white/95 backdrop-blur-xl shadow-2xl space-y-5 text-right border border-white/80 my-8"
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#5CB07C] via-[#173A7C] to-emerald-400" />

              <div className="flex justify-between items-center border-b border-slate-200/70 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[#152C5B] student-heading-h3">إضافة مدرب جديد للنظام</h3>
                    <p className="text-xs text-slate-500 font-bold">تسجيل محاضر معتمد وتعيين بيانات الاعتماد</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTrainer} className="space-y-3.5 text-xs font-bold">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">اسم المدرب ثلاثي</label>
                  <input
                    type="text"
                    required
                    placeholder="د. أحمد الفضلي"
                    value={newTrainerName}
                    onChange={(e) => setNewTrainerName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">التخصص / المسار التدريبي</label>
                  <input
                    type="text"
                    placeholder="خبير التسامح والحوار الأكاديمي"
                    value={newTrainerSpecialty}
                    onChange={(e) => setNewTrainerSpecialty(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">البريد الإلكتروني الرسمي</label>
                  <input
                    type="email"
                    required
                    placeholder="trainer@sustainpulse.org"
                    value={newTrainerEmail}
                    onChange={(e) => setNewTrainerEmail(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">رقم الجوال</label>
                  <input
                    type="text"
                    placeholder="+966 50 000 0000"
                    value={newTrainerPhone}
                    onChange={(e) => setNewTrainerPhone(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-bold shadow-lg shadow-[#173A7C]/25 cursor-pointer transition-all border border-white/20"
                  >
                    إضافة وحفظ ⚡
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
