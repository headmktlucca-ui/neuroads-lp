'use client';
import PrimaryTopMenu from './PrimaryTopMenu';
import PrimaryFooter from './PrimaryFooter';
import HomePageBackground from './HomePageBackground';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-[#1a2234]">
      <HomePageBackground />
      <div className="relative z-10">
        <PrimaryTopMenu />

        <section className="mx-auto max-w-[1260px] px-5 pb-14 pt-5 md:px-8">
          <div className="h-[84px]" />

          <div className="mx-auto max-w-[900px] rounded-[28px] border border-[#e7ecf4] bg-white p-6 shadow-[0_16px_36px_rgba(12,22,38,0.06)] sm:p-8 lg:p-10">
            {children}
          </div>
        </section>

        <PrimaryFooter />
      </div>
    </main>
  );
}
