'use client';

import React, { useState } from 'react';
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
      comment: 'من أفضل البرامج التدريبية التي حضرتها. أسلوب د. محمد متميز والتفاعل في الورش المباشرة ممتاز.',
      date: 'أمس، 05:45 م',
      status: 'approved',
    },
    {
      id: 'rev-3',
      studentName: 'م. خالد الدوسري',
      courseTitle: 'الشهادة الاحترافية في إدارة الاستدامة البيئية',
      instructorName: 'أ. د. سارة العتيبي',
      rating: 4,
      comment: 'المحتوى مفيد وقيم جداً، ونقترح زيادة التطبيقات العملية في وحدة التقييم الذاتي.',
      date: '28 يوليو 2026',
      status: 'approved',
    },
  ]);

  const glassNeumorphicCard = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(241,245,249,0.90) 100%)',
    backdropFilter: 'blur(16px) saturate(1.4)',
    WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08), 0 10px 28px rgba(15, 23, 42, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.6)',
  };

  const glassNeumorphicInset = {
    background: 'rgba(241, 245, 249, 0.7)',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
  };

  return (
    <div className="space-y-6" dir="rtl">

      {/* Header Banner - Ultra Premium Glass style matching Main Dashboard */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 animate-fade-in-up ultra-card-hover" style={glassNeumorphicCard}>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-2 pr-2 border-r-4 border-[#173A7C]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#173A7C] text-xs font-semibold border border-blue-200">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>تقييمات المتدربين واستبيانات الجودة</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            استبيانات وتقييمات الدورات والمدربين 🌟
          </h1>
          <p className="text-xs text-slate-500 font-normal max-w-2xl leading-relaxed">
            استعراض التغذية الراجعة، تقييمات الطلاب لكل مساق ومحاضر، وتحليل مؤشرات الرضا الأكاديمي.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl space-y-2 border ultra-card-hover relative overflow-hidden" style={glassNeumorphicCard}>
          <div className="absolute top-0 right-0 left-0 h-1 bg-amber-400" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">متوسط التقييم العام</span>
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">4.9 / 5.0</div>
          <p className="text-[10px] text-emerald-600 font-medium">⭐ بناءً على 1,420 تقييم معتمد</p>
        </div>

        <div className="p-6 rounded-2xl space-y-2 border ultra-card-hover relative overflow-hidden" style={glassNeumorphicCard}>
          <div className="absolute top-0 right-0 left-0 h-1 bg-emerald-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">نسبة رضا المتدربين</span>
            <ThumbsUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">98.4%</div>
          <p className="text-[10px] text-blue-600 font-medium">📈 مؤشر ممتاز جداً</p>
        </div>

        <div className="p-6 rounded-2xl space-y-2 border ultra-card-hover relative overflow-hidden" style={glassNeumorphicCard}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500">إجمالي التقييمات هذا الشهر</span>
            <MessageSquare className="w-5 h-5 text-[#173A7C]" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">328 تقييماً</div>
          <p className="text-[10px] text-[#5CB07C] font-black">مكتملة ومراجعة</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#173A7C]" />
          <span>أحدث تقييمات وآراء المتدربين المعتمدة</span>
        </h2>

        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-[28px] p-6 border space-y-3 transition-all hover:shadow-lg"
              style={glassNeumorphicCard}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white font-black flex items-center justify-center text-sm shadow-md">
                    {rev.studentName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">{rev.studentName}</h3>
                    <p className="text-xs text-slate-500 font-bold">المساق: {rev.courseTitle} ({rev.instructorName})</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-mono font-black text-slate-700 mr-1.5">{rev.rating}.0</span>
                </div>
              </div>

              <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                "{rev.comment}"
              </p>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-bold">
                <span>{rev.date}</span>
                <span className="text-emerald-700 font-black bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  تمت المراجعة والنشر ✓
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
