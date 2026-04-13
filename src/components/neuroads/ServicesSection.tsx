'use client';

const services = [
  {
    icon: '📈',
    num: 'Solução 01 · Performance',
    name: 'Campanhas Patrocinadas de Alta Performance',
    tagline: 'Google Ads e Meta Ads gerenciados com a plataforma Lucca — análise contínua, criativos validados por dados e foco total no custo por aquisição ideal para o seu negócio.',
    items: [
      'Gestão estratégica de Google Ads e Meta Ads',
      'Otimização de lances e orçamento em tempo real',
      'Criativos e copies gerados e testados com IA',
      'Rastreamento server-side (sem perda por bloqueio de cookies)',
      'Relatórios focados em ROI, não em métricas de vaidade',
      'Simulação de ROAS antes de escalar o investimento'
    ],
    delay: ''
  },
  {
    icon: '🔎',
    iconBg: '#FDF3E0',
    num: 'Solução 02 · Visibilidade',
    name: 'SEO Estratégico + GEO — Apareça no Google e na IA',
    tagline: 'Posicionamento nos resultados orgânicos do Google (SEO) e nas respostas geradas por IA como ChatGPT, Gemini e Perplexity (GEO). Em 2026, quem não está nos dois é invisível para metade do mercado.',
    items: [
      'SEO técnico e de conteúdo para buscas orgânicas',
      'GEO: posicionamento nas respostas de IA generativa',
      'Estruturação do site para AI Overviews do Google',
      'Estratégia de conteúdo que atrai e converte',
      'Monitoramento da presença da sua marca na IA',
      'Integração com as campanhas pagas para maximizar ROI'
    ],
    delay: 'd1'
  },
  {
    icon: '🤖',
    iconBg: '#EEF0FF',
    num: 'Solução 03 · Operação',
    name: 'Agentes de IA no Seu Comercial',
    tagline: 'Identificamos onde sua operação comercial perde tempo e dinheiro, e implantamos agentes de IA personalizados que resolvem esse gargalo — do primeiro contato ao fechamento.',
    items: [
      'Diagnóstico do gargalo operacional comercial',
      'Agente de qualificação de leads 24h por dia',
      'Automação de follow-up e nutrição de pipeline',
      'Integração com CRM e ferramentas que você já usa',
      'Atendimento automático via WhatsApp e site',
      'Treinamento da equipe para trabalhar com IA'
    ],
    delay: 'd2'
  }
];

export default function ServicesSection() {
  return (
    <section className="py-20 lg:py-28" id="servicos">
      <div className="max-w-[1160px] mx-auto px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 mb-16 items-end">
          <div>
            <p className="flex items-center gap-[0.65rem] text-[0.68rem] font-semibold tracking-[0.22em] uppercase text-green-brand mb-4 reveal">
              <span className="w-[18px] h-[1.5px] bg-green-brand" />
              O que a NeuroAds faz
            </p>
            <h2 className="font-serif text-[clamp(2.2rem,3.5vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.01em] text-ink reveal">
              Três soluções integradas.<br /><em className="italic text-green-brand font-medium">Uma estratégia.</em><br />Um só responsável.
            </h2>
          </div>
          <p className="text-[1rem] text-ink2 font-light leading-[1.8] reveal">
            Cada serviço da NeuroAds foi desenhado para funcionar sozinho — mas o poder real aparece quando os três trabalham juntos, alimentando um ao outro com dados e resultados.
          </p>
        </div>

        <div className="flex flex-col gap-[1px] bg-black/10 border border-black/10 rounded-[6px] overflow-hidden">
          {services.map((s, i) => (
            <div key={i} className={`bg-white transition-colors hover:bg-cream reveal ${s.delay}`}>
              <div className="p-8 lg:px-10 flex flex-col sm:flex-row items-start gap-6 border-b border-black/10">
                <div 
                  className="w-[46px] h-[46px] rounded-[6px] bg-green-light flex items-center justify-center text-[1.2rem] flex-shrink-0 mt-1"
                  style={s.iconBg ? { backgroundColor: s.iconBg } : {}}
                >
                  {s.icon}
                </div>
                <div>
                  <div className="text-[0.63rem] font-semibold tracking-[0.18em] uppercase text-ink3 mb-1.5">{s.num}</div>
                  <h3 className="font-serif text-[1.3rem] font-bold text-ink leading-tight mb-2 tracking-[-0.01em]">{s.name}</h3>
                  <p className="text-[0.84rem] text-ink3 font-light leading-normal">{s.tagline}</p>
                </div>
              </div>
              <div className="p-7 lg:px-10 grid grid-cols-1 md:grid-cols-2 gap-[0.5rem_2.5rem]">
                {s.items.map((item, idx) => (
                  <div key={idx} className="text-[0.82rem] text-ink2 flex items-start gap-[0.6rem] leading-normal py-1">
                    <span className="text-green-brand font-bold flex-shrink-0 text-[0.75rem] mt-0.5">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
