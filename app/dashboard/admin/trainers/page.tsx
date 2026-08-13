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

  const trainers: Trainer[] = [
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
  ];

  const filteredTrainers = trainers.filter((t) => {
    const matchesSearch = t.name.includes(searchTerm) || t.specialty.includes(searchTerm) || t.email.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' ? true : t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const glassCard = {
    background: 'linear-gradient(145deg, rgba(255,255,255,0.75) 0%, rgba(248,250,252,0.6) 100%)',
    backdropFilter: 'blur(24px) saturate(1.8)',
    WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
    boxShadow: '0 10px 40px rgba(23, 58, 124, 0.06), 0 1px 0 rgba(255,255,255,0.9) inset',
    border: '1px solid rgba(255, 255, 255, 0.6)',
  };

  const glassInner = {
    background: 'rgba(248,250,252,0.55)',
    backdropFilter: 'blur(10px)',
  };

  return (
    <div className="space-y-6" dir="rtl">

      {/* Header Banner - Ultra Premium Glass style matching Main Dashboard */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 animate-fade-in-up ultra-card-hover" style={glassCard}>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 pr-2 border-r-4 border-[#173A7C]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-[#173A7C] bg-blue-50 border border-blue-200">
              <UserCheck className="w-3.5 h-3.5" />
              <span>إدارة الهيئة التدريبية والأكاديمية</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">المدربين والمحاضرين المعنيين</h1>
            <p className="text-xs text-slate-500 font-normal max-w-xl leading-relaxed">
              إدارة صلاحيات المحاضرين، متابعة التقييمات والأداء الأكاديمي، وتعيين الدورات والبث المباشر.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#173A7C] text-white font-semibold text-xs flex items-center gap-2 shadow-md hover:-translate-y-0.5 shrink-0 cursor-pointer border border-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مدرب جديد</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute top-3.5 right-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="بحث باسم المدرب، التخصص، البريد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl text-xs font-bold text-slate-800 border border-slate-200/60 focus:outline-none focus:border-[#173A7C]"
            style={glassInner}
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 p-1 rounded-2xl border border-white/60 w-full sm:w-auto" style={glassCard}>
          {[
            { key: 'all', label: 'الكل (4)' },
            { key: 'active', label: 'نشط (3)' },
            { key: 'on_leave', label: 'إجازة (1)' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${statusFilter === tab.key
                  ? 'bg-[#173A7C] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTrainers.map((trainer) => (
          <motion.div
            key={trainer.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl p-6 border border-white/60 space-y-4"
            style={glassCard}
          >
            {/* Header / Avatar */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white flex items-center justify-center font-black text-base shadow-md">
                  {trainer.avatarInitials}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">{trainer.name}</h3>
                  <p className="text-xs text-[#5CB07C] font-extrabold">{trainer.specialty}</p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-[10px] font-black ${trainer.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                {trainer.status === 'active' ? 'نشط' : 'إجازة'}
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl text-center" style={glassInner}>
              <div>
                <span className="block text-[10px] text-slate-400 font-extrabold">الدورات</span>
                <span className="text-xs font-black text-slate-800">{trainer.coursesCount} دورة</span>
              </div>
              <div className="border-r border-l border-slate-200/50">
                <span className="block text-[10px] text-slate-400 font-extrabold">المتدربين</span>
                <span className="text-xs font-black text-slate-800">{trainer.studentsCount} طالب</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-extrabold">التقييم العام</span>
                <span className="text-xs font-black text-amber-600 flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {trainer.rating}
                </span>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-1.5 text-xs text-slate-600 font-bold border-t border-slate-200/40 pt-3">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#173A7C]" />
                <span>{trainer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#173A7C]" />
                <span>{trainer.phone}</span>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-2">
              <button className="px-4 py-2 rounded-xl text-xs font-black border border-slate-200 hover:bg-slate-50 text-slate-700">
                تعديل الصلاحيات
              </button>
              <button className="px-4 py-2 rounded-xl text-xs font-black bg-[#173A7C] text-white hover:bg-[#1E4D9D]">
                عرض الملف الكامل
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Trainer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl p-6 bg-white shadow-2xl space-y-4 text-right">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-slate-800 text-base">إضافة مدرب جديد للنظام</h3>
              <button onClick={() => setShowAddModal(null as any)} className="text-slate-400">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">اسم المدرب ثلاثي</label>
                <input type="text" placeholder="د. أحمد الفضلي" className="w-full p-2.5 rounded-xl border mt-1" />
              </div>
              <div>
                <label className="font-bold text-slate-700">التخصص / المسار التدريبي</label>
                <input type="text" placeholder="خبير التسامح والحوار" className="w-full p-2.5 rounded-xl border mt-1" />
              </div>
              <div>
                <label className="font-bold text-slate-700">البريد الإلكتروني الرسمى</label>
                <input type="email" placeholder="trainer@sustainpulse.org" className="w-full p-2.5 rounded-xl border mt-1" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600">إلغاء</button>
              <button onClick={() => { alert('تم إضافة المدرب بنجاح!'); setShowAddModal(false); }} className="px-5 py-2 rounded-xl bg-[#173A7C] text-white text-xs font-black">
                إضافة وحفظ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
