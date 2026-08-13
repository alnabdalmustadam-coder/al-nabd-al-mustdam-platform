'use client';

import React, { useState } from 'react';
import {
  Search,
  Bell,
  Crown,
  Sparkles,
  ShieldCheck,
  Globe,
  ExternalLink,
  ChevronDown,
  User,
  LogOut,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Award,
  BookOpen,
  Menu,
  X,
  Wand2,
  Bot,
  Send,
  FileText,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleGenerateAiReport = (promptText: string) => {
    setAiResponse('جاري تحليل بيانات المنصة بواسطة الذكاء الاصطناعي...');
    setTimeout(() => {
      setAiResponse(
        `🤖 تقرير الذكاء الاصطناعي الإداري:\n• إجمالي الطلاب النشطين: 1,420 متدرباً (بنسبة رضا 98.4%).\n• أكثر المساقات مبيعاً: "دبلوم التسامح والسلام والمواطنة الصالحة" بإيرادات بلغت 45,000 ر.س.\n• توصية النظام: ينصح بجدولة ورشة عمل مباشرة ثانية في الاستدامة البيئية لارتفاع الإقبال.`
      );
    }, 800);
  };

  const notifications = [
    {
      id: '1',
      title: 'طلب إصدار شهادة جديدة',
      desc: 'اجتاز الطالب عبدالله الشمري برنامج القيادة المستدامة بنجاح 98%',
      time: 'منذ 5 دقائق',
      unread: true,
    },
    {
      id: '2',
      title: 'عملية دفع جديدة (تمارا)',
      desc: 'تم استلام مبلغ 1,250 ر.س للاشتراك في دبلوم المواطنة الصالحة',
      time: 'منذ 18 دقيقة',
      unread: true,
    },
    {
      id: '3',
      title: 'تسجيل متدرب جديد',
      desc: 'سجل المتدرب سارة العتيبي في مساق إدارة الاستدامة البيئية',
      time: 'منذ ساعة',
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-[100] w-full font-[family-name:var(--font-cairo)] px-2 sm:px-6 lg:px-8 pt-3 pb-2" dir="rtl">
      {/* Full-Width Executive Glass-Neumorphism Topbar Container */}
      <div
        className="w-full rounded-[24px] p-2.5 sm:p-4 border flex items-center justify-between gap-2 sm:gap-4 transition-all duration-300 relative z-50"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(241,245,249,0.85) 100%)',
          backdropFilter: 'blur(28px) saturate(1.9)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.9)',
          boxShadow: '0 10px 32px -4px rgba(0, 0, 0, 0.22), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.65)',
        }}
      >
        {/* Left Side: Sidebar Toggle / Mobile Menu & Responsive Search */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-xl">
          {/* Mobile Menu Button (Visible on mobile only < lg) */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-[#173A7C] hover:bg-slate-100/80 transition-all cursor-pointer border border-slate-200/80 shadow-xs"
              title="القائمة الرئيسية"
            >
              <Menu className="w-5 h-5 text-[#173A7C]" />
            </button>
          )}

          {/* Desktop Sidebar Toggle Collapse Button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="hidden lg:flex p-2 rounded-xl text-slate-600 hover:text-[#173A7C] hover:bg-slate-100/80 transition-all cursor-pointer border border-slate-200/80 shadow-xs"
              title={isSidebarCollapsed ? 'توسيع القائمة' : 'طَي القائمة'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-[#173A7C]" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-[#173A7C]" />
              )}
            </button>
          )}

          {/* Quick Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
            <input
              type="text"
              placeholder="البحث في النظام والإشعارات والطلاب..."
              className="w-full py-2 pr-9 pl-4 text-xs font-bold text-slate-800 bg-white/80 rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C]"
            />
          </div>
        </div>

        {/* Right Side: AI Assistant, Notifications & Admin Profile */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* AI Assistant Button */}
          <button
            onClick={() => setShowAiAssistant(true)}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-[#5CB07C] to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer border border-emerald-300/40"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span className="hidden sm:inline">المساعد الذكي AI</span>
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100/80 transition-all relative cursor-pointer border border-slate-200/80 shadow-xs"
              title="الإشعارات"
            >
              <Bell className="w-5 h-5 text-[#173A7C]" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border-2 border-white" />
            </button>

            {/* Notifications Panel */}
            {showNotifications && (
              <>
                {/* Click-away backdrop overlay */}
                <div
                  className="fixed inset-0 z-[990]"
                  onClick={() => setShowNotifications(false)}
                />

                {/* Mobile Full-Screen Overlay Starting Below Topbar */}
                <div className="sm:hidden fixed inset-x-3 top-[96px] z-[1220] p-0 shadow-2xl">
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <h4 className="font-black text-xs text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>إشعارات العمليات اللحظية</span>
                      </h4>
                      <button onClick={() => setShowNotifications(false)} className="text-slate-400">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                          <div className="flex items-center justify-between font-black text-slate-900">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-slate-400">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-bold leading-relaxed">{n.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Desktop Dropdown Panel */}
                <div className="hidden sm:block absolute top-full mt-6 left-0 w-96 rounded-2xl border border-slate-200 p-4 shadow-2xl z-[1000] text-right space-y-3 bg-white"
                  style={{ background: '#ffffff', boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)' }}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                    <h4 className="font-black text-xs text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>إشعارات العمليات اللحظية</span>
                    </h4>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
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
                        <p className="text-[11px] text-slate-600 font-bold leading-relaxed">{n.desc}</p>
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
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-white/80 transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(241,245,249,0.7) 100%)',
                boxShadow: '4px 4px 10px rgba(15,23,42,0.04), -4px -4px 10px rgba(255,255,255,0.9)',
              }}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white flex items-center justify-center font-black text-xs shadow-sm">
                A
              </div>
              <div className="hidden sm:block text-right text-xs">
                <span className="font-black text-slate-900 block leading-none">مدير المنصة</span>
                <span className="text-[9px] text-slate-500 font-bold leading-tight">سعود القحطاني</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Menu */}
            {showProfileMenu && (
              <div 
                className="absolute top-full mt-3 left-0 w-56 rounded-2xl border border-white/80 p-2 shadow-2xl z-[1000] text-right space-y-1 font-[family-name:var(--font-cairo)]"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
                  backdropFilter: 'blur(28px)',
                  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18)',
                }}
              >
                <Link
                  href="/dashboard/admin/settings"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-100/80 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>إعدادات النظام</span>
                </Link>
                <Link
                  href="/dashboard/student"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-100/80 transition-colors"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span>التبديل إلى لوحة الطالب</span>
                </Link>
                <div className="pt-1 border-t border-slate-200/60">
                  <button
                    onClick={async () => {
                      try {
                        await fetch('/api/auth/logout', { method: 'POST' });
                      } catch (e) {
                        console.error('Logout error:', e);
                      }
                      window.location.href = '/auth/login';
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* AI ASSISTANT SLIDE-OVER DRAWER */}
      {showAiAssistant && (
        <div className="fixed inset-0 z-[1300] bg-slate-950/70 backdrop-blur-md flex justify-start">
          <div className="w-full max-w-md bg-white text-slate-900 h-full p-6 space-y-5 shadow-2xl flex flex-col justify-between overflow-y-auto" dir="rtl">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white">
                    <Bot className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">المساعد الذكي للأدمن (AI Intelligence)</h3>
                    <p className="text-xs text-slate-500 font-bold">توليد تقارير وتحليلات فورية للمنصة</p>
                  </div>
                </div>
                <button onClick={() => setShowAiAssistant(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick AI Action Buttons */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-700">اختيارات التقارير السريعة:</span>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'توليد تقرير المبيعات والإيرادات المالية 📊',
                    'تحليل مؤشرات حضور الطلاب والتفاعل 🎓',
                    'استخراج توصيات تحسين المناهج والورش 💡',
                  ].map((btnText, i) => (
                    <button
                      key={i}
                      onClick={() => handleGenerateAiReport(btnText)}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-right text-xs font-black text-slate-800 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>{btnText}</span>
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Output Response Area */}
              {aiResponse && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white text-xs font-semibold leading-relaxed border border-emerald-500/30 whitespace-pre-line space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-xs pb-2 border-b border-white/10">
                    <Sparkles className="w-4 h-4" />
                    <span>تحليل الذكاء الاصطناعي المباشر:</span>
                  </div>
                  <p>{aiResponse}</p>
                </div>
              )}
            </div>

            {/* Custom AI Prompt Input */}
            <div className="pt-3 border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateAiReport(aiPrompt)}
                placeholder="اكتب استفسارك الإداري المباشر..."
                className="flex-1 p-3 text-xs font-bold bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C]"
              />
              <button
                onClick={() => handleGenerateAiReport(aiPrompt)}
                className="p-3 rounded-xl bg-[#173A7C] text-white cursor-pointer"
                title="إرسال"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
