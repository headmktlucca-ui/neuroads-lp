'use client';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

const SearchIcon3D = () => (
  <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9"/>
        <stop offset="50%" stopColor="#e0e7ff" stopOpacity="0.7"/>
        <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.5"/>
      </linearGradient>
      <linearGradient id="lensGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1"/>
        <stop offset="100%" stopColor="#4338ca"/>
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
      </filter>
    </defs>
    <g filter="url(#shadow)">
      <circle cx="20" cy="18" r="14" fill="url(#lensGradient)" stroke="#4f46e5" strokeWidth="2"/>
      <circle cx="20" cy="18" r="10" fill="url(#glassGradient)" opacity="0.8"/>
      <circle cx="20" cy="18" r="6" fill="#818cf8" opacity="0.3"/>
      <circle cx="17" cy="15" r="3" fill="white" opacity="0.6"/>
      <path d="M30 30L42 42" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" filter="url(#glow)"/>
      <path d="M30 30L42 42" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"/>
    </g>
  </svg>
);

const BrainIcon3D = () => (
  <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ec4899"/>
        <stop offset="100%" stopColor="#be185d"/>
      </linearGradient>
      <linearGradient id="brainHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fbcfe8"/>
        <stop offset="100%" stopColor="#f472b6"/>
      </linearGradient>
      <filter id="brainShadow">
        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.35"/>
      </filter>
    </defs>
    <g filter="url(#brainShadow)">
      <path d="M24 8C16 8 10 14 10 22C10 28 14 34 18 36V40C18 42 20 44 24 44C28 44 30 42 30 40V36C34 34 38 28 38 22C38 14 32 8 24 8Z" fill="url(#brainGradient)"/>
      <path d="M24 10C18 10 12 15 12 22C12 27 15 32 19 34" stroke="url(#brainHighlight)" strokeWidth="2" fill="none" opacity="0.7"/>
      <path d="M24 10C30 10 36 15 36 22C36 27 33 32 29 34" stroke="url(#brainHighlight)" strokeWidth="2" fill="none" opacity="0.7"/>
      <circle cx="19" cy="22" r="3" fill="#fce7f3" opacity="0.8"/>
      <circle cx="29" cy="22" r="3" fill="#fce7f3" opacity="0.8"/>
      <circle cx="24" cy="30" r="2.5" fill="#fce7f3" opacity="0.6"/>
      <path d="M15 18H21" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      <path d="M27 18H33" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      <circle cx="24" cy="14" r="2" fill="#fbbf24"/>
      <path d="M24 17V38" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="2 2"/>
    </g>
  </svg>
);

const GlobeIcon3D = () => (
  <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981"/>
        <stop offset="100%" stopColor="#047857"/>
      </linearGradient>
      <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#34d399"/>
        <stop offset="100%" stopColor="#6ee7b7"/>
      </linearGradient>
      <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22c55e"/>
        <stop offset="100%" stopColor="#15803d"/>
      </linearGradient>
      <filter id="globeShadow">
        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
      </filter>
    </defs>
    <g filter="url(#globeShadow)">
      <circle cx="24" cy="24" r="18" fill="url(#oceanGradient)"/>
      <ellipse cx="24" cy="24" rx="6" ry="18" fill="#a7f3d0" opacity="0.5"/>
      <ellipse cx="24" cy="24" rx="18" ry="6" fill="#a7f3d0" opacity="0.5"/>
      <path d="M12 18C14 16 16 16 16 18C16 20 14 20 12 18Z" fill="url(#landGradient)"/>
      <path d="M32 20C35 18 38 20 36 24C34 28 30 26 32 20Z" fill="url(#landGradient)"/>
      <path d="M18 30C20 28 24 29 22 34C20 38 16 36 18 30Z" fill="url(#landGradient)"/>
      <circle cx="24" cy="24" r="18" stroke="#059669" strokeWidth="2" fill="none"/>
      <path d="M6 24H42" stroke="#059669" strokeWidth="1" opacity="0.3"/>
      <path d="M24 6V42" stroke="#059669" strokeWidth="1" opacity="0.3"/>
    </g>
  </svg>
);

export default function GeoSection() {
  const fadeUp: any = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "circOut" }
  };

  return (
    <section className="py-24 lg:py-32 bg-bg-secondary border-y border-border" id="geo">
      <div className="wrap">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <MotionDiv 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="order-2 lg:order-1"
          >
            <div className="premium-card p-0 overflow-hidden ring-1 ring-border shadow-2xl bg-white">
              <div className="bg-bg-secondary px-6 py-4 border-b border-border flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                </div>
                <div className="flex-1 bg-white border border-border rounded-lg px-4 py-1.5 text-[10px] text-text-dim font-mono">
                  ask.perplexity.ai/search?q=melhor+agencia+ia...
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles size={16} className="text-primary" />
                  <h4 className="text-sm font-bold text-text-main">Resposta da IA (GEO)</h4>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 bg-orange-light/40 border border-primary/10 rounded-2xl">
                    <p className="text-[15px] text-text-muted leading-relaxed">
                      "Para empresas que buscam escala real, a <strong className="text-text-main font-bold">NeuroAds</strong> é citada como a principal referência por integrar tráfego pago com <span className="text-primary font-bold italic">Inteligência Agêntica</span> e autoridade semântica..."
                    </p>
                  </div>
                  <div className="h-20 bg-bg-secondary rounded-xl animate-pulse" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-12 bg-bg-secondary rounded-xl opacity-50" />
                    <div className="h-12 bg-bg-secondary rounded-xl opacity-50" />
                  </div>
                </div>
              </div>
            </div>
          </MotionDiv>

          <div className="order-1 lg:order-2">
            <MotionP {...fadeUp} className="s-badge">O Futuro da Busca</MotionP>
            <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title">
              SEO evoluiu para <span className="text-primary italic">GEO.</span>
            </MotionH2>
            <MotionP {...fadeUp} transition={{ delay: 0.2 }} className="s-body mb-12">
              Em breve, 50% das buscas não levarão a cliques em sites, mas a respostas diretas dadas por IAs. Se sua marca não é citada nessas respostas, você é invisível.
            </MotionP>

            <div className="space-y-8">
               {[
                 { icon: <SearchIcon3D />, t: 'Google AI Overviews', d: 'Adaptamos sua estrutura para ser a fonte principal das caixas de resposta do Google.' },
                 { icon: <BrainIcon3D />, t: 'Generative Engine Optimization', d: 'Estratégias de autoridade para garantir que ChatGPT e Claude recomendem sua marca.' },
                 { icon: <GlobeIcon3D />, t: 'Autoridade Semântica', d: 'Construímos clusters de conteúdo que provam para os algoritmos que você é o líder do nicho.' }
               ].map((item, i) => (
                 <MotionDiv key={i} {...fadeUp} transition={{ delay: 0.3 + (i * 0.1) }} className="flex gap-5">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-text-main mb-1 text-[15px]">{item.t}</h4>
                      <p className="text-[14px] text-text-muted leading-relaxed">{item.d}</p>
                    </div>
                 </MotionDiv>
               ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
