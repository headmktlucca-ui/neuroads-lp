'use client';

import Image from 'next/image';
import {
  ArrowRight,
  Bot,
  ChartColumnBig,
  ChevronDown,
  Clock3,
  Crosshair,
  DollarSign,
  Megaphone,
  Shield,
  ShieldCheck,
  Stethoscope,
  Store,
  Users,
  WalletCards,
} from 'lucide-react';

const kpis = [
  { label: 'ROAS', value: '4,62x', delta: '↑ 86% vs. período anterior' },
  { label: 'CPL', value: 'R$16,37', delta: '↓ 42% vs. período anterior' },
  { label: 'CONVERSÃO', value: '7,31%', delta: '↑ 68% vs. período anterior' },
  { label: 'FATURAMENTO', value: 'R$ 2,84M', delta: '↑ 114% vs. período anterior' },
];

const resultCards = [
  {
    title: 'E-commerce de Moda',
    tag: 'E-COMMERCE',
    value: '+312%',
    metric: 'de ROAS',
    period: 'R$ 1,2M  ->  R$ 4,9M    em 90 dias',
    icon: <Store size={15} />,
  },
  {
    title: 'InfoProdutor',
    tag: 'EDUCAÇÃO',
    value: '-57%',
    metric: 'de CPL',
    period: 'R$ 42,80  ->  R$ 18,35    em 60 dias',
    icon: <WalletCards size={15} />,
  },
  {
    title: 'Clínica Médica',
    tag: 'SAÚDE',
    value: '+189%',
    metric: 'de agendamentos',
    period: '312  ->  903    em 60 dias',
    icon: <Stethoscope size={15} />,
  },
  {
    title: 'SaaS B2B',
    tag: 'TECNOLOGIA',
    value: '+271%',
    metric: 'de MRR',
    period: 'R$ 98K  ->  R$ 265K    em 120 dias',
    icon: <ChartColumnBig size={15} />,
  },
];

const modules = [
  {
    title: 'SEO + GEO',
    desc: 'Apareça no Google e nas respostas generativas de IA.',
    icon: <Crosshair size={18} />,
  },
  {
    title: 'Tracking Server-Side',
    desc: 'Dados confiáveis, sem bloqueios e com máxima precisão.',
    icon: <ShieldCheck size={18} />,
  },
  {
    title: 'IA Comercial',
    desc: 'Agentes que qualificam, abordam e fecham com mais estratégia.',
    icon: <Bot size={18} />,
  },
  {
    title: 'Automação Criativa',
    desc: 'Anúncios e landing pages gerados e otimizados por IA.',
    icon: <Megaphone size={18} />,
  },
];

const testimonials = [
  {
    quote:
      'A NeuroAds transformou nossos dados em estratégia. Em 60 dias, nosso ROAS mais que triplicou com previsibilidade.',
    name: 'Juliana Prado',
    role: 'Head de Growth, EduTech',
  },
  {
    quote:
      'Os agentes de IA otimizaram tudo o que antes dependia do nosso time. Ganho de velocidade e resultado absurdo.',
    name: 'Rafael Andrade',
    role: 'CEO, Consultoria',
  },
  {
    quote:
      'Escalamos de R$ 80K para R$ 250K de faturamento mensal com campanhas que finalmente são lucrativas.',
    name: 'Mariana Lopes',
    role: 'CMO, D2C Brand',
  },
];

const highlights = [
  { icon: <Users size={14} />, text: '+25 empresas atendidas' },
  { icon: <DollarSign size={14} />, text: '+R$ 10M investidos' },
  { icon: <Shield size={14} />, text: 'Agentes IA 24/7' },
  { icon: <Clock3 size={14} />, text: 'Dados em tempo real e decisões rápidas' },
];

