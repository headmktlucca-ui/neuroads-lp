'use client';
import { motion } from 'framer-motion';
import { Target, FilterX, TrendingDown } from 'lucide-react';

const painPoints = [
  {
    icon: <TrendingDown className="w-8 h-8 text-[var(--color-brand-orange)]" />,
    title: "Orçamentos Drenados",
    description: "Enquanto agências tradicionais focam em métricas de vaidade, seu dinheiro desaparece sem gerar clientes qualificados."
  },
  {
    icon: <FilterX className="w-8 h-8 text-[var(--color-brand-orange)]" />,
    title: "Leads Frios e Vazios",
    description: "Seu time comercial perde tempo com contatos sem perfil de compra devido a campanhas sem direcionamento inteligente."
  },
  {
    icon: <Target className="w-8 h-8 text-[var(--color-brand-orange)]" />,
    title: "O Efeito Balde Furado",
    description: "Alto volume de visitas que abandonam o site por gargalos de UX e ausência de uma estratégia de remarketing sólida."
  }
];

export default function PainPoints() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
          >
            Suas Campanhas Estão Gerando o Retorno Que Você Merece?
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-24 h-1 bg-[var(--color-brand-orange)] mx-auto rounded-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {painPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="p-8 rounded-2xl bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-6">
                {point.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{point.title}</h3>
              <p className="text-slate-600 leading-relaxed">{point.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
