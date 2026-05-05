'use client';

import Image from 'next/image';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  CircleGauge,
  Headphones,
  LayoutTemplate,
  Radio,
  Search,
  Sparkles,
  Target,
  TrendingDown,
  UserRoundSearch,
  Users,
} from 'lucide-react';

const quickPoints = [
  {
    icon: <Bot size={14} strokeWidth={2.2} />,
    title: 'IA Agêntica',
    desc: 'Autônoma e orientada a metas',
  },
  {
    icon: <CircleGauge size={14} strokeWidth={2.2} />,
    title: 'Dados em tempo real',
    desc: 'Decisões baseadas em sinal',
  },
  {
    icon: <Target size={14} strokeWidth={2.2} />,
    title: 'Resultados mensuráveis',
    desc: 'Foco no que importa',
  },
];

const painMatrix = [
  {
    title: 'Sua dor hoje',
    icon: <LayoutTemplate size={15} strokeWidth={2.2} />,
    items: [
      'Resultados inconsistentes',
      'Dependência de achismos',
      'Tempo perdido com relatórios',
      'Equipe sobrecarregada',
      'Crescimento difícil de prever',
    ],
  },
  {
    title: 'O impacto no caixa',
    icon: <TrendingDown size={15} strokeWidth={2.2} />,
    items: [
      'ROAS baixo e instável',
      'CPL alto e fora de controle',
      'Recursos mal alocados',
      'Oportunidades desperdiçadas',
      'Previsibilidade zero',
    ],
  },
  {
    title: 'Nossa solução',
    icon: <Target size={15} strokeWidth={2.2} />,
    text: 'Agentes de IA trabalhando 24/7 para atrair, converter e escalar com eficiência e previsibilidade.',
    cta: 'Conheça os agentes',
  },
];

const beforeItems = [
  'Decisões reativas',
  'Relatórios demorados',
  'Campanhas desconectadas',
  'Baixo retorno e imprevisível',
];

const afterItems = [
  'Decisões guiadas por IA',
  'Dados em tempo real',
  'Estratégias integradas',
  'Performance previsível e escalável',
];

const agents = [
  {
    title: 'Diagnóstico de Landing Page',
    desc: 'Análise de conversão, UX e clareza da oferta.',
    icon: <LayoutTemplate size={16} strokeWidth={2.3} />,
  },
  {
    title: 'Analisador de Público',
    desc: 'Segmentações avançadas e prontas para mídia.',
    icon: <Users size={16} strokeWidth={2.3} />,
  },
  {
    title: 'Avaliador de Oferta',
    desc: 'Precificação, proposta e posicionamento.',
    icon: <CircleGauge size={16} strokeWidth={2.3} />,
  },
  {
    title: 'Radar de Oportunidades',
    desc: 'Detecta canais, criativos e tendências com alto potencial.',
    icon: <Radio size={16} strokeWidth={2.3} />,
  },
  {
    title: 'SEO & GEO',
    desc: 'Apareça no Google e nos motores de IA.',
    icon: <Search size={16} strokeWidth={2.3} />,
  },
  {
    title: 'DNA da Marca',
    desc: 'Tom de voz, pilares e mensagens que conectam.',
    icon: <Sparkles size={16} strokeWidth={2.3} />,
  },
  {
    title: 'Análise de Concorrentes',
    desc: 'Benchmarks e movimentos que geram vantagem.',
    icon: <TrendingDown size={16} strokeWidth={2.3} />,
  },
  {
    title: 'Público-Alvo Ideal',
    desc: 'Perfis, dores e jornadas com maior propensão à compra.',
    icon: <UserRoundSearch size={16} strokeWidth={2.3} />,
  },
];

const metrics = [
  { value: '+320%', label: 'Aumento médio de ROAS', path: 'M0 20 C 12 19, 22 21, 36 18 C 48 15, 58 19, 72 13 C 82 9, 92 12, 110 8' },
  { value: '-45%', label: 'Redução média de CPL', path: 'M0 19 C 10 12, 24 21, 38 11 C 50 7, 58 20, 72 17 C 84 13, 94 23, 110 18' },
  { value: '+68%', label: 'Aumento médio de conversão', path: 'M0 21 C 14 17, 22 20, 36 15 C 48 10, 58 12, 74 11 C 86 11, 96 20, 110 8' },
  { value: '+25%', label: 'Crescimento de receita', path: 'M0 19 C 9 23, 20 10, 35 17 C 49 25, 60 5, 74 13 C 88 20, 97 7, 110 11' },
];

