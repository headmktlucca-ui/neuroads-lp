'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Send, ArrowRight, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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

type AgentPreview = {
  title: string;
  desc: string;
  longDescription: string;
  image: string;
  category: string;
};

const extractHighlights = (text: string): string[] =>
  text
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 4);

const categorySlugMap: Record<(typeof CATEGORY_ORDER)[number], string> = {
  Performance: 'performance',
  Inteligência: 'inteligencia',
  Criativos: 'criativos',
  Técnico: 'tecnico',
};

const slugCategoryMap: Record<string, (typeof CATEGORY_ORDER)[number]> = {
  performance: 'Performance',
  inteligencia: 'Inteligência',
  criativos: 'Criativos',
  tecnico: 'Técnico',
};

const agentCategories = CATEGORY_ORDER.map((category) => ({
  name: categoryLabels[category],
  agents: agents
    .filter((agent) => agent.category === category)
    .map((agent) => ({
      title: agent.title,
      // Mantém o mesmo sentido da descrição principal do Hub, com copy mais enxuta para grade da home.
      desc: agent.description,
      longDescription: agent.longDescription,
      image: agent.icon,
      category: categoryLabels[agent.category] ?? agent.category,
    })),
}));

export default function ServicesSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('categoria') || '';
  const initialCategory = slugCategoryMap[categoryParam] ?? CATEGORY_ORDER[0];
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORY_ORDER)[number]>(initialCategory);
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', website: HTTPS_PREFIX });
  const [detailsAgent, setDetailsAgent] = useState<AgentPreview | null>(null);
  const categoryCounts = useMemo(
    () =>
      CATEGORY_ORDER.reduce<Record<(typeof CATEGORY_ORDER)[number], number>>((acc, category) => {
        acc[category] = agents.filter((agent) => agent.category === category).length;
        return acc;
      }, {} as Record<(typeof CATEGORY_ORDER)[number], number>),
    []
  );

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

  const isAgentSelected = (title: string) => selectedAgents.has(title);
  const activeCategoryAgents = agentCategories.find((cat) => cat.name === categoryLabels[activeCategory])?.agents ?? [];

  const changeCategory = (category: (typeof CATEGORY_ORDER)[number]) => {
    setActiveCategory(category);
    const next = new URLSearchParams(searchParams.toString());
    next.set('categoria', categorySlugMap[category]);
    router.replace(`${pathname}?${next.toString()}#servicos`, { scroll: false });
  };

  useEffect(() => {
    const fromUrl = slugCategoryMap[categoryParam];
    if (fromUrl && fromUrl !== activeCategory) {
      setActiveCategory(fromUrl);
    }
  }, [categoryParam, activeCategory]);

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
        <div className="absolute inset-0 bg-[url('/images/background_hub_repeat_flow.png')] bg-top bg-repeat-y bg-[length:100%_auto] opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/88 via-white/82 to-white/90 sm:from-white/84 sm:via-white/76 sm:to-white/86 lg:from-white/78 lg:via-white/70 lg:to-white/82" />
      </div>

      <div className="wrap relative z-10">
        <div className="max-w-[700px] mb-20 text-left">
          <MotionP {...fadeUp} className="s-badge">Implantação de Agentes IA</MotionP>
          <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title">
            Agentes certos para a sua operação.<br />
            <span className="text-primary italic">Sem vínculo fixo obrigatório.</span>
          </MotionH2>
          <MotionP {...fadeUp} transition={{ delay: 0.2 }} className="s-body">
            Você escolhe os agentes necessários para o seu momento. A NeuroAds diagnostica, implanta, configura e entrega seu sistema pronto para uso, com foco em crescimento previsível e dados reais.
          </MotionP>
        </div>

        <div>
          <MotionDiv
            {...fadeUp}
            className="flex flex-wrap gap-2 mb-10"
          >
            {CATEGORY_ORDER.map((category) => (
              <motion.button
                key={category}
                type="button"
                onClick={() => changeCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className={`relative px-4 md:px-6 py-2.5 rounded-2xl font-bold text-xs md:text-sm tracking-widest transition-all duration-300 overflow-hidden ${
                  activeCategory === category
                    ? 'text-white border border-[#FFC8A6] shadow-[0_10px_24px_rgba(255,107,0,0.35)]'
                    : 'bg-white text-text-muted hover:text-text-main border border-[#FFE1CF] hover:border-[#FFBE94] shadow-[0_6px_14px_rgba(255,107,0,0.08)]'
                }`}
              >
                {activeCategory === category && (
                  <motion.span
                    layoutId="active-agent-category-pill"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF9D00]"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative z-10">
                  {categoryLabels[category]} ({categoryCounts[category]})
                </span>
              </motion.button>
            ))}
          </MotionDiv>

          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {activeCategoryAgents.map((agent, i) => (
              <MotionDiv
                key={agent.title}
                {...fadeUp}
                transition={{ delay: 0.06 * i }}
                className={`p-[2px] rounded-[24px] cursor-pointer relative z-20 transition-all duration-300 ${
                  isAgentSelected(agent.title)
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
                    <div className="flex-1 pr-10">
                      <div className="mb-1 min-h-[22px] flex items-start justify-end">
                        {isAgentSelected(agent.title) && (
                          <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-primary bg-orange-light border border-primary/20 px-2 py-0.5 rounded-full leading-none">
                            Selecionado
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-text-main mb-1 text-[15px]">{agent.title}</h4>
                      <p className="text-[13px] text-text-muted leading-relaxed">{agent.desc}</p>
                      <button
                        type="button"
                        onClick={() => setDetailsAgent(agent)}
                        className="mt-4 text-[12px] uppercase tracking-[0.14em] font-bold text-primary hover:opacity-80 transition-opacity"
                      >
                        Detalhes
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleAgent(agent.title)}
                      aria-label={isAgentSelected(agent.title) ? `Remover ${agent.title}` : `Selecionar ${agent.title}`}
                      className={`absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${
                        isAgentSelected(agent.title)
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-gray-50 border border-gray-200 text-gray-300 group-hover:border-primary/40 group-hover:text-primary/40'
                      }`}
                    >
                      <Check size={12} strokeWidth={isAgentSelected(agent.title) ? 3 : 2} />
                    </button>
                  </div>
                </div>
              </MotionDiv>
            ))}
          </motion.div>
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
                      Recebemos seus dados e vamos mapear os agentes mais importantes para implantar na sua operação agora. Enquanto isso, clique em
                      <span className="font-bold text-text-main"> Contato</span> para seguir com o atendimento e entender como cada agente gera impacto financeiro real no seu ecossistema.
                    </p>
                    <div className="flex flex-col items-center gap-4">
                      <Link href="/#contato" className="btn btn-primary px-6 py-2.5 text-[13px] rounded-full">
                        Contato
                        <ArrowRight size={14} className="ml-2" />
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-3xl lg:text-4xl font-bold text-text-main mb-6">
                      <span className="grad-text-animated">Implante inteligência onde o caixa precisa.</span>
                    </h3>
                    <p className="text-lg text-text-muted mb-10 leading-relaxed">
                      Envie os agentes selecionados e receba um diagnóstico com prioridade de implantação, sem contrato mensal obrigatório.
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
                        Solicitar Diagnóstico dos Agentes
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
        {detailsAgent && (
          <div className="fixed inset-0 z-[320] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailsAgent(null)}
              className="absolute inset-0 bg-charcoal/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="relative w-full max-w-5xl bg-white rounded-[32px] border border-primary/40 shadow-2xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setDetailsAgent(null)}
                className="absolute top-6 right-6 w-11 h-11 rounded-full border border-border text-text-dim hover:text-text-main hover:border-primary/50 transition-colors flex items-center justify-center"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>

              <div className="p-8 lg:p-10 border-b border-border flex items-center gap-5">
                <div className="w-24 h-24 rounded-[22px] p-[2px] bg-gradient-to-br from-[#FF6B00] via-[#FF8F1F] to-[#B83A00] shadow-[0_0_0_1px_rgba(255,107,0,0.7),0_10px_20px_rgba(255,107,0,0.25)]">
                  <div className="w-full h-full rounded-[18px] overflow-hidden relative bg-white">
                    <Image src={detailsAgent.image} alt={detailsAgent.title} fill className="object-cover" />
                  </div>
                </div>
                <div>
                  <p className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] text-primary border border-primary/25 bg-orange-light">
                    {detailsAgent.category}
                  </p>
                  <h3 className="text-4xl font-black text-text-main mt-4">{detailsAgent.title}</h3>
                </div>
              </div>

              <div className="p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
                <div>
                  <p className="text-[13px] font-black uppercase tracking-[0.14em] text-primary mb-4">Descrição completa</p>
                  <p className="text-[16px] md:text-[18px] text-text-muted leading-relaxed">{detailsAgent.longDescription}</p>
                </div>
                <div className="bg-bg-secondary border border-border rounded-[28px] p-6">
                  <p className="text-[13px] font-black uppercase tracking-[0.14em] text-primary mb-4">Atividades principais</p>
                  <ul className="grid grid-cols-1 gap-3 text-[15px] md:text-[16px] text-text-muted leading-relaxed">
                    {extractHighlights(detailsAgent.longDescription).map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{item}.</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="px-6 sm:px-8 lg:px-10 pb-6 sm:pb-8 lg:pb-10 flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    toggleAgent(detailsAgent.title);
                  }}
                  className={`px-8 py-4 rounded-full text-[14px] font-bold uppercase tracking-[0.14em] transition-all ${
                    isAgentSelected(detailsAgent.title)
                      ? 'bg-primary text-white shadow-[0_10px_24px_-8px_rgba(255,77,0,0.55)]'
                      : 'bg-bg-secondary border border-border text-text-main hover:border-primary/40'
                  }`}
                >
                  {isAgentSelected(detailsAgent.title) ? 'Agente Selecionado' : 'Selecionar Agente'}
                </button>
                <button
                  type="button"
                  onClick={() => setDetailsAgent(null)}
                  className="px-8 py-4 rounded-full text-[14px] font-bold uppercase tracking-[0.14em] border border-border text-text-dim hover:text-text-main hover:border-primary/40 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}

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
