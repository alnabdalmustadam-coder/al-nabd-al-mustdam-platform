'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import PasswordStrength, { validatePassword } from '@/components/auth/PasswordStrength';
import { translateAuthError } from '../utils';
import { resetPasswordRequest, updatePasswordAction } from '../actions';

function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);

  // Check if we are in update mode (via hash/token from email)
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('type=recovery') || hash.includes('access_token')) {
        setIsUpdateMode(true);
      }
    }
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صالح');
      setLoading(false);
      return;
    }

    try {
      const result = await resetPasswordRequest(cleanEmail);
      if (result.error) {
        setError(translateAuthError(result.error));
      } else {
        setIsEmailSent(true);
      }
    } catch (err) {
      setError('حدث خطأ أثناء محاولة إرسال رابط الاسترجاع');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { isValid } = validatePassword(password);
    if (!isValid) {
      setError('يرجى التأكد من استيفاء جميع شروط قوة كلمة المرور');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      setLoading(false);
      return;
    }

    try {
      const result = await updatePasswordAction(password);
      if (result.error) {
        setError(translateAuthError(result.error));
      } else {
        setIsPasswordUpdated(true);
      }
    } catch (err) {
      setError('تعذر تحديث كلمة المرور، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden font-[family-name:var(--font-cairo)]" dir="rtl">
      {/* Background /bg.webp texture & gentle ambient orbs */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-[0.22] pointer-events-none -z-10"
        style={{ backgroundImage: 'url("/bg.webp")' }}
      />
      <div className="fixed top-[-10%] right-[-5%] w-[550px] h-[550px] rounded-full bg-[#173A7C]/8 blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[550px] h-[550px] rounded-full bg-[#5CB07C]/10 blur-[140px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg my-auto"
      >
        {/* Main Luxurious Glass Card */}
        <div className="relative rounded-[2.5rem] bg-white/90 backdrop-blur-2xl border border-white/90 shadow-[0_25px_60px_-15px_rgba(23,58,124,0.12),0_0_0_1px_rgba(23,58,124,0.05)] p-6 sm:p-9 md:p-10">
          
          {/* Header with Pure Logo */}
          <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-100/90 mb-6">
            <div className="flex items-center gap-4">
              <Link href="/" className="shrink-0 group" title="الرئيسية">
                <div className="relative w-14 h-14 flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                  <Image
                    src="/logo.webp"
                    alt="منصة النبض المستدام"
                    width={56}
                    height={56}
                    className="object-contain drop-shadow-xs"
                    priority
                  />
                </div>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {isUpdateMode ? 'تعيين كلمة مرور جديدة' : 'استرجاع الحساب'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
                  منصة النبض المستدام للتدريب
                </p>
              </div>
            </div>

            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#173A7C] transition-all bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-full border border-slate-200/60"
            >
              <span>دخول</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {isPasswordUpdated ? (
              <motion.div
                key="success-update"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-5"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900">تم تغيير كلمة المرور بنجاح!</h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    يمكنك الآن استخدام كلمة المرور الجديدة لتسجيل الدخول إلى حسابك في المنصة.
                  </p>
                </div>
                <Link
                  href="/auth/login"
                  className="inline-flex w-full items-center justify-center rounded-full py-4 px-6 bg-gradient-to-r from-[#5CB07C] to-[#4EA06E] hover:from-[#4EA06E] hover:to-[#5CB07C] text-white font-black text-sm sm:text-base shadow-md shadow-[#5CB07C]/20 transition-all"
                >
                  الذهاب لتسجيل الدخول
                </Link>
              </motion.div>
            ) : isEmailSent ? (
              <motion.div
                key="email-sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-5"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <Mail className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900">تحقق من بريدك الإلكتروني</h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى البريد:
                  </p>
                  <span className="inline-block text-xs sm:text-sm font-bold text-slate-800 bg-slate-100 py-2 px-4 rounded-xl border border-slate-200 select-all">
                    {email}
                  </span>
                  <p className="text-xs text-slate-400">
                    يرجى النقر على الرابط في الرسالة لتعيين كلمة مرور جديدة قوية ومطابقة للشروط.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEmailSent(false)}
                  className="text-xs sm:text-sm font-bold text-[#5CB07C] hover:underline block mx-auto pt-2 cursor-pointer"
                >
                  إعادة إرسال أو تغيير البريد
                </button>
              </motion.div>
            ) : isUpdateMode ? (
              <motion.form
                key="update-form"
                onSubmit={handleUpdatePassword}
                className="space-y-4 sm:space-y-5"
              >
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
                    كلمة المرور الجديدة <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="أدخل كلمة مرور قوية"
                      className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-white focus:bg-white py-3.5 pr-11 pl-11 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#5CB07C] focus:ring-4 focus:ring-[#5CB07C]/15 outline-none transition-all duration-200"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Realtime Password Strength Meter */}
                  <PasswordStrength password={password} />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
                    تأكيد كلمة المرور <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="أعد كتابة كلمة المرور"
                      className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-white focus:bg-white py-3.5 pr-11 pl-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#5CB07C] focus:ring-4 focus:ring-[#5CB07C]/15 outline-none transition-all duration-200"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full rounded-full py-4 px-6 bg-gradient-to-r from-[#5CB07C] via-[#4EA06E] to-[#3D8F5C] hover:from-[#4EA06E] hover:to-[#5CB07C] text-white font-black text-sm sm:text-base shadow-[0_12px_28px_-6px_rgba(92,176,124,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/20 hover:shadow-[0_16px_32px_-6px_rgba(92,176,124,0.55)] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent pointer-events-none rounded-full" />
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>جاري حفظ كلمة المرور...</span>
                      </>
                    ) : (
                      'حفظ كلمة المرور الجديدة'
                    )}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="request-form"
                onSubmit={handleRequestReset}
                className="space-y-4 sm:space-y-5"
              >
                <div className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                  أدخل بريدك الإلكتروني المسجل لدينا، وسنرسل لك رابطاً مباشراً وآمناً لتعيين كلمة مرور جديدة لحسابك.
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
                    البريد الإلكتروني <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-white focus:bg-white py-3.5 pr-11 pl-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#5CB07C] focus:ring-4 focus:ring-[#5CB07C]/15 outline-none transition-all duration-200"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full rounded-full py-4 px-6 bg-gradient-to-r from-[#5CB07C] via-[#4EA06E] to-[#3D8F5C] hover:from-[#4EA06E] hover:to-[#5CB07C] text-white font-black text-sm sm:text-base shadow-[0_12px_28px_-6px_rgba(92,176,124,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/20 hover:shadow-[0_16px_32px_-6px_rgba(92,176,124,0.55)] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent pointer-events-none rounded-full" />
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>جاري إرسال الرابط...</span>
                      </>
                    ) : (
                      'إرسال رابط إعادة التعيين'
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer link */}
          <div className="mt-6 pt-5 border-t border-slate-100/90 text-center">
            <Link
              href="/auth/login"
              className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              تذكرت كلمة المرور؟ <span className="text-[#5CB07C] hover:underline font-black">العودة لتسجيل الدخول</span>
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-[#5CB07C] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