const testimonials = [
  {
    quote: 'Com os agentes da NeuroAds conseguimos prever resultados com muito mais precisão. Nosso ROAS nunca esteve tão consistente.',
    name: 'Mariana Lopes',
    role: 'CMO, HealtyFood',
    avatar: '/images/especialista-sobre.jpg',
  },
  {
    quote: 'Reduzimos CPL em 45% e aumentamos escala sem aumentar o orçamento. IA que realmente entrega.',
    name: 'Rafael Andrade',
    role: 'CEO, Construlize',
    avatar: '/images/especialista-ia.jpg',
  },
  {
    quote: 'Os relatórios são claros, as decisões são rápidas e o crescimento é visível no caixa. Parceria indispensável.',
    name: 'Juliana Prado',
    role: 'Head de Growth, EduTech',
    avatar: '/images/especialista.jpg',
  },
];

const faq = [
  'Como funciona a IA Agêntica da NeuroAds?',
  'Vocês atendem qual tipo de empresa?',
  'Em quanto tempo começam os resultados?',
  'Quais canais vocês gerenciam?',
  'Como é a implementação?',
];

const footerCols = [
  {
    title: 'Soluções',
    links: ['Agentes IA', 'Gestão de Mídia', 'Criação & Testes', 'SEO & Conteúdo'],
  },
  {
    title: 'Recursos',
    links: ['Materiais', 'Blog', 'Webinars', 'Guias'],
  },
  {
    title: 'Empresa',
    links: ['Sobre nós', 'Cases', 'Carreiras', 'Contato'],
  },
];

