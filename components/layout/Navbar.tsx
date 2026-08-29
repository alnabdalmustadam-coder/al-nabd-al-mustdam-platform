"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, X, Home, Info, BookOpen, Briefcase,
  Users, UserCheck, Phone, ChevronDown, FileText, ChevronLeft, User,
  ShoppingCart, Heart
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const megaMenuItems = [
  { label: "تقييم مستوى اللغة الانجليزية", href: "/english-evaluation", icon: FileText },
  { label: "قياس رضا المتدرب", href: "/trainee-satisfaction", icon: FileText },
  { label: "استمارة تقييم دورة اون لاين", href: "/trainees/evaluation-online", icon: FileText },
  { label: "استمارة تقييم دورة", href: "/trainees/evaluation-offline", icon: FileText },
  { label: "استشارة التطوير الوظيفي", href: "/trainees/career-consulting", icon: FileText },
  { label: "استمارة مهارات وتطبيقات البرنامج", href: "/trainees/skills-applications", icon: FileText },
  { label: "استطلاع رأي عن اقامة الدورات", href: "/trainees/courses-survey", icon: FileText },
  { label: "استمارة طلب العضوية", href: "/trainees/membership", icon: FileText },
  { label: "استمارة الاشتراك في الموقع الإلكتروني", href: "/trainees/subscription", icon: FileText },
];

