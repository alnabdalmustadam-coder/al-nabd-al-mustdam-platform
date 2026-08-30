'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Home,
  User,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from 'lucide-react';
import { DefaultAvatar } from './default-avatar';
import Link from 'next/link';
import { StudentNotifications } from '@/components/student/student-notifications';
import { createClient } from '@/utils/supabase/client';

interface StudentHeaderProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onToggleMobileMenu?: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  isSidebarCollapsed = false,
  onToggleSidebar,
  onToggleMobileMenu,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    fullName: string;
    avatarUrl: string | null;
  }>({
    fullName: '',
    avatarUrl: null,
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const cachedAvatar = typeof window !== 'undefined' ? localStorage.getItem('student_avatar') : null;
        const cachedName = typeof window !== 'undefined' ? localStorage.getItem('student_name') : null;
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
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .maybeSingle();

          const finalAvatar = profile?.avatar_url || metaAvatar || cachedAvatar || null;
          const finalName = profile?.full_name || metaName || cachedName || '';

          setUserProfile({
            fullName: finalName,
            avatarUrl: finalAvatar,
          });

          if (finalAvatar && typeof window !== 'undefined') localStorage.setItem('student_avatar', finalAvatar);
          if (finalName && typeof window !== 'undefined') localStorage.setItem('student_name', finalName);
        }
      } catch (e) {
        console.error('Error loading header user:', e);
      }
    }
    loadUser();

    const handleProfileUpdate = (e: any) => {
      if (e?.detail) {
        setUserProfile((prev) => ({
          ...prev,
          avatarUrl: e.detail.avatarUrl !== undefined ? e.detail.avatarUrl : prev.avatarUrl,
          fullName: e.detail.fullName || prev.fullName,
        }));
      } else {
        loadUser();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleProfileUpdate);
      window.addEventListener('student-profile-updated', handleProfileUpdate);
      window.addEventListener('profileUpdated', handleProfileUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleProfileUpdate);
        window.removeEventListener('student-profile-updated', handleProfileUpdate);
        window.removeEventListener('profileUpdated', handleProfileUpdate);
      }
    };
  }, []);

  return (
    <header className="sticky top-0 z-[30] w-full font-[family-name:var(--font-cairo)] m-0 p-0">
      {/* Sleek 100% Flush Header with Platform Logo & Glass Backdrop */}
      <div
        className="w-full rounded-none px-3.5 sm:px-6 py-[calc(0.75rem+1vh)] min-h-[calc(3.75rem+2vh)] flex items-center justify-between gap-2 sm:gap-4 transition-all duration-300 relative z-30"
        style={{
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(28px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.60)',
        }}
      >
        {/* RIGHT SIDE (RTL): Mobile Sidebar Toggle & Platform Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Menu Button */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden w-9 h-9 rounded-xl text-slate-700 hover:text-[#173A7C] bg-slate-100/80 hover:bg-slate-200/80 transition-all border border-slate-200/60 shrink-0 cursor-pointer flex items-center justify-center"
              title="القائمة الجانبية"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Desktop Sidebar Collapse Button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              title={isSidebarCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
              className="hidden lg:flex w-9 h-9 rounded-xl text-slate-700 hover:text-[#173A7C] bg-slate-100/80 hover:bg-slate-200/80 transition-all border border-slate-200/60 shrink-0 cursor-pointer items-center justify-center"
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          )}

          {/* Platform Logo */}
          <Link
            href="/dashboard/student"
            className="flex items-center gap-2 shrink-0 transition-transform hover:scale-105"
            title="منصة النبض المستدام"
          >
            <img src="/logo.svg" alt="شعار منصة النبض المستدام" className="h-8 sm:h-9 w-auto object-contain" />
          </Link>
        </div>

        {/* CENTER: Desktop Search Bar (Hidden on Mobile) */}
        <div className="hidden md:flex flex-1 min-w-0 max-w-md mx-4">
          <div className="w-full relative flex items-center px-3.5 rounded-xl border border-slate-200/80 overflow-hidden transition-all focus-within:border-[#173A7C] bg-slate-50/80 shadow-xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            <input
              type="text"
              placeholder="البحث بالمنصة..."
              className="w-full py-2 text-xs font-bold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none min-w-0"
            />
            <kbd className="inline-flex items-center gap-1 mr-2 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-white rounded border border-slate-200 shrink-0">
              Ctrl + K
            </kbd>
          </div>
        </div>

        {/* LEFT SIDE (RTL): Mobile Search Icon, Home Link, Notifications, Profile Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Search Button Toggle */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden w-9 h-9 rounded-xl text-slate-700 hover:text-[#173A7C] bg-slate-100/80 hover:bg-slate-200/80 transition-all border border-slate-200/60 shrink-0 cursor-pointer flex items-center justify-center"
            title="البحث بالمنصة"
          >
            {isMobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          {/* Go to Home Link (Uniform 9x9 size matching mobile icons) */}
          <Link
            href="/"
            className="w-9 h-9 sm:w-auto sm:px-3 sm:py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-[#173A7C] hover:text-[#1E4D9D] transition-all cursor-pointer border border-slate-200/60 flex items-center justify-center gap-1.5 shrink-0 text-xs font-black"
            title="الذهاب للرئيسية"
          >
            <Home className="w-4 h-4 text-[#173A7C] shrink-0" />
            <span className="hidden sm:inline">الرئيسية</span>
          </Link>

          {/* System Notifications Component */}
          <StudentNotifications />

          {/* Student Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full text-slate-700 hover:text-[#173A7C] transition-all cursor-pointer flex items-center justify-center border border-slate-200/60 p-0.5 overflow-hidden"
              title="الملف الشخصي والحساب"
            >
              <DefaultAvatar
                src={userProfile.avatarUrl}
                name={userProfile.fullName}
                size="sm"
              />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div
                className="absolute top-full mt-2 left-0 w-56 rounded-xl border border-slate-200 p-2 shadow-2xl z-[1000] text-right space-y-1 font-[family-name:var(--font-cairo)] bg-white text-slate-800"
              >
                <Link
                  href="/dashboard/student/profile"
                  className="flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <User className="w-4 h-4 text-[#5CB07C]" />
                  <span>الملف الشخصي</span>
                </Link>
                <div className="pt-1 border-t border-slate-200">
                  <button
                    onClick={async () => {
                      try {
                        await fetch('/api/auth/logout', { method: 'POST' });
                      } catch (e) {
                        console.error('Logout error:', e);
                      }
                      window.location.href = '/auth/login';
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Mobile Search Bar (Only visible when toggled on mobile) */}
      {isMobileSearchOpen && (
        <div className="md:hidden w-full px-4 py-3 bg-white/95 border-b border-slate-200/80 backdrop-blur-md shadow-md animate-fade-in-down">
          <div className="relative flex items-center px-3.5 rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50 shadow-xs">
            <Search className="w-4 h-4 text-[#173A7C] shrink-0 ml-2" />
            <input
              type="text"
              autoFocus
              placeholder="ابحث عن المحتوى والدروس والشهادات..."
              className="w-full py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none min-w-0"
            />
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg text-xs font-bold mr-1"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
