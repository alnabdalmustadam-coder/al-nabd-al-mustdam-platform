"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Badge from "@/components/ui/Badge";
import StarRating from "@/components/ui/StarRating";
import { Course } from "@/types";
import { Users, Clock, Play, ShoppingCart, ArrowRight } from "lucide-react";
import Image from "next/image";

interface CourseCardProps {
  course: Course;
  index?: number;
}

export default function CourseCard({ course, index = 0 }: CourseCardProps) {
  const imageUrl = typeof course.image === "string" ? course.image : "/logo.webp";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <div className="relative group h-full flex flex-col bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_10px_40px_-10px_rgba(23,58,124,0.08)] hover:shadow-[0_40px_80px_-20px_rgba(23,58,124,0.18)] hover:border-slate-300 hover:-translate-y-2 transition-all duration-500 overflow-hidden">
        {/* Premium top accent bar */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#173A7C] via-[#5CB07C] to-[#173A7C] z-30 opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top Image Section */}
        <div className="relative h-48 sm:h-52 bg-gradient-to-br from-slate-50 to-[#f0f4f8] p-8 flex items-center justify-center overflow-hidden">
          {/* Subtle Glow Background Behind Image */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent z-10 opacity-80"></div>

          <div className="relative w-full h-full z-0">
            <Image
              src={imageUrl}
              alt={course.title}
              fill
              className="object-contain opacity-90 group-hover:scale-110 transition-transform duration-700 drop-shadow-md"
            />
          </div>

          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#173A7C]/20 backdrop-blur-[4px]">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-[0_10px_40px_rgba(23,58,124,0.3)] text-[#5CB07C] group-hover:scale-110 transition-transform duration-500">
              <Play className="w-6 h-6 ml-1" fill="currentColor" />
            </div>
          </div>

          <div className="absolute top-4 right-4 z-30">
            <Badge label={course.category} variant={course.category as any} className="shadow-sm border border-white/50 backdrop-blur-md" />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 sm:p-6 flex flex-col flex-1 relative z-20 bg-white">
          <h3 className="text-lg sm:text-[19px] font-black text-slate-900 mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#173A7C] group-hover:to-[#5CB07C] transition-all duration-300 leading-[1.3]">
            {course.title}
          </h3>
          <p className="text-[13px] sm:text-sm text-slate-500 mb-5 line-clamp-2 leading-relaxed flex-1 font-medium">
            {course.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-5 font-bold">
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Users className="w-3.5 h-3.5 text-[#173A7C]" />
              {course.enrollees || course.studentsCount} متدرب
            </span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Clock className="w-3.5 h-3.5 text-[#5CB07C]" />
              {course.duration}
            </span>
          </div>

          {/* Price Container */}
          <div className="bg-gradient-to-r from-slate-50 to-[#f8fafc] rounded-full px-5 py-3 mb-5 border border-slate-100 flex justify-between items-center group-hover:border-slate-200 transition-colors">
            <span className="text-xs font-black text-slate-500">{course.price === 0 ? "خيارات التسجيل" : "سعر الدورة"}</span>
            <span className="text-xl font-black text-[#173A7C]">
              {course.price === 0 ? (
                <span className="text-sm text-[#5CB07C]">تصفح الباقات</span>
              ) : (
                <>{course.price} <span className="text-xs font-bold text-slate-500">ر.س</span></>
              )}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 mt-auto">
            <button className="flex-1 bg-gradient-to-r from-[#5CB07C] to-[#4EA06E] text-white text-[15px] font-black py-3 px-2 rounded-full hover:from-[#4EA06E] hover:to-[#5CB07C] transition-all shadow-[0_8px_20px_-5px_rgba(92,176,124,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(92,176,124,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-2">
              <ShoppingCart className="w-[18px] h-[18px]" />
              أضف للسلة
            </button>
            <Link href={`/courses/${course.slug}`} className="flex-1 bg-white text-slate-700 text-[15px] font-black py-3 px-2 rounded-full border-2 border-slate-200 hover:border-[#173A7C] hover:text-[#173A7C] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group/btn">
              التفاصيل
              <ArrowRight className="w-[18px] h-[18px] -rotate-45 group-hover/btn:rotate-0 transition-transform text-slate-400 group-hover/btn:text-[#173A7C]" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
