'use client'

import { useState } from 'react'
import { login } from '../actions'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
        setGoogleLoading(false)
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بجوجل')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A1128] py-20 px-4 dir-rtl" dir="rtl">
      {/* Background Radial Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#173A7C]/20 blur-[150px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-[#5CB07C]/15 blur-[150px]" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo and Brand Title */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#5CB07C] to-[#173A7C] p-0.5 shadow-xl shadow-[#173A7C]/20 mx-auto mb-4 hover:scale-105 transition-transform duration-300">
              <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-[#0A1128]">
                {/* Custom Pulse Wave SVG */}
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 16H9.5L12 7L16 25L19 13L21.5 16H28" stroke="url(#logo_grad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <defs>
                    <linearGradient id="logo_grad" x1="4" y1="16" x2="28" y2="16" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#5CB07C" />
                      <stop offset="1" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </Link>
          <h2 className="text-3xl font-black tracking-tight text-white font-[family-name:var(--font-cairo)]">تسجيل الدخول</h2>
          <p className="mt-2.5 text-sm font-medium text-slate-400">
            أهلاً بك مجدداً في منصة النبض المستدام
          </p>
        </div>

        {/* Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-3xl p-8 sm:p-10">
          <form action={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2" htmlFor="email">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 px-4 text-white placeholder-slate-500 focus:border-[#5CB07C] focus:ring-1 focus:ring-[#5CB07C] focus:bg-[#0f1938] outline-none text-base font-medium transition-all duration-200"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-300" htmlFor="password">
                    كلمة المرور
                  </label>
                  <Link href="/auth/reset-password" className="text-xs font-semibold text-[#5CB07C] hover:underline">
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 px-4 text-white placeholder-slate-500 focus:border-[#5CB07C] focus:ring-1 focus:ring-[#5CB07C] focus:bg-[#0f1938] outline-none text-base font-medium transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-red-400 text-sm font-bold text-center bg-red-950/40 border border-red-900/30 py-3 px-4 rounded-2xl"
              >
                {error}
              </motion.div>
            )}

            <div>
              <Button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full bg-gradient-to-r from-[#5CB07C] to-[#4EA06E] hover:from-[#4EA06E] hover:to-[#5CB07C] text-white py-3.5 rounded-2xl transition-all font-black text-base shadow-lg shadow-[#5CB07C]/20 border-0 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  'تسجيل الدخول'
                )}
              </Button>
            </div>
          </form>

          {/* Separator */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm font-bold">
              <span className="bg-[#0f1837] px-4 text-slate-400">أو من خلال</span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold border border-slate-200 shadow-sm transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
            type="button"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span className="text-base">متابعة باستخدام Google</span>
          </button>
        </div>

        {/* Register Footer */}
        <p className="mt-8 text-center text-sm font-medium text-slate-400">
          ليس لديك حساب؟{' '}
          <Link href="/auth/register" className="font-bold text-[#5CB07C] hover:underline">
            سجل الآن كمتدرب
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
