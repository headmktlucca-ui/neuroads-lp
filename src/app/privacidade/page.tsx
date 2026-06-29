'use client';

import LegalLayout from '@/components/neuroads/LegalLayout';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }
  };

  return (
    <LegalLayout>
      <motion.div {...fadeUp} className="text-white">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-[#ff6a00]/15 border border-[#ff6a00]/30 px-3 py-1 text-xs font-bold text-[#ff8f3a] mb-4">
          Documento Legal
        </p>
        <h1 className="text-3xl font-black text-white tracking-tight leading-tight mb-6">
          Política de <span className="text-primary italic">Privacidade</span>
        </h1>

        <p className="text-slate-300 text-[0.98rem] leading-relaxed mb-10 font-semibold">
          Sua privacidade é fundamental para a NeuroAds. Esta política descreve como coletamos, usamos e
          protegemos suas informações quando você utiliza nossa plataforma e serviços de consultoria estratégica.
        </p>

        <section className="space-y-12">
          {/* 1. Introdução */}
          <div className="space-y-4 bg-zinc-900/50 border border-white/10 rounded-2xl p-6 shadow-sm">
            <h2 className="text-[1.15rem] font-black text-white flex items-center gap-3">
              <span className="text-primary">1.</span> Introdução
            </h2>
            <p className="text-slate-300 text-[0.92rem] leading-relaxed font-semibold">
              A NeuroAds (&quot;nós&quot;, &quot;nosso&quot;) está comprometida em proteger a privacidade e os dados pessoais de
              nossos clientes e visitantes do site. Em conformidade com a Lei Geral de Proteção de Dados
              (LGPD), detalhamos aqui nossas práticas de tratamento de dados.
            </p>
          </div>

          {/* 2. Coleta de Dados */}
          <div className="space-y-4 bg-zinc-900/50 border border-white/10 rounded-2xl p-6 shadow-sm">
            <h2 className="text-[1.15rem] font-black text-white flex items-center gap-3">
              <span className="text-primary">2.</span> Dados que Coletamos
            </h2>
            <p className="text-slate-300 text-[0.92rem] leading-relaxed font-semibold">
              Coletamos informações voluntariamente fornecidas por você através de nossos formulários de diagnóstico, incluindo:
            </p>
            <ul className="list-disc list-inside text-slate-300 text-[0.9rem] space-y-2 ml-4 font-semibold">
              <li>Nome e informações de contato (E-mail corporativo, WhatsApp);</li>
              <li>Dados sobre o faturamento de sua empresa (para fins de qualificação e diagnóstico estratégico);</li>
              <li>Informações sobre a situação atual do seu marketing e vendas.</li>
            </ul>
          </div>

          {/* 3. Finalidade do Tratamento */}
          <div className="space-y-4 bg-zinc-900/50 border border-white/10 rounded-2xl p-6 shadow-sm">
            <h2 className="text-[1.15rem] font-black text-white flex items-center gap-3">
              <span className="text-primary">3.</span> Finalidade do Uso
            </h2>
            <p className="text-slate-300 text-[0.92rem] leading-relaxed font-semibold">
              Utilizamos seus dados para:
            </p>
            <ul className="list-disc list-inside text-slate-300 text-[0.9rem] space-y-2 ml-4 font-semibold">
              <li>Elaborar o Diagnóstico Estratégico personalizado solicitado;</li>
              <li>Entrar em contato para agendamento de reuniões consultivas;</li>
              <li>Personalizar a experiência de nossos agentes de IA (Lucca.os) para melhor atender às suas necessidades;</li>
              <li>Melhorar continuamente nossa plataforma e estratégias de marketing.</li>
            </ul>
          </div>

          {/* 4. Segurança de Dados */}
          <div className="space-y-4 bg-zinc-900/50 border border-white/10 rounded-2xl p-6 shadow-sm">
            <h2 className="text-[1.15rem] font-black text-white flex items-center gap-3">
              <span className="text-primary">4.</span> Segurança e Retenção
            </h2>
            <p className="text-slate-300 text-[0.92rem] leading-relaxed font-semibold">
              Adotamos medidas técnicas e administrativas rigorosas para proteger seus dados contra acessos não autorizados. Seus dados são mantidos apenas pelo tempo necessário para cumprir as finalidades para as quais foram coletados ou conforme exigido por lei.
            </p>
          </div>

          {/* 5. Cookies e Tecnologias de Rastreamento */}
          <div className="space-y-4 bg-zinc-900/50 border border-white/10 rounded-2xl p-6 shadow-sm">
            <h2 className="text-[1.15rem] font-black text-white flex items-center gap-3">
              <span className="text-primary">5.</span> Cookies
            </h2>
            <p className="text-slate-300 text-[0.92rem] leading-relaxed font-semibold">
              Utilizamos cookies e tecnologias similares para analisar tendências, administrar o site e rastrear os movimentos dos usuários ao redor do site para melhorar a performance de nossas campanhas de tráfego pago.
            </p>
          </div>

          {/* 6. Seus Direitos (LGPD) */}
          <div className="space-y-4 bg-zinc-900/50 border border-white/10 rounded-2xl p-6 shadow-sm">
            <h2 className="text-[1.15rem] font-black text-white flex items-center gap-3">
              <span className="text-primary">6.</span> Seus Direitos
            </h2>
            <p className="text-slate-300 text-[0.92rem] leading-relaxed font-semibold">
              De acordo com a LGPD, você tem direito de acessar, corrigir, anonimizar ou excluir seus dados pessoais de nossa base. Para exercer esses direitos, entre em contato através do e-mail abaixo.
            </p>
          </div>

          {/* 7. Compartilhamento de Dados do Google */}
          <div className="space-y-4 bg-zinc-900/50 border border-white/10 rounded-2xl p-6 shadow-sm">
            <h2 className="text-[1.15rem] font-black text-white flex items-center gap-3">
              <span className="text-primary">7.</span> Compartilhamento de Dados do Google
            </h2>
            <p className="text-slate-300 text-[0.92rem] leading-relaxed font-semibold">
              A NeuroAds utiliza APIs do Google (incluindo Google Ads, Google Analytics, Google Search Console e Google BigQuery) exclusivamente para fins internos de operação e prestação de serviços aos nossos clientes.
            </p>
            <p className="text-slate-300 text-[0.92rem] leading-relaxed font-semibold">
              Não compartilhamos, transferimos nem divulgamos dados de usuários obtidos por meio das APIs do Google a terceiros, exceto nas seguintes situações:
            </p>
            <ul className="list-disc list-inside text-slate-300 text-[0.9rem] space-y-2 ml-4 font-semibold">
              <li>Quando exigido por lei ou ordem judicial;</li>
              <li>Para prestadores de serviços essenciais à operação da plataforma, mediante acordo de confidencialidade e apenas na medida necessária para a prestação do serviço;</li>
              <li>Com o consentimento explícito do usuário.</li>
            </ul>
            <p className="text-slate-300 text-[0.92rem] leading-relaxed font-semibold">
              O uso de dados obtidos por meio das APIs do Google está em conformidade com a Política de Dados do Usuário dos Serviços de API do Google, incluindo os requisitos de Uso Limitado (Limited Use).
            </p>
          </div>

          {/* 8. Contato */}
          <div className="mt-4 p-8 bg-zinc-900/50 border border-white/10 rounded-2xl">
            <h3 className="text-white font-black mb-4 italic text-[1.15rem]">Dúvidas sobre sua privacidade?</h3>
            <p className="text-slate-300 text-[0.9rem] mb-6 font-semibold">
              Nossa equipe de proteção de dados está à disposição para esclarecer qualquer ponto desta política.
            </p>
            <a href="mailto:avante@neuroads.com.br" className="text-primary font-black hover:underline" style={{ textDecoration: 'none' }}>
              avante@neuroads.com.br
            </a>
          </div>

          <p className="text-slate-500 text-[0.72rem] pt-6 text-center uppercase tracking-widest font-bold">
            Última atualização: Junho de 2026 · NeuroAds Laboratory
          </p>
        </section>
      </motion.div>
    </LegalLayout>
  );
}
