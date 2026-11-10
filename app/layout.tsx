import type { Metadata } from "next";
import "./globals.css";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { template: "%s | المدار ليرنينج", default: "المدار ليرنينج | أكاديمية التعليم المهني" },
  description: "المدار ليرنينج، منصة للتعليم والتدريب والتطوير المهني.",
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  openGraph: { title: "المدار ليرنينج", description: "منصة التعليم والتطوير المهني", type: "website", locale: "ar_SA" },
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
      data-scroll-behavior="smooth"
    >
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col font-[family-name:var(--font-body)]"
      >
        <Providers>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
