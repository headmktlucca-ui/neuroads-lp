import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Eye, Globe2 } from 'lucide-react';
import HomePageBackground from '@/components/neuroads/HomePageBackground';
import PrimaryFooter from '@/components/neuroads/PrimaryFooter';
import PrimaryTopMenu from '@/components/neuroads/PrimaryTopMenu';
import { getEditorialPostBySlug, getEditorialPostJsonLd, getEditorialPosts, getEditorialPostUrl } from '@/lib/editorial/alem-do-algoritmo';

type Params = {
  slug: string;
};

interface PageProps {
  params: Promise<Params>;
}

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDate));
}

export async function generateStaticParams() {
  return getEditorialPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getEditorialPostBySlug(slug);
  if (!post) {
    return {
      title: 'Conteúdo não encontrado | Além do Algoritmo',
      robots: { index: false, follow: false },
    };
  }

  const canonical = getEditorialPostUrl(post.slug);
  const coverAbs = `https://www.neuroads.com.br${post.coverImage}`;
  const midAbs = `https://www.neuroads.com.br${post.midImage}`;
  return {
    title: `${post.title} | Além do Algoritmo`,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: canonical,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      tags: post.tags,
      images: [coverAbs, midAbs],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [coverAbs],
    },
  };
}

export default async function EditorialPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getEditorialPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = getEditorialPostJsonLd(post);

  return (
    <main className="relative overflow-hidden bg-white text-[#0f172a]">
      <HomePageBackground />
      <div className="relative z-10">
        <PrimaryTopMenu />
        <div className="h-[84px]" />

        <article className="wrap pb-16 pt-12 sm:pt-16">
          <Link
            href="/conteudos/alem-do-algoritmo"
            className="mb-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#ff5f00]"
          >
            <ArrowLeft size={14} />
            Voltar para o canal
          </Link>

          <header className="rounded-[30px] border border-[#e6edf6] bg-white/95 p-7 shadow-[0_28px_60px_rgba(8,22,44,0.1)] sm:p-10">
            <div className="flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <span key={`${post.slug}-${tag}`} className="rounded-full bg-[#fff2e9] px-3 py-1 text-[10px] font-black uppercase tracking-[0.11em] text-[#ff5f00]">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="mt-5 max-w-4xl text-balance text-4xl font-black leading-[1.04] tracking-[-0.03em] text-[#0f1730] sm:text-5xl">
              {post.title}
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#40506a]">{post.description}</p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-[#5f6f88]">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={14} />
                {formatDate(post.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 size={14} />
                {post.readTimeMinutes} min de leitura
              </span>
              <span className="inline-flex items-center gap-2">
                <Eye size={14} />
                {post.viewsTotal.toLocaleString('pt-BR')} visualizações
              </span>
            </div>
          </header>

          <div className="mt-8 overflow-hidden rounded-[28px] border border-[#e5ecf5] bg-white/90 shadow-[0_18px_44px_rgba(9,24,50,0.08)]">
            <div className="relative h-[250px] sm:h-[380px]">
              <Image src={post.coverImage} alt={post.coverAlt} fill className="object-cover" sizes="100vw" priority />
            </div>
          </div>

          <div className="mt-10 grid gap-9 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-8">
              {post.sections.map((section, index) => (
                <section key={`${post.slug}-${section.heading}`} className="rounded-[24px] border border-[#e5ecf5] bg-white/92 p-6 shadow-[0_16px_32px_rgba(11,23,44,0.07)]">
                  <h2 className="text-2xl font-black tracking-[-0.02em] text-[#10203d]">{section.heading}</h2>
                  <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#3f4f69]">
                    {section.paragraphs.map((paragraph) => (
                      <p key={`${section.heading}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
                    ))}
                  </div>
                  {section.bullets && section.bullets.length > 0 ? (
                    <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#33435f]">
                      {section.bullets.map((bullet) => (
                        <li key={`${section.heading}-${bullet}`} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#ff5f00]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {index === 1 ? (
                    <div className="mt-7 overflow-hidden rounded-[20px] border border-[#dde8f4]">
                      <div className="relative h-[220px] sm:h-[320px]">
                        <Image src={post.midImage} alt={post.midAlt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" />
                      </div>
                    </div>
                  ) : null}
                </section>
              ))}
            </div>

            <aside className="space-y-5">
              <div className="rounded-[24px] border border-[#dfe7f1] bg-white/95 p-6 shadow-[0_18px_38px_rgba(9,23,44,0.08)]">
                <h2 className="text-lg font-black text-[#0f1730]">Otimização SEO + GEO</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#4d5c75]">
                  Este conteúdo foi estruturado para busca clássica e motores generativos com foco em intenção comercial.
                </p>
                <div className="mt-4 space-y-2">
                  {post.geoFocus.map((focus) => (
                    <p key={focus} className="inline-flex items-center gap-2 rounded-full border border-[#e8eff8] bg-[#fbfdff] px-3 py-1.5 text-xs font-semibold text-[#41506a]">
                      <Globe2 size={12} className="text-[#ff5f00]" />
                      {focus}
                    </p>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#ffd7c1] bg-[linear-gradient(145deg,#fff8f2_0%,#fff2e8_100%)] p-6">
                <h2 className="text-lg font-black text-[#0f1730]">Aplicar no seu ecossistema</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#4b5b74]">
                  Se você quer transformar esse playbook em crescimento previsível no seu negócio, fale com especialista.
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
          </div>
        </article>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />

        <PrimaryFooter />
      </div>
    </main>
  );
}
