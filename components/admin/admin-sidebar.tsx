'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Award,
  Radio,
  CreditCard,
  Headphones,
  Settings,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Crown,
  X,
  LogOut,
  FileQuestion,
  Star,
  GraduationCap,
} from 'lucide-react';

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'الرئيسية والتحليلات', href: '/dashboard/admin', icon: LayoutDashboard, badge: 'مباشر' },
    { label: 'إدارة المساقات والدورات', href: '/dashboard/admin/courses', icon: BookOpen, count: '48' },
    { label: 'إدارة المتدربين والطلاب', href: '/dashboard/admin/users', icon: Users, count: '14.2k' },
    { label: 'إدارة المدربين والمحاضرين', href: '/dashboard/admin/trainers', icon: UserCheck, count: '32' },
    { label: 'استوديو وإدارة الشهادات', href: '/dashboard/admin/certificates', icon: Award, highlight: true },
    { label: 'بنك الأسئلة والاختبارات', href: '/dashboard/admin/quizzes', icon: FileQuestion, count: '12' },
    { label: 'قسائم الخصم والعروض', href: '/dashboard/admin/coupons', icon: Sparkles, count: 'خصم' },
    { label: 'استبيانات وتقييمات', href: '/dashboard/admin/surveys', icon: Star, count: '4.9★' },
    { label: 'اللقاءات المباشرة', href: '/dashboard/admin/live', icon: Radio, count: '5' },
    { label: 'السجل المالي والإيرادات', href: '/dashboard/admin/finance', icon: CreditCard, count: 'ر.س' },
    { label: 'الدعم وتذاكر الخدمة', href: '/dashboard/admin/support', icon: Headphones, count: '12' },
    { label: 'إعدادات المنصة والهوية', href: '/dashboard/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR — Fixed 100% Full Height Docked Drawer (No Curves/Gaps) */}
      {/* ========================================================================= */}
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
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(28px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
            boxShadow: '0 0 40px rgba(0, 0, 0, 0.08)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.60)',
          }}
        >
          <div
            className="space-y-3 relative z-10 overflow-y-auto no-scrollbar px-0.5 pt-1 flex-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Admin Profile Identity Card */}
            <div
              className={`rounded-xl border border-slate-200/80 transition-all duration-300 relative group overflow-hidden ${
                isCollapsed ? 'p-2 flex items-center justify-center' : 'p-3'
              }`}
              style={{
                background: 'rgba(241, 245, 249, 0.85)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#173A7C] via-[#1E4D9D] to-[#0F2D69] text-white flex items-center justify-center font-black shadow-sm shrink-0 border border-white/40">
                  <Crown className="w-5 h-5 text-amber-300" />
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <h3 className="font-extrabold text-xs text-slate-900 truncate">سعود القحطاني</h3>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold truncate">مدير المنصة الرئيسي</p>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation Links with Framer Motion Stagger */}
            <motion.nav
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.025,
                    delayChildren: 0.03,
                  },
                },
              }}
              className="space-y-1 px-0.5 py-0.5"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <motion.div
                    key={item.href}
                    variants={{
                      hidden: { opacity: 0, x: 15 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    <Link
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={`group flex items-center gap-3 rounded-xl transition-all duration-200 relative ${
                        isCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-[#173A7C] text-white font-extrabold shadow-md shadow-[#173A7C]/20 ring-1 ring-[#173A7C]/30'
                          : 'text-slate-700 font-bold hover:bg-slate-100/90 hover:text-[#173A7C]'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isActive
                            ? 'text-white'
                            : item.highlight
                            ? 'text-amber-500'
                            : 'text-slate-500 group-hover:text-[#173A7C]'
                        }`}
                      />

                      {!isCollapsed && (
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <span className="text-xs truncate">{item.label}</span>

                          {item.badge && (
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300 shrink-0">
                              {item.badge}
                            </span>
                          )}

                          {item.count && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                isActive
                                  ? 'bg-white/20 text-white border-white/30'
                                  : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:border-slate-300'
                              }`}
                            >
                              {item.count}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Active Left Indicator Bar */}
                      {isActive && (
                        <span className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-emerald-400" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>
          </div>

          {/* Sidebar Footer Actions */}
          <div className="pt-2 border-t border-slate-200/80 space-y-1 relative z-10">
            <Link
              href="/dashboard/student"
              className={`flex items-center gap-2.5 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-[#173A7C] font-bold text-xs transition-colors ${
                isCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2'
              }`}
              title={isCollapsed ? 'لوحة الطالب' : undefined}
            >
              <GraduationCap className="w-4 h-4 text-[#173A7C] shrink-0" />
              {!isCollapsed && <span className="truncate">الانتقال للوحة الطالب</span>}
            </Link>

            <Link
              href="/auth/login"
              className={`flex items-center gap-2.5 rounded-xl text-red-600 hover:bg-red-50 font-bold text-xs transition-colors ${
                isCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2'
              }`}
              title={isCollapsed ? 'تسجيل الخروج' : undefined}
            >
              <LogOut className="w-4 h-4 text-red-500 shrink-0" />
              {!isCollapsed && <span className="truncate">تسجيل الخروج</span>}
            </Link>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE DRAWER — Slides in from Right on Mobile (< lg)                   */}
      {/* ========================================================================= */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 font-[family-name:var(--font-cairo)]" dir="rtl">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Body */}
          <div
            className="fixed inset-y-0 right-0 w-72 max-w-[85vw] flex flex-col justify-between p-4 z-50 bg-white/95 shadow-2xl border-l border-slate-200 overflow-y-auto"
            style={{
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
            }}
          >
            <div className="space-y-4">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white flex items-center justify-center font-black shadow-xs">
                    <Crown className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-black text-xs text-slate-900">سعود القحطاني</h3>
                    <p className="text-[10px] text-slate-500 font-bold">مدير المنصة الرئيسي</p>
                  </div>
                </div>

                <button
                  onClick={onCloseMobile}
                  className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                        isActive
                          ? 'bg-[#173A7C] text-white font-extrabold shadow-md shadow-[#173A7C]/20'
                          : 'text-slate-700 font-bold hover:bg-slate-100 hover:text-[#173A7C]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                          {item.badge}
                        </span>
                      )}

                      {item.count && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isActive
                              ? 'bg-white/20 text-white border-white/30'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer Links */}
            <div className="pt-3 border-t border-slate-200 space-y-1">
              <Link
                href="/dashboard/student"
                onClick={onCloseMobile}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <GraduationCap className="w-4 h-4 text-[#173A7C]" />
                <span>الانتقال للوحة الطالب</span>
              </Link>
              <Link
                href="/auth/login"
                onClick={onCloseMobile}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>تسجيل الخروج</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
