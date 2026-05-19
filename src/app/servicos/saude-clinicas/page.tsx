import type { Metadata } from 'next';
import SubmenuPageShell, {
  type SubmenuPageContent,
  type AgentExample,
} from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Saúde & Clínicas | NeuroAds',
  description:
    'Página de captura para clínicas e negócios de saúde que precisam previsibilidade de agenda, menor custo por paciente e crescimento sustentável.',
};

const agentExamples: AgentExample[] = [
  {
    name: 'Agente de Triagem de Paciente',
    icon: '🩺',
    trigger:
      'Contato entra pelo formulário, WhatsApp ou anúncio manifestando interesse em consulta ou procedimento',
    action:
      'Qualifica especialidade desejada, urgência, perfil de plano ou pagamento e aderência ao serviço ofertado — antes de chegar à recepção',
    result:
      'Recepção recebe apenas contatos com real potencial de agendamento, reduzindo retrabalho e aumentando conversão',
    metric: '↑ 52% conversão',
  },
  {
    name: 'Agente de Confirmação de Agenda',
    icon: '📅',
    trigger: 'Consulta agendada com mais de 48 h de antecedência no sistema',
    action:
      'Envia lembretes multicanal personalizados, capta confirmação ativa e preenche automaticamente slots livres em caso de desistência',
    result:
      'Taxa de comparecimento aumenta significativamente — agenda sempre otimizada sem esforço manual da equipe',
    metric: '↓ 60% no-show',
  },
  {
    name: 'Agente de Reativação de Base',
    icon: '💊',
    trigger: 'Paciente sem consulta há mais de 90 dias ou retorno agendado vencido',
    action:
      'Cria campanha de reativação personalizada por especialidade e histórico do paciente, com oferta de encaixe prioritário',
    result:
      'Reativa pacientes inativos com custo zero de nova aquisição — base existente gerando receita adicional',
    metric: '↑ 40% reativações',
  },
  {
    name: 'Agente de Posicionamento de Marca',
    icon: '⭐',
    trigger:
      'Busca ativa por especialidade ou sintoma detectada na região de atuação da clínica',
    action:
      'Garante que a clínica aparece com autoridade no Google, Maps e nas respostas de IA (GEO) para as principais buscas do paciente ideal',
    result:
      'Demanda orgânica qualificada sem depender apenas de anúncios — posição de referência consolidada',
    metric: '↑ 3.1× visibilidade',
  },
];

const content: SubmenuPageContent = {
  slug: 'servicos-saude-clinicas',
  eyebrow: 'Soluções por segmento',
  headline: 'Saúde & Clínicas com',
  highlightedHeadline: 'agenda previsível',
  subheadline:
    'Não basta gerar contato. Em saúde, cada lead precisa chegar com aderência de perfil e intenção real para preencher agenda sem pressionar margem.',
  serviceContext: 'Saúde & Clínicas',
  agentExamples,
  copyContract: {
    promise: 'Mais pacientes qualificados com previsibilidade de agenda e controle de custo de aquisição.',
    pain: 'A clínica investe em anúncios, mas recebe muitos contatos sem aderência ou com baixa probabilidade de comparecimento.',
    impactoFinanceiro:
      'Lead desqualificado aumenta retrabalho da recepção, reduz taxa de comparecimento e encarece cada paciente efetivamente atendido.',
    prova:
      'Ajustamos segmentação, oferta e jornada de contato para qualificar melhor antes do agendamento, reduzindo desperdício comercial e operacional.',
    metodo:
      'Unimos mídia, funil e operação de atendimento em um sistema de performance orientado por dados reais e decisão financeira.',
    cta: 'Solicite um diagnóstico da sua clínica e receba os ajustes prioritários para melhorar captação de pacientes.',
  },
  painPoints: [
    'Agenda instável com picos e vales imprevisíveis ao longo do mês.',
    'Leads sem perfil adequado para o procedimento ou especialidade ofertada.',
    'Baixo comparecimento após agendamento inicial — alto índice de no-show.',
    'Equipe sobrecarregada com contatos pouco qualificados que não convertem.',
  ],
  impactPoints: [
    'Custo por paciente sobe e compromete a margem da clínica.',
    'Receita mensal perde previsibilidade e dificulta planejamento.',
    'Menor aproveitamento da capacidade instalada da equipe clínica.',
    'Dependência excessiva de indicação para manter volume de pacientes.',
  ],
  howItWorks: [
    'Diagnóstico completo de aquisição, triagem e confirmação de agenda.',
    'Estrutura de campanhas segmentada por especialidade, perfil e intenção do paciente.',
    'Ajuste de ofertas e mensagens para qualificar melhor o contato antes do agendamento.',
    'Rotina de gestão com leitura de impacto direto em custo de aquisição e receita.',
  ],
  proofMetrics: [
    {
      value: '↑ 52%',
      label: 'Taxa de comparecimento',
      detail: 'Mais pacientes confirmados chegando à consulta após triagem e cadência estruturada',
    },
    {
      value: '↓ 38%',
      label: 'Custo por paciente',
      detail: 'Redução no custo de aquisição de cada paciente efetivamente atendido',
    },
    {
      value: '↑ 81%',
      label: 'Previsibilidade de agenda',
      detail: 'Clínicas com agenda previsível 3+ semanas à frente após implementação',
    },
  ],
  faq: [
    {
      question: 'Vocês atendem clínicas de quais especialidades?',
      answer:
        'Trabalhamos com diferentes especialidades, adaptando o sistema ao ciclo de decisão do paciente e à capacidade operacional da clínica.',
    },
    {
      question: 'Como reduzir faltas e no-show?',
      answer:
        'Atuamos desde a qualidade do lead até a cadência de confirmação de agenda — o Agente de Confirmação gerencia lembretes personalizados e recupera slots cancelados automaticamente.',
    },
    {
      question: 'É possível escalar sem perder qualidade no atendimento?',
      answer:
        'Sim, desde que o funil esteja estruturado por etapas e métricas financeiras, não só por volume bruto de contatos. Os agentes escalam a operação sem aumentar o time.',
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
    poster: '/images/segment-highlights/saude-clinicas-destaque.png',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}
