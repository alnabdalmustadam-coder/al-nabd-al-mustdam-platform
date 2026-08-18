'use client';

import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  showAlways?: boolean;
}

export function validatePassword(password: string) {
  const minLength = password.length >= 8;
  const hasUpperLower = /[A-Z]/.test(password) && /[a-z]/.test(password);
  const hasNumberOrSymbol = /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password);

  const score = [minLength, hasUpperLower, hasNumberOrSymbol].filter(Boolean).length;

  return {
    minLength,
    hasUpperLower,
    hasNumberOrSymbol,
    isValid: score === 3,
    score, // 0 to 3
  };
}

export default function PasswordStrength({ password, showAlways = false }: PasswordStrengthProps) {
  if (!password && !showAlways) return null;

  const { minLength, hasUpperLower, hasNumberOrSymbol, score } = validatePassword(password);

  const getBarColor = (index: number) => {
    if (score === 0) return 'bg-slate-200';
    if (score === 1) return index === 0 ? 'bg-rose-500' : 'bg-slate-200';
    if (score === 2) return index <= 1 ? 'bg-amber-500' : 'bg-slate-200';
    return 'bg-emerald-500';
  };

  const getLabel = () => {
    if (score === 1) return { text: 'ضعيفة', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    if (score === 2) return { text: 'متوسطة', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (score === 3) return { text: 'قوية ومطابقة للشروط', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    return { text: 'غير مكتملة', color: 'text-slate-500 bg-slate-100 border-slate-200' };
  };

  const status = getLabel();

  return (
    <div className="space-y-3 mt-3 bg-slate-50/80 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/80 transition-all">
      {/* Progress Bars Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-600">مستوى الأمان:</span>
        <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${status.color}`}>
          {status.text}
        </span>
      </div>

      {/* 3-segment progress indicator */}
      <div className="grid grid-cols-3 gap-2 h-2 w-full">
        <div className={`h-full rounded-full transition-all duration-300 ${getBarColor(0)}`} />
        <div className={`h-full rounded-full transition-all duration-300 ${getBarColor(1)}`} />
        <div className={`h-full rounded-full transition-all duration-300 ${getBarColor(2)}`} />
      </div>

      {/* Rules Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${minLength ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${minLength ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
            {minLength ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3 stroke-[2]" />}
          </div>
          <span>8 خانات فأكثر</span>
        </div>

        <div className={`flex items-center gap-1.5 text-xs font-semibold ${hasUpperLower ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${hasUpperLower ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
            {hasUpperLower ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3 stroke-[2]" />}
          </div>
          <span>حروف A-z</span>
        </div>

        <div className={`flex items-center gap-1.5 text-xs font-semibold ${hasNumberOrSymbol ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${hasNumberOrSymbol ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
            {hasNumberOrSymbol ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3 stroke-[2]" />}
          </div>
          <span>أرقام أو رموز</span>
        </div>
      </div>
    </div>
  );
}
