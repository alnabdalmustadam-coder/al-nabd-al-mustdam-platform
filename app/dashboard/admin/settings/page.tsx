'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  ShieldCheck,
  Globe,
  Save,
  CheckCircle2,
  Lock,
  Database,
  Sparkles,
  Award,
  Key,
  Video,
  FileCheck,
  Server,
  Layers,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AdminSettingsPage() {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [platformSettings, setPlatformSettings] = useState({
    siteName: 'النبض المستدام - منصة الدبلومات والتدريب',
    contactEmail: 'info@sustainpulse.org',
    supportPhone: '+966 11 234 5678',
    nelcLicense: 'NELC-2026-SA-9823',
    xapiEndpoint: 'https://xapi.sustainpulse.org/v1/statements',
    autoCertificates: true,
    watermarkEnabled: true,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase.from('platform_settings').select('*');

        if (error) {
          console.error('Error fetching settings:', error);
        }

        if (data && data.length > 0) {
          const map: Record<string, any> = {};
          data.forEach((item: any) => {
            try {
              map[item.key] = JSON.parse(item.value);
            } catch {
              map[item.key] = item.value;
            }
          });
          setPlatformSettings((prev) => ({ ...prev, ...map }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      const entries = Object.entries(platformSettings);
      for (const [key, value] of entries) {
        await supabase.from('platform_settings').upsert({
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value),
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null,
        });
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
      {/* Header Banner - Liquid Glass Hero */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 liquid-glass-hero border border-white/80 student-card-accent"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#173A7C] text-xs font-black border border-blue-200">
              <Settings className="w-3.5 h-3.5" />
              <span>إعدادات وتكاملات منصة النبض المستدام</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black student-heading-h1">
              إعدادات النظام <span className="student-name-gradient">والهوية والتراخيص ⚙️</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-xl">
              إدارة الهوية الرسمية، تراخيص المركز الوطني للتعليم الإلكتروني (NELC)، وخصائص الأمان.
            </p>
          </div>

          <button
            disabled={saving}
            onClick={handleSave}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-[#173A7C]/20 cursor-pointer transition-all shrink-0 whitespace-nowrap disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
          </button>
        </div>
      </motion.div>

      {/* Alert Banner */}
      <AnimatePresence>
        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-xs flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>تم حفظ وتحديث إعدادات المنصة في قاعدة البيانات بنجاح!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* General settings */}
        <div className="p-6 rounded-3xl liquid-glass-card space-y-4 student-card-accent">
          <div className="flex items-center gap-2 text-sm font-black text-[#173A7C] border-b border-slate-200/60 pb-3">
            <Globe className="w-4 h-4" />
            <span>معلومات وهوية المنصة</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700">اسم المنصة الرسمي</label>
              <input
                type="text"
                value={platformSettings.siteName}
                onChange={(e) => setPlatformSettings({ ...platformSettings, siteName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white/80"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700">البريد الإلكتروني الرسمي للدعم</label>
              <input
                type="email"
                value={platformSettings.contactEmail}
                onChange={(e) => setPlatformSettings({ ...platformSettings, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white/80"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700">رقم الهاتف وخدمة العملاء</label>
              <input
                type="text"
                value={platformSettings.supportPhone}
                onChange={(e) => setPlatformSettings({ ...platformSettings, supportPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white/80"
              />
            </div>
          </div>
        </div>

        {/* Accreditation and Security */}
        <div className="p-6 rounded-3xl liquid-glass-card space-y-4 student-card-accent">
          <div className="flex items-center gap-2 text-sm font-black text-[#173A7C] border-b border-slate-200/60 pb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>التراخيص والأمان والشهادات</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700">رقم ترخيص المركز الوطني (NELC)</label>
              <input
                type="text"
                value={platformSettings.nelcLicense}
                onChange={(e) => setPlatformSettings({ ...platformSettings, nelcLicense: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold font-mono focus:outline-none focus:border-[#173A7C] bg-white/80"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700">نقطة نهاية xAPI LRS للمزامنة</label>
              <input
                type="url"
                value={platformSettings.xapiEndpoint}
                onChange={(e) => setPlatformSettings({ ...platformSettings, xapiEndpoint: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold font-mono focus:outline-none focus:border-[#173A7C] bg-white/80"
              />
            </div>

            <div className="pt-2 space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={platformSettings.autoCertificates}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, autoCertificates: e.target.checked })}
                  className="rounded text-[#173A7C]"
                />
                <span>إصدار الشهادات آلياً فور إكمال كافة متطلبات الدورة والامتحان</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={platformSettings.watermarkEnabled}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, watermarkEnabled: e.target.checked })}
                  className="rounded text-[#173A7C]"
                />
                <span>تفعيل العلامة المائية الديناميكية لحماية الفيديوهات ضد التسريب</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
