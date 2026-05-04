'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

const faqItems = [
  {
    q: 'O que é a NeuroAds e como ela pode ajudar meu negócio?',
    a: 'A NeuroAds é uma operação de marketing orientada por IA agêntica. Combinamos estratégia, tráfego pago, automação e inteligência de dados para gerar crescimento previsível, com foco em leads qualificados e aumento de ROI.'
  },
  {
    q: 'Para quais tipos de empresa a solução é indicada?',
    a: 'Atendemos empresas que querem escalar aquisição e vendas com mais eficiência, especialmente PMEs e negócios em fase de crescimento que já investem, ou querem investir, em marketing digital com visão de performance.'
  },
  {
    q: 'Preciso contratar todos os agentes de IA?',
    a: 'Não. Você pode ativar apenas os agentes mais relevantes para o seu momento. A proposta é modular, permitindo começar com o essencial e evoluir conforme metas e maturidade da operação.'
  },
  {
    q: 'Preciso manter contrato mensal com a NeuroAds para usar os agentes?',
    a: 'Não. Implantamos os agentes necessários para sua operação sem vínculo mensal obrigatório. Se você quiser suporte contínuo, evolução ou novos agentes, isso pode ser contratado separadamente.'
  },
  {
    q: 'Em quanto tempo começo a ver resultados?',
    a: 'Depende do cenário atual, do orçamento e da velocidade de implementação. Em geral, já é possível observar ganhos iniciais de organização e performance nas primeiras semanas, com evolução consistente nos ciclos seguintes.'
  },
  {
    q: 'Vocês também cuidam da parte estratégica, além da execução?',
    a: 'Sim. No modelo de implantação, começamos com diagnóstico e estratégia para definir prioridades e colocar os agentes certos em produção. Depois disso, serviços recorrentes ficam como opção, não como obrigação.'
  },
  {
    q: 'Como funciona o diagnóstico inicial?',
    a: 'Após sua solicitação, analisamos contexto, objetivos, oferta e canais atuais. A partir disso, montamos um plano prático de 30 dias com ações recomendadas, prioridades e hipóteses de ganho.'
  },
  {
    q: 'A NeuroAds substitui minha equipe interna?',
    a: 'Não necessariamente. Na maioria dos casos, a NeuroAds potencializa sua equipe interna, eliminando gargalos operacionais e acelerando decisões com inteligência aplicada.'
  },
  {
    q: 'Vocês trabalham com SEO/GEO e presença em respostas de IA?',
    a: 'Sim. Além de tráfego e conversão, aplicamos práticas de autoridade semântica e GEO para aumentar a chance da sua marca ser citada em mecanismos generativos e buscas orientadas por IA.'
  },
  {
    q: 'Qual é o investimento mínimo para começar?',
    a: 'O investimento varia conforme escopo, objetivos e canais escolhidos. O diagnóstico inicial ajuda a definir um plano viável para seu momento, equilibrando velocidade de execução e retorno esperado.'
  },
  {
    q: 'Como faço para começar agora?',
    a: 'Basta preencher o formulário no final da página com seus dados e objetivo principal. Após isso, nosso time retorna com os próximos passos e a proposta de implementação recomendada para sua operação.'
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
  };

  return (
    <section className="py-24 lg:py-32 bg-transparent" id="faq">
      <div className="wrap">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-14">
            <MotionP {...fadeUp} className="s-badge justify-center">
              Dúvidas Frequentes
            </MotionP>
            <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title">
              Respostas objetivas para acelerar sua <span className="text-primary italic">decisão</span>
            </MotionH2>
            <MotionP {...fadeUp} transition={{ delay: 0.2 }} className="s-body mx-auto mt-6">
              Reunimos as perguntas mais comuns sobre nossa operação, escopo e resultados para facilitar seu próximo passo.
            </MotionP>
          </div>

          <MotionDiv {...fadeUp} transition={{ delay: 0.25 }} className="p-1 rounded-[36px] bg-gradient-to-br from-white/40 via-orange-300 to-[#FF6B00] shadow-[0_30px_80px_-20px_rgba(255,107,0,0.25)]">
            <div className="bg-white/85 rounded-[32px] p-3 sm:p-4">
              <div className="space-y-3">
                {faqItems.map((item, index) => {
                  const isOpen = openIndex === index;
                  return (
                    <div key={item.q} className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
                      <button
                        onClick={() => setOpenIndex(isOpen ? -1 : index)}
                        className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-5 sm:py-6 hover:bg-bg-secondary/60 transition-colors"
                      >
                        <span className="font-bold text-[15px] sm:text-[16px] leading-snug text-text-main pr-2">{item.q}</span>
                        <span className="w-8 h-8 rounded-full bg-orange-light border border-primary/10 flex items-center justify-center flex-shrink-0">
                          <ChevronDown
                            size={16}
                            className={`text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 sm:px-6 pb-6 pt-1">
                              <p className="text-[14px] sm:text-[15px] text-text-muted leading-relaxed">{item.a}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}
