'use client';

import Image from 'next/image';
import { BarChart3, Cpu, LineChart, Megaphone, Network, TrendingUp } from 'lucide-react';

const featureCards = [
  { title: 'Data Analyst', desc: 'Detalhes orientados para o aumento de performance.', icon: <Network size={20} /> },
  { title: 'Campaign Manager', desc: 'Campanhas neurais de alta precisão.', icon: <Megaphone size={20} /> },
  { title: 'Desk Manager', desc: 'Execução centralizada do ecossistema.', icon: <BarChart3 size={20} /> },
  { title: 'Integration Specialist', desc: 'Integrações em tempo real com seu stack.', icon: <Cpu size={20} /> },
  { title: 'Reporting AI', desc: 'Diagnósticos automatizados para decisão.', icon: <LineChart size={20} /> },
];

const caseCards = [
  { brand: 'Capitol', metricA: '+45%', metricALabel: 'ROI', metricB: '+120%', metricBLabel: 'Leads' },
  { brand: 'Shopify', metricA: '+45%', metricALabel: 'ROI', metricB: '+120%', metricBLabel: 'Leads' },
  { brand: 'Crossover', metricA: '+45%', metricALabel: 'ROI', metricB: '5x', metricBLabel: 'Conversion Rate' },
  { brand: 'MyTeam', metricA: '+45%', metricALabel: 'ROI', metricB: '5x', metricBLabel: 'Conversion Rate' },
];

const plans = [
  { name: 'Basic', price: 'R$ 48', period: '/mês', cta: 'CRIAR AGENTE', featured: false },
  { name: 'Pro', price: 'R$ 150', period: '/mês', cta: 'CRIAR AGENTE', featured: true },
  { name: 'Enterprise', price: 'R$ 2000', period: '/mês', cta: 'CRIAR AGENTE', featured: false },
];

