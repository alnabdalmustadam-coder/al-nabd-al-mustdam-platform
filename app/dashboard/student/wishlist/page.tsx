'use client';

import React from 'react';
import Link from 'next/link';
import { CardImage } from '@/components/ui/CardImage';
import { motion, Variants } from 'framer-motion';
import { Heart, ShoppingBag, ArrowLeft, Trash2, BookOpen, Clock, Users, Sparkles, Check } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

const sectionFadeVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.14,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1,
      delayChildren: custom * 0.14 + 0.05,
    },
  }),
};

const textItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function StudentWishlistPage() {
  const { wishlist, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart, isInCart } = useCart();

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)]" dir="rtl">
      {/* Header Banner - Ultra Premium Liquid Glass */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="relative z-20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-9 space-y-4 liquid-glass-hero liquid-glass-hover overflow-hidden student-card-accent"
      >
        {/* Ambient Glowing Orbs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-rose-500/20 to-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-br from-[#173A7C]/20 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3 pr-2">
            <motion.div variants={textItemVariants} className="student-tag-badge bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>قائمة الرغبات والدورات المفضلة</span>
            </motion.div>

            <motion.h1 variants={textItemVariants} className="student-heading-h1">
              الدورات <span className="student-name-gradient">المفضلة</span> ❤️
            </motion.h1>

            <motion.p variants={textItemVariants} className="student-text-body max-w-xl pr-0.5 pt-1.5 sm:pt-2 leading-relaxed">
              جميع البرامج والدبلومات التدريبية التي قمت بحفظها للرجوع إليها لاحقاً والتسجيل فيها بنقرة واحدة.
            </motion.p>
          </div>

          <motion.div variants={textItemVariants} className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 text-rose-700 text-xs font-black border border-white/80 shadow-xs backdrop-blur-md">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>{wishlistCount} دورة في المفضلة</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Wishlist Grid */}
      {wishlist.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl sm:rounded-[28px] p-12 text-center liquid-glass-card border border-white/60 space-y-5"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400">
            <Heart className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-800">قائمة المفضلة فارغة حالياً</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
              استكشف باقة دوراتنا ودبلوماتنا المعتمدة واضغط على أيقونة القلب في أي دورة لحفظها هنا.
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-black text-xs shadow-md shadow-[#173A7C]/20 transition-all cursor-pointer"
          >
            <span>تصفح أحدث الدورات</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {wishlist.map((course, idx) => {
            const inCart = isInCart(course.id);

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08, duration: 0.5 }}
                className="group relative rounded-2xl sm:rounded-[28px] overflow-hidden bg-white/90 border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Top Image Section */}
                <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-slate-50 to-[#f0f4f8]">
                  <div className="relative w-full">
                    <CardImage
                      src={course.image || '/logo.webp'}
                      alt={course.title}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(course.id)}
                    className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-500 shadow-sm flex items-center justify-center transition-colors cursor-pointer"
                    title="إزالة من المفضلة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <Link href={`/courses/${course.slug}`}>
                      <h3 className="font-black text-sm text-slate-900 line-clamp-2 hover:text-[#173A7C] transition-colors leading-snug">
                        {course.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-bold">
                      {course.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#5CB07C]" />
                          {course.duration}
                        </span>
                      )}
                      {course.lessonsCount && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-[#173A7C]" />
                          {course.lessonsCount} درس
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">السعر</span>
                      <span className="text-base font-black text-[#173A7C]">
                        {Number(course.price) === 0 ? 'مجاناً' : `${course.price} ر.س`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => addToCart(course)}
                        className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                          inCart
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 hover:bg-[#173A7C] text-slate-700 hover:text-white'
                        }`}
                        title={inCart ? 'موجود بالسلة' : 'إضافة إلى السلة'}
                      >
                        {inCart ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>بالسلة</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>السلة</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={`/checkout?slug=${course.slug}`}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0D5C3A] to-[#127A4D] hover:from-[#127A4D] hover:to-[#0D5C3A] text-white text-xs font-black shadow-sm transition-all"
                      >
                        تسجيل
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
