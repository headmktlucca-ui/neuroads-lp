import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'FAQ NeuroAds | Perguntas Frequentes para PMEs',
  description:
    'FAQ completo da NeuroAds com respostas práticas sobre investimento, prazo, SEO + GEO, IA agêntica, Lucca e operação. Clareza para escalar com dados reais.',
};

const content: SubmenuPageContent = {
  slug: 'conteudos-faq',
  eyebrow: 'Conteúdos NeuroAds',
  headline: 'FAQ completo para empresários que querem',
  highlightedHeadline: 'escala previsível',
  subheadline:
    'Organizamos as dúvidas mais frequentes sobre estratégia, operação e resultado financeiro para você decidir com segurança, sem promessas vagas.',
  serviceContext: 'FAQ',
  copyContract: {
    promise: 'Clareza estratégica para reduzir risco e acelerar decisão.',
    pain: 'Muitas PMEs investem em marketing sem saber o que está funcionando, o que está drenando caixa e onde está o próximo ganho real.',
    impactoFinanceiro:
      'Sem uma leitura objetiva da operação, o custo por lead sobe, a previsibilidade cai e o faturamento fica dependente de tentativa e erro.',
    prova:
      'Nosso FAQ traduz dúvidas comuns em decisões práticas com base em dados reais de operação, métricas financeiras e método validado em PMEs.',
    metodo:
      'A partir do seu contexto, alinhamos prioridade de curto prazo (eficiência e conversão) e plano de médio prazo (escala sustentável).',
    cta: 'Se sua operação tem uma variável específica, solicite diagnóstico para receber direcionamento claro por prioridade de impacto no caixa.',
  },
  painPoints: [
    'Investimento em mídia sem leitura clara de retorno.',
    'Relatórios difíceis de traduzir para decisão financeira.',
    'Falta de integração entre tráfego, SEO/GEO, CRM e time comercial.',
    'Dependência de ações pontuais, sem sistema contínuo de performance.',
    'Dúvida sobre como aplicar IA sem aumentar complexidade operacional.',
  ],
  impactPoints: [
    'Aumento de custo por aquisição por falta de ajustes rápidos.',
    'Perda de oportunidades por baixa previsibilidade de demanda.',
    'Decisões lentas por ausência de indicadores confiáveis.',
    'Desperdício de horas da equipe em tarefas repetitivas.',
    'Crescimento travado mesmo com investimento mensal recorrente.',
  ],
  howItWorks: [
    'Mapeamento inicial dos gargalos de aquisição, conversão e operação.',
    'Diagnóstico com prioridade financeira: o que mexe no caixa primeiro.',
    'Plano tático de execução com métricas de acompanhamento objetivas.',
    'Ciclo contínuo de otimização com supervisão estratégica sênior.',
    'Integração de SEO + GEO + IA agêntica para ganho composto.',
  ],
  proofMetrics: [
    { value: '25+ anos', label: 'Experiência em growth', detail: 'Atuação prática em operações comerciais de PMEs em múltiplos setores.' },
    { value: 'R$ 10M+', label: 'Investimento gerenciado', detail: 'Gestão orientada a eficiência, margem e previsibilidade de receita.' },
    { value: 'ROAS 5,2x', label: 'Média operacional', detail: 'Resultado recorrente com governança de dados e melhoria contínua.' },
    { value: 'CPL R$ 4,82', label: 'Eficiência de aquisição', detail: 'Redução média de 18,2% no custo por lead nas contas monitoradas.' },
  ],
  faq: [
    {
      question: '1) A NeuroAds garante resultado?',
      answer:
        'Não trabalhamos com promessa de resultado garantido. Trabalhamos com diagnóstico, método, execução disciplinada e melhoria contínua para elevar previsibilidade e retorno com dados reais.',
    },
    {
      question: '2) Em quanto tempo começo a perceber evolução?',
      answer:
        'O prazo varia por maturidade da operação. Normalmente, os primeiros ganhos aparecem na eficiência (ex.: redução de desperdício e melhor taxa de conversão) antes da escala de volume.',
    },
    {
      question: '3) Quais métricas vocês priorizam?',
      answer:
        'Priorizamos métricas com impacto financeiro direto: CPL, CAC, ROAS, taxa de conversão, receita incremental e margem. Alcance e curtidas não são tratados como KPI principal de negócio.',
    },
    {
      question: '4) SEO morreu ou ainda vale a pena?',
      answer:
        'SEO não morreu. Ele evoluiu para SEO + GEO. Além de ranking no Google, sua marca precisa ser encontrada e citada em mecanismos de resposta por IA como ChatGPT, Gemini e Perplexity.',
    },
    {
      question: '5) O que é GEO na prática?',
      answer:
        'GEO é otimização para mecanismos generativos. Isso envolve estrutura de conteúdo, sinais de autoridade, consistência semântica e dados de contexto para ampliar presença em respostas de IA.',
    },
    {
      question: '6) IA é viável para PME ou só para grandes empresas?',
      answer:
        'É viável para PME quando aplicada com objetivo claro. IA agêntica reduz tarefas operacionais, acelera decisões e libera o time para atividades de maior valor comercial.',
    },
    {
      question: '7) O Lucca substitui equipe humana?',
      answer:
        'Não. O Lucca potencializa a equipe. A tecnologia executa rotinas e organiza sinais, enquanto o direcionamento estratégico e decisões críticas continuam com especialistas.',
    },
    {
      question: '8) Como funciona o suporte e acompanhamento?',
      answer:
        'Você tem acompanhamento estratégico contínuo, com leitura de desempenho, priorização tática e ajustes orientados a resultado financeiro da operação.',
    },
    {
      question: '9) Vou falar com estagiário ou com especialista?',
      answer:
        'A condução é sênior, com foco em decisão de negócio. O modelo evita repasses sem contexto e prioriza clareza para ações de impacto real.',
    },
    {
      question: '10) O que preciso ter para começar?',
      answer:
        'No mínimo: acesso às contas de mídia, site/landing pages, contexto de oferta e metas comerciais. Com isso, estruturamos rapidamente um plano inicial de execução.',
    },
    {
      question: '11) Vocês atuam apenas em tráfego pago?',
      answer:
        'Não. A proposta é ecossistema integrado: Gestão de Tráfego (Google + Meta), SEO + GEO e implantação de agentes de IA comercial para escala previsível.',
    },
    {
      question: '12) Como vocês lidam com rastreamento e iOS?',
      answer:
        'Trabalhamos com governança de dados e estrutura de mensuração adequada ao cenário atual, reduzindo ruído de atribuição para melhorar qualidade de decisão.',
    },
    {
      question: '13) Meu marketing atual parece bom, mas as vendas não sobem. E agora?',
      answer:
        'Esse é um cenário comum. Geralmente há desalinhamento entre aquisição, oferta, jornada e conversão comercial. O diagnóstico identifica o gargalo e prioriza correção por impacto no caixa.',
    },
    {
      question: '14) Existe contrato longo obrigatório?',
      answer:
        'O formato depende do escopo e estágio da operação. O foco é construir um sistema sustentável, com compromisso de execução e transparência de evolução.',
    },
    {
      question: '15) Como vocês apresentam resultados?',
      answer:
        'Com linguagem direta e traduzida para negócio: o que subiu/baixou, por que aconteceu e qual impacto financeiro prático para o próximo ciclo.',
    },
    {
      question: '16) Vocês atendem somente alguns segmentos?',
      answer:
        'Atendemos PMEs de diferentes mercados, desde que exista potencial de estruturação comercial e dados mínimos para gestão por performance.',
    },
    {
      question: '17) É possível começar pequeno e escalar depois?',
      answer:
        'Sim. O caminho mais saudável é validar eficiência em um escopo inicial e ampliar investimento com base em evidência de performance.',
    },
    {
      question: '18) Qual o maior erro que vocês veem nas PMEs?',
      answer:
        'Operar por canal isolado. Quando tráfego, SEO/GEO, CRM e operação comercial não conversam, o custo sobe e a previsibilidade de receita cai.',
    },
  ],
  relatedPages: [
    {
      label: 'Nosso Método',
      href: '/a-neuroads/nosso-metodo',
      description: 'Veja o processo completo de diagnóstico, execução e otimização contínua.',
    },
    {
      label: 'Gestão de Tráfego (Google + Meta)',
      href: '/servicos/gestao-de-trafego-google-meta',
      description: 'Entenda como estruturamos aquisição com foco em previsibilidade e margem.',
    },
    {
      label: 'SEO + GEO',
      href: '/servicos/seo-geo',
      description: 'Conheça a estratégia para posicionamento no Google e em mecanismos generativos.',
    },
    {
      label: 'Implantação de Agentes IA',
      href: '/servicos/implantacao-de-agentes-ia',
      description: 'Descubra como reduzir esforço operacional com IA agêntica aplicada.',
    },
    {
      label: 'Além do Algoritmo',
      href: '/conteudos/alem-do-algoritmo',
      description: 'Conteúdo estratégico para decisões de marketing orientadas por dados reais.',
    },
    {
      label: 'Contato',
      href: '/a-neuroads/contato',
      description: 'Envie seu contexto e receba um direcionamento inicial para sua operação.',
    },
  ],
  media: {
    title: 'FAQ NeuroAds',
    poster: '/images/tools/concorrentes.png',
    desktopVideo: '/videos/fundovideo.mp4',
    mobileVideo: '/videos/fundovideo.mp4',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}
