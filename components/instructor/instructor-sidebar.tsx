'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Award,
  ClipboardList,
  Radio,
  User,
  LogOut,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  FileCheck,
  ChevronLeft,
  X,
  Store,
  Newspaper,
  Briefcase,
} from 'lucide-react';
import { DefaultAvatar } from '@/components/student/default-avatar';
import { createClient } from '@/utils/supabase/client';

interface InstructorSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const InstructorSidebar: React.FC<InstructorSidebarProps> = ({
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<{
    fullName: string;
    avatarUrl: string | null;
    specialty: string;
  }>({
    fullName: 'المدرب المعتمد',
    avatarUrl: null,
    specialty: 'هيئة التدريس والتدريب',
  });

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('instructor_avatar');
        localStorage.removeItem('instructor_name');
      }
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      window.location.href = '/auth/login';
    }
  };

  useEffect(() => {
    async function loadInstructorProfile() {
      try {
        // Fast local storage cache check
        const cachedAvatar = typeof window !== 'undefined' ? localStorage.getItem('instructor_avatar') : null;
        const cachedName = typeof window !== 'undefined' ? localStorage.getItem('instructor_name') : null;
        if (cachedAvatar || cachedName) {
          setUserProfile((prev) => ({
            ...prev,
            avatarUrl: cachedAvatar || prev.avatarUrl,
            fullName: cachedName || prev.fullName,
          }));
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const metaName = user.user_metadata?.full_name || user.user_metadata?.name;
          const metaAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, bio')
            .eq('id', user.id)
            .maybeSingle();

          const finalAvatar = profile?.avatar_url || metaAvatar || cachedAvatar || null;
          const finalName = profile?.full_name || metaName || cachedName || user.email?.split('@')[0] || 'المدرب المعتمد';

          setUserProfile({
            fullName: finalName,
            avatarUrl: finalAvatar,
            specialty: profile?.bio || 'هيئة التدريس والتدريب',
          });

          if (finalAvatar) localStorage.setItem('instructor_avatar', finalAvatar);
          if (finalName) localStorage.setItem('instructor_name', finalName);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadInstructorProfile();

    // Listen for live instant profile updates from profile page
    const handleProfileUpdate = (e: any) => {
      if (e?.detail) {
        setUserProfile((prev) => ({
          ...prev,
          avatarUrl: e.detail.avatarUrl !== undefined ? e.detail.avatarUrl : prev.avatarUrl,
          fullName: e.detail.fullName || prev.fullName,
        }));
      } else {
        loadInstructorProfile();
      }
    };

    window.addEventListener('instructor-profile-updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);

    return () => {
      window.removeEventListener('instructor-profile-updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  const navItems = [
    { label: 'الرئيسية والمؤشرات', href: '/dashboard/instructor', icon: LayoutDashboard },
    { label: 'دوراتي التدريبية', href: '/dashboard/instructor/courses', icon: BookOpen },
    { label: 'المتدربون والطلاب', href: '/dashboard/instructor/students', icon: Users },
    { label: 'الورش والبث المباشر', href: '/dashboard/instructor/live', icon: Radio, count: 'مباشر' },
    { label: 'بنك الأسئلة والاختبارات', href: '/dashboard/instructor/quizzes', icon: Award },
    { label: 'الواجبات والتسليمات', href: '/dashboard/instructor/assignments', icon: ClipboardList },
    { label: 'المقالات والمنشورات', href: '/dashboard/instructor/articles', icon: Newspaper },
    { label: 'إدارة خدماتي بالمتجر', href: '/dashboard/instructor/services', icon: Briefcase },
    { label: 'الملف الشخصي والبيانات', href: '/dashboard/instructor/profile', icon: User },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden lg:block shrink-0 fixed top-0 right-0 bottom-0 h-screen z-40 font-[family-name:var(--font-cairo)] transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div
          className={`relative overflow-hidden rounded-none border-l h-full flex flex-col justify-between transition-all duration-300 ${
            isCollapsed ? 'p-2 pt-2' : 'px-3.5 py-3'
          }`}
          style={{
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(28px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
            boxShadow: '0 0 40px rgba(23, 58, 124, 0.06), 0 4px 20px rgba(0, 0, 0, 0.04)',
            borderLeft: '1px solid rgba(23, 58, 124, 0.08)',
          }}
        >
          <div className="space-y-3.5 relative z-10 overflow-y-auto no-scrollbar px-0.5 pt-1 flex-1">
            {/* Identity Card with Large Prominent Avatar */}
            <div
              className={`rounded-2xl border border-slate-200/90 transition-all duration-300 relative group overflow-hidden ${
                isCollapsed ? 'p-2 flex flex-col items-center justify-center' : 'p-3.5'
              }`}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.95) 100%)',
                boxShadow: '0 4px 14px rgba(23, 58, 124, 0.06), inset 0 1px 0 rgba(255, 255, 255, 1)',
              }}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3.5'}`}>
                {/* Prominent Large Avatar Frame */}
                <div className="relative shrink-0">
                  <div className={`${isCollapsed ? 'w-12 h-12' : 'w-14 h-14 sm:w-15 sm:h-15'} rounded-2xl overflow-hidden shadow-md ring-2 ring-[#173A7C]/20 border-2 border-white bg-gradient-to-br from-[#173A7C] to-[#2563EB] flex items-center justify-center`}>
                    {userProfile.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={userProfile.avatarUrl}
                        alt={userProfile.fullName}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <span className="text-lg sm:text-xl font-black text-white">
                        {userProfile.fullName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs animate-pulse" />
                </div>

                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="font-black text-sm sm:text-[15px] text-slate-900 truncate leading-tight" title={userProfile.fullName}>
                        {userProfile.fullName}
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-xs text-emerald-700 font-extrabold truncate">مدرب ومحاضر معتمد</p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-2 px-0.5 py-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`dashboard-nav-tab relative flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-lg shadow-[#173A7C]/25 border border-blue-400/40'
                        : 'text-slate-800 hover:text-[#173A7C] hover:bg-white border border-slate-200/90 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 flex items-center justify-center ${
                          isActive ? 'bg-white/20 text-white' : 'bg-[#173A7C]/10 text-[#173A7C] group-hover:bg-[#173A7C] group-hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {!isCollapsed && <span className={`dashboard-nav-tab-label truncate font-extrabold ${isActive ? 'text-white' : 'text-slate-800 group-hover:text-[#173A7C]'}`}>{item.label}</span>}
                    </div>

                    {!isCollapsed && item.count && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                        <span>{item.count}</span>
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ── Brand Logo & Academy Verification Card ── */}
          {!isCollapsed && (
            <div className="mt-4 pt-4 border-t border-slate-200/70 space-y-3">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-white/90 via-blue-50/60 to-emerald-50/40 border border-slate-200/80 shadow-xs space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white p-1.5 shadow-sm border border-slate-200/80 flex items-center justify-center shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.webp" alt="النبض المستدام" className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-black text-xs text-[#173A7C] truncate">منصة النبض المستدام</h5>
                    <p className="text-[10px] text-slate-500 font-bold">البوابة الأكاديمية المعتمدة</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] font-bold text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>نظام متكامل 2026</span>
                  </span>
                  <Link href="/" className="hover:text-[#173A7C] flex items-center gap-0.5 text-[#173A7C] font-black">
                    <span>الموقع</span>
                    <ChevronLeft className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="mt-3 pt-3 border-t border-slate-200/70">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer border border-transparent hover:border-red-200 ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4 text-red-600 shrink-0" />
              {!isCollapsed && <span>تسجيل الخروج</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE SIDEBAR */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative w-72 max-w-[85vw] h-full bg-white p-4 flex flex-col justify-between z-10 font-[family-name:var(--font-cairo)] overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#173A7C]" />
                  <span className="font-black text-sm text-[#173A7C]">لوحة تحكم المدرب</span>
                </div>
                <button onClick={onCloseMobile} className="p-1 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div
                className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200/90"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.95) 100%)',
                  boxShadow: '0 4px 12px rgba(23, 58, 124, 0.06)',
                }}
              >
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md ring-2 ring-[#173A7C]/20 border-2 border-white bg-gradient-to-br from-[#173A7C] to-[#2563EB] flex items-center justify-center">
                    {userProfile.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={userProfile.avatarUrl}
                        alt={userProfile.fullName}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <span className="text-lg font-black text-white">
                        {userProfile.fullName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-black text-slate-900 mb-0.5 truncate">{userProfile.fullName}</h4>
                  <p className="text-xs text-emerald-700 font-extrabold truncate">مدرب ومحاضر معتمد</p>
                </div>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`dashboard-nav-tab flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20 border border-blue-400/40'
                          : 'text-slate-800 hover:text-[#173A7C] hover:bg-white border border-slate-200/90 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span className="dashboard-nav-tab-label">{item.label}</span>
                      </div>
                      {item.count && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Logout Button */}
              <div className="pt-3 border-t border-slate-200/80">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all cursor-pointer border border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
