'use client';

import React, { useState } from 'react';
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
    setTimeout(() => setSavedSuccess(false), 3000);
  };

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

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white border border-white/20"
        style={{
          background: 'linear-gradient(135deg, #173A7C 0%, #1E4D9D 60%, #15346E 100%)',
          boxShadow: '0 20px 50px rgba(23, 58, 124, 0.25)',
        }}
      >
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#5CB07C]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black text-emerald-300 border border-emerald-400/30"
              style={{ background: 'rgba(92,176,124,0.15)' }}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>إعدادات وتكاملات منصة النبض المستدام</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">إعدادات النظام والهوية</h1>
            <p className="text-sm text-slate-200/90 font-bold max-w-xl leading-relaxed">
              إدارة الهوية البصرية، تراخيص المركز الوطني (NELC)، ربط الـ xAPI، وقواعد البيانات.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-7 py-3 rounded-2xl bg-gradient-to-r from-[#5CB07C] to-emerald-600 hover:from-emerald-600 hover:to-[#5CB07C] text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-emerald-600/30 transition-all hover:-translate-y-0.5 shrink-0"
          >
            <Save className="w-4 h-4 stroke-[3]" />
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 font-black text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>تم حفظ تحديثات المنصة وتطبيقات التكامل بنجاح!</span>
        </div>
      )}

      {/* Basic Platform Settings */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-white/60 space-y-5" style={glassCard}>
        <h3 className="text-base font-black text-slate-800 flex items-center gap-2 border-b border-slate-200/40 pb-3">
          <Globe className="w-4 h-4 text-[#173A7C]" />
          <span>هوية المنصة والبيانات الأساسية</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
          <div className="space-y-1.5">
            <label className="text-slate-700">اسم المنصة المعتمد</label>
            <input
              type="text"
              value={platformSettings.siteName}
              onChange={(e) => setPlatformSettings({ ...platformSettings, siteName: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200/60 focus:outline-none focus:border-[#173A7C]"
              style={glassInner}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700">بريد الدعم والتواصل الرسمي</label>
            <input
              type="email"
              value={platformSettings.contactEmail}
              onChange={(e) => setPlatformSettings({ ...platformSettings, contactEmail: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200/60 focus:outline-none focus:border-[#173A7C]"
              style={glassInner}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700">رقم الترخيص من المركز الوطني (NELC)</label>
            <input
              type="text"
              value={platformSettings.nelcLicense}
              onChange={(e) => setPlatformSettings({ ...platformSettings, nelcLicense: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200/60 focus:outline-none focus:border-[#173A7C]"
              style={glassInner}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700">هاتف الدعم الموحد</label>
            <input
              type="text"
              value={platformSettings.supportPhone}
              onChange={(e) => setPlatformSettings({ ...platformSettings, supportPhone: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200/60 focus:outline-none focus:border-[#173A7C]"
              style={glassInner}
            />
          </div>
        </div>
      </div>

      {/* Integrations Settings */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-white/60 space-y-5" style={glassCard}>
        <h3 className="text-base font-black text-slate-800 flex items-center gap-2 border-b border-slate-200/40 pb-3">
          <Database className="w-4 h-4 text-[#173A7C]" />
          <span>إعدادات خوادم البيانات والتكاملات (xAPI / Supabase / GHL)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
          <div className="space-y-1.5">
            <label className="text-slate-700">عنوان خادم xAPI LRS Endpoint</label>
            <input
              type="text"
              value={platformSettings.xapiEndpoint}
              onChange={(e) => setPlatformSettings({ ...platformSettings, xapiEndpoint: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200/60 focus:outline-none focus:border-[#173A7C] font-mono text-[11px]"
              style={glassInner}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700">عنوان Supabase Database URL</label>
            <input
              type="text"
              value={platformSettings.supabaseUrl}
              disabled
              className="w-full p-3 rounded-xl border border-slate-200/60 bg-slate-100 text-slate-400 font-mono text-[11px] cursor-not-allowed"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-3 border-t border-slate-200/40 text-xs font-bold">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={platformSettings.autoCertificates}
              onChange={(e) => setPlatformSettings({ ...platformSettings, autoCertificates: e.target.checked })}
              className="w-4 h-4 rounded text-[#173A7C] focus:ring-[#173A7C]"
            />
            <span className="text-slate-800 font-black">إصدار الشهادات وتوثيقها تلقائياً فور إكمال الدورة واستيفاء نسبة 100%</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={platformSettings.watermarkEnabled}
              onChange={(e) => setPlatformSettings({ ...platformSettings, watermarkEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-[#173A7C] focus:ring-[#173A7C]"
            />
            <span className="text-slate-800 font-black">تفعيل العلامة المائية الآمنة لحماية مشغل الفيديوهات ضد التسريب</span>
          </label>
        </div>
      </div>

    </div>
  );
}
