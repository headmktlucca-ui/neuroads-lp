'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2, Sparkles, Send } from 'lucide-react';
import Image from 'next/image';
import { syncToHostingerReach } from '../../app/actions/hostinger';
import { sendStrategyRequestAction } from '../../app/actions/mail';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

const agentCategories = [
  {
    name: 'Vendas & Atendimento',
    agents: [
      { title: 'SDR Elite', desc: 'Qualificação instantânea de leads e agendamento automático 24/7.', image: '/images/tools/sdr.png' },
      { title: 'Customer Success AI', desc: 'Gestão proativa de LTV, NPS e retenção inteligente de clientes.', image: '/images/tools/cs.png' },
      { title: 'Agente de Suporte', desc: 'Atendimento consultivo especializado em resolução rápida de dúvidas.', image: '/images/tools/suporte.png' },
    ]
  },
  {
    name: 'Performance & Growth',
    agents: [
      { title: 'Media Buyer Pro', desc: 'Otimização neural de lances e audiências em Meta e Google Ads.', image: '/images/tools/media_buyer.png' },
      { title: 'Growth Manager', desc: 'Análise de funil ponta a ponta e identificação de gargalos de escala.', image: '/images/tools/growth.png' },
      { title: 'Data Scientist', desc: 'Modelagem preditiva de ROAS e atribuição avançada de conversões.', image: '/images/tools/data.png' },
    ]
  },
  {
    name: 'Criativo & Conteúdo',
    agents: [
      { title: 'Copywriter Sênior', desc: 'Criação de anúncios, VSLs e páginas de alta conversão validadas.', image: '/images/tools/copy.png' },
      { title: 'Creative Director', desc: 'Geração de conceitos visuais e análise de padrões de viralização.', image: '/images/tools/creative.png' },
      { title: 'SEO Master', desc: 'Otimização técnica e semântica para dominar buscas orgânicas.', image: '/images/tools/seo.png' },
    ]
  }
];

export default function ServicesSection() {
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', website: '' });

  const fadeUp: any = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "circOut" }
  };

  const toggleAgent = (title: string) => {
    const newSelected = new Set(selectedAgents);
    if (newSelected.has(title)) {
      newSelected.delete(title);
    } else {
      newSelected.add(title);
    }
    setSelectedAgents(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await syncToHostingerReach({ email: formData.email, name: formData.name, website: formData.website, tags: ["Planejamento Inicial"] });
      await sendStrategyRequestAction("avante@neuroads.com.br", formData.name, formData.email, formData.website, '', '', Array.from(selectedAgents));
      setSubmitStatus('success');
      setTimeout(() => { setIsModalOpen(false); setSubmitStatus('idle'); setSelectedAgents(new Set()); setFormData({ name: '', email: '', website: '' }); }, 3000);
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 lg:py-32 bg-white" id="servicos">
      <div className="wrap">
        <div className="max-w-[700px] mb-20 text-left">
          <MotionP {...fadeUp} className="s-badge">Arsenal de Agentes IA</MotionP>
          <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title">
            Tecnologia sistêmica.<br />
            <span className="text-primary italic">Resultado humano.</span>
          </MotionH2>
          <MotionP {...fadeUp} transition={{ delay: 0.2 }} className="s-body">
            Selecione os agentes que farão parte da sua operação. Nossa IA orquestra cada função para entregar escala com precisão cirúrgica.
          </MotionP>
        </div>

        <div className="space-y-16">
          {agentCategories.map((cat, catIdx) => (
            <div key={catIdx}>
              <h3 className="text-xs font-black tracking-[0.2em] uppercase text-text-dim mb-10 flex items-center gap-4">
                <span className="w-8 h-px bg-border" />
                {cat.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cat.agents.map((agent, i) => (
                  <MotionDiv
                    key={i}
                    {...fadeUp}
                    transition={{ delay: 0.1 * i }}
                    onClick={() => toggleAgent(agent.title)}
                    className={`premium-card p-6 flex items-start gap-5 cursor-pointer relative overflow-hidden group ${
                      selectedAgents.has(agent.title) ? 'border-primary ring-1 ring-primary shadow-orange bg-orange-light/30' : 'hover:border-primary/30'
                    }`}
                  >
                    <div className="w-14 h-14 bg-bg-secondary rounded-xl flex-shrink-0 relative overflow-hidden">
                      <Image src={agent.image} alt={agent.title} fill className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-text-main mb-1 text-[15px]">{agent.title}</h4>
                      <p className="text-[13px] text-text-muted leading-relaxed">{agent.desc}</p>
                    </div>
                    {selectedAgents.has(agent.title) && (
                      <div className="absolute top-4 right-4 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white">
                        <Check size={12} />
                      </div>
                    )}
                  </MotionDiv>
                ))}
              </div>
            </div>
          ))}
        </div>

        <MotionDiv {...fadeUp} className="mt-20 premium-card p-12 lg:p-16 text-center border-primary/20 bg-orange-light/20">
          <div className="max-w-[800px] mx-auto">
            <h3 className="text-3xl font-bold text-text-main mb-6">Pronto para Ativar sua Escala?</h3>
            <p className="text-lg text-text-muted mb-10">Envie seus recursos selecionados e receba um planejamento estratégico exclusivo de 30 dias para a sua marca.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary px-10 py-5 text-base"
              disabled={selectedAgents.size === 0}
            >
              <Send size={18} />
              Solicitar Planejamento
            </button>
          </div>
        </MotionDiv>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-charcoal/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl p-10">
              <h3 className="text-2xl font-bold text-text-main mb-2">Finalizar Solicitação</h3>
              <p className="text-text-muted mb-8 italic">Seus {selectedAgents.size} agentes selecionados serão incluídos no plano.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required placeholder="Seu Nome" className="w-full bg-bg-secondary border border-border rounded-xl px-5 py-4 focus:border-primary outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required type="email" placeholder="Seu Melhor E-mail" className="w-full bg-bg-secondary border border-border rounded-xl px-5 py-4 focus:border-primary outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input placeholder="Site/Instagram" className="w-full bg-bg-secondary border border-border rounded-xl px-5 py-4 focus:border-primary outline-none" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
                
                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn btn-ghost py-4">Voltar</button>
                  <button disabled={isSubmitting} type="submit" className="flex-1 btn btn-primary py-4">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Enviar Agora'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
