import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Contato NeuroAds | Diagnóstico com Especialista',
  description:
    'Fale com a NeuroAds e solicite diagnóstico com foco em resultado financeiro. Envie Nome, Email, WhatsApp e Site da Empresa.',
};

const content: SubmenuPageContent = {
  slug: 'a-neuroads-contato',
  eyebrow: 'A NeuroAds',
  headline: 'Contato direto para',
  highlightedHeadline: 'diagnóstico estratégico',
  subheadline:
    'Se o objetivo é previsibilidade de crescimento, a conversa precisa começar com contexto real da sua operação. Aqui você fala com foco em solução e impacto no caixa.',
  serviceContext: 'Contato',
  copyContract: {
    promise: 'Entrada rápida, clara e orientada a decisão.',
    pain: 'Empresas chegam com dúvidas urgentes, mas sem um processo claro para transformar isso em plano de ação prático.',
    impactoFinanceiro:
      'Quanto mais o diagnóstico inicial atrasa, mais a operação mantém desperdícios ativos e perde oportunidades de receita no curto prazo.',
    prova:
      'Nosso contato inicial já coleta os dados críticos para triagem: Nome, Email, WhatsApp e Site da Empresa, acelerando o próximo passo com precisão.',
    metodo:
      'Após o envio, avaliamos contexto, priorizamos gargalos e direcionamos a trilha mais aderente entre aquisição, conversão, dados e implantação de IA.',
    cta: 'Preencha seus dados e solicite agora o diagnóstico inicial da sua operação.',
  },
  painPoints: [
    'Falta de clareza sobre onde está o principal gargalo hoje.',
    'Dificuldade de priorizar ações com impacto em receita.',
    'Operação com muitas frentes e pouca direção estratégica.',
    'Necessidade de resposta rápida com base em dados reais.',
  ],
  impactPoints: [
    'Manutenção de custos ineficientes por mais tempo.',
    'Menor velocidade para capturar demanda qualificada.',
    'Risco de decisões reativas que comprometem margem.',
    'Baixa previsibilidade de entrada de vendas no mês.',
  ],
  howItWorks: [
    'Envio dos dados iniciais para triagem estratégica.',
    'Leitura do contexto da operação e dos gargalos críticos.',
    'Definição do plano inicial com foco em caixa e execução.',
    'Condução do próximo passo com especialista e Lucca.',
  ],
  proofMetrics: [],
  faq: [
    {
      question: 'O diagnóstico inicial tem custo?',
      answer:
        'A triagem inicial é sem compromisso e serve para entender aderência, urgência e próximos passos mais inteligentes para sua operação.',
    },
    {
      question: 'Quais dados devo enviar no primeiro contato?',
      answer:
        'Nome, Email, WhatsApp e Site da Empresa. Com isso já conseguimos montar um contexto inicial para direcionamento objetivo.',
    },
    {
      question: 'Quanto tempo para retorno após o envio?',
      answer:
        'A equipe organiza o retorno conforme prioridade e complexidade. O objetivo é responder com clareza e próximo passo prático.',
    },
    {
      question: 'Posso tratar mais de uma frente no mesmo diagnóstico?',
      answer:
        'Sim. Mapeamos aquisição, conversão e dados para definir a ordem de execução por impacto financeiro e capacidade operacional.',
    },
  ],
  relatedPages: [
    {
      label: 'Sobre',
      href: '/a-neuroads/sobre',
      description: 'Conheça posicionamento, experiência e diferenciais da NeuroAds.',
    },
    {
      label: 'Nosso Método',
      href: '/a-neuroads/nosso-metodo',
      description: 'Veja como estruturamos o ciclo completo de crescimento previsível.',
    },
    {
      label: 'Gestão de Tráfego (Google + Meta)',
      href: '/servicos/gestao-de-trafego-google-meta',
      description: 'Acesse a frente de aquisição com foco em retorno financeiro.',
    },
    {
      label: 'Implantação de Agentes IA',
      href: '/servicos/implantacao-de-agentes-ia',
      description: 'Conheça a frente de automação inteligente da operação comercial.',
    },
  ],
  media: {
    title: 'Contato NeuroAds',
    poster: '/images/especialista.jpg',
    desktopVideo: '/videos/fundovideo.mp4',
    mobileVideo: '/videos/fundovideo.mp4',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}

