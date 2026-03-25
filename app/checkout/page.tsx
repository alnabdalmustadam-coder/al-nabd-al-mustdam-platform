"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { CreditCard, Shield, CheckCircle, ArrowLeft, BookOpen } from "lucide-react";

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("card");

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center sm:text-right">
          <span className="text-[#173A7C] text-sm font-bold tracking-wide uppercase bg-[#173A7C]/5 px-4 py-1.5 rounded-full inline-block mb-4">
            تأكيد التسجيل
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4">إتمام <span className="gradient-text">الطلب</span></h1>
          <p className="text-slate-500 text-base font-medium max-w-xl">أكمل بيانات الدفع بأمان لتأكيد تسجيلك في الدورة والبدء في التعلم فوراً.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Billing Info */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-8">
              <h2 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">بيانات الطالب</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">الاسم الأول</label>
                  <input className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none text-base" placeholder="الاسم" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">اسم العائلة</label>
                  <input className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none text-base" placeholder="العائلة" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-bold text-slate-700 block mb-2">البريد الإلكتروني</label>
                  <input type="email" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none text-base" placeholder="example@email.com" dir="ltr" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-bold text-slate-700 block mb-2">رقم الجوال</label>
                  <input type="tel" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none text-base" placeholder="+966 5X XXX XXXX" dir="ltr" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-8">
              <h2 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">طريقة الدفع</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { key: "card", label: "بطاقة ائتمان", icon: "💳" },
                  { key: "mada", label: "مدى", icon: "🏦" },
                  { key: "apple", label: "Apple Pay", icon: "🍎" },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setPaymentMethod(m.key)}
                    className={`p-5 rounded-2xl border text-center transition-all cursor-pointer shadow-sm ${
                      paymentMethod === m.key
                        ? "bg-[#173A7C]/5 border-[#173A7C] text-[#173A7C] shadow-[#173A7C]/10"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-3xl mb-2">{m.icon}</div>
                    <div className="text-sm font-bold">{m.label}</div>
                  </button>
                ))}
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">رقم البطاقة</label>
                    <div className="relative">
                      <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none text-base font-sora" placeholder="XXXX XXXX XXXX XXXX" dir="ltr" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-bold text-slate-700 block mb-2">تاريخ الانتهاء</label>
                      <input className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none text-base font-sora" placeholder="MM/YY" dir="ltr" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 block mb-2">CVV</label>
                      <input className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none text-base font-sora" placeholder="***" dir="ltr" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Security Note */}
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 mt-6 pb-6">
              <Shield className="w-5 h-5 text-emerald-600" />
              بياناتك محمية بتشفير SSL 256-bit. لا نخزّن بيانات بطاقتك الائتمانية البتة.
            </div>
          </div>

          {/* Order Summary */}
          <aside>
            <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-[32px] p-8 sticky top-28">
              <h2 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">ملخص الطلب</h2>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-[#173A7C]/5 border border-[#173A7C]/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-[#173A7C]" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h4 className="text-sm font-bold text-slate-900 mb-1">استخدام الحاسب الآلي في الأعمال المكتبية</h4>
                    <p className="text-xs font-semibold text-slate-500">40 ساعة · 32 درس تفاعلي</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 mb-8">
                <div className="flex items-center justify-between text-sm font-bold text-slate-600">
                  <span>سعر الدورة</span>
                  <span className="text-slate-900">100.00 ر.س</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-slate-600">
                  <span>ضريبة القيمة المضافة (15%)</span>
                  <span className="text-slate-900">15.00 ر.س</span>
                </div>
                <div className="flex items-center justify-between text-xl font-black pt-4 border-t border-slate-100 text-slate-900">
                  <span>الإجمالي</span>
                  <span className="text-[#173A7C] flex items-center gap-1">115.00 <span className="text-sm text-slate-500">ر.س</span></span>
                </div>
              </div>

              <Button size="lg" className="w-full text-lg py-4 shadow-xl shadow-[#173A7C]/10">
                <CheckCircle className="w-5 h-5 rtl:mirror" />
                تأكيد الدفع والتسجيل
              </Button>

              <p className="text-center text-sm font-medium text-slate-400 mt-6">
                نضمن لك استرداد كامل المبلغ خلال 7 أيام إذا لم تكن راضياً عن الدورة
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
