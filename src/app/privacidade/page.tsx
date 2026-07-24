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
      <h2 className="flex items-baseline gap-2.5 text-[1.05rem] font-black text-slate-900">
        <span className="text-[#FF5500] text-[0.9rem] tabular-nums">{num}.</span>
        {title}
      </h2>
      <div className="text-slate-600 text-[0.9rem] leading-[1.75] font-medium pl-6 border-l border-slate-300/40 space-y-3">
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
        <div className="mb-10 pb-8 border-b border-slate-300/30">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20 px-3 py-1 text-[11px] font-black text-[#FF5500] mb-5">
            Documento Legal
          </p>
          <h1 className="text-[2rem] sm:text-[2.4rem] font-black text-slate-900 tracking-tight leading-[1.08] mb-4">
            Política de <span className="text-[#FF5500] italic">Privacidade</span>
          </h1>
          <p className="text-slate-600 text-[0.97rem] leading-relaxed font-medium max-w-[640px]">
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
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#FF5500] shrink-0" />
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
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#FF5500] shrink-0" />
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

          <SectionCard id="google" num="7" title="Uso de APIs do Google e Integrações de IA">
            <p>
              A NeuroAds utiliza APIs do Google (incluindo Google Ads, Google Analytics, Google Search Console, Google BigQuery, 
              Google Calendar e Gmail) exclusivamente para fins internos de operação, consolidação de dados e prestação de serviços aos nossos clientes.
            </p>
            <p>
              Em estrita conformidade com a <strong>Política de Dados do Usuário do Google Workspace (Google Workspace API User Data and Developer Policy)</strong>, 
              nós garantimos que <strong>nenhum dado de usuário obtido por meio de APIs do Google Workspace</strong> (como informações de Gmail e eventos do Google Calendar) 
              — sejam eles brutos, agregados ou derivados — é utilizado, transferido ou vendido para criar, treinar ou aprimorar modelos de 
              inteligência artificial ou aprendizado de máquina (incluindo modelos de linguagem de grande porte - LLMs públicos ou generalistas).
            </p>
            <p>
              Para a execução de recursos inteligentes de assistência, a plataforma integra-se com APIs corporativas de provedores de IA (como OpenAI API, Anthropic Claude API e Google Gemini API). 
              Esta integração ocorre sob termos de uso estritamente corporativos e de desenvolvimento, os quais:
            </p>
            <ul className="list-none space-y-2">
              {[
                'Proíbem expressamente o uso de qualquer dado do cliente ou histórico de prompts para o treinamento de modelos dos respectivos provedores;',
                'Garantem o isolamento completo de dados e processamento temporário em memória;',
                'Mantêm conformidade rígida com os regulamentos de privacidade e proteção de dados aplicáveis.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#FF5500] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p>Não compartilhamos, transferimos nem divulgamos dados obtidos por meio das APIs do Google a terceiros para qualquer outra finalidade, exceto se exigido por lei ou com consentimento explícito do usuário.</p>
            <p>
              O uso de informações recebidas de APIs do Google está em estrita conformidade com a 
              <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-[#FF5500] font-bold hover:underline ml-1">
                Política de Dados do Usuário dos Serviços de API do Google
              </a>, incluindo os requisitos de Uso Limitado (Limited Use).
            </p>
          </SectionCard>

          <SectionCard id="contato" num="8" title="Contato">
            <p>Nossa equipe de proteção de dados está à disposição para esclarecer qualquer ponto desta política.</p>
            <a
              href="mailto:avante@neuroads.com.br"
              className="inline-block font-black text-[#FF5500] hover:underline text-[0.9rem]"
              style={{ textDecoration: 'none' }}
            >
              avante@neuroads.com.br
            </a>
          </SectionCard>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-slate-300/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-slate-500 text-[0.88rem] font-medium">
              Em conformidade com a LGPD — Lei nº 13.709/2018
            </p>
            <p className="text-slate-400 text-[0.72rem] uppercase tracking-widest font-bold whitespace-nowrap">
              Junho de 2026 · NeuroAds Laboratory
            </p>
          </div>
        </div>
      </motion.div>
    </LegalLayout>
  );
}
