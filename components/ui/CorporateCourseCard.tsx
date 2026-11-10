"use client";

import Link from "next/link";
import {
  MonitorPlay, ArrowRight, Shield, Cloud, Monitor, Code, FileText,
  BarChart3, Users, Brain, ShieldCheck, Briefcase, Target, Speaker,
  BookOpen, Heart, Activity
} from "lucide-react";
import type { CorporateCourse } from "@/data/corporateCourses";

const iconMap = {
  shield: Shield,
  cloud: Cloud,
  computer: Monitor,
  code: Code,
  file: FileText,
  chart: BarChart3,
  users: Users,
  brain: Brain,
  check: ShieldCheck,
  briefcase: Briefcase,
  target: Target,
  speaker: Speaker,
  book: BookOpen,
  office: Briefcase,
  heart: Heart,
};

export default function CorporateCourseCard({ course }: { course: CorporateCourse }) {
  const Icon = iconMap[course.iconType as keyof typeof iconMap] || Activity;

  return (
    <div className="group relative h-full">
      <Link
        href={`/corporate/${course.slug}`}
        className="block h-full"
        aria-label={`تفاصيل برنامج ${course.title}`}
      >
        {/* Card Container — Clean, lightweight Home-style card */}
        <div className="relative bg-white rounded-[1.75rem] p-6 sm:p-7 border border-[#0B3766]/10 shadow-[0_4px_20px_-5px_rgba(11,55,102,0.08)] group-hover:shadow-[0_20px_50px_-10px_rgba(11,55,102,0.14)] group-hover:border-[#168AD3]/30 hover:-translate-y-1.5 transition-all duration-400 overflow-hidden h-full flex flex-col justify-between pf-card-equal">
          
          {/* Top accent hairline */}
          <div className="absolute top-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-transparent via-[#168AD3] to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-400" />

          {/* Top Row: Category tag + Icon */}
          <div className="flex items-start justify-between w-full mb-4 relative z-10">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0B3766] bg-[#0B3766]/[0.05] px-3 py-1.5 rounded-xl border border-[#0B3766]/10">
              <MonitorPlay className="w-3.5 h-3.5 text-[#19B6C7]" strokeWidth={2.2} />
              <span>برنامج شركات</span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-[#0B3766] group-hover:text-white group-hover:bg-gradient-to-br group-hover:from-[#0B3766] group-hover:to-[#168AD3] flex items-center justify-center transition-all duration-400 border border-slate-100 shadow-2xs group-hover:shadow-md">
              <Icon className="w-6 h-6 transition-transform duration-400 group-hover:scale-110" strokeWidth={1.8} />
            </div>
          </div>

          {/* Title — Clean Royal Navy */}
          <h3 className="card-title-royal-blue text-[1.02rem] sm:text-[1.08rem] font-bold leading-[1.65] text-[#0B3766] group-hover:text-[#168AD3] transition-colors my-auto py-2">
            {course.title}
          </h3>

          {/* Separator hairline */}
          <div className="h-px w-full bg-slate-100 my-4" />

          {/* Bottom Action Pill — Home aesthetic */}
          <div className="w-full relative z-10">
            <div className="w-full bg-[#F8FAFC] group-hover:bg-gradient-to-l group-hover:from-[#0B3766] group-hover:to-[#168AD3] text-[#0B3766] group-hover:text-white border border-slate-200/80 group-hover:border-transparent text-xs sm:text-[13px] font-bold py-2.5 px-4 rounded-xl flex items-center justify-between transition-all duration-300 shadow-2xs">
              <span>استعرض تفاصيل البرنامج</span>
              <div className="w-6 h-6 rounded-lg bg-white/90 group-hover:bg-white/20 text-[#0B3766] group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
