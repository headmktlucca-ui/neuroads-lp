'use client';

import { motion, Variants } from 'framer-motion';
import { ArrowRight, Mail, Phone, MapPin, Send, HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const faqs = [
  {
    q: 'Quanto tempo leva para iniciar o diagnóstico?',
    a: 'Normalmente, retornamos o contato em até 4h úteis para agendar a reunião de diagnóstico inicial.'
  },
  {
    q: 'O diagnóstico tem algum custo?',
    a: 'Não. O diagnóstico de 30 minutos focado em descobrir gargalos de caixa é um investimento nosso para entender se faz sentido seguirmos.'
  },
  {
    q: 'A NeuroAds atende meu segmento?',
    a: 'Temos agentes especializados em Saúde, E-commerce B2C, Educação, Mercado Imobiliário e Serviços B2B.'
  }
];

export default function ContatoPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
        
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          {/* LEFT SIDE: Info */}
          <motion.div
            variants={revealVariants}
            initial="hidden"
            animate="visible"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6a00]/30 bg-[#ff6a00]/10 backdrop-blur-md px-4 py-1.5 mb-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff8f3a]">
                Contato Estratégico
              </span>
            </span>
            <h1 className="text-[40px] md:text-[52px] font-black leading-[1.08] tracking-tight text-white mb-6">
              Vamos escalar <span className="bg-[linear-gradient(90deg,#ff8a00_0%,#ff6a00_50%,#ff9f1a_100%)] bg-clip-text text-transparent">juntos.</span>
            </h1>
            <p className="text-[16px] sm:text-[18px] text-slate-300 leading-relaxed mb-12 max-w-[500px]">
              Fale com um especialista e descubra como a IA Agêntica pode gerar previsibilidade de caixa para o seu negócio.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#ff6a00]/10 text-[#ff8f3a] border border-[#ff6a00]/20 shadow-[0_4px_12px_rgba(255,106,0,0.15)]">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-white mb-1">WhatsApp / Telefone</h3>
                  <p className="text-[16px] text-slate-300">+55 (11) 99999-9999</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-800 text-white border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-white mb-1">E-mail Comercial</h3>
                  <p className="text-[16px] text-slate-300">contato@neuroads.com.br</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-800 text-white border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-white mb-1">Sede NeuroAds</h3>
                  <p className="text-[16px] text-slate-300">São Paulo, SP - Brasil</p>
                </div>
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="mt-16 border-t border-white/10 pt-10">
              <h3 className="text-[18px] font-bold text-white mb-6 flex items-center gap-2">
                <HelpCircle size={18} className="text-[#ff6a00]" /> Dúvidas Frequentes
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="rounded-2xl border border-white/5 bg-zinc-900/50 overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-white/5"
                    >
                      <span className="text-[14px] font-bold text-white">{faq.q}</span>
                      <ChevronDown 
                        size={18} 
                        className={`text-slate-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-[#ff6a00]' : ''}`} 
                      />
                    </button>
                    {openFaq === index && (
                      <div className="px-5 pb-5 pt-0 text-[14px] leading-relaxed text-slate-300">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </motion.div>

          {/* RIGHT SIDE: Form */}
          <motion.div
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="relative rounded-[32px] border border-[#ff6a00]/20 bg-zinc-950/60 p-8 md:p-10 backdrop-blur-md shadow-[0_24px_64px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,106,0,0.1)]"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#ff6a00]/10 rounded-full blur-[60px] pointer-events-none" />
            
            <h2 className="text-[24px] font-black text-white mb-2">Diagnóstico Inicial</h2>
            <p className="text-[14px] text-slate-400 mb-8">Preencha os dados abaixo e entenda o real potencial da sua operação.</p>

            <form className="space-y-5">
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2">Nome Completo</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white placeholder:text-slate-600 focus:border-[#ff6a00]/50 focus:outline-none focus:ring-1 focus:ring-[#ff6a00]/50 transition-all"
                  placeholder="Seu nome"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2">E-mail</label>
                  <input 
                    type="email" 
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white placeholder:text-slate-600 focus:border-[#ff6a00]/50 focus:outline-none focus:ring-1 focus:ring-[#ff6a00]/50 transition-all"
                    placeholder="voce@empresa.com"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2">WhatsApp</label>
                  <input 
                    type="tel" 
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white placeholder:text-slate-600 focus:border-[#ff6a00]/50 focus:outline-none focus:ring-1 focus:ring-[#ff6a00]/50 transition-all"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2">Site da Empresa</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white placeholder:text-slate-600 focus:border-[#ff6a00]/50 focus:outline-none focus:ring-1 focus:ring-[#ff6a00]/50 transition-all"
                  placeholder="https://suaempresa.com.br"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2">Faturamento Mensal Estimado</label>
                <select className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white focus:border-[#ff6a00]/50 focus:outline-none focus:ring-1 focus:ring-[#ff6a00]/50 transition-all appearance-none">
                  <option value="">Selecione uma faixa...</option>
                  <option value="ate-30k">Até R$ 30.000</option>
                  <option value="30k-100k">R$ 30.000 a R$ 100.000</option>
                  <option value="100k-500k">R$ 100.000 a R$ 500.000</option>
                  <option value="acima-500k">Acima de R$ 500.000</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2">Qual seu principal desafio hoje?</label>
                <textarea 
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white placeholder:text-slate-600 focus:border-[#ff6a00]/50 focus:outline-none focus:ring-1 focus:ring-[#ff6a00]/50 transition-all resize-none"
                  placeholder="Ex: Leads muito caros, dificuldade em converter leads do comercial..."
                />
              </div>

              <button
                type="button"
                className="group relative w-full mt-4 justify-center inline-flex items-center gap-2 rounded-xl px-8 py-4 text-[15px] font-extrabold text-white overflow-hidden transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(145deg, #ff8f3a 0%, #e65c00 100%)',
                  boxShadow: '0 8px 20px -4px rgba(255,106,0,0.5)'
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Solicitar Diagnóstico
                  <Send size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </button>
              <p className="text-center text-[11px] text-slate-500 mt-4">
                Seus dados estão seguros. Não enviamos spam.
              </p>
            </form>
          </motion.div>

        </div>
      </div>
    </main>
  );
}
