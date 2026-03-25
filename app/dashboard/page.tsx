"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Award, Settings, User, Clock, ChevronLeft, TrendingUp, Download } from "lucide-react";

const sidebarLinks = [
  { key: "courses", label: "دوراتي", icon: BookOpen },
  { key: "certificates", label: "شهاداتي", icon: Award },
  { key: "profile", label: "ملفي", icon: User },
  { key: "settings", label: "الإعدادات", icon: Settings },
];

const enrolledCourses = [
  { title: "استخدام الحاسب الآلي في الأعمال المكتبية", progress: 75, lastLesson: "الدرس 24: الرسوم البيانية في Excel", image: "" },
  { title: "دورات ادخال بيانات ومعالجة نصوص", progress: 30, lastLesson: "الدرس 14: تنسيق المستندات المتقدم", image: "" },
  { title: "دورة اللغة الانجليزية", progress: 10, lastLesson: "الدرس 4: المحادثات اليومية", image: "" },
];

const certificates = [
  { title: "استخدام الحاسب الآلي في الأعمال المكتبية", date: "2025-12-15", id: "CERT-001" },
];

const activities = [
  { text: "أكملت الدرس 24 في دورة الحاسب الآلي", time: "منذ ساعتين" },
  { text: "بدأت دورة إدخال البيانات", time: "منذ يوم" },
  { text: "حصلت على شهادة دورة الحاسب الآلي", time: "منذ 3 أيام" },
  { text: "أكملت الدرس 14 في دورة إدخال البيانات", time: "منذ 5 أيام" },
];

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("courses");

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-6 sticky top-28">
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
                <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center p-1">
                  <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500">
                    خ
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">خالد الغامدي</h3>
                  <p className="text-sm font-medium text-slate-500">متدرب</p>
                </div>
              </div>

              {/* Nav */}
              <nav className="space-y-2">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.key}
                      onClick={() => setActiveSection(link.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                        activeSection === link.key
                          ? "bg-[#173A7C]/10 text-[#173A7C]"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 w-full min-w-0">
            {/* Welcome Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white p-8 sm:p-10 mb-8 rounded-[32px] shadow-xl shadow-[#173A7C]/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvc3ZnPg==')] opacity-100" />
              <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black mb-2">
                    أهلاً بك، <span className="text-white">خالد</span> 👋
                  </h1>
                  <p className="text-base text-white/80 font-medium">تابع رحلتك التعليمية وحقق أهدافك المهنية بثقة.</p>
                </div>
                <div className="flex items-center gap-6 text-center bg-white/10 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/20">
                  <div>
                    <div className="text-3xl font-black text-white mb-1 font-sora">{enrolledCourses.length}</div>
                    <div className="text-sm font-semibold text-white/80">دورات مسجلة</div>
                  </div>
                  <div className="w-px h-12 bg-white/20" />
                  <div>
                    <div className="text-3xl font-black text-white mb-1 font-sora">{certificates.length}</div>
                    <div className="text-sm font-semibold text-white/80">شهادات</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Courses Section */}
            {activeSection === "courses" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 mb-6">دوراتي المسجلة</h2>
                {enrolledCourses.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border border-slate-200 shadow-sm p-6 rounded-[24px] flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:shadow-md transition-shadow group cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-[20px] bg-[#173A7C]/5 flex items-center justify-center shrink-0 group-hover:bg-[#173A7C] transition-colors">
                      <BookOpen className="w-8 h-8 text-[#173A7C] group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-lg mb-2 truncate">{c.title}</h3>
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mb-3">
                        <Clock className="w-4 h-4" /> {c.lastLesson}
                      </p>
                      {/* Progress Bar */}
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/50">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${c.progress}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full rounded-full bg-[#173A7C]"
                        />
                      </div>
                    </div>
                    <div className="text-center shrink-0 min-w-16">
                      <div className="text-2xl font-black text-[#173A7C] font-sora">{c.progress}%</div>
                      <div className="text-xs font-bold text-slate-400">مكتمل</div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-slate-300 shrink-0 hidden sm:block rtl:rotate-180" />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Certificates */}
            {activeSection === "certificates" && (
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-6">شهاداتي</h2>
                {certificates.length === 0 ? (
                  <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-16 text-center text-slate-500 font-medium">لا توجد شهادات حالياً</div>
                ) : (
                  <div className="space-y-4">
                    {certificates.map((cert, i) => (
                      <div key={i} className="bg-white border border-slate-200 shadow-sm p-6 rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
                          <div className="w-16 h-16 rounded-[20px] bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                            <Award className="w-8 h-8 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-lg mb-1">{cert.title}</h3>
                            <p className="text-sm font-medium text-slate-500">تاريخ الإصدار: {cert.date} · رقم: {cert.id}</p>
                          </div>
                        </div>
                        <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#173A7C] hover:border-[#173A7C]/30 transition-all cursor-pointer shadow-sm">
                          <Download className="w-4 h-4" />
                          تحميل PDF
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile */}
            {activeSection === "profile" && (
              <div className="bg-white border border-slate-200 shadow-sm p-8 rounded-[24px]">
                <h2 className="text-2xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-4">الملف الشخصي</h2>
                <div className="space-y-6 max-w-xl">
                  <div>
                    <label htmlFor="profile-name" className="text-sm font-bold text-slate-700 block mb-2">الاسم الكامل</label>
                    <input id="profile-name" defaultValue="خالد الغامدي" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none text-base font-medium" />
                  </div>
                  <div>
                    <label htmlFor="profile-email" className="text-sm font-bold text-slate-700 block mb-2">البريد الإلكتروني</label>
                    <input id="profile-email" defaultValue="khalid@example.com" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none text-base font-medium" dir="ltr" />
                  </div>
                  <button className="px-8 py-3.5 rounded-2xl bg-[#173A7C] text-white text-base font-bold cursor-pointer hover:bg-[#1E4D9D] transition-all shadow-md shadow-[#173A7C]/20 mt-4">
                    حفظ التغييرات
                  </button>
                </div>
              </div>
            )}

            {/* Settings */}
            {activeSection === "settings" && (
              <div className="bg-white border border-slate-200 shadow-sm p-8 rounded-[24px]">
                <h2 className="text-2xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-4">الإعدادات</h2>
                <div className="space-y-4 max-w-xl">
                  <label className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-white hover:shadow-sm transition-all">
                    <span className="text-base font-bold text-slate-700">إشعارات البريد الإلكتروني</span>
                    <input type="checkbox" defaultChecked className="accent-[#173A7C] w-5 h-5 cursor-pointer" />
                  </label>
                  <label className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-white hover:shadow-sm transition-all">
                    <span className="text-base font-bold text-slate-700">إشعارات واتساب</span>
                    <input type="checkbox" className="accent-[#173A7C] w-5 h-5 cursor-pointer" />
                  </label>
                </div>
              </div>
            )}

            {/* Activity Timeline */}
            <div className="mt-14">
              <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-[#173A7C]" />
                نشاط التعلم الأخير
              </h2>
              <div className="bg-white border border-slate-200 shadow-sm p-8 rounded-[24px]">
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] rtl:before:ml-0 rtl:before:mr-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-100">
                  {activities.map((a, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-[#173A7C] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-1">
                          <p className="text-sm font-bold text-slate-900">{a.text}</p>
                        </div>
                        <p className="text-xs font-medium text-slate-500">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
