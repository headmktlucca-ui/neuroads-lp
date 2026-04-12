'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, MessageSquare } from 'lucide-react';
import Image from 'next/image';

interface Tool {
  title: string;
  description: string;
  longDescription: string;
  icon: string;
  color: string;
  category: string;
}

export default function ToolGallery() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const categories = ['Todos', 'Performance', 'Inteligência', 'Criativos', 'Técnico'];

  const tools: Tool[] = [
    {
      title: 'Analista de Tráfego',
      description: 'Diagnóstico neural de campanhas com tomada de decisão automática baseada em ROI.',
      longDescription: 'Uma inteligência artificial avançada que se conecta diretamente às suas contas de anúncios (Google e Meta) para realizar diagnósticos em tempo real. Identifica desperdícios de orçamento, campanhas com fadiga de criativo e sugere ajustes automáticos de lances baseados no seu ROI alvo, otimizando cada centavo do seu investimento.',
      icon: '/images/tools/analista_trafego.png',
      color: 'var(--color-brand-orange)',
      category: 'Performance'
    },
    {
      title: 'Gerador de Criativos',
      description: 'Criação de copies e conceitos visuais de alto impacto validados por padrões de conversão.',
      longDescription: 'Esta ferramenta utiliza modelos de visão computacional e análise de dados históricos de milhares de anúncios para sugerir layouts e conceitos visuais com alta probabilidade de conversão. Ela analisa os padrões visuais que mais performam no seu nicho e gera briefs detalhados prontos para execução.',
      icon: '/images/tools/gerador_criativos.png',
      color: 'var(--color-brand-orange)',
      category: 'Criativos'
    },
    {
      title: 'Gerador de Copies de Conversão',
      description: 'Motor rápido focado na geração expressa de headlines, CTAs chamativos e argumentos diretos.',
      longDescription: 'Especializado em frameworks de persuasão neuro-cognitiva (AIDA, PAS). Este motor gera dezenas de variações de anúncios em segundos, focando em quebrar objeções específicas do seu avatar e destacar os diferenciais competitivos da sua oferta de forma irresistível.',
      icon: '/images/tools/gerador_copies.png',
      color: 'var(--color-brand-orange)',
      category: 'Criativos'
    },
    {
      title: 'Análise Viral',
      description: 'Identificação de padrões de conteúdo com alto potencial de compartilhamento.',
      longDescription: 'Detecta o "pulso" das redes sociais em tempo real. Analisa quais ganchos (hooks) e estruturas de vídeo estão gerando tração exponencial no seu nicho, permitindo que sua marca produza conteúdo "trend-aware" que já nasce com alto potencial de compartilhamento e retenção.',
      icon: '/images/tools/analise_viral.png',
      color: 'var(--color-brand-orange)',
      category: 'Criativos'
    },
    {
      title: 'Rastreador Cirúrgico',
      description: 'Implementação de tracking Lado-Servidor para ignorar bloqueios de cookies.',
      longDescription: 'Uma solução robusta de rastreamento Server-Side. Garante atribuição precisa mesmo após as mudanças do iOS14+, enviando dados diretos de servidor para servidor para as plataformas. Isso permite que seus algoritmos de otimização recebam dados limpos, reduzindo o CPA drasticamente.',
      icon: '/images/tools/rastreador_cirurgico.png',
      color: 'var(--color-brand-orange)',
      category: 'Técnico'
    },
    {
      title: 'Preditor de Funil',
      description: 'Simulação de cenários de escala e previsão de ROI antes de investir.',
      longDescription: 'Um simulador matemático de alta fidelidade para funis de vendas. Projeta cenários de faturamento e lucro com base em taxas de conversão, CPC e ticket médio. Permite stress-test da sua operação antes de escalar o orçamento no gerenciador de anúncios.',
      icon: '/images/tools/preditor_funil.png',
      color: 'var(--color-brand-orange)',
      category: 'Técnico'
    },
    {
      title: 'Diagnóstico de Landing Page',
      description: 'Análise de problemas de conversão, UX e clareza da oferta da sua página final.',
      longDescription: 'Auditoria algorítmica de páginas de destino. Avalia tempo de resposta, legibilidade mobile, hierarquia de informações e força da oferta (Value Proposition). Aponta cirurgicamente onde os usuários estão "dropando" e sugere correções de layout para aumentar a taxa de conversão.',
      icon: '/images/tools/diagnostico_lp.png',
      color: 'var(--color-brand-orange)',
      category: 'Inteligência'
    },
    {
      title: 'Simulador de ROAS',
      description: 'Projete sua meta de faturamento e descubra o investimento necessário.',
      longDescription: 'Calculadora de metas reversa. Define exatamente quanto você precisa alocar em anúncios para atingir um faturamento específico, considerando margem de lucro operacional e taxas de gateway. Essencial para planejamento de fluxo de caixa em lançamentos ou perenidade.',
      icon: '/images/tools/simulador_roas.png',
      color: 'var(--color-brand-orange)',
      category: 'Performance'
    },
    {
      title: 'Analisador de Público',
      description: 'Refinamento avançado com sugestões de segmentações prontas por nicho.',
      longDescription: 'Cruza dados de interesses e comportamentos ocultos para encontrar o "oceano azul" no Facebook e Google. Sugere combinações de públicos que seus concorrentes desconhecem, permitindo que você anuncie para pessoas altamente qualificadas com menor custo por clique.',
      icon: '/images/tools/analisador_publico.png',
      color: 'var(--color-brand-orange)',
      category: 'Inteligência'
    },
    {
      title: 'Diagnóstico de Funil',
      description: 'Mapeamento visual do seu gargalo identificando as quebras no fluxo.',
      longDescription: 'Identifica visualmente os vazamentos no seu processo de vendas. Mapeia a jornada do cliente desde o primeiro clique até o checkout, destacando onde a perda de tráfego é anormal e sugerindo novos pontos de contato para recuperação de vendas.',
      icon: '/images/tools/diagnostico_funil.png',
      color: 'var(--color-brand-orange)',
      category: 'Técnico'
    },
    {
      title: 'Auditor de Desperdício',
      description: 'Escaneia a conta isolando gastos que não revertem em vendas.',
      longDescription: 'Algoritmo de varredura negativa. Localiza termos de pesquisa irrelevantes, posicionamentos de baixa performance e horários de pico onde o orçamento é drenado sem conversão. Uma ferramenta obrigatória para quem deseja "limpar" o tráfego e focar apenas no que traz lucro.',
      icon: '/images/tools/auditor_desperdicio.png',
      color: 'var(--color-brand-orange)',
      category: 'Performance'
    },
    {
      title: 'Otimizador de Orçamento',
      description: 'Redistribuição tática do seu budget para alavancar performance.',
      longDescription: 'Sugere a alocação dinâmica de verba entre diferentes campanhas e plataformas (CBO/ABO). Utiliza estatística bayesiana para prever quais campanhas têm maior probabilidade de manter o ROI se receberem mais verba nas próximas 24 horas.',
      icon: '/images/tools/alocacao.png',
      color: 'var(--color-brand-orange)',
      category: 'Performance'
    },
    {
      title: 'Gerador de Testes A/B',
      description: 'Roteirizador inteligente que projeta variações ideais de anúncios.',
      longDescription: 'Cria protocolos de testes estatisticamente válidos. Define quais elementos (Headline, Criativo, CTA) devem ser testados primeiro para obter o maior ganho de performance no menor tempo possível, eliminando a "adivinhação" do tráfego pago.',
      icon: '/images/tools/testes.png',
      color: 'var(--color-brand-orange)',
      category: 'Técnico'
    },
    {
      title: 'Avaliador de Oferta',
      description: 'Varredura sistêmica na sua estruturação de preço-valor.',
      longDescription: 'Analisa matematicamente quão atraente sua oferta é comparada ao benchmark do mercado. Avalia bônus, garantias e ancoragem de preço, fornecendo um Score de Atratividade que prediz a facilidade de venda do produto.',
      icon: '/images/tools/mineracao.png',
      color: 'var(--color-brand-orange)',
      category: 'Inteligência'
    },
    {
      title: 'Radar de Oportunidades',
      description: 'Detecção contínua de canais subestimados e oceano azul.',
      longDescription: 'Rastreador de fontes de tráfego emergentes. Monitora mudanças nos algoritmos e novas redes de display/pesquisa onde a atenção do usuário está barata, permitindo o pioneirismo em novos canais de aquisição de clientes.',
      icon: '/images/tools/analise.png',
      color: 'var(--color-brand-orange)',
      category: 'Inteligência'
    },
    {
      title: 'DNA da Marca',
      description: 'Elaboração de documento estratégico com tom de voz e pilares.',
      longDescription: 'Define a identidade neural da sua marca para anúncios. Cria um guia de comunicação que garante unidade visual e verbal através de todos os canais, aumentando a lembrança de marca e a confiança mútua entre cliente e empresa.',
      icon: '/images/tools/dna_marca.png',
      color: 'var(--color-brand-orange)',
      category: 'Inteligência'
    },
    {
      title: 'Análise de Concorrentes',
      description: 'Varredura profunda para identificar estratégias dos rivais.',
      longDescription: 'Ferramenta de inteligência competitiva. Monitora a biblioteca de anúncios e ofertas de concorrentes em tempo real, alertando sobre novos criativos que estão escalando ou mudanças nas estratégias de retenção deles.',
      icon: '/images/tools/concorrentes.png',
      color: 'var(--color-brand-orange)',
      category: 'Inteligência'
    },
    {
      title: 'Público-Alvo Ideal',
      description: 'Pesquisa neural de segmentação e engajamento social.',
      longDescription: 'Constrói o avatar definitivo com base em pegadas digitais reais. Vai além de idade e gênero, identificando "clusters" de interesses correlacionados que movem a decisão de compra no subconsciente do seu público.',
      icon: '/images/tools/publico_ideal.png',
      color: 'var(--color-brand-orange)',
      category: 'Inteligência'
    }
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const filteredTools = activeCategory === 'Todos' 
    ? tools 
    : tools.filter(tool => tool.category === activeCategory);

  return (
    <>
      <section className="pt-8 pb-24 bg-black relative overflow-hidden shadow-[0_-20px_50px_rgba(249,166,32,0.05),0_20px_50px_rgba(204,255,0,0.05)]">
        {/* Creative Background Layout */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,#000_30%,transparent_100%)]"></div>
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
        </div>

        <div className="max-w-full mx-auto px-6 md:px-12 lg:px-16 relative z-10">
          <div className="flex flex-col mb-12">
            <div className="w-full mb-10">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight uppercase">
                Hub <br />
                <span className="text-[var(--color-brand-orange)]">Estratégico</span>
              </h2>
              <p className="text-slate-400 font-light leading-relaxed text-[20px] max-w-3xl">
                Seus resultados atuais não são o limite — são o ponto de partida. O Hub Estratégico conecta aplicações que amplificam performance.
              </p>
            </div>

            <div className="flex justify-start md:justify-end mb-8">
              <div className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-3 bg-[#0D0D0D] p-1.5 border border-white/10 rounded-xl max-w-full md:max-w-max shadow-2xl">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2 text-[12px] font-bold tracking-widest uppercase transition-all rounded-lg whitespace-nowrap flex-shrink-0 ${
                      activeCategory === cat 
                        ? 'bg-[var(--color-brand-orange)] text-black shadow-[0_0_20px_rgba(249,166,32,0.3)]' 
                        : 'text-slate-500 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative group/gallery px-4 md:px-12">
            {/* Floating Navigation Arrows */}
            <button 
              onClick={() => scroll('left')}
              className="absolute -left-2 md:left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[var(--color-brand-green)]/70 border border-white/20 flex items-center justify-center hover:bg-[var(--color-brand-green)] hover:scale-110 active:scale-95 transition-all text-black opacity-0 group-hover/gallery:opacity-100 shadow-[0_0_30px_rgba(204,255,0,0.2)] backdrop-blur-md"
              aria-label="Anterior"
            >
              <ChevronLeft size={24} strokeWidth={3} />
            </button>
            
            <button 
              onClick={() => scroll('right')}
              className="absolute -right-2 md:right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[var(--color-brand-green)]/70 border border-white/20 flex items-center justify-center hover:bg-[var(--color-brand-green)] hover:scale-110 active:scale-95 transition-all text-black opacity-0 group-hover/gallery:opacity-100 shadow-[0_0_30px_rgba(204,255,0,0.2)] backdrop-blur-md"
              aria-label="Próximo"
            >
              <ChevronRight size={24} strokeWidth={3} />
            </button>

            <div 
              ref={scrollRef}
              className="grid grid-rows-1 grid-flow-col auto-cols-[300px] md:auto-cols-[380px] gap-6 overflow-x-auto scrollbar-hide pt-10 pb-12 snap-x snap-mandatory px-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredTools.map((tool, index) => (
                  <motion.div
                    key={tool.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group glass-card p-8 cursor-pointer hover:border-[var(--color-brand-orange)]/50 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(249,166,32,0.1)] transition-all duration-300 flex flex-col min-h-[320px] relative overflow-hidden snap-start"
                    onClick={() => setSelectedTool(tool)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-orange)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="mb-6 relative z-10">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(249,166,32,0.15)] ring-1 ring-white/10 group-hover:ring-[var(--color-brand-orange)]/50 transition-all">
                        <Image src={tool.icon} alt={tool.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-xl font-bold mb-3 tracking-tight group-hover:text-[var(--color-brand-orange)] transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-sm leading-relaxed mb-6 text-slate-400">
                        {tool.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-end pt-6 border-t border-white/5">
                      <button
                        className="h-10 flex items-center gap-1 text-[var(--color-brand-orange)] text-xs font-bold hover:gap-2 transition-all cursor-pointer bg-transparent border-none p-0 focus:outline-none uppercase tracking-widest"
                      >
                        SAIBA MAIS <span className="text-lg">→</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedTool && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTool(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="relative h-48 bg-gradient-to-br from-[var(--color-brand-orange)]/20 to-transparent flex items-center justify-center">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/10">
                   <Image src={selectedTool.icon} alt={selectedTool.title} fill className="object-cover" />
                </div>
                <button 
                  onClick={() => setSelectedTool(null)}
                  className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-red-500/20 text-white rounded-full transition-all border border-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 md:p-12">
                <h3 className="text-3xl font-black mb-4 tracking-tight uppercase text-white">
                  {selectedTool.title}
                </h3>
                <p className="text-[var(--color-brand-orange)] font-mono text-xs uppercase tracking-[0.2em] mb-8">
                  Estratégia Neural Avançada
                </p>
                <p className="text-slate-300 text-lg leading-relaxed mb-10">
                  {selectedTool.longDescription}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5">
                  <a 
                    href="https://wa.me/5511999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-grow bg-[var(--color-brand-orange)] text-black px-8 py-4 font-black tracking-widest uppercase italic flex items-center justify-center gap-3 hover:bg-[var(--color-brand-green)] transition-all skew-x-[-12deg]"
                  >
                    <span className="skew-x-[12deg] flex items-center gap-2">
                       <MessageSquare size={18} /> ENTRAR EM CONTATO
                    </span>
                  </a>
                  <button 
                    onClick={() => setSelectedTool(null)}
                    className="px-8 py-4 font-black tracking-widest uppercase italic border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all skew-x-[-12deg]"
                  >
                    <span className="skew-x-[12deg]">FECHAR</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
