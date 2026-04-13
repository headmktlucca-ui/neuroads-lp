'use client';

const geoStats = [
  { num: '50%+', desc: 'das buscas no Google já exibem respostas geradas por IA antes de qualquer link de site' },
  { num: '527%', desc: 'de crescimento em acessos vindos de IA em apenas 5 meses de 2025' },
  { num: '84%', desc: 'das empresas ainda não monitoram se são citadas — ou ignoradas — pelas IAs de busca' }
];

export default function GeoSection() {
  return (
    <section className="py-20 lg:py-28 border-b border-black/10" id="geo">
      <div className="max-w-[1160px] mx-auto px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-20 items-center">
          <div>
            <p className="flex items-center gap-[0.65rem] text-[0.68rem] font-semibold tracking-[0.22em] uppercase text-green-brand mb-4 reveal">
              <span className="w-[18px] h-[1.5px] bg-green-brand" />
              O novo SEO que poucos conhecem
            </p>
            <h2 className="font-serif text-[clamp(2.2rem,3.8vw,3.4rem)] font-bold leading-[1.1] tracking-[-0.01em] text-ink reveal">
              Quando alguém pergunta<br />ao ChatGPT sobre o<br />seu segmento, <em className="italic text-green-brand font-medium">você aparece?</em>
            </h2>
            <p className="text-[1rem] text-ink2 font-light leading-[1.8] max-w-[540px] mt-5 reveal">
              O GEO (Generative Engine Optimization) é o posicionamento estratégico da sua empresa nas respostas geradas por IA. Não é tendência futura — é o presente. E a grande maioria das PMEs brasileiras ainda não está otimizada para isso.
            </p>

            <div className="flex flex-col gap-[1px] bg-black/10 border border-black/10 rounded-[6px] overflow-hidden mt-10 reveal">
              {geoStats.map((s, i) => (
                <div key={i} className="bg-cream2 p-[1.25rem_1.75rem] flex items-center gap-6">
                  <div className="font-serif text-[2.1rem] font-bold text-green-brand min-w-[85px] leading-none">{s.num}</div>
                  <div className="text-[0.83rem] text-ink2 leading-relaxed">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-brand rounded-[6px] p-10 text-white relative overflow-hidden reveal d1">
            {/* Circle decoration */}
            <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-white/[0.04] rounded-full pointer-events-none" />
            
            <h3 className="font-serif text-[1.5rem] font-bold leading-tight mb-4">O que fazemos pelo seu posicionamento SEO + GEO</h3>
            <p className="text-[0.86rem] text-white/70 leading-[1.8] font-light mb-7">
              O SEO garante que você apareça nas listas do Google. O GEO garante que quando alguém perguntar ao ChatGPT ou Gemini "qual a melhor empresa de [seu segmento]", seu nome esteja na resposta. Fazemos os dois, integrados.
            </p>
            <ul className="list-none flex flex-col gap-2.5 mb-8">
              {[
                'Auditoria técnica completa do seu site',
                'Otimização de conteúdo para buscas orgânicas (SEO)',
                'Estruturação para ser citado em respostas de IA (GEO)',
                'Construção de autoridade digital da sua marca',
                'Monitoramento mensal da sua visibilidade em IA',
                'Estratégia de conteúdo integrada às campanhas pagas'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[0.84rem] text-white/75 leading-normal">
                  <span className="text-green-bright font-bold flex-shrink-0">✓</span> {item}
                </li>
              ))}
            </ul>
            <a href="#contato" className="inline-flex items-center gap-2 bg-white text-green-brand font-bold text-[0.84rem] py-[0.85rem] px-6 rounded-[3px] no-underline transition-opacity hover:opacity-90">
              Quero aparecer na IA →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
