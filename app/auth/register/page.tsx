"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { User, Mail, Lock, Phone, Eye, EyeOff, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center pt-28 pb-20 px-4 bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgwLDAsMCwwLjA0KSIvPjwvc3ZnPg==')] opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white border border-slate-200 shadow-2xl shadow-slate-200 p-8 sm:p-12 w-full max-w-md mx-auto rounded-[32px] z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-[24px] bg-[#173A7C]/5 flex items-center justify-center border border-[#173A7C]/10 shadow-sm">
             <UserPlus className="w-8 h-8 text-[#173A7C]" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">إنشاء حساب جديد</h1>
          <p className="text-base text-slate-500 font-medium">ابدأ رحلتك التعليمية مع النبض المستدام.</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-2">الاسم الكامل</label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text" required
                className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none transition-all text-base"
                placeholder="اسمك الكامل"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 block mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email" required
                className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none transition-all text-base"
                placeholder="example@email.com" dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 block mb-2">رقم الجوال</label>
            <div className="relative">
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none transition-all text-base"
                placeholder="+966 5X XXX XXXX" dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 block mb-2">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"} required
                className="w-full pr-12 pl-12 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none transition-all text-base"
                placeholder="••••••••" dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#173A7C] cursor-pointer transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <label className="flex items-start gap-2 text-slate-600 text-sm font-medium cursor-pointer pt-2">
            <input type="checkbox" className="rounded border-slate-300 text-[#173A7C] focus:ring-[#173A7C] w-4 h-4 cursor-pointer mt-0.5" required />
            <span>
              أوافق على <a href="/terms" className="text-[#173A7C] font-bold hover:underline">الشروط والأحكام</a> و<a href="/privacy" className="text-[#173A7C] font-bold hover:underline">سياسة الخصوصية</a>
            </span>
          </label>

          <Button type="submit" size="lg" className="w-full text-lg py-4 shadow-xl shadow-[#173A7C]/10 mt-2">
            إنشاء الحساب
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">أو</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        <button className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:shadow-sm transition-all text-base cursor-pointer">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          المتابعة بحساب Google
        </button>

        <p className="text-center text-sm font-medium text-slate-500 mt-8">
          لديك حساب بالفعل؟{" "}
          <Link href="/auth/login" className="text-[#173A7C] font-bold hover:underline transition-colors">
            تسجيل الدخول
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
