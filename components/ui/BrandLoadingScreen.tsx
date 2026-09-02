'use client';

import React from 'react';
import Image from 'next/image';

interface BrandLoadingScreenProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export function BrandLoadingScreen({
  message = 'جاري التحميل...',
  subMessage = 'لحظات ويكون كل شيء جاهزاً لك',
  fullScreen = true,
}: BrandLoadingScreenProps) {
  return (
    <div
      className={`relative flex items-center justify-center font-[family-name:var(--font-cairo)] overflow-hidden ${
        fullScreen
          ? 'fixed inset-0 z-[9999] min-h-screen bg-[#F8FAFC]/95 backdrop-blur-md'
          : 'w-full py-16'
      }`}
      dir="rtl"
    >
      {/* Background /bg.webp texture */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-[0.22] pointer-events-none -z-10"
        style={{ backgroundImage: 'url("/bg.webp")' }}
      />

      {/* Soft Ambient Glowing Orbs */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#173A7C]/10 blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#5CB07C]/12 blur-[140px] pointer-events-none -z-10" />

      {/* Main Frosted Glass Center Card */}
      <div className="relative z-10 flex flex-col items-center px-8 py-10 sm:px-12 sm:py-12 rounded-[2.5rem] bg-white/90 backdrop-blur-2xl border border-white/90 shadow-[0_25px_60px_-15px_rgba(23,58,124,0.12),0_0_0_1px_rgba(23,58,124,0.05)] text-center max-w-sm mx-4">
        
        {/* Animated Brand Emblem with Dual Orbit Rings */}
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
          {/* Subtle Outer Glowing Ripple */}
          <div className="absolute -inset-2 rounded-full bg-[#5CB07C]/15 animate-ping [animation-duration:2.5s] opacity-75 pointer-events-none" />

          {/* Smooth Conic Gradient Rotating Ring */}
          <div 
            className="absolute -inset-1.5 rounded-full animate-spin [animation-duration:3s]"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0 240deg, #5CB07C 300deg, #173A7C 360deg)',
              WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 2.5px))',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 2.5px))',
            }}
          />

          {/* Clean White Inner Badge with Platform Logo */}
          <div className="relative w-20 h-20 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex items-center justify-center p-3 border border-slate-100">
            <Image
              src="/logo.webp"
              alt="منصة النبض المستدام"
              width={56}
              height={56}
              className="object-contain drop-shadow-xs animate-pulse [animation-duration:2.2s]"
              priority
            />
          </div>
        </div>

        {/* Text Details */}
        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-1.5">
          {message}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-semibold mb-5 leading-relaxed">
          {subMessage}
        </p>

        {/* Smooth Shimmer Progress Track */}
        <div className="w-40 h-1.5 bg-slate-100/90 rounded-full overflow-hidden relative shadow-inner">
          <div className="absolute inset-y-0 w-2/5 rounded-full bg-gradient-to-r from-[#5CB07C] via-[#3E8B5C] to-[#173A7C] animate-brand-shimmer" />
        </div>

        {/* Brand Micro Footer */}
        <span className="text-[11px] font-bold text-slate-400 mt-4 tracking-wide">
          منصة النبض المستدام للتدريب
        </span>
      </div>
    </div>
  );
}

export default BrandLoadingScreen;
