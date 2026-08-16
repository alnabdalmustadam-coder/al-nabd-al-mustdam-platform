'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
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
  ChevronLeft,
} from 'lucide-react';

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const navContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.04,
    },
  },
};

const navItemVariants: Variants = {
  hidden: { opacity: 0, x: 18 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 25,
    },
  },
};

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
          {/* Ambient Subtle Fluid Light */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#173A7C]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#5CB07C]/8 rounded-full blur-3xl pointer-events-none" />

          {/* Top & Scrollable Nav Block */}
          <div
            className="space-y-3 relative z-10 overflow-y-auto no-scrollbar px-0.5 pt-1 flex-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Block 1: Admin Profile Identity Card */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`rounded-2xl border border-slate-200/80 transition-all duration-300 relative group overflow-hidden ${
                isCollapsed ? 'p-2 flex items-center justify-center' : 'p-3'
              }`}
              style={{
                background: 'linear-gradient(135deg, rgba(241, 245, 249, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 4px 12px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#173A7C] via-[#1E4D9D] to-[#0F2D69] text-white flex items-center justify-center font-black shadow-md shrink-0 border border-white/40 group-hover:scale-105 transition-transform">
                  <Crown className="w-5 h-5 text-amber-300" />
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-xs text-slate-900 truncate">سعود القحطاني</h3>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[10px] text-amber-700 font-bold truncate flex items-center gap-1">
                      <span>مدير المنصة الرئيسي</span>
                      <span className="text-[11px]">👑</span>
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Block 2: Desktop Navigation Links with Rich Blocks & Spring Animations */}
            <motion.nav
              initial="hidden"
              animate="visible"
              variants={navContainerVariants}
              className="space-y-1.5 px-0.5 py-0.5"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <motion.div
                    key={item.href}
                    variants={navItemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={`relative flex items-center rounded-xl font-bold text-xs transition-all duration-200 group cursor-pointer ${
                        isCollapsed ? 'p-2.5 justify-center' : 'p-2.5 justify-between'
                      } ${
                        isActive
                          ? 'text-white bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] border border-blue-400/40 shadow-lg shadow-[#173A7C]/25'
                          : 'text-slate-800 hover:text-[#173A7C] hover:bg-slate-100/90 border border-slate-200/60'
                      }`}
                      style={
                        !isActive
                          ? {
                              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
                            }
                          : undefined
                      }
                    >
                      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 min-w-0 flex-1'}`}>
                        {/* Styled Icon Container Block */}
                        <div
                          className={`rounded-lg transition-all shrink-0 flex items-center justify-center relative ${
                            isCollapsed ? 'w-8 h-8 p-0' : 'p-2'
                          } ${
                            isActive
                              ? 'bg-white/20 text-white shadow-xs'
                              : item.highlight
                              ? 'bg-amber-500/15 text-amber-600 group-hover:bg-amber-500 group-hover:text-white'
                              : 'bg-[#173A7C]/10 text-[#173A7C] group-hover:bg-[#173A7C] group-hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {isCollapsed && item.count && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                          )}
                        </div>

                        {!isCollapsed && (
                          <span
                            className={`truncate font-extrabold text-xs ${
                              isActive ? 'text-white' : 'text-slate-800 group-hover:text-[#173A7C]'
                            }`}
                          >
                            {item.label}
                          </span>
                        )}
                      </div>

                      {/* Badges and Counts */}
                      {!isCollapsed && (
                        <div className="flex items-center gap-1.5 shrink-0 pr-1">
                          {item.badge && (
                            <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300 shrink-0 shadow-xs animate-pulse">
                              {item.badge}
                            </span>
                          )}

                          {item.count && (
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                                isActive
                                  ? 'bg-white/20 text-white border-white/30'
                                  : 'text-slate-700 bg-slate-100 border-slate-200 group-hover:border-slate-300'
                              }`}
                            >
                              {item.count}
                            </span>
                          )}

                          {item.highlight && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black text-amber-900 bg-amber-200 border border-amber-300">
                              👑
                            </span>
                          )}
                        </div>
                      )}

                      {/* Active Indicator Bar */}
                      {isActive && (
                        <div className="absolute right-0 top-2 bottom-2 w-1.5 bg-amber-400 rounded-l-full shadow-xs" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>
          </div>

          {/* Block 3: Desktop Sidebar Footer Action Blocks */}
          <div className="pt-2.5 border-t border-slate-200/80 space-y-1.5 relative z-10">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/auth/login"
                className={`flex items-center rounded-xl font-bold text-xs transition-all border border-red-200/70 bg-red-50/80 hover:bg-red-100/90 text-red-600 shadow-2xs ${
                  isCollapsed ? 'p-2.5 justify-center' : 'p-2.5 gap-2.5'
                }`}
                title={isCollapsed ? 'تسجيل الخروج' : undefined}
              >
                <div className="p-1.5 rounded-lg bg-red-500/15 text-red-600 shrink-0">
                  <LogOut className="w-4 h-4" />
                </div>
                {!isCollapsed && <span className="truncate font-extrabold text-xs">تسجيل الخروج</span>}
              </Link>
            </motion.div>

            {!isCollapsed && (
              <div className="pt-1 text-center">
                <p className="text-[10px] text-slate-500 font-bold flex items-center justify-center gap-1">
                  <span>لوحة الإدارة المركزية</span>
                  <span className="font-mono text-emerald-600 font-black">• v2.4</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE DRAWER SHEET — Rich Full Height Responsive Sheet                */}
      {/* ========================================================================= */}
      {isMobileOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 z-[1000] bg-slate-950/70 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
            onClick={onCloseMobile}
          />

          {/* Mobile Drawer Body */}
          <aside
            className="fixed top-0 bottom-0 right-0 z-[1001] w-[340px] max-w-[90vw] h-full flex flex-col justify-between p-5 overflow-y-auto no-scrollbar lg:hidden font-[family-name:var(--font-cairo)] animate-in slide-in-from-right duration-300 shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(28px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.60)',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.25)',
            }}
            dir="rtl"
          >
            <div className="space-y-4 relative z-10 flex-1 flex flex-col min-h-0 pt-1">
              {/* Mobile Header: Brand Identity + Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 shrink-0">
                <Link
                  href="/dashboard/admin"
                  onClick={onCloseMobile}
                  className="flex items-center gap-2.5 group cursor-pointer"
                  title="الرئيسية"
                >
                  <img
                    src="/logo.svg"
                    alt="شعار منصة النبض المستدام"
                    className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                  />
                  <div>
                    <h2 className="font-extrabold text-sm text-slate-900 group-hover:text-[#173A7C] transition-colors">
                      الإدارة العليا
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold">منصة النبض المستدام</p>
                  </div>
                </Link>

                <button
                  onClick={onCloseMobile}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors border border-slate-200/60"
                  title="إغلاق القائمة"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Admin Profile Identity Card */}
              <div
                className="rounded-xl border border-slate-200/80 p-3 flex items-center gap-3 shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(241, 245, 249, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#173A7C] via-[#1E4D9D] to-[#0F2D69] text-white flex items-center justify-center font-black shadow-md shrink-0 border border-white/40">
                  <Crown className="w-5 h-5 text-amber-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-xs text-slate-900 truncate">سعود القحطاني</h3>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-[10px] text-amber-700 font-bold truncate">مدير المنصة الرئيسي 👑</p>
                </div>
              </div>

              {/* Mobile Scrollable Nav Links */}
              <nav className="space-y-1.5 overflow-y-auto flex-1 py-1" style={{ scrollbarWidth: 'none' }}>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20 border border-blue-400/40'
                          : 'text-slate-800 hover:text-[#173A7C] hover:bg-slate-100/90 border border-slate-200/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 flex items-center justify-center ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.highlight
                              ? 'bg-amber-500/15 text-amber-600'
                              : 'bg-[#173A7C]/10 text-[#173A7C]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                            {item.badge}
                          </span>
                        )}

                        {item.count && (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                              isActive
                                ? 'bg-white/20 text-white border border-white/30'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {item.count}
                          </span>
                        )}

                        {item.highlight && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black text-amber-900 bg-amber-200 border border-amber-300">
                            👑
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer Action Blocks */}
            <div className="pt-3 border-t border-slate-200/80 space-y-1.5 shrink-0">
              <Link
                href="/auth/login"
                onClick={onCloseMobile}
                className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50/80 hover:bg-red-100/90 border border-red-200/70 transition-all"
              >
                <div className="p-1.5 rounded-lg bg-red-500/15 text-red-600 shrink-0">
                  <LogOut className="w-4 h-4" />
                </div>
                <span>تسجيل الخروج</span>
              </Link>

              <div className="pt-1 text-center">
                <p className="text-[10px] text-slate-500 font-bold">
                  Sustain Pulse Admin • v2.4
                </p>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
};
