'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Bell,
  BellRing,
  CheckCircle2,
  AlertCircle,
  UserPlus,
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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

          {/* Notifications Button & Panels */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
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

            {/* 1. DESKTOP NOTIFICATIONS DROPDOWN (Anchored left-0 so it opens inward away from screen boundary) */}
            {showNotifications && (
              <div className="hidden sm:block">
                <div
                  className="fixed inset-0 z-[990]"
                  onClick={() => setShowNotifications(false)}
                />
                <div
                  className="absolute top-full mt-2.5 left-0 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200/90 p-4 shadow-2xl z-[1000] text-right space-y-3 bg-white text-slate-800 animate-in fade-in zoom-in-95 duration-150"
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
                      <button
                        type="button"
                        onClick={() => setShowNotifications(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="إغلاق"
                      >
                        <X className="w-4 h-4" />
                      </button>
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
              </div>
            )}

            {/* 2. MOBILE NOTIFICATIONS SIDEBAR DRAWER (Full height sidebar with prominent X button, rendered via Portal directly to body) */}
            {showNotifications && isMounted && typeof document !== 'undefined'
              ? createPortal(
                  <div className="sm:hidden">
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-[9998] bg-slate-950/70 backdrop-blur-sm transition-opacity"
                      onClick={() => setShowNotifications(false)}
                    />

                    {/* Sidebar Drawer */}
                    <aside
                      className="fixed inset-y-0 right-0 z-[9999] w-[340px] max-w-[88vw] h-full flex flex-col border-l border-slate-200 text-right font-[family-name:var(--font-cairo)] animate-in slide-in-from-right duration-300 shadow-2xl"
                      style={{
                        backgroundColor: '#ffffff',
                        boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.35)',
                      }}
                      dir="rtl"
                    >
                      {/* Drawer Header */}
                      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shrink-0">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-[#173A7C] text-white shadow-sm shadow-[#173A7C]/20">
                            <BellRing className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-[#152C5B]">
                              إشعارات النظام
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold">العمليات والأنشطة اللحظية</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowNotifications(false)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer"
                          aria-label="إغلاق الإشعارات"
                        >
                          <X className="w-5 h-5 text-slate-600" />
                        </button>
                      </div>

                      {/* Drawer Unread Status Bar */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/70 border-b border-slate-200/70 shrink-0">
                        {unreadCount > 0 ? (
                          <>
                            <span className="text-[11px] font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                              {unreadCount} جديد
                            </span>
                            <button
                              type="button"
                              onClick={handleMarkAllAsRead}
                              className="text-xs text-[#173A7C] font-bold hover:underline cursor-pointer"
                            >
                              قراءة الكل
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-[11px] font-bold text-slate-600 bg-slate-200/90 px-2.5 py-0.5 rounded-full">
                              محدّث
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">لا توجد تنبيهات جديدة</span>
                          </>
                        )}
                      </div>

                      {/* Drawer Notification Items List */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar bg-white">
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
                                className={`p-3.5 rounded-2xl border transition-all text-xs space-y-1.5 ${
                                  n.unread
                                    ? 'bg-amber-50/80 border-amber-200/90 shadow-xs'
                                    : 'bg-slate-50/90 border-slate-200/70'
                                }`}
                              >
                                <div className="flex items-center justify-between font-black text-slate-900 gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg shrink-0 ${iconBg}`}>
                                      <IconComponent className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold leading-tight truncate">{n.title}</span>
                                  </div>
                                  <span className="text-[9px] font-medium text-slate-400 shrink-0">{n.time}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 font-medium leading-relaxed pr-7">
                                  {n.desc}
                                </p>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-16 text-center space-y-3 bg-white">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            </div>
                            <p className="text-sm font-bold text-slate-700">لا توجد إشعارات جديدة</p>
                            <p className="text-xs text-slate-400">أنت مطلع على كافة التحديثات والعمليات بالكامل</p>
                          </div>
                        )}
                      </div>

                      {/* Drawer Footer */}
                      <div className="p-3.5 border-t border-slate-100 text-center bg-slate-50 shrink-0">
                        <span className="text-[11px] text-slate-400 font-bold">النبض المستدام • مركز الإشعارات</span>
                      </div>
                    </aside>
                  </div>,
                  document.body
                )
              : null}
          </div>

          {/* Go to Home Link (Positioned on the outermost left corner) */}
          <Link
            href="/"
            className="w-9 h-9 sm:w-auto sm:px-3.5 sm:py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-[#173A7C] hover:text-[#1E4D9D] transition-all cursor-pointer border border-slate-200/60 flex items-center justify-center gap-1.5 shrink-0 text-xs font-black"
            title="الذهاب للرئيسية"
          >
            <Home className="w-4 h-4 text-[#173A7C] shrink-0" />
            <span className="hidden sm:inline">الرئيسية</span>
          </Link>
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
