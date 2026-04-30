'use client';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: "Juliana Mendes",
    company: "E-commerce de Moda",
    text: "A implementação da metodologia da NeuroAds resultou em uma redução de 62% no CPA em apenas 4 semanas. Corrigimos nossos funis e o volume de vendas operacionais dobrou.",
    logo: "M" // Represents Meta/Facebook simplified
  },
  {
    name: "Ricardo Silva",
    company: "Clínica Odontológica",
    text: "Passei anos jogando dinheiro fora. A equipe reestruturou toda a nossa aquisição e escalei minha clínica faturando de R$ 150k para R$ 400k mensais com o mesmo investimento em tráfego.",
    logo: "G" // Represents Google simplified
  },
  {
    name: "Marina Costa",
    company: "SaaS B2B",
    text: "A implementação de funis inteligentes e integração de CRM junto com tráfego finalmente fez a máquina de vendas B2B rodar com previsibilidade e 40% de aumento no ROI.",
    logo: "M"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4"
          >
            Depoimentos
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-24 h-1 bg-slate-300 mx-auto rounded-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 flex flex-col justify-between"
            >
              <div className="mb-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-xl font-bold text-slate-500">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{testimonial.company}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[var(--color-brand-blue)] flex items-center justify-center font-black">
                    {testimonial.logo}
                  </div>
                </div>
                <p className="text-slate-600 italic leading-relaxed">&quot;{testimonial.text}&quot;</p>
              </div>
              <div className="flex text-yellow-500 gap-1">
                {/* 5 Stars */}
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
