'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MarketplaceFloat from '@/components/ui/MarketplaceFloat';
import WhatsAppFloat from '@/components/ui/WhatsAppFloat';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const isAuth = pathname?.startsWith('/auth');

  if (isDashboard) {
    return <main className="flex-1 min-h-screen w-full max-w-full overflow-x-clip">{children}</main>;
  }

  if (isAuth) {
    return (
      <>
        <div className="hidden sm:block">
          <Navbar />
        </div>
        <main className="flex-1 w-full max-w-full overflow-x-clip flex flex-col justify-center">{children}</main>
        <div className="hidden sm:block">
          <MarketplaceFloat />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full max-w-full overflow-x-clip">{children}</main>
      <Footer />
      <MarketplaceFloat />
      <WhatsAppFloat />
    </>
  );
}