function Sparkline({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 110 28" className="h-6 w-full" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke="#ff6a00" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Suggestion3LandingPage() {
  return (
    <main className="bg-[#f9fafb] text-[#1a1d23]">
      <section className="relative overflow-hidden pt-5">
        <div className="mx-auto max-w-[1260px] px-5 md:px-8">
          <header className="flex items-center justify-between rounded-full border border-black/[0.06] bg-white px-5 py-3 shadow-[0_8px_26px_rgba(10,18,30,0.04)] md:px-7">
            <a href="#" className="flex items-center">
              <Image src="/images/logo2026.png" alt="NeuroAds" width={156} height={34} className="h-8 w-auto" priority />
            </a>

            <nav className="hidden items-center gap-8 text-[13px] font-semibold text-[#5f6572] lg:flex">
              <a href="#" className="inline-flex items-center gap-1.5 hover:text-[#1c2230]">
                Soluções
                <ChevronDown size={12} />
              </a>
              <a href="#agentes" className="hover:text-[#1c2230]">Agentes IA</a>
              <a href="#depoimentos" className="hover:text-[#1c2230]">Cases</a>
              <a href="#" className="inline-flex items-center gap-1.5 hover:text-[#1c2230]">
                Recursos
                <ChevronDown size={12} />
              </a>
              <a href="#rodape" className="hover:text-[#1c2230]">Empresa</a>
            </nav>

            <a
              href="#contato"
              className="inline-flex items-center gap-2 rounded-full bg-[#ff6a00] px-5 py-2.5 text-[12px] font-extrabold text-white"
            >
              Fale com um especialista
              <ArrowRight size={13} />
            </a>
          </header>

          <div className="grid items-center gap-8 pb-10 pt-12 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="max-w-[560px]">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#ff7a21]">Marketing de alta performance</p>
              <h1 className="mt-4 text-[50px] font-extrabold leading-[1.04] tracking-[-0.02em] text-[#111317] sm:text-[62px]">
                Performance previsível.
                <br />
                Crescimento <span className="text-[#ff6a00]">real.</span>
              </h1>
              <p className="mt-6 max-w-[520px] text-[15px] leading-[1.65] text-[#4f5665]">
                Agentes de IA que orquestram dados, mídia e criatividade para gerar resultados consistentes e escaláveis.
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                {quickPoints.map((item) => (
                  <div key={item.title} className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#ffd9c4] bg-[#fff5ef] text-[#ff7a21]">
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-[12px] font-bold text-[#2a313e]">{item.title}</p>
                      <p className="text-[11px] text-[#7a8190]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#contato" className="inline-flex items-center gap-2 rounded-full bg-[#ff6a00] px-6 py-3 text-[13px] font-extrabold text-white">
                  Fale com um especialista
                  <ArrowRight size={13} />
                </a>
                <a href="#compare" className="inline-flex items-center gap-2 rounded-full border border-[#d9dee7] bg-white px-6 py-3 text-[13px] font-bold text-[#2a2f3a]">
                  Ver como funciona
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#d1d6e0] text-[#434b5a]">
                    <ArrowRight size={10} />
                  </span>
                </a>
              </div>
            </div>

            <div className="relative h-[470px] w-full sm:h-[520px] lg:h-[560px]">
              <Image
                src="/images/template-match/hero-orbit-v1.png"
                alt="Anel de energia da NeuroAds"
                fill
                className="object-cover object-right scale-[1.16] origin-right"
                priority
              />

              <div className="absolute right-[14px] top-[14px] rounded-2xl border border-[#ebeef2] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
                <p className="text-[10px] font-semibold text-[#7b8291]">ROAS</p>
                <p className="mt-1 text-[37px] font-extrabold leading-none text-[#ff6b00]">+320%</p>
                <p className="mt-1 text-[10px] text-[#9197a4]">vs. período anterior</p>
              </div>

              <div className="absolute left-[18px] top-[182px] rounded-2xl border border-[#ebeef2] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
                <p className="text-[10px] font-semibold text-[#7b8291]">Conversão</p>
                <p className="mt-1 text-[37px] font-extrabold leading-none text-[#ff6b00]">+68%</p>
                <p className="mt-1 text-[10px] text-[#9197a4]">vs. período anterior</p>
              </div>

              <div className="absolute bottom-[24px] right-[8px] rounded-2xl border border-[#ebeef2] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
                <p className="text-[10px] font-semibold text-[#7b8291]">CPL</p>
                <p className="mt-1 text-[37px] font-extrabold leading-none text-[#ff6b00]">-45%</p>
                <p className="mt-1 text-[10px] text-[#9197a4]">vs. período anterior</p>
              </div>
            </div>
          </div>

          <div className="mb-12 rounded-[28px] border border-[#eceef2] bg-white px-6 py-8 sm:px-7">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
              {painMatrix.map((col, idx) => (
                <div key={col.title} className="relative min-w-0">
                  <div className="mb-4 flex items-center gap-2.5">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#ffd9c3] bg-[#fff4ec] text-[#ff7b21]">
                      {col.icon}
                    </span>
                    <h3 className="text-[26px] font-extrabold text-[#222831]">{col.title}</h3>
                  </div>

                  {col.items ? (
                    <ul className="space-y-2.5 pl-1 text-[14px] text-[#4f5665]">
                      {col.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-[8px] h-1 w-1 rounded-full bg-[#b0b6c3]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <>
                      <p className="max-w-[300px] text-[14px] leading-relaxed text-[#4f5665]">{col.text}</p>
                      <a href="#agentes" className="mt-6 inline-flex items-center gap-2 text-[13px] font-extrabold text-[#ff6a00]">
                        {col.cta}
                        <ArrowRight size={12} />
                      </a>
                    </>
                  )}

                  {idx < painMatrix.length - 1 && (
                    <ArrowRight className="absolute -right-[34px] top-[10px] hidden text-[#aeb4c1] lg:block" size={20} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="compare" className="mx-auto max-w-[1260px] px-5 md:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-[#0f1a2d] bg-[#050a12] px-5 py-8 sm:px-10 sm:py-10">
          <Image src="/images/template-match/compare-bg-v1.png" alt="" fill className="pointer-events-none object-cover opacity-72" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,18,0.72)_0%,rgba(5,10,18,0.78)_100%)]" />

          <div className="relative">
            <h2 className="text-center text-[44px] font-extrabold leading-tight text-white sm:text-[48px]">Do achismo ao controle.</h2>
            <p className="text-center text-[20px] text-white/78">Resultados que você vê e o caixa sente.</p>

            <div className="relative mx-auto mt-8 grid max-w-[1040px] rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,22,35,0.95)_0%,rgba(9,14,22,0.95)_100%)] lg:grid-cols-2">
              <div className="absolute left-1/2 top-1/2 z-10 hidden h-[70%] w-px -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(180deg,rgba(255,120,29,0)_0%,rgba(255,120,29,0.95)_50%,rgba(255,120,29,0)_100%)] lg:block" />
              <span className="absolute left-1/2 top-1/2 z-20 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#ff8f42] bg-[#ff6a00] text-white shadow-[0_0_26px_rgba(255,106,0,0.7)] lg:inline-flex">
                <ArrowRight size={14} />
              </span>

              <div className="p-6 lg:pr-12">
                <h3 className="text-[26px] font-bold text-white/86">Antes</h3>
                <ul className="mt-4 space-y-3 text-[16px] text-white/75">
                  {beforeItems.map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <CircleGauge size={14} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-r-[20px] border-l border-[#ff7c2d]/50 bg-[linear-gradient(180deg,rgba(255,105,0,0.06)_0%,rgba(255,105,0,0.02)_100%)] p-6 lg:pl-12">
                <h3 className="text-[26px] font-bold text-[#ff7a21]">Depois com NeuroAds</h3>
                <ul className="mt-4 space-y-3 text-[16px] text-white/88">
                  {afterItems.map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <CheckCircle2 size={14} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="agentes" className="mx-auto max-w-[1260px] px-5 pb-2 pt-14 md:px-8">
        <h2 className="text-center text-[48px] font-extrabold tracking-[-0.02em] text-[#191b20] sm:text-[52px]">Conheça nossos Agentes de IA</h2>
        <p className="mx-auto mt-2 max-w-[860px] text-center text-[20px] text-[#656c7a]">
          Especialistas que trabalham juntos para gerar crescimento contínuo.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {agents.map((agent) => (
            <article key={agent.title} className="rounded-[18px] border border-[#eceef2] bg-white p-5 shadow-[0_6px_16px_rgba(18,30,48,0.03)]">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ffd7bf] bg-[#fff4ec] text-[#ff7a21]">
                {agent.icon}
              </span>
              <h3 className="mt-4 text-[30px] font-extrabold leading-tight text-[#20242d]">{agent.title}</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-[#646c7b]">{agent.desc}</p>
              <a href="#contato" className="mt-4 inline-flex items-center gap-2 text-[14px] font-extrabold text-[#ff6a00]">
                Saiba mais
                <ArrowRight size={12} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1260px] px-5 pb-2 pt-10 md:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-[#0f1a2d] bg-[#040a13] px-5 pb-12 pt-8 sm:px-7">
          <Image src="/images/template-match/metrics-wave-v1.png" alt="" fill className="pointer-events-none object-cover object-bottom opacity-92" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,15,0.78)_0%,rgba(3,8,15,0.86)_45%,rgba(3,8,15,0.22)_100%)]" />

          <div className="relative">
            <h2 className="text-center text-[44px] font-extrabold text-white sm:text-[49px]">Métricas que importam. Impacto que fica.</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <article key={metric.label} className="rounded-[16px] border border-white/18 bg-[#0d1725]/60 p-4">
                  <p className="text-[44px] font-extrabold leading-none text-[#ff7a21]">{metric.value}</p>
                  <p className="mt-2 text-[15px] text-white/82">{metric.label}</p>
                  <div className="mt-4">
                    <Sparkline d={metric.path} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="depoimentos" className="mx-auto max-w-[1260px] px-5 pb-4 pt-14 md:px-8">
        <h2 className="text-center text-[50px] font-extrabold text-[#1a1c22] sm:text-[54px]">Quem cresce com a gente, recomenda.</h2>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-[18px] border border-[#eceef2] bg-white p-6 shadow-[0_6px_16px_rgba(10,20,30,0.03)]">
              <p className="text-[18px] leading-relaxed text-[#505867]">“{item.quote}”</p>
              <div className="mt-5 flex items-center gap-3">
                <Image src={item.avatar} alt={item.name} width={46} height={46} className="h-11 w-11 rounded-full object-cover" />
                <div>
                  <p className="text-[18px] font-bold text-[#21252d]">{item.name}</p>
                  <p className="text-[13px] text-[#727a88]">{item.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff6a00]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d7dbe2]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d7dbe2]" />
        </div>
      </section>

      <section className="mx-auto grid max-w-[1260px] gap-5 px-5 pb-10 pt-8 lg:grid-cols-[1.08fr_0.92fr] md:px-8">
        <div>
          <h3 className="text-[34px] font-extrabold text-[#1d2028]">Perguntas frequentes</h3>
          <div className="mt-4 overflow-hidden rounded-[16px] border border-[#eceef2] bg-white">
            {faq.map((item, idx) => (
              <div key={item} className={`flex items-center justify-between px-5 py-4 ${idx !== faq.length - 1 ? 'border-b border-[#eef0f4]' : ''}`}>
                <p className="text-[16px] font-semibold text-[#2b313e]">{item}</p>
                <span className="text-[21px] text-[#535c6b]">+</span>
              </div>
            ))}
          </div>
        </div>

        <div id="contato" className="rounded-[18px] border border-[#f0dfd4] bg-[#fffdfb] p-7 shadow-[0_6px_16px_rgba(22,24,30,0.04)]">
          <h3 className="text-[36px] font-extrabold text-[#252933]">Ainda com dúvidas?</h3>
          <p className="mt-2 text-[16px] leading-relaxed text-[#666f7d]">
            Fale com um especialista e descubra como podemos acelerar seus resultados.
          </p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <a href="#" className="inline-flex items-center gap-2 rounded-full bg-[#ff6a00] px-6 py-3 text-[13px] font-extrabold text-white">
              Falar com especialista
              <ArrowRight size={13} />
            </a>
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-[#ffe1cf] bg-white text-[#ff7a21] shadow-[0_5px_12px_rgba(255,122,33,0.2)]">
              <Headphones size={28} strokeWidth={2.2} />
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1260px] px-5 pb-8 md:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-[#111a2b] bg-[#050b14] px-6 py-10 sm:px-8">
          <Image src="/images/template-match/cta-orbit-dark-v1.png" alt="" fill className="pointer-events-none object-cover object-right opacity-95" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,9,16,0.93)_0%,rgba(4,9,16,0.9)_45%,rgba(4,9,16,0.5)_100%)]" />

          <div className="relative max-w-[700px]">
            <h2 className="text-[50px] font-extrabold leading-tight text-white sm:text-[56px]">
              Pronto para transformar dados
              <br />
              em <span className="text-[#ff6a00]">crescimento previsível?</span>
            </h2>
            <p className="mt-3 text-[16px] text-white/82">Agentes de IA trabalhando para seu negócio 24/7.</p>
            <p className="text-[16px] text-white/82">Mais performance. Menos achismo.</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#contato" className="inline-flex items-center gap-2 rounded-full bg-[#ff6a00] px-6 py-3 text-[13px] font-extrabold text-white">
                Fale com um especialista
                <ArrowRight size={13} />
              </a>
              <a href="#compare" className="inline-flex items-center gap-2 rounded-full border border-white/24 bg-black/25 px-6 py-3 text-[13px] font-bold text-white">
                Ver como funciona
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/30 text-white">
                  <ArrowRight size={10} />
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer id="rodape" className="mx-auto max-w-[1260px] px-5 pb-8 pt-2 md:px-8">
        <div className="grid gap-8 border-b border-[#eceef2] pb-8 md:grid-cols-[1.35fr_0.9fr_0.9fr_0.9fr]">
          <div>
            <Image src="/images/logo2026.png" alt="NeuroAds" width={150} height={32} className="h-8 w-auto" />
            <p className="mt-3 max-w-[280px] text-[13px] text-[#707887]">IA agêntica para marketing de alta performance.</p>
            <div className="mt-4 flex items-center gap-3 text-[#525b6b]">
              <a href="#" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e8ee] bg-white">
                <span className="text-[11px] font-bold">in</span>
              </a>
              <a href="#" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e8ee] bg-white">
                <span className="text-[11px] font-bold">ig</span>
              </a>
              <a href="#" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e8ee] bg-white">
                <span className="text-[11px] font-bold">yt</span>
              </a>
            </div>
          </div>

          {footerCols.map((col) => (
            <div key={col.title}>
              <p className="text-[14px] font-extrabold text-[#242934]">{col.title}</p>
              <ul className="mt-3 space-y-2 text-[13px] text-[#656d7c]">
                {col.links.map((link) => (
                  <li key={link}>{link}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-[11px] text-[#8c93a0]">
          <p>© 2025 NeuroAds. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="/privacidade">Política de Privacidade</a>
            <a href="/termos">Termos de Uso</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