export default function Suggestion3LandingPage() {
  return (
    <main className="relative isolate overflow-x-hidden bg-[#f2f4f7] text-[#131a25]">
      <section className="relative z-10 pb-10">
        <div className="absolute inset-0 bg-[#f2f4f7]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 88% 30%, rgba(255,124,48,0.2) 0%, rgba(255,124,48,0) 44%), linear-gradient(180deg, #f8fafc 0%, #f4f6f8 100%), url('/images/hero-initial-match.png')",
            backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
            backgroundSize: 'auto, auto, min(64vw, 980px) auto',
            backgroundPosition: 'center, center, calc(100% + 100px) 128px',
          }}
        />
        <div className="relative mx-auto max-w-[1180px] px-6 pb-5 pt-6 sm:px-10">
          <header className="rounded-full border border-black/5 bg-white px-7 py-3 shadow-[0_10px_26px_rgba(20,25,35,0.06)]">
            <div className="flex items-center justify-between gap-6">
              <a href="#inicio" className="flex items-center gap-2">
                <Image src="/images/logo2026.png" alt="NeuroAds" width={178} height={40} className="h-9 w-auto" />
              </a>
              <nav className="hidden items-center gap-9 text-[15px] font-semibold text-[#596272] lg:flex">
                <a href="#modulos" className="inline-flex items-center gap-1.5 hover:text-[#18202c]">
                  Soluções
                  <ChevronDown size={13} strokeWidth={2.2} />
                </a>
                <a href="#comando" className="hover:text-[#18202c]">Agentes IA</a>
                <a href="#resultados" className="hover:text-[#18202c]">Cases</a>
                <a href="#rodape" className="inline-flex items-center gap-1.5 hover:text-[#18202c]">
                  Recursos
                  <ChevronDown size={13} strokeWidth={2.2} />
                </a>
                <a href="#rodape" className="hover:text-[#18202c]">Empresa</a>
              </nav>
              <a
                href="#contato"
                className="inline-flex items-center gap-2 rounded-full bg-[#ff6a00] px-8 py-3 text-xs font-black text-white"
              >
                Fale com um especialista <ArrowRight size={12} />
              </a>
            </div>
          </header>

          <div id="inicio" className="grid min-h-[620px] items-center gap-10 pt-14 lg:grid-cols-[1fr_1.05fr]">
            <div className="max-w-[580px]">
              <p className="mb-6 inline-flex rounded-full border border-[#ffc49b] bg-[#fff6ef] px-4 py-1.5 text-[11px] font-black tracking-[0.13em] text-[#ea6d2f] uppercase">
                Marketing de Alta Performance
              </p>
              <h1
                className="text-[66px] font-extrabold leading-[1.04] tracking-[-0.035em] text-[#121923] max-[1240px]:text-[56px] max-[560px]:text-[46px]"
                style={{ fontFamily: 'var(--font-head)' }}
              >
                Marketing de Alta
                <br />
                Performance com
                <br />
                <span className="text-[#ff6a00]">IA Agêntica.</span>
              </h1>
              <p className="mt-6 max-w-[530px] text-[20px] leading-[1.62] text-[#4f5968] max-[1000px]:text-[18px]">
                Agentes de IA que pensam, executam e otimizam suas campanhas 24/7 para gerar crescimento previsível e escala sustentável.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#contato"
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff6a00] px-8 py-4 text-[15px] font-black text-white"
                >
                  Fale com um especialista <ArrowRight size={14} />
                </a>
                <a
                  href="#modulos"
                  className="inline-flex items-center gap-2 rounded-full border border-[#d8dde6] bg-white px-8 py-4 text-[15px] font-bold text-[#28313f]"
                >
                  Ver como funciona
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d2d8e0] text-[#404b5a]">
                    <ArrowRight size={10} />
                  </span>
                </a>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-3 text-[15px] font-semibold text-[#4e5969] md:grid-cols-4">
                {highlights.map((item) => (
                  <div key={item.text} className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#ffd0b1] bg-[#fff3e9] text-[#ff7a23]">
                      {item.icon}
                    </span>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-[560px]" />
          </div>
        </div>
      </section>

      <section id="comando" className="mx-auto max-w-[1280px] px-6 pb-12 sm:px-10">
        <div className="relative overflow-hidden rounded-[34px] border border-[#182131] bg-[#090f17] p-7 shadow-[0_30px_80px_rgba(4,8,16,0.5)] sm:p-10">
          <Image
            src="/images/suggest3-metrics-bg.png"
            alt=""
            fill
            className="pointer-events-none object-cover object-center opacity-28"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.2)_0%,rgba(1,4,8,0.65)_100%)]" />

          <div className="relative">
            <p className="text-[42px] font-extrabold tracking-[-0.02em] text-white max-[900px]:text-[32px]" style={{ fontFamily: 'var(--font-head)' }}>
              COMANDO DE PERFORMANCE
            </p>
            <p className="mt-2 text-white/70">Visão em tempo real do que realmente importa para o seu negócio.</p>

            <div className="mt-7 grid gap-4 lg:grid-cols-4">
              {kpis.map((item) => (
                <article key={item.label} className="rounded-2xl border border-white/10 bg-[#0d1623]/85 p-5">
                  <p className="text-[13px] font-bold tracking-wide text-white/80">{item.label}</p>
                  <p className="mt-2 text-[52px] font-extrabold leading-none text-[#ff7a23]" style={{ fontFamily: 'var(--font-head)' }}>
                    {item.value}
                  </p>
                  <p className="mt-3 text-xs text-white/65">{item.delta}</p>
                </article>
              ))}
            </div>

            <div id="resultados" className="mt-11">
              <p className="text-[43px] font-extrabold tracking-[-0.02em] text-white max-[900px]:text-[32px]" style={{ fontFamily: 'var(--font-head)' }}>
                RESULTADOS REAIS, IMPACTOS REAIS
              </p>
              <div className="mt-5 grid gap-4 lg:grid-cols-4">
                {resultCards.map((item) => (
                  <article key={item.title} className="rounded-2xl border border-white/10 bg-[#0f1826]/80 p-5 text-white">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white/80">
                      {item.icon}
                      {item.title}
                    </div>
                    <p className="mt-2 text-[10px] font-black tracking-[0.13em] text-[#ff954d]">{item.tag}</p>
                    <p className="mt-2 text-5xl font-extrabold text-[#ff7a23]" style={{ fontFamily: 'var(--font-head)' }}>{item.value}</p>
                    <p className="text-3xl text-white/85">{item.metric}</p>
                    <p className="mt-3 text-[11px] text-white/62">{item.period}</p>
                  </article>
                ))}
              </div>
            </div>

            <div id="modulos" className="mt-11">
              <p className="text-[43px] font-extrabold tracking-[-0.02em] text-white max-[900px]:text-[32px]" style={{ fontFamily: 'var(--font-head)' }}>
                TECNOLOGIA. DADOS. INTELIGÊNCIA.
              </p>
              <p className="text-white/70">Um ecossistema modular de agentes trabalhando para você.</p>
              <div className="mt-5 grid gap-4 lg:grid-cols-4">
                {modules.map((item) => (
                  <article key={item.title} className="rounded-2xl border border-white/10 bg-[#111b2b]/80 p-5 text-white">
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff7a23]/15 text-[#ff934f]">
                      {item.icon}
                    </div>
                    <p className="text-[26px] font-bold tracking-[-0.02em]">{item.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/72">{item.desc}</p>
                    <a href="#contato" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#ff8f45]">
                      Saiba mais <ArrowRight size={13} />
                    </a>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-11">
              <p className="text-[43px] font-extrabold tracking-[-0.02em] text-white max-[900px]:text-[32px]" style={{ fontFamily: 'var(--font-head)' }}>
                QUEM CRESCE COM A GENTE, RECOMENDA
              </p>
              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {testimonials.map((item) => (
                  <article key={item.name} className="rounded-2xl border border-white/10 bg-[#111a29]/80 p-5 text-white">
                    <p className="text-[17px] leading-relaxed text-white/88">“{item.quote}”</p>
                    <p className="mt-4 text-xl font-bold text-[#ff9654]">{item.name}</p>
                    <p className="text-sm text-white/67">{item.role}</p>
                  </article>
                ))}
              </div>
            </div>

            <div id="contato" className="relative mt-11 overflow-hidden rounded-[28px] border border-white/15 bg-[#101925]/92 p-7 sm:p-8">
              <Image src="/images/suggest3-cta-bg.png" alt="" fill className="pointer-events-none object-cover object-center opacity-60" />
              <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <p className="text-[53px] font-extrabold leading-tight text-white max-[900px]:text-[40px]" style={{ fontFamily: 'var(--font-head)' }}>
                    PRONTO PARA ASSUMIR O
                    <br />
                    <span className="text-[#ff7a23]">COMANDO</span> DO SEU CRESCIMENTO?
                  </p>
                  <p className="mt-3 max-w-[620px] text-[22px] text-white/80 max-[900px]:text-[18px]">
                    Nossos agentes de IA estão prontos para trabalhar 24/7 pelo crescimento previsível do seu negócio.
                  </p>
                </div>
                <div className="rounded-3xl border border-[#ff8f4d]/40 bg-black/35 p-6 backdrop-blur-sm">
                  <p className="text-[43px] font-extrabold text-white max-[900px]:text-[34px]" style={{ fontFamily: 'var(--font-head)' }}>Ainda com dúvidas?</p>
                  <p className="mt-2 text-[15px] text-white/76">
                    Fale com um especialista e descubra como podemos acelerar seus resultados.
                  </p>
                  <a href="#contato" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#ff6a00] px-6 py-3 text-sm font-black text-white">
                    Falar com especialista <ArrowRight size={14} />
                  </a>
                  <div className="mt-6 overflow-hidden rounded-2xl border border-[#ff914d]/35 bg-black/25 p-3">
                    <Image src="/images/suggest3-support-icon.png" alt="Especialista online" width={260} height={260} className="mx-auto h-40 w-40 object-cover" />
                  </div>
                </div>
              </div>
            </div>

            <footer id="rodape" className="mt-10 border-t border-white/10 pt-8">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.85fr_0.85fr_0.85fr_1fr]">
                <div>
                  <Image src="/images/logo2026.png" alt="NeuroAds" width={170} height={40} className="h-8 w-auto" />
                  <p className="mt-3 max-w-[260px] text-sm text-white/67">Agentes de IA para Marketing de Alta Performance.</p>
                </div>
                <div>
                  <p className="text-sm font-black text-white">Soluções</p>
                  <p className="mt-3 space-y-2 text-sm text-white/65">
                    Agentes Neurais
                    <br />
                    IA Comercial
                    <br />
                    SEO + GEO
                    <br />
                    Tracking Server-Side
                    <br />
                    Automação Criativa
                  </p>
                </div>
                <div>
                  <p className="text-sm font-black text-white">Recursos</p>
                  <p className="mt-3 space-y-2 text-sm text-white/65">
                    Blog
                    <br />
                    Materiais
                    <br />
                    Cases
                    <br />
                    Newsletters
                  </p>
                </div>
                <div>
                  <p className="text-sm font-black text-white">Empresa</p>
                  <p className="mt-3 space-y-2 text-sm text-white/65">
                    Sobre nós
                    <br />
                    Carreiras
                    <br />
                    Parcerias
                    <br />
                    Contato
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-5 text-right">
                  <p className="text-xs text-white/60">Empresa parceira</p>
                  <p className="mt-2 text-4xl font-black text-white" style={{ fontFamily: 'var(--font-head)' }}>Meta</p>
                  <p className="text-sm text-white/72">Business Partner</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs text-white/60">
                <p>© 2025 NeuroAds. Todos os direitos reservados.</p>
                <div className="flex items-center gap-6">
                  <a href="#">Política de Privacidade</a>
                  <a href="#">Termos de Uso</a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </section>
    </main>
  );
}
