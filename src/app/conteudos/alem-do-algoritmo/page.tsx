import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock3, Bot, CircleDollarSign, TrendingUp } from 'lucide-react';
import PrimaryFooter from '@/components/neuroads/PrimaryFooter';
import PrimaryTopMenu from '@/components/neuroads/PrimaryTopMenu';

export const metadata: Metadata = {
  title: 'Além do Algoritmo | Canal de Blog NeuroAds',
  description:
    'Canal editorial da NeuroAds com estratégia aplicada para PMEs: dados reais, GEO, IA agêntica e decisões orientadas a receita.',
};

const categories = [
  { label: 'Performance', description: 'Aquisição, CPL e ROAS traduzidos para caixa.', href: '/servicos/gestao-de-trafego-google-meta' },
  { label: 'SEO + GEO', description: 'Presença em busca clássica e motores generativos.', href: '/servicos/seo-geo' },
  { label: 'Funil Comercial', description: 'Conversão com processo, não no improviso.', href: '/servicos/estrategia-de-funil-e-conversao' },
  { label: 'IA Agêntica', description: 'Agentes de IA supervisionados por especialista.', href: '/servicos/implantacao-de-agentes-ia' },
] as const;

const featuredArticle = {
  title: 'SEO morreu? Não. Ele evoluiu para GEO.',
  excerpt:
    'Como PMEs podem usar conteúdo estruturado para ganhar presença em Google, ChatGPT, Gemini e Perplexity sem depender só de mídia paga.',
  tag: 'Destaque da semana',
  readTime: '8 min',
  dateLabel: '11 Mai 2026',
  href: '/servicos/seo-geo',
};

const articles = [
  {
    title: 'ROAS subiu, mas o caixa ainda aperta: o que está faltando no sistema?',
    excerpt: 'Leitura prática para identificar onde o retorno de mídia não está virando receita previsível.',
    tag: 'Performance',
    readTime: '6 min',
    href: '/conteudos/faq',
  },
  {
    title: 'CPL caiu e as vendas não acompanharam: ajuste de funil sem achismo',
    excerpt: 'Diagnóstico de gargalos entre marketing e comercial para ganhar velocidade sem aumentar risco.',
    tag: 'Funil Comercial',
    readTime: '7 min',
    href: '/servicos/estrategia-de-funil-e-conversao',
  },
  {
    title: 'Agente de IA comercial para PME: quando começa a impactar no financeiro',
    excerpt: 'O que medir nos primeiros 30 dias para provar valor sem promessas vagas.',
    tag: 'IA Agêntica',
    readTime: '5 min',
    href: '/servicos/implantacao-de-agentes-ia',
  },
  {
    title: 'Checklist de governança: pare de operar marketing no escuro',
    excerpt: 'Roteiro objetivo para transformar dados reais em prioridades semanais de execução.',
    tag: 'Dados reais',
    readTime: '4 min',
    href: '/conteudos/materias-de-apoio',
  },
  {
    title: 'Menos ferramentas, mais ecossistema: integração que libera o time',
    excerpt: 'Como reduzir retrabalho e alinhar operação com crescimento previsível.',
    tag: 'Operação',
    readTime: '6 min',
    href: '/a-neuroads/nosso-metodo',
  },
  {
    title: 'Do clique ao contrato: métricas que o empresário precisa acompanhar',
    excerpt: 'Quais indicadores acompanham margem, receita e previsibilidade de escala.',
    tag: 'Gestão',
    readTime: '7 min',
    href: '/servicos/gestao-de-trafego-google-meta',
  },
] as const;

const weeklySignals = [
  {
    icon: TrendingUp,
    title: 'CPL -18,2%',
    description: 'Mais leads no mesmo orçamento aumenta margem de aquisição.',
  },
  {
    icon: CircleDollarSign,
    title: 'ROAS 5,2x',
    description: 'Mídia mais previsível para sustentar caixa e reinvestimento.',
  },
  {
    icon: Bot,
    title: '18 agentes em operação',
    description: 'Automação com supervisão humana para acelerar decisões.',
  },
] as const;

