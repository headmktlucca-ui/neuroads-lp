export interface Agent {
  title: string;
  description: string;
  longDescription: string;
  icon: string;
  color: string;
  category: string;
}

export const agents: Agent[] = [
  {
    title: 'Analista de Tráfego',
    description: 'Diagnóstico neural de campanhas com tomada de decisão automática baseada em ROI.',
    longDescription: 'Uma inteligência artificial avançada que se conecta diretamente às suas contas de anúncios (Google e Meta) para realizar diagnósticos em tempo real. Identifica desperdícios de orçamento, campanhas com fadiga de criativo e sugere ajustes automáticos de lances baseados no seu ROI alvo, otimizando cada centavo do seu investimento.',
    icon: '/images/tools/analista_trafego.png',
    color: 'var(--color-brand-orange)',
    category: 'Performance'
  },
  {
    title: 'Gerador de Criativos',
    description: 'Criação de copies e conceitos visuais de alto impacto validados por padrões de conversão.',
    longDescription: 'Esta ferramenta utiliza modelos de visão computacional e análise de dados históricos de milhares de anúncios para sugerir layouts e conceitos visuais com alta probabilidade de conversão. Ela analisa os padrões visuais que mais performam no seu nicho e gera briefs detalhados prontos para execução.',
    icon: '/images/tools/gerador_criativos.png',
    color: 'var(--color-brand-orange)',
    category: 'Criativos'
  },
  {
    title: 'Gerador de Copies de Conversão',
    description: 'Motor rápido focado na geração expressa de headlines, CTAs chamativos e argumentos diretos.',
    longDescription: 'Especializado em frameworks de persuasão neuro-cognitiva (AIDA, PAS). Este motor gera dezenas de variações de anúncios em segundos, focando em quebrar objeções específicas do seu avatar e destacar os diferenciais competitivos da sua oferta de forma irresistível.',
    icon: '/images/tools/gerador_copies.png',
    color: 'var(--color-brand-orange)',
    category: 'Criativos'
  },
  {
    title: 'Análise Viral',
    description: 'Identificação de padrões de conteúdo com alto potencial de compartilhamento.',
    longDescription: 'Detecta o "pulso" das redes sociais em tempo real. Analisa quais ganchos (hooks) e estruturas de vídeo estão gerando tração exponencial no seu nicho, permitindo que sua marca produza conteúdo "trend-aware" que já nasce com alto potencial de compartilhamento e retenção.',
    icon: '/images/tools/analise_viral.png',
    color: 'var(--color-brand-orange)',
    category: 'Criativos'
  },
  {
    title: 'Rastreador Cirúrgico',
    description: 'Implementação de tracking Lado-Servidor para ignorar bloqueios de cookies.',
    longDescription: 'Uma solução robusta de rastreamento Server-Side. Garante atribuição precisa mesmo após as mudanças do iOS14+, enviando dados diretos de servidor para servidor para as plataformas. Isso permite que seus algoritmos de otimização recebam dados limpos, reduzindo o CPA drasticamente.',
    icon: '/images/tools/rastreador_cirurgico.png',
    color: 'var(--color-brand-orange)',
    category: 'Técnico'
  },
  {
    title: 'Preditor de Funil',
    description: 'Simulação de cenários de escala e previsão de ROI antes de investir.',
    longDescription: 'Um simulador matemático de alta fidelidade para funis de vendas. Projeta cenários de faturamento e lucro com base em taxas de conversão, CPC e ticket médio. Permite stress-test da sua operação antes de escalar o orçamento no gerenciador de anúncios.',
    icon: '/images/tools/preditor_funil.png',
    color: 'var(--color-brand-orange)',
    category: 'Técnico'
  },
  {
    title: 'Diagnóstico de Landing Page',
    description: 'Análise de problemas de conversão, UX e clareza da oferta da sua página final.',
    longDescription: 'Auditoria algorítmica de páginas de destino. Avalia tempo de resposta, legibilidade mobile, hierarquia de informações e força da oferta (Value Proposition). Aponta cirurgicamente onde os usuários estão "dropando" e sugere correções de layout para aumentar a taxa de conversão.',
    icon: '/images/tools/diagnostico_lp.png',
    color: 'var(--color-brand-orange)',
    category: 'Inteligência'
  },
  {
    title: 'Simulador de ROAS',
    description: 'Projete sua meta de faturamento e descubra o investimento necessário.',
    longDescription: 'Calculadora de metas reversa. Define exatamente quanto você precisa alocar em anúncios para atingir um faturamento específico, considerando margem de lucro operacional e taxas de gateway. Essencial para planejamento de fluxo de caixa em lançamentos ou perenidade.',
    icon: '/images/tools/simulador_roas.png',
    color: 'var(--color-brand-orange)',
    category: 'Performance'
  },
  {
    title: 'Analisador de Público',
    description: 'Refinamento avançado com sugestões de segmentações prontas por nicho.',
    longDescription: 'Cruza dados de interesses e comportamentos ocultos para encontrar o "oceano azul" no Facebook e Google. Sugere combinações de públicos que seus concorrentes desconhecem, permitindo que você anuncie para pessoas altamente qualificadas com menor custo por clique.',
    icon: '/images/tools/analisador_publico.png',
    color: 'var(--color-brand-orange)',
    category: 'Inteligência'
  },
  {
    title: 'Diagnóstico de Funil',
    description: 'Mapeamento visual do seu gargalo identificando as quebras no fluxo.',
    longDescription: 'Identifica visualmente os vazamentos no seu processo de vendas. Mapeia a jornada do cliente desde o primeiro clique até o checkout, destacando onde a perda de tráfego é anormal e sugerindo novos pontos de contato para recuperação de vendas.',
    icon: '/images/tools/diagnostico_funil.png',
    color: 'var(--color-brand-orange)',
    category: 'Técnico'
  },
  {
    title: 'Auditor de Desperdício',
    description: 'Escaneia a conta isolando gastos que não revertem em vendas.',
    longDescription: 'Algoritmo de varredura negativa. Localiza termos de pesquisa irrelevantes, posicionamentos de baixa performance e horários de pico onde o orçamento é drenado sem conversão. Uma ferramenta obrigatória para quem deseja "limpar" o tráfego e focar apenas no que traz lucro.',
    icon: '/images/tools/auditor_desperdicio.png',
    color: 'var(--color-brand-orange)',
    category: 'Performance'
  },
  {
    title: 'Otimizador de Orçamento',
    description: 'Redistribuição tática do seu budget para alavancar performance.',
    longDescription: 'Sugere a alocação dinâmica de verba entre diferentes campanhas e plataformas (CBO/ABO). Utiliza estatística bayesiana para prever quais campanhas têm maior probabilidade de manter o ROI se receberem mais verba nas próximas 24 horas.',
    icon: '/images/tools/alocacao.png',
    color: 'var(--color-brand-orange)',
    category: 'Performance'
  },
  {
    title: 'Gerador de Testes A/B',
    description: 'Roteirizador inteligente que projeta variações ideais de anúncios.',
    longDescription: 'Cria protocolos de testes estatisticamente válidos. Define quais elementos (Headline, Criativo, CTA) devem ser testados primeiro para obter o maior ganho de performance no menor tempo possível, eliminando a "adivinhação" do tráfego pago.',
    icon: '/images/tools/testes.png',
    color: 'var(--color-brand-orange)',
    category: 'Técnico'
  },
  {
    title: 'Avaliador de Oferta',
    description: 'Varredura sistêmica na sua estruturação de preço-valor.',
    longDescription: 'Analisa matematicamente quão atraente sua oferta é comparada ao benchmark do mercado. Avalia bônus, garantias e ancoragem de preço, fornecendo um Score de Atratividade que prediz a facilidade de venda do produto.',
    icon: '/images/tools/mineracao.png',
    color: 'var(--color-brand-orange)',
    category: 'Inteligência'
  },
  {
    title: 'Radar de Oportunidades',
    description: 'Detecção contínua de canais subestimados e oceano azul.',
    longDescription: 'Rastreador de fontes de tráfego emergentes. Monitora mudanças nos algoritmos e novas redes de display/pesquisa onde a atenção do usuário está barata, permitindo o pioneirismo em novos canais de aquisição de clientes.',
    icon: '/images/tools/analise.png',
    color: 'var(--color-brand-orange)',
    category: 'Inteligência'
  },
  {
    title: 'DNA da Marca',
    description: 'Elaboração de documento estratégico com tom de voz e pilares.',
    longDescription: 'Define a identidade neural da sua marca para anúncios. Cria um guia de comunicação que garante unidade visual e verbal através de todos os canais, aumentando a lembrança de marca e a confiança mútua entre cliente e empresa.',
    icon: '/images/tools/dna_marca.png',
    color: 'var(--color-brand-orange)',
    category: 'Inteligência'
  },
  {
    title: 'Análise de Concorrentes',
    description: 'Varredura profunda para identificar estratégias dos rivais.',
    longDescription: 'Ferramenta de inteligência competitiva. Monitora a biblioteca de anúncios e ofertas de concorrentes em tempo real, alertando sobre novos criativos que estão escalando ou mudanças nas estratégias de retenção deles.',
    icon: '/images/tools/concorrentes.png',
    color: 'var(--color-brand-orange)',
    category: 'Inteligência'
  },
  {
    title: 'Público-Alvo Ideal',
    description: 'Pesquisa neural de segmentação e engajamento social.',
    longDescription: 'Constrói o avatar definitivo com base em pegadas digitais reais. Vai além de idade e gênero, identificando "clusters" de interesses correlacionados que movem a decisão de compra no subconsciente do seu público.',
    icon: '/images/tools/publico_ideal.png',
    color: 'var(--color-brand-orange)',
    category: 'Inteligência'
  }
];
