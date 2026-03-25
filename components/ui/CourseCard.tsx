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
      <div className="relative group h-full flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_30px_60px_-15px_rgba(23,58,124,0.15)] hover:-translate-y-2 transition-all duration-500 overflow-hidden">
        
        {/* Top Image Section */}
        <div className="relative h-56 bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center overflow-hidden">
          {/* Subtle Glow Background Behind Image */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 opacity-60"></div>
          
          <div className="relative w-full h-full z-0">
            <Image 
              src={imageUrl} 
              alt={course.title} 
              fill 
              className="object-contain opacity-90 group-hover:scale-110 transition-transform duration-700 drop-shadow-sm"
            />
          </div>

          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#173A7C]/5 backdrop-blur-[2px]">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_10px_30px_rgba(23,58,124,0.2)] text-[#5CB07C] group-hover:scale-110 transition-transform duration-500">
              <Play className="w-6 h-6 ml-1" fill="currentColor" />
            </div>
          </div>

          <div className="absolute top-4 right-4 z-30">
            <Badge label={course.category} variant={course.category as any} className="shadow-sm border border-white/50 backdrop-blur-md" />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-1 relative z-20 bg-white">
          <h3 className="text-xl font-black text-slate-900 mb-3 line-clamp-2 group-hover:text-[#173A7C] transition-colors duration-300 leading-tight">
            {course.title}
          </h3>
          <p className="text-sm text-slate-500 mb-6 line-clamp-3 leading-relaxed flex-1 font-medium">
            {course.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-slate-600 mb-6 font-semibold">
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <Users className="w-4 h-4 text-[#173A7C]" />
              {course.enrollees || course.studentsCount} متدرب
            </span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <Clock className="w-4 h-4 text-[#5CB07C]" />
              {course.duration}
            </span>
          </div>

          {/* Price Container (Replicating the screenshot's prominent price bar but cleaner) */}
          <div className="bg-[#173A7C]/5 rounded-full px-5 py-3 mb-5 border border-[#173A7C]/10 flex justify-between items-center group-hover:bg-[#173A7C]/10 transition-colors">
            <span className="text-sm font-bold text-slate-700">{course.price === 0 ? "خيارات التسجيل" : "سعر الدورة"}</span>
            <span className="text-xl font-black text-[#173A7C]">
              {course.price === 0 ? (
                <span className="text-sm">تصفح الباقات</span>
              ) : (
                <>{course.price} <span className="text-sm font-bold">ريال سعودي</span></>
              )}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-auto">
            <button className="flex-1 bg-[#5CB07C] text-white text-sm font-bold py-3.5 px-2 rounded-full hover:bg-[#4a8f64] transition-all shadow-[0_5px_15px_rgba(92,176,124,0.3)] hover:shadow-[0_8px_20px_rgba(92,176,124,0.4)] hover:-translate-y-0.5 flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              أضف للسلة
            </button>
            <Link href={`/courses/${course.slug}`} className="flex-1 bg-white text-slate-700 text-sm font-bold py-3.5 px-2 rounded-full border border-slate-200 hover:border-[#173A7C]/30 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group/btn">
              معلومات الدورة
              <ArrowRight className="w-4 h-4 -rotate-45 group-hover/btn:rotate-0 transition-transform text-[#173A7C]" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
