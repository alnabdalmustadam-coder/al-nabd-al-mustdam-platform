"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-10 px-4 relative overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img src="/bg.webp" alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#0A162B]/60 backdrop-blur-[4px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] p-6 sm:p-10 w-full max-w-[420px] mx-auto rounded-[28px] z-10"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-[#173A7C]/5 flex items-center justify-center border border-[#173A7C]/10 shadow-sm">
             <ShieldCheck className="w-6 h-6 text-[#173A7C]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-1.5">تسجيل الدخول</h1>
          <p className="text-sm text-slate-500 font-medium">أهلاً بك مجدداً في منصة النبض المستدام</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none transition-all text-sm"
                placeholder="example@email.com" dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pr-10 pl-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none transition-all text-sm"
                placeholder="••••••••" dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#173A7C] cursor-pointer transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-medium pt-1">
            <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-300 text-[#173A7C] focus:ring-[#173A7C] w-3.5 h-3.5 cursor-pointer" />
              تذكرني
            </label>
            <a href="#" className="text-[#173A7C] hover:underline transition-colors font-bold">نسيت كلمة المرور؟</a>
          </div>

          <Button type="submit" className="w-full text-sm font-bold py-3 mt-2 shadow-lg shadow-[#173A7C]/20">
            الدخول الآن
          </Button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs font-bold text-slate-400 uppercase">أو السريع</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        <button 
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all text-sm cursor-pointer shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          جوجل
        </button>

        <p className="text-center text-xs font-medium text-slate-500 mt-6">
          ليس لديك حساب؟{" "}
          <Link href="/auth/register" className="text-[#173A7C] font-bold hover:underline transition-colors">
            أنشئ حساباً جديداً
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
