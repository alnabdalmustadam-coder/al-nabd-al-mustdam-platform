'use client';

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Shield,
  Save,
  UserCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  Laptop,
  Globe,
  Trash2,
  Key,
} from 'lucide-react';
import { DefaultAvatar } from '@/components/student/default-avatar';

const sectionFadeVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.16,
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.12,
      delayChildren: custom * 0.16 + 0.08,
    },
  }),
};

const textItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function StudentProfilePage() {
  const [student, setStudent] = useState({
    fullName: 'عبدالله بن محمد الشمري',
    email: 'abdullah.alshammari@example.com',
    phone: '+966 50 123 4567',
    nationalId: '1098765432',
    role: 'متدرب ألمعي معتمد',
    joinedDate: 'يناير 2026',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);

  const [devices, setDevices] = useState([
    { id: '1', name: 'Windows PC (الكمبيوتر الحالي)', browser: 'Chrome 126', location: 'الرياض، المملكة العربية السعودية', active: true, date: 'الآن' },
    { id: '2', name: 'iPhone 15 Pro Max', browser: 'Safari Mobile', location: 'الرياض، المملكة العربية السعودية', active: false, date: 'منذ يومين' },
  ]);

  const handleSaveProfile = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.current || !passwords.newPass) return;
    setPassSuccess(true);
    setPasswords({ current: '', newPass: '', confirmPass: '' });
    setTimeout(() => setPassSuccess(false), 3000);
  };

  const handleRemoveDevice = (id: string) => {
    setDevices(devices.filter(d => d.id !== id));
  };

  const glassCard = {
    background: 'linear-gradient(145deg, rgba(255,255,255,0.72) 0%, rgba(248,250,252,0.55) 100%)',
    backdropFilter: 'blur(24px) saturate(1.8)',
    WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
    boxShadow: '0 8px 32px rgba(23, 58, 124, 0.06), 0 1px 0 rgba(255,255,255,0.8) inset',
  };

  const glassInput = {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
    boxShadow: 'inset 0 2.5px 6px rgba(15, 23, 42, 0.08), 0 1px 0 rgba(255, 255, 255, 0.9)',
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Profile Banner Ultra Premium - Light Glassmorphism matching Student Theme */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="relative z-20 rounded-3xl p-5 sm:p-6 border space-y-3.5 ultra-card-hover overflow-hidden student-card-accent"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(241,245,249,0.85) 100%)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08), 0 10px 28px rgba(15, 23, 42, 0.08)',
          border: '1px solid rgba(226, 232, 240, 0.6)',
        }}
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#173A7C]/8 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-5">
          <div className="flex items-center gap-3">
            <DefaultAvatar size="lg" />
            <div className="space-y-1 pr-2">
              <motion.div variants={textItemVariants} className="student-tag-badge bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{student.role}</span>
              </motion.div>
              <motion.h1 variants={textItemVariants} className="student-heading-h1">
                {student.fullName}
              </motion.h1>
              <motion.p variants={textItemVariants} className="text-xs text-slate-500 font-medium">
                عضو معتمد في معهد النبض المستدام العالي منذ {student.joinedDate}
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Profile Form Glassmorphism */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={1}
        className="relative overflow-hidden rounded-[24px] p-6 sm:p-7 border border-white/50 space-y-6 student-card-accent"
        style={glassCard}
      >
        <div className="flex items-center justify-between border-b border-slate-200/30 pb-4">
          <h3 className="student-heading-h3 flex items-center gap-2">
            <User className="w-4 h-4 text-[#173A7C]" />
            <span>البيانات الشخصية والأكاديمية</span>
          </h3>
          {savedSuccess && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              تم حفظ التغييرات بنجاح
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div className="space-y-2.5">
            <label className="text-slate-700 font-extrabold flex items-center gap-2 mb-1">
              <User className="w-3.5 h-3.5 text-[#173A7C]" />
              <span>الاسم الكامل باللغة العربية</span>
            </label>
            <input
              type="text"
              value={student.fullName}
              onChange={(e) => setStudent({ ...student, fullName: e.target.value })}
              className="w-full p-3.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#173A7C] focus:ring-4 focus:ring-[#173A7C]/15 transition-all"
              style={glassInput}
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-slate-700 font-extrabold flex items-center gap-2 mb-1">
              <Mail className="w-3.5 h-3.5 text-[#173A7C]" />
              <span>البريد الإلكتروني المعتمد</span>
            </label>
            <input
              type="email"
              value={student.email}
              onChange={(e) => setStudent({ ...student, email: e.target.value })}
              className="w-full p-3.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#173A7C] focus:ring-4 focus:ring-[#173A7C]/15 transition-all"
              style={glassInput}
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-slate-700 font-extrabold flex items-center gap-2 mb-1">
              <Phone className="w-3.5 h-3.5 text-[#173A7C]" />
              <span>رقم الجوال (المملكة العربية السعودية)</span>
            </label>
            <input
              type="text"
              value={student.phone}
              onChange={(e) => setStudent({ ...student, phone: e.target.value })}
              className="w-full p-3.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#173A7C] focus:ring-4 focus:ring-[#173A7C]/15 transition-all"
              style={glassInput}
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-slate-700 font-extrabold flex items-center gap-2 mb-1">
              <Shield className="w-3.5 h-3.5 text-[#173A7C]" />
              <span>رقم الهوية الوطنية / الإقامة</span>
            </label>
            <input
              type="text"
              value={student.nationalId}
              disabled
              className="w-full p-3.5 rounded-xl border border-slate-300/90 text-slate-700 font-extrabold cursor-not-allowed"
              style={{ background: '#F1F5F9', boxShadow: 'inset 0 2px 4px rgba(15,23,42,0.06)' }}
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSaveProfile}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-black text-xs flex items-center gap-2 transition-all duration-300 shadow-lg shadow-[#173A7C]/20 hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4" />
            <span>حفظ البيانات</span>
          </button>
        </div>
      </motion.div>

      {/* Security & Password Section */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={2}
        className="relative overflow-hidden rounded-[24px] p-6 sm:p-7 border border-white/50 space-y-5 student-card-accent"
        style={glassCard}
      >
        <div className="flex items-center justify-between border-b border-slate-200/30 pb-4">
          <h3 className="student-heading-h3 flex items-center gap-2">
            <Key className="w-4 h-4 text-[#173A7C]" />
            <span>تغيير كلمة المرور والأمان</span>
          </h3>
          {passSuccess && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60">
              <CheckCircle2 className="w-3.5 h-3.5" />
              تم تحديث كلمة المرور بنجاح
            </span>
          )}
        </div>

        <form onSubmit={handleSavePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-2">
            <label className="text-slate-700 font-bold block mb-1">كلمة المرور الحالية</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#173A7C] focus:ring-4 focus:ring-[#173A7C]/15 transition-all placeholder:text-slate-400"
              style={glassInput}
            />
          </div>
          <div className="space-y-2">
            <label className="text-slate-700 font-bold block mb-1">كلمة المرور الجديدة</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwords.newPass}
              onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#173A7C] focus:ring-4 focus:ring-[#173A7C]/15 transition-all placeholder:text-slate-400"
              style={glassInput}
            />
          </div>
          <div className="space-y-2">
            <label className="text-slate-700 font-bold block mb-1">تأكيد كلمة المرور</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwords.confirmPass}
              onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#173A7C] focus:ring-4 focus:ring-[#173A7C]/15 transition-all placeholder:text-slate-400"
              style={glassInput}
            />
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#173A7C] text-white font-black text-xs hover:bg-[#1E4D9D] transition-colors"
            >
              تحديث كلمة المرور
            </button>
          </div>
        </form>
      </motion.div>

      {/* Registered Devices Management */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={3}
        className="relative overflow-hidden rounded-[24px] p-6 sm:p-7 border border-white/50 space-y-4 student-card-accent"
        style={glassCard}
      >
        <h3 className="student-heading-h3 flex items-center gap-2 border-b border-slate-200/30 pb-3">
          <Laptop className="w-4 h-4 text-[#173A7C]" />
          <span>الأجهزة النشطة والمسجلة</span>
        </h3>

        <div className="space-y-3">
          {devices.map((device) => (
            <div key={device.id} className="p-4 rounded-xl flex items-center justify-between gap-4 text-xs font-bold border border-slate-200/40" style={glassInput}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#173A7C]/10 text-[#173A7C]">
                  {device.name.includes('iPhone') ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-slate-800">{device.name}</h4>
                    {device.active && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">الآن (نشط)</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{device.browser} • {device.location}</p>
                </div>
              </div>

              {!device.active && (
                <button
                  onClick={() => handleRemoveDevice(device.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="تسجيل الخروج"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
