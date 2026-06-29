'use client';

import LegalLayout, { type LegalSection } from '@/components/neuroads/LegalLayout';
import { motion } from 'framer-motion';

const SECTIONS: LegalSection[] = [
  { id: 'introducao',      label: '1. Introdução'               },
  { id: 'coleta',          label: '2. Dados Coletados'          },
  { id: 'finalidade',      label: '3. Finalidade do Uso'        },
  { id: 'seguranca',       label: '4. Segurança e Retenção'     },
  { id: 'cookies',         label: '5. Cookies'                  },
  { id: 'direitos',        label: '6. Seus Direitos (LGPD)'     },
  { id: 'google',          label: '7. APIs do Google'           },
  { id: 'contato',         label: '8. Contato'                  },
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const },
};

function SectionCard({ id, num, title, children }: {
  id: string;
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-32 space-y-3">
      <h2 className="flex items-baseline gap-2.5 text-[1.05rem] font-black text-white">
        <span className="text-[#ff6a00] text-[0.9rem] tabular-nums">{num}.</span>
        {title}
      </h2>
      <div className="text-slate-300 text-[0.9rem] leading-[1.75] font-medium pl-6 border-l border-white/8 space-y-3">
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <LegalLayout
      sections={SECTIONS}
      docTitle="Política de Privacidade"
      updatedAt="Junho de 2026"
    >
      <motion.div {...fadeUp}>
        {/* Header */}
        <div className="mb-10 pb-8 border-b border-white/8">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#ff6a00]/12 border border-[#ff6a00]/25 px-3 py-1 text-[11px] font-black text-[#ff8f3a] mb-5">
            Documento Legal
          </p>
          <h1 className="text-[2rem] sm:text-[2.4rem] font-black text-white tracking-tight leading-[1.08] mb-4">
            Política de <span className="text-[#ff6a00] italic">Privacidade</span>
          </h1>
          <p className="text-slate-300 text-[0.97rem] leading-relaxed font-medium max-w-[640px]">
            Sua privacidade é fundamental para a NeuroAds. Esta política descreve como coletamos, usamos e protegemos
            suas informações quando você utiliza nossa plataforma e serviços de consultoria estratégica.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">

          <SectionCard id="introducao" num="1" title="Introdução">
            <p>
              A NeuroAds (&quot;nós&quot;, &quot;nosso&quot;) está comprometida em proteger a privacidade e os dados pessoais de nossos
              clientes e visitantes do site. Em conformidade com a Lei Geral de Proteção de Dados (LGPD), detalhamos
              aqui nossas práticas de tratamento de dados.
            </p>
          </SectionCard>

          <SectionCard id="coleta" num="2" title="Dados que Coletamos">
            <p>Coletamos informações voluntariamente fornecidas por você através de nossos formulários de diagnóstico, incluindo:</p>
            <ul className="list-none space-y-2">
              {[
                'Nome e informações de contato (E-mail corporativo, WhatsApp);',
                'Dados sobre o faturamento de sua empresa (para fins de qualificação e diagnóstico estratégico);',
                'Informações sobre a situação atual do seu marketing e vendas.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#ff6a00] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard id="finalidade" num="3" title="Finalidade do Uso">
            <p>Utilizamos seus dados para:</p>
            <ul className="list-none space-y-2">
              {[
                'Elaborar o Diagnóstico Estratégico personalizado solicitado;',
                'Entrar em contato para agendamento de reuniões consultivas;',
                'Personalizar a experiência de nossos agentes de IA (Lucca.os) para melhor atender às suas necessidades;',
                'Melhorar continuamente nossa plataforma e estratégias de marketing.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#ff6a00] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard id="seguranca" num="4" title="Segurança e Retenção">
            <p>
              Adotamos medidas técnicas e administrativas rigorosas para proteger seus dados contra acessos não
              autorizados. Seus dados são mantidos apenas pelo tempo necessário para cumprir as finalidades para as
              quais foram coletados ou conforme exigido por lei.
            </p>
          </SectionCard>

          <SectionCard id="cookies" num="5" title="Cookies">
            <p>
              Utilizamos cookies e tecnologias similares para analisar tendências, administrar o site e rastrear os
              movimentos dos usuários ao redor do site para melhorar a performance de nossas campanhas de tráfego pago.
            </p>
          </SectionCard>

          <SectionCard id="direitos" num="6" title="Seus Direitos (LGPD)">
            <p>
              De acordo com a LGPD, você tem direito de acessar, corrigir, anonimizar ou excluir seus dados pessoais
              de nossa base. Para exercer esses direitos, entre em contato através do e-mail abaixo.
            </p>
          </SectionCard>

          <SectionCard id="google" num="7" title="Compartilhamento de Dados do Google">
            <p>
              A NeuroAds utiliza APIs do Google (incluindo Google Ads, Google Analytics, Google Search Console e
              Google BigQuery) exclusivamente para fins internos de operação e prestação de serviços aos nossos clientes.
            </p>
            <p>Não compartilhamos, transferimos nem divulgamos dados de usuários obtidos por meio das APIs do Google a terceiros, exceto:</p>
            <ul className="list-none space-y-2">
              {[
                'Quando exigido por lei ou ordem judicial;',
                'Para prestadores de serviços essenciais à operação da plataforma, mediante acordo de confidencialidade e apenas na medida necessária;',
                'Com o consentimento explícito do usuário.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#ff6a00] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p>
              O uso de dados obtidos por meio das APIs do Google está em conformidade com a Política de Dados do
              Usuário dos Serviços de API do Google, incluindo os requisitos de Uso Limitado (Limited Use).
            </p>
          </SectionCard>

          <SectionCard id="contato" num="8" title="Contato">
            <p>Nossa equipe de proteção de dados está à disposição para esclarecer qualquer ponto desta política.</p>
            <a
              href="mailto:avante@neuroads.com.br"
              className="inline-block font-black text-[#ff8f3a] hover:underline text-[0.9rem]"
              style={{ textDecoration: 'none' }}
            >
              avante@neuroads.com.br
            </a>
          </SectionCard>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-white/8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-slate-400 text-[0.88rem] font-medium">
              Em conformidade com a LGPD — Lei nº 13.709/2018
            </p>
            <p className="text-slate-600 text-[0.72rem] uppercase tracking-widest font-bold whitespace-nowrap">
              Junho de 2026 · NeuroAds Laboratory
            </p>
          </div>
        </div>
      </motion.div>
    </LegalLayout>
  );
}
