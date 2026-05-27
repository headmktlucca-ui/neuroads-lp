'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Clock3, Eye, Flame } from 'lucide-react';
import type { EditorialPost } from '@/lib/editorial/alem-do-algoritmo';
import NewsletterSignup from './NewsletterSignup';


function formatPostDate(isoDate: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoDate));
}

export default function EditorialFiltersClient({ posts }: { posts: EditorialPost[] }) {
  const latestPost = posts[0];
  const otherPosts = posts.slice(1);

  const maisLidas = [
    {
      number: 1,
      title: 'IA generativa no marketing: como usar com estratégia',
      image: '/images/tools/servico-implantacao-agentes-hero-ultrarealista-v2.png',
      href: '/conteudos/alem-do-algoritmo/ia-agentica-no-comercial-sem-perder-controle-humano',
    },
    {
      number: 2,
      title: 'Dashboards que geram decisão, não só relatórios',
      image: '/images/tools/servico-funil-conversao-hero-ultrarealista-v2.png',
      href: '/conteudos/alem-do-algoritmo/cpl-baixo-sem-venda-o-gargalo-esta-no-funil',
    },
    {
      number: 3,
      title: 'Dados primários: o ativo mais valioso do futuro',
      image: '/images/tools/agentes-inteligencia-dados-hero-ultrarealista-v2.png',
      href: '/conteudos/alem-do-algoritmo/seo-geo-para-pme-que-quer-escala-previsivel',
    },
    {
      number: 4,
      title: 'Automação com inteligência: o novo padrão de escala',
      image: '/images/tools/automacao.png',
      href: '/conteudos/alem-do-algoritmo/operacao-comercial-com-menos-ferramenta-e-mais-sistema',
    },
  ];

  const top24h = useMemo(
    () =>
      posts
        .slice()
        .sort((a, b) => b.views24h - a.views24h)
        .slice(0, 4),
    [posts]
  );

  return (
    <section className="wrap grid gap-8 pb-16 pt-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        {/* Featured Post (Latest Published Content) */}
        {latestPost && (
          <div className="mb-10 overflow-hidden rounded-[24px] border border-[#e4ebf4] bg-white p-6 shadow-[0_16px_34px_rgba(11,23,44,0.06)] transition hover:shadow-[0_20px_40px_rgba(11,23,44,0.1)]">
            <div className="grid gap-6 md:grid-cols-12 items-center">
              <div className="relative h-64 md:col-span-5 w-full overflow-hidden rounded-2xl">
                <Image
                  src={latestPost.coverImage}
                  alt={latestPost.coverAlt}
                  fill
                  className="object-cover transition duration-500 hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 40vw"
                  priority
                />
              </div>

              <div className="md:col-span-7 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {latestPost.tags.slice(0, 3).map((tag) => (
                    <span key={`featured-${tag}`} className="rounded-full bg-[#fff3ea] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.11em] text-[#ff5f00]">
                      {tag}
                    </span>
                  ))}
                </div>

                <h2 className="text-2xl font-black leading-tight tracking-[-0.02em] text-[#10203d]">
                  {latestPost.title}
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-[#4d5d78]">
                  {latestPost.excerpt}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#61708a]">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={13} />
                    {formatPostDate(latestPost.publishedAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={13} />
                    {latestPost.readTimeMinutes} min
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Eye size={13} />
                    {latestPost.viewsTotal.toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="mt-5">
                  <Link
                    href={`/conteudos/alem-do-algoritmo/${latestPost.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[#ff5f00] px-5 py-2.5 text-xs font-extrabold uppercase tracking-[0.11em] text-white transition hover:bg-[#e55600] shadow-[0_8px_20px_rgba(255,95,0,0.2)]"
                  >
                    Ler conteúdo completo
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <motion.div
          layout
          className="grid gap-5 sm:grid-cols-2"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {otherPosts.map((post, index) => (
            <motion.article
              layout
              key={post.slug}
              className="group overflow-hidden rounded-[24px] border border-[#e4ebf4] bg-white/95 shadow-[0_16px_34px_rgba(11,23,44,0.08)]"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3, ease: 'easeOut' }}
            >
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.coverAlt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index < 2}
                />
              </div>

              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={`${post.slug}-${tag}`} className="rounded-full bg-[#fff3ea] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.11em] text-[#ff5f00]">
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="mt-3 text-[21px] font-black leading-tight tracking-[-0.01em] text-[#10203d]">{post.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#4d5d78]">{post.excerpt}</p>

                <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#61708a]">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={13} />
                    {formatPostDate(post.publishedAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={13} />
                    {post.readTimeMinutes} min
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Eye size={13} />
                    {post.viewsTotal.toLocaleString('pt-BR')}
                  </span>
                </div>

                <Link
                  href={`/conteudos/alem-do-algoritmo/${post.slug}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#1f2a44] transition group-hover:text-[#ff5f00]"
                >
                  Ler conteúdo completo
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>

      <aside className="space-y-5">
        <div className="rounded-[24px] border border-[#dfe7f1] bg-white/95 p-6 shadow-[0_18px_38px_rgba(9,23,44,0.08)]">
          <h2 className="inline-flex items-center gap-2 text-lg font-black text-[#0f1730]">
            <Flame size={18} className="text-[#ff5f00]" />
            Radar 24h
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#4d5c75]">
            Conteúdos com maior tração nas últimas 24 horas.
          </p>

          <div className="mt-5 space-y-3">
            {top24h.map((post) => (
              <Link
                key={`radar-${post.slug}`}
                href={`/conteudos/alem-do-algoritmo/${post.slug}`}
                className="block rounded-2xl border border-[#edf2f8] bg-[#fbfdff] p-4 transition hover:border-[#ffd4bc]"
              >
                <p className="text-sm font-black text-[#12213d]">{post.title}</p>
                <p className="mt-1 text-xs text-[#5b6a84]">{post.views24h.toLocaleString('pt-BR')} acessos em 24h</p>
              </Link>
            ))}
          </div>
        </div>

        <NewsletterSignup />

        {/* Mais Lidas */}
        <div className="rounded-[24px] border border-[#dfe7f1] bg-white/95 p-6 shadow-[0_18px_38px_rgba(9,23,44,0.08)]">
          <h2 className="text-lg font-black text-[#0f1730] uppercase tracking-wider mb-5">
            Mais Lidas
          </h2>

          <div className="space-y-4">
            {maisLidas.map((item) => (
              <Link
                key={`mais-lidas-${item.number}`}
                href={item.href}
                className="group flex gap-4 items-center transition"
              >
                <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-xl border border-[#e2e8f0]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                    sizes="64px"
                  />
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="text-xl font-black text-[#64748b] leading-none pt-0.5">
                    {item.number}
                  </span>
                  <p className="text-sm font-bold text-[#1e293b] leading-snug transition group-hover:text-[#ff5f00]">
                    {item.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}
