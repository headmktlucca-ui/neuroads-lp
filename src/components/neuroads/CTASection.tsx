'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { syncToHostingerReach } from '../../app/actions/hostinger';
import { sendStrategyRequestAction } from '../../app/actions/mail';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

// Phone mask: (00) 00000-0000
function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
}

const SITE_PREFIX = 'https://';

export default function CTASection() {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    website: SITE_PREFIX,
    situation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7 }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // 1. Sync to Hostinger Reach
      const reachResult = await syncToHostingerReach({
        email: formData.email,
        name: formData.name,
        phone: formData.whatsapp,
        tags: ["Planejamento Inicial"]
      });
      if (!reachResult.success) {
        console.warn('Hostinger Reach sync failed:', reachResult.error);
      }

      // 2. Send Email
      const mailResult = await sendStrategyRequestAction(
        "avante@neuroads.com.br",
        formData.name,
        formData.email,
        formData.website !== SITE_PREFIX ? formData.website : '',
        formData.whatsapp,
        formData.situation
      );
      if (!mailResult.success) {
        throw new Error('Falha ao enviar e-mail: ' + JSON.stringify(mailResult.error));
      }

      setSubmitStatus('success');
      setFormData({ name: '', whatsapp: '', email: '', website: SITE_PREFIX, situation: '' });
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error('CTA Submit failed:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
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
              Se você fatura acima de R$ 30k/mês e está com dificuldades em aumentar suas vendas sem extourar seu investimento com operacional, solicite um diagnóstico sem compromisso. 
            </MotionP>

            <div className="space-y-4 mt-10">
               {[
                 'Análise completa do seu posicionamento atual',
                 'Simulação de potencial de escala com o Lucca',
                 'Plano de ação para GEO e Agentes de IA',
                 'Converse diretamente com o Analista'
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
            
            {submitStatus === 'success' ? (
              <div className="py-20 text-center space-y-4">
                <MotionDiv 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-16 h-16 bg-green-s/20 rounded-full flex items-center justify-center mx-auto text-green-s"
                >
                  <CheckCircle2 size={32} />
                </MotionDiv>
                <h3 className="text-xl font-bold text-white">Solicitação Enviada!</h3>
                <p className="text-text-2 text-sm max-w-[200px] mx-auto">
                  Claudio Müller entrará em contato em breve para o diagnóstico.
                </p>
                <button 
                  onClick={() => setSubmitStatus('idle')}
                  className="text-blue-1 text-xs font-bold uppercase tracking-widest hover:underline"
                >
                  Enviar outra solicitação
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {submitStatus === 'error' && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-xs">
                    Erro ao enviar. Verifique sua conexão e tente novamente.
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-[0.72rem] font-semibold text-text-3 uppercase tracking-[0.1em]">Nome Completo</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Seu nome" 
                    className="w-full bg-white/[0.06] border border-white/10 rounded-md p-3 text-[0.9rem] text-text-1 outline-none focus:border-blue-1 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[0.72rem] font-semibold text-text-3 uppercase tracking-[0.1em]">WhatsApp</label>
                  <input 
                    required
                    type="tel" 
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: maskPhone(e.target.value)})}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-md p-3 text-[0.9rem] text-text-1 outline-none focus:border-blue-1 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[0.72rem] font-semibold text-text-3 uppercase tracking-[0.1em]">E-mail Corporativo</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="seu@email.com" 
                    className="w-full bg-white/[0.06] border border-white/10 rounded-md p-3 text-[0.9rem] text-text-1 outline-none focus:border-blue-1 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[0.72rem] font-semibold text-text-3 uppercase tracking-[0.1em]">Site</label>
                  <div className="flex items-center bg-white/[0.06] border border-white/10 rounded-md focus-within:border-blue-1 transition-colors overflow-hidden">
                    <span className="pl-3 pr-1 text-[0.9rem] text-text-4 select-none whitespace-nowrap">https://</span>
                    <input
                      type="text"
                      value={formData.website.replace(/^https:\/\//, '')}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/^https:\/\//, '');
                        setFormData({...formData, website: SITE_PREFIX + raw});
                      }}
                      onKeyDown={(e) => {
                        // prevent deleting the prefix
                        const selStart = (e.target as HTMLInputElement).selectionStart ?? 0;
                        if ((e.key === 'Backspace' || e.key === 'Delete') && selStart === 0) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="seusite.com.br"
                      className="flex-1 bg-transparent py-3 pr-3 text-[0.9rem] text-text-1 outline-none placeholder:text-white/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[0.72rem] font-semibold text-text-3 uppercase tracking-[0.1em]">Situação do Marketing</label>
                  <div className="relative">
                    <select 
                      required
                      value={formData.situation}
                      onChange={(e) => setFormData({...formData, situation: e.target.value})}
                      className="w-full bg-[#0d1117] border border-white/10 rounded-md p-3 text-[0.9rem] text-white outline-none focus:border-blue-1 transition-colors appearance-none cursor-pointer"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="" disabled style={{ background: '#0d1117', color: '#94a3b8' }}>Selecione a situação</option>
                      <option value="Quero gerar mais leads com anúncios" style={{ background: '#0d1117', color: '#f1f5f9' }}>Quero gerar mais leads com anúncios</option>
                      <option value="Preciso reduzir o custo por cliente" style={{ background: '#0d1117', color: '#f1f5f9' }}>Preciso reduzir o custo por cliente</option>
                      <option value="Quero aparecer no Google e nas IAs" style={{ background: '#0d1117', color: '#f1f5f9' }}>Quero aparecer no Google e nas IAs</option>
                      <option value="Preciso de automação com IA" style={{ background: '#0d1117', color: '#f1f5f9' }}>Preciso de automação com IA</option>
                    </select>
                    {/* Custom chevron */}
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg className="w-4 h-4 text-text-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={isSubmitting}
                  type="submit" 
                  className="btn btn-primary w-full py-4 mt-4 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Solicitar Diagnóstico Agora'
                  )}
                </button>
                
                <div className="text-center text-[0.68rem] text-text-4 mt-6">
                  Sua privacidade é prioridade. Não enviamos spam.
                </div>
              </form>
            )}
          </MotionDiv>

        </div>
      </div>
    </section>
  );
}
