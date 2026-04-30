'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import { syncToHostingerReach } from '../../app/actions/hostinger';
import { sendStrategyRequestAction } from '../../app/actions/mail';
import { HTTPS_PREFIX, isHttpsPlaceholderOnly, normalizeHttpsMaskedUrlInput } from '../../lib/url-mask';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
}

export default function CTASection() {
  const [formData, setFormData] = useState({ name: '', whatsapp: '', email: '', website: HTTPS_PREFIX, situation: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await syncToHostingerReach({ email: formData.email, name: formData.name, phone: formData.whatsapp, tags: ["Planejamento Inicial"] });
      await sendStrategyRequestAction(
        "avante@neuroads.com.br",
        formData.name,
        formData.email,
        !isHttpsPlaceholderOnly(formData.website) ? formData.website : '',
        formData.whatsapp,
        formData.situation
      );
      setSubmitStatus('success');
      setFormData({ name: '', whatsapp: '', email: '', website: HTTPS_PREFIX, situation: '' });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 lg:py-32 bg-white relative overflow-hidden" id="contato">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] -z-10" />

      <div className="wrap relative">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-20 items-center">
          
          <div>
            <MotionP {...fadeUp} className="s-badge">O Próximo Passo</MotionP>
            <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title">
              Chega de dúvidas.<br />
              Ative sua <span className="text-primary italic">Escala Real.</span>
            </MotionH2>
            <MotionP {...fadeUp} transition={{ delay: 0.2 }} className="s-body mb-10">
              Se você fatura acima de R$ 30k/mês e busca escala previsível sem operacional complexo, solicite seu diagnóstico gratuito.
            </MotionP>

            <div className="space-y-4 mb-12">
               {[
                 'Análise completa do posicionamento atual',
                 'Simulação de potencial de retorno (Lucca)',
                 'Planejamento de GEO e Agentes de IA',
                 'Diálogo direto com o especialista'
               ].map((benefit, i) => (
                 <MotionDiv key={i} {...fadeUp} transition={{ delay: 0.3 + (i * 0.1) }} className="flex items-center gap-3 text-[15px] font-medium text-text-main">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-white">✓</div>
                    {benefit}
                 </MotionDiv>
               ))}
            </div>

            <MotionDiv {...fadeUp} transition={{ delay: 0.7 }} className="flex items-center gap-5 p-6 bg-bg-secondary border border-border rounded-[24px]">
              <div className="w-14 h-14 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden relative flex-shrink-0">
                <Image src="/images/0599.jpeg" alt="Claudio Müller" fill className="object-cover rounded-full" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-text-dim mb-1">Garantia de Atenção</p>
                <p className="text-[14px] text-text-main italic font-medium">&quot;Eu mesmo responderei seu contato pessoalmente em até 24h.&quot;</p>
              </div>
            </MotionDiv>
          </div>

          <MotionDiv 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-1 rounded-[40px] bg-gradient-to-br from-white/40 via-orange-300 to-[#FF6B00] shadow-[0_30px_80px_-20px_rgba(255,107,0,0.3)] relative z-20 w-full"
          >
            <div className="bg-white/60 backdrop-blur-3xl rounded-[36px] p-2">
              <div className="bg-white rounded-[28px] p-10 lg:p-12 shadow-sm w-full">
                {submitStatus === 'success' ? (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600 mb-6">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-text-main mb-2">Solicitação Enviada!</h3>
                    <p className="text-text-muted mb-8 italic">Claudio Müller entrará em contato em breve.</p>
                    <button onClick={() => setSubmitStatus('idle')} className="text-primary font-bold text-sm uppercase tracking-widest hover:underline">Novo Diagnóstico</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-text-dim uppercase tracking-wider">Nome Completo</label>
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Seu nome" className="w-full bg-bg-secondary border border-border rounded-xl px-5 py-4 focus:border-primary outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-text-dim uppercase tracking-wider">WhatsApp</label>
                      <input required value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: maskPhone(e.target.value)})} placeholder="(00) 00000-0000" className="w-full bg-bg-secondary border border-border rounded-xl px-5 py-4 focus:border-primary outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-text-dim uppercase tracking-wider">E-mail</label>
                      <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="seu@email.com" className="w-full bg-bg-secondary border border-border rounded-xl px-5 py-4 focus:border-primary outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-text-dim uppercase tracking-wider">Site/Negócio</label>
                      <input
                        value={formData.website}
                        onChange={e => setFormData({...formData, website: normalizeHttpsMaskedUrlInput(e.target.value)})}
                        onBlur={e => setFormData({...formData, website: normalizeHttpsMaskedUrlInput(e.target.value)})}
                        placeholder="seusite.com.br"
                        className="w-full bg-bg-secondary border border-border rounded-xl px-5 py-4 focus:border-primary outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-text-dim uppercase tracking-wider">Objetivo</label>
                      <div className="relative">
                        <select required value={formData.situation} onChange={e => setFormData({...formData, situation: e.target.value})} className="w-full bg-bg-secondary border border-border rounded-xl px-5 py-4 focus:border-primary outline-none appearance-none cursor-pointer">
                          <option value="" disabled>Selecione a situação</option>
                          <option value="Escala de Anúncios">Quero mais leads/vendas</option>
                          <option value="Redução de Custo">Preciso reduzir o CAC</option>
                          <option value="SEO/GEO">Quero aparecer nas buscas IA</option>
                          <option value="Automação">Preciso de Agentes de IA</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
                      </div>
                    </div>
                    <button disabled={isSubmitting} type="submit" className="w-full btn btn-primary py-5 text-base mt-6">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : 'Solicitar Diagnóstico Agora'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </MotionDiv>

        </div>
      </div>
    </section>
  );
}
