'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Clock3, Eye, Flame } from 'lucide-react';
import type { EditorialOrder, EditorialPost, EditorialTag } from '@/lib/editorial/alem-do-algoritmo';
import { sortPostsByOrder } from '@/lib/editorial/alem-do-algoritmo';

interface Props {
  posts: EditorialPost[];
}

const orderOptions: { key: EditorialOrder; label: string }[] = [
  { key: 'latest24h', label: 'Ultimas 24 horas' },
  { key: 'mostAccessed', label: 'Mais acessadas' },
  { key: 'recent', label: 'Recentes' },
];

function formatPostDate(isoDate: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoDate));
}

export default function EditorialFiltersClient({ posts }: Props) {
  const [order, setOrder] = useState<EditorialOrder>('latest24h');
  const [activeTag, setActiveTag] = useState<string>('Todos');

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    counts.set('Todos', posts.length);
    for (const post of posts) {
      for (const tag of post.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [posts]);

  const visiblePosts = useMemo(() => {
    const byTag = activeTag === 'Todos' ? posts : posts.filter((post) => post.tags.includes(activeTag as EditorialTag));
    return sortPostsByOrder(byTag, order);
  }, [posts, order, activeTag]);

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
        <div className="mb-6 rounded-[24px] border border-[#e5ecf5] bg-white/92 p-5 shadow-[0_12px_30px_rgba(9,24,50,0.08)]">
          <div className="flex flex-wrap items-center gap-2">
            {orderOptions.map((option) => (
              <button
                type="button"
                key={option.key}
                onClick={() => setOrder(option.key)}
                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.11em] transition ${
                  order === option.key
                    ? 'bg-[#ff5f00] text-white shadow-[0_10px_20px_rgba(255,95,0,0.22)]'
                    : 'border border-[#dfe8f2] bg-white text-[#2b3953] hover:border-[#ffd1b7]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {tagCounts.map(([tag, count]) => (
              <button
                type="button"
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  activeTag === tag
                    ? 'border-[#ff5f00] bg-[#fff2e9] text-[#ff5f00]'
                    : 'border-[#dce5ef] bg-white text-[#465674] hover:border-[#ffcca9]'
                }`}
              >
                {tag} ({count})
              </button>
            ))}
          </div>
        </div>

        <motion.div
          layout
          className="grid gap-5 sm:grid-cols-2"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {visiblePosts.map((post, index) => (
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

        <div className="rounded-[24px] border border-[#ffd7c1] bg-[linear-gradient(145deg,#fff8f2_0%,#fff2e8_100%)] p-6">
          <h2 className="text-lg font-black text-[#0f1730]">Template de publicação</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#4b5b74]">
            Todos os conteúdos seguem padrão editorial com SEO + GEO, leitura orientada a caixa e blocos de decisão para equipe comercial.
          </p>
          <p className="mt-4 rounded-xl border border-[#ffd4bc] bg-white/70 px-3 py-2 text-xs font-semibold text-[#4b5b74]">
            Estrutura padrão: contexto do problema → impacto financeiro → execução recomendada → CTA consultiva.
          </p>
        </div>
      </aside>
    </section>
  );
}
