'use client';

import React, { useEffect, useState } from 'react';
import { StudentHeader } from '@/components/student/student-header';
import { StudentSidebar } from '@/components/student/student-sidebar';
import { DeviceLimitModal, RegisteredDevice } from '@/components/student/device-limit-modal';
import { getDeviceInfo } from '@/utils/device';

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Device Limit & Enforcement State
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [registeredDevices, setRegisteredDevices] = useState<RegisteredDevice[]>([]);
  const [currentDevice, setCurrentDevice] = useState({
    deviceId: '',
    deviceName: '',
    browser: '',
    os: '',
  });

  const checkAndRegisterDevice = async () => {
    try {
      const devInfo = getDeviceInfo();
      setCurrentDevice(devInfo);

      const res = await fetch('/api/auth/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(devInfo),
      });

      const data = await res.json();

      if (res.status === 403 || data.status === 'limit_reached') {
        setRegisteredDevices(data.devices || []);
        setIsLimitModalOpen(true);
      } else if (data.success || data.status === 'allowed') {
        setIsLimitModalOpen(false);
      }
    } catch (err) {
      console.warn('Device verification check:', err);
    }
  };

  useEffect(() => {
    checkAndRegisterDevice();

    // Heartbeat every 5 minutes while active
    const interval = setInterval(checkAndRegisterDevice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen liquid-dashboard-backdrop text-slate-800 font-[family-name:var(--font-cairo)] relative overflow-x-clip" dir="rtl">

      {/* Ambient Glowing Orbs Background for Balanced Depth */}
      <div className="fixed top-12 right-10 w-[500px] h-[500px] bg-[#173A7C]/8 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-10 left-10 w-[500px] h-[500px] bg-[#5CB07C]/8 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 left-1/3 w-[400px] h-[400px] bg-sky-500/6 rounded-full blur-[150px] pointer-events-none -z-10" />

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

      {/* Device Limit Protection Modal (2 Devices Cap) */}
      <DeviceLimitModal
        isOpen={isLimitModalOpen}
        devices={registeredDevices}
        currentDeviceInfo={currentDevice}
        onDeviceReplaced={() => {
          setIsLimitModalOpen(false);
          checkAndRegisterDevice();
        }}
      />
    </div>
  );
}
