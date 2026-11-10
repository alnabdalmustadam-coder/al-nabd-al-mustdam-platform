"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";
import Link from "next/link";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  target,
  rel,
  className = "",
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: "px-5 py-2 text-sm",
    md: "px-7 py-3 text-base",
    lg: "px-9 py-4 text-lg",
  };

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-[#0B3766] to-[#0B6589] text-white font-bold hover:from-[#0B6589] hover:to-[#0B3766] shadow-lg shadow-[#0B3766]/20 hover:shadow-[#168AD3]/30",
    secondary:
      "bg-white border text-center border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
    outline:
      "border-2 border-[#0B3766] text-[#0B3766] hover:bg-[#0B3766] hover:text-white",
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    rounded-[var(--radius-pill)] font-semibold
    transition-all duration-300 ease-out
    btn-ripple cursor-pointer
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim();

  if (href) {
    return (
      <Link href={href} target={target} rel={rel || (target === "_blank" ? "noopener noreferrer" : undefined)} className={baseClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button className={baseClasses} {...props}>
      {children}
    </button>
  );
}
