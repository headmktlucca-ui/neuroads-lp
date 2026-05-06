import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Estratégia de Funil e Conversão | NeuroAds',
  description:
    'Estratégia de funil orientada a receita: reduzir vazamentos, elevar taxa de conversão e transformar tráfego em vendas com previsibilidade.',
};

const content: SubmenuPageContent = {
  slug: 'servicos-estrategia-de-funil-e-conversao',
  eyebrow: 'Serviços NeuroAds',
  headline: 'Funil de conversão com',
  highlightedHeadline: 'lógica de receita',
  subheadline:
    'A operação cresce quando aquisição, qualificação e fechamento se conectam. Estruturamos o funil para reduzir perdas e aumentar valor por oportunidade.',
  serviceContext: 'Estratégia de Funil e Conversão',
  copyContract: {
    promise: 'Menos vazamento no funil, mais previsibilidade de faturamento.',
    pain: 'A empresa gera tráfego, mas as etapas de qualificação e conversão não acompanham o ritmo, gerando perda silenciosa de receita.',
    impactoFinanceiro:
      'Quando o funil é desorganizado, o custo para vender sobe, o ciclo comercial alonga e a projeção de caixa vira incerteza.',
    prova:
      'Aplicamos diagnóstico por etapa, testes orientados a hipótese e rotina de otimização contínua para elevar taxa de conversão com governança.',
    metodo:
      'Mapeamos pontos de fricção, priorizamos melhorias por impacto financeiro e implementamos um playbook de conversão alinhado ao perfil de compra da sua audiência.',
    cta: 'Solicite diagnóstico de funil e receba os principais pontos de perda de conversão da sua operação.',
  },
  painPoints: [
    'Leads entram sem critério de qualificação claro.',
    'Mensagem comercial desalinhada entre anúncio e oferta.',
    'Follow-up inconsistente e sem priorização por potencial.',
    'Equipe comercial gastando energia em oportunidades frias.',
  ],
  impactPoints: [
    'Taxa de conversão abaixo do potencial da base gerada.',
    'Aumento do custo por venda e redução de margem.',
    'Demora para transformar investimento em faturamento.',
    'Baixa previsibilidade mensal de entrada de receita.',
  ],
  howItWorks: [
    'Diagnóstico do funil completo: tráfego, página, qualificação e fechamento.',
    'Priorização dos gargalos com maior impacto em receita.',
    'Implementação de testes A/B e ajustes de copy/oferta.',
    'Ritual de otimização com indicadores de conversão e caixa.',
  ],
  proofMetrics: [],
  faq: [
    {
      question: 'Vocês mexem apenas na landing page ou no funil inteiro?',
      answer:
        'No funil inteiro. A landing é parte importante, mas conversão depende também de qualificação, oferta, follow-up e processo comercial.',
    },
    {
      question: 'Como priorizam o que ajustar primeiro?',
      answer:
        'Pelo impacto financeiro. Primeiro atacamos as etapas que estão drenando mais oportunidade e custo, para gerar ganho rápido e sustentável.',
    },
    {
      question: 'Teste A/B é obrigatório em toda etapa?',
      answer:
        'Não em toda etapa ao mesmo tempo. O ideal é testar de forma sequencial e estruturada para isolar causa e evitar decisões confusas.',
    },
    {
      question: 'Como a IA entra no funil de conversão?',
      answer:
        'A IA acelera diagnóstico, priorização e execução de ajustes. O processo continua com supervisão estratégica para manter coerência com o negócio.',
    },
  ],
  relatedPages: [
    {
      label: 'Gestão de Tráfego (Google + Meta)',
      href: '/servicos/gestao-de-trafego-google-meta',
      description: 'Conecte aquisição qualificada com um funil preparado para converter.',
    },
    {
      label: 'Agentes de Conversão',
      href: '/agentes-ia/agentes-de-conversao',
      description: 'Conheça os agentes focados em aumentar taxa de conversão.',
    },
    {
      label: 'FAQ',
      href: '/conteudos/faq',
      description: 'Respostas diretas sobre prazo, risco e retorno esperado.',
    },
    {
      label: 'Contato',
      href: '/a-neuroads/contato',
      description: 'Solicite diagnóstico com foco em aumento de receita.',
    },
  ],
  media: {
    title: 'Funil e conversão previsível',
    poster: '/images/tools/diagnostico_funil.png',
    desktopVideo: '/videos/fundovideo.mp4',
    mobileVideo: '/videos/fundovideo.mp4',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}

