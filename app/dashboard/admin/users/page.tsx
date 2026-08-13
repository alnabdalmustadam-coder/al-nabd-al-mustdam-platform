'use client';

import React, { useState } from 'react';
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
    const matchesSearch = u.name.includes(searchQuery) || u.email.includes(searchQuery) || u.phone.includes(searchQuery);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
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
              <Users className="w-4 h-4 text-[#173A7C]" />
              <span>إدارة المتدربين وسجلات الحضور</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              سجل الطلاب والمتدربين والأنشطة 👥
            </h1>
            <p className="text-xs text-slate-500 font-normal max-w-2xl leading-relaxed">
              متابعة حضور الطلاب، نسب التفاعل، تفعيل أو تعليق الحسابات، وتصدير التقارير الرسمية.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => alert('تم تصدير سجل المتدربين بصيغة Excel بنجاح!')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-2 border border-slate-200 shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>تصدير البيانات 📊</span>
            </button>
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#173A7C] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-semibold text-xs flex items-center gap-2 shadow-md cursor-pointer border border-white/20"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل متدرب جديد ⚡</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl" style={glassNeumorphicInset}>
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'الجميع' },
            { id: 'طالب', label: 'الطلاب والمتدربين' },
            { id: 'مدرب', label: 'المحاضرين' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${roleFilter === tab.id
                  ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md'
                  : 'bg-white/80 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم المتدرب، البريد، أو الجوال..."
            className="w-full py-2 pr-9 pl-4 text-xs font-medium text-slate-800 bg-white/80 rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl overflow-hidden border border-slate-200/80 ultra-card-hover" style={glassNeumorphicCard}>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">المتدرب / المستخدم</th>
                <th className="p-4">معلومات الاتصال</th>
                <th className="p-4">المساقات المسجلة</th>
                <th className="p-4">نسبة الحضور والتفاعل</th>
                <th className="p-4">آخر نشاط</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 font-bold text-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white font-black flex items-center justify-center shrink-0 text-sm shadow-md">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-sm">{user.name}</div>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-[#173A7C] font-black border border-blue-200">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{user.phone}</span>
                    </div>
                  </td>
                  <td className="p-4 font-black">
                    <span className="text-[#173A7C]">{user.enrolledCourses} مساق</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-mono font-black border border-emerald-200">
                      {user.attendanceRate}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-medium">
                    {user.lastActive}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black border cursor-pointer ${user.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                    >
                      {user.status === 'active' ? 'نشط 🟢' : 'معلق 🔴'}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedUserForLogs(user)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#173A7C] hover:text-white text-[#173A7C] font-black text-[11px] transition-colors cursor-pointer border border-slate-200"
                    >
                      سجل الأنشطة 📋
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER NEW USER MODAL */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white text-slate-900 rounded-[32px] border border-slate-200 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-black text-base text-slate-900">تسجيل متدرب جديد في النظام</h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs font-bold">
              <div>
                <label className="text-slate-700 block mb-1">الاسم الكامل للمتدرب</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد عبدالأمير العلي"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#173A7C]"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  placeholder="ahmed@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#173A7C]"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">رقم الجوال</label>
                <input
                  type="text"
                  placeholder="+966 50 000 0000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#173A7C]"
                />
              </div>

              <div className="pt-3 flex gap-3 border-t">
                <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700">
                  إلغاء
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#173A7C] text-white font-black">
                  تأكيد الإضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER LOGS MODAL */}
      {selectedUserForLogs && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white text-slate-900 rounded-[32px] border border-slate-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#173A7C]" />
                <h3 className="font-black text-sm text-slate-900">سجل أنشطة وحضور: {selectedUserForLogs.name}</h3>
              </div>
              <button onClick={() => setSelectedUserForLogs(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex justify-between font-bold text-blue-900">
                <span>نسبة الحضور الإجمالية:</span>
                <span className="font-black font-mono">{selectedUserForLogs.attendanceRate}</span>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-black text-slate-700">آخر الجلسات والدروس المسجلة:</h4>
                {[
                  { date: 'اليوم، 10:15 ص', action: 'حضور المحاضرة المباشرة: تطبيقات الحوار الإيجابي' },
                  { date: 'أمس، 04:30 م', action: 'إكمال الدرس الأول: مدخل إلى قيم التسامح' },
                  { date: '28 يوليو 2026', action: 'تسليم واجب الوحدة الثانية بنجاح (98/100)' },
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-800">{item.action}</div>
                      <div className="text-[10px] text-slate-400">{item.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button onClick={() => setSelectedUserForLogs(null)} className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 font-black text-xs">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
