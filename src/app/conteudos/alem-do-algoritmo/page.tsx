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

        <section className="relative overflow-hidden bg-transparent pb-8 pt-14 sm:pt-18">
          <div className="wrap relative z-10 grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="max-w-4xl">
              <h1 className="max-w-5xl text-balance text-4xl font-black leading-[1.12] tracking-[-0.03em] sm:text-5xl md:text-6xl grad-text-animated pb-3">
                Além do Algoritmo
              </h1>

              <div className="mt-2 h-[3px] w-24 rounded-full bg-gradient-to-r from-[#ff5f00] to-[#ff9f00]" />

              <p className="mt-8 max-w-3xl text-[17px] font-medium leading-relaxed text-[#40506a] sm:text-lg">
                Estratégia aplicada para empresários que precisam de crescimento previsível. Aqui cada conteúdo traduz{' '}
                <span className="bg-gradient-to-r from-[#ff5f00] to-[#ff9f00] bg-clip-text text-transparent font-extrabold">SEO + GEO</span>,{' '}
                <span className="bg-gradient-to-r from-[#ff5f00] to-[#ff9f00] bg-clip-text text-transparent font-extrabold">IA agêntica</span>{' '}
                e{' '}
                <span className="bg-gradient-to-r from-[#ff5f00] to-[#ff9f00] bg-clip-text text-transparent font-extrabold">performance</span>{' '}
                para impacto real no caixa.
              </p>
            </div>

            <div className="relative flex justify-center lg:justify-end mt-8 lg:mt-0">
              <div className="relative flex justify-center lg:w-[320px]">
                <div className="relative w-[192px] h-[235px] sm:w-[216px] sm:h-[264px] lg:w-[216px] lg:h-[264px]">
                  <Image
                    src="/images/cp_lp.png"
                    alt="Especialista e Cérebro de IA"
                    fill
                    sizes="(max-width: 768px) 216px, 216px"
                    className="object-contain hover:scale-[1.03] transition-transform duration-500 ease-out"
                    priority
                  />
                </div>
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
