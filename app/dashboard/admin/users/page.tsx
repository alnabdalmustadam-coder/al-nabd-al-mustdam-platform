'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  Phone,
  BookOpen,
  Award,
  MoreVertical,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  X,
  Calendar,
  Activity,
  GraduationCap,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'طالب' | 'مدرب' | 'أدمن';
  enrolledCourses: number;
  certificatesCount: number;
  status: 'active' | 'suspended';
  lastActive: string;
  attendanceRate: string;
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'طالب' | 'مدرب' | 'أدمن'>('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUserForLogs, setSelectedUserForLogs] = useState<UserRecord | null>(null);

  // New Student Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const [users, setUsers] = useState<UserRecord[]>([
    {
      id: 'u-1',
      name: 'عبدالله الشمري',
      email: 'abdullah@example.com',
      phone: '+966 50 123 4567',
      role: 'طالب',
      enrolledCourses: 3,
      certificatesCount: 2,
      status: 'active',
      lastActive: 'منذ 10 دقائق',
      attendanceRate: '96%',
    },
    {
      id: 'u-2',
      name: 'سارة العتيبي',
      email: 'sara@example.com',
      phone: '+966 55 987 6543',
      role: 'طالب',
      enrolledCourses: 2,
      certificatesCount: 1,
      status: 'active',
      lastActive: 'اليوم، 09:30 ص',
      attendanceRate: '100%',
    },
    {
      id: 'u-3',
      name: 'د. محمد القحطاني',
      email: 'm.qahtani@tti.edu.sa',
      phone: '+966 51 000 1122',
      role: 'مدرب',
      enrolledCourses: 12,
      certificatesCount: 15,
      status: 'active',
      lastActive: 'منذ ساعة',
      attendanceRate: '98%',
    },
    {
      id: 'u-4',
      name: 'سعود السبيعي',
      email: 'saud@example.com',
      phone: '+966 54 333 2211',
      role: 'طالب',
      enrolledCourses: 1,
      certificatesCount: 0,
      status: 'suspended',
      lastActive: 'منذ 5 أيام',
      attendanceRate: '60%',
    },
  ]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newU: UserRecord = {
      id: `u-${Date.now()}`,
      name: newName,
      email: newEmail,
      phone: newPhone || '+966 50 000 0000',
      role: 'طالب',
      enrolledCourses: 1,
      certificatesCount: 0,
      status: 'active',
      lastActive: 'الآن',
      attendanceRate: '100%',
    };

    setUsers([newU, ...users]);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setIsAddUserModalOpen(false);
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u))
    );
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.includes(searchQuery) || u.email.includes(searchQuery) || u.phone.includes(searchQuery);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const activeCount = users.filter((u) => u.status === 'active').length;
  const studentCount = users.filter((u) => u.role === 'طالب').length;
  const trainerCount = users.filter((u) => u.role === 'مدرب').length;

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
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#173A7C]/10 text-[#173A7C] text-[10px] sm:text-xs font-black border border-[#173A7C]/15 shrink-0 whitespace-nowrap mb-3 sm:mb-4">
                <Users className="w-3.5 h-3.5 text-[#173A7C] shrink-0" />
                <span>إدارة المتدربين وسجلات الحضور</span>
              </div>
              <h1 className="text-sm sm:text-2xl lg:text-3xl font-black student-heading-h1 student-name-gradient leading-snug">
                سجل الطلاب والمتدربين <span className="inline-block whitespace-nowrap">والأنشطة 👥</span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs lg:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
              متابعة دقيقة لحضور المتدربين، نسب التفاعل والتسليمات الأكاديمية، إدارة الصلاحيات وتصدير التقارير الرسمية المعتمدة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => alert('تم تصدير سجل المتدربين بصيغة Excel بنجاح!')}
              className="flex-1 sm:flex-none px-3.5 sm:px-4.5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-200 shadow-2xs cursor-pointer transition-all shrink-0 whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-[#173A7C] shrink-0" />
              <span>تصدير البيانات 📊</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#173A7C] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#173A7C]/20 cursor-pointer border border-white/25 transition-all shrink-0 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>تسجيل متدرب جديد ⚡</span>
            </motion.button>
          </div>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-[#173A7C]/10">
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">إجمالي المستخدمين</p>
            <p className="text-base sm:text-lg font-black text-[#173A7C]">{users.length} مسجل</p>
          </div>
          <div className="liquid-glass-inset p-3.5 rounded-xl border border-white/70">
            <p className="text-[11px] text-slate-500 font-bold">الطلاب والمتدربين</p>
            <p className="text-base sm:text-lg font-black text-emerald-700">{studentCount} طالب</p>
          </div>
          <div className="liquid-glass-inset p-3.5 rounded-xl border border-white/70">
            <p className="text-[11px] text-slate-500 font-bold">المحاضرين والخبراء</p>
            <p className="text-base sm:text-lg font-black text-[#173A7C]">{trainerCount} مدرب معتمد</p>
          </div>
          <div className="liquid-glass-inset p-3.5 rounded-xl border border-white/70">
            <p className="text-[11px] text-slate-500 font-bold">الحسابات النشطة</p>
            <p className="text-base sm:text-lg font-black text-emerald-700">{activeCount} نشط 🟢</p>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs & Search Bar */}
      <div className="liquid-glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/60 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {[
            { id: 'all', label: 'الجميع' },
            { id: 'طالب', label: 'الطلاب والمتدربين 🎓' },
            { id: 'مدرب', label: 'المحاضرين 👨‍🏫' },
          ].map((tab) => {
            const isActive = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id as any)}
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
          <Search className="w-4 h-4 text-slate-400 absolute top-3.5 right-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم المتدرب، البريد، أو الجوال..."
            className="w-full py-2.5 pr-10 pl-4 text-xs font-bold text-slate-800 bg-white/90 rounded-xl border border-slate-200/80 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Users - Desktop Table + Mobile Cards */}
      <div className="liquid-glass-card rounded-lg sm:rounded-xl overflow-hidden border border-white/70 shadow-lg student-card-accent">
        
        {/* Desktop Table - hidden on mobile */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#173A7C]/5 text-[#173A7C] font-black border-b border-[#173A7C]/10">
              <tr>
                <th className="p-4">المتدرب</th>
                <th className="p-4">التصنيف</th>
                <th className="p-4">معلومات الاتصال</th>
                <th className="p-4">المساقات المسجلة</th>
                <th className="p-4">نسبة الحضور والتفاعل</th>
                <th className="p-4">آخر نشاط</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#173A7C]/8 font-bold text-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/60 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white font-black flex items-center justify-center shrink-0 text-sm shadow-md shadow-[#173A7C]/20 border border-white/20">
                        {user.name.charAt(0)}
                      </div>
                      <div className="font-extrabold text-[#152C5B] text-sm student-heading-h3 [text-shadow:_0_1px_0_rgba(255,255,255,0.35)]">
                        {user.name}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                      user.role === 'طالب' ? 'bg-[#173A7C]/10 text-[#173A7C] border-[#173A7C]/20' :
                      user.role === 'مدرب' ? 'bg-amber-500/10 text-amber-800 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-800 border-rose-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-[#173A7C]" />
                      <span className="font-mono text-[11px]">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-mono" dir="ltr">{user.phone}</span>
                    </div>
                  </td>
                  <td className="p-4 font-black">
                    <span className="text-[#173A7C] bg-[#173A7C]/10 px-2.5 py-1 rounded-lg border border-[#173A7C]/15">
                      {user.enrolledCourses} مساقات
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 font-mono font-black border border-emerald-500/20">
                      {user.attendanceRate}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-medium">
                    {user.lastActive}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black border cursor-pointer transition-all ${user.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-800 border-rose-500/30 hover:bg-rose-500/20'
                        }`}
                    >
                      {user.status === 'active' ? 'نشط 🟢' : 'معلق 🔴'}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedUserForLogs(user)}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#173A7C] hover:text-white text-[#173A7C] font-bold text-[11px] transition-all cursor-pointer border border-[#173A7C]/20 shadow-sm"
                    >
                      سجل الأنشطة 📋
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - visible only on mobile */}
        <div className="md:hidden divide-y divide-[#173A7C]/8">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-4 space-y-3">
              {/* User Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white font-black flex items-center justify-center shrink-0 text-sm shadow-md shadow-[#173A7C]/20 border border-white/20">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-extrabold text-[#152C5B] text-sm student-heading-h3">
                      {user.name}
                    </div>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      user.role === 'طالب' ? 'bg-[#173A7C]/10 text-[#173A7C] border-[#173A7C]/20' :
                      user.role === 'مدرب' ? 'bg-amber-500/10 text-amber-800 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-800 border-rose-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleUserStatus(user.id)}
                  className={`px-3 py-1 rounded-full text-[10px] font-black border cursor-pointer shrink-0 ${user.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-800 border-rose-500/30'
                    }`}
                >
                  {user.status === 'active' ? 'نشط 🟢' : 'معلق 🔴'}
                </button>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-[#173A7C] shrink-0" />
                  <span className="font-mono">{user.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-mono" dir="ltr">{user.phone}</span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="liquid-glass-inset p-2 rounded-lg border border-white/60 text-center">
                  <p className="text-[9px] text-slate-500 font-bold">المساقات</p>
                  <p className="text-sm font-black text-[#173A7C]">{user.enrolledCourses}</p>
                </div>
                <div className="liquid-glass-inset p-2 rounded-lg border border-white/60 text-center">
                  <p className="text-[9px] text-slate-500 font-bold">الحضور</p>
                  <p className="text-sm font-black text-emerald-700 font-mono">{user.attendanceRate}</p>
                </div>
                <div className="liquid-glass-inset p-2 rounded-lg border border-white/60 text-center">
                  <p className="text-[9px] text-slate-500 font-bold">آخر نشاط</p>
                  <p className="text-[10px] font-bold text-slate-600">{user.lastActive}</p>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={() => setSelectedUserForLogs(user)}
                className="w-full py-2 rounded-lg bg-white hover:bg-[#173A7C] hover:text-white text-[#173A7C] font-bold text-[11px] transition-all cursor-pointer border border-[#173A7C]/20 shadow-sm text-center"
              >
                سجل الأنشطة 📋
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* REGISTER NEW USER MODAL */}
      <AnimatePresence>
        {isAddUserModalOpen && (
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
              className="w-full max-w-lg bg-white/95 backdrop-blur-xl text-slate-900 rounded-xl sm:rounded-2xl border border-white/80 p-6 sm:p-8 space-y-5 shadow-2xl overflow-hidden relative my-8"
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#5CB07C] via-[#173A7C] to-emerald-400" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[#152C5B] student-heading-h3">تسجيل متدرب جديد في النظام</h3>
                    <p className="text-xs text-slate-500 font-bold">إضافة حساب طالب وتعيين بيانات الاعتماد</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-3.5 text-xs font-bold">
                <div className="space-y-1.5">
                  <label className="text-slate-700 block">الاسم الكامل للمتدرب</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد عبدالأمير العلي"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 block">البريد الإلكتروني الأكاديمي</label>
                  <input
                    type="email"
                    required
                    placeholder="ahmed@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 block">رقم الجوال</label>
                  <input
                    type="text"
                    placeholder="+966 50 000 0000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                  />
                </div>

                <div className="pt-4 flex gap-3 border-t border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-bold shadow-lg shadow-[#173A7C]/25 cursor-pointer transition-all border border-white/20"
                  >
                    تأكيد الإضافة ⚡
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* USER LOGS MODAL */}
      <AnimatePresence>
        {selectedUserForLogs && (
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
              className="w-full max-w-lg bg-white/95 backdrop-blur-xl text-slate-900 rounded-xl sm:rounded-2xl border border-white/80 p-6 sm:p-8 space-y-5 shadow-2xl overflow-hidden relative my-8"
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#5CB07C] via-[#173A7C] to-emerald-400" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-[#173A7C]/10 text-[#173A7C]">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[#152C5B] student-heading-h3">
                      سجل أنشطة وحضور: {selectedUserForLogs.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold">تتبع دقيق لمحاضرات ومشاركات الطالب</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUserForLogs(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#173A7C]/5 border border-[#173A7C]/15 flex justify-between font-bold text-[#173A7C]">
                  <span>نسبة الحضور والتفاعل الإجمالية:</span>
                  <span className="font-black font-mono text-emerald-700 text-sm">{selectedUserForLogs.attendanceRate}</span>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="font-black text-slate-700">آخر الجلسات والدروس المسجلة:</h4>
                  {[
                    { date: 'اليوم، 10:15 ص', action: 'حضور المحاضرة المباشرة: تطبيقات الحوار الإيجابي' },
                    { date: 'أمس، 04:30 م', action: 'إكمال الدرس الأول: مدخل إلى قيم التسامح' },
                    { date: '28 يوليو 2026', action: 'تسليم واجب الوحدة الثانية بنجاح (98/100)' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 shadow-sm">
                      <Clock className="w-4 h-4 text-[#173A7C] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-800">{item.action}</div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">{item.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200/70 flex justify-end">
                <button
                  onClick={() => setSelectedUserForLogs(null)}
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
