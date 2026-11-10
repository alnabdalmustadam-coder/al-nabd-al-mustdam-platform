'use client';

import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, LoaderCircle, LogIn, LockKeyhole, Mail } from 'lucide-react';

export function DemoLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/demo/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        cache: 'no-store',
      });
      const result = await response.json();
      if (!response.ok || !result?.success || typeof result.dashboard !== 'string') {
        setError(result?.message || 'تعذر تسجيل الدخول. تحقق من البيانات.');
        return;
      }
      window.location.assign(result.dashboard);
    } catch {
      setError('تعذر الاتصال حاليًا. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="demo-login-email" className="mb-2 block text-sm font-bold text-[#0B3766]">البريد الإلكتروني</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#168AD3]" aria-hidden="true" />
          <input id="demo-login-email" type="email" autoComplete="username" required maxLength={254}
            value={email} onChange={event => setEmail(event.target.value)} placeholder="example@madar.example" dir="ltr"
            className="h-12 w-full rounded-xl border border-slate-200 bg-[#F8FBFE] py-3 pl-4 pr-11 text-sm font-medium text-[#0B3766] outline-none transition focus:border-[#168AD3] focus:ring-2 focus:ring-[#168AD3]/15" />
        </div>
      </div>
      <div>
        <label htmlFor="demo-login-password" className="mb-2 block text-sm font-bold text-[#0B3766]">كلمة المرور</label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#168AD3]" aria-hidden="true" />
          <input id="demo-login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required maxLength={128}
            value={password} onChange={event => setPassword(event.target.value)} placeholder="أدخل كلمة المرور"
            className="h-12 w-full rounded-xl border border-slate-200 bg-[#F8FBFE] py-3 pl-12 pr-11 text-sm font-medium text-[#0B3766] outline-none transition focus:border-[#168AD3] focus:ring-2 focus:ring-[#168AD3]/15" />
          <button type="button" onClick={() => setShowPassword(current => !current)}
            aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 hover:bg-[#EAF7FD] hover:text-[#0B3766]">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold leading-6 text-red-700">{error}</p>}
      <button type="submit" disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[#0B3766] to-[#147AA7] px-5 text-sm font-bold text-white shadow-lg shadow-[#0B3766]/15 transition-transform hover:scale-[1.01] disabled:cursor-wait disabled:opacity-70">
        {loading ? <><LoaderCircle className="h-4 w-4 animate-spin" /> جارٍ الدخول...</> : <><LogIn className="h-4 w-4" /> دخول إلى لوحة التحكم</>}
      </button>
      <p className="text-center text-xs font-medium leading-7 text-slate-500">
        الحسابات مخصصة للمعاينة فقط. لا تستخدم بيانات حساباتك الشخصية.
      </p>
    </form>
  );
}
