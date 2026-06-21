'use client';

export default function HubEstudioPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
        <span className="text-3xl">🎬</span>
      </div>
      <h1 className="text-2xl font-black text-white tracking-tight">Estúdio</h1>
      <p className="text-[14px] text-white/40 max-w-xs leading-relaxed">
        Esta seção está em desenvolvimento e estará disponível em breve.
      </p>
      <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400/60 border border-emerald-500/20 px-3 py-1 rounded-full">
        Em breve
      </span>
    </div>
  );
}
