'use client';
import { motion } from 'framer-motion';
import { BarChart3, Filter, CheckCircle2 } from 'lucide-react';

export default function Pillars() {
  const pillars = [
    {
      icon: <BarChart3 className="w-10 h-10 text-[var(--color-brand-blue)]" />,
      title: "Gestão de Tráfego Preditivo",
      description: "Não fazemos apostas com o seu dinheiro. Utilizamos modelagem de dados para comprar tráfego nas redes focado exclusivamente em usuários no momento de compra (fundo de funil).",
      features: [
        "Google Ads Masterizado",
        "Meta Ads de Alta Conversão",
        "Controle de Lances por Algoritmos",
        "Remarketing Inteligente Omnichannel"
      ]
    },
    {
      icon: <Filter className="w-10 h-10 text-[var(--color-brand-blue)]" />,
      title: "Ecossistema de Conversão",
      description: "O clique é só o começo. Desenhamos Landing Pages persuasivas, automações de e-mail e integração de CRM que transformam visitantes curiosos em clientes retidos de alto valor.",
      features: [
        "Landing Pages que Convertem+",
        "Jornada do Cliente Personalizada",
        "Estratégia de Aquisição Direta",
        "Aumento Automático de LTV"
      ]
    }
  ];

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-100" id="servicos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4"
          >
            Nossos Pilares de Crescimento
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-24 h-1 bg-[var(--color-brand-blue)] mx-auto rounded-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 max-w-5xl mx-auto">
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-[2rem] p-10 lg:p-12 shadow-xl hover:shadow-2xl transition-all border border-slate-100"
            >
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 mb-6">
                  {pillar.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6 leading-tight">{pillar.title}</h3>
              </div>
              
              <p className="text-slate-600 mb-8 leading-relaxed">
                {pillar.description}
              </p>

              <ul className="space-y-5">
                {pillar.features.map((feature, fIndex) => (
                  <motion.li 
                    key={fIndex}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (fIndex * 0.1) }}
                    className="flex items-start gap-4"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-lg text-slate-700 font-medium">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
