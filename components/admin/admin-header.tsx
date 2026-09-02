'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Home,
  LogOut,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Bell,
  BellRing,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  ChevronDown,
  ShieldCheck,
  User,
  Crown,
  Users,
  BookOpen,
  UserCheck,
  Award,
  FileQuestion,
  Headphones,
  ArrowLeft,
  Newspaper,
  Briefcase,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface AdminHeaderProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onToggleMobileMenu?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  isSidebarCollapsed = false,
  onToggleSidebar,
  onToggleMobileMenu,
}) => {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [adminProfile, setAdminProfile] = useState<{
    fullName: string;
    avatarUrl: string | null;
  }>({
    fullName: 'سعود القحطاني',
    avatarUrl: null,
  });

  useEffect(() => {
    async function loadAdminUser() {
      try {
        const cachedAvatar = typeof window !== 'undefined' ? localStorage.getItem('admin_avatar') : null;
        const cachedName = typeof window !== 'undefined' ? localStorage.getItem('admin_name') : null;
        if (cachedAvatar || cachedName) {
          setAdminProfile((prev) => ({
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

          const resolvedAvatar = profile?.avatar_url || metaAvatar || cachedAvatar || null;
          const resolvedName = profile?.full_name || metaName || cachedName || 'سعود القحطاني';

          setAdminProfile({
            fullName: resolvedName,
            avatarUrl: resolvedAvatar,
          });

          if (resolvedAvatar && typeof window !== 'undefined') localStorage.setItem('admin_avatar', resolvedAvatar);
          if (resolvedName && typeof window !== 'undefined') localStorage.setItem('admin_name', resolvedName);
        }
      } catch (err) {
        console.error('Error loading admin user in header:', err);
      }
    }

    loadAdminUser();

    const handleProfileUpdate = (e: any) => {
      if (e?.detail) {
        setAdminProfile((prev) => ({
          ...prev,
          avatarUrl: e.detail.avatarUrl !== undefined ? e.detail.avatarUrl : prev.avatarUrl,
          fullName: e.detail.fullName || prev.fullName,
        }));
      } else {
        loadAdminUser();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleProfileUpdate);
      window.addEventListener('admin-profile-updated', handleProfileUpdate);
      window.addEventListener('profileUpdated', handleProfileUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleProfileUpdate);
        window.removeEventListener('admin-profile-updated', handleProfileUpdate);
        window.removeEventListener('profileUpdated', handleProfileUpdate);
      }
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    router.push(`/dashboard/admin/users?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_avatar');
        localStorage.removeItem('admin_name');
      }
      router.push('/auth/login');
    }
  };

  const adminSearchCategories = [
    {
      title: 'البحث في بيانات الطلاب والمتدربين',
      url: `/dashboard/admin/users${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
      icon: Users,
      badge: 'الطلاب',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'البحث في المقررات والمناهج التدريبية',
      url: `/dashboard/admin/courses${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
      icon: BookOpen,
      badge: 'الدورات',
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      title: 'البحث في المقالات والنشر الأكاديمي',
      url: `/dashboard/admin/articles${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
      icon: Newspaper,
      badge: 'المقالات',
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'البحث في باقات الخدمات والاستشارات',
      url: `/dashboard/admin/services${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
      icon: Briefcase,
      badge: 'الخدمات',
      color: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'البحث في هيئة التدريب والمحاضرين',
      url: `/dashboard/admin/trainers${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
      icon: UserCheck,
      badge: 'المدربين',
      color: 'text-teal-600 bg-teal-50',
    },
    {
      title: 'البحث في السجلات والشهادات المعتمدة',
      url: `/dashboard/admin/certificates${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
      icon: Award,
      badge: 'الشهادات',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      title: 'البحث في تذاكر وطلبات الدعم الفني',
      url: `/dashboard/admin/support${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
      icon: Headphones,
      badge: 'الدعم الفني',
      color: 'text-rose-600 bg-rose-50',
    },
  ];

  const [notifications, setNotifications] = useState<{
    id: string;
    title: string;
    desc: string;
    time: string;
    unread: boolean;
    type?: string;
    link?: string | null;
  }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.notifications)) {
          setNotifications(json.notifications);
          setUnreadCount(
            typeof json.unreadCount === 'number'
              ? json.unreadCount
              : json.notifications.filter((n: any) => n.unread).length
          );
          return;
        }
      }
    } catch (err) {
      console.error('Error fetching admin notifications API:', err);
    }

    // Fallback: direct Supabase query
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        const mapped = data.map((n: any) => ({
          id: n.id,
          title: n.title || 'إشعار',
          desc: n.message || n.description || '',
          time: n.created_at
            ? new Date(n.created_at).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })
            : '',
          unread: !n.is_read,
          type: n.type || 'info',
          link: n.link || null,
        }));
        setNotifications(mapped);
        setUnreadCount(mapped.filter((n: any) => n.unread).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  return (
    <header className="sticky top-0 z-[30] w-full font-[family-name:var(--font-cairo)] m-0 p-0" dir="rtl">
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
        {/* RIGHT SIDE (RTL): Mobile Sidebar Toggle, Desktop Collapse & Platform Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Menu Button */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-slate-700 hover:text-[#173A7C] bg-slate-100/80 hover:bg-slate-200/80 transition-all border border-slate-200/60 shrink-0 cursor-pointer flex items-center justify-center"
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
              className="hidden lg:flex w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-slate-700 hover:text-[#173A7C] bg-slate-100/80 hover:bg-slate-200/80 transition-all border border-slate-200/60 shrink-0 cursor-pointer items-center justify-center"
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          )}

          {/* Platform Logo */}
          <Link
            href="/dashboard/admin"
            className="flex items-center gap-2 shrink-0 transition-transform hover:scale-105"
            title="لوحة الإدارة - منصة النبض المستدام"
          >
            <img src="/logo.svg" alt="شعار منصة النبض المستدام" className="h-8 sm:h-9 w-auto object-contain" />
          </Link>
        </div>

        {/* CENTER: Real-Time Interactive Search Bar */}
        <div ref={searchContainerRef} className="hidden md:flex flex-1 min-w-0 max-w-lg mx-4 relative">
          <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center px-3.5 rounded-2xl border border-slate-200/90 transition-all focus-within:border-[#173A7C] focus-within:bg-white bg-slate-50/90 shadow-2xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="اكتب للبحث في الطلاب، الدورات، المدربين، التذاكر... واضغط Enter"
              className="w-full py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none min-w-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full mr-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Search Dropdown Quick Categories */}
          {isSearchFocused && (
            <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2.5 z-50 space-y-1 text-right animate-in fade-in zoom-in-95 duration-150 font-[family-name:var(--font-cairo)]">
              <div className="px-3 py-1.5 text-[11px] font-black text-slate-500 flex items-center justify-between border-b border-slate-100 mb-1">
                <span>{searchQuery ? `نتائج البحث عن: "${searchQuery}" (اضغط Enter)` : 'البحث السريع في أقسام الإدارة'}</span>
                <Search className="w-3.5 h-3.5 text-[#173A7C]" />
              </div>

              {adminSearchCategories.map((item, idx) => {
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

        {/* LEFT SIDE (RTL): Mobile Search, Home Link, Notifications, Admin Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Search Button Toggle */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-slate-700 hover:text-[#173A7C] bg-slate-100/80 hover:bg-slate-200/80 transition-all border border-slate-200/60 shrink-0 cursor-pointer flex items-center justify-center"
            title="البحث بالنظام"
          >
            {isMobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          {/* Go to Home Link (Uniform size matching student portal) */}
          <Link
            href="/"
            className="w-9 h-9 sm:w-auto sm:px-3.5 sm:py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-[#173A7C] hover:text-[#1E4D9D] transition-all cursor-pointer border border-slate-200/60 flex items-center justify-center gap-1.5 shrink-0 text-xs font-black"
            title="الذهاب للرئيسية"
          >
            <Home className="w-4 h-4 text-[#173A7C] shrink-0" />
            <span className="hidden sm:inline">الرئيسية</span>
          </Link>

          {/* Notifications Button & Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-slate-700 hover:text-[#173A7C] bg-slate-100/80 hover:bg-slate-200/80 transition-all border border-slate-200/60 shrink-0 cursor-pointer flex items-center justify-center relative"
              title="الإشعارات"
              aria-label="عرض الإشعارات"
            >
              <Bell className="w-4 h-4 text-[#173A7C]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-white" />
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-[990] bg-slate-900/20 sm:bg-transparent backdrop-blur-[1px] sm:backdrop-blur-none"
                  onClick={() => setShowNotifications(false)}
                />
                <div
                  className="fixed inset-x-3 top-20 sm:top-full sm:mt-2 sm:inset-x-auto sm:start-0 sm:w-96 rounded-2xl border border-slate-200/90 p-4 shadow-2xl z-[1000] text-right space-y-3 bg-white/98 backdrop-blur-xl text-slate-800 max-w-sm sm:max-w-none mx-auto sm:mx-0 overflow-hidden"
                  style={{ boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18)' }}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#173A7C]/10 text-[#173A7C]">
                        <BellRing className="w-4 h-4" />
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-900">
                        إشعارات النظام والعمليات
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 ? (
                        <>
                          <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            {unreadCount} جديد
                          </span>
                          <button
                            type="button"
                            onClick={handleMarkAllAsRead}
                            className="text-[10px] text-slate-400 hover:text-[#173A7C] font-bold underline transition-colors cursor-pointer"
                            title="تحديد الكل كمقروء"
                          >
                            قراءة الكل
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          محدّث
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1 no-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((n) => {
                        const IconComponent =
                          n.type === 'user'
                            ? UserPlus
                            : n.type === 'course'
                            ? BookOpen
                            : n.type === 'warning'
                            ? AlertCircle
                            : Bell;

                        const iconBg =
                          n.type === 'user'
                            ? 'bg-blue-50 text-blue-600'
                            : n.type === 'course'
                            ? 'bg-emerald-50 text-emerald-600'
                            : n.type === 'warning'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-slate-100 text-[#173A7C]';

                        return (
                          <div
                            key={n.id}
                            className={`p-3 rounded-xl border transition-all text-xs space-y-1.5 ${
                              n.unread
                                ? 'bg-amber-50/70 border-amber-200/80 shadow-xs'
                                : 'bg-slate-50/70 border-slate-200/60'
                            }`}
                          >
                            <div className="flex items-center justify-between font-black text-slate-900 gap-2">
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded-md shrink-0 ${iconBg}`}>
                                  <IconComponent className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-bold leading-tight truncate">{n.title}</span>
                              </div>
                              <span className="text-[9px] font-medium text-slate-400 shrink-0">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-medium leading-relaxed pr-6">
                              {n.desc}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-xs font-bold text-slate-700">لا توجد إشعارات جديدة</p>
                        <p className="text-[10px] text-slate-400">أنت مطلع على كافة التحديثات والعمليات</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Admin Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="h-10 px-2 sm:px-3 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 transition-all border border-slate-200/60 flex items-center gap-2.5 cursor-pointer"
              title="حساب الإدارة"
            >
              <div className="relative shrink-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden shadow-xs ring-2 ring-[#173A7C]/20 border border-white bg-gradient-to-br from-[#173A7C] via-[#1E4D9D] to-[#0F2D69] flex items-center justify-center">
                  {adminProfile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={adminProfile.avatarUrl}
                      alt={adminProfile.fullName}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <Crown className="w-4 h-4 text-amber-300" />
                  )}
                </div>
                <span className="absolute -bottom-0.5 -left-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white shadow-2xs animate-pulse" />
              </div>
              <div className="hidden sm:block text-right">
                <span className="font-black text-xs text-slate-900 block leading-tight max-w-[120px] truncate">{adminProfile.fullName}</span>
                <span className="font-extrabold text-[10px] text-amber-700 block">مدير المنصة 👑</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-[990]"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div
                  className="absolute top-full mt-2 left-0 w-64 rounded-2xl border border-slate-200 p-2 shadow-2xl z-[1000] text-right space-y-1 bg-white text-slate-800"
                  style={{ boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15)' }}
                >
                  <div className="p-2.5 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs ring-2 ring-[#173A7C]/20 border border-white bg-gradient-to-br from-[#173A7C] via-[#1E4D9D] to-[#0F2D69] flex items-center justify-center shrink-0">
                        {adminProfile.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={adminProfile.avatarUrl}
                            alt={adminProfile.fullName}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <Crown className="w-5 h-5 text-amber-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h4 className="font-black text-xs text-slate-900 truncate">{adminProfile.fullName}</h4>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        </div>
                        <p className="text-[10px] text-amber-700 font-bold truncate">مدير المنصة الرئيسي 👑</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/admin/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <User className="w-4 h-4 text-[#173A7C]" />
                    <span>الملف الشخصي للمدير</span>
                  </Link>

                  <Link
                    href="/dashboard/admin/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>إعدادات النظام</span>
                  </Link>

                  <div className="border-t border-slate-100 my-1 pt-1">
                    <button
                      onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay Bar (Expands beneath Header) */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-3.5 py-2.5 bg-white/95 border-b border-slate-200/80 shadow-md animate-fade-in-down">
          <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center px-3 rounded-xl border border-slate-200 bg-slate-50">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="اكتب للبحث واضغط Enter..."
              autoFocus
              className="w-full py-2 text-xs font-bold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none min-w-0"
            />
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg text-xs font-bold mr-1 cursor-pointer"
            >
              إلغاء
            </button>
          </form>
        </div>
      )}
    </header>
  );
};
