'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import CreativeStudio from '../tools/CreativeStudio';
import LPAuditor from '../tools/LPAuditor';
import { agents, Agent } from '../../data/agents';

export default function ToolGallery() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedTool, setSelectedTool] = useState<Agent | null>(null);

  const categories = ['Todos', 'Performance', 'Inteligência', 'Criativos', 'Técnico'];

  const tools = agents;

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
              className={`relative w-full ${
                ['Gerador de Criativos', 'Gerador de Copies de Conversão', 'Diagnóstico de Landing Page'].includes(selectedTool.title) 
                ? 'max-w-5xl' 
                : 'max-w-2xl'
              } bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto`}
            >
              <div className="relative h-32 bg-gradient-to-br from-[var(--color-brand-orange)]/20 to-transparent flex items-center px-12">
                <div className="flex items-center gap-6">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-2xl ring-2 ring-white/10">
                     <Image src={selectedTool.icon} alt={selectedTool.title} fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight uppercase text-white">
                      {selectedTool.title}
                    </h3>
                    <p className="text-[var(--color-brand-orange)] font-mono text-[10px] uppercase tracking-[0.2em]">
                      Sistemas Neurais Ativos
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTool(null)}
                  className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-red-500/20 text-white rounded-full transition-all border border-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 md:p-12">
                {/* Interactive Tools Content */}
                {['Gerador de Criativos', 'Gerador de Copies de Conversão'].includes(selectedTool.title) ? (
                   <CreativeStudio />
                ) : selectedTool.title === 'Diagnóstico de Landing Page' ? (
                   <LPAuditor />
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
