import type { Metadata } from 'next';
import StrategicContentPageShell, { type StrategicContentPageData } from '@/components/neuroads/StrategicContentPageShell';

export const metadata: Metadata = {
  title: 'Contato NeuroAds | Diagnóstico com Especialista',
  description:
    'Fale com a NeuroAds e solicite diagnóstico com foco em resultado financeiro. Envie Nome, Email, WhatsApp e Site da Empresa.',
};

const content: StrategicContentPageData = {
  slug: 'a-neuroads-contato',
  eyebrow: 'Contato NeuroAds',
  title: 'Fale com especialista e',
  highlightedTitle: 'ganhe clareza sobre seu próximo passo.',
  subtitle:
    'Se você investe todo mês e ainda não tem previsibilidade de vendas, a conversa precisa começar com diagnóstico objetivo. Aqui, sua operação é lida por impacto no caixa.',
  primaryCta: { label: 'Preencher diagnóstico agora', href: '#rodape' },
  secondaryCta: { label: 'Ver nosso método', href: '/a-neuroads/nosso-metodo' },
  highlights: [
    { title: 'Triagem estratégica', description: 'Entendimento rápido do cenário antes de qualquer proposta.', icon: 'goal' },
    { title: 'Sem intermediários', description: 'Contato com direção sênior e linguagem de negócio.', icon: 'handshake' },
    { title: 'Foco em dinheiro', description: 'Análise orientada a CPL, conversão, margem e receita.', icon: 'gauge' },
    { title: 'Próximo passo claro', description: 'Você sai com rota prática, não com promessa genérica.', icon: 'layers' },
  ],
  sections: [
    {
      title: 'Quando esse contato faz sentido',
      description: 'Ideal para empresas que já investem e precisam parar de operar no escuro.',
      bullets: [
        'Os números de marketing parecem bons, mas as vendas não acompanham.',
        'Existe dúvida sobre onde o orçamento está sendo desperdiçado.',
        'A equipe comercial recebe lead, mas a taxa de fechamento está travada.',
        'Falta previsibilidade para tomar decisão de escala com segurança.',
      ],
    },
    {
      title: 'O que acontece após o envio',
      description: 'Nosso fluxo foi desenhado para ser objetivo e útil desde o primeiro contato.',
      bullets: [
        'Leitura inicial do contexto enviado (canal, oferta, funil e operação).',
        'Classificação do principal gargalo de aquisição ou conversão.',
        'Retorno com direcionamento prático para próximos passos.',
        'Se fizer sentido, estruturação da trilha de implantação.',
      ],
    },
  ],
  process: [
    { title: 'Você envia o contexto', detail: 'Nome, contato, site e principal desafio de negócio.' },
    { title: 'Análise inicial', detail: 'Triagem por urgência e potencial de impacto financeiro.' },
    { title: 'Direcionamento', detail: 'Retorno com orientação objetiva de curto prazo.' },
    { title: 'Plano de execução', detail: 'Definição de frente prioritária para começar com segurança.' },
  ],
  resources: [
    {
      title: 'Gestão de Tráfego',
      description: 'Para reduzir desperdício e melhorar aquisição com governança.',
      href: '/servicos/gestao-de-trafego-google-meta',
    },
    {
      title: 'SEO + GEO',
      description: 'Para aumentar presença em busca clássica e generativa.',
      href: '/servicos/seo-geo',
    },
    {
      title: 'Agentes de IA',
      description: 'Para ganhar velocidade operacional sem perder controle.',
      href: '/servicos/implantacao-de-agentes-ia',
    },
  ],
  faq: [
    {
      question: 'Esse primeiro contato tem custo?',
      answer: 'Não. A triagem inicial é sem compromisso e serve para validar aderência e prioridade de ação.',
    },
    {
      question: 'Preciso ter estrutura grande para começar?',
      answer: 'Não. O processo foi desenhado para PME com equipe enxuta e foco em ganho rápido de eficiência.',
    },
    {
      question: 'Vocês só atendem tráfego pago?',
      answer:
        'Não. A NeuroAds integra tráfego, SEO + GEO, funil e IA agêntica para construir um sistema comercial completo.',
    },
  ],
  form: {
    title: 'Envie seus dados e seu principal desafio',
    description: 'Quanto mais claro o contexto, mais objetivo será nosso direcionamento inicial.',
    ctaLabel: 'Enviar para diagnóstico',
    flow: 'claudio',
    serviceContext: 'Contato - Diagnóstico com especialista',
    successMessage: 'Recebemos seu contato. Em breve você recebe retorno com próximo passo recomendado.',
    includeMessage: true,
  },
};

export default function Page() {
  return <StrategicContentPageShell data={content} />;
}

