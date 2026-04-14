'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH1 = motion.h1;

export default function HeroSection() {
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] as const }
  });

  return (
    <section className="hero relative min-h-[92vh] flex items-center py-24 lg:py-0 overflow-hidden">
      {/* Grid Background with Mask */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,111,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(59,111,255,0.06)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_30%,black_20%,transparent_80%)]" />
      </div>

      <div className="wrap relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-16 lg:gap-32 items-center">
          
          {/* LEFT CONTENT */}
          <div className="hero-left">

            <MotionH1 {...fadeUp(0.25)} className="font-head text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] text-text-1 mb-6 text-balance">
              Sua empresa merece<br />
              um marketing que<br />
              <span className="grad-text italic">realmente funciona.</span>
            </MotionH1>

            <MotionP {...fadeUp(0.4)} className="text-[1.05rem] text-text-2 font-light leading-[1.8] max-w-[540px] mb-9">
              Capturamos a atenção no momento ideal e construímos a sua autoridade: nossa solução integra anúncios otimizados, presença dominante no Google e IAs (GEO), com agentes IA e automações integradas no comercial. Um ecossistema desenhado para lucro previsível.
            </MotionP>

            <MotionDiv {...fadeUp(0.55)} className="flex flex-wrap gap-[0.875rem]">
              <a href="#contato" className="btn btn-primary no-underline">
                Quero um diagnóstico gratuito →
              </a>
              <a href="#claudio" className="btn btn-ghost no-underline">
                Conheça nossa origem
              </a>
            </MotionDiv>

            <MotionDiv {...fadeUp(0.7)} className="flex items-center gap-[0.875rem] mt-10 pt-8 border-t border-white/10">
              <div className="flex">
                {['AS', 'RC', 'FM', 'JP'].map((initials, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full bg-grad-main border-2 border-[#05060F] flex items-center justify-center font-bold text-[0.6rem] text-white ${i > 0 ? '-ml-2' : ''}`}>
                    {initials}
                  </div>
                ))}
              </div>
              <div className="text-[0.78rem] text-text-3 leading-tight">
                <span className="text-amber-s">★★★★★</span><br />
                Avaliação 5 estrelas por clientes PMEs em todo o Brasil
              </div>
            </MotionDiv>
          </div>

          {/* RIGHT — CLAUDIO CARD */}
          <MotionDiv 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative hidden lg:block"
          >
            {/* Float Metrics */}
            <div className="absolute -top-16 -left-16 bg-white/[0.04] border border-white/[0.08] backdrop-blur-md rounded-md p-[0.875rem_1.1rem] shadow-card z-20">
              <div className="font-head text-[1.5rem] font-extrabold grad-text leading-none">R$10M+</div>
              <div className="text-[0.65rem] text-text-4 uppercase tracking-[0.1em] mt-1">Investimento gerenciado</div>
              <div className="text-[0.7rem] text-green-s font-semibold mt-1">↑ Comprovado em campanhas reais</div>
            </div>

            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden backdrop-blur-lg shadow-[var(--shadow-card),_var(--shadow-glow)] relative z-10">
              {/* Top border glow */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-1/60 to-transparent" />
              
              <div className="bg-grad-card p-8 border-b border-white/10 flex items-start gap-5 relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-1 shadow-[0_0_24px_rgba(59,111,255,0.4)] relative flex-shrink-0">
                  <Image 
                    src="/images/especialista.jpg" 
                    alt="Claudio Müller" 
                    fill
                    className="object-cover"
                  />
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-green-s border-2 border-[#090B18] z-20 animate-blink" />
                </div>
                <div className="flex-1">
                  <div className="font-head font-bold text-[1.05rem] text-text-1">Claudio Müller</div>
                  <div className="text-[0.72rem] text-text-3 mt-1 whitespace-nowrap">Analista em Marketing & Expert em Aplicações IA</div>
                </div>
                <div className="absolute top-6 right-6 text-green-s font-bold text-[0.62rem] tracking-wider uppercase bg-green-s/10 border border-green-s/20 px-2.5 py-1 rounded-full">
                   Online
                </div>
              </div>

              <div className="p-8">
                <p className="text-[0.9rem] text-text-2 italic font-light leading-[1.7] pl-4 border-l-2 border-blue-1 mb-6">
                  "Não vendo campanhas. Construo sistemas que geram resultado enquanto você cuida do que sabe fazer de melhor."
                </p>

                <div className="grid grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-md overflow-hidden mb-6">
                  {[
                    { val: 'R$10M+', lbl: 'Investimento' },
                    { val: '25+', lbl: 'Anos Growth' },
                    { val: '3em1', lbl: 'Soluções' }
                  ].map((s, i) => (
                    <div key={i} className="bg-[#090B18] p-4 text-center">
                      <div className="font-head text-[1.3rem] font-extrabold grad-text leading-none">{s.val}</div>
                      <div className="text-[0.65rem] text-text-4 uppercase tracking-[0.08em] mt-1.5 leading-tight">{s.lbl}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {['Google Ads', 'Meta Blueprint', 'Growth Methodology', 'AI Automation'].map((cert, i) => (
                    <span key={i} className="text-[0.68rem] font-medium text-blue-2 bg-blue-1/10 border border-blue-1/30 px-2.5 py-1 rounded-full">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-8 bg-white/[0.04] border border-white/[0.08] backdrop-blur-md rounded-md p-[0.875rem_1.1rem] shadow-card z-20">
              <div className="font-head text-[1.5rem] font-extrabold grad-text leading-none">5.2×</div>
              <div className="text-[0.65rem] text-text-4 uppercase tracking-[0.1em] mt-1">ROAS médio</div>
              <div className="text-[0.7rem] text-green-s font-semibold mt-1">↑ +15% vs mês anterior</div>
            </div>
          </MotionDiv>

        </div>
      </div>
    </section>
  );
}
