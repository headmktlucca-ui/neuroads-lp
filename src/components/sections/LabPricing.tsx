'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Check, Zap, Crown } from 'lucide-react';

export default function LabPricing() {
  const plans = [
    {
      name: 'Freemium',
      price: '0',
      description: 'Experimente o poder neural sem custos.',
      features: [
        '01 Acesso por semana/app',
        'Diagnósticos IA Essenciais',
        'Visualização Web',
        'Fórum da Comunidade'
      ],
      icon: Zap,
      cta: 'COMEÇAR GRÁTIS',
      highlight: false
    },
    {
      name: 'God Mode',
      price: '49',
      description: 'Domine o tráfego com automação total.',
      features: [
        'Acessos Ilimitados',
        'Dashboard de Evolução',
        'Agendamento de Execução',
        'PDF Individual por Email',
        'IA NeuroAds Master (Prioridade)'
      ],
      icon: Crown,
      cta: 'ATIVAR GOD MODE',
      highlight: true
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-black relative overflow-hidden">
      {/* Minimalist Tech Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/images/neural-bg.jpg"
          alt="Tech Background"
          fill
          className="object-cover object-bottom opacity-15 grayscale scale-x-[-1]"
        />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Decorative vertical lines */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-white/5 opacity-50 z-0" />
      <div className="absolute top-0 right-1/4 w-px h-full bg-white/5 opacity-50 z-0" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight uppercase [word-spacing:0.15em]">
            Desbloqueie todo <br />
            <span className="text-[var(--color-brand-orange)]">potencial da sua marca</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto font-mono text-sm uppercase tracking-widest">
            Escolha o nível de inteligência que seu tráfego exige hoje.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-white/10 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`p-10 flex flex-col ${plan.highlight
                ? 'bg-[var(--color-brand-orange)]/5 border-x-0 md:border-x border-white/10 relative'
                : 'bg-transparent'
                } hover:bg-white/[0.02] transition-colors group`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-brand-orange)] text-black text-[10px] font-black px-4 py-1 tracking-widest uppercase">
                  MAIS VENDIDO
                </div>
              )}

              <div className="mb-8">
                <plan.icon size={40} className={plan.highlight ? 'text-[var(--color-brand-orange)]' : 'text-white'} />
              </div>

              <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-sm font-mono text-slate-500 uppercase">R$</span>
                <span className="text-5xl font-black">{plan.price}</span>
                <span className="text-sm font-mono text-slate-500 uppercase">{plan.name === 'Assinatura Lab' ? '/MÊS' : ''}</span>
              </div>

              <p className="text-slate-400 text-sm mb-8 leading-relaxed italic">"{plan.description}"</p>

              <div className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <Check size={16} className="text-[var(--color-brand-green)] shrink-0" />
                    <span className="text-slate-300 text-sm tracking-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-4 font-black tracking-widest text-sm skew-x-[-12deg] transition-all ${plan.highlight
                ? 'bg-[var(--color-brand-orange)] text-black hover:bg-[var(--color-brand-green)]'
                : 'border border-white/20 text-white hover:border-[var(--color-brand-orange)] hover:text-[var(--color-brand-orange)]'
                }`}>
                <span className="inline-block skew-x-[12deg]">{plan.cta}</span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
