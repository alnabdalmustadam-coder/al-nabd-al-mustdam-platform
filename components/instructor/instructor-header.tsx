'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Home,
  User,
  LogOut,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  GraduationCap,
  BookOpen,
  Users,
  Newspaper,
  Briefcase,
  X,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { DefaultAvatar } from '@/components/student/default-avatar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface InstructorHeaderProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onToggleMobileMenu?: () => void;
}

export const InstructorHeader: React.FC<InstructorHeaderProps> = ({
  isSidebarCollapsed = false,
  onToggleSidebar,
  onToggleMobileMenu,
}) => {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [userProfile, setUserProfile] = useState<{
    fullName: string;
    avatarUrl: string | null;
  }>({
    fullName: 'المدرب المعتمد',
    avatarUrl: null,
  });

  useEffect(() => {
    async function loadUser() {
      try {
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
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .maybeSingle();

          const finalAvatar = profile?.avatar_url || metaAvatar || cachedAvatar || null;
          const finalName = profile?.full_name || metaName || cachedName || user.email?.split('@')[0] || 'المدرب المعتمد';

          setUserProfile({
            fullName: finalName,
            avatarUrl: finalAvatar,
          });

          if (finalAvatar) localStorage.setItem('instructor_avatar', finalAvatar);
          if (finalName) localStorage.setItem('instructor_name', finalName);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadUser();

    // Listen for live instant profile updates
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

    window.addEventListener('instructor-profile-updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);

    return () => {
      window.removeEventListener('instructor-profile-updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  // Close search suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchFocused(false);
    router.push(`/dashboard/instructor/courses?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const quickSearchShortcuts = [
    {
      title: 'البحث في المتدربين والطلاب',
      url: `/dashboard/instructor/students${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
      icon: Users,
      badge: 'الطلاب',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'البحث في المقررات والمناهج',
      url: `/dashboard/instructor/courses${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
      icon: BookOpen,
      badge: 'الدورات',
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      title: 'البحث في المقالات الأكاديمية',
      url: `/dashboard/instructor/articles${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
      icon: Newspaper,
      badge: 'المقالات',
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'البحث في باقات الخدمات والاستشارات',
      url: `/dashboard/instructor/services${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
      icon: Briefcase,
      badge: 'الخدمات',
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <header className="sticky top-0 z-40 font-[family-name:var(--font-cairo)] px-4 sm:px-8 py-3 sm:py-4 bg-white/90 backdrop-blur-2xl border-b border-slate-200/90 shadow-xs min-h-[72px] sm:min-h-[78px] flex items-center transition-all">
      <div className="flex items-center justify-between gap-4 w-full">
        {/* 1. Toggle Sidebar & Brand */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 cursor-pointer border border-slate-200"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex p-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 cursor-pointer border border-slate-200 transition-colors"
            title={isSidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20 border border-white/20">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xs sm:text-sm font-black text-[#173A7C] block leading-tight">
                لوحة تحكم المحاضر
              </span>
              <span className="text-[10px] font-bold text-slate-500 block">
                البوابة الأكاديمية المعتمدة
              </span>
            </div>
          </div>
        </div>

        {/* 2. Global Real-time Search Bar */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-lg mx-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="بحث في الطلاب، المقررات، المقالات، والخدمات..."
              className="w-full pl-9 pr-10 py-2.5 sm:py-3 rounded-2xl border border-slate-200/90 text-xs font-bold focus:outline-none focus:border-[#173A7C] focus:bg-white bg-slate-50/90 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Search Dropdown Quick Links */}
          {isSearchFocused && (
            <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2.5 z-50 space-y-1 text-right animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-black text-slate-400 flex items-center justify-between border-b border-slate-100 mb-1">
                <span>{searchQuery ? `نتائج البحث عن: "${searchQuery}"` : 'البحث السريع في المنصة'}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>

              {quickSearchShortcuts.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={idx}
                    href={item.url}
                    onClick={() => setIsSearchFocused(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 group-hover:text-[#173A7C]">
                        {item.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                        {item.badge}
                      </span>
                      <ArrowLeft className="w-3 h-3 text-slate-400 group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Action Controls & Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <Link
            href="/"
            className="hidden md:flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:text-[#173A7C] hover:bg-slate-100 border border-slate-200/80 transition-colors"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>الموقع الرئيسي</span>
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1.5 sm:p-2 rounded-2xl hover:bg-slate-100 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs ring-2 ring-[#173A7C]/20 border border-white bg-gradient-to-br from-[#173A7C] to-[#2563EB] flex items-center justify-center">
                  {userProfile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.fullName}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <span className="text-xs font-black text-white">
                      {userProfile.fullName.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-2xs animate-pulse" />
              </div>
              <div className="hidden sm:block text-right">
                <span className="text-xs font-black text-slate-900 block max-w-[130px] truncate leading-tight">
                  {userProfile.fullName}
                </span>
                <span className="text-[10px] font-extrabold text-emerald-700 block">
                  محاضر معتمد
                </span>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-white p-2.5 shadow-2xl border border-slate-200 z-50 text-right space-y-1">
                <div className="p-2 border-b border-slate-100 mb-1">
                  <span className="text-xs font-black text-slate-800 block truncate">{userProfile.fullName}</span>
                  <span className="text-[10px] text-slate-400 font-bold">عضو هيئة التدريب</span>
                </div>
                <Link
                  href="/dashboard/instructor/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <User className="w-4 h-4 text-[#173A7C]" />
                  <span>الملف التعريفي</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 text-right cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

