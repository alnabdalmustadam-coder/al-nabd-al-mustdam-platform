'use client';

import React, { useState } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen liquid-dashboard-backdrop text-slate-100 font-[family-name:var(--font-cairo)] relative overflow-x-clip" dir="rtl">

      {/* Ambient Glowing Orbs Background for Deep Contrast */}
      <div className="fixed top-24 right-10 w-[600px] h-[600px] bg-[#173A7C]/25 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-10 left-10 w-[550px] h-[550px] bg-[#5CB07C]/20 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 left-1/3 w-[450px] h-[450px] bg-indigo-600/15 rounded-full blur-[170px] pointer-events-none -z-10" />

      {/* Full-Width 100% Executive Topbar Header */}
      <AdminHeader
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Admin Workspace Layout */}
      <div className="w-full px-3 sm:px-6 lg:px-8 pt-1 pb-6 flex items-start gap-8">
        {/* Collapsible Neumorphic Glass Sidebar (Desktop & Mobile Drawer) */}
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Admin Viewport - Pushed Down 5vh from top */}
        <main className="flex-1 min-w-0 transition-all duration-300 pt-[5vh]">
          <div className="max-w-7xl mx-auto pt-0 pb-10 space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
