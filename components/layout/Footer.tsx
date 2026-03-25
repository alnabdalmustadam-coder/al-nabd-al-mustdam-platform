"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";

const policiesAndGuides = [
  "سياسة الخصوصية والاستخدام",
  "سياسات وقوانين النزاهة الاكاديمية",
  "مبادئ حقوق الملكية الفكرية وحقوق النشر",
  "وثيقة الهيكلة التنظيمية والأدوار والمسؤوليات",
  "الادلة الإرشادية والدعم والتدريب",
  "الخطة التدريبية",
  "سياسة واجراءات واضحة للخصوصية والاستخدام",
  "وثيقة المواصفات للتفاصيل",
  "آلية فحص أعمال المتدربين ومنع الغش",
  "إجراءات التحقق من هوية المستفيد",
  "الدليل الإرشادي والدعم للمدرب",
  "الدليل الإرشادي والدعم للمتدرب",
];

const supportLinks = [
  "من نحن",
  "قنوات الدعم الفني",
  "رفع الشكاوى والمقترحات",
  "سياسة الحضور",
  "دوراتنا المعتمدة",
  "دورات الشركات",
  "نظام التنبيهات",
];

export default function Footer() {
  return (
    <footer className="relative bg-[#0A162B] pt-24 pb-8 overflow-hidden">
      {/* Premium Navy Dark Theme Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A162B] via-[#0E2242] to-[#173A7C]" />

      {/* Decorative Blurs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#5CB07C]/10 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1a4490]/20 rounded-full blur-[150px] pointer-events-none translate-y-1/2 -translate-x-1/3" />

      {/* Noise Texture */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      {/* Top Spline/Gradient Glow Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#5CB07C]/40 to-transparent shadow-[0_0_20px_rgba(92,176,124,0.3)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Column 1: Brand & Social (Span 3) */}
          <div className="lg:col-span-3 flex flex-col items-start">
            <Link href="/" className="inline-flex mb-8 group">
              <img src="/logo.svg" alt="TTi Logo" className="h-14 w-auto object-contain brightness-0 invert group-hover:scale-105 transition-transform duration-500" />
            </Link>
            <p className="text-[14px] text-white/60 leading-relaxed max-w-sm mb-8 font-medium">
              منصة تعليمية رائدة تقدم دورات مهنية وتقنية معتمدة باللغة العربية. نسعى لتمكين الأفراد والمؤسسات من تحقيق التميز المهني في بيئة تواكب المستقبل وتلبي احتياجات سوق العمل بأحدث المنهجيات.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[
                {
                  label: "Facebook",
                  svg: (
                    <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  ),
                },
                {
                  label: "Twitter",
                  svg: (
                    <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  ),
                },
                {
                  label: "WhatsApp",
                  svg: <MessageCircle className="w-[18px] h-[18px]" />,
                },
                {
                  label: "YouTube",
                  svg: (
                    <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                    </svg>
                  ),
                },
                {
                  label: "Instagram",
                  svg: (
                    <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  ),
                },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href="#"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:bg-[#5CB07C] hover:text-white hover:border-[#5CB07C] hover:-translate-y-1 hover:shadow-lg hover:shadow-[#5CB07C]/20 transition-all duration-300"
                >
                  {social.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Policies and Guides (Span 3) */}
          <div className="lg:col-span-3">
            <h3 className="text-[17px] font-black text-white mb-6 relative inline-flex pb-3">
              السياسات والادلة
              <span className="absolute bottom-0 right-0 w-8 h-[3px] bg-gradient-to-r from-[#5CB07C] to-[#173A7C] rounded-full" />
            </h3>
            <ul className="space-y-3.5 flex flex-col items-start pr-0">
              {policiesAndGuides.map((link, idx) => (
                <li key={idx} className="group relative inline-flex">
                  <span className="absolute right-0 top-[6px] w-[5px] h-[5px] rounded-full bg-[#5CB07C] opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_10px_rgba(92,176,124,0.8)]" />
                  <Link href="#" className="text-[13.5px] text-white/50 font-medium hover:text-white hover:pr-4 hover:font-bold transition-all duration-300 inline-block">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support and Guidance Links (Span 2) */}
          <div className="lg:col-span-2">
            <h3 className="text-[17px] font-black text-white mb-6 relative inline-flex pb-3">
              روابط الدعم
              <span className="absolute bottom-0 right-0 w-8 h-[3px] bg-gradient-to-r from-[#5CB07C] to-[#173A7C] rounded-full" />
            </h3>
            <ul className="space-y-3.5 flex flex-col items-start pr-0">
              {supportLinks.map((link, idx) => (
                <li key={idx} className="group relative inline-flex">
                  <span className="absolute right-0 top-[6px] w-[5px] h-[5px] rounded-full bg-[#5CB07C] opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_10px_rgba(92,176,124,0.8)]" />
                  <Link href="#" className="text-[13.5px] text-white/50 font-medium hover:text-white hover:pr-4 hover:font-bold transition-all duration-300 inline-block">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info (Span 4) */}
          <div className="lg:col-span-4">
            <h3 className="text-[17px] font-black text-white mb-6 relative inline-flex pb-3">
              معلومات الاتصال
              <span className="absolute bottom-0 right-0 w-8 h-[3px] bg-gradient-to-r from-[#5CB07C] to-[#173A7C] rounded-full" />
            </h3>

            <ul className="space-y-5">
              <li className="flex items-start gap-3.5 group">
                <div className="w-9 h-9 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#5CB07C] transition-colors duration-300 mt-0.5">
                  <MapPin className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
                </div>
                <div className="text-[13.5px] text-white/60 font-medium leading-[1.8] flex-1 group-hover:text-white transition-colors duration-300">
                  جدة - حي الرحاب - شارع فلسطين - مدينة الكمبيوتر - مقابل قيادة الحرس الوطني ٢٣٣٤٤
                </div>
              </li>

              <li className="flex items-center gap-3.5 group">
                <div className="w-9 h-9 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#5CB07C] transition-colors duration-300">
                  <Mail className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
                </div>
                <a href="mailto:Alqemmatraining@Gmail.Com" className="text-[13.5px] text-white/60 font-medium hover:text-white hover:font-bold transition-colors duration-300 font-sans group-hover:text-white" dir="ltr">
                  Alqemmatraining@Gmail.Com
                </a>
              </li>

              <li className="flex items-start gap-3.5 group">
                <div className="w-9 h-9 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#5CB07C] transition-colors duration-300 mt-1">
                  <Phone className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
                </div>
                <div className="text-[14px] text-white/60 font-bold leading-relaxed flex items-center flex-wrap font-sans group-hover:text-white transition-colors duration-300" dir="ltr">
                  <span>0549105986 - 0502153458 - 0126811012</span>
                </div>
              </li>

              <li className="flex items-center gap-3.5 group">
                <div className="w-9 h-9 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#5CB07C] transition-colors duration-300">
                  <Phone className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
                </div>
                <div className="text-[13.5px] font-medium flex items-center justify-start gap-4 flex-1">
                  <span className="text-[#5CB07C] bg-[#5CB07C]/10 border border-[#5CB07C]/20 px-3 py-1 rounded-full text-[12px] font-black group-hover:bg-[#5CB07C] group-hover:text-white transition-colors duration-300">فرع النساء</span>
                  <span className="text-white font-bold font-sans" dir="ltr">0509416736</span>
                </div>
              </li>

              <li className="flex items-center gap-3.5 group">
                <div className="w-9 h-9 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#5CB07C] transition-colors duration-300">
                  <Phone className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
                </div>
                <div className="text-[13.5px] font-medium flex items-center justify-start gap-4 flex-1">
                  <span className="text-white/60 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[12px] font-black group-hover:bg-white group-hover:text-[#173A7C] transition-colors duration-300">فرع الرجال</span>
                  <span className="text-white font-bold font-sans" dir="ltr">0549105986</span>
                </div>
              </li>

              <li className="flex items-center gap-3.5 group">
                <div className="w-9 h-9 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#5CB07C] transition-colors duration-300">
                  <Clock className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
                </div>
                <div className="text-[13.5px] text-white/60 font-medium font-sans group-hover:text-white transition-colors duration-300" dir="ltr">
                  <span className="font-bold text-white/80 pr-2">Mon-Sat:</span> 05:00 AM - 08:00 PM
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
          <p className="text-sm text-white/40 font-medium">
            © {new Date().getFullYear()} جميع الحقوق محفوظة لـ <span className="font-black text-white">النبض المستدام</span>
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-[12px] text-white/40 hover:text-[#5CB07C] transition-colors">
              سياسة الخصوصية
            </Link>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <Link href="#" className="text-[12px] text-white/40 hover:text-[#5CB07C] transition-colors">
              الشروط والأحكام
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
