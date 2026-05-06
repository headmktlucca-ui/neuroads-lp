import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Nosso Método | NeuroAds',
  description:
    'Conheça o método NeuroAds: diagnóstico, estratégia, execução, otimização e escala com foco em previsibilidade financeira para PMEs.',
};

const content: SubmenuPageContent = {
  slug: 'a-neuroads-nosso-metodo',
  eyebrow: 'A NeuroAds',
  headline: 'Método replicável para',
  highlightedHeadline: 'escala previsível',
  subheadline:
    'Estruturamos um ciclo contínuo que conecta diagnóstico, estratégia e execução com indicadores de caixa. Menos improviso, mais consistência comercial.',
  serviceContext: 'Nosso Método',
  copyContract: {
    promise: 'Processo claro para crescer com previsibilidade e governança.',
    pain: 'Sem método, a operação depende de decisões pontuais e não evolui de forma consistente entre equipes e canais.',
    impactoFinanceiro:
      'A falta de processo aumenta custo operacional, amplia desperdício e reduz capacidade de manter margem em crescimento.',
    prova:
      'Nosso método organiza entradas, decisões e saídas em cada etapa: diagnóstico, estratégia, execução, otimização e escala.',
    metodo:
      'Trabalhamos com SLAs operacionais e revisões recorrentes para garantir que cada ação tenha objetivo mensurável e impacto no resultado financeiro.',
    cta: 'Solicite diagnóstico e receba um plano inicial com prioridades por etapa do método.',
  },
  painPoints: [
    'Ausência de rotina de priorização entre marketing e vendas.',
    'Mudança de direção frequente sem base em dados.',
    'Execução inconsistente entre canais e equipes.',
    'Falta de previsibilidade para projeção de receita.',
  ],
  impactPoints: [
    'Aumento de custo por retrabalho e desalinhamento interno.',
    'Tempo maior para corrigir gargalos críticos.',
    'Maior variância mensal em desempenho comercial.',
    'Dificuldade para escalar sem sacrificar margem.',
  ],
  howItWorks: [
    'Diagnóstico de maturidade e gargalos do funil.',
    'Estratégia priorizada por impacto em caixa e velocidade.',
    'Execução com agentes IA e ritos operacionais claros.',
    'Otimização contínua até consolidar escala previsível.',
  ],
  proofMetrics: [],
  faq: [
    {
      question: 'O método é igual para todas as empresas?',
      answer:
        'A estrutura é a mesma, mas as prioridades mudam conforme contexto, segmento, ticket médio e maturidade operacional de cada PME.',
    },
    {
      question: 'Como vocês definem o que entra primeiro na execução?',
      answer:
        'Priorizamos pelo potencial de impacto financeiro e urgência operacional. O objetivo é gerar ganho rápido sem comprometer base de longo prazo.',
    },
    {
      question: 'Existe SLA de acompanhamento?',
      answer:
        'Sim. Trabalhamos com ritos e cadência definidos para leitura de resultado, tomada de decisão e ajustes de rota quando necessário.',
    },
    {
      question: 'Como o método evita dependência de “campanha vencedora”?',
      answer:
        'Ao transformar decisão em sistema contínuo de aprendizado e otimização, com múltiplas alavancas monitoradas e ajustadas ao longo do tempo.',
    },
  ],
  relatedPages: [
    {
      label: 'Sobre',
      href: '/a-neuroads/sobre',
      description: 'Entenda o posicionamento e a experiência por trás do método.',
    },
    {
      label: 'Implantação de Agentes IA',
      href: '/servicos/implantacao-de-agentes-ia',
      description: 'Veja como operacionalizamos o método com IA agêntica.',
    },
    {
      label: 'Estratégia de Funil e Conversão',
      href: '/servicos/estrategia-de-funil-e-conversao',
      description: 'Conecte o método à evolução prática da conversão.',
    },
    {
      label: 'Contato',
      href: '/a-neuroads/contato',
      description: 'Solicite um diagnóstico de aderência ao método para sua operação.',
    },
  ],
  media: {
    title: 'Método NeuroAds',
    poster: '/images/tools/testes.png',
    desktopVideo: '/videos/fundovideo.mp4',
    mobileVideo: '/videos/fundovideo.mp4',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}

