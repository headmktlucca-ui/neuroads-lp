'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { syncToHostingerReach } from '../../app/actions/hostinger';
import { sendStrategyRequestAction } from '../../app/actions/mail';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;
const MotionH3 = motion.h3;

const agentCategories = [
  {
    name: 'Performance & Criativos',
    agents: [
      { 
        title: 'Analista de Tráfego', 
        desc: 'Diagnóstico neural de campanhas com tomada de decisão automática baseada em ROI.',
        image: '/images/tools/analista_trafego.png' 
      },
      { 
        title: 'Gerador de Criativos', 
        desc: 'Criação de copies e conceitos visuais de alto impacto validados por padrões de conversão.',
        image: '/images/tools/gerador_criativos.png' 
      },
      { 
        title: 'Gerador de Copies', 
        desc: 'Motor rápido focado na geração expressa de headlines, CTAs chamativos e argumentos diretos.',
        image: '/images/tools/gerador_copies.png' 
      },
      { 
        title: 'Análise Viral', 
        desc: 'Identificação de padrões de conteúdo com alto potencial de partilha e viralização no nicho.',
        image: '/images/tools/analise_viral.png' 
      },
    ]
  },
  {
    name: 'Estratégia & Projeção',
    agents: [
      { 
        title: 'Preditor de Funil', 
        desc: 'Simulação de cenários de escala e previsão de ROI antes de investir.',
        image: '/images/tools/preditor_funil.png' 
      },
      { 
        title: 'Simulador de ROAS', 
        desc: 'Projeção de metas de faturação e cálculo de leads e investimento necessários.',
        image: '/images/tools/simulador_roas.png' 
      },
      { 
        title: 'Otimizador de Orçamento', 
        desc: 'Redistribuição tática do orçamento, apontando onde cortar e onde alavancar.',
        image: '/images/tools/otimizacao.png' 
      },
      { 
        title: 'Gerador de Testes A/B', 
        desc: 'Roteirizador inteligente que projeta variações ideais de público, oferta e peças gráficas.',
        image: '/images/tools/testes.png' 
      },
      { 
        title: 'Avaliador de Oferta', 
        desc: 'Varrimento sistémico na estruturação de preço-valor e análise de lacunas de diferenciação.',
        image: '/images/tools/analise.png' 
      },
    ]
  },
  {
    name: 'Técnico & Auditoria',
    agents: [
      { 
        title: 'Rastreador Cirúrgico', 
        desc: 'Implementação de tracking Lado-Servidor para contornar bloqueios de cookies e iOS14+.',
        image: '/images/tools/rastreador_cirurgico.png' 
      },
      { 
        title: 'Diagnóstico de LP', 
        desc: 'Análise de problemas de conversão, UX (experiência do utilizador) e clareza da oferta.',
        image: '/images/tools/diagnostico_lp.png' 
      },
      { 
        title: 'Diagnóstico de Funil', 
        desc: 'Mapeamento visual de gargalos entre a navegação, o clique e a conversão.',
        image: '/images/tools/diagnostico_funil.png' 
      },
      { 
        title: 'Auditor de Desperdício', 
        desc: 'Calculadora que faz o varrimento da conta para isolar gastos desnecessários.',
        image: '/images/tools/auditor_desperdicio.png' 
      },
    ]
  },
  {
    name: 'Inteligência de Mercado',
    agents: [
      { 
        title: 'Analisador de Público', 
        desc: 'Refinamento avançado com sugestões de segmentações prontas por nicho e produto.',
        image: '/images/tools/analisador_publico.png' 
      },
      { 
        title: 'Público-Alvo Ideal', 
        desc: 'Pesquisa neural de segmentação, identificando o que o público consome e como interage.',
        image: '/images/tools/publico_ideal.png' 
      },
      { 
        title: 'Análise de Rivais', 
        desc: 'Varrimento profundo via URL para identificar estratégias e pontos cegos dos concorrentes.',
        image: '/images/tools/concorrentes.png' 
      },
      { 
        title: 'Radar de Oportunidades', 
        desc: 'Deteção contínua de canais subestimados na sua vertical de mercado.',
        image: '/images/tools/mineracao.png' 
      },
      { 
        title: 'DNA da Marca', 
        desc: 'Documento estratégico completo com posicionamento, tom de voz e pilares da marca.',
        image: '/images/tools/dna_marca.png' 
      },
    ]
  }
];

