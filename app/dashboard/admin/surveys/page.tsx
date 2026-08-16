'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  MessageSquare,
  Sparkles,
  Users,
  CheckCircle2,
  ThumbsUp,
  Filter,
  BarChart2,
  TrendingUp,
  Quote,
  Search,
} from 'lucide-react';

interface ReviewItem {
  id: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'approved' | 'pending';
}

export default function AdminSurveysPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'rev-1',
      studentName: 'عبدالله الشمري',
      courseTitle: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      instructorName: 'د. خالد الدوسري',
      rating: 5,
      comment: 'دورة ممتازة جداً! المحتوى العلمي ثري، والتطبيقات العملية في الحوار والمواطنة الصالحة كانت على أعلى مستوى من الاحترافية.',
      date: 'اليوم، 11:20 ص',
      status: 'approved',
    },
    {
      id: 'rev-2',
      studentName: 'سارة العتيبي',
      courseTitle: 'برنامج القيادة المستدامة والمسؤولية المجتمعية',
      instructorName: 'د. محمد القحطاني',
      rating: 5,
      comment: 'من أفضل البرامج التدريبية التي حضرتها. أسلوب د. محمد متميز والتفاعل في الورش المباشرة ممتاز والتطبيقات واقعية.',
      date: 'أمس، 05:45 م',
      status: 'approved',
    },
    {
      id: 'rev-3',
      studentName: 'م. خالد الدوسري',
      courseTitle: 'الشهادة الاحترافية في إدارة الاستدامة البيئية',
      instructorName: 'أ. د. سارة العتيبي',
      rating: 4,
      comment: 'المحتوى مفيد وقيم جداً، ونقترح زيادة التطبيقات العملية في وحدة التقييم الذاتي للسلامة البيئية.',
      date: '28 يوليو 2026',
      status: 'approved',
    },
  ]);

  const filteredReviews = reviews.filter(
    (r) =>
      r.studentName.includes(searchQuery) ||
      r.courseTitle.includes(searchQuery) ||
      r.instructorName.includes(searchQuery)
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#173A7C]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-20 left-10 w-[30rem] h-[30rem] bg-amber-500/8 rounded-full blur-[160px]" />
      </div>

      {/* Header Banner - Liquid Glass Hero */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-7 liquid-glass-hero border border-white/80 student-card-accent"
      >
        <div className="specular-card-reflection" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-3 sm:space-y-3.5">
            <div className="flex flex-col items-start">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-900 text-[10px] sm:text-xs font-black border border-amber-500/20 shrink-0 whitespace-nowrap mb-3 sm:mb-4">
                <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
                <span>تقييمات المتدربين واستبيانات الجودة الأكاديمية</span>
              </div>
              <h1 className="text-sm sm:text-2xl lg:text-3xl font-black student-heading-h1 student-name-gradient leading-snug">
                استبيانات وتقييمات <span className="inline-block whitespace-nowrap">الدورات والمدربين 🌟</span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs lg:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
              استعراض التغذية الراجعة، تقييمات الطلاب لكل مساق ومحاضر، وتحليل مؤشرات الرضا وملاحظات التطوير المستمر.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-800 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-emerald-500/25 font-bold text-xs shrink-0 whitespace-nowrap">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>نظام الاعتماد الأكاديمي النشط</span>
          </div>
        </div>

        {/* Summary KPI Cards Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-[#173A7C]/10">
          <div className="liquid-glass-inset p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/70 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500">متوسط التقييم العام</span>
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-[#173A7C]">4.9 / 5.0</div>
            <p className="text-[10px] sm:text-[11px] text-emerald-700 font-bold">⭐ بناءً على 1,420 تقييماً معتمداً</p>
          </div>

          <div className="liquid-glass-inset p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/70 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500">نسبة رضا المتدربين</span>
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-700">98.4%</div>
            <p className="text-[10px] sm:text-[11px] text-[#173A7C] font-bold">📈 مؤشر امتياز أكاديمي عالي</p>
          </div>

          <div className="liquid-glass-inset p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/70 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500">إجمالي التقييمات هذا الشهر</span>
              <MessageSquare className="w-3.5 h-3.5 text-[#173A7C]" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-[#173A7C]">328 تقييماً</div>
            <p className="text-[10px] sm:text-[11px] text-emerald-700 font-bold">مراجعة ومعتمدة للنشر 🟢</p>
          </div>
        </div>
      </motion.div>

      {/* Filter / Search Bar */}
      <div className="liquid-glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/60 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-xs sm:text-sm font-extrabold text-[#152C5B] student-heading-h3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#173A7C]" />
          <span>أحدث تقييمات وآراء المتدربين المعتمدة</span>
        </h2>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم المتدرب، المساق، أو المدرب..."
            className="w-full py-2 pr-9 pl-3.5 text-xs font-bold text-slate-800 bg-white/90 rounded-lg sm:rounded-xl border border-slate-200/80 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3.5 sm:space-y-4">
        {filteredReviews.map((rev) => (
          <motion.div
            key={rev.id}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="liquid-glass-card liquid-glass-hover rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/70 space-y-3 relative group student-card-accent"
          >
            <div className="specular-card-reflection" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#173A7C]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white font-black flex items-center justify-center text-xs sm:text-sm shadow-md shadow-[#173A7C]/20 border border-white/20 shrink-0">
                  {rev.studentName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-[#152C5B] student-heading-h3">
                    {rev.studentName}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-bold">
                    المساق: <span className="text-[#173A7C]">{rev.courseTitle}</span> ({rev.instructorName})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20 shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < rev.rating ? 'text-amber-500 fill-amber-400' : 'text-slate-300'
                    }`}
                  />
                ))}
                <span className="text-[11px] font-mono font-black text-amber-900 mr-1">{rev.rating}.0</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 font-bold leading-relaxed pr-1 flex items-start gap-2">
              <Quote className="w-3.5 h-3.5 text-[#173A7C]/40 shrink-0 mt-0.5" />
              <span>"{rev.comment}"</span>
            </p>

            <div className="flex items-center justify-between pt-2 text-[10px] sm:text-[11px] text-slate-400 font-bold border-t border-[#173A7C]/10">
              <span>{rev.date}</span>
              <span className="text-emerald-800 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                تمت المراجعة والاعتماد للنشر
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
