import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Serviços Profissionais | NeuroAds',
  description:
    'Página de captura para negócios de serviços profissionais que precisam de geração previsível de demanda qualificada e vendas consultivas.',
};

const content: SubmenuPageContent = {
  slug: 'servicos-servicos-profissionais',
  eyebrow: 'Soluções por segmento',
  headline: 'Serviços Profissionais com',
  highlightedHeadline: 'pipeline consistente',
  subheadline:
    'Consultorias, escritórios e empresas de serviço precisam transformar autoridade em demanda qualificada. Sem sistema, o comercial vive de indicação e oscila mês a mês.',
  serviceContext: 'Serviços Profissionais',
  copyContract: {
    promise: 'Geração contínua de oportunidades com melhor previsibilidade comercial.',
    pain: 'A empresa tem expertise, mas não consegue manter fluxo estável de reuniões qualificadas.',
    impactoFinanceiro:
      'Sem previsibilidade de demanda, o custo comercial aumenta, a capacidade da equipe fica mal distribuída e o caixa fica mais vulnerável.',
    prova:
      'Conectamos posicionamento, tráfego e qualificação para filtrar melhor o lead antes da reunião e aumentar taxa de avanço no funil.',
    metodo:
      'Estruturamos um ecossistema de aquisição e conversão com foco em ticket, ciclo de venda e capacidade de entrega da sua operação.',
    cta: 'Solicite seu diagnóstico e veja como transformar autoridade em receita recorrente.',
  },
  painPoints: [
    'Dependência de indicação e networking para gerar novas oportunidades.',
    'Baixo volume de reuniões com perfil ideal de cliente.',
    'Ciclo comercial longo e sem previsibilidade.',
    'Mensagem comercial genérica que não diferencia no mercado.',
  ],
  impactPoints: [
    'Receita instável e dificuldade de projeção mensal.',
    'Ociosidade ou sobrecarga da equipe em ciclos curtos.',
    'Perda de negócios por baixa velocidade de resposta.',
    'Escala travada mesmo com alta competência técnica.',
  ],
  howItWorks: [
    'Diagnóstico da jornada comercial e do posicionamento de oferta.',
    'Captação orientada por nicho, dor e potencial de contrato.',
    'Qualificação prévia com suporte de IA agêntica e roteiros claros.',
    'Gestão por indicadores traduzidos em impacto no caixa.',
  ],
  proofMetrics: [],
  faq: [
    {
      question: 'Isso funciona para serviços de ticket mais alto?',
      answer:
        'Sim. A lógica é construir previsibilidade de pipeline com leads aderentes ao seu posicionamento e capacidade de entrega.',
    },
    {
      question: 'Como evitar lead curioso em venda consultiva?',
      answer:
        'Com oferta, segmentação e mensagens alinhadas ao nível de maturidade do cliente ideal, filtrando antes da reunião.',
    },
    {
      question: 'Vocês também ajudam na parte de mensagem comercial?',
      answer:
        'Sim. Ajustamos a comunicação para reduzir ruído e aumentar clareza de valor percebido pelo tomador de decisão.',
    },
    {
      question: 'Qual o diferencial da NeuroAds para esse segmento?',
      answer:
        'Não vendemos campanha isolada. Construímos sistema com dados reais, IA agêntica e acompanhamento sênior para gerar escala previsível.',
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
    poster: '/images/tools/servico-implantacao-agentes-hero-ultrarealista-v2.png',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}
