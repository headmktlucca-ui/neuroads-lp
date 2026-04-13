'use client';

export default function Topbar() {
  return (
    <div className="bg-ink py-[0.65rem] px-10 text-center text-[0.78rem] text-white/70 tracking-[0.04em]">
      Diagnóstico gratuito disponível esta semana —{' '}
      <a href="#contato" className="text-green-bright font-semibold no-underline border-b border-green-bright/30 transition-colors hover:border-green-bright">
        Garanta o seu horário →
      </a>
    </div>
  );
}
