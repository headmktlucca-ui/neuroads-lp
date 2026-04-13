'use client';

export default function Topbar() {
  return (
    <div className="bg-[#020205] py-2 lg:py-2.5 px-6 lg:px-10 text-center text-[0.62rem] lg:text-[0.68rem] text-text-4 font-bold tracking-[0.14em] uppercase border-b border-white/5">
      Diagnóstico de Performance Gratuito —{' '}
      <a href="#contato" className="text-blue-1 transition-colors hover:text-blue-2 underline decoration-blue-1/30 underline-offset-4 decoration-2">
        Agendar Horário →
      </a>
    </div>
  );
}
