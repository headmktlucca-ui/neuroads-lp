import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import EditorialFiltersClient from '@/components/editorial/EditorialFiltersClient';
import HomePageBackground from '@/components/neuroads/HomePageBackground';
import PrimaryFooter from '@/components/neuroads/PrimaryFooter';
import PrimaryTopMenu from '@/components/neuroads/PrimaryTopMenu';
import { EDITORIAL_TEMPLATE_NAME, getEditorialListingJsonLd, getEditorialPosts } from '@/lib/editorial/alem-do-algoritmo';

const posts = getEditorialPosts();
const listingJsonLd = getEditorialListingJsonLd(posts);

export const metadata: Metadata = {
  title: 'Além do Algoritmo | Insights de SEO + GEO, IA e Vendas para PMEs',
  description:
    'Canal editorial da NeuroAds com conteúdos organizados por sinais de mercado, IA, automação e comercial para construir escala previsível com dados reais.',
  keywords: [
    'alem do algoritmo',
    'seo e geo',
    'ia agentica',
    'automacao comercial pme',
    'crescimento previsivel',
    'neuroads lucca',
  ],
  alternates: {
    canonical: 'https://www.neuroads.com.br/conteudos/alem-do-algoritmo',
  },
  openGraph: {
    title: 'Além do Algoritmo | Canal Editorial NeuroAds',
    description:
      'Notícias, análises e playbooks práticos para PMEs: SEO + GEO, IA agêntica, vendas e operações orientadas a receita.',
    type: 'website',
    url: 'https://www.neuroads.com.br/conteudos/alem-do-algoritmo',
    images: ['https://www.neuroads.com.br/images/tools/servico-seo-geo-hero-ultrarealista-v2.png'],
  },
};

export default function Page() {
  return (
    <main className="relative overflow-hidden bg-white text-[#0f172a]">
      <HomePageBackground />
      <div className="relative z-10">
        <PrimaryTopMenu />
        <div className="h-[84px]" />

        <section className="wrap relative overflow-hidden pb-8 pt-14 sm:pt-18">
          <div className="pointer-events-none absolute -left-20 top-8 h-56 w-56 rounded-full bg-[#ff6a00]/12 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-[#0f1d3f]/10 blur-3xl" />
          <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-[#ff5f00]/6 blur-3xl" />

          <div className="relative z-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div>
              <div className="mb-7 inline-flex items-center rounded-full border border-[#ffd8c2] bg-[#fff5ee] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#ff5f00]">
                Canal Editorial NeuroAds
              </div>

              <h1 className="max-w-5xl text-balance text-4xl font-black leading-[1.04] tracking-[-0.03em] text-[#0f1730] sm:text-5xl md:text-6xl">
                Além do Algoritmo
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#40506a]">
                Estratégia aplicada para empresários que precisam de crescimento previsível. Aqui cada conteúdo traduz SEO + GEO, IA agêntica e performance para impacto real no caixa.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#fff2e9] px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#ff5f00]">
                  <Sparkles size={13} />
                  Widgets inteligentes de leitura
                </span>
                <span className="rounded-full border border-[#dfe8f2] bg-white px-3 py-1.5 text-xs font-semibold text-[#3f4f69]">
                  Filtros por Últimas 24h, Mais acessadas e Tags por tema
                </span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[36px] border border-white/80 bg-white/70 p-6 shadow-[0_40px_80px_rgba(8,22,44,0.12)] backdrop-blur-3xl">
              <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-[#ff6a00]/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 right-6 h-48 w-48 rounded-full bg-[#0f1d3f]/10 blur-3xl" />
              <div className="relative z-10">
                <div className="overflow-hidden rounded-[32px] bg-[#f8fafc]">
                  <Image
                    src="/images/hero/hero-cube-anexo-222.png"
                    alt="Ilustração de alto impacto"
                    width={680}
                    height={560}
                    className="w-full object-cover"
                  />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[24px] bg-[#fff7f1] px-4 py-4 text-sm text-[#3f4f69] shadow-[0_18px_40px_rgba(255,111,0,0.08)]">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff5f00]">Sinal real</p>
                    <p className="mt-2 font-semibold text-[#0f1730]">SEO + GEO com prática comercial.</p>
                  </div>
                  <div className="rounded-[24px] bg-[#f5fbff] px-4 py-4 text-sm text-[#3f4f69] shadow-[0_18px_40px_rgba(15,29,63,0.06)]">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f3f6f]">Impacto direto</p>
                    <p className="mt-2 font-semibold text-[#0f1730]">Conteúdo orientado a receita previsível.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="wrap pb-2">
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-[22px] border border-[#e5ecf5] bg-white/92 p-6 shadow-[0_16px_40px_rgba(9,24,50,0.08)]">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#ff5f00]">Notícias e sinais</p>
              <p className="mt-3 text-[15px] leading-relaxed text-[#23324c]">
                Curadoria para separar tendência de ruído e priorizar decisões de aquisição, comercial e operação.
              </p>
            </article>

            <article className="rounded-[22px] border border-[#e5ecf5] bg-white/92 p-6 shadow-[0_16px_40px_rgba(9,24,50,0.08)]">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#ff5f00]">SEO + GEO aplicado</p>
              <p className="mt-3 text-[15px] leading-relaxed text-[#23324c]">
                Conteúdo desenhado para Google, ChatGPT, Gemini e Perplexity, com foco em intenção comercial e receita.
              </p>
            </article>

            <article className="rounded-[22px] border border-[#e5ecf5] bg-white/92 p-6 shadow-[0_16px_40px_rgba(9,24,50,0.08)]">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#ff5f00]">Template padrão de publicação</p>
              <p className="mt-3 text-[15px] leading-relaxed text-[#23324c]">
                Cada artigo segue o <strong>{EDITORIAL_TEMPLATE_NAME}</strong> para manter clareza, narrativa comercial e otimização SEO/GEO.
              </p>
            </article>
          </div>
        </section>

        <EditorialFiltersClient posts={posts} />

        <section className="wrap pb-16">
          <div className="rounded-[24px] border border-[#ffd7c1] bg-[linear-gradient(145deg,#fff8f2_0%,#fff2e8_100%)] p-6 sm:p-7">
            <h2 className="text-2xl font-black tracking-[-0.02em] text-[#0f1730]">Quer transformar conteúdo em receita previsível?</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#4b5b74]">
              Se hoje sua operação ainda depende de tentativa e erro, fale direto com especialista e receba diagnóstico com prioridade de impacto
              financeiro.
            </p>
            <Link
              href="/a-neuroads/contato"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#ff5f00] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.11em] text-white shadow-[0_14px_32px_rgba(255,95,0,0.28)] transition hover:bg-[#e55600]"
            >
              Solicitar diagnóstico
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(listingJsonLd),
          }}
        />

        <PrimaryFooter />
      </div>
    </main>
  );
}

