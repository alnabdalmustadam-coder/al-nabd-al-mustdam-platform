"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { User, Mail, Lock, Phone, Eye, EyeOff, UserPlus } from "lucide-react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [showAgreementError, setShowAgreementError] = useState(false);

  const handleGoogleSignIn = () => {
    if (!isAgreed) {
      setShowAgreementError(true);
      return;
    }
    signIn('google', { callbackUrl: '/dashboard' });
  };

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
        className="relative bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] p-6 sm:p-8 sm:px-10 w-full max-w-[420px] mx-auto rounded-[28px] z-10"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#173A7C]/5 flex items-center justify-center border border-[#173A7C]/10 shadow-sm">
             <UserPlus className="w-6 h-6 text-[#173A7C]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">حساب جديد</h1>
          <p className="text-sm text-slate-500 font-medium">ابدأ رحلتك التعليمية الآن</p>
        </div>

        <form className="space-y-3.5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">الاسم</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" required
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none transition-all text-sm"
                  placeholder="اسمك"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">الجوال</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none transition-all text-sm"
                  placeholder="+966" dir="ltr"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email" required
                className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none transition-all text-sm"
                placeholder="example@email.com" dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"} required
                className="w-full pr-9 pl-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none transition-all text-sm"
                placeholder="••••••••" dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#173A7C] cursor-pointer transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <label className={`flex items-start gap-2 text-xs font-medium cursor-pointer pt-1 transition-colors ${showAgreementError ? "text-red-500" : "text-slate-600"}`}>
            <input 
              type="checkbox" 
              checked={isAgreed}
              onChange={(e) => {
                setIsAgreed(e.target.checked);
                if (e.target.checked) setShowAgreementError(false);
              }}
              className={`rounded border-slate-300 w-3.5 h-3.5 cursor-pointer mt-0.5 transition-colors ${showAgreementError ? "text-red-500 focus:ring-red-500 ring-2 ring-red-500/50" : "text-[#173A7C] focus:ring-[#173A7C]"}`}
              required 
            />
            <span className="leading-tight">
              قرأت وأوافق على <a href="/terms" target="_blank" rel="noopener noreferrer" className={`${showAgreementError ? "text-red-600" : "text-[#173A7C]"} font-bold hover:underline`}>الشروط والأحكام</a> و<a href="/privacy" target="_blank" rel="noopener noreferrer" className={`${showAgreementError ? "text-red-600" : "text-[#173A7C]"} font-bold hover:underline`}>الخصوصية</a>
            </span>
          </label>

          <Button type="submit" className="w-full text-sm font-bold py-3 mt-4 shadow-lg shadow-[#173A7C]/20">
            إنشاء الحساب
          </Button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs font-bold text-slate-400 uppercase">أو سريعاً عبر</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        <button 
          onClick={handleGoogleSignIn}
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
          لديك حساب بالفعل؟{" "}
          <Link href="/auth/login" className="text-[#173A7C] font-bold hover:underline transition-colors">
            تسجيل الدخول
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
