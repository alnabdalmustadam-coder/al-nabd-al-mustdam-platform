"use client";

interface BadgeProps {
  label: string;
  variant?: "admin" | "data" | "languages" | "tech" | "corporate" | "default";
  className?: string;
}

const variantColors: Record<string, string> = {
  admin: "bg-blue-50 text-blue-700 border-blue-200",
  data: "bg-[#173A7C]/10 text-[#173A7C] border-[#173A7C]/20",
  languages: "bg-amber-50 text-amber-700 border-amber-200",
  tech: "bg-emerald-50 text-emerald-700 border-emerald-200",
  corporate: "bg-slate-100 text-slate-700 border-slate-200",
  default: "bg-gray-100 text-gray-700 border-gray-200",
};

const categoryLabels: Record<string, string> = {
  admin: "أعمال مكتبية",
  data: "إدخال بيانات",
  languages: "لغات",
  tech: "تقني",
  corporate: "شركات",
};

export default function Badge({ label, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 text-xs font-semibold
        rounded-full border shadow-sm
        ${variantColors[variant] || variantColors.default}
        ${className}
      `}
    >
      {categoryLabels[label] || label}
    </span>
  );
}
