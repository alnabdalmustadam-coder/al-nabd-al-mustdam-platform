'use client';

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { User, Mail, Phone, Key, Shield, Laptop, Smartphone, Trash2, CheckCircle2, UserCheck, RefreshCw, Loader2, Save, AlertCircle } from 'lucide-react';
import { DefaultAvatar } from '@/components/student/default-avatar';
import type { RegisteredDevice } from '@/components/student/device-limit-modal';
import { getDeviceInfo } from '@/utils/device';
import { createClient } from '@/utils/supabase/client';

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
    id: '',
    fullName: '',
    email: '',
    phone: '',
    nationalId: '',
    role: 'متدرب معتمد بالمنصة',
    joinedDate: 'يناير 2026',
    avatarUrl: null as string | null,
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStudentProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const metaName = user.user_metadata?.full_name || user.user_metadata?.name || '';
          const metaAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
          const userEmail = user.email || '';

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          const activeEmail = profile?.email || userEmail;

          setStudent({
            id: user.id,
            fullName: profile?.full_name || metaName || userEmail.split('@')[0] || 'متدرب',
            email: activeEmail,
            phone: profile?.phone || user.user_metadata?.phone || '+966 50 000 0000',
            nationalId: profile?.national_id || user.user_metadata?.national_id || '10XXXXXXXX',
            role: profile?.role === 'ADMIN' ? 'مدير المنصة' : profile?.role === 'INSTRUCTOR' ? 'مدرب معتمد' : 'متدرب معتمد بالمنصة',
            joinedDate: user.created_at ? new Date(user.created_at).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' }) : 'يناير 2026',
            avatarUrl: profile?.avatar_url || metaAvatar || null,
          });

          loadDevices(activeEmail);
        } else {
          loadDevices();
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        loadDevices();
      } finally {
        setIsLoading(false);
      }
    }

    loadStudentProfile();
  }, []);

  const [devices, setDevices] = useState<RegisteredDevice[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState('');
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [deletingDeviceId, setDeletingDeviceId] = useState<string | null>(null);

  const loadDevices = async (overrideEmail?: string) => {
    try {
      setLoadingDevices(true);
      const devInfo = getDeviceInfo();
      setCurrentDeviceId(devInfo.deviceId);

      const targetEmail = overrideEmail || student.email;

      // 1. Send heartbeat / register current device first
      const postRes = await fetch('/api/auth/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...devInfo,
          email: targetEmail,
        }),
      });

      const postData = await postRes.json();
      if (postData.success && Array.isArray(postData.devices)) {
        setDevices(postData.devices);
        return;
      }

      // 2. Fallback to GET
      const queryParam = targetEmail ? `?email=${encodeURIComponent(targetEmail)}` : '';
      const getRes = await fetch(`/api/auth/devices${queryParam}`);
      const getData = await getRes.json();
      if (getData.success && Array.isArray(getData.devices)) {
        setDevices(getData.devices);
      }
    } catch (err) {
      console.error('Error loading devices:', err);
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const supabase = createClient();
      if (student.id) {
        await supabase
          .from('profiles')
          .update({
            full_name: student.fullName,
            phone: student.phone,
          })
          .eq('id', student.id);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess(false);
    setPasswordError(null);

    if (!passwords.current || !passwords.newPass || !passwords.confirmPass) {
      setPasswordError('يرجى إدخال كلمة المرور الحالية والجديدة وتأكيدها.');
      return;
    }
    if (passwords.newPass.length < 8) {
      setPasswordError('كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف.');
      return;
    }
    if (passwords.newPass !== passwords.confirmPass) {
      setPasswordError('كلمة المرور الجديدة وتأكيدها غير متطابقين.');
      return;
    }
    if (passwords.current === passwords.newPass) {
      setPasswordError('كلمة المرور الجديدة يجب أن تختلف عن كلمة المرور الحالية.');
      return;
    }

    try {
      setIsSavingPassword(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user?.email) {
        throw new Error('تعذر التحقق من حساب المستخدم الحالي.');
      }

      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwords.current,
      });
      if (reauthError) {
        throw new Error('كلمة المرور الحالية غير صحيحة، أو أن الحساب مسجل عبر مزود دخول خارجي.');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwords.newPass,
      });
      if (updateError) {
        throw new Error(updateError.message || 'تعذر تحديث كلمة المرور.');
      }

      setPassSuccess(true);
      setPasswords({ current: '', newPass: '', confirmPass: '' });
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError(error instanceof Error ? error.message : 'تعذر تحديث كلمة المرور.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleRemoveDevice = async (targetDevId: string) => {
    try {
      setDeletingDeviceId(targetDevId);
      const res = await fetch('/api/auth/devices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: targetDevId, email: student.email }),
      });
      if (res.ok) {
        await loadDevices();
      }
    } catch (err) {
      console.error('Error removing device:', err);
    } finally {
      setDeletingDeviceId(null);
    }
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
            <DefaultAvatar
              src={student.avatarUrl}
              name={student.fullName}
              size="lg"
            />
            <div className="space-y-1 pr-2">
              <motion.div variants={textItemVariants} className="student-tag-badge bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{student.role}</span>
              </motion.div>
              <motion.h1 variants={textItemVariants} className="student-heading-h1 text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {student.fullName || (isLoading ? 'جاري التحميل...' : 'المتدرب')}
              </motion.h1>
              <motion.p variants={textItemVariants} className="text-xs sm:text-sm text-slate-500 font-bold">
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
          {passwordError && (
            <div className="sm:col-span-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-slate-700 font-bold block mb-1">كلمة المرور الحالية</label>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
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
              autoComplete="new-password"
              minLength={8}
              required
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
              autoComplete="new-password"
              minLength={8}
              required
              value={passwords.confirmPass}
              onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#173A7C] focus:ring-4 focus:ring-[#173A7C]/15 transition-all placeholder:text-slate-400"
              style={glassInput}
            />
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingPassword}
              className="px-6 py-2.5 rounded-xl bg-[#173A7C] text-white font-black text-xs hover:bg-[#1E4D9D] transition-colors disabled:cursor-wait disabled:opacity-70 inline-flex items-center gap-2"
            >
              {isSavingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isSavingPassword ? 'جاري التحقق والتحديث...' : 'تحديث كلمة المرور'}</span>
            </button>
          </div>
        </form>
      </motion.div>

      {/* Registered Devices Management (2-Device Policy) */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={3}
        className="relative overflow-hidden rounded-[24px] p-6 sm:p-7 border border-white/50 space-y-4 student-card-accent"
        style={glassCard}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/30 pb-3">
          <h3 className="student-heading-h3 flex items-center gap-2">
            <Laptop className="w-4 h-4 text-[#173A7C]" />
            <span>الأجهزة النشطة والمسجلة</span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-[#173A7C] border border-blue-200/70">
              الأجهزة المسجلة: {devices.length} من 2 (الحد الأقصى)
            </span>
            <button
              onClick={() => loadDevices()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#173A7C] hover:bg-slate-100 transition-colors"
              title="تحديث قائمة الأجهزة"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDevices ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {loadingDevices && devices.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#173A7C]" />
              <span>جاري مزامنة بيانات الأجهزة المسجلة...</span>
            </div>
          ) : devices.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 text-center text-xs font-bold text-slate-500">
              لا توجد أجهزة مسجلة حالياً، جاري تسجيل جهازك الحالي تلقائياً...
            </div>
          ) : (
            <>
              {devices.map((device, idx) => {
                const isCurrent = device.device_id === currentDeviceId;
                const isMobile = device.device_name?.includes('iPhone') || device.device_name?.includes('هاتف') || device.device_type === 'mobile';

                return (
                  <div
                    key={device.device_id || device.id || idx}
                    className="p-4 rounded-xl flex items-center justify-between gap-4 text-xs font-bold border border-slate-200/40 hover:border-slate-300 transition-all bg-white/70"
                    style={glassInput}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-xl ${isCurrent ? 'bg-[#173A7C] text-white shadow-xs' : 'bg-slate-200/70 text-slate-700'}`}>
                        {isMobile ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-slate-800 truncate">
                            {device.device_name || 'كمبيوتر شخصي (PC)'}
                          </h4>
                          {isCurrent ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              (الجهاز الحالي) نشط الآن
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              مسجل
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                          {device.browser || 'متصفح ويب'} • {device.os || 'نظام تشغيل'} • {device.location || 'المملكة العربية السعودية'}
                        </p>
                      </div>
                    </div>

                    {!isCurrent && (
                      <button
                        onClick={() => handleRemoveDevice(device.device_id)}
                        disabled={deletingDeviceId === device.device_id}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                        title="إلغاء ربط هذا الجهاز"
                      >
                        {deletingDeviceId === device.device_id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}

              {devices.length === 1 && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs font-bold text-blue-900 flex items-center justify-between gap-2">
                  <span>💡 لديك مقعد متبقي: يمكنك تسجيل الدخول من جهاز آخر إضافي (مثال: هاتفك الجوال).</span>
                  <span className="text-[11px] font-black px-2 py-0.5 bg-blue-100 rounded-md">متاح 1 من 2</span>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
