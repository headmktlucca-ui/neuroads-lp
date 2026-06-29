'use client';
import PrimaryTopMenu from './PrimaryTopMenu';
import PrimaryFooter from './PrimaryFooter';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000] text-white">
      {/* Background radial overlays — Matches homepage */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 600px 600px at 25% 0%, rgba(255,106,0,0.06) 0%, transparent 70%)',
            'radial-gradient(ellipse 700px 700px at 75% 35%, rgba(30,30,30,0.10) 0%, transparent 70%)',
            'radial-gradient(ellipse 500px 500px at 33% 100%, rgba(255,106,0,0.03) 0%, transparent 70%)',
          ].join(', '),
        }}
      />
      
      {/* Header Grid Line patterns */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10">
        <PrimaryTopMenu />

        <section className="mx-auto max-w-[1260px] px-5 pb-14 pt-5 md:px-8">
          <div className="h-[84px]" />

          <div className="mx-auto max-w-[900px] rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_18px_48px_rgba(0,0,0,0.4)] backdrop-blur-md sm:p-8 lg:p-10">
            {children}
          </div>
        </section>

        <PrimaryFooter />
      </div>
    </main>
  );
}
