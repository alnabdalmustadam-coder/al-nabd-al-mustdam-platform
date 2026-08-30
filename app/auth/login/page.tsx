'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck, UserCheck, GraduationCap } from 'lucide-react';
import { login } from '../actions';
import { createClient } from '@/utils/supabase/client';
import { useSearchParams } from 'next/navigation';
import { translateAuthError } from '../utils';

function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const redirectParam = searchParams.get('redirect') || '';

  // OTP screen state for unconfirmed email login attempts
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResendSuccess(null);

    const formData = new FormData(e.currentTarget);
    const emailVal = (formData.get('email') as string) || '';

    const result = await login(formData);
    if (result?.error) {
      if (
        result.error.toLowerCase().includes('confirm') ||
        result.error.toLowerCase().includes('verify')
      ) {
        setEmail(emailVal);
        setShowOtpScreen(true);
      } else {
        setError(translateAuthError(result.error));
      }
      setLoading(false);
    } else if (result?.redirectUrl) {
      window.dispatchEvent(new Event('nabd_user_updated'));
      window.location.href = result.redirectUrl;
    } else {
      window.dispatchEvent(new Event('nabd_user_updated'));
      window.location.href = redirectParam || '/dashboard';
    }
  }

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setError(null);
    setResendSuccess(null);

    const tokenClean = otpToken.trim();
    if (tokenClean.length !== 6 || !/^\d+$/.test(tokenClean)) {
      setError('الرجاء إدخال رمز التحقق المكون من 6 أرقام');
      setOtpLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: tokenClean,
        type: 'signup',
      });

      if (verifyError) {
        setError(translateAuthError(verifyError.message));
        setOtpLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', data.user?.id)
        .single();

      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: profile?.full_name || data.user?.email?.split('@')[0] || '',
        }),
      });

      window.dispatchEvent(new Event('nabd_user_updated'));

      const role = String(data.user?.app_metadata?.role || 'STUDENT').toUpperCase();
      let targetUrl = '/dashboard/student';
      if (role === 'ADMIN' || role === 'SUPERADMIN' || role === 'SUPER_ADMIN') {
        targetUrl = '/dashboard/admin';
      } else if (role === 'INSTRUCTOR' || role === 'TRAINER' || role === 'TEACHER') {
        targetUrl = '/dashboard/instructor';
      } else if (redirectParam && redirectParam.startsWith('/')) {
        targetUrl = redirectParam;
      }
      window.location.href = targetUrl;
    } catch (err) {
      setError('حدث خطأ غير متوقع أثناء تفعيل الحساب');
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpLoading(true);
    setError(null);
    setResendSuccess(null);
    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (resendError) {
        setError(translateAuthError(resendError.message));
      } else {
        setResendSuccess('تم إعادة إرسال رمز التحقق بنجاح إلى بريدك الإلكتروني');
      }
    } catch (err) {
      setError('حدث خطأ أثناء محاولة إعادة إرسال الرمز');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      if (redirectParam && redirectParam.startsWith('/')) {
        callbackUrl.searchParams.set('next', redirectParam);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });
      if (error) {
        setError(translateAuthError(error.message));
        setGoogleLoading(false);
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بجوجل');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden font-[family-name:var(--font-cairo)]" dir="rtl">
      {/* Background /bg.webp texture & soft ambient glow */}
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
          
          {/* Header with Pure Logo (No Box/Card Frame) */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100/90 mb-6">
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
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {showOtpScreen ? 'تأكيد الحساب' : 'تسجيل الدخول'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1 truncate">
                {showOtpScreen ? 'أدخل رمز التحقق لتفعيل حسابك' : 'الدخول الموحد للطلاب، المدربين، والإدارة'}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!showOtpScreen ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Role Chips Banner */}
                <div className="flex items-center justify-between px-4 py-2 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <GraduationCap className="w-4 h-4" />
                    <span>متدرب</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5 text-[#173A7C]">
                    <UserCheck className="w-4 h-4" />
                    <span>مدرب ومحاضر</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5 text-purple-700">
                    <ShieldCheck className="w-4 h-4" />
                    <span>إدارة المنصة</span>
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <input type="hidden" name="redirect" value={redirectParam} />

                  {message && (
                    <div className="text-emerald-700 text-xs sm:text-sm font-bold text-center bg-emerald-50 border border-emerald-200 py-3 px-4 rounded-2xl">
                      {message === 'Check your email to confirm your account'
                        ? 'تم إنشاء الحساب بنجاح! يرجى تأكيد بريدك الإلكتروني.'
                        : message}
                    </div>
                  )}

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2" htmlFor="email">
                      البريد الإلكتروني <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-white focus:bg-white py-3 pr-10 pl-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-[#5CB07C] focus:ring-4 focus:ring-[#5CB07C]/15 outline-none transition-all duration-200"
                        placeholder="name@example.com"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs sm:text-sm font-bold text-slate-700" htmlFor="password">
                        كلمة المرور <span className="text-rose-500">*</span>
                      </label>
                      <Link
                        href="/auth/reset-password"
                        className="text-xs font-bold text-[#5CB07C] hover:text-[#4EA06E] hover:underline transition-colors"
                      >
                        نسيت كلمة المرور؟
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-white focus:bg-white py-3 pr-10 pl-10 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-[#5CB07C] focus:ring-4 focus:ring-[#5CB07C]/15 outline-none transition-all duration-200"
                        placeholder="••••••••"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                        aria-label="إظهار / إخفاء كلمة المرور"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit Button (Pill-shaped with Glass Effect) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || googleLoading}
                      className="relative w-full rounded-full py-3.5 sm:py-4 px-6 bg-gradient-to-r from-[#5CB07C] via-[#4EA06E] to-[#3D8F5C] hover:from-[#4EA06E] hover:to-[#5CB07C] text-white font-black text-sm sm:text-base shadow-[0_12px_28px_-6px_rgba(92,176,124,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/20 hover:shadow-[0_16px_32px_-6px_rgba(92,176,124,0.55)] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 overflow-hidden group"
                    >
                      <span className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent pointer-events-none rounded-full" />
                      
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>جاري التحقق...</span>
                        </>
                      ) : (
                        <span>تسجيل الدخول</span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Divider */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200/80"></div>
                  </div>
                  <div className="relative flex justify-center text-xs font-bold">
                    <span className="bg-white/90 px-4 text-slate-400">أو من خلال</span>
                  </div>
                </div>

                {/* Google Sign-in (Pill-shaped with Glass Effect) */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading || googleLoading}
                  className="relative w-full rounded-full py-3 sm:py-3.5 px-6 bg-white/80 hover:bg-white backdrop-blur-md border border-slate-200/90 hover:border-slate-300 shadow-[0_4px_16px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.8)] text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {googleLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.92-2.77 3.5-4.81 6.76-4.81Z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.48c-.29 1.48-1.14 2.73-2.42 3.57l3.77 2.92c2.2-2.03 3.46-5.02 3.46-8.65Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.24 14.75a7.82 7.82 0 0 1 0-4.5l-3.85-2.99a11.92 11.92 0 0 0 0 10.49l3.85-3Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.77-2.92c-1.1.74-2.52 1.19-4.19 1.19-3.26 0-5.84-2.04-6.76-4.81l-3.85 2.99C3.37 20.33 7.35 23 12 23Z"
                      />
                    </svg>
                  )}
                  <span>متابعة باستخدام Google</span>
                </button>
              </motion.div>
            ) : (
              /* OTP Verification Panel */
              <motion.div
                key="otp-panel"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <form onSubmit={handleOtpVerify} className="space-y-5">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-slate-600 font-medium">
                      حسابك غير مفعّل بعد. تم إرسال رمز تحقق مكوّن من 6 أرقام إلى:
                    </p>
                    <span className="inline-block text-xs sm:text-sm font-bold text-slate-900 bg-slate-100/90 py-1.5 px-4 rounded-xl border border-slate-200 select-all">
                      {email}
                    </span>
                  </div>

                  <div>
                    <label htmlFor="otp" className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 text-center">
                      رمز التحقق (OTP)
                    </label>
                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                      className="block w-full text-center tracking-[0.4em] font-mono text-2xl font-bold rounded-2xl border border-slate-200/90 bg-slate-50/70 focus:bg-white py-3.5 px-4 text-slate-900 placeholder:text-slate-300 focus:border-[#5CB07C] focus:ring-4 focus:ring-[#5CB07C]/15 outline-none transition-all"
                      placeholder="000000"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{error}</span>
                    </div>
                  )}

                  {resendSuccess && (
                    <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>{resendSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="relative w-full rounded-full py-4 px-6 bg-gradient-to-r from-[#5CB07C] via-[#4EA06E] to-[#3D8F5C] hover:from-[#4EA06E] hover:to-[#5CB07C] text-white font-black text-sm sm:text-base shadow-[0_12px_28px_-6px_rgba(92,176,124,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/20 hover:shadow-[0_16px_32px_-6px_rgba(92,176,124,0.55)] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent pointer-events-none rounded-full" />
                    {otpLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>جاري التفعيل...</span>
                      </>
                    ) : (
                      'تأكيد وتفعيل الحساب'
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs sm:text-sm pt-2">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpLoading}
                      className="font-bold text-[#5CB07C] hover:underline"
                    >
                      إعادة إرسال الرمز
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOtpScreen(false)}
                      className="font-bold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      الرجوع لتسجيل الدخول
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Register Link */}
          <div className="mt-6 pt-5 border-t border-slate-100/90 text-center">
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              ليس لديك حساب؟{' '}
              <Link
                href={`/auth/register?redirect=${encodeURIComponent(redirectParam)}`}
                className="font-black text-[#5CB07C] hover:text-[#4EA06E] hover:underline transition-colors"
              >
                سجل الآن كمتدرب
              </Link>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-3 border-[#5CB07C] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
