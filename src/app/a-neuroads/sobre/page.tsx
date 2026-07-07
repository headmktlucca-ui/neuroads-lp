import type { Metadata } from 'next';
import StrategicContentPageShell, { type StrategicContentPageData } from '@/components/neuroads/StrategicContentPageShell';

export const metadata: Metadata = {
  title: 'Sobre a NeuroAds | Growth com IA Agêntica',
  description:
    'Conheça a NeuroAds: posicionamento, experiência e método para construir sistemas de marketing que geram resultado enquanto o empresário foca no negócio.',
};

const content: StrategicContentPageData = {
  slug: 'a-neuroads-sobre',
  eyebrow: 'Quem Somos',
  title: 'Você tem uma mina de ouro em',
  highlightedTitle: 'dados e processos de vendas.',
  subtitle:
    'Esqueça as planilhas, as gambiarras em dashboards e a complexidade excessiva na gestão de mídia e vendas B2B. A NeuroAds ajuda pequenas, médias e grandes empresas a estruturar, organizar e escalar a operação de marketing e vendas por meio de dados e IA Agêntica.',
  primaryCta: { label: 'Ativar meu ecossistema', href: '/cadastro' },
  secondaryCta: { label: 'Ver nosso método', href: '/a-neuroads/nosso-metodo' },
  highlights: [
    { title: 'Suporte integral', description: 'Tratamos cada solicitação com atenção e cuidado humano, apoiando sua operação de ponta a ponta.', icon: 'handshake' },
    { title: 'Especialistas em dados', description: 'Oferecemos implantação ativa, configurando fontes de dados e integrando os agentes ao seu CRM.', icon: 'gauge' },
    { title: 'Inteligência artificial', description: 'Usamos inteligência artificial para simplificar processos, acelerar entregas e eliminar esforço manual.', icon: 'goal' },
    { title: 'Foco no caixa', description: 'Acreditamos fielmente que empresas de todos os tamanhos podem crescer fazendo bom uso dos dados que geram.', icon: 'layers' },
  ],
  sections: [
    {
      title: 'Tornar a gestão de dados e IA acessível',
      description:
        'Com a NeuroAds você integra a inteligência das suas campanhas e ferramentas de CRM em uma única visão, com foco total nos indicadores de impacto financeiro real da empresa.',
      bullets: [
        'Integração de dados de diversas ferramentas em uma única visão.',
        'Foco total nas métricas de crescimento da empresa como um todo.',
        'Métricas e indicadores que realmente demonstram o impacto de marketing ou vendas na operação.',
        'Acreditamos que dados e IA devem provar e justificar os investimentos realizados.',
      ],
    },
    {
      title: 'Esqueça cliques e impressões de anúncios',
      description:
        'Estamos falando de métricas que provam o retorno sobre investimento (ROI) e o impacto no caixa. Somos obcecados por eficiência e resultados operacionais previsíveis.',
      bullets: [
        'Decisões baseadas em indicadores financeiros reais e não em métricas de vaidade.',
        'Aceleração do funil comercial com agentes inteligentes trabalhando continuamente.',
        'Minimização do esforço operacional manual de compilar relatórios e planilhas.',
        'Previsibilidade e segurança para expandir os investimentos de aquisição.',
      ],
    },
  ],
  processTitle: 'Nossos pilares de parceria',
  processDescription:
    'Não queremos ser apenas mais um fornecedor, mas sim seu parceiro estratégico em toda a jornada de escala.',
  process: [
    { title: 'Suporte Integral', detail: 'Seu problema é o nosso problema. Tratamos cada solicitação com atenção e cuidado humano em cada etapa.' },
    { title: 'Especialistas em Dados', detail: 'Oferecemos implantação ativa, configurando integrações e trabalhando lado a lado com você pelo melhor resultado.' },
    { title: 'Inteligência Artificial', detail: 'Simplificamos processos, aceleramos análises e automatizamos tarefas complexas do funil de vendas.' },
    { title: 'Educação', detail: 'Produzimos materiais de apoio e conteúdo educativo para ajudar seu time a transformar dados em resultado real.' },
  ],
  comparison: {
    eyebrow: 'Modelo de atuação',
    title: 'A diferença entre rodar campanhas soltas e estruturar um ecossistema',
    description:
      'Quando dados, tráfego e IA não trabalham em harmonia, o resultado é desperdício de verba. Veja a comparação das abordagens:',
    left: {
      title: 'Operação Isolada',
      points: [
        'Decisões baseadas em cliques e visualizações de anúncios.',
        'Planilhas manuais e gambiarras de relatórios difíceis de ler.',
        'Falta de apoio na integração técnica e adoção da equipe.',
        'IA tratada de forma conceitual, sem aplicação no dia a dia.',
      ],
    },
    right: {
      title: 'Ecossistema NeuroAds',
      points: [
        'Métricas consolidadas de vendas, CPL e ROI focadas em caixa.',
        'Painéis automáticos e integrados em tempo real.',
        'Suporte dedicado com configuração lado a lado no seu CRM.',
        'Agentes de IA reais gerando insights e acelerando o funil.',
      ],
    },
  },
  miniCases: [
    {
      segment: 'Serviços B2B',
      bottleneck: 'Gestão lenta de leads e falta de padrão no follow-up.',
      result: 'Agentes de qualificação e inteligência automatizaram a triagem e aceleraram reuniões.',
    },
    {
      segment: 'Saúde e Clínicas',
      bottleneck: 'Mídia ativa alta sem clareza de pacientes reais gerados.',
      result: 'Conexão integrada de dados provou o ROI e otimizou a verba para os canais corretos.',
    },
    {
      segment: 'Mercado Imobiliário',
      bottleneck: 'Leads caros e dispersão de dados comerciais.',
      result: 'Funil integrado e atendimento de IA filtraram contatos para focar no fechamento de alto ticket.',
    },
  ],
  resourcesTitle: 'Recursos recomendados para PMEs',
  resources: [
    {
      title: 'A NeuroAds',
      description: 'Entenda quem somos, nossa equipe e nosso compromisso de crescimento.',
      href: '/a-neuroads/sobre',
    },
    {
      title: 'Nosso Método',
      description: 'Como estruturamos tráfego, automações e IA para escalar sua operação.',
      href: '/a-neuroads/nosso-metodo',
    },
    {
      title: 'Perguntas Frequentes',
      description: 'Tire suas dúvidas sobre integração, escopo, ferramentas e custos.',
      href: '/conteudos/faq',
    },
  ],
  faq: [
    {
      question: 'O suporte e a configuração estão inclusos?',
      answer:
        'Sim! Oferecemos acompanhamento total na implantação, ajudando a configurar as integrações de marketing e IA lado a lado com seu time comercial.',
    },
    {
      question: 'A NeuroAds serve para empresas de qualquer porte?',
      answer:
        'Nosso foco principal é estruturar a inteligência de dados e automação de PMEs que querem escalar com previsibilidade sem precisar de grandes times internos.',
    },
    {
      question: 'Como a IA ajuda no meu dia a dia?',
      answer:
        'Nossos agentes realizam tarefas operacionais de forma contínua: triagem de leads, alertas de anomalias de campanhas e consolidação de relatórios diários de performance.',
    },
  ],
  form: {
    title: 'Receba um diagnóstico gratuito com foco em caixa',
    description:
      'Mostramos onde está o maior vazamento de verba na sua operação e como IA e dados estruturados podem resolver isso.',
    ctaLabel: 'Quero meu diagnóstico gratuito',
    flow: 'analise',
    serviceContext: 'Sobre - Modelo Laiki de Dados e IA',
    successMessage: 'Diagnóstico solicitado com sucesso! Nossa equipe entrará em contato para agendar a apresentação.',
    includeMessage: true,
  },
  finalCtaBanner: {
    eyebrow: 'Pronto para parar de adivinhar?',
    title: 'Te convidamos a parar de "explicar métricas" e começar a mostrar crescimento!',
    description:
      'Chega de planilhas desorganizadas e cliques sem vendas. Dê o próximo passo para profissionalizar sua operação comercial com a NeuroAds.',
    primaryCta: { label: 'Começar agora mesmo', href: '/cadastro' },
    secondaryCta: { label: 'Falar com especialista', href: '/a-neuroads/contato' },
  },
};

import SobreClient from './SobreClient';

export default function Page() {
  return <SobreClient data={content} />;
}
