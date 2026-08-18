import type { Metadata } from "next";
import { Alexandria } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";
import Script from "next/script";
import { Providers } from "./providers";

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  variable: "--font-alexandria",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Sustain Pulse",
    default: "النبض المستدام — منصة التميز المهني",
  },
  description:
    "منصة تعليمية رائدة تقدم دورات مهنية وتقنية باللغة العربية. طوّر مهاراتك مع أفضل المدربين واحصل على شهادات معتمدة.",
  keywords: [
    "دورات تدريبية",
    "تعليم عن بعد",
    "تطوير مهني",
    "النبض المستدام",
    "شهادات معتمدة",
    "دورات تقنية",
    "دورات إدارية",
  ],
  openGraph: {
    title: "النبض المستدام — منصة التميز المهني",
    description:
      "منصة تعليمية رائدة تقدم دورات مهنية وتقنية باللغة العربية.",
    type: "website",
    locale: "ar_SA",
    siteName: "Sustain Pulse",
  },
  twitter: {
    card: "summary_large_image",
    title: "النبض المستدام — منصة التميز المهني",
    description:
      "منصة تعليمية رائدة تقدم دورات مهنية وتقنية باللغة العربية.",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  other: {
    "domain-verification": "1a75bb4fb187894394a0db2d2bd4034e193d8bd9e1e721705748c3a9d35aeab8",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${alexandria.variable} ${alexandria.className}`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen flex flex-col font-[family-name:var(--font-alexandria)]">
        <Providers>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </Providers>
        <Script
          src="https://beta.leadconnectorhq.com/loader.js"
          data-resources-url="https://beta.leadconnectorhq.com/chat-widget/loader.js"
          data-widget-id="73hS2pnWQWKCJaCEjUqq"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
