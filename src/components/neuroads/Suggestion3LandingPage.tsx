'use client';

import Image from 'next/image';
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  ChartColumn,
  CheckCircle2,
  ChevronDown,
  CircleGauge,
  Crosshair,
  Headphones,
  LayoutTemplate,
  LineChart,
  MessageCircleQuestion,
  Radio,
  Search,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
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
    icon: <LineChart size={14} strokeWidth={2.2} />,
    title: 'Resultados mensuráveis',
    desc: 'Foco no que importa',
  },
];

const painMatrix = [
  {
    title: 'Sua dor hoje',
    icon: <MessageCircleQuestion size={16} strokeWidth={2.4} />,
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
    icon: <TrendingDown size={16} strokeWidth={2.4} />,
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
    icon: <Target size={16} strokeWidth={2.4} />,
    text: 'Agentes de IA trabalhando 24/7 para atrair, converter e escalar com eficiência e previsibilidade.',
    cta: 'Conheça os agentes',
  },
];

const beforeItems = ['Decisões reativas', 'Relatórios demorados', 'Campanhas desconectadas', 'Baixo retorno e imprevisível'];
const afterItems = ['Decisões guiadas por IA', 'Dados em tempo real', 'Estratégias integradas', 'Performance previsível e escalável'];

const agents = [
  {
    title: 'Diagnóstico de Landing Page',
    desc: 'Análise de conversão, UX e clareza da oferta.',
    icon: <LayoutTemplate size={16} strokeWidth={2.4} />,
  },
  {
    title: 'Analisador de Público',
    desc: 'Segmentações avançadas e prontas para mídia.',
    icon: <Users size={16} strokeWidth={2.4} />,
  },
  {
    title: 'Avaliador de Oferta',
    desc: 'Precificação, proposta e posicionamento.',
    icon: <CircleGauge size={16} strokeWidth={2.4} />,
  },
  {
    title: 'Radar de Oportunidades',
    desc: 'Detecta canais, criativos e tendências com alto potencial.',
    icon: <Radio size={16} strokeWidth={2.4} />,
  },
  {
    title: 'SEO & GEO',
    desc: 'Apareça no Google e nos motores de IA.',
    icon: <Search size={16} strokeWidth={2.4} />,
  },
  {
    title: 'DNA da Marca',
    desc: 'Tom de voz, pilares e mensagens que conectam.',
    icon: <Sparkles size={16} strokeWidth={2.4} />,
  },
  {
    title: 'Análise de Concorrentes',
    desc: 'Benchmarks e movimentos que geram vantagem.',
    icon: <ChartColumn size={16} strokeWidth={2.4} />,
  },
  {
    title: 'Público-Alvo Ideal',
    desc: 'Perfis, dores e jornadas com maior propensão à compra.',
    icon: <UserRoundSearch size={16} strokeWidth={2.4} />,
  },
];

