import React, { useState } from 'react';

interface DefaultAvatarProps {
  src?: string | null;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatusDot?: boolean;
}

export function DefaultAvatar({
  src,
  name,
  className = '',
  size = 'md',
  showStatusDot = true,
}: DefaultAvatarProps) {
  const [imageError, setImageError] = useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [src]);

  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg text-[10px]',
    md: 'w-10 h-10 rounded-xl text-xs',
    lg: 'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl text-sm sm:text-base',
    xl: 'w-20 h-20 rounded-3xl text-xl',
  };

  const dotSizes = {
    sm: 'w-2 h-2 border',
    md: 'w-2.5 h-2.5 border-2',
    lg: 'w-3.5 h-3.5 border-2',
    xl: 'w-4 h-4 border-2',
  };

  // Helper to get 1 or 2 initials from Arabic/English name
  const getInitials = (fullName?: string) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`;
    return '';
  };

  const initials = getInitials(name);
  const showImage = Boolean(src && !imageError);

  return (
    <div className="relative inline-block shrink-0 select-none">
      <div
        className={`relative overflow-hidden flex items-center justify-center border border-white/50 shadow-md transition-all duration-300 ${sizeClasses[size]} ${className}`}
        style={{
          background: showImage
            ? '#0f172a'
            : 'linear-gradient(135deg, #173A7C 0%, #1E4D9D 50%, #0D9488 100%)',
        }}
      >
        {/* Ambient top glass highlight */}
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none z-10" />

        {showImage ? (
          <img
            src={src!}
            alt={name || 'صورة المستخدم'}
            className="w-full h-full object-cover relative z-0"
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
        ) : initials ? (
          <span className="font-black text-white tracking-wider relative z-10 drop-shadow-sm font-[family-name:var(--font-cairo)]">
            {initials}
          </span>
        ) : (
          /* Modern Vector Person SVG with friendly look */
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[65%] h-[65%] text-white drop-shadow-sm relative z-10"
          >
            <circle cx="12" cy="7.5" r="3.5" fill="currentColor" />
            <path
              d="M4.5 19.25C4.5 15.6601 7.85786 12.75 12 12.75C16.1421 12.75 19.5 15.6601 19.5 19.25"
              fill="currentColor"
            />
          </svg>
        )}
      </div>

      {/* External Live/Online Status Dot */}
      {showStatusDot && (
        <span
          className={`absolute -bottom-0.5 -left-0.5 rounded-full bg-emerald-500 border-white shadow-sm z-20 animate-pulse ${dotSizes[size]}`}
          title="متصل الآن"
        />
      )}
    </div>
  );
}

