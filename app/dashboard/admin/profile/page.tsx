'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  Crown,
  Camera,
  Save,
  CheckCircle2,
  Lock,
  Loader2,
  Sparkles,
  Award,
  Key,
  Calendar,
  AlertCircle,
  Building,
} from 'lucide-react';
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

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [adminData, setAdminData] = useState({
    id: '',
    fullName: 'سعود القحطاني',
    email: 'admin@sustainpulse.org',
    phone: '+966 50 123 4567',
    bio: 'المدير التنفيذي والمشرف العام على المنصة الأكاديمية ونظم التدريب وتراخيص المركز الوطني للتعليم الإلكتروني.',
    roleTitle: 'مدير المنصة الرئيسي (Super Admin)',
    department: 'الإدارة العليا والشؤون الأكاديمية',
    avatarUrl: null as string | null,
    joinedDate: 'يناير 2026',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAdminProfile() {
      try {
        setLoading(true);
        const cachedAvatar = typeof window !== 'undefined' ? localStorage.getItem('admin_avatar') : null;
        const cachedName = typeof window !== 'undefined' ? localStorage.getItem('admin_name') : null;

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const metaName = user.user_metadata?.full_name || user.user_metadata?.name;
          const metaAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
          const userEmail = user.email || '';

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          const resolvedAvatar = profile?.avatar_url || metaAvatar || cachedAvatar || null;
          const resolvedName = profile?.full_name || metaName || cachedName || 'سعود القحطاني';

          setAdminData({
            id: user.id,
            fullName: resolvedName,
            email: profile?.email || userEmail || 'admin@sustainpulse.org',
            phone: profile?.phone || user.user_metadata?.phone || '+966 50 123 4567',
            bio: profile?.bio || 'المدير التنفيذي والمشرف العام على المنصة الأكاديمية ونظم التدريب وتراخيص المركز الوطني للتعليم الإلكتروني.',
            roleTitle: 'مدير المنصة الرئيسي (Super Admin)',
            department: 'الإدارة العليا والشؤون الأكاديمية',
            avatarUrl: resolvedAvatar,
            joinedDate: user.created_at ? new Date(user.created_at).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' }) : 'يناير 2026',
          });

          if (resolvedAvatar && typeof window !== 'undefined') localStorage.setItem('admin_avatar', resolvedAvatar);
          if (resolvedName && typeof window !== 'undefined') localStorage.setItem('admin_name', resolvedName);
        }
      } catch (err) {
        console.error('Error loading admin profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminProfile();
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

      // 1. Convert to compressed WebP
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
      setAdminData((prev) => ({ ...prev, avatarUrl: finalUrl }));

      // 5. Update local cache and dispatch sync events
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_avatar', finalUrl);
        localStorage.setItem('admin_name', adminData.fullName);
        window.dispatchEvent(
          new CustomEvent('admin-profile-updated', {
            detail: { avatarUrl: finalUrl, fullName: adminData.fullName },
          })
        );
        window.dispatchEvent(
          new CustomEvent('profileUpdated', {
            detail: { avatarUrl: finalUrl, fullName: adminData.fullName },
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: adminData.fullName,
            phone: adminData.phone,
            bio: adminData.bio,
            avatar_url: adminData.avatarUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) {
          console.error(error);
          alert('حدث خطأ أثناء حفظ الملف الشخصي.');
          return;
        }

        if (typeof window !== 'undefined') {
          if (adminData.avatarUrl) localStorage.setItem('admin_avatar', adminData.avatarUrl);
          if (adminData.fullName) localStorage.setItem('admin_name', adminData.fullName);
          window.dispatchEvent(
            new CustomEvent('admin-profile-updated', {
              detail: { avatarUrl: adminData.avatarUrl, fullName: adminData.fullName },
            })
          );
          window.dispatchEvent(
            new CustomEvent('profileUpdated', {
              detail: { avatarUrl: adminData.avatarUrl, fullName: adminData.fullName },
            })
          );
        }

        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
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
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError(error instanceof Error ? error.message : 'تعذر تحديث كلمة المرور.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const glassCard = {
    background: 'linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.85) 100%)',
    backdropFilter: 'blur(24px) saturate(1.8)',
    WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
    boxShadow: '0 8px 32px rgba(23, 58, 124, 0.06), 0 1px 0 rgba(255,255,255,0.9) inset',
  };

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleAvatarFileSelect}
      />

      {/* Hero Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 liquid-glass-hero border border-white/80 student-card-accent"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Prominent Admin Avatar Container with Camera Overlay */}
            <div className="relative shrink-0 group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden shadow-xl ring-4 ring-[#173A7C]/20 border-2 border-white bg-gradient-to-br from-[#173A7C] via-[#1E4D9D] to-[#0F2D69] flex items-center justify-center relative transition-transform duration-300 group-hover:scale-[1.02]">
                {adminData.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={adminData.avatarUrl}
                    alt={adminData.fullName}
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={() => setAdminData((prev) => ({ ...prev, avatarUrl: null }))}
                  />
                ) : (
                  <Crown className="w-12 h-12 text-amber-300 drop-shadow-md" />
                )}

                {/* Uploading Spinner */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                    <span className="text-[10px] font-black mt-1">جاري الحفظ...</span>
                  </div>
                )}

                {/* Hover Trigger Button */}
                <button
                  type="button"
                  disabled={isUploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-900/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer z-10"
                  title="تغيير صورة المدير"
                >
                  <Camera className="w-6 h-6 text-white drop-shadow-md" />
                  <span className="text-[10px] font-black mt-1">تغيير الصورة</span>
                </button>
              </div>

              {/* Online Dot */}
              <span className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <div className="admin-hero-tag bg-amber-50 text-amber-800 border border-amber-200">
                <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{adminData.roleTitle}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{adminData.fullName}</span>
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-bold">
                مشرف النظام والمنصة الأكاديمية منذ {adminData.joinedDate}
              </p>
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
            <span>{isUploadingAvatar ? 'جاري التحويل والرفع...' : 'تغيير صورة المدير'}</span>
          </button>
        </div>
      </motion.div>

      {/* Success Alert */}
      <AnimatePresence>
        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-xs flex items-center gap-2 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>تم حفظ وتحديث بيانات وصورة المدير بنجاح عبر النظام!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Form (2 Cols) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2 p-6 sm:p-7 rounded-3xl border border-white/60 space-y-6"
          style={glassCard}
        >
          <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-[#173A7C]" />
              <span>البيانات الرسمية والإدارية</span>
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5 text-xs font-bold">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <label className="text-slate-700 font-extrabold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#173A7C]" />
                  <span>الاسم الكامل</span>
                </label>
                <input
                  type="text"
                  value={adminData.fullName}
                  onChange={(e) => setAdminData({ ...adminData, fullName: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#173A7C] focus:ring-4 focus:ring-[#173A7C]/15 transition-all bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-700 font-extrabold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#173A7C]" />
                  <span>البريد الإلكتروني الإداري</span>
                </label>
                <input
                  type="email"
                  value={adminData.email}
                  disabled
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-slate-500 font-bold bg-slate-100/80 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-700 font-extrabold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#173A7C]" />
                  <span>رقم الهاتف المعتمد</span>
                </label>
                <input
                  type="tel"
                  value={adminData.phone}
                  onChange={(e) => setAdminData({ ...adminData, phone: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#173A7C] focus:ring-4 focus:ring-[#173A7C]/15 transition-all bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-700 font-extrabold flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#173A7C]" />
                  <span>القسم / الإدارة</span>
                </label>
                <input
                  type="text"
                  value={adminData.department}
                  disabled
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-slate-500 font-bold bg-slate-100/80 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-700 font-extrabold flex items-center gap-1.5">
                <span>نبذة تعريفية للمسؤول</span>
              </label>
              <textarea
                rows={3}
                value={adminData.bio}
                onChange={(e) => setAdminData({ ...adminData, bio: e.target.value })}
                className="w-full p-3.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#173A7C] focus:ring-4 focus:ring-[#173A7C]/15 transition-all bg-white"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-[#173A7C]/25 cursor-pointer transition-all disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'جاري الحفظ...' : 'حفظ بيانات المدير'}</span>
              </button>
            </div>
          </form>
        </motion.div>

        {/* Security & Password Card (1 Col) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-6 sm:p-7 rounded-3xl border border-white/60 space-y-6"
          style={glassCard}
        >
          <div className="border-b border-slate-200/50 pb-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#173A7C]" />
              <span>الأمان وكلمة المرور</span>
            </h3>
          </div>

          <form onSubmit={handleSavePassword} className="space-y-4 text-xs font-bold">
            {passwordError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>تم تحديث كلمة المرور بنجاح!</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-slate-700 font-extrabold">كلمة المرور الحالية</label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                placeholder="••••••••"
                className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#173A7C] bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-700 font-extrabold">كلمة المرور الجديدة</label>
              <input
                type="password"
                value={passwords.newPass}
                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                placeholder="8 أحرف على الأقل"
                className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#173A7C] bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-700 font-extrabold">تأكيد كلمة المرور الجديدة</label>
              <input
                type="password"
                value={passwords.confirmPass}
                onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                placeholder="••••••••"
                className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#173A7C] bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingPassword}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
            >
              {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              <span>{isSavingPassword ? 'جاري التحديث...' : 'تغيير كلمة المرور'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
