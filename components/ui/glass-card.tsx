import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'ultra' | 'saudi-royal' | 'floating' | 'subtle' | 'glow-emerald';
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'ultra',
  children,
  className = '',
  ...props
}) => {
  const variantStyles = {
    ultra:
      'backdrop-blur-2xl bg-white/85 dark:bg-slate-900/85 border border-white/80 dark:border-slate-800/80 shadow-[0_15px_40px_-15px_rgba(15,23,42,0.06)] hover:shadow-[0_25px_60px_-15px_rgba(23,58,124,0.12)] transition-all duration-500 rounded-3xl',
    'saudi-royal':
      'backdrop-blur-3xl bg-gradient-to-br from-[#0A1931] via-[#0E2A4A] to-[#0A2016] border border-amber-400/25 text-white shadow-[0_25px_60px_-15px_rgba(10,25,49,0.4)] rounded-3xl relative overflow-hidden',
    floating:
      'backdrop-blur-2xl bg-white/90 border border-slate-200/80 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)] hover:-translate-y-1 hover:shadow-[0_20px_50px_-10px_rgba(23,58,124,0.1)] transition-all duration-400 rounded-3xl',
    subtle:
      'backdrop-blur-xl bg-slate-50/80 border border-slate-200/60 shadow-sm rounded-2xl',
    'glow-emerald':
      'backdrop-blur-2xl bg-white/90 border border-emerald-500/20 shadow-[0_15px_40px_-10px_rgba(16,185,129,0.12)] hover:border-emerald-500/40 transition-all duration-400 rounded-3xl',
  };

  return (
    <div
      className={`${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
