"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Clock, MessageCircle, ChevronLeft } from "lucide-react";
import NELCBadge from "@/components/ui/NELCBadge";
import { SITE_CONTACT } from "@/data/siteContact";

const policiesAndGuides = [
  { label: "سياسة الخصوصية والاستخدام", href: "/privacy" },
  { label: "سياسات وقوانين النزاهة الاكاديمية", href: "/academic-integrity" },
  { label: "مبادئ حقوق الملكية الفكرية وحقوق النشر", href: "/intellectual-property" },
  { label: "وثيقة الهيكلة التنظيمية والأدوار والمسؤوليات", href: "/organizational-structure" },
  { label: "الادلة الإرشادية والدعم والتدريب", href: "/guidance-manuals" },
  { label: "الخطة التدريبية", href: "/training-plan" },
  { label: "سياسة واجراءات واضحة للخصوصية والاستخدام", href: "/privacy" },
  { label: "وثيقة المواصفات للتفاصيل", href: "/technical-specifications" },
  { label: "آلية فحص أعمال المتدربين ومنع الغش", href: "/anti-plagiarism" },
  { label: "إجراءات التحقق من هوية المستفيد", href: "/identity-verification" },
  { label: "الدليل الإرشادي والدعم للمدرب", href: "/trainer-guide" },
  { label: "الدليل الإرشادي والدعم للمتدرب", href: "/trainee-guide" },
];

const supportLinks = [
  { label: "من نحن", href: "/about" },
  { label: "المدونة الأكاديمية", href: "/blog" },
  { label: "قنوات الدعم الفني", href: "/support-channels" },
  { label: "رفع الشكاوى والمقترحات", href: "/complaints" },
  { label: "سياسة الحضور", href: "/attendance-policy" },
  { label: "الدورات المهنية", href: "/courses" },
  { label: "دورات الشركات", href: "/corporate" },
  { label: "نظام التنبيهات", href: "/notifications" },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#0A162B] text-slate-200 pt-16 sm:pt-20 pb-10 pf-footer-fab-clearance overflow-hidden font-[family-name:var(--font-cairo)]" dir="rtl">
      {/* Signature Brand Navy Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A162B] via-[#0E2242] to-[#0B3766] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#19B6C7]/15 rounded-full blur-[150px] pointer-events-none -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-10 left-0 w-[550px] h-[550px] bg-[#1a4490]/25 rounded-full blur-[150px] pointer-events-none translate-y-1/3 -translate-x-1/4" />
      
      {/* Top Spline / Gradient Glow Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#19B6C7]/50 to-transparent shadow-[0_0_20px_rgba(25,182,199,0.4)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 space-y-14 sm:space-y-16">

        {/* ═══════════════════════════════ 2. MAIN FOOTER CONTENT GRID ═══════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pt-4 border-t border-white/10">

          {/* Column 1: Brand & Bio (Span 3) */}
          <div className="lg:col-span-3 flex flex-col items-start space-y-5">
            <Link href="/" className="inline-flex group">
              <img
                src="/madar-learning-logo-footer.svg"
                alt="شعار المدار ليرنينج"
                className="h-11 sm:h-14 w-auto max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <p className="text-xs sm:text-[13px] text-slate-300 font-normal leading-[1.8] max-w-sm">
              منصة المدار ليرنينج للتعليم والتدريب والتطوير المهني، تجمع الدورات والتقييمات ومسارات التعلّم في مكان واحد.
            </p>
          </div>

          {/* Column 2: Policies and Guides - 2-Column Mini Grid (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-white relative inline-flex items-center gap-2 pb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(25,182,199,0.8)]" />
              السياسات والأدلة التنظيمية
            </h3>

            {/* Structured 2-column list to eliminate clutter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2 pt-1">
              {policiesAndGuides.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="group flex items-start gap-1.5 text-xs sm:text-[12.5px] text-slate-200 hover:text-cyan-300 font-medium leading-relaxed transition-all duration-200"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 shrink-0 mt-0.5 transition-transform group-hover:-translate-x-0.5" />
                  <span className="truncate group-hover:underline decoration-emerald-300/40 underline-offset-4">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Support Links (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-white relative inline-flex items-center gap-2 pb-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(25,182,199,0.8)]" />
              روابط الدعم
            </h3>

            <div className="flex flex-col space-y-2 pt-1">
              {supportLinks.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="group flex items-center gap-1.5 text-xs sm:text-[12.5px] text-slate-200 hover:text-blue-300 font-medium transition-all duration-200"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-300 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                  <span className="group-hover:underline decoration-blue-300/40 underline-offset-4">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4: Contact Info (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-white relative inline-flex items-center gap-2 pb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(25,182,199,0.8)]" />
              معلومات الاتصال
            </h3>

            <div className="space-y-3 pt-1 text-xs sm:text-[12.5px]">
              {/* Location */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5 text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <p className="text-slate-200 font-normal leading-relaxed">
                  {SITE_CONTACT.address}
                </p>
              </div>

              {/* Emails (Only the 2 required emails) */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5 text-slate-200">
                  <Mail className="w-3.5 h-3.5 text-blue-300" />
                </div>
                <div className="flex flex-col space-y-1 font-medium" dir="ltr">
                  <a
                    href={`mailto:${SITE_CONTACT.primaryEmail}`}
                    className="text-slate-200 hover:text-white transition-colors text-right"
                  >
                    {SITE_CONTACT.primaryEmail}
                  </a>
                  <a
                    href={`mailto:${SITE_CONTACT.supportEmail}`}
                    className="text-slate-200 hover:text-white transition-colors text-right"
                  >
                    {SITE_CONTACT.supportEmail}
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-slate-200">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <a href={SITE_CONTACT.phoneHref} className="text-white font-bold hover:text-cyan-300 transition-colors" dir="ltr">
                  {SITE_CONTACT.phoneDisplay}
                </a>
              </div>

              {/* Working Hours */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <span className="text-slate-200 font-medium">{SITE_CONTACT.workingHours}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ═══════════════════════════════ 5. COPYRIGHT & LEGAL BAR ═══════════════════════════════ */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300 font-medium">
          <p>
            © {new Date().getFullYear()} جميع الحقوق محفوظة لـ <span className="font-bold text-white">المدار ليرنينج</span>
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-cyan-300 transition-colors">
              سياسة الخصوصية
            </Link>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <Link href="/privacy" className="hover:text-cyan-300 transition-colors">
              الشروط والأحكام
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
