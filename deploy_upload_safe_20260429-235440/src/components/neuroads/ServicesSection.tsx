'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Send, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { syncToHostingerReach } from '../../app/actions/hostinger';
import { sendStrategyRequestAction } from '../../app/actions/mail';
import { agents } from '../../data/agents';
import { HTTPS_PREFIX, isHttpsPlaceholderOnly, normalizeHttpsMaskedUrlInput } from '../../lib/url-mask';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

const CATEGORY_ORDER = ['Performance', 'Inteligência', 'Criativos', 'Técnico'] as const;

const categoryLabels: Record<string, string> = {
  Performance: 'Performance',
  Inteligência: 'Inteligência',
  Criativos: 'Criativos',
  Técnico: 'Técnico',
};

const agentCategories = CATEGORY_ORDER.map((category) => ({
  name: categoryLabels[category],
  agents: agents
    .filter((agent) => agent.category === category)
    .map((agent) => ({
      title: agent.title,
      // Mantém o mesmo sentido da descrição principal do Hub, com copy mais enxuta para grade da home.
      desc: agent.description,
      image: agent.icon,
    })),
}));

export default function ServicesSection() {
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', website: HTTPS_PREFIX });

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
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
      const website = !isHttpsPlaceholderOnly(formData.website) ? formData.website : '';
      await syncToHostingerReach({ email: formData.email, name: formData.name, website, tags: ["Planejamento Inicial"] });
      await sendStrategyRequestAction("avante@neuroads.com.br", formData.name, formData.email, website, '', '', Array.from(selectedAgents));
      setSubmitStatus('success');
      setIsModalOpen(false);
      setSelectedAgents(new Set());
      setFormData({ name: '', email: '', website: HTTPS_PREFIX });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      className="py-24 lg:py-32 relative overflow-hidden bg-white" 
      id="servicos"
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/images/background_grade.jpg')] bg-center bg-no-repeat bg-[length:1100px_auto] sm:bg-[length:1400px_auto] lg:bg-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/88 via-white/82 to-white/90 sm:from-white/84 sm:via-white/76 sm:to-white/86 lg:from-white/78 lg:via-white/70 lg:to-white/82" />
      </div>

      <div className="wrap relative z-10">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {cat.agents.map((agent, i) => (
                  <MotionDiv
                    key={i}
                    {...fadeUp}
                    transition={{ delay: 0.1 * i }}
                    onClick={() => toggleAgent(agent.title)}
                    className={`p-[2px] rounded-[24px] cursor-pointer relative z-20 transition-all duration-300 ${
                      selectedAgents.has(agent.title) 
                        ? 'bg-gradient-to-br from-white/40 via-orange-300 to-[#FF6B00] shadow-[0_15px_30px_-5px_rgba(255,107,0,0.3)] scale-[1.02]' 
                        : 'bg-white hover:bg-gradient-to-br hover:from-white/40 hover:via-orange-300/60 hover:to-[#FF6B00]/60 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="bg-white/90 rounded-[22px] p-[3px] h-full">
                      <div className="bg-white rounded-[19px] p-6 flex items-start gap-5 relative overflow-hidden h-full group">
                        <div className="w-14 h-14 rounded-[14px] p-[2px] bg-gradient-to-br from-[#FF6B00] via-[#FF8F1F] to-[#B83A00] shadow-[0_0_0_1px_rgba(255,107,0,0.7),0_10px_20px_rgba(255,107,0,0.25)] flex-shrink-0">
                          <div className="w-full h-full rounded-[12px] bg-white overflow-hidden relative">
                            <Image src={agent.image} alt={agent.title} fill className="object-cover opacity-85 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-text-main mb-1 text-[15px]">{agent.title}</h4>
                          <p className="text-[13px] text-text-muted leading-relaxed">{agent.desc}</p>
                        </div>
                        <div className={`absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                          selectedAgents.has(agent.title)
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-gray-50 border border-gray-200 text-gray-300 group-hover:border-primary/40 group-hover:text-primary/40'
                        }`}>
                          <Check size={12} strokeWidth={selectedAgents.has(agent.title) ? 3 : 2} />
                        </div>
                      </div>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            </div>
          ))}
        </div>

        <MotionDiv 
          {...fadeUp} 
          className="mt-20 p-1 rounded-[40px] bg-gradient-to-br from-white/40 via-orange-300 to-[#FF6B00] shadow-[0_30px_80px_-20px_rgba(255,107,0,0.3)] relative z-20"
        >
          <div className="bg-white/80 rounded-[36px] p-2">
            <div className="bg-white rounded-[28px] p-12 lg:p-20 text-center shadow-sm">
              <div className="max-w-[800px] mx-auto">
                {submitStatus === 'success' ? (
                  <>
                    <h3 className="text-3xl lg:text-4xl font-bold text-text-main mb-6">
                      Solicitação enviada com sucesso
                    </h3>
                    <p className="text-lg text-text-muted mb-10 leading-relaxed">
                      Recebemos seus dados e nossa equipe vai analisar sua operação. Enquanto isso, clique em
                      <span className="font-bold text-text-main"> Acessar Hub</span> para conhecer em detalhes os melhores agentes que você pode contratar conforme suas necessidades.
                    </p>
                    <div className="flex flex-col items-center gap-4">
                      <a href="/hub" className="btn btn-primary px-6 py-2.5 text-[13px] rounded-full">
                        Acessar Hub
                        <ArrowRight size={14} className="ml-2" />
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-3xl lg:text-4xl font-bold text-text-main mb-6">
                      <span className="grad-text-animated">Onde estratégia encontra precisão.</span>
                    </h3>
                    <p className="text-lg text-text-muted mb-10 leading-relaxed">
                      Envie seus recursos selecionados e receba um planejamento estratégico exclusivo de 30 dias para a sua marca.
                    </p>
                    
                    <div className="flex flex-col items-center gap-4">
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className={`px-10 py-5 text-base rounded-full font-semibold flex items-center gap-3 transition-all ${
                          selectedAgents.size === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                            : 'btn btn-primary active:scale-95 hover:shadow-lg'
                        }`}
                        disabled={selectedAgents.size === 0}
                      >
                        <Send size={18} className="-rotate-45" />
                        Solicitar Planejamento
                      </button>
                      
                      {selectedAgents.size === 0 && (
                        <p className="text-sm text-text-muted animate-pulse">
                          Selecione pelo menos um agente acima
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
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
                <input
                  placeholder="Site/Instagram"
                  className="w-full bg-bg-secondary border border-border rounded-xl px-5 py-4 focus:border-primary outline-none"
                  value={formData.website}
                  onChange={e => setFormData({...formData, website: normalizeHttpsMaskedUrlInput(e.target.value)})}
                  onBlur={e => setFormData({...formData, website: normalizeHttpsMaskedUrlInput(e.target.value)})}
                />
                
                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn btn-ghost py-4">Voltar</button>
                  <button disabled={isSubmitting} type="submit" className="flex-1 btn btn-primary py-4">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Enviar Agora'}
                  </button>
                </div>
                {submitStatus === 'error' && (
                  <p className="text-sm text-red-500 text-center pt-2">
                    Não foi possível enviar agora. Tente novamente em instantes.
                  </p>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
