import type { Metadata } from 'next';
import SubmenuPageShell, {
  type SubmenuPageContent,
  type AgentExample,
} from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Serviços Profissionais | NeuroAds',
  description:
    'Página de captura para negócios de serviços profissionais que precisam de geração previsível de demanda qualificada e vendas consultivas.',
};

const agentExamples: AgentExample[] = [
  {
    name: 'Agente de Captação de Pipeline',
    icon: '🎯',
    trigger:
      'Empresa com perfil ideal identificada via busca ativa, comportamento digital ou sinal de mercado relevante',
    action:
      'Inicia abordagem multicanal personalizada com mensagem alinhada à dor específica do segmento e ao nível de maturidade do prospect',
    result:
      'Pipeline qualificado gerado de forma previsível — sem depender de indicação ou networking pontual',
    metric: '↑ 3.5× reuniões',
  },
  {
    name: 'Agente de Qualificação Prévia',
    icon: '🔍',
    trigger: 'Solicitação de contato ou pedido de proposta recebido no site ou CRM',
    action:
      'Aplica roteiro de qualificação inteligente para identificar perfil, budget, urgência e tomador de decisão — antes da reunião comercial',
    result:
      'Reuniões chegam com contexto completo e decisor confirmado, elevando drasticamente a taxa de avanço para proposta',
    metric: '↑ 62% conversão',
  },
  {
    name: 'Agente de Nutrição de Ciclo Longo',
    icon: '📧',
    trigger:
      'Lead qualificado em fase de avaliação que não avançou para proposta em até 30 dias',
    action:
      'Mantém relacionamento ativo com conteúdo de autoridade, cases relevantes e diferenciais ajustados ao momento da jornada de decisão do prospect',
    result:
      'Empresa permanece como referência top-of-mind quando a decisão de compra amadurece — sem perder o lead para concorrente',
    metric: '↓ 41% ciclo de venda',
  },
  {
    name: 'Agente de Autoridade Digital',
    icon: '⭐',
    trigger: 'Busca ativa por solução no nicho de atuação da empresa detectada online',
    action:
      'Garante visibilidade orgânica e nas respostas de IA (GEO) para as principais dores e perguntas do cliente ideal do segmento',
    result:
      'Empresa é encontrada e percebida como referência antes de qualquer concorrente — posição de autoridade construída sistematicamente',
    metric: '1ª posição no GEO',
  },
];

const content: SubmenuPageContent = {
  slug: 'servicos-servicos-profissionais',
  eyebrow: 'Soluções por segmento',
  headline: 'Serviços Profissionais com',
  highlightedHeadline: 'pipeline consistente',
  subheadline:
    'Consultorias, escritórios e empresas de serviço precisam transformar autoridade em demanda qualificada. Sem sistema, o comercial vive de indicação e oscila mês a mês.',
  serviceContext: 'Serviços Profissionais',
  agentExamples,
  copyContract: {
    promise: 'Geração contínua de oportunidades com melhor previsibilidade comercial e ciclo de vendas reduzido.',
    pain: 'A empresa tem expertise, mas não consegue manter fluxo estável de reuniões qualificadas com tomadores de decisão.',
    impactoFinanceiro:
      'Sem previsibilidade de demanda, o custo comercial aumenta, a capacidade da equipe fica mal distribuída e o caixa fica mais vulnerável a oscilações.',
    prova:
      'Conectamos posicionamento, tráfego e qualificação para filtrar melhor o lead antes da reunião e aumentar taxa de avanço no funil consultivo.',
    metodo:
      'Estruturamos um ecossistema de aquisição e conversão com foco em ticket, ciclo de venda e capacidade de entrega da sua operação.',
    cta: 'Solicite seu diagnóstico e veja como transformar autoridade em receita recorrente previsível.',
  },
  painPoints: [
    'Dependência de indicação e networking para gerar novas oportunidades de negócio.',
    'Baixo volume de reuniões com perfil ideal de cliente e poder de decisão.',
    'Ciclo comercial longo sem previsibilidade de fechamento e receita.',
    'Mensagem comercial genérica que não diferencia no mercado competitivo.',
  ],
  impactPoints: [
    'Receita instável e dificuldade de projeção e planejamento mensal.',
    'Ociosidade ou sobrecarga da equipe em ciclos curtos e imprevisíveis.',
    'Perda de negócios por baixa velocidade de resposta e qualificação.',
    'Escala travada mesmo com alta competência técnica e reputação consolidada.',
  ],
  howItWorks: [
    'Diagnóstico da jornada comercial atual e do posicionamento de oferta no mercado.',
    'Captação orientada por nicho, dor específica e potencial de contrato.',
    'Qualificação prévia com suporte de agentes IA e roteiros de abordagem claros.',
    'Gestão por indicadores financeiros: pipeline, ciclo, taxa de fechamento e receita.',
  ],
  proofMetrics: [
    {
      value: '↑ 3.5×',
      label: 'Reuniões qualificadas',
      detail: 'Aumento médio no volume de reuniões com tomadores de decisão por mês',
    },
    {
      value: '↓ 41%',
      label: 'Ciclo de vendas',
      detail: 'Redução no tempo médio entre primeiro contato e fechamento de contrato',
    },
    {
      value: '↑ 62%',
      label: 'Taxa de fechamento',
      detail: 'Conversão de reuniões qualificadas em proposta aceita e contrato assinado',
    },
  ],
  faq: [
    {
      question: 'Isso funciona para serviços de ticket mais alto?',
      answer:
        'Sim. A lógica é construir previsibilidade de pipeline com leads aderentes ao seu posicionamento e capacidade de entrega — independente do ticket.',
    },
    {
      question: 'Como evitar lead curioso em venda consultiva?',
      answer:
        'Com oferta, segmentação e mensagens alinhadas ao nível de maturidade do cliente ideal. O Agente de Qualificação Prévia filtra antes da reunião.',
    },
    {
      question: 'Vocês também ajudam na mensagem comercial?',
      answer:
        'Sim. Ajustamos a comunicação para reduzir ruído e aumentar clareza do valor percebido pelo tomador de decisão no seu segmento.',
    },
    {
      question: 'Qual o diferencial da NeuroAds para esse segmento?',
      answer:
        'Não vendemos campanha isolada. Construímos sistema com dados reais, agentes IA e acompanhamento sênior para gerar escala previsível no seu tipo de venda.',
    },
  ],
  relatedPages: [
    {
      label: 'Mercado Imobiliário',
      href: '/servicos/mercado-imobiliario',
      description: 'Aplicação prática para vendas consultivas com ciclo longo.',
    },
    {
      label: 'Saúde & Clínicas',
      href: '/servicos/saude-clinicas',
      description: 'Veja como o método se adapta à agenda e atendimento.',
    },
    {
      label: 'SEO + GEO',
      href: '/servicos/seo-geo',
      description: 'Fortaleça autoridade para gerar demanda de busca ativa.',
    },
    {
      label: 'A NeuroAds',
      href: '/a-neuroads/sobre',
      description: 'Conheça método, experiência e forma de atuação.',
    },
  ],
  media: {
    title: 'Pipeline previsível para serviços',
    poster: '/images/segment-highlights/servicos-profissionais-destaque.png',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}
