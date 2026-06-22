'use client';

import { motion, Variants } from 'framer-motion';
import { ArrowRight, BookOpen, Clock, Calendar, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const blogPosts = [
  {
    id: 1,
    title: 'A Era da IA Agêntica no Marketing de Alta Performance',
    excerpt: 'Como os agentes autônomos estão substituindo tarefas manuais repetitivas e tomando decisões baseadas em dados em tempo real para otimização de campanhas.',
    category: 'Inteligência Artificial',
    author: 'Lucca',
    date: '21 Jun 2026',
    readTime: '5 min',
    image: '/images/segment-backgrounds/ecommerce-varejo-bg.png',
    featured: true
  },
  {
    id: 2,
    title: 'ROAS vs LTV: Por que olhar apenas para o retorno diário vai quebrar sua operação',
    excerpt: 'Análise aprofundada sobre a mudança de paradigma na métrica principal de sucesso para e-commerces B2C.',
    category: 'Estratégia',
    author: 'Thiago Almeida',
    date: '18 Jun 2026',
    readTime: '8 min',
    image: '/images/segment-backgrounds/saude-clinicas-bg.png',
    featured: false
  },
  {
    id: 3,
    title: 'Otimização Preditiva no Google Ads: Reduzindo o CPL em 18%',
    excerpt: 'Estudo de caso de como o agente "Auditor de Desperdício" conseguiu reverter um cenário de inflação de cliques no Google Ads.',
    category: 'Cases de Sucesso',
    author: 'Flávio Almeida',
    date: '15 Jun 2026',
    readTime: '4 min',
    image: '/images/segment-backgrounds/mercado-imobiliario-bg.png',
    featured: false
  },
  {
    id: 4,
    title: 'SEO + GEO: O futuro orgânico além da barra de busca do Google',
    excerpt: 'Preparando seu site e sua marca para serem referenciados nas respostas do ChatGPT, Gemini e outros LLMs.',
    category: 'Tendências',
    author: 'Lucca',
    date: '10 Jun 2026',
    readTime: '6 min',
    image: '/images/segment-backgrounds/servicos-profissionais-bg.png',
    featured: false
  }
];

export default function AlemDoAlgoritmoPage() {
  const featuredPost = blogPosts.find(p => p.featured) || blogPosts[0];
  const regularPosts = blogPosts.filter(p => !p.featured);

  return (
    <main className="relative min-h-screen bg-[#040811] text-white overflow-hidden pt-32 pb-24">
      {/* Background radial overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 600px 600px at 25% 0%, rgba(255,106,0,0.06) 0%, transparent 70%)',
            'radial-gradient(ellipse 700px 700px at 75% 35%, rgba(18,40,76,0.10) 0%, transparent 70%)',
            'radial-gradient(ellipse 500px 500px at 33% 100%, rgba(255,106,0,0.03) 0%, transparent 70%)',
          ].join(', '),
        }}
      />
      
      {/* Header Grid Line patterns */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1260px] px-5 md:px-8">
        
        {/* HERO SECTION */}
        <motion.div
          variants={revealVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-[800px] mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-md border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-3 py-1 mb-6">
            <BookOpen size={14} className="text-[#ff6a00]" />
            <span className="text-[13px] font-bold text-[#ff8f3a]">
              Blog Oficial
            </span>
          </span>
          <h1 className="text-[40px] md:text-[52px] font-black leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
            Além do <span className="text-[#ff6a00]">Algoritmo</span>
          </h1>
          <p className="mt-6 text-[16px] sm:text-[18px] text-white/80 leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)] max-w-[600px] mx-auto">
            Ideias, tendências e dados sobre Gestão de Tráfego, IA Agêntica e como o futuro do marketing está sendo construído agora.
          </p>
        </motion.div>

        {/* FEATURED POST */}
        <motion.div
          variants={revealVariants}
          initial="hidden"
          animate="visible"
          className="mb-16 group relative rounded-2xl border border-white/5 bg-zinc-950/90 overflow-hidden transition-all hover:border-[#ff6a00]/30 hover:shadow-[0_8px_32px_rgba(255,106,0,0.1)]"
        >
          <div className="grid lg:grid-cols-2 items-center">
            <div className="relative h-[300px] lg:h-[480px] w-full overflow-hidden">
              <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-transparent transition-colors duration-500" />
              <Image 
                src={featuredPost.image} 
                alt={featuredPost.title} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105" 
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="p-8 lg:p-14 flex flex-col justify-center h-full">
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-block rounded-md border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-3 py-1 text-[12px] font-bold text-[#ff8f3a]">
                  {featuredPost.category}
                </span>
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400">
                  <Clock size={12} /> {featuredPost.readTime}
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-5 group-hover:text-[#ff8f3a] transition-colors">
                <Link href="#" className="before:absolute before:inset-0">
                  {featuredPost.title}
                </Link>
              </h2>
              <p className="text-slate-300 text-[15px] leading-relaxed mb-8">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-[#ff6a00]">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-white leading-none">{featuredPost.author}</p>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                      <Calendar size={10} /> {featuredPost.date}
                    </p>
                  </div>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white group-hover:bg-[#ff6a00] transition-colors">
                  <ArrowRight size={16} />
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* REGULAR POSTS GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post, index) => (
            <motion.article
              key={post.id}
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              className="group relative rounded-xl border border-white/5 bg-zinc-950/90 overflow-hidden transition-all hover:border-[#ff6a00]/30 hover:bg-white/5 hover:shadow-[0_4px_24px_rgba(255,106,0,0.08)] flex flex-col"
            >
              <div className="relative h-[220px] w-full overflow-hidden">
                <Image 
                  src={post.image} 
                  alt={post.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" 
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
              <div className="p-7 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-block rounded-md border border-[#ff6a00]/20 bg-[#ff6a00]/5 px-2.5 py-1 text-[11px] font-bold text-[#ff8f3a]">
                    {post.category}
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-white leading-snug mb-3 group-hover:text-[#ff8f3a] transition-colors">
                  <Link href="#" className="before:absolute before:inset-0">
                    {post.title}
                  </Link>
                </h3>
                <p className="text-slate-400 text-[13px] leading-relaxed mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-auto">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-bold text-slate-300">{post.author}</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <Clock size={12} /> {post.readTime}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </main>
  );
}
