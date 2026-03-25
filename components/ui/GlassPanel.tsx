"use client";

import { ReactNode } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  dark?: boolean;
}

export default function GlassPanel({ children, className = "", hover = false, dark = false }: GlassPanelProps) {
  const base = dark ? "glass-dark" : "glass";
  const hoverClass = hover ? "glass-card" : "";
  return (
    <div className={`${hoverClass || base} ${className}`}>
      {children}
    </div>
  );
}
