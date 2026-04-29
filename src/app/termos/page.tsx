'use client';
import LegalLayout from '@/components/neuroads/LegalLayout';
import { motion } from 'framer-motion';

export default function TermsPage() {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }
  };

  return (
    <LegalLayout>
      <motion.div {...fadeUp}>
        <p className="s-badge mb-4">Documento Legal</p>
        <h1 className="s-title mb-6">
          Termos de <span className="text-primary italic">Uso</span>
        </h1>

        <p className="text-text-muted text-[0.98rem] leading-relaxed mb-10">
          Ao acessar ou utilizar o site e os serviços da NeuroAds, você concorda em cumprir e estar vinculado aos seguintes Termos de Uso. Leia-os atentamente antes de prosseguir.
        </p>

        <section className="space-y-12">
          {/* 1. Aceitação dos Termos */}
          <div className="space-y-4 bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-[1.15rem] font-bold text-text-main flex items-center gap-3">
              <span className="text-primary">1.</span> Aceitação
            </h2>
            <p className="text-text-muted text-[0.92rem] leading-relaxed">
              O acesso a este site confirma sua aceitação destes termos. Se você não concorda com qualquer parte destes documentos, não está autorizado a utilizar nossos serviços ou navegar em nossa plataforma.
            </p>
          </div>

          {/* 2. Descrição dos Serviços */}
          <div className="space-y-4 bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-[1.15rem] font-bold text-text-main flex items-center gap-3">
              <span className="text-primary">2.</span> Serviços NeuroAds
            </h2>
            <p className="text-text-muted text-[0.92rem] leading-relaxed">
              A NeuroAds fornece consultoria estratégica de marketing, gestão de tráfego pago de alta performance e implementações de inteligência artificial através do ecossistema Lucca.os. O conteúdo deste site é meramente informativo sobre nossas competências e metodologias.
            </p>
          </div>

          {/* 3. Propriedade Intelectual */}
          <div className="space-y-4 bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-[1.15rem] font-bold text-text-main flex items-center gap-3">
              <span className="text-primary">3.</span> Propriedade Intelectual
            </h2>
            <p className="text-text-muted text-[0.92rem] leading-relaxed">
              Todo o conteúdo, design, logotipos, ícones e o sistema Lucca.os são de propriedade exclusiva da NeuroAds ou de seus licenciadores e são protegidos por leis de direitos autorais e propriedade intelectual. É proibida a reprodução total ou parcial sem autorização prévia por escrito.
            </p>
          </div>

          {/* 4. Uso do Site e Conduta */}
          <div className="space-y-4 bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-[1.15rem] font-bold text-text-main flex items-center gap-3">
              <span className="text-primary">4.</span> Conduta do Usuário
            </h2>
            <p className="text-text-muted text-[0.92rem] leading-relaxed">
              Você concorda em fornecer informações verdadeiras e atualizadas em nossos formulários de diagnóstico. Reservamo-nos o direito de recusar diagnósticos gratuitos para solicitações que não atendam aos critérios de qualificação mínima ou que pareçam fraudulentas.
            </p>
          </div>

          {/* 5. Isenção de Garantias de Resultados */}
          <div className="space-y-4 bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-[1.15rem] font-bold text-text-main flex items-center gap-3">
              <span className="text-primary">5.</span> Resultados Estimados
            </h2>
            <p className="text-text-muted text-[0.92rem] leading-relaxed">
              Embora nossa metodologia seja baseada em dados e IA de alta performance, o marketing possui variáveis externas. Assim, a NeuroAds não garante resultados financeiros específicos ou lucros imediatos, sendo os diagnósticos baseados em potenciais estatísticos e análises de mercado.
            </p>
          </div>

          {/* 6. Limitação de Responsabilidade */}
          <div className="space-y-4 bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-[1.15rem] font-bold text-text-main flex items-center gap-3">
              <span className="text-primary">6.</span> Limitação de Responsabilidade
            </h2>
            <p className="text-text-muted text-[0.92rem] leading-relaxed">
              A NeuroAds não será responsável por quaisquer danos diretos, indiretos ou consequentes resultantes do uso ou da incapacidade de usar as informações contidas neste site.
            </p>
          </div>

          {/* 7. Alterações nos Termos */}
          <div className="space-y-4 bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-[1.15rem] font-bold text-text-main flex items-center gap-3">
              <span className="text-primary">7.</span> Modificações
            </h2>
            <p className="text-text-muted text-[0.92rem] leading-relaxed">
              Podemos revisar estes termos a qualquer momento, sem aviso prévio. Ao utilizar este site, você concorda em ficar vinculado à versão atual desses termos.
            </p>
          </div>

          <div className="mt-4 p-8 bg-bg-secondary border border-border rounded-2xl flex flex-col items-center text-center gap-4">
            <p className="text-text-muted text-[0.9rem]">
              Estes termos são regidos e interpretados de acordo com as leis do Brasil.
            </p>
            <p className="text-text-dim text-[0.72rem] uppercase tracking-widest">
              Última atualização: Abril de 2026 · NeuroAds Laboratory
            </p>
          </div>
        </section>
      </motion.div>
    </LegalLayout>
  );
}
