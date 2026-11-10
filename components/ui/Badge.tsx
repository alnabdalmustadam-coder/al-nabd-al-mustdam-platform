"use client";

interface BadgeProps {
  label: string;
  variant?: "admin" | "management" | "data" | "languages" | "tech" | "corporate" | "default";
  className?: string;
}

const variantColors: Record<string, string> = {
  admin: "bg-blue-50 text-[#0B3766] border-blue-200",
  management: "bg-[#0B3766]/10 text-[#0B3766] border-[#0B3766]/20",
  data: "bg-[#168AD3]/10 text-[#0B3766] border-[#168AD3]/25",
  languages: "bg-amber-50 text-amber-800 border-amber-200",
  tech: "bg-[#19B6C7]/15 text-[#0B3766] border-[#19B6C7]/30",
  corporate: "bg-[#0B3766]/10 text-[#0B3766] border-[#0B3766]/20",
  default: "bg-slate-100 text-[#0B3766] border-slate-200",
};

const categoryLabels: Record<string, string> = {
  admin: "الإدارة والأعمال",
  management: "الإدارة والقيادة",
  data: "البيانات والتحليل",
  languages: "اللغات والتطوير",
  tech: "التقنية والتصميم",
  corporate: "تدريب الشركات",
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
