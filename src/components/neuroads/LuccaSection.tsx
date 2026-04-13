'use client';

const luccaItems = [
  'Analisa leilões do Google e Meta a cada ciclo para extrair o menor CPA possível',
  'Prevê o ROI antes de você escalar — você vê os números antes de decidir',
  'Rastreamento server-side: captura 100% das conversões, sem perda por bloqueio de cookies',
  'Redistribui a verba automaticamente para os criativos e canais de melhor performance',
  'Gera diagnóstico automático de Landing Pages, identificando onde sua página perde conversão'
];

const luccaRows = [
  { label: 'CPA atual', val: 'R$ 38,40' },
  { label: 'CPA alvo', val: 'R$ 42,00 ✓', status: 'good' },
  { label: 'ROAS atual', val: '4,7×', status: 'good' },
  { label: 'Budget restante', val: 'R$ 4.280' },
  { label: 'Alerta detectado', val: '1 grupo ocioso', status: 'warn' },
  { label: 'Receita projetada (mês)', val: 'R$ 84.600', status: 'good' }
];

export default function LuccaSection() {
  return (
    <section className="bg-ink text-cream py-20 lg:py-28 relative overflow-hidden" id="lucca">
      {/* Subtle texture background */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(110,226,168,0.05) 0%, transparent 60%)' }} />

      <div className="max-w-[1160px] mx-auto px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="flex items-center gap-[0.6rem] text-[0.68rem] font-semibold tracking-[0.22em] uppercase text-green-bright mb-4 reveal">
              <span className="w-[18px] h-[1.5px] bg-green-bright" />
              Tecnologia que nos diferencia
            </p>
            <h2 className="font-serif text-[clamp(2rem,3.2vw,3.2rem)] font-bold leading-[1.1] text-cream mb-5 tracking-[-0.01em] reveal">
              O <em className="italic text-green-bright font-medium">Lucca</em>: o sistema que<br />entrega o resultado
            </h2>
            <p className="text-[0.95rem] text-white/55 font-light leading-[1.8] mb-8 reveal">
              Não gerenciamos suas campanhas com as mesmas ferramentas que qualquer freelancer usa. O Lucca é o sistema de inteligência central da NeuroAds — ele analisa seus dados de campanha em tempo real, identifica onde seu dinheiro está sendo desperdiçado e indica exatamente onde investir mais.
            </p>

            <div className="flex flex-col gap-4 mt-6 reveal">
              {luccaItems.map((item, i) => (
                <div key={i} className="flex items-start gap-4 text-[0.88rem] text-white/65 leading-relaxed">
                  <div className="w-[26px] h-[26px] rounded-full bg-green-bright/10 border border-green-bright/15 flex items-center justify-center text-[0.6rem] flex-shrink-0 text-green-bright mt-0.5">
                    ◆
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.07] rounded-[8px] overflow-hidden reveal d1">
            <div className="bg-green-bright/[0.07] border-b border-white/[0.05] p-[1.25rem_1.75rem] flex items-center justify-between">
              <span className="font-serif text-[1.05rem] font-semibold text-green-bright">Lucca · Painel em Tempo Real</span>
              <div className="flex items-center gap-1.5 text-[0.65rem] font-semibold text-green-bright uppercase tracking-[0.14em]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-bright animate-pulse" />
                Ao vivo
              </div>
            </div>

            <div className="p-5 flex flex-col gap-[1px] bg-white/[0.03]">
              {luccaRows.map((row, i) => (
                <div key={i} className="bg-[#050505]/50 p-[1rem_1.25rem] flex justify-between items-center gap-4">
                  <span className="text-[0.78rem] text-white/40">{row.label}</span>
                  <span className={`font-serif text-[1.15rem] font-bold ${row.status === 'good' ? 'text-green-bright' : row.status === 'warn' ? 'text-[#F0C060]' : 'text-cream'}`}>
                    {row.val}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-[1.25rem_1.75rem] bg-green-bright/[0.05] text-[0.75rem] text-white/30 text-center italic">
              Dados simulados para fins ilustrativos. Resultados reais variam por negócio.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
