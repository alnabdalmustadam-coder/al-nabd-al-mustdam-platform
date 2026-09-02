'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Lock,
  Copy,
  Check,
  Loader2,
  Trash2,
  AlertTriangle,
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

function AdminUsersPageContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [roleFilter, setRoleFilter] = useState<'all' | 'طالب' | 'مدرب' | 'أدمن'>('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUserForLogs, setSelectedUserForLogs] = useState<UserRecord | null>(null);

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState(() => generatePassword());
  const [newNationalId, setNewNationalId] = useState('');
  const [newRole, setNewRole] = useState<'STUDENT' | 'INSTRUCTOR' | 'ADMIN'>('STUDENT');

  // Deletion Modal State
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);

  // Created Success Credentials Modal
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    name: string;
    role?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      alert('يرجى ملء الاسم الكامل، البريد الإلكتروني، وكلمة المرور');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newName,
          email: newEmail,
          password: newPassword,
          phone: newPhone,
          nationalId: newNationalId,
          role: newRole,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.message || 'حدث خطأ أثناء تسجيل المستخدم');
        return;
      }

      setCreatedCredentials({
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole === 'ADMIN' ? 'أدمن ومدير نظام' : newRole === 'INSTRUCTOR' ? 'مدرب ومعلم' : 'متدرب وطالب',
      });

      setIsAddUserModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewNationalId('');
      setNewPassword(generatePassword());
      setNewRole('STUDENT');
      loadUsers();
    } catch (err) {
      console.error('Add user error:', err);
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/users?userId=${userToDelete.id}&email=${encodeURIComponent(userToDelete.email)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'حدث خطأ أثناء حذف الحساب');
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id && u.email !== userToDelete.email));
      setUserToDelete(null);
    } catch (err) {
      console.error('Delete user error:', err);
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `بيانات الدخول للوحة تحكم المتدرب:\nالاسم: ${createdCredentials.name}\nالبريد: ${createdCredentials.email}\nكلمة المرور: ${createdCredentials.password}\nالرابط: ${window.location.origin}/auth/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleUserStatus = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const newStatus = user.status === 'active' ? 'suspended' : 'active';

    // Optimistic update
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
    );

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, status: newStatus }),
      });
      if (!res.ok) {
        // Revert on failure
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: user.status } : u))
        );
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'فشل تغيير حالة المستخدم');
      }
    } catch {
      // Revert on error
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: user.status } : u))
      );
      alert('حدث خطأ في الاتصال بالخادم');
    }
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
              <div className="admin-hero-tag bg-[#173A7C]/10 text-[#173A7C] border border-[#173A7C]/15">
                <Users className="w-4 h-4 text-[#173A7C] shrink-0" />
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
              onClick={() => {
                const csvHeader = 'الاسم,البريد الإلكتروني,الهاتف,الدور,الحالة,آخر نشاط\n';
                const csvBody = filteredUsers.map(u =>
                  `"${u.name}","${u.email}","${u.phone}","${u.role}","${u.status === 'active' ? 'نشط' : 'معلّق'}","${u.lastActive}"`
                ).join('\n');
                const blob = new Blob(['\uFEFF' + csvHeader + csvBody], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `trainees_${new Date().toISOString().slice(0,10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
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
        <div className="premium-tabs flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
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
                className={`premium-tab flex-1 sm:flex-none px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${isActive
                    ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20 border border-[#173A7C]'
                    : 'bg-white/80 text-slate-700 hover:bg-white hover:text-[#173A7C] border border-slate-200/80'
                  }`}
              >
                <span className="premium-tab-label">{tab.label}</span>
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
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedUserForLogs(user)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#173A7C] hover:text-white text-[#173A7C] font-bold text-[11px] transition-all cursor-pointer border border-[#173A7C]/20 shadow-xs whitespace-nowrap"
                        title="سجل الأنشطة"
                      >
                        سجل الأنشطة 📋
                      </button>
                      <button
                        onClick={() => setUserToDelete(user)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition-all cursor-pointer border border-rose-200 shadow-xs"
                        title="حذف الحساب نهائياً"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setSelectedUserForLogs(user)}
                  className="flex-1 py-2 rounded-lg bg-white hover:bg-[#173A7C] hover:text-white text-[#173A7C] font-bold text-[11px] transition-all cursor-pointer border border-[#173A7C]/20 shadow-xs text-center"
                >
                  سجل الأنشطة 📋
                </button>
                <button
                  onClick={() => setUserToDelete(user)}
                  className="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition-all cursor-pointer border border-rose-200 shadow-xs flex items-center justify-center"
                  title="حذف الحساب"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
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
                    <h3 className="font-black text-lg text-[#152C5B] student-heading-h3">تسجيل مستخدم جديد في النظام</h3>
                    <p className="text-xs text-slate-500 font-bold">إنشاء حساب (طالب / مدرب / أدمن) وتعيين الصلاحية</p>
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
                {/* Role Selection */}
                <div className="space-y-1.5">
                  <label className="text-slate-700 block">نوع الحساب والصلاحية <span className="text-rose-500">*</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewRole('STUDENT')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        newRole === 'STUDENT'
                          ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white border-[#173A7C] shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>طالب</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRole('INSTRUCTOR')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        newRole === 'INSTRUCTOR'
                          ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>مدرب / معلم</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRole('ADMIN')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        newRole === 'ADMIN'
                          ? 'bg-gradient-to-r from-purple-700 to-indigo-800 text-white border-purple-700 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>أدمن (مدير)</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 block">الاسم الكامل <span className="text-rose-500">*</span></label>
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
                  <label className="text-slate-700 block">البريد الإلكتروني <span className="text-rose-500">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">كلمة المرور <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="12345678"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 font-mono focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
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
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 block">رقم الهوية الوطنية / الإقامة (اختياري)</label>
                  <input
                    type="text"
                    placeholder="10 أرقام"
                    value={newNationalId}
                    onChange={(e) => setNewNationalId(e.target.value)}
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
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-bold shadow-lg shadow-[#173A7C]/25 cursor-pointer transition-all border border-white/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <span>تأكيد وتسجيل الحساب ⚡</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATED CREDENTIALS MODAL */}
      <AnimatePresence>
        {createdCredentials && (
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
              className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xl relative text-right font-[family-name:var(--font-cairo)]"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">تم إنشاء الحساب بنجاح!</h3>
                  <p className="text-xs text-slate-500 font-bold">يمكن للمستخدم تسجيل الدخول فوراً عبر البيانات التالية</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs font-bold text-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">الاسم:</span>
                  <span className="text-slate-900 font-black">{createdCredentials.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">نوع الصلاحية:</span>
                  <span className="text-emerald-700 font-black">{createdCredentials.role || 'متدرب'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">البريد الإلكتروني:</span>
                  <span className="text-[#173A7C] font-mono">{createdCredentials.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">كلمة المرور:</span>
                  <span className="text-emerald-700 font-mono font-black">{createdCredentials.password}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500">رابط الدخول:</span>
                  <span className="text-slate-800 font-mono text-[11px]">/auth/login</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={handleCopyCredentials}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 hover:opacity-95 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'تم النسخ بنجاح!' : 'نسخ بيانات الدخول'}</span>
                </button>
                <button
                  onClick={() => setCreatedCredentials(null)}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {userToDelete && (
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
                  <h3 className="font-black text-lg text-slate-900">تأكيد حذف الحساب نهائياً</h3>
                  <p className="text-xs text-rose-600 font-bold">هذا الإجراء لا يمكن التراجع عنه</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-bold leading-relaxed">
                هل أنت متأكد من رغبتك في حذف حساب <strong className="text-slate-900">{userToDelete.name}</strong> ({userToDelete.email})؟ سيتم حذف بيانات الحساب بالكامل من النظام ومن قاعدة البيانات.
              </p>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={handleDeleteUser}
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
                  onClick={() => setUserToDelete(null)}
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

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-[#173A7C] rounded-full animate-spin" /></div>}>
      <AdminUsersPageContent />
    </Suspense>
  );
}
