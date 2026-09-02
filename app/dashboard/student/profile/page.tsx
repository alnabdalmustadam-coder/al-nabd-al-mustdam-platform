'use client';

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { User, Mail, Phone, Key, Shield, Laptop, Smartphone, Trash2, CheckCircle2, UserCheck, RefreshCw, Loader2, Save, AlertCircle, Camera, UploadCloud } from 'lucide-react';
import { DefaultAvatar } from '@/components/student/default-avatar';
import type { RegisteredDevice } from '@/components/student/device-limit-modal';
import { getDeviceInfo } from '@/utils/device';
import { createClient } from '@/utils/supabase/client';

// Client-side WebP converter to reduce storage footprint and maximize performance
async function convertImageToWebP(file: File, maxDimension = 600, quality = 0.82): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('WebP blob creation failed'));
              return;
            }
            const dataUrl = canvas.toDataURL('image/webp', quality);
            resolve({ blob, dataUrl });
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load source image'));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

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

  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('onboarding') === 'required') {
        setIsOnboarding(true);
      }
    }
  }, []);

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }

    try {
      setIsUploadingAvatar(true);

      // 1. Convert to optimized WebP
      const { blob, dataUrl } = await convertImageToWebP(file, 600, 0.82);

      // 2. Prepare FormData
      const formData = new FormData();
      const webpFile = new File([blob], `avatar_${Date.now()}.webp`, { type: 'image/webp' });
      formData.append('file', webpFile);

      // 3. Upload to single-avatar endpoint
      const res = await fetch('/api/profile/upload-avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      const finalUrl = data.success && data.avatarUrl ? data.avatarUrl : dataUrl;

      // 4. Update local state
      setStudent((prev) => ({ ...prev, avatarUrl: finalUrl }));

      // 5. Update local cache and dispatch sync events
      if (typeof window !== 'undefined') {
        localStorage.setItem('student_avatar', finalUrl);
        localStorage.setItem('student_name', student.fullName);
        window.dispatchEvent(
          new CustomEvent('student-profile-updated', {
            detail: { avatarUrl: finalUrl, fullName: student.fullName },
          })
        );
        window.dispatchEvent(
          new CustomEvent('profileUpdated', {
            detail: { avatarUrl: finalUrl, fullName: student.fullName },
          })
        );
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error uploading avatar:', err);
      alert('حدث خطأ أثناء معالجة ورفع الصورة');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    async function loadStudentProfile() {
      try {
        const cachedAvatar = typeof window !== 'undefined' ? localStorage.getItem('student_avatar') : null;
        const cachedName = typeof window !== 'undefined' ? localStorage.getItem('student_name') : null;

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const isGoogle =
            user.app_metadata?.provider === 'google' ||
            (Array.isArray(user.app_metadata?.providers) && user.app_metadata.providers.includes('google')) ||
            (Array.isArray(user.identities) && user.identities.some((id: any) => id.provider === 'google'));
          setIsGoogleUser(Boolean(isGoogle));

          const metaName = user.user_metadata?.full_name || user.user_metadata?.name || '';
          const metaAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
          const userEmail = user.email || '';

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          const activeEmail = profile?.email || userEmail;
          const finalAvatar = profile?.avatar_url || metaAvatar || cachedAvatar || null;
          const finalName = profile?.full_name || metaName || cachedName || userEmail.split('@')[0] || 'متدرب';

          // Sanitize phone: avoid placeholder strings like '+966 50 000 0000'
          const rawPhone = profile?.phone || user.user_metadata?.phone || '';
          const cleanPhone = (rawPhone && rawPhone !== '+966 50 000 0000' && rawPhone !== '0500000000') ? rawPhone : '';

          // Sanitize national ID: avoid placeholder strings like '10XXXXXXXX'
          const rawNationalId = profile?.national_id || user.user_metadata?.national_id || '';
          const cleanNationalId = (rawNationalId && rawNationalId !== '10XXXXXXXX') ? rawNationalId : '';

          setStudent({
            id: user.id,
            fullName: finalName,
            email: activeEmail,
            phone: cleanPhone,
            nationalId: cleanNationalId,
            role: profile?.role === 'ADMIN' ? 'مدير المنصة' : profile?.role === 'INSTRUCTOR' ? 'مدرب معتمد' : 'متدرب معتمد بالمنصة',
            joinedDate: user.created_at ? new Date(user.created_at).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' }) : 'يناير 2026',
            avatarUrl: finalAvatar,
          });

          if (!cleanPhone || !cleanNationalId) {
            setIsOnboarding(true);
          }

          if (finalAvatar && typeof window !== 'undefined') localStorage.setItem('student_avatar', finalAvatar);
          if (finalName && typeof window !== 'undefined') localStorage.setItem('student_name', finalName);

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

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setProfileError(null);
    setSavedSuccess(false);

    const trimmedPhone = (student.phone || '').trim();
    const trimmedNationalId = (student.nationalId || '').trim();

    if (!trimmedPhone) {
      setProfileError('يرجى إدخال رقم الجوال (مطلوب للتواصل وتوثيق حسابك).');
      return;
    }

    if (!trimmedNationalId) {
      setProfileError('يرجى إدخال رقم الهوية الوطنية أو الإقامة (مطلوب لإصدار الشهادات والاعتماد).');
      return;
    }

    if (trimmedNationalId && !/^[124]\d{9}$/.test(trimmedNationalId)) {
      setProfileError('رقم الهوية الوطنية أو الإقامة غير صحيح (يجب أن يتكون من 10 أرقام تبدأ بـ 1 أو 2).');
      return;
    }

    try {
      setIsSavingProfile(true);
      const supabase = createClient();
      if (student.id) {
        const { error: dbError } = await supabase
          .from('profiles')
          .update({
            full_name: student.fullName,
            phone: trimmedPhone,
            national_id: trimmedNationalId,
            nelc_eligible: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', student.id);

        if (dbError) {
          console.warn('Direct profile update note:', dbError);
        }

        // Call update-profile API to sync with GHL and auth user metadata
        try {
          await fetch('/api/auth/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName: student.fullName,
              phone: trimmedPhone,
              nationalId: trimmedNationalId,
            }),
          });
        } catch (apiErr) {
          console.warn('Update profile API sync note:', apiErr);
        }
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('student_phone', trimmedPhone);
        localStorage.setItem('student_national_id', trimmedNationalId);
        window.dispatchEvent(
          new CustomEvent('student-profile-updated', {
            detail: { phone: trimmedPhone, nationalId: trimmedNationalId, fullName: student.fullName },
          })
        );
      }

      setSavedSuccess(true);
      setIsOnboarding(false);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setProfileError(err?.message || 'حدث خطأ أثناء حفظ البيانات.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess(false);
    setPasswordError(null);

    // If user signed in with Google (OAuth): they have no current password. Direct update!
    if (isGoogleUser) {
      if (!passwords.newPass || !passwords.confirmPass) {
        setPasswordError('يرجى إدخال كلمة المرور الجديدة وتأكيدها.');
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

      try {
        setIsSavingPassword(true);
        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({
          password: passwords.newPass,
        });
        if (updateError) {
          throw new Error(updateError.message || 'تعذر تعيين كلمة المرور.');
        }

        setPassSuccess(true);
        setPasswords({ current: '', newPass: '', confirmPass: '' });
        setTimeout(() => setPassSuccess(false), 4000);
      } catch (error: any) {
        console.error('Error setting password for Google user:', error);
        setPasswordError(error?.message || 'تعذر تعيين كلمة المرور.');
      } finally {
        setIsSavingPassword(false);
      }
      return;
    }

    // Standard email/password user
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
        throw new Error('كلمة المرور الحالية غير صحيحة.');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwords.newPass,
      });
      if (updateError) {
        throw new Error(updateError.message || 'تعذر تحديث كلمة المرور.');
      }

      setPassSuccess(true);
      setPasswords({ current: '', newPass: '', confirmPass: '' });
      setTimeout(() => setPassSuccess(false), 4000);
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
      {/* ── 0. ONBOARDING MANDATORY NOTICE BANNER (GOOGLE / INCOMPLETE PROFILES) ── */}
      {(!student.phone || !student.nationalId || isOnboarding) && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-amber-950">
                مطلوب استكمال بياناتك الأساسية (رقم الجوال ورقم الهوية الوطنية / الإقامة)
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed font-bold">
                يرجى إدخال رقم الجوال ورقم الهوية الوطنية أو الإقامة ثم الضغط على "حفظ البيانات" لاعتماد حسابك رسمياً، وتسهيل التسجيل في الدورات وإصدار الشهادات المعتمدة باسمك.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('student-phone-input');
              el?.focus();
            }}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            إكمال البيانات الآن
          </button>
        </motion.div>
      )}

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

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-center gap-5 sm:gap-6">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleAvatarFileSelect}
            />

            {/* Large Interactive Avatar Container Matching Card Height */}
            <div className="relative shrink-0 group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden shadow-xl ring-4 ring-[#173A7C]/20 border-2 border-white bg-gradient-to-br from-[#173A7C] via-[#1E4D9D] to-[#2563EB] flex items-center justify-center relative transition-transform duration-300 group-hover:scale-[1.02]">
                {student.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={student.avatarUrl}
                    alt={student.fullName}
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={() => setStudent((prev) => ({ ...prev, avatarUrl: null }))}
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
                    {student.fullName ? student.fullName.charAt(0) : 'م'}
                  </span>
                )}

                {/* Uploading Overlay Spinner */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
                    <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
                    <span className="text-[10px] font-black mt-1">جاري الحفظ...</span>
                  </div>
                )}

                {/* Hover Trigger */}
                <button
                  type="button"
                  disabled={isUploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-900/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer z-10"
                  title="انقر لتغيير الصورة الشخصية"
                >
                  <Camera className="w-6 h-6 text-white drop-shadow-md" />
                  <span className="text-[11px] font-black mt-1">تغيير الصورة</span>
                </button>
              </div>

              {/* Status Online indicator */}
              <span className="absolute -bottom-1 -left-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 border-2 sm:border-3 border-white shadow-xs animate-pulse" />
            </div>

            <div className="space-y-2 pr-1 flex flex-col justify-center">
              <motion.div variants={textItemVariants} className="student-tag-badge bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs self-start">
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

          <button
            type="button"
            disabled={isUploadingAvatar}
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-[#173A7C] font-black text-xs flex items-center gap-2 border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition-all shrink-0 self-start md:self-center"
          >
            {isUploadingAvatar ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#173A7C]" />
            ) : (
              <Camera className="w-4 h-4 text-[#173A7C]" />
            )}
            <span>{isUploadingAvatar ? 'جاري التحويل والرفع...' : 'تغيير الصورة الشخصية'}</span>
          </button>
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

        <form onSubmit={handleSaveProfile} className="space-y-5">
          {profileError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="space-y-2.5">
              <label className="text-slate-700 font-extrabold flex items-center gap-2 mb-1">
                <User className="w-3.5 h-3.5 text-[#173A7C]" />
                <span>الاسم الكامل باللغة العربية *</span>
              </label>
              <input
                type="text"
                required
                value={student.fullName}
                onChange={(e) => setStudent({ ...student, fullName: e.target.value })}
                placeholder="الاسم الثلاثي أو الرباعي..."
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
                disabled
                value={student.email}
                className="w-full p-3.5 rounded-xl border border-slate-300/80 text-slate-500 font-bold bg-slate-100/80 cursor-not-allowed text-right"
                dir="rtl"
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-700 font-extrabold flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#173A7C]" />
                  <span>رقم الجوال (المملكة العربية السعودية) *</span>
                </label>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  إجباري
                </span>
              </div>
              <input
                id="student-phone-input"
                type="tel"
                required
                value={student.phone}
                onChange={(e) => setStudent({ ...student, phone: e.target.value })}
                placeholder="05XXXXXXXX"
                className="w-full p-3.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#173A7C] focus:ring-4 focus:ring-[#173A7C]/15 transition-all text-right"
                dir="rtl"
                style={glassInput}
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-700 font-extrabold flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-[#173A7C]" />
                  <span>رقم الهوية الوطنية / الإقامة *</span>
                </label>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  إجباري للشهادات
                </span>
              </div>
              <input
                type="text"
                required
                value={student.nationalId}
                onChange={(e) => setStudent({ ...student, nationalId: e.target.value })}
                placeholder="أدخل رقم الهوية أو الإقامة (10 أرقام تبدأ بـ 1 أو 2)..."
                className="w-full p-3.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#173A7C] focus:ring-4 focus:ring-[#173A7C]/15 transition-all text-right"
                dir="rtl"
                style={glassInput}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-black text-xs flex items-center gap-2 transition-all duration-300 shadow-lg shadow-[#173A7C]/20 hover:-translate-y-0.5 cursor-pointer disabled:opacity-60"
            >
              {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSavingProfile ? 'جاري الحفظ...' : 'حفظ البيانات'}</span>
            </button>
          </div>
        </form>
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
            <span>{isGoogleUser ? 'تعيين كلمة المرور والأمان' : 'تغيير كلمة المرور والأمان'}</span>
          </h3>
          {passSuccess && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isGoogleUser ? 'تم تعيين كلمة المرور بنجاح لحسابك' : 'تم تحديث كلمة المرور بنجاح'}
            </span>
          )}
        </div>

        <form onSubmit={handleSavePassword} className={`grid grid-cols-1 ${isGoogleUser ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-4 text-xs`}>
          {isGoogleUser && (
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200 text-[#173A7C] text-xs font-bold flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-blue-200 flex items-center justify-center font-black text-[#173A7C] shadow-xs shrink-0">
                G
              </div>
              <div>
                <h4 className="font-black text-slate-900">حسابك مسجل عبر Google</h4>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  لا تحتاج إلى إدخال كلمة مرور حالية. يمكنك إنشاء وتعيين كلمة مرور جديدة لحسابك مباشرة لتسجيل الدخول مستقبلاً بكلمة المرور أو عبر Google.
                </p>
              </div>
            </div>
          )}

          {passwordError && (
            <div className={`${isGoogleUser ? 'sm:col-span-2' : 'sm:col-span-3'} flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700`} role="alert">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {!isGoogleUser && (
            <div className="space-y-2">
              <label className="text-slate-700 font-bold block mb-1">كلمة المرور الحالية *</label>
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="w-full p-3.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#173A7C] focus:ring-4 focus:ring-[#173A7C]/15 transition-all placeholder:text-slate-400 text-right"
                dir="rtl"
                style={glassInput}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-slate-700 font-bold block mb-1">كلمة المرور الجديدة *</label>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={8}
              required
              value={passwords.newPass}
              onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
              className="w-full p-3.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#173A7C] focus:ring-4 focus:ring-[#173A7C]/15 transition-all placeholder:text-slate-400 text-right"
              dir="rtl"
              style={glassInput}
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-700 font-bold block mb-1">تأكيد كلمة المرور الجديدة *</label>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={8}
              required
              value={passwords.confirmPass}
              onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
              className="w-full p-3.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#173A7C] focus:ring-4 focus:ring-[#173A7C]/15 transition-all placeholder:text-slate-400 text-right"
              dir="rtl"
              style={glassInput}
            />
          </div>

          <div className={`${isGoogleUser ? 'sm:col-span-2' : 'sm:col-span-3'} flex justify-end pt-2`}>
            <button
              type="submit"
              disabled={isSavingPassword}
              className="px-6 py-2.5 rounded-xl bg-[#173A7C] text-white font-black text-xs hover:bg-[#1E4D9D] transition-colors disabled:cursor-wait disabled:opacity-70 inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              {isSavingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isSavingPassword ? 'جاري الحفظ...' : isGoogleUser ? 'تعيين كلمة المرور لحسابك' : 'تحديث كلمة المرور'}</span>
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