export default function TemplateLandingPage() {
  return (
    <main className="bg-[#f8f8f6] text-[#141414]">
      <section
        id="inicio"
        className="relative overflow-hidden rounded-b-[42px] bg-[#0b1019] text-white"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(7,10,16,0.92) 0%, rgba(7,10,16,0.74) 36%, rgba(7,10,16,0.28) 62%, rgba(7,10,16,0.4) 100%), url('/images/template-reference.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="mx-auto max-w-[1280px] px-6 pb-20 pt-7 sm:px-10">
          <header className="rounded-full border border-white/10 bg-[#0e121d]/75 px-6 py-3 backdrop-blur">
            <div className="flex items-center justify-between gap-6">
              <a href="#inicio" className="flex items-center gap-2">
                <Image src="/images/Logos/LLNeuroAds.png" alt="NeuroAds" width={110} height={28} className="h-7 w-auto" />
              </a>
              <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
                <a href="#inicio" className="border-b border-[#f0824c] pb-1 text-[#f0824c]">Início</a>
                <a href="#agentes" className="hover:text-white">Agentes</a>
                <a href="#cases" className="hover:text-white">Cases</a>
                <a href="#contato" className="hover:text-white">Contato</a>
                <a href="#login" className="hover:text-white">Login</a>
              </nav>
              <button className="rounded-xl bg-[#f0824c] px-4 py-2 text-xs font-bold tracking-wide text-[#1a1a1a]">
                SOLIC. AGENTE
              </button>
            </div>
          </header>

          <div className="grid min-h-[520px] items-center py-12 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="max-w-[560px]">
              <h1 className="text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl">
                DESBLOQUEIE O
                <br />
                POTENCIAL DE
                <br />
                SUA OPERAÇÃO.
              </h1>
              <p className="mt-6 max-w-[420px] text-base leading-relaxed text-white/72">
                Inteligência Artificial de Alta Performance. Agentes IA que aprendem, conectam e impulsionam seus resultados.
              </p>
            </div>
            <div />
          </div>
        </div>
      </section>

      <section id="agentes" className="relative mx-auto max-w-[1280px] px-6 py-16 sm:px-10">
        <div className="mb-10 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="max-w-[380px]">
            <h2 className="text-4xl font-bold leading-tight">Adaptive Neural Networks</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#4f4f4f]">
              Inteligência artificial de alta performance multiagente para sua operação comercial.
            </p>
          </div>
          <div>
            <div className="grid gap-4 md:grid-cols-3">
              {featureCards.slice(0, 3).map((item) => (
                <article key={item.title} className="rounded-2xl border border-[#ececec] bg-white p-4 shadow-[0_12px_28px_rgba(0,0,0,0.06)]">
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#ffe7db] text-[#ec7a44]">{item.icon}</div>
                  <h3 className="text-[15px] font-bold">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#6e6e6e]">{item.desc}</p>
                </article>
              ))}
            </div>
            <div className="mt-4 grid max-w-[68%] gap-4 md:grid-cols-2">
              {featureCards.slice(3).map((item) => (
                <article key={item.title} className="rounded-2xl border border-[#ececec] bg-white p-4 shadow-[0_12px_28px_rgba(0,0,0,0.06)]">
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#ffe7db] text-[#ec7a44]">{item.icon}</div>
                  <h3 className="text-[15px] font-bold">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#6e6e6e]">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="cases"
        className="mx-auto max-w-[1280px] overflow-hidden rounded-[34px] border border-[#252a34] bg-[#0d121b] px-6 py-14 text-white sm:px-10"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(13,18,27,0.92), rgba(13,18,27,0.92)), url('/images/backgound_grade.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h2 className="text-center text-4xl font-black">CASOS DE SUCESSO</h2>
        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {caseCards.map((item) => (
            <article key={item.brand} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-white/70">{item.brand}</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-4xl font-black text-[#f0824c]">{item.metricA}</p>
                  <p className="mt-1 text-xs text-white/60">{item.metricALabel}</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-[#f0824c]">{item.metricB}</p>
                  <p className="mt-1 text-xs text-white/60">{item.metricBLabel}</p>
                </div>
              </div>
              <p className="mt-6 text-xs leading-relaxed text-white/50">
                Crescimento consistente com estratégia orientada por dados reais.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-16 sm:px-10">
        <h2 className="text-center text-4xl font-black">COMO FUNCIONA O APRENDIZADO IA</h2>
        <div className="mt-10 grid gap-6 text-center md:grid-cols-4">
          {[
            { icon: <Network size={34} />, title: 'Integration', text: 'Conectamos seus canais e centralizamos os dados.' },
            { icon: <Megaphone size={34} />, title: 'Learning', text: 'A IA aprende padrões e oportunidades de escala.' },
            { icon: <Cpu size={34} />, title: 'Optimization', text: 'O sistema ajusta campanhas e rotas comerciais.' },
            { icon: <TrendingUp size={34} />, title: 'Results', text: 'Ganhos mensuráveis em conversão e receita.' },
          ].map((item) => (
            <article key={item.title} className="rounded-2xl bg-white/70 p-6">
              <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#ffe7db] text-[#ec7a44]">{item.icon}</div>
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-[#5f5f5f]">{item.text}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-12 grid max-w-[820px] gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className={`rounded-2xl border p-5 text-center shadow-sm ${plan.featured ? 'border-[#f0824c] bg-[#fff7f2]' : 'border-[#e8e8e8] bg-white'}`}>
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="mt-4 text-4xl font-black">{plan.price}<span className="text-base font-semibold text-[#666]">{plan.period}</span></p>
              <button className={`mt-5 w-full rounded-xl py-3 text-sm font-bold ${plan.featured ? 'bg-[#f0824c] text-white' : 'bg-[#0e1420] text-white'}`}>
                {plan.cta}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section
        id="contato"
        className="mx-auto mb-8 max-w-[1280px] overflow-hidden rounded-[34px] border border-[#252a34] bg-[#0d121b] px-6 py-12 text-white sm:px-10"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(13,18,27,0.9), rgba(13,18,27,0.9)), url('/images/backgound_grade.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-5xl font-black leading-tight">FALE COM UM ESPECIALISTA</h2>
            <p className="mt-4 text-sm text-white/65">
              Inteligência artificial de alta performance para o crescimento previsível da sua operação.
            </p>
          </div>
          <form className="grid gap-3">
            <input type="text" placeholder="Nome" className="h-12 rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-white/45" />
            <input type="email" placeholder="E-mail" className="h-12 rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-white/45" />
            <textarea placeholder="Conte sua situação" className="h-24 rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-white/45" />
            <button className="h-12 rounded-xl bg-[#f0824c] text-sm font-black tracking-wide text-[#171717]">ENVIAR</button>
          </form>
        </div>
      </section>

      <footer id="login" className="relative z-10 w-full overflow-hidden text-white border-t border-white/5 bg-[#0b1019]/95 backdrop-blur-xl">
        <div className="relative z-10 mx-auto max-w-[1260px] px-5 py-12 md:px-8">
          <div className="grid gap-8 border-b border-[#e6e6e6]/20 pb-8 md:grid-cols-5">
          <div>
            <h4 className="text-sm font-black uppercase">Soluções</h4>
            <p className="mt-3 text-sm text-[#676767]">Agentes</p>
            <p className="mt-2 text-sm text-[#676767]">Administrativo</p>
          </div>
          <div>
            <h4 className="text-sm font-black uppercase">Empresa</h4>
            <p className="mt-3 text-sm text-[#676767]">Sobre</p>
            <p className="mt-2 text-sm text-[#676767]">Carreiras</p>
          </div>
          <div>
            <h4 className="text-sm font-black uppercase">Recursos</h4>
            <p className="mt-3 text-sm text-[#676767]">Blog</p>
            <p className="mt-2 text-sm text-[#676767]">FAQ</p>
          </div>
          <div>
            <h4 className="text-sm font-black uppercase">Legal</h4>
            <p className="mt-3 text-sm text-[#676767]">Privacidade</p>
            <p className="mt-2 text-sm text-[#676767]">Termos</p>
          </div>
          <div>
            <h4 className="text-sm font-black uppercase">Social</h4>
            <p className="mt-3 text-sm text-[#676767]">Facebook · Instagram · LinkedIn</p>
          </div>
        </div>
        </div>
        <p className="pt-5 text-center text-xs text-[#7a7a7a]">Minimal pattern · Copyright NeuroAds</p>
      </footer>
    </main>
  );
}