const kpis = [
  { value: '+320%', label: 'Aumento médio de ROAS' },
  { value: '-45%', label: 'Redução média de CPL' },
  { value: '+68%', label: 'Aumento médio de conversão' },
  { value: '+25%', label: 'Crescimento de receita' },
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

export default function Suggestion3LandingPage() {
  return (
    <main className="bg-[#fbfbfc] text-[#17181c]">
      <section className="relative overflow-hidden pt-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_17%,rgba(255,126,34,0.18)_0%,rgba(255,126,34,0)_46%)]" />
        <div className="mx-auto max-w-[1240px] px-6 md:px-8">
          <header className="flex items-center justify-between rounded-full border border-black/[0.06] bg-white/92 px-5 py-3 shadow-[0_10px_30px_rgba(10,18,30,0.06)] md:px-7">
            <a href="#" className="flex items-center">
              <Image src="/images/logo2026.png" alt="NeuroAds" width={162} height={34} className="h-8 w-auto" />
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
              className="inline-flex items-center gap-2 rounded-full bg-[#ff6a00] px-5 py-2.5 text-[12px] font-extrabold text-white shadow-[0_10px_22px_rgba(255,106,0,0.32)]"
            >
              Fale com um especialista
              <ArrowRight size={13} />
            </a>
          </header>

          <div className="grid items-center gap-10 pb-10 pt-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-[580px]">
              <p className="text-[13px] font-extrabold uppercase tracking-[0.09em] text-[#ff7a21]">Marketing de alta performance</p>
              <h1 className="mt-5 text-[42px] font-extrabold leading-[1.05] tracking-[-0.03em] text-[#0f1116] sm:text-[58px]">
                Performance previsível.
                <br />
                Crescimento <span className="text-[#ff6a00]">real.</span>
              </h1>
              <p className="mt-6 max-w-[530px] text-[27px] leading-relaxed text-[#4f5665]">
                Agentes de IA que orquestram dados, mídia e criatividade para gerar resultados consistentes e escaláveis.
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                {quickPoints.map((item) => (
                  <div key={item.title} className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#ffd4bc] bg-[#fff5ef] text-[#ff7a21]">
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-[13px] font-bold text-[#2a313e]">{item.title}</p>
                      <p className="text-[11px] text-[#7a8190]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#contato" className="inline-flex items-center gap-2 rounded-full bg-[#ff6a00] px-7 py-3 text-sm font-extrabold text-white">
                  Fale com um especialista
                  <ArrowRight size={14} />
                </a>
                <a href="#compare" className="inline-flex items-center gap-2 rounded-full border border-[#d9dee7] bg-white px-7 py-3 text-sm font-bold text-[#2a2f3a]">
                  Ver como funciona
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#d1d6e0] text-[#434b5a]">
                    <ArrowRight size={11} />
                  </span>
                </a>
              </div>
            </div>

            <div className="relative h-[510px] w-full">
              <div className="absolute inset-0 rounded-[42px]" />
              <div className="absolute right-4 top-7 h-[430px] w-[430px] rounded-full bg-[radial-gradient(circle,rgba(255,132,32,0.38)_0%,rgba(255,132,32,0.09)_36%,rgba(255,132,32,0)_70%)] blur-[1px]" />
              <div className="absolute right-[56px] top-[78px] h-[330px] w-[410px] -rotate-[18deg] rounded-[50%] border-[10px] border-[#ff7d1f] shadow-[0_0_0_10px_rgba(255,140,53,0.15),0_0_45px_rgba(255,118,26,0.7)]" />
              <div className="absolute right-[118px] top-[136px] h-[260px] w-[300px] -rotate-[18deg] rounded-[50%] bg-[radial-gradient(circle_at_55%_42%,#23262c_0%,#111318_55%,#080a0f_100%)] shadow-[inset_0_0_40px_rgba(255,134,35,0.35)]" />

              <div className="absolute right-[30px] top-[24px] rounded-2xl border border-[#ebeef2] bg-white p-4 shadow-[0_10px_28px_rgba(0,0,0,0.08)]">
                <p className="text-[11px] font-semibold text-[#7b8291]">ROAS</p>
                <p className="mt-1 text-[41px] font-extrabold leading-none text-[#ff6b00]">+320%</p>
                <p className="mt-1 text-[11px] text-[#9197a4]">vs. período anterior</p>
              </div>

              <div className="absolute left-[42px] top-[168px] rounded-2xl border border-[#ebeef2] bg-white p-4 shadow-[0_10px_28px_rgba(0,0,0,0.08)]">
                <p className="text-[11px] font-semibold text-[#7b8291]">Conversão</p>
                <p className="mt-1 text-[41px] font-extrabold leading-none text-[#ff6b00]">+68%</p>
                <p className="mt-1 text-[11px] text-[#9197a4]">vs. período anterior</p>
              </div>

              <div className="absolute bottom-[48px] right-[20px] rounded-2xl border border-[#ebeef2] bg-white p-4 shadow-[0_10px_28px_rgba(0,0,0,0.08)]">
                <p className="text-[11px] font-semibold text-[#7b8291]">CPL</p>
                <p className="mt-1 text-[41px] font-extrabold leading-none text-[#ff6b00]">-45%</p>
                <p className="mt-1 text-[11px] text-[#9197a4]">vs. período anterior</p>
              </div>
            </div>
          </div>

          <div className="mb-12 rounded-[28px] border border-[#eceef2] bg-white p-8 shadow-[0_12px_34px_rgba(18,26,40,0.05)]">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
              {painMatrix.map((col, idx) => (
                <div key={col.title} className="min-w-0">
                  <div className="mb-4 flex items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ffd9c3] bg-[#fff4ec] text-[#ff7b21]">
                      {col.icon}
                    </span>
                    <h3 className="text-[30px] font-extrabold text-[#222831]">{col.title}</h3>
                  </div>

                  {col.items ? (
                    <ul className="space-y-2.5 pl-1 text-[17px] text-[#4f5665]">
                      {col.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <span className="mt-[10px] h-1.5 w-1.5 rounded-full bg-[#b0b6c3]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <>
                      <p className="max-w-[320px] text-[20px] leading-relaxed text-[#4f5665]">{col.text}</p>
                      <a href="#agentes" className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[#ff6a00]">
                        {col.cta}
                        <ArrowRight size={13} />
                      </a>
                    </>
                  )}

                  {idx < painMatrix.length - 1 && (
                    <div className="hidden lg:flex lg:justify-center">
                      <ArrowRight className="absolute -right-6 top-14 text-[#aeb4c1]" size={22} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="compare" className="mx-auto max-w-[1240px] px-6 md:px-8">
        <div className="overflow-hidden rounded-[28px] border border-[#0f1a2d] bg-[#050a12] p-6 shadow-[0_24px_80px_rgba(4,10,20,0.42)] sm:p-10">
          <h2 className="text-center text-[47px] font-extrabold leading-tight text-white">Do achismo ao controle.</h2>
          <p className="text-center text-[20px] text-white/75">Resultados que você vê e o caixa sente.</p>

          <div className="relative mx-auto mt-8 grid max-w-[1020px] rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,25,39,0.94)_0%,rgba(6,10,16,0.94)_100%)] lg:grid-cols-2">
            <div className="absolute left-1/2 top-1/2 z-10 hidden h-[72%] w-px -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(180deg,rgba(255,120,29,0)_0%,rgba(255,120,29,0.95)_50%,rgba(255,120,29,0)_100%)] lg:block" />
            <span className="absolute left-1/2 top-1/2 z-20 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#ff8f42] bg-[#ff6a00] text-white shadow-[0_0_30px_rgba(255,106,0,0.7)] lg:inline-flex">
              <ArrowRight size={16} />
            </span>

            <div className="p-7 lg:pr-12">
              <h3 className="text-[31px] font-bold text-white/86">Antes</h3>
              <ul className="mt-4 space-y-3.5 text-[18px] text-white/74">
                {beforeItems.map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CircleGauge size={16} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-r-[24px] border-l border-[#ff7c2d]/50 bg-[linear-gradient(180deg,rgba(255,105,0,0.05)_0%,rgba(255,105,0,0.02)_100%)] p-7 lg:pl-12">
              <h3 className="text-[31px] font-bold text-[#ff7a21]">Depois com NeuroAds</h3>
              <ul className="mt-4 space-y-3.5 text-[18px] text-white/88">
                {afterItems.map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="agentes" className="mx-auto max-w-[1240px] px-6 pb-2 pt-14 md:px-8">
        <h2 className="text-center text-[49px] font-extrabold tracking-[-0.02em] text-[#191b20]">Conheça nossos Agentes de IA</h2>
        <p className="mx-auto mt-2 max-w-[860px] text-center text-[20px] text-[#656c7a]">
          Especialistas que trabalham juntos para gerar crescimento contínuo.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {agents.map((agent) => (
            <article key={agent.title} className="rounded-[20px] border border-[#eceef2] bg-white p-6 shadow-[0_10px_20px_rgba(18,30,48,0.03)]">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ffd7bf] bg-[#fff4ec] text-[#ff7a21]">
                {agent.icon}
              </span>
              <h3 className="mt-4 text-[31px] font-extrabold leading-tight text-[#20242d]">{agent.title}</h3>
              <p className="mt-2 text-[17px] leading-relaxed text-[#646c7b]">{agent.desc}</p>
              <a href="#contato" className="mt-4 inline-flex items-center gap-2 text-[14px] font-extrabold text-[#ff6a00]">
                Saiba mais
                <ArrowRight size={13} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-6 pb-2 pt-10 md:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-[#0f1a2d] bg-[#040a13] px-5 pb-14 pt-8 sm:px-7">
          <Image src="/images/suggest3-metrics-bg.png" alt="" fill className="pointer-events-none object-cover object-bottom opacity-88" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,15,0.82)_0%,rgba(3,8,15,0.86)_40%,rgba(3,8,15,0.25)_100%)]" />

          <div className="relative">
            <h2 className="text-center text-[48px] font-extrabold text-white">Métricas que importam. Impacto que fica.</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {kpis.map((kpi) => (
                <article key={kpi.label} className="rounded-[18px] border border-white/18 bg-[#0d1725]/62 p-5 backdrop-blur-[1px]">
                  <p className="text-[50px] font-extrabold leading-none text-[#ff7a21]">{kpi.value}</p>
                  <p className="mt-2 text-[17px] text-white/78">{kpi.label}</p>
                  <div className="mt-4 h-7 w-full rounded-full bg-[radial-gradient(circle_at_left,rgba(255,121,30,0.45)_0%,rgba(255,121,30,0)_55%)]" />
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="depoimentos" className="mx-auto max-w-[1240px] px-6 pb-4 pt-14 md:px-8">
        <h2 className="text-center text-[52px] font-extrabold text-[#1a1c22]">Quem cresce com a gente, recomenda.</h2>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-[20px] border border-[#eceef2] bg-white p-6 shadow-[0_8px_22px_rgba(10,20,30,0.03)]">
              <p className="text-[20px] leading-relaxed text-[#505867]">“{item.quote}”</p>
              <div className="mt-6 flex items-center gap-3">
                <Image src={item.avatar} alt={item.name} width={50} height={50} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="text-[19px] font-bold text-[#21252d]">{item.name}</p>
                  <p className="text-[14px] text-[#727a88]">{item.role}</p>
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

      <section className="mx-auto grid max-w-[1240px] gap-5 px-6 pb-10 pt-8 lg:grid-cols-[1.08fr_0.92fr] md:px-8">
        <div>
          <h3 className="text-[36px] font-extrabold text-[#1d2028]">Perguntas frequentes</h3>
          <div className="mt-4 overflow-hidden rounded-[16px] border border-[#eceef2] bg-white">
            {faq.map((item, idx) => (
              <div key={item} className={`flex items-center justify-between px-5 py-4 ${idx !== faq.length - 1 ? 'border-b border-[#eef0f4]' : ''}`}>
                <p className="text-[19px] font-semibold text-[#2b313e]">{item}</p>
                <span className="text-[22px] text-[#535c6b]">+</span>
              </div>
            ))}
          </div>
        </div>

        <div id="contato" className="rounded-[20px] border border-[#f0dfd4] bg-[#fffdfb] p-7 shadow-[0_8px_24px_rgba(22,24,30,0.04)]">
          <h3 className="text-[38px] font-extrabold text-[#252933]">Ainda com dúvidas?</h3>
          <p className="mt-2 text-[19px] leading-relaxed text-[#666f7d]">
            Fale com um especialista e descubra como podemos acelerar seus resultados.
          </p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <a href="#" className="inline-flex items-center gap-2 rounded-full bg-[#ff6a00] px-6 py-3 text-sm font-extrabold text-white">
              Falar com especialista
              <ArrowRight size={14} />
            </a>
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-[#ffe1cf] bg-white text-[#ff7a21] shadow-[0_6px_14px_rgba(255,122,33,0.2)]">
              <Headphones size={29} strokeWidth={2.2} />
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-6 pb-8 md:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-[#111a2b] bg-[#050b14] px-6 py-10 sm:px-8">
          <Image src="/images/suggest3-cta-bg.png" alt="" fill className="pointer-events-none object-cover object-right opacity-95" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,9,16,0.92)_0%,rgba(4,9,16,0.88)_43%,rgba(4,9,16,0.45)_100%)]" />

          <div className="relative max-w-[720px]">
            <h2 className="text-[53px] font-extrabold leading-tight text-white">
              Pronto para transformar dados
              <br />
              em <span className="text-[#ff6a00]">crescimento previsível?</span>
            </h2>
            <p className="mt-3 text-[20px] text-white/80">Agentes de IA trabalhando para seu negócio 24/7.</p>
            <p className="text-[20px] text-white/80">Mais performance. Menos achismo.</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#contato" className="inline-flex items-center gap-2 rounded-full bg-[#ff6a00] px-7 py-3 text-sm font-extrabold text-white">
                Fale com um especialista
                <ArrowRight size={14} />
              </a>
              <a href="#compare" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-7 py-3 text-sm font-bold text-white">
                Ver como funciona
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/28 text-white">
                  <ArrowRight size={11} />
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer id="rodape" className="mx-auto max-w-[1240px] px-6 pb-8 pt-2 md:px-8">
        <div className="grid gap-7 border-b border-[#eceef2] pb-8 md:grid-cols-[1.35fr_0.9fr_0.9fr_0.9fr]">
          <div>
            <Image src="/images/logo2026.png" alt="NeuroAds" width={150} height={32} className="h-8 w-auto" />
            <p className="mt-3 max-w-[280px] text-[14px] text-[#707887]">IA agêntica para marketing de alta performance.</p>
            <div className="mt-5 flex items-center gap-4 text-[#5e6574]">
              <BriefcaseBusiness size={16} />
              <Crosshair size={16} />
              <TrendingUp size={16} />
            </div>
          </div>

          {footerCols.map((col) => (
            <div key={col.title}>
              <p className="text-[15px] font-extrabold text-[#242934]">{col.title}</p>
              <ul className="mt-3 space-y-2 text-[14px] text-[#656d7c]">
                {col.links.map((link) => (
                  <li key={link}>{link}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-xs text-[#8c93a0]">
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
