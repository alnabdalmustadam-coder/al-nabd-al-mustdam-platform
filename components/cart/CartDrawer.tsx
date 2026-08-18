'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function CartDrawer() {
  const { cart, removeFromCart, clearCart, isCartOpen, closeCart, totalPrice, cartCount } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[999] overflow-hidden" dir="rtl">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="w-screen max-w-md bg-white/95 backdrop-blur-2xl shadow-2xl border-l border-slate-200/80 flex flex-col justify-between overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-l from-slate-50/80 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#173A7C] to-[#2F66D6] flex items-center justify-center text-white shadow-md shadow-[#173A7C]/20">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 leading-tight">سلة المشتريات</h2>
                    <p className="text-xs text-slate-500 font-bold">{cartCount} {cartCount === 1 ? 'دورة تدريبية' : 'دورات تدريبية'}</p>
                  </div>
                </div>

                <button
                  onClick={closeCart}
                  className="w-9 h-9 rounded-xl bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer"
                  aria-label="إغلاق السلة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-800">سلتك فارغة حالياً</h3>
                      <p className="text-xs text-slate-500 max-w-xs font-medium">
                        تصفح أحدث البرامج والدبلومات المعتمدة وأضف ما يناسب أهدافك المهنية.
                      </p>
                    </div>
                    <Link
                      href="/courses"
                      onClick={closeCart}
                      className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#173A7C] text-white text-xs font-black shadow-md shadow-[#173A7C]/20 hover:bg-[#1E4D9D] transition-all cursor-pointer"
                    >
                      <span>تصفح الدورات</span>
                      <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md transition-all flex items-center gap-3.5"
                    >
                      <div className="relative w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                        <Image
                          src={item.image || '/logo.webp'}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 pr-1">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1 group-hover:text-[#173A7C] transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-black text-[#0D5C3A]">
                            {Number(item.price) === 0 ? 'مجاناً' : `${item.price} ر.س`}
                          </span>
                          {item.duration && (
                            <span className="text-[10px] text-slate-400 font-bold">
                              • {item.duration}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                        title="حذف من السلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer / Checkout CTA */}
              {cart.length > 0 && (
                <div className="p-5 sm:p-6 border-t border-slate-100 bg-gradient-to-t from-slate-50 to-white space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>المجموع الفرعي:</span>
                      <span>{totalPrice} ر.س</span>
                    </div>
                    <div className="flex items-center justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-100">
                      <span>الإجمالي النهائي:</span>
                      <span className="text-lg text-[#173A7C]">{totalPrice} ر.س</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href={`/checkout?cart=true`}
                      onClick={closeCart}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0D5C3A] via-[#127A4D] to-[#0D5C3A] hover:from-[#127A4D] hover:to-[#0D5C3A] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0D5C3A]/25 hover:shadow-xl transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>إتمام الطلب والتسجيل</span>
                      <ArrowLeft className="w-4 h-4 mr-1" />
                    </Link>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={clearCart}
                        className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        إفراغ السلة بالكامل
                      </button>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>دفع إلكتروني آمن وموثق</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
