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
  { label: "دوراتنا المعتمدة", href: "/courses" },
  { label: "دورات الشركات", href: "/corporate" },
  { label: "نظام التنبيهات", href: "/notifications" },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#0A162B] text-slate-200 pt-16 sm:pt-20 pb-10 overflow-hidden font-[family-name:var(--font-cairo)]" dir="rtl">
      {/* Signature Brand Navy Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A162B] via-[#0E2242] to-[#173A7C] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#5CB07C]/15 rounded-full blur-[150px] pointer-events-none -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-10 left-0 w-[550px] h-[550px] bg-[#1a4490]/25 rounded-full blur-[150px] pointer-events-none translate-y-1/3 -translate-x-1/4" />
      
      {/* Top Spline / Gradient Glow Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#5CB07C]/50 to-transparent shadow-[0_0_20px_rgba(92,176,124,0.4)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 space-y-14 sm:space-y-16">

        {/* ═══════════════════════════════ 1. ACCREDITED PARTNERS (TOP - LARGE & CLEAN) ═══════════════════════════════ */}
        <div className="space-y-6 sm:space-y-8">
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight relative inline-flex items-center justify-center gap-3">
              <span className="w-8 sm:w-12 h-[2px] bg-gradient-to-l from-emerald-400 to-transparent rounded-full" />
              <span>شركاؤنا المعتمدون</span>
              <span className="w-8 sm:w-12 h-[2px] bg-gradient-to-r from-emerald-400 to-transparent rounded-full" />
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1.5">شراكات استراتيجية واعتمادات رسمية لضمان أعلى معايير الجودة التدريبية</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
            {[
              {
                src: "/logo1_المركز_الوطني.webp",
                alt: "المركز الوطني للتعليم الإلكتروني",
                name: "المركز الوطني للتعليم الإلكتروني",
                badge: "ترخيص رسمي معتمد",
              },
              {
                src: "/logo2_جمعية_القلب_السعودية.webp",
                alt: "جمعية القلب السعودية",
                name: "جمعية القلب السعودية",
                badge: "اعتماد التدريب الصحي",
              },
              {
                src: "/logo3_المؤسسة_العامة_للتدريب.webp",
                alt: "المؤسسة العامة للتدريب التقني والمهني",
                name: "المؤسسة العامة للتدريب التقني والمهني",
                badge: "إشراف مهني معتمد",
              },
            ].map((partner, idx) => (
              <div
                key={idx}
                className="group relative rounded-3xl p-6 sm:p-7 bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 hover:border-emerald-400/40 backdrop-blur-md transition-all duration-300 flex flex-col items-center text-center shadow-xl hover:shadow-2xl hover:-translate-y-1.5"
              >
                {/* Direct Large Logo Display without nested black/small box */}
                <div className="w-full h-24 sm:h-28 flex items-center justify-center mb-4 bg-white/95 rounded-2xl p-4 shadow-md group-hover:scale-105 transition-transform duration-300">
                  <img src={partner.src} alt={partner.alt} className="max-h-full max-w-full object-contain" />
                </div>
                <h4 className="text-sm sm:text-base font-black text-white leading-snug group-hover:text-emerald-300 transition-colors mb-2">
                  {partner.name}
                </h4>
                <span className="text-[11px] sm:text-xs font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-400/30 px-3 py-1 rounded-full shadow-xs">
                  {partner.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════ 2. MAIN FOOTER CONTENT GRID ═══════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pt-4 border-t border-white/10">

          {/* Column 1: Brand & Bio (Span 3) */}
          <div className="lg:col-span-3 flex flex-col items-start space-y-5">
            <Link href="/" className="inline-flex group">
              <img
                src="/logo.svg"
                alt="النبض المستدام"
                className="h-12 sm:h-14 w-auto object-contain brightness-0 invert group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <p className="text-xs sm:text-[13px] text-slate-300 font-normal leading-[1.8] max-w-sm">
              منصة تعليمية رائدة تقدم برامج ودورات مهنية معتمدة. نسعى لتمكين الكوادر الوطنية والمؤسسات من تحقيق التميز الأكاديمي والمهني بأحدث المنهجيات الرقمية المعتمدة.
            </p>

            {/* Social Icons */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-300 block mb-3">تواصل معنا عبر المنصات:</span>
              <div className="flex items-center gap-2.5 flex-wrap">
                {[
                  {
                    label: "X (Twitter)",
                    href: "https://x.com/nabdtraining",
                    svg: (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Instagram",
                    href: "https://www.instagram.com/nabdtraining/",
                    svg: (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                      </svg>
                    ),
                  },
                  {
                    label: "TikTok",
                    href: "https://www.tiktok.com/@nabdtraining",
                    svg: (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Snapchat",
                    href: "https://www.snapchat.com/add/nabdtraining",
                    svg: (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12.27 1.13c-2.44 0-4.47 1.83-4.47 4.14v1.54c-.9.2-1.74.83-1.74 1.83 0 .61.27 1.19.78 1.59-.22 1.87-.93 2.99-2.3 3.33-.8.2-1.47.88-1.53 1.7-.06.84.44 1.56 1.15 1.8.84.28 1.87.5 2.84.88 1.1.43 1.94 1.14 2.65 2.08.31.42.79.67 1.32.67h2.6c.53 0 1.01-.25 1.32-.67.71-.94 1.55-1.65 2.65-2.08.97-.38 2-.6 2.84-.88.71-.24 1.21-.96 1.15-1.8-.06-.82-.73-1.5-1.53-1.7-1.37-.34-2.08-1.46-2.3-3.33.51-.4.78-.98.78-1.59 0-1-.84-1.63-1.74-1.83V5.27c0-2.31-2.03-4.14-4.47-4.14z"/>
                      </svg>
                    ),
                  },
                  {
                    label: "WhatsApp",
                    href: SITE_CONTACT.whatsappUrl,
                    svg: <MessageCircle className="w-4 h-4" />,
                  },
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href || "#"}
                    target={social.href ? "_blank" : undefined}
                    rel={social.href ? "noopener noreferrer" : undefined}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-emerald-500 text-white border border-white/15 hover:border-emerald-400 flex items-center justify-center transition-all duration-200 shadow-xs hover:-translate-y-0.5"
                  >
                    {social.svg}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Policies and Guides - 2-Column Mini Grid (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm sm:text-base font-black text-white relative inline-flex items-center gap-2 pb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(92,176,124,0.8)]" />
              السياسات والأدلة التنظيمية
            </h3>

            {/* Structured 2-column list to eliminate clutter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2 pt-1">
              {policiesAndGuides.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="group flex items-start gap-1.5 text-xs sm:text-[12.5px] text-slate-200 hover:text-emerald-300 font-medium leading-relaxed transition-all duration-200"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-300 shrink-0 mt-0.5 transition-transform group-hover:-translate-x-0.5" />
                  <span className="truncate group-hover:underline decoration-emerald-300/40 underline-offset-4">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Support Links (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm sm:text-base font-black text-white relative inline-flex items-center gap-2 pb-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
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
            <h3 className="text-sm sm:text-base font-black text-white relative inline-flex items-center gap-2 pb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              معلومات الاتصال
            </h3>

            <div className="space-y-3 pt-1 text-xs sm:text-[12.5px]">
              {/* Location */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5 text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
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
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <a href={SITE_CONTACT.phoneHref} className="text-white font-bold hover:text-emerald-300 transition-colors" dir="ltr">
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

        {/* ═══════════════════════════════ 3. OFFICIAL LICENSES & REGISTRATIONS (BOTTOM) ═══════════════════════════════ */}
        <div className="pt-8 border-t border-white/10 space-y-6">
          <div className="text-center">
            <h3 className="text-xs sm:text-sm font-black text-slate-200 tracking-wider">التراخيص والاعتمادات الرسمية</h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: "السجل التجاري", number: "7051493539", org: "وزارة التجارة", color: "#5CB07C" },
              { label: "الرقم الضريبي", number: "314195012200003", org: "هيئة الزكاة والضريبة والجمارك", color: "#0C8983" },
              { label: "رخصة بلدي", number: "470822783752", org: "وزارة الشؤون البلدية والقروية", color: "#76B82A" },
              { label: "ترخيص السلامة", number: "47-06312100-1", org: "المديرية العامة للدفاع المدني", color: "#E3A832" },
            ].map((license, idx) => (
              <div
                key={idx}
                className="bg-white/[0.06] hover:bg-white/[0.10] backdrop-blur-sm border border-white/15 hover:border-white/25 rounded-2xl p-3.5 sm:p-4 text-center transition-all duration-200 group shadow-md"
              >
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-300 mb-1 group-hover:text-white transition-colors">{license.org}</p>
                <h4 className="text-xs sm:text-[13px] font-black text-white mb-1.5">{license.label}</h4>
                <span className="text-xs sm:text-[13px] font-mono font-black block tracking-wider" dir="ltr" style={{ color: license.color }}>
                  {license.number}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════ 4. NELC OFFICIAL BADGE ═══════════════════════════════ */}
        <div className="flex justify-center pt-2">
          <NELCBadge />
        </div>

        {/* ═══════════════════════════════ 5. COPYRIGHT & LEGAL BAR ═══════════════════════════════ */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300 font-medium">
          <p>
            © {new Date().getFullYear()} جميع الحقوق محفوظة لـ <span className="font-black text-white">النبض المستدام</span>
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-emerald-300 transition-colors">
              سياسة الخصوصية
            </Link>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <Link href="/privacy" className="hover:text-emerald-300 transition-colors">
              الشروط والأحكام
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
