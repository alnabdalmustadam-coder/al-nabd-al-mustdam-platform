'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  ClipboardList,
  User,
  FolderGit2,
  Headphones,
  Radio,
  CreditCard,
  Crown,
  Library,
  BookmarkCheck,
  ShieldCheck,
  X,
} from 'lucide-react';
import { DefaultAvatar } from './default-avatar';

interface StudentSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'الرئيسية والمؤشرات', href: '/dashboard/student', icon: LayoutDashboard },
    { label: 'دوراتي التدريبية', href: '/dashboard/student/courses', icon: BookOpen, count: '3' },
    { label: 'الاختبارات والتقييمات', href: '/dashboard/student/quizzes', icon: Award },
    { label: 'الواجبات والمهام', href: '/dashboard/student/assignments', icon: ClipboardList },
    { label: 'اللقاءات المباشرة', href: '/dashboard/student/live', icon: Radio, count: 'بث 🔴' },
    { label: 'شهاداتي المعتمدة', href: '/dashboard/student/certificates', icon: Crown, count: '2', highlight: true },
    { label: 'المسارات والكتب', href: '/dashboard/student/pathways', icon: Library },
    { label: 'المشاريع والتطبيقات', href: '/dashboard/student/projects', icon: FolderGit2 },
    { label: 'الملاحظات والمحفوظات', href: '/dashboard/student/bookmarks', icon: BookmarkCheck },
    { label: 'السجل المالي والفواتير', href: '/dashboard/student/billing', icon: CreditCard },
    { label: 'الدعم والمساعدة', href: '/dashboard/student/support', icon: Headphones },
    { label: 'الملف الشخصي والإعدادات', href: '/dashboard/student/profile', icon: User },
  ];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR — Same Glass Background as Cards (rgba(255,255,255,0.85)), NO TOP BORDER */}
      {/* ========================================================================= */}
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
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(28px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
            boxShadow: '0 0 40px rgba(0, 0, 0, 0.08)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.60)',
          }}
        >
          {/* DELETED TOP GRADIENT ACCENT RIBBON BORDER AS REQUESTED */}

          <div className="space-y-3 relative z-10 overflow-y-auto no-scrollbar px-0.5 pt-1 flex-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

            {/* Student Profile Identity Card */}
            <div
              className={`rounded-xl border border-slate-200/80 transition-all duration-300 relative group overflow-hidden ${
                isCollapsed ? 'p-2 flex items-center justify-center' : 'p-3.5'
              }`}
              style={{
                background: 'rgba(241, 245, 249, 0.8)',
              }}
            >
              <div className="flex items-center gap-3">
                <DefaultAvatar size="md" />
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-xs text-slate-900 truncate">عبدالله الشمري</h3>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[10px] text-emerald-700 font-bold truncate">متدرب معتمد بالمنصة</p>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <motion.nav
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.03,
                    delayChildren: 0.04,
                  },
                },
              }}
              className="space-y-1.5 px-0.5 py-0.5"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <motion.div
                    key={item.href}
                    variants={{
                      hidden: { opacity: 0, x: 15 },
                      visible: {
                        opacity: 1,
                        x: 0,
                        transition: {
                          type: 'spring',
                          stiffness: 350,
                          damping: 25,
                        },
                      },
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={`relative flex items-center rounded-xl font-bold text-xs transition-all duration-200 group cursor-pointer ${
                        isCollapsed ? 'p-2.5 justify-center' : 'p-3 justify-between'
                      } ${
                        isActive
                          ? 'text-white bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] border border-blue-400/40 shadow-lg shadow-[#173A7C]/30'
                          : 'text-slate-800 hover:text-[#173A7C] hover:bg-slate-100/90 border border-slate-200/60'
                      }`}
                    >
                      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                        <div
                          className={`rounded-lg transition-all shrink-0 flex items-center justify-center relative ${
                            isCollapsed ? 'w-8 h-8 p-0' : 'p-2'
                          } ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-[#173A7C]/10 text-[#173A7C] group-hover:bg-[#173A7C] group-hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {isCollapsed && item.count && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        {!isCollapsed && (
                          <span className={`truncate font-extrabold ${isActive ? 'text-white' : 'text-slate-800 group-hover:text-[#173A7C]'}`}>
                            {item.label}
                          </span>
                        )}
                      </div>

                      {!isCollapsed && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.count && (
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                                isActive
                                  ? 'bg-white/20 text-white border border-white/30'
                                  : 'text-emerald-800 bg-emerald-100 border border-emerald-300'
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
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>
          </div>

          {/* Desktop Footer info */}
          {!isCollapsed && (
            <div className="pt-3 border-t border-slate-200/80 text-center relative z-10">
              <p className="text-[10px] text-slate-500 font-bold flex items-center justify-center gap-1">
                <span>حضور منتظم 100%</span>
                <span className="font-mono text-emerald-600">Sustain Pulse</span>
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE DRAWER SHEET */}
      {/* ========================================================================= */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-[1000] bg-slate-950/70 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
            onClick={onCloseMobile}
          />

          <aside
            className="fixed top-0 bottom-0 right-0 z-[1001] w-[340px] max-w-[90vw] h-full flex flex-col justify-between p-5 overflow-y-auto no-scrollbar lg:hidden font-[family-name:var(--font-cairo)] animate-in slide-in-from-right duration-300 shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(28px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.60)',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.25)',
            }}
            dir="rtl"
          >
            <div className="space-y-4 relative z-10 flex-1 flex flex-col min-h-0 pt-1">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 shrink-0">
                <Link
                  href="/dashboard/student"
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
                      النبض المستدام
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold">منصة التدريب والتعلم</p>
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

              {/* Student Profile Identity Card in Mobile Drawer */}
              <div
                className="rounded-xl border border-slate-200/80 p-3 flex items-center gap-3"
                style={{
                  background: 'rgba(241, 245, 249, 0.85)',
                }}
              >
                <DefaultAvatar size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-xs text-slate-900 truncate">عبدالله الشمري</h3>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-[10px] text-emerald-700 font-bold truncate">متدرب معتمد بالمنصة</p>
                </div>
              </div>

              {/* Mobile Navigation Links */}
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
                              : 'bg-[#173A7C]/10 text-[#173A7C]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      {item.count && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-emerald-100 text-emerald-800'
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

            {/* Mobile Drawer Footer */}
            <div className="pt-3 border-t border-slate-200/80 text-center shrink-0">
              <p className="text-[10px] text-slate-500 font-bold flex items-center justify-center gap-1">
                <span>حضور منتظم 100%</span>
                <span className="font-mono text-emerald-600">Sustain Pulse</span>
              </p>
            </div>
          </aside>
        </>
      )}
    </>
  );
};