export default function ServicesSection() {
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', website: '' });

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7 }
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
    setSubmitStatus('idle');
    
    try {
      // 1. Sync to Hostinger Reach
      const reachResult = await syncToHostingerReach({
        email: formData.email,
        name: formData.name,
        website: formData.website,
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
        formData.website,
        '', // userPhone
        '', // userSituation
        Array.from(selectedAgents)
      );
      if (!mailResult.success) {
        throw new Error('Falha ao enviar e-mail: ' + JSON.stringify(mailResult.error));
      }

      setSubmitStatus('success');
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitStatus('idle');
        setSelectedAgents(new Set());
        setFormData({ name: '', email: '', website: '' });
      }, 3000);
    } catch (error) {
      console.error('Submit failed:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section bg-white/[0.01] border-y border-white/10" id="servicos">
      <div className="wrap py-24 lg:py-32">
        
        {/* HEADER */}
        <div className="text-center mb-16 lg:mb-24">
          <MotionP {...fadeUp} className="s-badge mx-auto">Arsenal de Agentes Neurais</MotionP>
          <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title mx-auto text-balance mt-4">
            Tecnologia sistêmica.<br />
            <span className="g">Resultado humano.</span>
          </MotionH2>
          <MotionP {...fadeUp} transition={{ delay: 0.2 }} className="text-text-2 max-w-[600px] mx-auto mt-6 font-light">
            Não entregamos apenas serviços. Implantamos um ecossistema de agentes inteligentes que operam 24/7 para otimizar cada etapa do seu funil comercial.
          </MotionP>
          <MotionP 
          {...fadeUp} 
          transition={{ delay: 0.15 }} 
          className="text-[1.2rem] text-text-1 font-medium mb-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
        >
          Selecione as funções que fazem sentido para sua operação:
        </MotionP>
        </div>

        {/* CATEGORIES GRID */}
        <div className="space-y-20">
          {agentCategories.map((cat, catIdx) => (
            <div key={catIdx}>
              <MotionH2 
                {...fadeUp} 
                className="text-[0.72rem] font-black tracking-[0.2em] uppercase text-text-4 mb-10 flex items-center gap-4"
              >
                <span className="w-8 h-px bg-white/10" />
                {cat.name}
              </MotionH2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {cat.agents.map((agent, i) => (
                  <MotionDiv
                    key={i}
                    {...fadeUp}
                    transition={{ delay: 0.1 * i }}
                    onClick={() => toggleAgent(agent.title)}
                    className={`group relative bg-white/[0.03] border rounded-xl p-6 transition-all duration-300 overflow-hidden cursor-pointer ${
                      selectedAgents.has(agent.title) 
                        ? 'border-blue-1/50 bg-blue-1/5 shadow-[0_0_20px_rgba(59,111,255,0.1)]' 
                        : 'border-white/[0.06] hover:bg-white/[0.05] hover:border-blue-1/30'
                    }`}
                  >
                    {/* CHECKBOX INDICATOR */}
                    <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      selectedAgents.has(agent.title)
                        ? 'bg-blue-1 border-blue-1'
                        : 'border-white/20 bg-black/20'
                    }`}>
                      {selectedAgents.has(agent.title) && <Check size={12} className="text-white" />}
                    </div>

                    <div className="flex items-start gap-4 h-full">
                      <div className="w-14 h-14 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 relative group-hover:border-blue-1/50 transition-all">
                        <Image 
                          src={agent.image} 
                          alt={agent.title}
                          fill
                          className={`object-cover transition-all duration-500 ${
                            selectedAgents.has(agent.title) ? 'opacity-100 scale-110' : 'opacity-80 group-hover:opacity-100 group-hover:scale-110'
                          }`}
                        />
                      </div>
                      <div className="flex flex-col">
                        <h3 className={`font-head text-[0.95rem] font-bold mb-2 transition-colors leading-tight ${
                          selectedAgents.has(agent.title) ? 'text-blue-1' : 'text-text-1 group-hover:text-blue-1'
                        }`}>
                          {agent.title}
                        </h3>
                        <p className="text-[0.78rem] text-text-2 font-light leading-relaxed">
                          {agent.desc}
                        </p>
                      </div>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM CTA */}
        <MotionDiv 
          {...fadeUp} 
          transition={{ delay: 0.4 }}
          className="mt-24 p-10 lg:p-16 bg-grad-card border border-blue-1/20 rounded-3xl text-center relative overflow-hidden"
        >
          {/* TEXTURE LAYERS */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
          
          <div className="absolute inset-0 opacity-[0.1] pointer-events-none"
               style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`, backgroundSize: '32px 32px' }} />

          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-1/10 blur-[120px] -z-10" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-1/5 blur-[100px] -z-10" />
          <h3 className="font-head font-bold text-text-1 mb-10 max-w-[1000px] mx-auto leading-tight flex flex-col items-center gap-1">
            <span className="text-[0.75rem] uppercase tracking-[0.4em] text-blue-2 font-black mb-4 border border-blue-1/20 bg-blue-1/5 px-4 py-1.5 rounded-full">
              Dê o primeiro passo
            </span>
            <span className="text-[1.1rem] lg:text-[1.25rem] font-light opacity-80 tracking-wide">
              envie seus recursos selecionados e receba
            </span>
            <span className="text-[1.5rem] lg:text-[1.7rem] font-extrabold tracking-tight mt-1">
              um Planejamento Estratégico de 30 dias
            </span>
            <span className="text-[1.8rem] lg:text-[2.3rem] font-black grad-text italic tracking-tighter py-1">
              EXCLUSIVO PARA A SUA MARCA
            </span>
            <span className="text-[1rem] lg:text-[1.1rem] font-light opacity-70 mt-2">
              com insights e ações de
            </span>
            <span className="text-[2.2rem] lg:text-[3rem] font-black grad-text tracking-[-0.05em] leading-none mb-4">
              ALTO IMPACTO
            </span>
          </h3>

          <div className="max-w-[780px] mx-auto mb-12">
            <p className="text-text-1 text-[0.92rem] font-light leading-relaxed opacity-90">
              Público ideal, conteúdo e temas com maior relevância e oportunidades pouco exploradas são apresentadas e utilizadas para geração de conteúdo para suas redes sociais. Além de identificar termos em alta que podem contribuir para a otimização de suas campanhas patrocinadas.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={selectedAgents.size === 0}
            className={`btn ${selectedAgents.size === 0 ? 'opacity-50 cursor-not-allowed' : 'btn-primary'}`}
          >
            {selectedAgents.size === 0 ? 'Selecione pelo menos um agente' : 'EU QUERO'}
          </button>
        </MotionDiv>

      </div>

      {/* MODAL OVERLAY */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <MotionDiv
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-[#090B18] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-head text-2xl font-bold text-white">Solicitar Planejamento</h3>
                    <p className="text-text-2 text-sm mt-1">Confirme seus dados para receber o relatório.</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-lg">
                  <span className="text-[0.65rem] font-bold text-text-2 uppercase tracking-widest block mb-3">Recursos Selecionados ({selectedAgents.size})</span>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(selectedAgents).map(title => (
                      <span key={title} className="text-[0.7rem] bg-blue-1/10 text-blue-2 border border-blue-1/20 px-2 py-1 rounded">
                        {title}
                      </span>
                    ))}
                  </div>
                </div>

                {submitStatus === 'success' ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-blue-1/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-2">
                      <Check size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">Pedido Enviado!</h4>
                    <p className="text-text-2 text-sm">O Claudio Müller entrará em contato em breve.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {submitStatus === 'error' && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-xs">
                        Erro ao enviar. Verifique sua conexão e tente novamente.
                      </div>
                    )}
                    <div>
                      <label className="block text-[0.65rem] font-bold text-text-2 uppercase tracking-widest mb-2">Seu Nome</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Como podemos te chamar?"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-blue-1/50 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.65rem] font-bold text-text-2 uppercase tracking-widest mb-2">Seu Melhor E-mail</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="Para onde enviamos o planejamento?"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-blue-1/50 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.65rem] font-bold text-text-2 uppercase tracking-widest mb-2">Site da sua marca (Opcional)</label>
                      <input 
                        type="text" 
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        placeholder="URL do seu site atual"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-blue-1/50 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="flex gap-3 mt-8">
                      <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 px-6 py-4 rounded-lg font-bold text-sm text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] btn btn-primary flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          'SOLICITAR'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