const navLinks = [
  { label: "الرئيسية", href: "/", icon: Home },
  { label: "نبذة عنا", href: "/about", icon: Info },
  { label: "أحدث الدورات", href: "/courses", icon: BookOpen },
  { label: "دورات الشركات", href: "/corporate", icon: Briefcase },
  { label: "المدربين", href: "/trainers", icon: UserCheck },
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

  const { cartCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();

  const [localUserEmail, setLocalUserEmail] = useState<string | null>(null);
  const [localUserName, setLocalUserName] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const updateAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setLocalUserEmail(data.user?.email || null);
            if (data.user?.name) {
              setLocalUserName(data.user.name);
            }
          }
        } else {
          if (isMounted) {
            setLocalUserEmail(null);
            setLocalUserName(null);
          }
        }
      } catch {
        if (isMounted) {
          setLocalUserEmail(null);
          setLocalUserName(null);
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };
    updateAuth();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaMenuOpen(false);
    setMobileMegaMenuOpen(false);
  }, [pathname]);

  const isDarkPage = false;

  return (
    <>
      <nav
        data-scrolled={scrolled ? "true" : "false"}
        className={`premium-navbar fixed top-0 inset-x-0 z-50 transition-all duration-500 font-[family-name:var(--font-cairo)] ${
          isDarkPage ? "premium-navbar-dark" : "premium-navbar-light"
        }`}
      >
        <div className="premium-navbar-inner max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-5 xl:px-12 flex items-center justify-between">
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
                      className={`premium-nav-link flex items-center gap-1.5 px-3 py-2 rounded-xl text-[14px] xl:text-[15px] font-black font-[family-name:var(--font-cairo)] transition-all duration-300 whitespace-nowrap group ${
                        isActive || megaMenuOpen
                          ? isDarkPage
                            ? "text-[#5CB07C] bg-white/10"
                            : "bg-gradient-to-r from-[#173A7C]/10 via-[#1E4D9D]/10 to-[#5CB07C]/10 border border-[#173A7C]/15 shadow-xs"
                          : isDarkPage
                            ? "text-slate-300 hover:text-white hover:bg-white/5"
                            : "text-[#173A7C] hover:bg-white/65"
                      }`}
                    >
                      <Icon className={`w-4 h-4 transition-colors duration-300 ${
                        isActive || megaMenuOpen
                          ? isDarkPage ? "text-[#5CB07C]" : "text-[#173A7C]"
                          : isDarkPage ? "text-slate-400" : "text-[#173A7C]/55 group-hover:text-[#173A7C]"
                      }`} strokeWidth={2.5} />
                      <span className={`${
                        isActive || megaMenuOpen
                          ? isDarkPage
                            ? "text-[#5CB07C]"
                            : "text-[#173A7C]"
                          : isDarkPage
                            ? "text-slate-300 group-hover:text-white"
                            : "text-[#173A7C]"
                      }`}>
                        {link.label}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 mr-0.5 transition-transform duration-300 ${megaMenuOpen ? 'rotate-180 text-[#173A7C]' : ''}`} />
                    </button>

                    {/* Desktop Mega Menu Dropdown */}
                    <div
                      className={`absolute top-full right-1/2 translate-x-1/2 pt-2 w-[850px] transition-all duration-300 transform origin-top ${
                        megaMenuOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
                      }`}
                    >
                      <div className={`backdrop-blur-2xl rounded-3xl shadow-[0_30px_70px_rgba(23,58,124,0.12)] border p-8 grid grid-cols-2 gap-x-8 gap-y-4 ${
                        isDarkPage
                          ? "bg-gradient-to-br from-[#0A162B]/95 via-[#0E2242]/95 to-[#173A7C]/95 border-white/10 text-white"
                          : "bg-white/98 border-slate-200/80 text-slate-800"
                      }`}>
                        {megaMenuItems.map((item, idx) => (
                          <Link
                            key={idx}
                            href={item.href}
                            className="group/item flex items-start gap-4 p-3.5 rounded-2xl hover:bg-[#173A7C]/5 transition-all duration-300"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#173A7C]/10 to-[#5CB07C]/10 flex items-center justify-center text-[#173A7C] group-hover/item:scale-110 group-hover/item:bg-[#173A7C] group-hover/item:text-white transition-all duration-300 shrink-0">
                              <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-black text-sm text-slate-900 group-hover/item:text-[#173A7C] transition-colors">
                                {item.label}
                              </div>
                              <div className="text-xs text-slate-500 font-bold mt-0.5 leading-relaxed">
                                خدمات واستمارات شؤون المتدربين
                              </div>
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
                  key={link.label}
                  href={link.href}
                  className={`premium-nav-link flex items-center gap-1.5 px-3 py-2 rounded-xl text-[14px] xl:text-[15px] font-black font-[family-name:var(--font-cairo)] transition-all duration-300 whitespace-nowrap group ${
                    isActive
                      ? isDarkPage
                        ? "text-[#5CB07C] bg-white/10"
                        : "bg-gradient-to-r from-[#173A7C]/10 via-[#1E4D9D]/10 to-[#5CB07C]/10 border border-[#173A7C]/15 shadow-xs"
                      : isDarkPage
                        ? "text-slate-300 hover:text-white hover:bg-white/5"
                        : "text-[#173A7C] hover:bg-white/65"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors duration-300 ${
                    isActive
                      ? isDarkPage ? "text-[#5CB07C]" : "text-[#173A7C]"
                      : isDarkPage ? "text-slate-400" : "text-[#173A7C]/55 group-hover:text-[#173A7C]"
                  }`} strokeWidth={2.5} />
                  <span className={`${
                    isActive
                      ? isDarkPage
                        ? "text-[#5CB07C]"
                        : "text-[#173A7C]"
                      : isDarkPage
                        ? "text-slate-300 group-hover:text-white"
                        : "text-[#173A7C]"
                  }`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions: Wishlist + Cart + Profile/Login */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            {/* Wishlist Button */}
            <Link
              href="/dashboard/student/wishlist"
              className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border ${
                isDarkPage
                  ? "bg-white/5 border-white/10 text-slate-300 hover:text-rose-400 hover:bg-white/10"
                  : "bg-white/70 border-[#173A7C]/12 text-[#173A7C] hover:text-rose-500 hover:bg-white hover:shadow-md"
              }`}
              title="المفضلة"
              aria-label="المفضلة"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border cursor-pointer ${
                isDarkPage
                  ? "bg-white/5 border-white/10 text-slate-300 hover:text-[#5CB07C] hover:bg-white/10"
                  : "bg-white/70 border-[#173A7C]/12 text-[#173A7C] hover:bg-white hover:shadow-md"
              }`}
              title="سلة المشتريات"
              aria-label="سلة المشتريات"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Auth CTA */}
            {authLoading ? (
              <div className="w-24 h-9 rounded-xl bg-slate-100/70 border border-slate-200/50 animate-pulse" />
            ) : localUserEmail ? (
              <Link href="/dashboard/student" className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border border-transparent ${
                isDarkPage
                  ? "hover:bg-white/5 hover:border-white/10"
                  : "hover:bg-slate-50 hover:border-slate-200"
              }`}>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                  isDarkPage
                    ? "bg-white/10 border-white/20 text-[#5CB07C]"
                    : "bg-[#173A7C]/10 border-[#173A7C]/20 text-[#173A7C]"
                }`}>
                  <User className="w-4 h-4" />
                </div>
                <span className={`text-sm font-bold ${isDarkPage ? "text-slate-200" : "text-[#173A7C] engraved-nav-text"}`}>
                  {localUserName?.split(' ')[0] || localUserEmail.split('@')[0]}
                </span>
              </Link>
            ) : (
              <Button href="/auth/login" size="sm" className="text-xs xl:text-sm px-4 py-1.5 whitespace-nowrap">
                تسجيل دخول
              </Button>
            )}
          </div>

          {/* Mobile Actions: Cart + Menu Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={openCart}
              className={`relative p-2 rounded-xl transition-colors ${
                isDarkPage ? "text-slate-200 bg-white/5" : "text-[#173A7C] bg-white/75 border border-[#173A7C]/10 shadow-sm"
              }`}
              aria-label="السلة"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`p-2 transition-colors ${
                isDarkPage
                  ? "text-slate-300 hover:text-white"
                  : "text-[#173A7C] hover:text-[#0D2B61]"
              }`}
              aria-label="القائمة"
            >
              {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-500 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        <div
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl
            transform transition-transform duration-500 flex flex-col font-[family-name:var(--font-cairo)] ${
              mobileOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <img src="/logo.svg" alt="TTi Logo" className="h-10 w-auto object-contain" />
            <button aria-label="إغلاق" onClick={() => setMobileOpen(false)} className="text-slate-500 hover:text-red-500 bg-white p-2 rounded-full shadow-sm">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-2 flex-1 overflow-y-auto">
            {/* Mobile Wishlist Link */}
            <Link
              href="/dashboard/student/wishlist"
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-rose-50/70 text-rose-700 font-black text-sm mb-2"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>قائمة المفضلة</span>
              </div>
              <span className="bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-full text-xs font-black">
                {wishlistCount}
              </span>
            </Link>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.hasMegaMenu && pathname.startsWith('/trainees'));

              if (link.hasMegaMenu) {
                return (
                  <div key={link.label} className="flex flex-col border-b border-slate-100 pb-2 mb-2">
                    <button
                      onClick={() => setMobileMegaMenuOpen(!mobileMegaMenuOpen)}
                      className={`premium-nav-link flex items-center justify-between px-4 py-3 rounded-xl text-base font-black transition-all w-full ${
                        isActive || mobileMegaMenuOpen
                          ? "bg-gradient-to-r from-[#173A7C]/10 via-[#1E4D9D]/10 to-[#5CB07C]/10 border border-[#173A7C]/10 text-[#173A7C]"
                          : "text-[#173A7C] hover:bg-[#173A7C]/5"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive || mobileMegaMenuOpen ? "text-[#173A7C]" : "text-[#173A7C]/55"}`} />
                        <span className="text-[#173A7C]">
                          {link.label}
                        </span>
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
                            className="p-2.5 text-sm font-bold text-slate-600 hover:text-[#173A7C] hover:bg-slate-50 rounded-lg block"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`premium-nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-base font-black transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#173A7C]/10 via-[#1E4D9D]/10 to-[#5CB07C]/10 border border-[#173A7C]/10 text-[#173A7C]"
                      : "text-[#173A7C] hover:bg-[#173A7C]/5"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-[#173A7C]" : "text-[#173A7C]/55"}`} />
                  <span className="text-[#173A7C]">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-3">
            {authLoading ? (
              <div className="w-full h-11 rounded-xl bg-slate-200/70 animate-pulse" />
            ) : localUserEmail ? (
              <Button href="/dashboard/student" className="w-full text-center justify-center">
                لوحة المتدرب
              </Button>
            ) : (
              <Button href="/auth/login" className="w-full text-center justify-center">
                تسجيل الدخول
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
