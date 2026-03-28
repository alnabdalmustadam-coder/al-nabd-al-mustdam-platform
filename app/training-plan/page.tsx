"use client";

import { motion } from "framer-motion";
import { Target, MonitorPlay, Presentation, Users, CalendarDays, ExternalLink, PlayCircle, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const synchronousCourses = [
  { id: 1, name: "إدارة الموارد البشرية", time: "6:00 PM - 9:00 PM", date: "25/10/2021", status: "عن بعد", instructor: "أ. ابراهيم الشيخي" },
  { id: 2, name: "التخطيط الاستراتيجي", time: "6:00 PM - 9:00 PM", date: "18/03/1443", status: "عن بعد", instructor: "أ. صالح الحميدي" },
  { id: 3, name: "إدارة المهام وترتيب الأولويات", time: "6:00 PM - 9:00 PM", date: "27/03/1443", status: "عن بعد", instructor: "أ. صالح الحميدي" },
];

const asynchronousCourses = [
  { id: 4, name: "إدخال بيانات ومعالجة نصوص", time: "9:00 AM - 10:30 AM", date: "25/10/2021", status: "حضوري", instructor: "أ. وليد موسى" },
  { id: 5, name: "استخدام الحاسب الآلي في الأعمال المكتبية", time: "9:00 PM - 10:30 PM", date: "02/11/2021", status: "حضوري", instructor: "أ. وليد موسى" },
];

export default function TrainingPlanPage() {
  const [activeTab, setActiveTab] = useState<"sync" | "async">("sync");

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-[calc(10vh+5rem)] font-sans" dir="rtl">
      
      {/* ═══════════════════════════════════════ HEADER ═══════════════════════════════════════ */}
      <section className="relative px-4 sm:px-6 mb-16 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
            <Target className="w-4 h-4 text-[#173A7C]" />
            <span className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">مسارات التعلم والتطوير</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 mb-6 leading-[1.35] tracking-tight">
            الخطة التدريبية <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C] inline-block mt-3">لبرامج التدريب الإلكتروني</span>
          </h1>
          
          <p className="text-slate-500 text-base sm:text-lg font-medium leading-[1.8] max-w-3xl mx-auto mb-10">
            توفر منصة المعهد الدورات التدريبية والتأهيلية والأدلة الإرشادية الإلكترونية الشاملة للبرامج المستخدمة في بيئات التدريب الإلكتروني للمتدربين، لضمان أعلى درجات الاستفادة والكفاءة.
          </p>

          {/* Key Info Cards Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto mt-12 text-right">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">أهداف الخطة</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                ضمان امتلاك المتدرب الخبرة اللازمة والاستفادة القصوى في التعامل مع نمط التعليم الإلكتروني بشكل فعال.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <MonitorPlay className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">المهارات والأساليب</h3>
              <ul className="text-sm font-medium text-slate-500 leading-relaxed space-y-1">
                <li>• استخدام الفصول الافتراضية.</li>
                <li>• استخدام أنظمة إدارة التعلم.</li>
                <li>• تدريب متزامن وغير متزامن.</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">الفئة المستهدفة</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed mt-4 bg-slate-50 p-3 rounded-xl inline-block">
                جميع المتدربين (المتعلمين)
              </p>
            </div>

          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════ TABLES ═══════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.08)] overflow-hidden">
          
          {/* Tabs Header */}
          <div className="flex border-b border-slate-100 flex-col sm:flex-row">
            <button 
              onClick={() => setActiveTab("sync")}
              className={`flex-1 flex items-center justify-center gap-3 py-6 px-4 font-black transition-colors ${activeTab === 'sync' ? 'bg-blue-50/50 text-[#173A7C] border-b-2 border-[#173A7C]' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
            >
              <Presentation className="w-5 h-5" />
              التدريب الإلكتروني (المتزامن)
            </button>
            <button 
              onClick={() => setActiveTab("async")}
              className={`flex-1 flex items-center justify-center gap-3 py-6 px-4 font-black transition-colors ${activeTab === 'async' ? 'bg-emerald-50/50 text-[#5CB07C] border-b-2 border-[#5CB07C]' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
            >
              <PlayCircle className="w-5 h-5" />
              التدريب الإلكتروني (الغير متزامن)
            </button>
          </div>

          <div className="p-6 sm:p-10">
            {/* Sync Tab Content */}
            {activeTab === 'sync' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                <div className="mb-8 p-5 bg-[#173A7C]/5 rounded-2xl border border-[#173A7C]/10 text-slate-700 font-medium leading-[1.8] text-[15px]">
                  <strong>عبر القاعة الافتراضية:</strong> يتم إعداد جدول للدورات المتزامنة تشرح التعليم الإلكتروني لمدة أربع على فترتين صباحية ومسائية، ويُتاح للمتعلم اختيار الوقت المناسب له، وتتم المناقشة والرد على الاستفسارات خلال الدورات بشكل مباشر.
                </div>
                
                <div className="overflow-x-auto pb-4">
                  <table className="w-full text-right border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50/80 border-y border-slate-100">
                        <th className="py-4 px-6 font-bold text-slate-800 w-1/3">مسمى الدورة</th>
                        <th className="py-4 px-6 font-bold text-slate-800">الوقت</th>
                        <th className="py-4 px-6 font-bold text-slate-800">التاريخ</th>
                        <th className="py-4 px-6 font-bold text-slate-800">حالة التدريب</th>
                        <th className="py-4 px-6 font-bold text-slate-800">المدرب</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {synchronousCourses.map((course) => (
                        <tr key={course.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="py-4 px-6 font-bold text-[#173A7C]">{course.name}</td>
                          <td className="py-4 px-6 font-medium text-slate-500" dir="ltr"><span className="flex items-center justify-end gap-2"><Clock className="w-4 h-4 text-slate-400" />{course.time}</span></td>
                          <td className="py-4 px-6 font-medium text-slate-500" dir="ltr"><span className="flex items-center justify-end gap-2"><CalendarDays className="w-4 h-4 text-slate-400" />{course.date}</span></td>
                          <td className="py-4 px-6">
                            <span className="bg-[#173A7C]/10 text-[#173A7C] px-3 py-1 rounded-full text-xs font-bold">
                              {course.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-700">{course.instructor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Async Tab Content */}
            {activeTab === 'async' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                <div className="mb-8 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 text-slate-700 font-medium leading-[1.8] text-[15px]">
                  <strong>عبر نظام إدارة التعلم ومتاح دائماً:</strong> يتم إعداد الدورات والمقررات التدريبية تشرح التعليم الإلكتروني، يستطيع المتعلم من خلالها الوصول لها في أي وقت، وبعد حضور الدورة يمكن الرجوع لها متى شاء.
                </div>
                
                <div className="overflow-x-auto pb-4">
                  <table className="w-full text-right border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50/80 border-y border-slate-100">
                        <th className="py-4 px-6 font-bold text-slate-800 w-1/3">مسمى الدورة</th>
                        <th className="py-4 px-6 font-bold text-slate-800">الوقت</th>
                        <th className="py-4 px-6 font-bold text-slate-800">التاريخ</th>
                        <th className="py-4 px-6 font-bold text-slate-800">حالة التدريب</th>
                        <th className="py-4 px-6 font-bold text-slate-800">المدرب</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {asynchronousCourses.map((course) => (
                        <tr key={course.id} className="hover:bg-emerald-50/30 transition-colors">
                          <td className="py-4 px-6 font-bold text-[#5CB07C]">{course.name}</td>
                          <td className="py-4 px-6 font-medium text-slate-500" dir="ltr"><span className="flex items-center justify-end gap-2"><Clock className="w-4 h-4 text-slate-400" />{course.time}</span></td>
                          <td className="py-4 px-6 font-medium text-slate-500" dir="ltr"><span className="flex items-center justify-end gap-2"><CalendarDays className="w-4 h-4 text-slate-400" />{course.date}</span></td>
                          <td className="py-4 px-6">
                            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                              {course.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-700">{course.instructor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* External Video Link Block */}
                <div className="mt-10 p-6 sm:p-8 bg-slate-900 rounded-3xl relative overflow-hidden text-center sm:text-right flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                  <div className="absolute right-0 top-0 w-32 h-32 bg-[#5CB07C] blur-[60px] opacity-20 rounded-full" />
                  
                  <div className="relative z-10 flex-1">
                    <h3 className="text-white font-black text-xl mb-3 flex items-center justify-center sm:justify-start gap-3">
                      <MonitorPlay className="w-6 h-6 text-[#5CB07C]" />
                      تدريب إلكتروني مرئي
                    </h3>
                    <p className="text-slate-400 font-medium text-[15px] leading-relaxed max-w-2xl">
                      تم تصميم مقاطع فيديو قصيرة ومنشورة في الموقع الرسمي تشرح أدوات نظام التعلم الإلكتروني من أنظمة تعلم وفصول افتراضية، ويمكن الوصول لها من خلال المنصة الوطنية.
                    </p>
                  </div>
                  
                  <a href="https://Ls.Nelc.Gov.Sa" target="_blank" rel="noopener noreferrer" className="relative z-10 shrink-0 bg-white hover:bg-slate-50 text-slate-900 px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-3">
                    الذهاب للمنصة المعتمدة
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

              </motion.div>
            )}
          </div>
          
        </div>
      </section>
      
    </div>
  );
}
