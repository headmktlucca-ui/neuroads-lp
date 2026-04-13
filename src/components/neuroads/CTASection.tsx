'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

export default function CTASection() {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7 }
  };

  return (
    <section className="section py-24 lg:py-32 overflow-hidden" id="contato">
      <div className="wrap relative">
        {/* Glow behind CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-1/[0.05] blur-[120px] -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 lg:gap-24 items-center">
          
          {/* TEXT CONTENT */}
          <div>
            <MotionP {...fadeUp} className="s-badge">Próximo Passo</MotionP>
            <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title">
              Chega de dúvidas.<br />
              Comece a <span className="g">escalar com inteligência.</span>
            </MotionH2>
            <MotionP {...fadeUp} transition={{ delay: 0.2 }} className="s-body">
              Se você fatura mais de R$ 50k/mês e quer sair do amadorismo no marketing, preencha o formulário abaixo. Vou analisar seu caso pessoalmente e agendaremos um diagnóstico gratuito.
            </MotionP>

            <div className="space-y-4 mt-10">
               {[
                 'Análise completa do seu tráfego atual',
                 'Simulação de potencial de escala com o Lucca',
                 'Plano de ação para GEO e Agentes de IA',
                 'Conversa direta com Claudio Müller (sem intermediários)'
               ].map((benefit, i) => (
                 <MotionDiv key={i} {...fadeUp} transition={{ delay: 0.3 + (i * 0.1) }} className="flex items-center gap-3 text-[0.9rem] text-text-1">
                    <div className="w-5 h-5 rounded-full bg-green-s border border-green-s flex items-center justify-center text-[0.65rem] text-white">✓</div>
                    {benefit}
                 </MotionDiv>
               ))}
            </div>

            <MotionDiv {...fadeUp} transition={{ delay: 0.7 }} className="mt-12 p-6 bg-white/[0.04] border border-white/[0.08] rounded-lg flex items-center gap-5">
              <div className="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden relative shadow-[0_0_16px_rgba(59,111,255,0.3)] flex-shrink-0">
                <Image 
                  src="/images/0599.jpeg" 
                  alt="Claudio Müller" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div>
                <div className="text-[0.7rem] text-text-4 uppercase font-bold tracking-[0.1em]">Garantia de Atenção</div>
                <div className="text-[0.85rem] text-text-2 mt-0.5">"Eu mesmo responderei seu contato em até 24h úteis."</div>
              </div>
            </MotionDiv>
          </div>

          {/* FORM CARD */}
          <MotionDiv 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white/[0.04] border border-white/10 rounded-xl p-8 lg:p-10 backdrop-blur-xl shadow-[var(--shadow-card),_var(--shadow-glow)] relative"
          >
            {/* Top border glow */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-1/50 to-transparent" />
            
            <form className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[0.72rem] font-semibold text-text-3 uppercase tracking-[0.1em]">Nome Completo</label>
                <input 
                  type="text" 
                  placeholder="Seu nome" 
                  className="w-full bg-white/[0.06] border border-white/10 rounded-md p-3 text-[0.9rem] text-text-1 outline-none focus:border-blue-1 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[0.72rem] font-semibold text-text-3 uppercase tracking-[0.1em]">WhatsApp</label>
                <input 
                  type="tel" 
                  placeholder="(00) 00000-0000" 
                  className="w-full bg-white/[0.06] border border-white/10 rounded-md p-3 text-[0.9rem] text-text-1 outline-none focus:border-blue-1 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[0.72rem] font-semibold text-text-3 uppercase tracking-[0.1em]">E-mail Corporativo</label>
                <input 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="w-full bg-white/[0.06] border border-white/10 rounded-md p-3 text-[0.9rem] text-text-1 outline-none focus:border-blue-1 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[0.72rem] font-semibold text-text-3 uppercase tracking-[0.1em]">Situação do Marketing</label>
                <select 
                  defaultValue=""
                  className="w-full bg-white/[0.06] border border-white/10 rounded-md p-3 text-[0.9rem] text-text-1 outline-none focus:border-blue-1 transition-colors appearance-none"
                >
                  <option value="" disabled>Selecione a situação</option>
                  <option value="leads">Quero gerar mais leads com anúncios</option>
                  <option value="cost">Preciso reduzir o custo por cliente</option>
                  <option value="geo">Quero aparecer no Google e nas IAs</option>
                  <option value="automation">Preciso de automação com IA</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-full py-4 mt-4 cursor-pointer">
                Solicitar Diagnóstico Agora
              </button>
              
              <div className="text-center text-[0.68rem] text-text-4 mt-6">
                Sua privacidade é prioridade. Não enviamos spam.
              </div>
            </form>
          </MotionDiv>

        </div>
      </div>
    </section>
  );
}
