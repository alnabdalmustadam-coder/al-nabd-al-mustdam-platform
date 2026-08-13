'use client';

import React, { useState } from 'react';
import { StudentHeader } from '@/components/student/student-header';
import { StudentSidebar } from '@/components/student/student-sidebar';

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen liquid-dashboard-backdrop text-slate-100 font-[family-name:var(--font-cairo)] relative overflow-x-clip" dir="rtl">

      {/* Ambient Glowing Orbs Background for Deep Contrast */}
      <div className="fixed top-24 right-10 w-[600px] h-[600px] bg-[#173A7C]/25 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-10 left-10 w-[550px] h-[550px] bg-[#5CB07C]/20 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 left-1/3 w-[450px] h-[450px] bg-indigo-600/15 rounded-full blur-[170px] pointer-events-none -z-10" />

      {/* 100% Full Height Sidebar (Fixed top-0 right-0 bottom-0, No Curves) */}
      <StudentSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Viewport Container (Margin right matches fixed sidebar width) */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'lg:mr-20' : 'lg:mr-72'
          }`}
      >
        {/* Header (Top-0, No gap, No curves) */}
        <StudentHeader
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Workspace Content (Responsive: p-2 on mobile, lg:p-[10vh] on desktop) */}
        <main className="flex-1 min-w-0 p-2 sm:p-5 lg:p-[5vh]">
          {children}
        </main>
      </div>
    </div>
  );
}
