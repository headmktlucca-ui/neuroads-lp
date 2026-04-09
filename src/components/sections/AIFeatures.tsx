'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

const aiFeatures = [
  {
    icon: "/images/tools/otimizacao.png",
    title: "1. Otimização de Lances em Tempo Real",
    description: "Sistemas automatizados que monitoram leilões do Google e da Meta a cada milissegundo, blindando seu orçamento contra flutuações de algoritmo e extraindo o menor Custo por Conversão possível."
  },
  {
    icon: "/images/tools/automacao.png",
    title: "2. Automação de Nutrição Neural",
    description: "Mapeamento comportamental que ativa fluxos de engajamento baseados no nível de interesse do usuário, acelerando o fechamento de vendas complexas."
  },
  {
    icon: "/images/tools/testes.png",
    title: "3. Testes A/B Escalados por IA",
    description: "Nossa inteligência cria centenas de variações de cópia e criativos, isolando variáveis vencedoras para que seu anúncio sempre tenha alta relevância e menor custo no leilão."
  },
  {
    icon: "/images/tools/analise.png",
    title: "4. Análise Preditiva de Conversão",
    description: "Prevemos comportamentos mapeando padrões de compra para sempre focarmos o investimento no canal de maior ROI e previsibilidade de caixa."
  },
  {
    icon: "/images/tools/mineracao.png",
    title: "5. Mineração de Públicos Ocultos",
    description: "Análise transversal de dados para descobrir fragmentos de audiências hiper-qualificadas com baixo custo de arremate, escalando sua operação além do óbvio."
  },
  {
    icon: "/images/tools/alocacao.png",
    title: "6. Alocação Dinâmica de Verba",
    description: "Redirecionamento algorítmico do seu investimento para as frentes e os criativos de melhor performance contínua, prevenindo sangramento de caixa em contas travadas."
  }
];

export default function AIFeatures() {
  return (
    <section className="py-24 bg-black relative overflow-hidden border-t border-white/5" id="automacao">
      {/* Modular Background Layout */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="/images/minimalist_expert_bg.png"
          alt="Neural Tech Background"
          fill
          quality={100}
          className="object-cover opacity-75 scale-x-[-1] scale-y-[-1]"
        />
        {/* Top and Bottom soft fade using gradients */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            IA e Automação: O Futuro da Sua Estratégia.
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-24 h-1 bg-[var(--color-brand-orange)] mx-auto rounded-full"
          />
        </div>

        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 rounded-2xl shadow-lg border border-white/5 hover:border-[var(--color-brand-orange)]/50 hover:-translate-y-1 transition-all duration-300 h-full"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(249,166,32,0.15)] ring-1 ring-white/10 group-hover:ring-[var(--color-brand-orange)]/50 transition-all">
                    <Image src={feature.icon} alt={feature.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
