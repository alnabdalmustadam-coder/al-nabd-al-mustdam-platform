"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";
import Link from "next/link";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
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
      "bg-[#5CB07C] text-white font-bold hover:bg-[#4EA06E] shadow-lg shadow-[#5CB07C]/20 hover:shadow-[#5CB07C]/40",
    secondary:
      "bg-white border text-center border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
    outline:
      "border-2 border-[#173A7C] text-[#173A7C] hover:bg-[#173A7C] hover:text-white",
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
      <Link href={href} className={baseClasses}>
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
