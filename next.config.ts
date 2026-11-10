import type { NextConfig } from "next";

const contentPolicy = [
  "connect-src 'self'",
  "img-src 'self' data: blob:",
  "media-src 'self' data: blob:",
  "frame-src 'self' blob:",
  "font-src 'self' data:",
  "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
  "object-src 'none'",
  "form-action 'self'",
  "base-uri 'self'",
].join("; ");

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: { formats: ['image/avif', 'image/webp'], qualities: [25, 75] },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "Content-Security-Policy", value: contentPolicy },
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Referrer-Policy", value: "same-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      ],
    }];
  },
};

export default nextConfig;
