"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, X, Home, Info, BookOpen, Briefcase,
  Users, UserCheck, Phone, ChevronDown, FileText, ChevronLeft
} from "lucide-react";
import Button from "@/components/ui/Button";

const megaMenuItems = [
  { label: "تقييم مستوى اللغة الانجليزية", href: "/trainees/english-evaluation", icon: FileText },
  { label: "قياس رضا المتدرب", href: "/trainees/satisfaction", icon: FileText },
  { label: "استمارة تقييم دورة اون لاين", href: "/trainees/evaluation-online", icon: FileText },
  { label: "استمارة تقييم دورة", href: "/trainees/evaluation-offline", icon: FileText },
  { label: "استشارة التطوير الوظيفي", href: "/trainees/career-consulting", icon: FileText },
  { label: "استمارة مهارات وتطبيقات البرنامج", href: "/trainees/skills-evaluation", icon: FileText },
  { label: "استطلاع رأي عن اقامة الدورات", href: "/trainees/courses-survey", icon: FileText },
  { label: "استمارة طلب العضوية", href: "/trainees/membership", icon: FileText },
  { label: "استمارة الاشتراك في الموقع الإلكتروني", href: "/trainees/subscription", icon: FileText },
];

const navLinks = [
  { label: "الرئيسية", href: "/", icon: Home },
  { label: "نبذة عنا", href: "/about", icon: Info },
  { label: "أحدث الدورات", href: "/courses", icon: BookOpen },
  { label: "دورات الشركات", href: "/corporate", icon: Briefcase },
  { label: "المدربيين", href: "/trainers", icon: UserCheck },
  {
    label: "المتدربين",
    href: "#",
    icon: Users,
    hasMegaMenu: true
  },
  { label: "تواصل معنا", href: "/contact", icon: Phone },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMegaMenuOpen, setMobileMegaMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaMenuOpen(false);
    setMobileMegaMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled
          ? "py-3 bg-white/90 backdrop-blur-3xl border-b border-white/60 shadow-[0_20px_40px_-15px_rgba(23,58,124,0.15),inset_0_-1px_0_rgba(255,255,255,0.5)]"
          : "py-5 bg-transparent"
          }`}
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-4 xl:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <img src="/logo.svg" alt="TTi Logo" className="h-12 w-auto object-contain" />
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 justify-center flex-1 mx-4 lg:mx-2 xl:mx-8 relative">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.hasMegaMenu && pathname.startsWith('/trainees'));

              if (link.hasMegaMenu) {
                return (
                  <div
                    key={link.label}
                    className="relative group block"
                    onMouseEnter={() => setMegaMenuOpen(true)}
                    onMouseLeave={() => setMegaMenuOpen(false)}
                  >
                    <button
                      className={`flex items-center gap-1 lg:gap-1.5 px-1.5 lg:px-2 xl:px-3 py-6 -my-4 rounded-xl text-[13px] lg:text-[13px] xl:text-[15px] font-bold transition-all duration-300 whitespace-nowrap ${isActive || megaMenuOpen
                        ? "text-[#173A7C] bg-[#173A7C]/5"
                        : "text-slate-700 hover:text-[#173A7C] hover:bg-slate-50"
                        }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={2.5} />
                      {link.label}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${megaMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Desktop Mega Menu Dropdown */}
                    <div
                      className={`absolute top-full right-1/2 translate-x-1/2 pt-10 w-[800px] transition-all duration-300 transform origin-top ${megaMenuOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
                        }`}
                    >
                      <div className="bg-white/80 backdrop-blur-2xl rounded-2xl shadow-[0_30px_60px_-15px_rgba(23,58,124,0.3)] border border-[#173A7C]/30 ring-1 ring-[#173A7C]/10 p-8 grid grid-cols-2 gap-x-12 gap-y-4">
                        {megaMenuItems.map((item, idx) => (
                          <Link
                            key={idx}
                            href={item.href}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/60 group border border-transparent hover:border-white/80 transition-all duration-300"
                          >
                            <div className="w-10 h-10 rounded-lg bg-[#5CB07C]/10 text-[#5CB07C] flex items-center justify-center shrink-0 group-hover:scale-110 shadow-sm transition-transform">
                              <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <strong className="block text-sm text-slate-800 font-bold group-hover:text-[#173A7C] transition-colors">{item.label}</strong>
                              <span className="text-xs text-slate-500 mt-1 line-clamp-1">انقر للوصول إلى النموذج الخاص بـ {item.label}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1 lg:gap-1.5 px-1.5 lg:px-2 xl:px-3 py-2 rounded-xl text-[13px] lg:text-[13px] xl:text-[15px] font-bold transition-all duration-300 whitespace-nowrap ${isActive
                    ? "text-[#173A7C] bg-[#173A7C]/5"
                    : "text-slate-700 hover:text-[#173A7C] hover:bg-slate-50"
                    }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2.5} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            <Link
              href="/auth/login"
              className="text-xs xl:text-sm font-bold text-slate-700 hover:text-[#173A7C] transition-colors px-2 xl:px-4 py-2 whitespace-nowrap"
            >
              تسجيل دخول
            </Link>
            <Button href="/auth/register" size="sm" className="hidden lg:flex text-xs xl:text-sm px-3 xl:px-4 py-1.5 xl:py-2 whitespace-nowrap">
              سجّل الآن
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 text-slate-800 hover:text-[#173A7C]`}
            aria-label="القائمة"
          >
            {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        <div
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl
            transform transition-transform duration-500 flex flex-col ${mobileOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <img src="/logo.svg" alt="TTi Logo" className="h-10 w-auto object-contain" />
            <button aria-label="إغلاق" onClick={() => setMobileOpen(false)} className="text-slate-500 hover:text-red-500 bg-white p-2 rounded-full shadow-sm">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-2 flex-1 overflow-y-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.hasMegaMenu && pathname.startsWith('/trainees'));

              if (link.hasMegaMenu) {
                return (
                  <div key={link.label} className="flex flex-col border-b border-slate-100 pb-2 mb-2">
                    <button
                      onClick={() => setMobileMegaMenuOpen(!mobileMegaMenuOpen)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-bold transition-all w-full ${isActive || mobileMegaMenuOpen
                        ? "text-[#173A7C] bg-[#173A7C]/5"
                        : "text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-slate-400" />
                        {link.label}
                      </span>
                      <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${mobileMegaMenuOpen ? '-rotate-90 text-[#173A7C]' : 'text-slate-400'}`} />
                    </button>

                    {/* Mobile Extracted Menu */}
                    <div className={`overflow-hidden transition-all duration-300 ${mobileMegaMenuOpen ? "max-h-[800px] opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                      <div className="flex flex-col gap-1 pr-6 border-r-2 border-[#173A7C]/10 mr-4">
                        {megaMenuItems.map((item, idx) => (
                          <Link
                            key={idx}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-[#173A7C] hover:bg-slate-50 transition-colors"
                          >
                            <item.icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all mb-2 ${isActive
                    ? "text-[#173A7C] bg-[#173A7C]/5"
                    : "text-slate-700 hover:text-[#173A7C] hover:bg-slate-50"
                    }`}
                >
                  <Icon className="w-5 h-5 text-slate-400" />
                  {link.label}
                </Link>
              );
            })}

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
              <Button href="/auth/login" variant="secondary" size="lg" className="w-full justify-center">
                تسجيل دخول
              </Button>
              <Button href="/auth/register" size="lg" className="w-full justify-center">
                سجّل الآن
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
