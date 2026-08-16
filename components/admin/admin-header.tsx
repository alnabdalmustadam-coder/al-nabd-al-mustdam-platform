'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Home,
  LogOut,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Sparkles,
  Bell,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';

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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const notifications = [
    {
      id: '1',
      title: 'إصدار شهادة معتمدة بنجاح ⚡',
      desc: 'تم إصدار وتوثيق شهادة (القيادة المستدامة) للمتدرب عبدالله الشمري بنسبة 98%',
      time: 'منذ 4 دقائق',
      unread: true,
    },
    {
      id: '2',
      title: 'عملية دفع جديدة مؤكدة',
      desc: 'سداد القسط الأول 625 ر.س لدبلوم التسامح والمواطنة عبر (تمارا)',
      time: 'منذ 14 دقيقة',
      unread: true,
    },
    {
      id: '3',
      title: 'تسجيل متدرب جديد',
      desc: 'انضم المتدرب د. خالد العتيبي إلى مساق إدارة الاستدامة البيئية',
      time: 'منذ 35 دقيقة',
      unread: false,
    },
    {
      id: '4',
      title: 'تذكرة دعم فني جديدة',
      desc: 'استفسار بشأن الاسترداد المالي من المتدربة ريم الجهني',
      time: 'منذ ساعة',
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-[30] w-full font-[family-name:var(--font-cairo)] m-0 p-0" dir="rtl">
      {/* Sleek 100% Flush Header with Platform Logo & Glass Backdrop */}
      <div
        className="w-full rounded-none px-3.5 sm:px-6 py-3 sm:py-3.5 min-h-[3.75rem] flex items-center justify-between gap-2 sm:gap-4 transition-all duration-300 relative z-30"
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
            href="/dashboard/admin"
            className="flex items-center gap-2 shrink-0 transition-transform hover:scale-105"
            title="لوحة الإدارة - منصة النبض المستدام"
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
              placeholder="البحث في النظام والإشعارات والطلاب..."
              className="w-full py-2 text-xs font-bold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none min-w-0"
            />
            <kbd className="inline-flex items-center gap-1 mr-2 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-white rounded border border-slate-200 shrink-0">
              Ctrl + K
            </kbd>
          </div>
        </div>

        {/* LEFT SIDE (RTL): Mobile Search, Home Link, Notifications, Admin Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Search Button Toggle */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden w-9 h-9 rounded-xl text-slate-700 hover:text-[#173A7C] bg-slate-100/80 hover:bg-slate-200/80 transition-all border border-slate-200/60 shrink-0 cursor-pointer flex items-center justify-center"
            title="البحث بالنظام"
          >
            {isMobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          {/* Go to Home Link (Uniform size matching student portal) */}
          <Link
            href="/"
            className="w-9 h-9 sm:w-auto sm:px-3 sm:py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-[#173A7C] hover:text-[#1E4D9D] transition-all cursor-pointer border border-slate-200/60 flex items-center justify-center gap-1.5 shrink-0 text-xs font-black"
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
              className="w-9 h-9 rounded-xl text-slate-700 hover:text-[#173A7C] bg-slate-100/80 hover:bg-slate-200/80 transition-all border border-slate-200/60 shrink-0 cursor-pointer flex items-center justify-center relative"
              title="الإشعارات"
            >
              <Bell className="w-4 h-4 text-[#173A7C]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse ring-2 ring-white" />
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-[990]"
                  onClick={() => setShowNotifications(false)}
                />
                <div
                  className="absolute top-full mt-2 left-0 w-80 sm:w-96 rounded-2xl border border-slate-200 p-4 shadow-2xl z-[1000] text-right space-y-3 bg-white text-slate-800"
                  style={{ boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15)' }}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>إشعارات العمليات اللحظية</span>
                    </h4>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      2 جديد
                    </span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border transition-all text-xs space-y-1 ${
                          n.unread ? 'bg-amber-50/60 border-amber-200/80' : 'bg-slate-50/60 border-slate-200/50'
                        }`}
                      >
                        <div className="flex items-center justify-between font-black text-slate-900">
                          <span className="text-xs">{n.title}</span>
                          <span className="text-[9px] font-bold text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{n.desc}</p>
                      </div>
                    ))}
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
              className="h-9 px-2 sm:px-2.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 transition-all border border-slate-200/60 flex items-center gap-2 cursor-pointer"
              title="حساب الإدارة"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white flex items-center justify-center font-black text-[11px] shadow-xs">
                A
              </div>
              <div className="hidden sm:block text-right">
                <span className="font-extrabold text-[11px] text-slate-900 block leading-tight">سعود القحطاني</span>
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
                  className="absolute top-full mt-2 left-0 w-60 rounded-2xl border border-slate-200 p-2 shadow-2xl z-[1000] text-right space-y-1 bg-white text-slate-800"
                  style={{ boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15)' }}
                >
                  <div className="p-2.5 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white flex items-center justify-center font-black text-xs">
                        A
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h4 className="font-black text-xs text-slate-900 truncate">سعود القحطاني</h4>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold truncate">مدير المنصة الرئيسي</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/admin/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>إعدادات النظام</span>
                  </Link>

                  <div className="border-t border-slate-100 my-1 pt-1">
                    <Link
                      href="/auth/login"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>تسجيل الخروج</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay Bar (Expands beneath Header) */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-3.5 py-2.5 bg-white/95 border-b border-slate-200/80 shadow-md">
          <div className="w-full relative flex items-center px-3 rounded-xl border border-slate-200 bg-slate-50">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            <input
              type="text"
              placeholder="البحث في النظام..."
              autoFocus
              className="w-full py-2 text-xs font-bold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none min-w-0"
            />
          </div>
        </div>
      )}
    </header>
  );
};
