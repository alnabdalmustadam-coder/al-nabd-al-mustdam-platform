"use client";

import { useState } from "react";

export default function WhatsAppFloat() {
  const [hovered, setHovered] = useState(false);
  const phoneNumber = "966500000000"; // Replace with actual number

  return (
    <a
      href={`https://wa.me/${phoneNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          if (!hovered) {
            e.preventDefault();
            setHovered(true);
            setTimeout(() => setHovered(false), 3000);
          }
        }
      }}
      className="fixed bottom-4 left-2 md:bottom-10 md:left-15 z-50 group flex items-center md:block"
      aria-label="تواصل عبر واتساب"
    >
      {/* Tooltip */}
      <div
        className={`absolute 
          top-1/2 -translate-y-1/2 left-[calc(100%+0.75rem)]
          md:top-auto md:translate-y-0 md:bottom-full md:left-1/2 md:-translate-x-1/2 md:mb-3
          whitespace-nowrap bg-white text-[#173A7C] text-[13px] md:text-sm font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-slate-200 shadow-lg transition-all duration-300 origin-left md:origin-bottom ${
          hovered ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
        }`}
      >
        تواصل معنا عبر واتساب
      </div>

      {/* Pulse Ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping" />

      {/* Button */}
      <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-[0_8px_30px_rgba(37,211,102,0.4)] md:hover:shadow-[0_12px_40px_rgba(37,211,102,0.5)] md:hover:scale-110 transition-all duration-300 border-2 border-white/30">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white"
          className="w-6 h-6 md:w-8 md:h-8"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </div>
    </a>
  );
}
