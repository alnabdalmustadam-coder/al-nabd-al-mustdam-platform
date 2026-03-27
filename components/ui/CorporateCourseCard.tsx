import Link from "next/link";
import { MonitorPlay, ArrowRight, Shield, Cloud, Monitor, Code, FileText, BarChart3, Users, Brain, ShieldCheck, Briefcase, Target, Speaker, BookOpen, Heart, Activity } from "lucide-react";
import { CorporateCourse } from "@/data/corporateCourses";

// Map our simple string types to actual Lucide solid components
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
      <Link href="/contact" className="block h-full">
        {/* Outer glow on hover */}
        <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-br from-[#173A7C] to-[#5CB07C] opacity-[0.03] group-hover:opacity-[0.1] blur-sm transition-opacity duration-500 z-0"></div>
        
        {/* Card */}
        <div className="relative bg-white rounded-[1.75rem] p-7 border border-slate-100 shadow-[0_4px_20px_-5px_rgba(23,58,124,0.05)] group-hover:shadow-[0_20px_60px_-10px_rgba(23,58,124,0.18)] group-hover:border-slate-200 hover:-translate-y-2 transition-all duration-500 overflow-hidden z-10 h-full flex flex-col text-start">
          
          {/* Top accent gradient bar */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#5CB07C] to-[#173A7C] opacity-30 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Decorative corner gradient */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#173A7C] to-[#5CB07C] opacity-[0.03] group-hover:opacity-[0.07] rounded-full blur-2xl transition-opacity duration-700"></div>

          {/* Icon area */}
          <div className="flex items-start justify-between w-full mb-6 relative z-10">
            <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-[#173A7C] uppercase bg-gradient-to-br from-[#173A7C]/[0.05] to-transparent px-3 py-1.5 rounded-lg border border-[#173A7C]/10">
              <MonitorPlay className="w-3 h-3 text-[#5CB07C]" strokeWidth={2.5} />
              مؤسسات
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:scale-110 group-hover:text-[#5CB07C] group-hover:bg-[#5CB07C]/10 group-hover:shadow-lg transition-all duration-500 border border-black/[0.03]">
              <Icon className="w-7 h-7" strokeWidth={1.8} />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-[1.05rem] leading-[1.7] font-bold text-slate-800 group-hover:text-[#173A7C] transition-colors relative z-10 mb-auto pb-5">
            {course.title}
          </h3>

          {/* Separator */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-5 mt-auto"></div>

          {/* CTA Button */}
          <div className="w-full relative z-10">
            <div className="w-full bg-white text-slate-600 border border-slate-200 text-[13px] font-bold py-3 px-4 rounded-xl flex items-center justify-between group-hover:bg-gradient-to-l group-hover:from-[rgba(23,58,124,0.05)] group-hover:to-transparent group-hover:text-[#173A7C] group-hover:border-[#173A7C]/30 transition-all duration-500 shadow-sm group-hover:shadow-md">
              <span>اشترك الآن</span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-400 group-hover:bg-[#173A7C] group-hover:text-white flex items-center justify-center shadow-sm transition-all duration-500">
                <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
