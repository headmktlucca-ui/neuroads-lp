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

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="max-w-4xl">
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

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[460px] bg-transparent shadow-none">
                <Image
                  src="/images/editorial/alem-do-algoritmo/bus-quad-clean.png"
                  alt="Bússola estratégica para crescimento previsível"
                  width={820}
                  height={861}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
            </div>
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
