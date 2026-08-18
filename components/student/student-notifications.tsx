'use client';

import React, { useState } from 'react';
import { Bell, Check, Trash2, Award, BookOpen, AlertCircle, ShieldCheck, X, CheckCheck } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'academic' | 'certificate' | 'system' | 'billing';
  isRead: boolean;
}

export const StudentNotifications: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'درس جديد متاح الآن ⚡',
      message: 'تم إضافة "الدرس الرابع: تطبيقات الذكاء الاصطناعي في قطاع الأعمال" إلى دورة الذكاء الاصطناعي.',
      time: 'منذ 15 دقيقة',
      type: 'academic',
      isRead: false,
    },
    {
      id: '2',
      title: 'إصدار شهادة معتمدة 📜',
      message: 'تهانينا! تم إصدار شهادة "دورة استخدام الحاسب الالي في الاعمال المكتبية" بنجاح.',
      time: 'منذ ساعتين',
      type: 'certificate',
      isRead: false,
    },
    {
      id: '3',
      title: 'تأكيد عملية الدفع 💳',
      message: 'تمت عملية إكمال الاشتراك في دورات ادخال بيانات ومعالجة نصوص بنجاح. الفاتورة رقم #INV-2026-881.',
      time: 'أمس، 04:30 م',
      type: 'billing',
      isRead: true,
    },
    {
      id: '4',
      title: 'رد على استفسارك الأكاديمي 💬',
      message: 'قام د. محمد القحطاني بالرد على سؤالك في مناقشة الدرس الأول.',
      time: 'منذ يومين',
      type: 'academic',
      isRead: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const getTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'certificate':
        return <Award className="w-4 h-4 text-[#5CB07C]" />;
      case 'academic':
        return <BookOpen className="w-4 h-4 text-[#173A7C]" />;
      case 'billing':
        return <ShieldCheck className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const renderContent = (isMobile: boolean = false) => (
    <div className="flex flex-col h-full w-full font-[family-name:var(--font-cairo)] text-right relative overflow-hidden" dir="rtl">
      {/* Top Emerald Accent Ribbon */}
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#5CB07C] via-[#173A7C] to-emerald-400 rounded-t-[28px] z-20" />

      {/* Header Bar */}
      <div className="p-4 pt-4 pb-3 border-b border-slate-200/60 flex items-center justify-between relative z-10 shrink-0 bg-slate-50/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20 shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
              <span>إشعارات الطالب والتنبيهات</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-extrabold truncate">
              {unreadCount > 0 ? `لديك ${unreadCount} إشعار جديد` : 'جميع الإشعارات مقروءة'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="p-1.5 px-2.5 text-[10px] font-black text-[#5CB07C] hover:bg-emerald-50 rounded-xl transition-all border border-emerald-200/60 flex items-center gap-1 cursor-pointer"
              title="تحديد الكل كمقروء"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">قراءة الكل</span>
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="إغلاق التنبيهات"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2.5 bg-slate-100/70 flex items-center justify-between border-b border-slate-200/50 shrink-0 relative z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20'
                : 'text-slate-600 hover:text-[#173A7C] hover:bg-white/60'
            }`}
          >
            الكل ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
              activeTab === 'unread'
                ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20'
                : 'text-slate-600 hover:text-[#173A7C] hover:bg-white/60'
            }`}
          >
            غير مقروء ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
            {unreadCount} جديد
          </span>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0 no-scrollbar relative z-10">
        {filteredNotifications.length === 0 ? (
          <div className="p-10 text-center text-slate-400 space-y-3 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Bell className="w-6 h-6 stroke-1" />
            </div>
            <p className="text-xs font-black text-slate-600">لا توجد إشعارات لعرضها حالياً</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer border group ${
                !notif.isRead
                  ? 'bg-gradient-to-r from-emerald-50/70 via-blue-50/50 to-white border-emerald-200/80 shadow-xs'
                  : 'bg-white/70 hover:bg-slate-50/80 border-slate-200/50'
              }`}
            >
              <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-200/60 shrink-0 mt-0.5">
                {getTypeIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="font-black text-slate-800 text-xs truncate">
                    {notif.title}
                  </h4>
                  <span className="text-[9px] text-slate-400 font-extrabold whitespace-nowrap shrink-0">
                    {notif.time}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                  {notif.message}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearNotification(notif.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer shrink-0"
                title="حذف الإشعار"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-200/50 text-center shrink-0 mt-auto relative z-10">
        <span className="text-[10px] font-black text-[#5CB07C]">
          النظام الذكي للتنبيهات الأكاديمية والمالية الموحد ✓
        </span>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Topbar Notification Trigger Button (NO WHITE HALO GLOW) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-xl text-slate-700 hover:text-[#173A7C] bg-slate-100/80 hover:bg-slate-200/80 transition-all border border-slate-200/60 shrink-0 cursor-pointer flex items-center justify-center relative"
        title="التنبيهات والإشعارات"
      >
        <Bell className="w-4 h-4 text-slate-700" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
          </>
        )}
      </button>

      {/* ── MOBILE: Sheet Overlay Below Header (< sm) ── */}
      {isOpen && (
        <div className="sm:hidden">
          {/* Transparent click-dismiss backdrop so header and page remain 100% unshaded */}
          <div
            className="fixed inset-0 z-[1210]"
            onClick={() => setIsOpen(false)}
          />

          {/* Full Screen Modal Container below topbar header */}
          <div
            className="fixed top-[96px] right-3 left-3 z-[1220] max-h-[calc(100vh-112px)] h-[80vh] rounded-[30px] border border-slate-300/90 flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-top-3 duration-300"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.95) 100%)',
              backdropFilter: 'blur(28px) saturate(1.9)',
              boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
            }}
          >
            {renderContent(true)}
          </div>
        </div>
      )}

      {/* ── DESKTOP: Dropdown Menu (>= sm) ── */}
      {isOpen && (
        <div className="hidden sm:block absolute top-full mt-6 left-0 z-[1200]">
          {/* Transparent click-dismiss backdrop so header remains completely clear and unshaded */}
          <div
            className="fixed inset-0 z-[1190]"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="relative z-[1200] w-96 max-h-[540px] h-[520px] rounded-[28px] border border-slate-300/85 flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(241,245,249,0.92) 100%)',
              backdropFilter: 'blur(28px) saturate(1.9)',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
            }}
          >
            {renderContent(false)}
          </div>
        </div>
      )}
    </div>
  );
};
