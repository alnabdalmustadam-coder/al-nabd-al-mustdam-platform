'use client';

import React, { useState, useEffect } from 'react';
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

          setProfileData({
            fullName: profile?.full_name || metaName || 'المدرب المعتمد',
            email: profile?.email || userEmail,
            phone: profile?.phone || '',
            bio: profile?.bio || 'خبير ومحاضر أكاديمي في برامج التنمية الإدارية والمواطنة والتسامح.',
            specialty: 'مدرب ومحاضر معتمد',
            nationalId: profile?.national_id || '',
            avatarUrl: profile?.avatar_url || metaAvatar || null,
          });
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
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) {
          console.error(error);
          alert('حدث خطأ أثناء حفظ الملف الشخصي.');
          return;
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#173A7C] text-xs font-black border border-blue-200">
              <User className="w-3.5 h-3.5" />
              <span>الملف الشخصي والبيانات الأكاديمية</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black student-heading-h1">
              الملف التعريفي <span className="student-name-gradient">للمدرب المعتمد</span> 👤
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-xl">
              تحديث بياناتك الشخصية، النبذة التعريفية، ومعلومات الاتصال الرسمية.
            </p>
          </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Avatar & Summary Card */}
          <div className="p-6 rounded-3xl liquid-glass-card space-y-4 text-center student-card-accent">
            <div className="flex justify-center">
              <DefaultAvatar
                src={profileData.avatarUrl}
                name={profileData.fullName}
                size="lg"
                className="w-24 h-24 text-2xl shadow-xl"
              />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{profileData.fullName}</h3>
              <p className="text-xs text-[#0D5C3A] font-bold mt-0.5">مدرب ومحاضر معتمد</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-right text-xs font-bold text-slate-600 space-y-1.5">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#173A7C]" />
                <span className="truncate">{profileData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>حساب موثق لدى إدارة المنصة</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl liquid-glass-card student-card-accent">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">الاسم الكامل</label>
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
                <label className="text-xs font-black text-slate-700">النبذة التعريفية والمؤهلات</label>
                <textarea
                  rows={4}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full p-4 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white/80 leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-[#173A7C]/20 transition-all cursor-pointer disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
