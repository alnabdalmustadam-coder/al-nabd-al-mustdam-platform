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

  useEffect(() => {
    async function loadInstructorProfile() {
      try {
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

          setUserProfile({
            fullName: profile?.full_name || metaName || user.email?.split('@')[0] || 'المدرب المعتمد',
            avatarUrl: profile?.avatar_url || metaAvatar || null,
            specialty: profile?.bio || 'هيئة التدريس والتدريب',
          });
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadInstructorProfile();
  }, []);

  const navItems = [
    { label: 'الرئيسية والمؤشرات', href: '/dashboard/instructor', icon: LayoutDashboard },
    { label: 'دوراتي التدريبية', href: '/dashboard/instructor/courses', icon: BookOpen },
    { label: 'المتدربون والطلاب', href: '/dashboard/instructor/students', icon: Users },
    { label: 'الورش والبث المباشر', href: '/dashboard/instructor/live', icon: Radio, count: 'بث 🔴' },
    { label: 'بنك الأسئلة والاختبارات', href: '/dashboard/instructor/quizzes', icon: Award },
    { label: 'الواجبات والتسليمات', href: '/dashboard/instructor/assignments', icon: ClipboardList },
    { label: 'متجر الخدمات', href: '/marketplace', icon: Store, badge: 'جديد' },
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
            isCollapsed ? 'p-2 pt-1' : 'px-3.5 py-2.5'
          }`}
          style={{
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(28px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
            boxShadow: '0 0 40px rgba(23, 58, 124, 0.06), 0 4px 20px rgba(0, 0, 0, 0.04)',
            borderLeft: '1px solid rgba(23, 58, 124, 0.08)',
          }}
        >
          <div className="space-y-3 relative z-10 overflow-y-auto no-scrollbar px-0.5 pt-1 flex-1">
            {/* Identity Card */}
            <div
              className={`rounded-2xl border border-slate-200/90 transition-all duration-300 relative group overflow-hidden ${
                isCollapsed ? 'p-2 flex items-center justify-center' : 'p-3.5'
              }`}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.92) 100%)',
                boxShadow: '0 2px 8px rgba(23, 58, 124, 0.05), inset 0 1px 0 rgba(255, 255, 255, 1)',
              }}
            >
              <div className="flex items-center gap-3">
                <DefaultAvatar src={userProfile.avatarUrl} name={userProfile.fullName} size="md" />
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="font-black text-sm sm:text-[15px] text-slate-900 truncate leading-tight" title={userProfile.fullName}>
                        {userProfile.fullName}
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-xs text-emerald-700 font-bold truncate">مدرب ومحاضر معتمد</p>
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
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Logo & Back to Home */}
          {!isCollapsed && (
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-500">
              <Link href="/" className="hover:text-[#173A7C] flex items-center gap-1">
                <span>الرئيسية</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[10px]">بوابة المدرب المعتمد</span>
            </div>
          )}
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
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/90"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.92) 100%)',
                  boxShadow: '0 2px 8px rgba(23, 58, 124, 0.05)',
                }}
              >
                <DefaultAvatar src={userProfile.avatarUrl} name={userProfile.fullName} size="md" />
                <div>
                  <h4 className="text-sm font-black text-slate-900 mb-0.5">{userProfile.fullName}</h4>
                  <p className="text-xs text-emerald-700 font-bold">مدرب ومحاضر معتمد</p>
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};
