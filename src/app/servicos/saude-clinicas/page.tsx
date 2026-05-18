import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Saúde & Clínicas | NeuroAds',
  description:
    'Página de captura para clínicas e negócios de saúde que precisam previsibilidade de agenda, menor custo por paciente e crescimento sustentável.',
};

const content: SubmenuPageContent = {
  slug: 'servicos-saude-clinicas',
  eyebrow: 'Soluções por segmento',
  headline: 'Saúde & Clínicas com',
  highlightedHeadline: 'agenda previsível',
  subheadline:
    'Não basta gerar contato. Em saúde, cada lead precisa chegar com aderência de perfil e intenção real para preencher agenda sem pressionar margem.',
  serviceContext: 'Saúde & Clínicas',
  copyContract: {
    promise: 'Mais pacientes qualificados com previsibilidade de agenda e controle de custo de aquisição.',
    pain: 'A clínica investe em anúncios, mas recebe muitos contatos sem aderência ou com baixa probabilidade de comparecimento.',
    impactoFinanceiro:
      'Lead desqualificado aumenta retrabalho da recepção, reduz taxa de comparecimento e encarece cada paciente efetivamente atendido.',
    prova:
      'Ajustamos segmentação, oferta e jornada de contato para qualificar melhor antes do agendamento, reduzindo desperdício comercial.',
    metodo:
      'Unimos mídia, funil e operação de atendimento em um sistema de performance orientado por dados reais e decisão financeira.',
    cta: 'Solicite um diagnóstico da sua clínica e receba os ajustes prioritários para melhorar captação de pacientes.',
  },
  painPoints: [
    'Agenda instável com picos e vales ao longo do mês.',
    'Leads sem perfil adequado para o procedimento ofertado.',
    'Baixo comparecimento após agendamento inicial.',
    'Equipe sobrecarregada com contatos pouco qualificados.',
  ],
  impactPoints: [
    'Custo por paciente sobe e compromete o caixa.',
    'Receita mensal perde previsibilidade.',
    'Menor aproveitamento da capacidade da equipe clínica.',
    'Dependência de indicação para manter volume.',
  ],
  howItWorks: [
    'Diagnóstico de aquisição, triagem e confirmação de agenda.',
    'Estrutura de campanhas por especialidade, perfil e intenção.',
    'Ajuste de ofertas e mensagens para qualificar melhor o contato.',
    'Rotina de gestão com leitura de impacto em custo e receita.',
  ],
  proofMetrics: [],
  faq: [
    {
      question: 'Vocês atendem clínicas de quais especialidades?',
      answer:
        'Trabalhamos com diferentes especialidades, adaptando o sistema ao ciclo de decisão do paciente e à capacidade operacional da clínica.',
    },
    {
      question: 'Como reduzir faltas e no-show?',
      answer:
        'Atuamos desde a qualidade do lead até a cadência de contato, melhorando o alinhamento de expectativa antes do agendamento.',
    },
    {
      question: 'É possível escalar sem perder qualidade?',
      answer:
        'Sim, desde que o funil esteja estruturado por etapas e métricas financeiras, não só por volume bruto de contatos.',
    },
    {
      question: 'Quem acompanha a estratégia?',
      answer:
        'Você fala com especialista sênior, sem repasse para operação júnior, com revisão contínua do que impacta o caixa da clínica.',
    },
  ],
  relatedPages: [
    {
      label: 'SEO + GEO',
      href: '/servicos/seo-geo',
      description: 'Fortaleça presença orgânica para captar demanda qualificada.',
    },
    {
      label: 'Implantação de Agentes IA',
      href: '/servicos/implantacao-de-agentes-ia',
      description: 'Automatize etapas de qualificação e atendimento inicial.',
    },
    {
      label: 'Educação Digital',
      href: '/servicos/educacao-digital',
      description: 'Veja a aplicação para tickets e ciclos de venda diferentes.',
    },
    {
      label: 'FAQ',
      href: '/conteudos/faq',
      description: 'Dúvidas sobre prazo, risco e implementação.',
    },
  ],
  media: {
    title: 'Captação previsível para clínicas',
    poster: '/images/tools/servico-seo-geo-hero-ultrarealista-v2.png',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}
