'use client';

import React, { useState } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen liquid-dashboard-backdrop text-slate-800 font-[family-name:var(--font-cairo)] relative overflow-x-clip" dir="rtl">

      {/* Ambient Glowing Orbs Background for Balanced Depth */}
      <div className="fixed top-12 right-10 w-[500px] h-[500px] bg-[#173A7C]/8 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-10 left-10 w-[500px] h-[500px] bg-[#5CB07C]/8 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 left-1/3 w-[400px] h-[400px] bg-sky-500/6 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* 100% Full Height Sidebar (Fixed top-0 right-0 bottom-0, No Curves) */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Viewport Container (Margin right matches fixed sidebar width) */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:mr-20' : 'lg:mr-72'
        }`}
      >
        {/* Header (Top-0, No gap, No outer curves) */}
        <AdminHeader
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Workspace Content (Compact, balanced padding to prevent vertical cut-offs) */}
        <main className="flex-1 min-w-0 p-3 sm:p-4 lg:p-5 xl:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
