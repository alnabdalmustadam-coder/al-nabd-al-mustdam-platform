"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, X, Home, Info, BookOpen, Briefcase,
  Users, UserCheck, Phone, ChevronDown, FileText, ChevronLeft, User,
  ShoppingCart, Heart, LayoutDashboard, LogOut, Settings, Crown, Shield
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { createClient } from "@/utils/supabase/client";

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
  const router = useRouter();

  const [localUserEmail, setLocalUserEmail] = useState<string | null>(null);
  const [localUserName, setLocalUserName] = useState<string | null>(null);
  const [localUserAvatar, setLocalUserAvatar] = useState<string | null>(null);
  const [userDashboardUrl, setUserDashboardUrl] = useState<string>("/dashboard");
  const [userRoleLabel, setUserRoleLabel] = useState<string>("لوحة التحكم");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const updateAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setLocalUserEmail(data.user?.email || null);
            setLocalUserName(data.user?.name || null);
            // Set user's real avatarUrl or null (never preserve old cross-role cached avatars)
            setLocalUserAvatar(data.user?.avatarUrl || null);
            if (data.user?.dashboardUrl) {
              setUserDashboardUrl(data.user.dashboardUrl);
            }
            if (data.user?.roleLabel) {
              setUserRoleLabel(data.user.roleLabel);
            }
            if (data.user?.role) {
              setUserRole(data.user.role);
            }
          }
        } else {
          if (isMounted) {
            setLocalUserEmail(null);
            setLocalUserName(null);
            setLocalUserAvatar(null);
            setUserDashboardUrl("/dashboard");
            setUserRoleLabel("لوحة التحكم");
            setUserRole(null);
          }
        }
      } catch {
        if (isMounted) {
          setLocalUserEmail(null);
          setLocalUserName(null);
          setLocalUserAvatar(null);
          setUserDashboardUrl("/dashboard");
          setUserRoleLabel("لوحة التحكم");
          setUserRole(null);
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    updateAuth();

    const handleProfileUpdate = (e: any) => {
      if (e?.detail) {
        if (e.detail.avatarUrl !== undefined) setLocalUserAvatar(e.detail.avatarUrl || null);
        if (e.detail.fullName) setLocalUserName(e.detail.fullName);
      }
      updateAuth();
    };

    window.addEventListener("nabd_user_updated", handleProfileUpdate);
    window.addEventListener("student-profile-updated", handleProfileUpdate);
    window.addEventListener("admin-profile-updated", handleProfileUpdate);
    window.addEventListener("instructor-profile-updated", handleProfileUpdate);
    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("nabd_user_updated", handleProfileUpdate);
      window.removeEventListener("student-profile-updated", handleProfileUpdate);
      window.removeEventListener("admin-profile-updated", handleProfileUpdate);
      window.removeEventListener("instructor-profile-updated", handleProfileUpdate);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, [pathname]);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setUserMenuOpen(false);
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      const supabase = createClient();
      await supabase.auth.signOut().catch(() => {});
    } catch (err) {
      console.error('Navbar logout error:', err);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('student_avatar');
        localStorage.removeItem('student_name');
        localStorage.removeItem('student_phone');
        localStorage.removeItem('student_national_id');
        localStorage.removeItem('admin_avatar');
        localStorage.removeItem('admin_name');
        localStorage.removeItem('instructor_avatar');
        localStorage.removeItem('instructor_name');
        window.dispatchEvent(new Event('nabd_user_updated'));
      }
      setLocalUserEmail(null);
      setLocalUserName(null);
      setLocalUserAvatar(null);
      setUserRole(null);
      router.push('/auth/login');
    }
  };

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
              <div className="w-10 h-10 rounded-full bg-slate-100/80 border border-slate-200/60 animate-pulse shrink-0" />
            ) : localUserEmail ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="relative group p-0.5 rounded-full transition-transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#173A7C]/30"
                  aria-label="حساب المستخدم"
                  aria-expanded={userMenuOpen}
                >
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all ${
                    userRole === 'ADMIN'
                      ? "ring-2 ring-amber-400/60 group-hover:ring-amber-400 bg-gradient-to-br from-[#0B1A3B] via-[#122A5E] to-[#1C3F8B]"
                      : userRole === 'INSTRUCTOR'
                      ? "ring-2 ring-emerald-500/40 group-hover:ring-emerald-500 bg-gradient-to-br from-[#173A7C] to-[#5CB07C]"
                      : "ring-2 ring-[#173A7C]/25 group-hover:ring-[#173A7C]/50 bg-gradient-to-br from-[#173A7C] via-[#1E4D9D] to-[#2563EB]"
                  }`}>
                    {localUserAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={localUserAvatar}
                        alt={localUserName || "المستخدم"}
                        className="w-full h-full object-cover object-top"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={() => setLocalUserAvatar(null)}
                      />
                    ) : userRole === 'ADMIN' ? (
                      <Crown className="w-5 h-5 text-amber-300" />
                    ) : userRole === 'INSTRUCTOR' ? (
                      <UserCheck className="w-5 h-5 text-emerald-200" />
                    ) : (
                      <span className="text-white text-base font-black">
                        {localUserName ? localUserName.charAt(0) : <User className="w-5 h-5 text-white" />}
                      </span>
                    )}
                  </div>
                  {/* Online indicator */}
                  <span className={`absolute bottom-0 left-0 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                    userRole === 'ADMIN' ? "bg-amber-400 animate-pulse" : "bg-emerald-500"
                  }`} />
                </button>

                {/* Modern Dropdown Menu */}
                {userMenuOpen && (
                  <div 
                    className="absolute left-0 mt-3 w-68 rounded-2xl border border-slate-200/90 bg-white/98 backdrop-blur-2xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    dir="rtl"
                  >
                    {/* User Identity Card */}
                    <div className={`p-3 rounded-xl border mb-1.5 flex items-center gap-3 ${
                      userRole === 'ADMIN' 
                        ? "bg-amber-50/50 border-amber-200/70"
                        : "bg-slate-50/90 border-slate-100"
                    }`}>
                      <div className={`w-11 h-11 rounded-full overflow-hidden ring-1 shrink-0 flex items-center justify-center ${
                        userRole === 'ADMIN'
                          ? "bg-gradient-to-br from-[#0B1A3B] to-[#173A7C] ring-amber-300 text-amber-300"
                          : "bg-[#173A7C]/10 ring-slate-200 text-[#173A7C]"
                      }`}>
                        {localUserAvatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={localUserAvatar}
                            alt=""
                            className="w-full h-full object-cover object-top"
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                          />
                        ) : userRole === 'ADMIN' ? (
                          <Crown className="w-5 h-5 text-amber-300" />
                        ) : userRole === 'INSTRUCTOR' ? (
                          <UserCheck className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <User className="w-5 h-5 text-[#173A7C]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-slate-900 truncate">
                          {localUserName || (userRole === 'ADMIN' ? "المدير العام (Super Admin)" : "مستخدم معتمد")}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold truncate">
                          {localUserEmail}
                        </div>
                        <span className={`inline-block mt-1 text-[9px] font-black px-2.5 py-0.5 rounded-full border ${
                          userRole === 'ADMIN'
                            ? "bg-amber-100/90 text-amber-900 border-amber-300"
                            : userRole === 'INSTRUCTOR'
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-blue-50 text-[#173A7C] border-blue-200/60"
                        }`}>
                          {userRole === 'ADMIN' ? '👑 مدير المنصة (Super Admin)' : userRoleLabel}
                        </span>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="space-y-0.5 text-xs font-bold text-slate-700">
                      <Link
                        href={userDashboardUrl}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#173A7C]/8 hover:text-[#173A7C] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#173A7C]" />
                        <span>{userRole === 'ADMIN' ? 'لوحة الإدارة المركزية' : userRole === 'INSTRUCTOR' ? 'لوحة تحكم المدرب' : 'لوحة التحكم'}</span>
                      </Link>

                      <Link
                        href={
                          userRole === 'ADMIN'
                            ? '/dashboard/admin/profile'
                            : userRole === 'INSTRUCTOR'
                            ? '/dashboard/instructor/profile'
                            : '/dashboard/student/profile'
                        }
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#173A7C]/8 hover:text-[#173A7C] transition-colors"
                      >
                        <Settings className="w-4 h-4 text-[#173A7C]" />
                        <span>{userRole === 'ADMIN' ? 'الملف الشخصي للمدير' : userRole === 'INSTRUCTOR' ? 'الملف الشخصي للمدرب' : 'الملف الشخصي والإعدادات'}</span>
                      </Link>

                      {userRole === 'ADMIN' && (
                        <Link
                          href="/dashboard/admin/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#173A7C]/8 hover:text-[#173A7C] transition-colors"
                        >
                          <Shield className="w-4 h-4 text-amber-600" />
                          <span>إعدادات وتراخيص المنصة</span>
                        </Link>
                      )}
                    </div>

                    <div className="h-px bg-slate-100 my-1.5" />

                    {/* Logout */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50/80 transition-colors cursor-pointer text-right"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
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

          <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex flex-col gap-3">
            {authLoading ? (
              <div className="w-full h-11 rounded-xl bg-slate-200/70 animate-pulse" />
            ) : localUserEmail ? (
              <div className="space-y-3">
                <div className={`flex items-center gap-3 p-3 rounded-2xl border shadow-xs ${
                  userRole === 'ADMIN' ? "bg-amber-50/60 border-amber-200" : "bg-white border-slate-200/80"
                }`}>
                  <div className={`w-11 h-11 rounded-full overflow-hidden shrink-0 flex items-center justify-center ${
                    userRole === 'ADMIN'
                      ? "bg-gradient-to-br from-[#0B1A3B] to-[#173A7C] ring-2 ring-amber-300 text-amber-300"
                      : userRole === 'INSTRUCTOR'
                      ? "bg-gradient-to-br from-[#173A7C] to-[#5CB07C] ring-2 ring-emerald-400 text-white"
                      : "bg-[#173A7C]/10 ring-2 ring-[#173A7C]/20 text-[#173A7C]"
                  }`}>
                    {localUserAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={localUserAvatar}
                        alt=""
                        className="w-full h-full object-cover object-top"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                      />
                    ) : userRole === 'ADMIN' ? (
                      <Crown className="w-5 h-5 text-amber-300" />
                    ) : userRole === 'INSTRUCTOR' ? (
                      <UserCheck className="w-5 h-5 text-emerald-200" />
                    ) : (
                      <User className="w-5 h-5 text-[#173A7C]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-slate-900 truncate">
                      {localUserName || (userRole === 'ADMIN' ? 'المدير العام (Super Admin)' : 'مستخدم معتمد')}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold truncate">{localUserEmail}</p>
                    <span className={`inline-block mt-0.5 text-[9px] font-black px-2 py-0.5 rounded-full border ${
                      userRole === 'ADMIN'
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : userRole === 'INSTRUCTOR'
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-blue-50 text-[#173A7C] border-blue-200/60"
                    }`}>
                      {userRole === 'ADMIN' ? '👑 مدير المنصة (Super Admin)' : userRoleLabel}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button href={userDashboardUrl} size="sm" className="w-full justify-center text-xs font-black">
                    <LayoutDashboard className="w-3.5 h-3.5 ml-1.5" />
                    {userRole === 'ADMIN' ? 'لوحة الإدارة' : 'لوحة التحكم'}
                  </Button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-black hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    تسجيل الخروج
                  </button>
                </div>
              </div>
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