export default function Page() {
  return (
    <main className="site-bg text-[#0f172a]">
      <PrimaryTopMenu />
      <div className="site-bg-media" />
      <div className="site-bg-depth" />
      <div className="site-bg-overlay" />
      <div className="site-bg-sheen" />
      <div className="site-bg-noise" />
      <div className="h-[84px]" />

      <section className="wrap pb-10 pt-16 sm:pt-20">
        <div className="mb-7 inline-flex items-center rounded-full border border-[#ffd8c2] bg-[#fff5ee] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#ff5f00]">
          Canal de Blog NeuroAds
        </div>

        <h1 className="max-w-4xl text-balance text-4xl font-black leading-[1.04] tracking-[-0.03em] text-[#0f1730] sm:text-5xl md:text-6xl">
          Além do Algoritmo
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#40506a]">
          Um canal para empresários que querem escala previsível com dados reais. Aqui o foco é problema, impacto no caixa e solução aplicada.
          Sem teoria vazia e sem promessas genéricas.
        </p>
      </section>

      <section className="wrap pb-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.label}
              href={category.href}
              className="group rounded-[22px] border border-[#e5ecf5] bg-white/92 p-6 shadow-[0_16px_40px_rgba(9,24,50,0.08)] transition hover:-translate-y-0.5 hover:border-[#ffd4bc]"
            >
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#ff5f00]">{category.label}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-[#23324c]">{category.description}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#1f2a44]">
                Ler conteúdos
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap pb-8 pt-5">
        <article className="relative overflow-hidden rounded-[30px] border border-[#e6edf6] bg-white p-8 shadow-[0_28px_60px_rgba(8,22,44,0.1)] sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#ff6a00]/12 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-[#0f1d3f]/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-[0.12em]">
              <span className="rounded-full bg-[#fff1e9] px-3 py-1.5 text-[#ff5f00]">{featuredArticle.tag}</span>
              <span className="inline-flex items-center gap-2 text-[#5f6f88]">
                <CalendarDays size={14} />
                {featuredArticle.dateLabel}
              </span>
              <span className="inline-flex items-center gap-2 text-[#5f6f88]">
                <Clock3 size={14} />
                {featuredArticle.readTime}
              </span>
            </div>

            <h2 className="max-w-4xl text-3xl font-black leading-tight tracking-[-0.02em] text-[#0f1730] sm:text-4xl">
              {featuredArticle.title}
            </h2>
            <p className="max-w-3xl text-base leading-relaxed text-[#3f4f69]">{featuredArticle.excerpt}</p>
            <Link
              href={featuredArticle.href}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[#ffccb0] bg-[#fff7f2] px-5 py-3 text-sm font-black text-[#ff5f00] transition hover:bg-[#fff0e6]"
            >
              Ler matéria completa
              <ArrowRight size={14} />
            </Link>
          </div>
        </article>
      </section>

      <section className="wrap grid gap-8 pb-16 pt-7 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.title}
              className="flex h-full flex-col rounded-[24px] border border-[#e4ebf4] bg-white/92 p-6 shadow-[0_16px_34px_rgba(11,23,44,0.08)]"
            >
              <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#ff5f00]">{article.tag}</span>
              <h3 className="mt-3 text-[21px] font-black leading-tight tracking-[-0.01em] text-[#10203d]">{article.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#4d5d78]">{article.excerpt}</p>
              <div className="mt-auto flex items-center justify-between pt-5">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#61708a]">
                  <Clock3 size={13} />
                  {article.readTime}
                </span>
                <Link href={article.href} className="inline-flex items-center gap-2 text-sm font-bold text-[#1f2a44]">
                  Acessar
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-5">
          <div className="rounded-[24px] border border-[#dfe7f1] bg-white/95 p-6 shadow-[0_18px_38px_rgba(9,23,44,0.08)]">
            <h2 className="text-lg font-black text-[#0f1730]">Sinais da semana</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#4d5c75]">
              Métricas traduzidas para linguagem financeira. Menos vaidade, mais decisão.
            </p>
            <div className="mt-5 space-y-4">
              {weeklySignals.map((signal) => (
                <div key={signal.title} className="rounded-2xl border border-[#edf2f8] bg-[#fbfdff] p-4">
                  <div className="flex items-center gap-3">
                    <signal.icon size={18} className="text-[#ff5f00]" />
                    <p className="text-sm font-black text-[#12213d]">{signal.title}</p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#51617a]">{signal.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#ffd7c1] bg-[linear-gradient(145deg,#fff8f2_0%,#fff2e8_100%)] p-6">
            <h2 className="text-lg font-black text-[#0f1730]">Quer aplicar na sua operação?</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#4b5b74]">
              Se hoje você investe e ainda não tem previsibilidade, fale com especialista e receba um diagnóstico com prioridade de impacto no caixa.
            </p>
            <Link
              href="/a-neuroads/contato"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#ff5f00] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.11em] text-white shadow-[0_14px_32px_rgba(255,95,0,0.28)] transition hover:bg-[#e55600]"
            >
              Solicitar diagnóstico
              <ArrowRight size={14} />
            </Link>
          </div>
        </aside>
      </section>

      <PrimaryFooter />
    </main>
  );
}

