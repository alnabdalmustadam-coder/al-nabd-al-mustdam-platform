'use client';

import React, { useState } from 'react';
import { InstructorSidebar } from '@/components/instructor/instructor-sidebar';
import { InstructorHeader } from '@/components/instructor/instructor-header';

export default function InstructorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen liquid-dashboard-backdrop text-slate-800 font-[family-name:var(--font-cairo)] relative overflow-x-clip" dir="rtl">
      {/* Ambient Glowing Orbs Background for Balanced Depth */}
      <div className="fixed top-12 right-10 w-[500px] h-[500px] bg-[#173A7C]/8 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-10 left-10 w-[500px] h-[500px] bg-[#5CB07C]/8 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 left-1/3 w-[400px] h-[400px] bg-sky-500/6 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Sidebar */}
      <InstructorSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? 'lg:mr-20' : 'lg:mr-72'
        }`}
      >
        {/* Header */}
        <InstructorHeader
          isSidebarCollapsed={isCollapsed}
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
          onToggleMobileMenu={() => setIsMobileOpen(true)}
        />

        {/* Page Content - Full Width Workspace */}
        <main className="flex-1 min-w-0 p-3 sm:p-4 lg:p-5 xl:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
