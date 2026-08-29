'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Home,
  User,
  LogOut,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  GraduationCap,
} from 'lucide-react';
import { DefaultAvatar } from '@/components/student/default-avatar';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

interface InstructorHeaderProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onToggleMobileMenu?: () => void;
}

export const InstructorHeader: React.FC<InstructorHeaderProps> = ({
  isSidebarCollapsed = false,
  onToggleSidebar,
  onToggleMobileMenu,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    fullName: string;
    avatarUrl: string | null;
  }>({
    fullName: 'المدرب المعتمد',
    avatarUrl: null,
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const metaName = user.user_metadata?.full_name || user.user_metadata?.name;
          const metaAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .maybeSingle();

          setUserProfile({
            fullName: profile?.full_name || metaName || user.email?.split('@')[0] || 'المدرب المعتمد',
            avatarUrl: profile?.avatar_url || metaAvatar || null,
          });
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-30 font-[family-name:var(--font-cairo)] px-3 sm:px-6 py-2.5 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between gap-3 w-full">
        {/* Toggle Sidebar & Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            title={isSidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-xs">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs sm:text-sm font-black text-[#173A7C]">لوحة تحكم المدرب والمحاضر</span>
          </div>
        </div>

        {/* Action Controls & Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-[#173A7C] hover:bg-slate-100"
          >
            <Home className="w-3.5 h-3.5" />
            <span>الموقع الرئيسي</span>
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-100 cursor-pointer"
            >
              <DefaultAvatar src={userProfile.avatarUrl} name={userProfile.fullName} size="sm" />
              <span className="hidden sm:block text-xs font-black text-slate-800 max-w-[120px] truncate">
                {userProfile.fullName}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 z-50 text-right space-y-1">
                <Link
                  href="/dashboard/instructor/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <User className="w-3.5 h-3.5 text-[#173A7C]" />
                  <span>الملف الشخصي</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 text-right cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
