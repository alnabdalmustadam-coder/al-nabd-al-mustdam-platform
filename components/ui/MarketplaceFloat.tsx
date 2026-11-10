'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store} from 'lucide-react';

export default function MarketplaceFloat() {
  const [hovered, setHovered] = useState(false);
  const pathname = usePathname();

  // Hide when already on the marketplace main page to avoid redundancy
  if (pathname === '/marketplace') {
    return null;
  }

  return (
    <Link
      href="/marketplace"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-4 right-3 md:bottom-10 md:right-10 z-50 group flex items-center"
      aria-label="الانتقال إلى متجر الخدمات المصغرة"
    >
      {/* Tooltip on Hover */}
      <div
        className={`absolute 
          top-1/2 -translate-y-1/2 right-[calc(100%+0.75rem)]
          md:top-auto md:translate-y-0 md:bottom-full md:right-1/2 md:translate-x-1/2 md:mb-3
          whitespace-nowrap bg-white text-[#0B3766] text-[13px] md:text-sm font-bold px-4 py-2 rounded-full border border-slate-200 shadow-xl transition-all duration-300 origin-right md:origin-bottom flex items-center gap-1.5 ${
          hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
        }`}
      >
        <Store aria-hidden="true" className="w-3.5 h-3.5 text-amber-500" />
        <span>متجر الخدمات المصغرة</span>
      </div>

      {/* Pulse Glow Ring */}
      <span className="absolute inset-0 rounded-full bg-[#168AD3]/20 animate-ping pointer-events-none" />

      {/* Floating Action Button */}
      <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#0B3766] via-[#155D94] to-[#168AD3] flex items-center justify-center shadow-[0_10px_30px_rgba(11,55,102,0.2)] hover:shadow-[0_14px_45px_rgba(22,138,211,0.36)] hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/40 text-white">
        <Store className="w-5 h-5 md:w-7 md:h-7 stroke-[2.2]" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E5AC39] border-2 border-white rounded-full flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-[#0B3766] rounded-full" />
        </span>
      </div>
    </Link>
  );
}
