"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Badge from "@/components/ui/Badge";
import type { Course } from "@/types";
import { Users, Clock, Play, ShoppingCart, Heart, Check } from "lucide-react";
import { CardImage } from '@/components/ui/CardImage';
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

interface CourseCardProps {
  course: Course;
  index?: number;
}

const BADGE_VARIANTS = ["admin", "data", "languages", "tech", "corporate"] as const;

export default function CourseCard({ course, index = 0 }: CourseCardProps) {
  const imageUrl = typeof course.image === "string" ? course.image : "/logo.webp";
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCart, addToCart } = useCart();

  const isFavorited = isInWishlist(course.id);
  const inCart = isInCart(course.id);
  const badgeVariant = BADGE_VARIANTS.find((variant) => variant === course.category) || "default";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <div className="relative group h-full flex flex-col bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_10px_40px_-10px_rgba(23,58,124,0.08)] hover:shadow-[0_40px_80px_-20px_rgba(23,58,124,0.18)] hover:border-slate-300 hover:-translate-y-2 transition-all duration-500 overflow-hidden">
        {/* Premium top accent bar */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#173A7C] via-[#5CB07C] to-[#173A7C] z-30 opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top Image Section */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-slate-50 to-[#f0f4f8]">
          <div className="relative z-0 w-full">
            <CardImage
              src={imageUrl}
              alt={course.title}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* Hover Play Overlay */}
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#173A7C]/20 backdrop-blur-[4px]">
            <Link
              href={`/courses/${course.slug}`}
              className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-[0_10px_40px_rgba(23,58,124,0.3)] text-[#5CB07C] group-hover:scale-110 transition-transform duration-500 cursor-pointer"
            >
              <Play className="w-6 h-6 ml-1" fill="currentColor" />
            </Link>
          </div>

          {/* Category Badge (Top Right) */}
          <div className="absolute top-4 right-4 z-30">
            <Badge label={course.category} variant={badgeVariant} className="shadow-sm border border-white/50 backdrop-blur-md" />
          </div>

          {/* Wishlist Heart Icon (Top Left) */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(course);
            }}
            className={`absolute top-4 left-4 z-30 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md backdrop-blur-md cursor-pointer active:scale-90 ${
              isFavorited
                ? "bg-rose-500 text-white shadow-rose-500/30 scale-105"
                : "bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white shadow-slate-900/10"
            }`}
            title={isFavorited ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            aria-label="المفضلة"
          >
            <Heart
              className={`w-4 h-4 transition-transform duration-300 ${
                isFavorited ? "fill-white stroke-white scale-110" : "stroke-current"
              }`}
            />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-5 sm:p-6 flex flex-col flex-1 relative z-20 bg-white">
          <Link href={`/courses/${course.slug}`}>
            <h3 className="card-title-royal-blue text-lg sm:text-[19px] mb-2.5 line-clamp-2 leading-[1.3] group-hover:text-[#1E4D9D] transition-colors">
              {course.title}
            </h3>
          </Link>
          <p className="card-desc-premium mb-5 text-[11px] sm:text-xs line-clamp-4 sm:line-clamp-3 leading-[1.75] flex-1">
            {course.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-5 font-bold">
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Users className="w-3.5 h-3.5 text-[#173A7C]" />
              {(course.enrollees || course.studentsCount || 0) > 0 ? `${course.enrollees || course.studentsCount} متدرب` : 'متاح للتسجيل'}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Clock className="w-3.5 h-3.5 text-[#5CB07C]" />
              {course.duration}
            </span>
          </div>

          {/* Price Container */}
          <div className="bg-gradient-to-r from-slate-50 to-[#f8fafc] rounded-full px-5 py-3 mb-5 border border-slate-100 flex justify-between items-center group-hover:border-slate-200 transition-colors">
            <span className="text-xs font-black text-slate-500">إتاحة مؤقتة</span>
            <span className="text-xl font-black text-[#173A7C]">
              <span className="text-sm text-[#5CB07C]">مجاناً الآن</span>
            </span>
          </div>

          {/* Action Buttons: Register Now + Details + Cart */}
          <div className="flex items-center gap-2 mt-auto pt-1">
            <Link
              href={`/checkout?slug=${course.slug}`}
              className="flex-1 bg-gradient-to-r from-[#5CB07C] to-[#4EA06E] text-white text-xs font-black py-2.5 px-3 rounded-xl hover:from-[#4EA06E] hover:to-[#5CB07C] transition-all shadow-md shadow-[#5CB07C]/20 hover:-translate-y-0.5 flex items-center justify-center gap-1 text-center truncate"
            >
              سجّل مجاناً
            </Link>

            <Link
              href={`/courses/${course.slug}`}
              className="flex-1 bg-slate-100 hover:bg-[#173A7C] text-slate-700 hover:text-white border border-slate-200 hover:border-[#173A7C] text-xs font-black py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1 text-center truncate"
            >
              التفاصيل
            </Link>

            <button
              onClick={() => addToCart(course)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 border cursor-pointer ${
                inCart
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                  : "bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border-slate-200 hover:border-emerald-300"
              }`}
              title={inCart ? "موجودة في السلة" : "إضافة إلى السلة"}
              aria-label="إضافة إلى السلة"
            >
              {inCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
