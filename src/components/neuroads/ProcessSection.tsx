'use client';

const steps = [
  {
    num: '01',
    title: 'Diagnóstico Gratuito',
    desc: 'Você me conta o que está acontecendo com seu negócio. Eu analiso suas campanhas, sua visibilidade online e sua operação comercial — e mostro, com dados, onde está o maior potencial de crescimento.',
    delay: ''
  },
  {
    num: '02',
    title: 'Plano Personalizado',
    desc: 'Não entrego uma proposta genérica. Apresento um plano construído para a realidade da sua empresa — com as ações priorizadas pelo impacto no seu resultado, não pelo que é mais fácil de executar.',
    delay: 'd1'
  },
  {
    num: '03',
    title: 'Ativação e Implantação',
    desc: 'Campanhas ativadas com o Lucca. Agentes de IA implantados no seu comercial. SEO e GEO estruturados. Tudo integrado, tudo comunicado de forma clara — sem jargão técnico desnecessário.',
    delay: 'd2'
  },
  {
    num: '04',
    title: 'Otimização e Escala',
    desc: 'Relatórios objetivos, reuniões diretas e ajustes baseados em dados reais. Quando o sistema está calibrado e os números batem, escalamos — com previsibilidade, não com esperança.',
    delay: 'd3'
  }
];

export default function ProcessSection() {
  return (
    <section className="bg-cream2 py-20 lg:py-28 border-t border-black/10">
      <div className="max-w-[1160px] mx-auto px-10">
        <p className="flex items-center gap-[0.65rem] text-[0.68rem] font-semibold tracking-[0.22em] uppercase text-green-brand mb-4 reveal">
          <span className="w-[18px] h-[1.5px] bg-green-brand" />
          Como trabalhamos
        </p>
        <h2 className="font-serif text-[clamp(2.2rem,3.5vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.01em] text-ink reveal">
          Do primeiro contato ao crescimento <em className="italic text-green-brand font-medium">consistente</em><br />em quatro etapas simples
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-black/10 border border-black/10 rounded-[6px] overflow-hidden mt-16">
          {steps.map((s, i) => (
            <div key={i} className={`bg-cream p-[2.25rem_2rem] relative transition-colors hover:bg-white reveal ${s.delay}`}>
              <div className="font-serif text-[3rem] font-bold text-green-brand/10 leading-none mb-[1.1rem]">{s.num}</div>
              <h3 className="font-serif text-[1.05rem] font-bold text-ink mb-[0.65rem] leading-[1.3]">{s.title}</h3>
              <p className="text-[0.81rem] text-ink3 leading-[1.7] font-light">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:flex absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-green-brand rounded-full items-center justify-center text-white text-[0.6rem] z-10">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
