"use client";

import { useState } from "react";
import { use } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { getCourseBySlug, courses } from "@/data/courses";
import CourseCard from "@/components/ui/CourseCard";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  Clock, Users, BookOpen, Award, ChevronDown, ChevronUp,
  CheckCircle, Play
} from "lucide-react";

const tabs = [
  { key: "overview", label: "نظرة عامة" },
  { key: "curriculum", label: "المحتوى" },
  { key: "instructor", label: "المدرب" },
  { key: "reviews", label: "التقييمات" },
];

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const course = getCourseBySlug(slug);
  
  if (!course) notFound();

  const [activeTab, setActiveTab] = useState("overview");
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  const related = courses.filter((c) => c.id !== course.id && c.category === course.category).slice(0, 3);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="relative rounded-[24px] overflow-hidden mb-12 shadow-sm border border-slate-200">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgwLDAsMCwwLjA0KSIvPjwvc3ZnPg==')] opacity-50" />
          <div className="relative p-8 sm:p-12 lg:p-16">
            <Badge label={course.category} variant={course.category as any} className="mb-6 shadow-sm" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight">{course.title}</h1>
            <p className="text-slate-600 max-w-3xl mb-8 text-lg leading-relaxed">{course.description}</p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-700 bg-white inline-flex p-3 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 pr-2">
                <StarRating rating={course.rating} size="sm" />
                <span>{course.rating} ({course.reviewsCount} تقييم)</span>
              </div>
              <div className="w-px h-4 bg-slate-200 hidden sm:block"></div>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-400" />{course.studentsCount} متدرب</span>
              <div className="w-px h-4 bg-slate-200 hidden sm:block"></div>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" />{course.duration}</span>
              <div className="w-px h-4 bg-slate-200 hidden sm:block"></div>
              <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-slate-400" />{course.lessonsCount} درس</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Content */}
          <div className="flex-1 w-full min-w-0">
            {/* Tabs */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none sticky top-24 z-10 bg-slate-50 pt-2 border-b border-slate-200 shadow-[0_4px_10px_-10px_rgba(0,0,0,0.1)]">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 rounded-t-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.key
                      ? "bg-white text-[#173A7C] border-t-2 border-x border-[#173A7C]/20 border-b-white -mb-px"
                      : "bg-transparent text-slate-500 hover:text-slate-800 border border-transparent border-b-0 hover:bg-slate-100/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* What You'll Learn */}
                  <div className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                      <Award className="w-6 h-6 text-[#173A7C]" />
                      ما ستتعلمه في هذه الدورة
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      {course.outcomes.map((o: string, i: number) => (
                         <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                           <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                             <CheckCircle className="w-4 h-4 text-emerald-600" />
                           </div>
                           <span className="text-sm font-medium text-slate-700 leading-relaxed">{o}</span>
                         </div>
                      ))}
                    </div>
                  </div>

                  {/* Why This Course */}
                  {course.whyThisCourse && course.whyThisCourse.length > 0 && (
                    <div className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm">
                      <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">لماذا هذه الدورة؟</h3>
                      <ul className="space-y-4">
                        {course.whyThisCourse.map((w: string, i: number) => (
                          <li key={i} className="flex items-start gap-4 text-sm font-medium text-slate-700 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <span className="text-[#173A7C] mt-0.5 w-6 text-center">✦</span>
                            <span className="leading-relaxed">{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "curriculum" && (
                <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-slate-200 shadow-sm">
                   <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">محتوى الدورة</h3>
                     <div className="space-y-4">
                     {course.curriculum.map((section: any, i: number) => (
                       <div key={i} className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors bg-slate-50/50">
                         <button
                           onClick={() => setOpenAccordion(openAccordion === i ? null : i)}
                           className="w-full flex items-center justify-between p-5 cursor-pointer bg-white"
                         >
                           <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-base font-bold text-slate-500">
                               {i + 1}
                             </div>
                             <div className="text-right">
                               <h4 className="font-bold text-slate-900 text-base">{section.title}</h4>
                               {section.lessons && <span className="text-sm font-medium text-slate-500 mt-1 block">{section.lessons.length} دروس · {section.duration}</span>}
                             </div>
                           </div>
                           <div className={`p-2 rounded-full transition-colors ${openAccordion === i ? 'bg-slate-100 text-slate-800' : 'text-slate-400'}`}>
                             {openAccordion === i ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                           </div>
                         </button>
                         {openAccordion === i && section.lessons && (
                           <motion.div
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: "auto", opacity: 1 }}
                             transition={{ duration: 0.3 }}
                             className="border-t border-slate-100 bg-slate-50/80"
                           >
                             <ul className="py-2 px-4 shadow-inner">
                               {section.lessons.map((lesson: string, j: number) => (
                                 <li key={j} className="flex items-center justify-between p-4 my-2 text-sm font-medium text-slate-700 bg-white rounded-lg border border-slate-100 shadow-sm hover:border-[#173A7C]/30 hover:shadow transition-all group cursor-default">
                                   <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-[#173A7C]/5 flex items-center justify-center group-hover:bg-[#173A7C]/10 transition-colors">
                                      <Play className="w-3.5 h-3.5 text-[#173A7C] mr-0.5" />
                                     </div>
                                     {lesson}
                                   </div>
                                 </li>
                               ))}
                             </ul>
                           </motion.div>
                         )}
                       </div>
                     ))}
                   </div>
                </div>
              )}

              {activeTab === "instructor" && (
                <div className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start gap-8">
                    <div className="w-24 h-24 rounded-full bg-slate-100 p-1 shrink-0 border border-slate-200">
                      <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-3xl font-black text-slate-400">
                        {course.trainerId ? course.trainerId.slice(-1) : course.title[0]}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2">أكاديمية النبض المستدام</h3>
                      <p className="text-base text-slate-600 mb-6 leading-relaxed max-w-2xl">نخبة من المدربين المتخصصين في تقديم أحدث المحتويات التعليمية والتدريبية بمنهجية احترافية تواكب متطلبات سوق العمل.</p>
                      <div className="flex items-center gap-8 text-sm font-medium text-slate-500 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 inline-flex">
                         <div className="flex flex-col items-center">
                           <span className="text-[#173A7C] font-black text-xl mb-1">{course.studentsCount}+</span>
                           <span>متدرب</span>
                         </div>
                         <div className="w-px h-10 bg-slate-200"></div>
                         <div className="flex flex-col items-center">
                           <span className="text-[#173A7C] font-black text-xl mb-1">{course.rating}</span>
                           <span>تقييم</span>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="bg-white p-12 rounded-[24px] border border-slate-200 shadow-sm text-center">
                  <div className="text-6xl font-black text-[#173A7C] mb-4">{course.rating}</div>
                  <StarRating rating={course.rating} size="lg" className="justify-center mb-4 text-[#E8A020]" />
                  <p className="text-base font-medium text-slate-500">{course.reviewsCount} تقييم إيجابي من المتدربين</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sticky Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sticky top-28">
              <div className="text-center mb-8 pb-6 border-b border-slate-100">
                <div className="text-4xl font-black text-[#173A7C] mb-2 flex items-center justify-center gap-2">
                  {course.price} <span className="text-base font-bold text-slate-400">ر.س /شهر</span>
                </div>
              </div>

              <Button href="/checkout" size="lg" className="w-full mb-3 text-lg py-4">
                سجّل في الدورة الآن
              </Button>
              <Button variant="secondary" size="md" className="w-full font-bold">
                تواصل للاستفسار
              </Button>

              <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-slate-500 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> المدة</span>
                  <span className="text-slate-900">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-slate-500 flex items-center gap-2"><BookOpen className="w-4 h-4 text-slate-400" /> الدروس</span>
                  <span className="text-slate-900">{course.lessonsCount} درس تفاعلي</span>
                </div>
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-slate-500 flex items-center gap-2"><svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> المستوى</span>
                  <span className="text-slate-900">
                    {course.level === "beginner" ? "مبتدئ" : course.level === "intermediate" ? "متوسط" : "متقدم"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm font-medium bg-emerald-50 rounded-lg p-3 mt-4 border border-emerald-100">
                  <span className="text-emerald-700 flex items-center gap-2"> الشهادة</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">معتمدة <CheckCircle className="w-4 h-4" /></span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Courses */}
        {related.length > 0 && (
          <div className="mt-24 pt-16 border-t border-slate-200">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-10 text-center">دورات <span className="text-[#173A7C]">ذات صلة</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((c, i) => (
                <CourseCard key={c.id} course={c} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
