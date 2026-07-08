import { ConnectorKey } from '../lib/connectors';

export interface Agent {
  title: string;
  description: string;
  longDescription: string;
  icon: string;
  color: string;
  category: string;
  heroDescription?: string;
  requiredConnectors?: ConnectorKey[];
  isActivatable?: boolean;
}

const rawAgents: Agent[] = [
  {
    title: 'Analista de Tráfego',
    description: 'Diagnóstico neural de campanhas com tomada de decisão automática baseada em ROI.',
    longDescription: 'Uma inteligência artificial avançada que se conecta diretamente às suas contas de anúncios (Google e Meta) para realizar diagnósticos em tempo real. Identifica desperdícios de orçamento, campanhas com fadiga de criativo e sugere ajustes automáticos de lances baseados no seu ROI alvo, otimizando cada centavo do seu investimento.',
    icon: '/images/tools/analista_trafego.png',
    color: 'var(--color-brand-orange)',
    category: 'Performance'
  ,
    heroDescription: 'monitora campanhas em Google Ads e Meta de forma contínua para identificar desperdícios, oportunidades de escala e ajustes de conversão com prioridade no caixa da operação. Ele cruza dados reais de desempenho, redistribui orçamento por potencial de retorno e sinaliza decisões práticas para manter CPL competitivo e ROAS saudável. O resultado é mais previsibilidade comercial, menos achismo e avanço consistente da receita.',
    requiredConnectors: ['googleAds', 'metaAds', 'linkedinAds', 'ga4']
  },
  {
    title: 'Gerador de Criativos',
    description: 'Criação de copies e conceitos visuais de alto impacto validados por padrões de conversão.',
    longDescription: 'Esta ferramenta utiliza modelos de visão computacional e análise de dados históricos de milhares de anúncios para sugerir layouts e conceitos visuais com alta probabilidade de conversão. Ela analisa os padrões visuais que mais performam no seu nicho e gera briefs detalhados prontos para execução.',
    icon: '/images/tools/gerador_criativos.png',
    color: 'var(--color-brand-orange)',
    category: 'Criativos'
  ,
    heroDescription: 'conecta seus canais, lê indicadores reais de CTR, conversão e custo por lead para identificar quais mensagens e ângulos criativos têm maior potencial financeiro. Ele transforma dados de performance em oportunidades priorizadas e simulações práticas de impacto, apoiando ciclos contínuos de testes com foco em reduzir CPL e aumentar previsibilidade comercial.',
    requiredConnectors: ['googleAds', 'metaAds', 'linkedinAds', 'ga4']
  },
  {
    title: 'Gerador de Copies de Conversão',
    description: 'Motor rápido focado na geração expressa de headlines, CTAs chamativos e argumentos diretos.',
    longDescription: 'Especializado em frameworks de persuasão neuro-cognitiva (AIDA, PAS). Este motor gera dezenas de variações de anúncios em segundos, focando em quebrar objeções específicas do seu avatar e destacar os diferenciais competitivos da sua oferta de forma irresistível.',
    icon: '/images/tools/gerador_copies.png',
    color: 'var(--color-brand-orange)',
    category: 'Criativos'
  ,
    heroDescription: 'transforma sinais reais de performance em copies orientadas a resultado financeiro. Ele localiza padrões vencedores por canal, mensura prioridades de otimização e gera variações de headline, hook, corpo e CTA prontas para execução com foco em elevar conversão e controlar o custo por aquisição.',
    requiredConnectors: ['ga4', 'crm', 'googleAds', 'metaAds']
  },
  {
    title: 'Análise Viral',
    description: 'Identificação de padrões de conteúdo com alto potencial de compartilhamento.',
    longDescription: 'Detecta o "pulso" das redes sociais em tempo real. Analisa quais ganchos (hooks) e estruturas de vídeo estão gerando tração exponencial no seu nicho, permitindo que sua marca produza conteúdo "trend-aware" que já nasce com alto potencial de compartilhamento e retenção.',
    icon: '/images/tools/analise_viral.png',
    color: 'var(--color-brand-orange)',
    category: 'Criativos'
  ,
    heroDescription: 'monitora sinais quentes do mercado para mapear conteúdos em destaque nas últimas 24 horas. Ele transforma tendências em variações estratégicas de formato, narrativa e posicionamento, priorizando relevância comercial, clareza de oferta e impacto direto na geração de demanda.',
    requiredConnectors: ['googleAds', 'metaAds', 'linkedinAds', 'ga4']
  },
  {
    title: 'Rastreador Cirúrgico',
    description: 'Implementação de tracking Lado-Servidor para ignorar bloqueios de cookies.',
    longDescription: 'Uma solução robusta de rastreamento Server-Side. Garante atribuição precisa mesmo após as mudanças do iOS14+, enviando dados diretos de servidor para servidor para as plataformas. Isso permite que seus algoritmos de otimização recebam dados limpos, reduzindo o CPA drasticamente.',
    icon: '/images/tools/rastreador_cirurgico.png',
    color: 'var(--color-brand-orange)',
    category: 'Técnico'
  ,
    requiredConnectors: ['ga4', 'serverTracking', 'warehouse']
  },
  {
    title: 'Preditor de Funil',
    description: 'Simulação de cenários de escala e previsão de ROI antes de investir.',
    longDescription: 'Um simulador matemático de alta fidelidade para funis de vendas. Projeta cenários de faturamento e lucro com base em taxas de conversão, CPC e ticket médio. Permite stress-test da sua operação antes de escalar o orçamento no gerenciador de anúncios.',
    icon: '/images/tools/preditor_funil.png',
    color: 'var(--color-brand-orange)',
    category: 'Técnico'
  ,
    heroDescription: 'transforma sinais reais de tráfego e conversão em projeções financeiras acionáveis para cada etapa da jornada comercial. Ele estima volume necessário de cliques, leads, MQLs, SQLs e vendas para bater metas de receita, compara cenários de execução e aponta o caminho com melhor equilíbrio entre escala, custo e margem.',
    requiredConnectors: ['googleAds', 'metaAds', 'linkedinAds', 'ga4', 'crm', 'payments']
  },
  {
    title: 'Diagnóstico de Landing Page',
    description: 'Análise de problemas de conversão, UX e clareza da oferta da sua página final.',
    longDescription: 'Auditoria algorítmica de páginas de destino. Avalia tempo de resposta, legibilidade mobile, hierarquia de informações e força da oferta (Value Proposition). Aponta cirurgicamente onde os usuários estão "dropando" e sugere correções de layout para aumentar a taxa de conversão.',
    icon: '/images/tools/diagnostico_lp.png',
    color: 'var(--color-brand-orange)',
    category: 'Inteligência'
  ,
    heroDescription: 'funciona como um laboratório de conversão para identificar com precisão os pontos que derrubam resultado comercial na sua página. Ele cruza clareza de oferta, UX, copy, autoridade e consistência entre anúncio e landing page para encontrar gargalos críticos, priorizar ações e simular impacto esperado em conversão. Na prática, você recebe direção objetiva para ajustar o que realmente afeta receita, retenção e eficiência da operação.',
    requiredConnectors: ['ga4', 'googleAds', 'metaAds', 'crm']
  },
  {
    title: 'Simulador de ROAS',
    description: 'Projete sua meta de faturamento e descubra o investimento necessário.',
    longDescription: 'Calculadora de metas reversa. Define exatamente quanto você precisa alocar em anúncios para atingir um faturamento específico, considerando margem de lucro operacional e taxas de gateway. Essencial para planejamento de fluxo de caixa em lançamentos ou perenidade.',
    icon: '/images/tools/simulador_roas.png',
    color: 'var(--color-brand-orange)',
    category: 'Performance'
  ,
    heroDescription: 'conecta seus canais de mídia, consolida indicadores reais e transforma metas de faturamento em projeções acionáveis de investimento, leads e retorno. Ele identifica gaps entre o cenário atual e a meta desejada, prioriza oportunidades por canal e sugere simulações de escala com foco em previsibilidade de caixa. Com isso, sua operação decide orçamento com mais segurança, reduz desperdício e avança com consistência financeira.',
    requiredConnectors: ['googleAds', 'metaAds', 'linkedinAds', 'ga4', 'crm', 'payments']
  },
  {
    title: 'Analisador de Público',
    description: 'Refinamento avançado com sugestões de segmentações prontas por nicho.',
    longDescription: 'Cruza dados de interesses e comportamentos ocultos para encontrar o "oceano azul" no Facebook e Google. Sugere combinações de públicos que seus concorrentes desconhecem, permitindo que você anuncie para pessoas altamente qualificadas com menor custo por clique.',
    icon: '/images/tools/analisador_publico.png',
    color: 'var(--color-brand-orange)',
    category: 'Inteligência'
  ,
    requiredConnectors: ['ga4', 'crm', 'warehouse']
  },
  {
    title: 'Diagnóstico de Funil',
    description: 'Mapeamento visual do seu gargalo identificando as quebras no fluxo.',
    longDescription: 'Identifica visualmente os vazamentos no seu processo de vendas. Mapeia a jornada do cliente desde o primeiro clique até o checkout, destacando onde a perda de tráfego é anormal e sugerindo novos pontos de contato para recuperação de vendas.',
    icon: '/images/tools/diagnostico_funil.png',
    color: 'var(--color-brand-orange)',
    category: 'Técnico'
  ,
    requiredConnectors: ['ga4', 'serverTracking', 'warehouse']
  },
  {
    title: 'Auditor de Desperdício',
    description: 'Escaneia a conta isolando gastos que não revertem em vendas.',
    longDescription: 'Algoritmo de varredura negativa. Localiza termos de pesquisa irrelevantes, posicionamentos de baixa performance e horários de pico onde o orçamento é drenado sem conversão. Uma ferramenta obrigatória para quem deseja "limpar" o tráfego e focar apenas no que traz lucro.',
    icon: '/images/tools/auditor_desperdicio.png',
    color: 'var(--color-brand-orange)',
    category: 'Performance'
  ,
    heroDescription: 'cruza dados reais de mídia para detectar onde sua verba está sendo drenada sem retorno proporcional. Ele identifica canais, segmentações e padrões de baixa eficiência, estima o desperdício financeiro e simula cenários de recuperação para realocar investimento com foco em margem e previsibilidade. O resultado é uma operação mais enxuta, com decisões orientadas por dados reais e impacto direto no caixa.',
    requiredConnectors: ['googleAds', 'metaAds', 'linkedinAds', 'ga4']
  },
  {
    title: 'Otimizador de Orçamento',
    description: 'Redistribuição tática do seu budget para alavancar performance.',
    longDescription: 'Sugere a alocação dinâmica de verba entre diferentes campanhas e plataformas (CBO/ABO). Utiliza estatística bayesiana para prever quais campanhas têm maior probabilidade de manter o ROI se receberem mais verba nas próximas 24 horas.',
    icon: '/images/tools/alocacao.png',
    color: 'var(--color-brand-orange)',
    category: 'Performance'
  ,
    heroDescription: 'identifica o melhor destino para cada real investido entre seus canais ativos. Ele cruza custo, conversão e eficiência por fonte para simular realocações mais inteligentes, reduzir desperdício e aumentar previsibilidade de resultado financeiro. Na prática, você ganha um plano tático de distribuição de verba orientado por dados reais, com foco em escala previsível e consistência de caixa.',
    requiredConnectors: ['googleAds', 'metaAds', 'linkedinAds', 'ga4']
  },
  {
    title: 'Gerador de Testes A/B',
    description: 'Roteirizador inteligente que projeta variações ideais de anúncios.',
    longDescription: 'Cria protocolos de testes estatisticamente válidos. Define quais elementos (Headline, Criativo, CTA) devem ser testados primeiro para obter o maior ganho de performance no menor tempo possível, eliminando a "adivinhação" do tráfego pago.',
    icon: '/images/tools/testes.png',
    color: 'var(--color-brand-orange)',
    category: 'Técnico'
  ,
    requiredConnectors: ['ga4', 'serverTracking', 'warehouse']
  },
  {
    title: 'Avaliador de Oferta',
    description: 'Varredura sistêmica na sua estruturação de preço-valor.',
    longDescription: 'Analisa matematicamente quão atraente sua oferta é comparada ao benchmark do mercado. Avalia bônus, garantias e ancoragem de preço, fornecendo um Score de Atratividade que prediz a facilidade de venda do produto.',
    icon: '/images/tools/mineracao.png',
    color: 'var(--color-brand-orange)',
    category: 'Inteligência'
  ,
    requiredConnectors: ['ga4', 'crm', 'warehouse']
  },
  {
    title: 'Radar de Oportunidades',
    description: 'Detecção contínua de canais subestimados e oceano azul.',
    longDescription: 'Rastreador de fontes de tráfego emergentes. Monitora mudanças nos algoritmos e novas redes de display/pesquisa onde a atenção do usuário está barata, permitindo o pioneirismo em novos canais de aquisição de clientes.',
    icon: '/images/tools/analise.png',
    color: 'var(--color-brand-orange)',
    category: 'Inteligência'
  ,
    requiredConnectors: ['ga4', 'crm', 'warehouse']
  },
  {
    title: 'SEO & GEO',
    description: 'Especialista em posicionamento orgânico em buscadores e em recomendações de chats de IA.',
    longDescription: 'Agente dedicado à otimização completa de presença digital para dois ambientes críticos: mecanismos de busca tradicionais (SEO) e motores generativos (GEO). Estrutura conteúdo, autoridade semântica, entidades e arquitetura técnica para elevar relevância no Google/Bing e aumentar a probabilidade de citação em respostas de ChatGPT, Gemini, Claude, Manus e outras IAs. Inclui diagnóstico técnico, plano editorial orientado por intenção de busca e ajustes de marca para ganho de visibilidade recorrente.',
    icon: '/images/tools/otimizacao.png',
    color: 'var(--color-brand-orange)',
    category: 'Inteligência'
  ,
    requiredConnectors: ['ga4', 'crm', 'warehouse']
  },
  {
    title: 'Agente Editorial',
    description: 'Redação sênior focada em SEO/GEO com geração de imagens ultra-realistas, fluxo por e-mail e agendamento inteligente.',
    longDescription: 'O Agente Autônomo Editorial da NeuroAds é responsável pela criação ponta a ponta de conteúdo premium de negócios para o blog Além do Algoritmo. Ele estrutura redações ricas e otimizadas para busca e IA (SEO + GEO), projeta briefings visuais realistas (prompts limpos em inglês sem texto para DALL-E/Midjourney), dispara fluxos automatizados de rascunho por e-mail para aprovação do administrador e gerencia o agendamento distribuído de forma inteligente em dias e horários de pico de tráfego.',
    icon: '/images/tools/automacao.png',
    color: 'var(--color-brand-orange)',
    category: 'Inteligência'
  ,
    heroDescription: 'automatiza a produção completa de conteúdo estratégico e matérias de apoio para o canal Além do Algoritmo. Ele atua na pesquisa de palavras-chave, redação otimizada para SEO e GEO, briefing visual de imagens ultra-realistas com controle rígido de logos e textos, além de disparar rascunhos em e-mail operacional para aprovação direta dos administradores e coordenar um cronograma dinâmico de postagens para maximizar picos de audiência comercial.',
    requiredConnectors: ['ga4', 'crm']
  },
  {
    title: 'DNA da Marca',
    description: 'Elaboração de documento estratégico com tom de voz e pilares.',
    longDescription: 'Define a identidade neural da sua marca para anúncios. Cria um guia de comunicação que garante unidade visual e verbal através de todos os canais, aumentando a lembrança de marca e a confiança mútua entre cliente e empresa.',
    icon: '/images/tools/dna_marca.png',
    color: 'var(--color-brand-orange)',
    category: 'Inteligência'
  ,
    heroDescription: 'transforma posicionamento em linguagem comercial clara, garantindo consistência entre anúncios, páginas, roteiros e atendimento. Ele organiza diferenciais, dores e provas de valor para que cada mensagem reflita o que torna sua empresa única no mercado. Com isso, sua comunicação ganha força estratégica, aumenta a qualidade dos leads e melhora a conversão sem depender de improviso.',
    requiredConnectors: ['crm', 'ga4']
  },
  {
    title: 'Análise de Concorrentes',
    description: 'Varredura profunda para identificar estratégias dos rivais.',
    longDescription: 'Ferramenta de inteligência competitiva. Monitora a biblioteca de anúncios e ofertas de concorrentes em tempo real, alertando sobre novos criativos que estão escalando ou mudanças nas estratégias de retenção deles.',
    icon: '/images/tools/concorrentes.png',
    color: 'var(--color-brand-orange)',
    category: 'Inteligência'
  ,
    requiredConnectors: ['ga4', 'crm', 'warehouse']
  },
  {
    title: 'Público-Alvo Ideal',
    description: 'Pesquisa neural de segmentação e engajamento social.',
    longDescription: 'Constrói o avatar definitivo com base em pegadas digitais reais. Vai além de idade e gênero, identificando "clusters" de interesses correlacionados que movem a decisão de compra no subconsciente do seu público.',
    icon: '/images/tools/publico_ideal.png',
    color: 'var(--color-brand-orange)',
    category: 'Inteligência'
  ,
    requiredConnectors: ['ga4', 'crm', 'warehouse']
  },
  {
    title: 'Gerador de Carrossel',
    description: 'Cria sequências de slides persuasivos para LinkedIn, Instagram e Meta Ads com copy e estrutura AIDA.',
    longDescription: 'Estrutura carrosséis completos com até 10 slides — capa de impacto, slides de desenvolvimento e CTA final. Cada slide recebe headline, subtítulo, descrição visual e foco de funil (Atenção, Interesse, Desejo, Ação). O resultado é um briefing executável pronto para o designer ou para ferramentas como Canva e Adobe Express.',
    icon: '/images/tools/gerador_criativos.png',
    color: 'var(--color-brand-orange)',
    category: 'Criativos',
    heroDescription: 'transforma um tema, produto ou oferta em um carrossel completo de slides com headline, copy e diretriz visual por camada — pronto para aprovação e execução imediata no canal escolhido.',
    requiredConnectors: ['metaAds', 'ga4'],
  },
  {
    title: 'Roteirista de Vídeo',
    description: 'Roteiros cena-a-cena para vídeos curtos com gancho, agitação, oferta e CTA em até 60 segundos.',
    longDescription: 'Cria roteiros estruturados para Reels, TikTok, YouTube Shorts e vídeos de anúncio. Cada cena tem intervalo de tempo, tipo narrativo (Gancho / Agitação / Oferta / CTA), descrição visual, locução e texto de sobreposição. O output é um guia de gravação e edição pronto para o time de produção.',
    icon: '/images/tools/analise_viral.png',
    color: 'var(--color-brand-orange)',
    category: 'Criativos',
    heroDescription: 'produz roteiros cena-a-cena para vídeos curtos de alta conversão — com gancho nos 3 primeiros segundos, narrativa de persuasão e CTA irresistível. Cada roteiro vem com tempos, locução e descrição visual para execução imediata.',
    requiredConnectors: ['metaAds', 'ga4'],
  },
  {
    title: 'Redator de Artigos',
    description: 'Redação completa de artigos, newsletters e e-mails otimizados para SEO, GEO e nutrição de leads.',
    longDescription: 'Agente especializado em produção de conteúdo longo — artigos de blog, newsletters e sequências de e-mail marketing. Estrutura cada peça com título SEO, meta descrição, subtítulos H2/H3, copy persuasivo e CTA alinhado ao funil. Inclui briefing de imagem em inglês para geração com DALL-E ou Midjourney e recomendações de distribuição por canal.',
    icon: '/images/tools/automacao.png',
    color: 'var(--color-brand-orange)',
    category: 'Criativos',
    heroDescription: 'produz artigos, newsletters e e-mails completos — com estrutura SEO/GEO, copy persuasivo alinhado ao DNA da marca, briefing de imagem executável e recomendações de distribuição por canal e horário de pico.',
    requiredConnectors: ['ga4', 'crm'],
  },
  {
    title: 'Prospector Outbound',
    description: 'Identificação e abordagem automática de leads qualificados no perfil de cliente ideal.',
    longDescription: 'Busca ativa de leads em canais como e-mail corporativo, LinkedIn e base de dados qualificada. Cria abordagens frias personalizadas (Cold Mail) para decisores, gerenciando as respostas e encaminhando interessados.',
    icon: '/images/tools/mineracao.png',
    color: 'var(--color-brand-orange)',
    category: 'Aquisição',
    heroDescription: 'prospecta decisores no perfil de cliente ideal, construindo listas qualificadas e iniciando abordagens diretas de vendas automatizadas via múltiplos canais.',
    requiredConnectors: ['crm', 'ga4']
  },
  {
    title: 'Qualificador de ICP',
    description: 'Análise e pontuação de leads com base em critérios de fit e sinal de intenção de compra.',
    longDescription: 'Sistema inteligente de Lead Scoring e qualificação. Ele analisa dados demográficos, comportamento de navegação no site e interações de e-mail para pontuar leads usando o framework BANT/GPCT, identificando oportunidades prontas para abordagem direta.',
    icon: '/images/tools/publico_ideal.png',
    color: 'var(--color-brand-orange)',
    category: 'Aquisição',
    heroDescription: 'analisa e qualifica leads capturados, classificando a intenção de compra e fit com a empresa para priorizar os contatos de maior potencial comercial.',
    requiredConnectors: ['crm', 'ga4']
  },
  {
    title: 'Atendimento 24/7',
    description: 'Resolução autônoma de tickets e dúvidas frequentes com escalada inteligente para humanos.',
    longDescription: 'Um chatbot inteligente que se conecta à sua FAQ e documentação interna de suporte para responder dúvidas operacionais de clientes 24 horas por dia, 7 dias por semana, com redirecionamento automático para atendentes humanos em casos complexos.',
    icon: '/images/tools/default.png',
    color: 'var(--color-brand-orange)',
    category: 'Retenção',
    heroDescription: 'presta suporte automatizado e resolve tickets recorrentes usando a Base de Conhecimento, reduzindo o tempo de resposta e melhorando a satisfação do cliente.',
    requiredConnectors: ['crm']
  },
  {
    title: 'Histórico de Cliente',
    description: 'Consolidação do histórico completo de interações para contexto rico em cada atendimento.',
    longDescription: 'Centraliza todas as mensagens, compras, tickets resolvidos e interações anteriores de cada cliente ativo, montando um dossiê completo de contexto que ajuda o atendimento comercial e suporte a personalizar a conversa.',
    icon: '/images/tools/analise.png',
    color: 'var(--color-brand-orange)',
    category: 'Retenção',
    heroDescription: 'consolida a jornada e histórico do cliente a partir de integrações de CRM e suporte para municiar o atendimento com o melhor contexto possível.',
    requiredConnectors: ['crm']
  },
  {
    title: 'Closer por Chat',
    description: 'Condução autônoma da conversa de vendas com gestão de objeções e envio de proposta.',
    longDescription: 'Focado em etapas finais do funil. O closer por chat responde a objeções complexas de preço, recursos ou contrato, apresenta a proposta de forma persuasiva e guia o lead diretamente para o fechamento comercial.',
    icon: '/images/tools/gerador_copies.png',
    color: 'var(--color-brand-orange)',
    category: 'Conversão',
    heroDescription: 'assume negociações comerciais ativas via chat para contornar objeções de venda e apresentar propostas personalizadas, acelerando o ciclo comercial.',
    requiredConnectors: ['crm', 'payments']
  },
  {
    title: 'Contrato & Pagamento',
    description: 'Automação da coleta de assinatura digital e confirmação de pagamento dentro do fluxo.',
    longDescription: 'Agiliza a formalização da venda. Gera links de assinatura eletrônica de contratos e emite as ordens de pagamento (pix/cartão) integradas ao gateway do cliente, enviando lembretes de pendências de pagamento e confirmando a venda concluída.',
    icon: '/images/tools/testes.png',
    color: 'var(--color-brand-orange)',
    category: 'Conversão',
    heroDescription: 'gera e acompanha a assinatura de contratos e links de pagamento para fechar negociações de forma ágil e segura.',
    requiredConnectors: ['crm', 'payments']
  },
  {
    title: 'Reativação de Inativos',
    description: 'Identificação e abordagem de clientes inativos com ofertas personalizadas no momento certo.',
    longDescription: 'Varre a base de dados de clientes inativos (há mais de 30 dias sem compras ou login) e dispara sequências de reengajamento com ofertas altamente direcionadas com base no padrão anterior de consumo e interesse do cliente.',
    icon: '/images/tools/dna_marca.png',
    color: 'var(--color-brand-orange)',
    category: 'Pós-Venda',
    heroDescription: 'detecta clientes inativos e em risco de churn na base de clientes, acionando campanhas automatizadas de ofertas e valor para trazê-los de volta.',
    requiredConnectors: ['crm']
  },
  {
    title: 'Upsell Inteligente',
    description: 'Mapeamento de oportunidades de upgrade e expansão de receita na base atual de clientes.',
    longDescription: 'Analisa o uso e o engajamento dos clientes ativos nos planos vigentes. Identifica quando o cliente está próximo do limite de uso ou necessita de um serviço complementar, sugerindo upgrades ou cross-sells de valor no momento em que a satisfação está alta.',
    icon: '/images/tools/alocacao.png',
    color: 'var(--color-brand-orange)',
    category: 'Pós-Venda',
    heroDescription: 'rastreia a base ativa para identificar momentos ideais de satisfação e uso que justificam uma oferta de upgrade de plano ou cross-sell de novos serviços.',
    requiredConnectors: ['crm', 'payments']
  },
  {
    title: 'Fluxos de Nutrição',
    description: 'Criação e disparo de sequências de e-mail personalizadas por segmento e comportamento do lead.',
    longDescription: 'Estrutura réguas de relacionamento automáticas. Cria copys para cada estágio (topo, meio e fundo de funil) e configura gatilhos comportamentais (clique em link, download de material) para aquecer leads e prepará-los para prospecção.',
    icon: '/images/tools/automacao.png',
    color: 'var(--color-brand-orange)',
    category: 'Nutrição',
    heroDescription: 'desenha e operacionaliza fluxos de e-mail e mensagens de engajamento para educar, nutrir e qualificar sua base de leads.',
    requiredConnectors: ['crm']
  },
  {
    title: 'Lead Scoring',
    description: 'Pontuação automática de leads com base em engajamento e sinalização de prontidão para compra.',
    longDescription: 'Aplica um sistema de pontos a cada interação do lead (abertura de e-mail, visita à página de preços, interação em formulários). Alerta imediatamente o time de SDR (Vitor) quando o score do lead indica alta intenção de compra.',
    icon: '/images/tools/analista_trafego.png',
    color: 'var(--color-brand-orange)',
    category: 'Nutrição',
    heroDescription: 'pontua o nível de interesse de cada lead com base em ações reais para garantir que o time comercial aborde apenas os contatos mais quentes.',
    requiredConnectors: ['crm', 'ga4']
  },
  {
    title: 'Briefing de Reunião',
    description: 'Preparação automática de briefings com contexto, pauta e ações anteriores antes de cada reunião.',
    longDescription: 'Gera resumos inteligentes de contexto antes de reuniões com leads ou clientes. Compila dados do CRM, interações anteriores, redes sociais profissionais e dores mapeadas em um único briefing pronto para leitura do vendedor.',
    icon: '/images/tools/default.png',
    color: 'var(--color-brand-orange)',
    category: 'Gestão',
    heroDescription: 'reúne dados de histórico, interações e perfil da empresa antes de reuniões importantes, entregando um resumo de preparação de alto nível.',
    requiredConnectors: ['crm']
  },
  {
    title: 'Gestor de Tarefas',
    description: 'Distribuição e acompanhamento de tasks com priorização inteligente e alertas de deadline.',
    longDescription: 'Orquestra o fluxo de trabalho do time de marketing e vendas. Distribui as atividades geradas a partir de insights dos agentes, define prazos claros e envia alertas de acompanhamento para evitar gargalos operacionais.',
    icon: '/images/tools/otimizacao.png',
    color: 'var(--color-brand-orange)',
    category: 'Gestão',
    heroDescription: 'centraliza, delega e acompanha as tarefas pendentes na operação, otimizando o fluxo diário e garantindo o cumprimento de metas e prazos.',
    requiredConnectors: ['crm']
  },
  {
    title: 'Nome do Meu Agente',
    description: 'Breve descrição do agente (1 a 2 linhas).',
    longDescription: 'Descrição completa sobre o funcionamento e promessa do agente.',
    icon: '/images/tools/default.png',
    color: 'var(--color-brand-orange)',
    category: 'Inteligência',
    heroDescription: 'texto introdutório para exibir na home page do agente.',
    requiredConnectors: ['ga4', 'crm']
  }
];

// Placeholder de desenvolvimento — não exibir como agente real
const PLACEHOLDER_TITLES = new Set(['Nome do Meu Agente']);

export const agents: Agent[] = rawAgents
  .filter((agent) => !PLACEHOLDER_TITLES.has(agent.title))
  .map((agent) => ({
    ...agent,
    isActivatable: true,
  }));
