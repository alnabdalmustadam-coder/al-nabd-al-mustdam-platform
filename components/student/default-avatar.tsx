import React from 'react';

interface DefaultAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatusDot?: boolean;
}

export function DefaultAvatar({ className = '', size = 'md', showStatusDot = true }: DefaultAvatarProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl',
    xl: 'w-20 h-20 rounded-3xl',
  };

  const dotSizes = {
    sm: 'w-2 h-2 border',
    md: 'w-2.5 h-2.5 border-2',
    lg: 'w-3.5 h-3.5 border-2',
    xl: 'w-4 h-4 border-2',
  };

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={`relative overflow-hidden flex items-center justify-center border border-white/40 shadow-md ${sizeClasses[size]} ${className}`}
        style={{
          background: 'linear-gradient(135deg, #173A7C 0%, #1E4D9D 55%, #2563EB 100%)',
        }}
      >
        {/* Ambient top glass highlight */}
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

        {/* Sleek Vector Person SVG */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[65%] h-[65%] text-white drop-shadow-sm relative z-10"
        >
          {/* Head */}
          <circle
            cx="12"
            cy="7.5"
            r="3.5"
            fill="currentColor"
          />
          {/* Body */}
          <path
            d="M4.5 19.25C4.5 15.6601 7.85786 12.75 12 12.75C16.1421 12.75 19.5 15.6601 19.5 19.25"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* External Live/Online Status Dot */}
      {showStatusDot && (
        <span
          className={`absolute -bottom-0.5 -left-0.5 rounded-full bg-emerald-500 border-white shadow-sm z-20 ${dotSizes[size]}`}
          title="نشط الآن"
        />
      )}
    </div>
  );
}
