import type { Metadata } from "next";
import { Cairo, Sora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import Script from "next/script";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | النبض المستدام",
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
    siteName: "النبض المستدام",
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
      className={`${cairo.variable} ${sora.variable}`}
    >
      <body className="min-h-screen flex flex-col font-[family-name:var(--font-cairo)]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloat />
        <Script 
          src="https://beta.leadconnectorhq.com/loader.js"  
          data-resources-url="https://beta.leadconnectorhq.com/chat-widget/loader.js" 
          data-widget-id="69cd9d874fab82876c2c10e7"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
