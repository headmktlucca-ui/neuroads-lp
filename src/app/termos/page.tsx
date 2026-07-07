'use client';

import LegalLayout from '@/components/neuroads/LegalLayout';
import { motion } from 'framer-motion';
import { type LegalSection } from '@/components/neuroads/LegalLayout';

const SECTIONS: LegalSection[] = [
  { id: 'aceitacao',       label: '1. Aceitação'                },
  { id: 'servicos',        label: '2. Serviços NeuroAds'        },
  { id: 'propriedade',     label: '3. Propriedade Intelectual'  },
  { id: 'conduta',         label: '4. Conduta do Usuário'       },
  { id: 'resultados',      label: '5. Resultados Estimados'     },
  { id: 'responsabilidade',label: '6. Limitação de Resp.'       },
  { id: 'modificacoes',    label: '7. Modificações'             },
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
      <div className="text-slate-600 text-[0.9rem] leading-[1.75] font-medium pl-6 border-l border-slate-300/40">
        {children}
      </div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <LegalLayout
      sections={SECTIONS}
      docTitle="Termos de Uso"
      updatedAt="Abril de 2026"
    >
      <motion.div {...fadeUp}>
        {/* Header */}
        <div className="mb-10 pb-8 border-b border-slate-300/30">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20 px-3 py-1 text-[11px] font-black text-[#FF5500] mb-5">
            Documento Legal
          </p>
          <h1 className="text-[2rem] sm:text-[2.4rem] font-black text-slate-900 tracking-tight leading-[1.08] mb-4">
            Termos de <span className="text-[#FF5500] italic">Uso</span>
          </h1>
          <p className="text-slate-600 text-[0.97rem] leading-relaxed font-medium max-w-[640px]">
            Ao acessar ou utilizar o site e os serviços da NeuroAds, você concorda em cumprir e estar vinculado aos
            seguintes Termos de Uso. Leia-os atentamente antes de prosseguir.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          <SectionCard id="aceitacao" num="1" title="Aceitação">
            O acesso a este site confirma sua aceitação destes termos. Se você não concorda com qualquer parte destes
            documentos, não está autorizado a utilizar nossos serviços ou navegar em nossa plataforma.
          </SectionCard>

          <SectionCard id="servicos" num="2" title="Serviços NeuroAds">
            A NeuroAds fornece consultoria estratégica de marketing, gestão de tráfego pago de alta performance e
            implementações de inteligência artificial através do ecossistema Lucca.os. O conteúdo deste site é
            meramente informativo sobre nossas competências e metodologias.
          </SectionCard>

          <SectionCard id="propriedade" num="3" title="Propriedade Intelectual">
            Todo o conteúdo, design, logotipos, ícones e o sistema Lucca.os são de propriedade exclusiva da NeuroAds
            ou de seus licenciadores e são protegidos por leis de direitos autorais e propriedade intelectual. É
            proibida a reprodução total ou parcial sem autorização prévia por escrito.
          </SectionCard>

          <SectionCard id="conduta" num="4" title="Conduta do Usuário">
            Você concorda em fornecer informações verdadeiras e atualizadas em nossos formulários de diagnóstico.
            Reservamo-nos o direito de recusar diagnósticos gratuitos para solicitações que não atendam aos critérios
            de qualificação mínima ou que pareçam fraudulentas.
          </SectionCard>

          <SectionCard id="resultados" num="5" title="Resultados Estimados">
            Embora nossa metodologia seja baseada em dados e IA de alta performance, o marketing possui variáveis
            externas. Assim, a NeuroAds não garante resultados financeiros específicos ou lucros imediatos, sendo
            os diagnósticos baseados em potenciais estatísticos e análises de mercado.
          </SectionCard>

          <SectionCard id="responsabilidade" num="6" title="Limitação de Responsabilidade">
            A NeuroAds não será responsável por quaisquer danos diretos, indiretos ou consequentes resultantes do
            uso ou da incapacidade de usar as informações contidas neste site.
          </SectionCard>

          <SectionCard id="modificacoes" num="7" title="Modificações">
            Podemos revisar estes termos a qualquer momento, sem aviso prévio. Ao utilizar este site, você concorda
            em ficar vinculado à versão atual desses termos.
          </SectionCard>

          {/* Footer note */}
          <div className="mt-8 pt-8 border-t border-slate-300/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-slate-500 text-[0.88rem] font-medium">
              Estes termos são regidos e interpretados de acordo com as leis do Brasil.
            </p>
            <p className="text-slate-400 text-[0.72rem] uppercase tracking-widest font-bold whitespace-nowrap">
              Abril de 2026 · NeuroAds Laboratory
            </p>
          </div>
        </div>
      </motion.div>
    </LegalLayout>
  );
}
