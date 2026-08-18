'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [platformSettings, setPlatformSettings] = useState({
    siteName: 'النبض المستدام - منصة الدبلومات والتدريب',
    contactEmail: 'info@sustainpulse.org',
    supportPhone: '+966 11 234 5678',
    nelcLicense: 'NELC-2026-SA-9823',
    xapiEndpoint: 'https://xapi.sustainpulse.org/v1/statements',
    supabaseUrl: 'https://cx...supabase.co',
    ghlApiKey: '••••••••••••••••••••••••',
    autoCertificates: true,
    watermarkEnabled: true,
  });

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

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
                <Settings className="w-4 h-4 text-[#173A7C] shrink-0" />
                <span>إعدادات وتكاملات منصة النبض المستدام</span>
              </div>
              <h1 className="text-sm sm:text-2xl lg:text-3xl font-black student-heading-h1 student-name-gradient leading-snug">
                إعدادات النظام <span className="inline-block whitespace-nowrap">والهوية والتكاملات ⚙️</span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs lg:text-sm text-slate-600 font-medium max-w-xl leading-relaxed">
              إدارة الهوية البصرية الرسمية، تراخيص المركز الوطني للتعليم الإلكتروني (NELC)، ربط الـ xAPI، وقواعد البيانات السحابية.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="w-full sm:w-auto px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#173A7C] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#173A7C]/20 cursor-pointer border border-white/25 transition-all shrink-0 whitespace-nowrap"
          >
            <Save className="w-4 h-4 stroke-[2.5] shrink-0" />
            <span>حفظ الإعدادات والتكاملات ⚡</span>
          </motion.button>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-[#173A7C]/10">
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">ترخيص NELC</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-emerald-700">ساري ونشط 🟢</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">محرك xAPI LRS</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-[#173A7C]">متصل 24/7</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">حماية الفيديوهات</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-emerald-700">تشفير + وسم مائي</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">حالة النظام</p>
            <p className="text-xs sm:text-sm lg:text-base font-black text-emerald-700">مستقر بنسبة 99.9%</p>
          </div>
        </div>
      </motion.div>

      {/* Success Notification */}
      <AnimatePresence>
        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 sm:p-4 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-900 border border-emerald-500/25 flex items-center gap-2.5 font-bold text-xs shadow-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>تم حفظ كافة إعدادات المنصة، ترخيص NELC، وتطبيقات التكامل السحابية بنجاح!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Basic Platform Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="liquid-glass-card rounded-lg sm:rounded-xl p-4 sm:p-7 border border-white/70 space-y-5 sm:space-y-6 student-card-accent relative"
      >
        <div className="specular-card-reflection" />
        <h3 className="text-base font-extrabold text-[#152C5B] student-heading-h3 flex items-center gap-2.5 border-b border-[#173A7C]/10 pb-3 [text-shadow:_0_1px_0_rgba(255,255,255,0.35)]">
          <Globe className="w-4.5 h-4.5 text-[#173A7C]" />
          <span>هوية المنصة والبيانات الرسمية الأساسية</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-bold">
          <div className="space-y-1.5">
            <label className="text-slate-700 block">اسم المنصة المعتمد</label>
            <input
              type="text"
              value={platformSettings.siteName}
              onChange={(e) => setPlatformSettings({ ...platformSettings, siteName: e.target.value })}
              className="w-full p-3.5 rounded-xl bg-white/90 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 block">بريد الدعم والتواصل الرسمي</label>
            <input
              type="email"
              value={platformSettings.contactEmail}
              onChange={(e) => setPlatformSettings({ ...platformSettings, contactEmail: e.target.value })}
              className="w-full p-3.5 rounded-xl bg-white/90 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 block">رقم الترخيص من المركز الوطني (NELC)</label>
            <input
              type="text"
              value={platformSettings.nelcLicense}
              onChange={(e) => setPlatformSettings({ ...platformSettings, nelcLicense: e.target.value })}
              className="w-full p-3.5 rounded-xl bg-white/90 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all shadow-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 block">هاتف الدعم الموحد</label>
            <input
              type="text"
              value={platformSettings.supportPhone}
              onChange={(e) => setPlatformSettings({ ...platformSettings, supportPhone: e.target.value })}
              className="w-full p-3.5 rounded-xl bg-white/90 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all shadow-sm"
              dir="ltr"
            />
          </div>
        </div>
      </motion.div>

      {/* Integrations Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="liquid-glass-card rounded-lg sm:rounded-xl p-4 sm:p-7 border border-white/70 space-y-5 sm:space-y-6 student-card-accent relative"
      >
        <div className="specular-card-reflection" />
        <h3 className="text-base font-extrabold text-[#152C5B] student-heading-h3 flex items-center gap-2.5 border-b border-[#173A7C]/10 pb-3 [text-shadow:_0_1px_0_rgba(255,255,255,0.35)]">
          <Database className="w-4.5 h-4.5 text-[#173A7C]" />
          <span>إعدادات خوادم البيانات والتكاملات السحابية (xAPI / Supabase / Video DRM)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-bold">
          <div className="space-y-1.5">
            <label className="text-slate-700 block">عنوان خادم xAPI LRS Endpoint</label>
            <input
              type="text"
              value={platformSettings.xapiEndpoint}
              onChange={(e) => setPlatformSettings({ ...platformSettings, xapiEndpoint: e.target.value })}
              className="w-full p-3.5 rounded-xl bg-white/90 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all shadow-sm font-mono text-[11px]"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 block">عنوان Supabase Database Endpoint</label>
            <input
              type="text"
              value={platformSettings.supabaseUrl}
              disabled
              className="w-full p-3.5 rounded-xl bg-slate-100/80 border border-slate-200 text-slate-400 font-mono text-[11px] cursor-not-allowed shadow-inner"
              dir="ltr"
            />
          </div>
        </div>

        {/* Security & Automation Toggles */}
        <div className="space-y-3.5 pt-4 border-t border-[#173A7C]/10 text-xs font-bold">
          <label className="flex items-center gap-3 p-3.5 rounded-xl liquid-glass-inset border border-white/70 cursor-pointer hover:bg-white/80 transition-all">
            <input
              type="checkbox"
              checked={platformSettings.autoCertificates}
              onChange={(e) => setPlatformSettings({ ...platformSettings, autoCertificates: e.target.checked })}
              className="w-4.5 h-4.5 rounded text-[#173A7C] accent-[#173A7C] cursor-pointer"
            />
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#173A7C]" />
              <span className="text-[#152C5B] font-extrabold">
                إصدار الشهادات وتوثيقها تلقائياً بالباركود فور إكمال الدورة واستيفاء نسبة 100%
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3.5 rounded-xl liquid-glass-inset border border-white/70 cursor-pointer hover:bg-white/80 transition-all">
            <input
              type="checkbox"
              checked={platformSettings.watermarkEnabled}
              onChange={(e) => setPlatformSettings({ ...platformSettings, watermarkEnabled: e.target.checked })}
              className="w-4.5 h-4.5 rounded text-[#173A7C] accent-[#173A7C] cursor-pointer"
            />
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-emerald-600" />
              <span className="text-[#152C5B] font-extrabold">
                تفعيل العلامة المائية الديناميكية الآمنة (اسم ورقم المتدرب) لحماية الفيديو ضد التسريب
              </span>
            </div>
          </label>
        </div>
      </motion.div>
    </div>
  );
}
