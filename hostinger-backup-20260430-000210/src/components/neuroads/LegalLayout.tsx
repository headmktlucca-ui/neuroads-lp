'use client';
import Image from 'next/image';
import Navbar from './Navbar';
import Footer from './Footer';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-bg-main">
      <Navbar />

      <div className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/images/background_neuroads_26.png"
            alt="NeuroAds Background"
            fill
            className="object-cover object-top opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/92 to-white" />
        </div>

        <div className="wrap relative z-10">
          <div className="max-w-[900px] mx-auto p-1 rounded-[36px] bg-gradient-to-br from-white/40 via-orange-300 to-[#FF6B00] shadow-[0_30px_80px_-20px_rgba(255,107,0,0.25)]">
            <div className="bg-white/85 rounded-[32px] p-6 sm:p-8 lg:p-10 border border-border/60">
              {children}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
