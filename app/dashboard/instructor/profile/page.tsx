'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Save,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Loader2,
  UploadCloud,
} from 'lucide-react';
import { DefaultAvatar } from '@/components/student/default-avatar';
import { createClient } from '@/utils/supabase/client';

export default function InstructorProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    specialty: 'مدرب ومحاضر معتمد',
    nationalId: '',
    avatarUrl: null as string | null,
  });

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Convert image to WebP with compression ──
  const convertImageToWebP = (file: File): Promise<{ blob: Blob; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        const MAX_DIM = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const dataUrl = canvas.toDataURL('image/webp', 0.82);
              resolve({ blob, dataUrl });
            } else {
              reject(new Error('WebP conversion failed'));
            }
          },
          'image/webp',
          0.82
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image for conversion'));
      };
    });
  };

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      // 1. Convert to compressed WebP
      const { blob, dataUrl } = await convertImageToWebP(file);

      // 2. Prepare WebP File object for upload
      const webpFile = new File([blob], `avatar_${Date.now()}.webp`, { type: 'image/webp' });

      // 3. Upload to server using unified single-avatar endpoint
      const formData = new FormData();
      formData.append('file', webpFile);

      const res = await fetch('/api/profile/upload-avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      const finalUrl = data.success && data.avatarUrl ? data.avatarUrl : dataUrl;

      // 4. Update local state
      setProfileData((prev) => ({ ...prev, avatarUrl: finalUrl }));

      // 5. Direct DB update
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({
            avatar_url: finalUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        await supabase.auth.updateUser({
          data: { avatar_url: finalUrl },
        });
      }

      // 6. Instant UI event dispatch for sidebar & header
      if (typeof window !== 'undefined') {
        localStorage.setItem('instructor_avatar', finalUrl);
        localStorage.setItem('instructor_name', profileData.fullName);
        window.dispatchEvent(
          new CustomEvent('instructor-profile-updated', {
            detail: { avatarUrl: finalUrl, fullName: profileData.fullName },
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
    async function loadProfile() {
      try {
        setLoading(true);
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

          const resolvedAvatar = profile?.avatar_url || metaAvatar || (typeof window !== 'undefined' ? localStorage.getItem('instructor_avatar') : null);
          const resolvedName = profile?.full_name || metaName || (typeof window !== 'undefined' ? localStorage.getItem('instructor_name') : null) || 'المدرب المعتمد';

          setProfileData({
            fullName: resolvedName,
            email: profile?.email || userEmail,
            phone: profile?.phone || '',
            bio: profile?.bio || 'خبير ومحاضر أكاديمي في برامج التنمية الإدارية والمواطنة والتسامح.',
            specialty: 'مدرب ومحاضر معتمد',
            nationalId: profile?.national_id || '',
            avatarUrl: resolvedAvatar,
          });

          if (resolvedAvatar && typeof window !== 'undefined') localStorage.setItem('instructor_avatar', resolvedAvatar);
          if (resolvedName && typeof window !== 'undefined') localStorage.setItem('instructor_name', resolvedName);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: profileData.fullName,
            phone: profileData.phone,
            bio: profileData.bio,
            national_id: profileData.nationalId,
            avatar_url: profileData.avatarUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) {
          console.error(error);
          alert('حدث خطأ أثناء حفظ الملف الشخصي.');
          return;
        }

        if (typeof window !== 'undefined') {
          if (profileData.avatarUrl) localStorage.setItem('instructor_avatar', profileData.avatarUrl);
          if (profileData.fullName) localStorage.setItem('instructor_name', profileData.fullName);
          window.dispatchEvent(
            new CustomEvent('instructor-profile-updated', {
              detail: { avatarUrl: profileData.avatarUrl, fullName: profileData.fullName },
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

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
      {/* Hero Header */}
      <div className="relative z-20 liquid-glass-hero p-6 sm:p-8 rounded-2xl sm:rounded-3xl liquid-glass-hover overflow-hidden student-card-accent">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/50 mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-[#173A7C] text-xs font-black border border-blue-200/90 shadow-xs">
            <User className="w-4 h-4 text-[#173A7C]" />
            <span>الملف الشخصي والبيانات الأكاديمية</span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-300 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>حساب أكاديمي موثق</span>
          </span>
        </div>

        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#173A7C] via-[#1E4D9D] to-[#2563EB] text-white flex items-center justify-center shadow-xl shadow-[#173A7C]/25 border border-white/40 shrink-0">
              <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] student-heading-h1">
                الملف التعريفي <span className="student-name-gradient">للمدرب المعتمد</span>
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed pr-1 sm:pr-2">
            تحديث بياناتك الشخصية، النبذة التعريفية، ومعلومات الاتصال الرسمية.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-xs flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>تم حفظ وتحديث بيانات الملف الشخصي بنجاح!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
          <p className="text-xs font-bold text-slate-500">جاري تحميل الملف الشخصي...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Avatar & Academic Identity Card (Large Portrait Showcase) */}
          <div className="p-6 rounded-3xl liquid-glass-card space-y-5 student-card-accent flex flex-col justify-between overflow-hidden relative">
            {/* Top Badge */}
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-xl text-xs font-black bg-blue-50 text-[#173A7C] border border-blue-200">
                الهوية الأكاديمية
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-black border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>محاضر معتمد</span>
              </span>
            </div>

            {/* Large Portrait Frame */}
            <div className="space-y-4 text-center">
              <div className="relative mx-auto w-full max-w-[240px] aspect-[4/4.5] sm:aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-4 ring-blue-100/80 bg-gradient-to-br from-[#173A7C] via-[#1E4D9D] to-[#2563EB] flex items-center justify-center group">
                {profileData.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileData.avatarUrl}
                    alt={profileData.fullName}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-white space-y-3 p-4">
                    <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/30 text-4xl font-black shadow-inner">
                      {profileData.fullName ? profileData.fullName.charAt(0) : 'م'}
                    </div>
                    <span className="text-xs font-black text-blue-100 tracking-wider">
                      {profileData.fullName || 'المدرب المعتمد'}
                    </span>
                  </div>
                )}

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                {/* Status Dot & Upload Quick Trigger */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-black border border-white/20 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>نشط على المنصة</span>
                </div>

                {/* Upload Hover Overlay Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white font-black text-xs cursor-pointer backdrop-blur-xs"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                  ) : (
                    <UploadCloud className="w-8 h-8 text-emerald-400" />
                  )}
                  <span>{isUploadingAvatar ? 'جاري ضغط ورفع الصورة...' : 'تغيير الصورة الشخصية'}</span>
                </button>
              </div>

              {/* Hidden File Input for WebP avatar upload */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarFileSelect}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-[#173A7C] hover:text-white text-slate-800 text-xs font-black transition-colors flex items-center justify-center gap-2 border border-slate-200 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isUploadingAvatar ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحويل لـ WebP والرفع...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-[#173A7C] group-hover:text-white" />
                    <span>رفع صورة شخصية جديدة (WebP)</span>
                  </>
                )}
              </button>

              {/* Name and Designation */}
              <div className="space-y-1 pt-1">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {profileData.fullName || 'المدرب المعتمد'}
                </h3>
                <p className="text-xs font-extrabold text-emerald-700 flex items-center justify-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>عضو هيئة التدريب الأكاديمية</span>
                </p>
              </div>
            </div>

            {/* Academic Credentials Box */}
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 text-right text-xs font-bold text-slate-700 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#173A7C] shrink-0" />
                <span className="truncate font-medium" dir="ltr">{profileData.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>حساب أكاديمي موثق ومعتمد بالمنصة</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>صلاحيات كاملة لإدارة المقررات والورش</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl liquid-glass-card student-card-accent flex flex-col justify-between">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white/80"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">البريد الإلكتروني (غير قابل للتعديل)</label>
                  <input
                    type="email"
                    disabled
                    value={profileData.email}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">رقم الهاتف</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+966 50 000 0000"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white/80"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">رقم الهوية الوطنية / الإقامة</label>
                  <input
                    type="text"
                    value={profileData.nationalId}
                    onChange={(e) => setProfileData({ ...profileData, nationalId: e.target.value })}
                    placeholder="10xxxxxxxx"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white/80"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">رابط الصورة الشخصية (Avatar URL)</label>
                <input
                  type="text"
                  value={profileData.avatarUrl || ''}
                  onChange={(e) => setProfileData({ ...profileData, avatarUrl: e.target.value })}
                  placeholder="https://... أو مسار الصورة"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white/80"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">النبذة التعريفية والمؤهلات الأكاديمية</label>
                <textarea
                  rows={4}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="اكتب نبذة عن خبراتك الأكاديمية، الشهادات المهنية، والبرامج التي تقدمها..."
                  className="w-full p-4 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white/80 leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-emerald-600 hover:opacity-95 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-[#173A7C]/20 transition-all cursor-pointer disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ وتحديث الملف الشخصي'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
