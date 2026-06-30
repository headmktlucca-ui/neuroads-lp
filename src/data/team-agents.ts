// NeuroAds — Elenco Definitivo de Agentes IA
// 10 personagens com identidade, personalidade e especialidades vinculadas

export interface TeamAgent {
  id: string;           // slug do agente (ex: 'paola')
  nome: string;         // 'PAOLA'
  funcao: string;       // 'Gestora de Tráfego Pago'
  categoria: string;    // 'MÍDIA PAGA'
  emoji: string;        // fallback emoji
  avatarSrc: string;    // caminho do avatar em /images/Avatar Agentes IA/
  cor: string;          // cor HEX do personagem
  genero: 'M' | 'F';
  tagline: string;
  descricao: string;
  personalidade: string;
  frase: string;        // frase de ativação / "ao vivo"
  habilidades: string[];
  specialtyTitles: string[];   // titles dos Specialty (Agent) que pertencem a este Agente
  comingSoonSpecialties: { title: string; description: string }[];
}

export const TEAM_AGENTS: TeamAgent[] = [
  {
    id: 'paola',
    nome: 'PAOLA',
    funcao: 'Gestora de Tráfego Pago',
    categoria: 'MÍDIA PAGA',
    emoji: '📡',
    avatarSrc: '/images/Avatar Agentes IA/Avatar_Paola.png',
    cor: '#FACC15',
    genero: 'F',
    tagline: 'Cada real investido rendendo o máximo possível.',
    descricao:
      'Paola monitora, redistribui verba, pausa o que não converte e cria variações de criativos — em tempo real, sem dormir.',
    personalidade: 'Analítica · Estratégica · Incansável',
    frase: 'CPA caindo 18%. Orçamento redistribuído para o conjunto A.',
    habilidades: [
      'Otimização de campanhas',
      'Redistribuição de verba',
      'Criação de variações',
      'Relatórios de performance',
    ],
    specialtyTitles: [
      'Analista de Tráfego',
      'Simulador de ROAS',
      'Auditor de Desperdício',
      'Otimizador de Orçamento',
    ],
    comingSoonSpecialties: [],
  },
  {
    id: 'lais',
    nome: 'LAÍS',
    funcao: 'Fábrica de Conteúdo & Criativos',
    categoria: 'CONTEÚDO',
    emoji: '✍️',
    avatarSrc: '/images/Avatar Agentes IA/Avatar_Lais.png',
    cor: '#FB923C',
    genero: 'F',
    tagline: 'Conteúdo que nutre, engaja e converte — em todos os canais.',
    descricao:
      'Laís produz criativos, artigos, posts, e-mail marketing e qualquer material que nutra leads e fortaleça a presença da marca — com consistência e escala.',
    personalidade: 'Criativa · Versátil · Consistente',
    frase: 'Calendário da semana criado. 12 peças prontas para aprovação.',
    habilidades: [
      'Posts para redes sociais',
      'Artigos de blog e newsletters',
      'Roteiros de vídeo',
      'E-mail marketing e nutrição',
    ],
    specialtyTitles: [
      'Gerador de Criativos',
      'Gerador de Copies de Conversão',
      'Análise Viral',
      'Agente Editorial',
      'DNA da Marca',
    ],
    comingSoonSpecialties: [],
  },
  {
    id: 'heitor',
    nome: 'HEITOR',
    funcao: 'Orquestrador de Processos',
    categoria: 'OPERAÇÕES',
    emoji: '⚙️',
    avatarSrc: '/images/Avatar Agentes IA/Avatar_Heitor.png',
    cor: '#60A5FA',
    genero: 'M',
    tagline: 'A operação toda nos trilhos. Sem erro. Sem atraso.',
    descricao:
      'Heitor garante que o tracking esteja preciso, os funis mapeados e os testes estruturados — cada etapa registrada e executada no tempo certo.',
    personalidade: 'Metódico · Confiável · Invisível',
    frase: 'Onboarding do cliente #247 concluído. 6 etapas executadas em 4 minutos.',
    habilidades: [
      'Rastreamento server-side',
      'Diagnóstico e mapeamento de funil',
      'Gestão de testes A/B',
      'Previsão de ROI por funil',
    ],
    specialtyTitles: [
      'Rastreador Cirúrgico',
      'Preditor de Funil',
      'Diagnóstico de Funil',
      'Gerador de Testes A/B',
    ],
    comingSoonSpecialties: [],
  },
  {
    id: 'igor',
    nome: 'IGOR',
    funcao: 'Analista de Dados & SEO',
    categoria: 'INTELIGÊNCIA',
    emoji: '🔭',
    avatarSrc: '/images/Avatar Agentes IA/Avatar_Igor.png',
    cor: '#A78BFA',
    genero: 'M',
    tagline: 'Transforma número em decisão. Dado em autoridade.',
    descricao:
      'Igor conecta todas as fontes, encontra o que ninguém estava procurando e entrega o insight antes de você precisar pedir — com foco em SEO, GEO e inteligência competitiva.',
    personalidade: 'Preciso · Analítico · Antecipador',
    frase: 'Anomalia detectada no funil. Relatório gerado com causa raiz.',
    habilidades: [
      'SEO & GEO (busca e IA generativa)',
      'Análise de concorrentes',
      'Inteligência de público e oferta',
      'Dashboards e detecção de anomalias',
    ],
    specialtyTitles: [
      'SEO & GEO',
      'Diagnóstico de Landing Page',
      'Analisador de Público',
      'Avaliador de Oferta',
      'Radar de Oportunidades',
      'Análise de Concorrentes',
      'Público-Alvo Ideal',
    ],
    comingSoonSpecialties: [],
  },
  {
    id: 'vitor',
    nome: 'VITOR',
    funcao: 'SDR Autônomo',
    categoria: 'AQUISIÇÃO',
    emoji: '⚡',
    avatarSrc: '/images/Avatar Agentes IA/Avatar_Vitor.png',
    cor: '#34D399',
    genero: 'M',
    tagline: 'Prospecta, qualifica e agenda. Sem parar.',
    descricao:
      'Vitor vai atrás do lead certo, no momento certo, com a mensagem certa — e não descansa até a reunião estar na agenda.',
    personalidade: 'Determinado · Incansável · Direto',
    frase: 'Novo lead qualificado identificado. Abordagem iniciada.',
    habilidades: [
      'Prospecção outbound',
      'Qualificação de ICP',
      'Agendamento automático',
      'Sequências multicanal',
    ],
    specialtyTitles: [],
    comingSoonSpecialties: [
      {
        title: 'Prospector Outbound',
        description: 'Identificação e abordagem automática de leads qualificados no perfil de cliente ideal.',
      },
      {
        title: 'Qualificador de ICP',
        description: 'Análise e pontuação de leads com base em critérios de fit e sinal de intenção de compra.',
      },
    ],
  },
  {
    id: 'manu',
    nome: 'MANU',
    funcao: 'Atendimento & Suporte',
    categoria: 'RETENÇÃO',
    emoji: '🤝',
    avatarSrc: '/images/Avatar Agentes IA/Avatar_Manu.png',
    cor: '#22D3EE',
    genero: 'F',
    tagline: 'Resolve antes do cliente terminar de reclamar.',
    descricao:
      'Manu atende com calor humano, resolve até 85% dos tickets sozinha e só chama reforço quando a situação realmente exige.',
    personalidade: 'Empática · Ágil · Acolhedora',
    frase: 'Entendi o problema. Já estou resolvendo pra você.',
    habilidades: [
      'Resolução autônoma de tickets',
      'Atendimento 24/7',
      'Escalada inteligente',
      'Histórico completo do cliente',
    ],
    specialtyTitles: [],
    comingSoonSpecialties: [
      {
        title: 'Atendimento 24/7',
        description: 'Resolução autônoma de tickets e dúvidas frequentes com escalada inteligente para humanos.',
      },
      {
        title: 'Histórico de Cliente',
        description: 'Consolidação do histórico completo de interações para contexto rico em cada atendimento.',
      },
    ],
  },
  {
    id: 'breno',
    nome: 'BRENO',
    funcao: 'Closer por Mensagem',
    categoria: 'CONVERSÃO',
    emoji: '🎯',
    avatarSrc: '/images/Avatar Agentes IA/Avatar_Breno.png',
    cor: '#34D399',
    genero: 'M',
    tagline: 'Entra na conversa e sai com o contrato assinado.',
    descricao:
      'Breno responde objeções, apresenta propostas, envia contratos e confirma pagamento — tudo dentro do chat, 24h por dia.',
    personalidade: 'Direto · Persuasivo · Confiante',
    frase: 'Proposta enviada. Aguardando assinatura do contrato.',
    habilidades: [
      'Gestão de objeções',
      'Envio de propostas',
      'Coleta de assinatura digital',
      'Confirmação de pagamento',
    ],
    specialtyTitles: [],
    comingSoonSpecialties: [
      {
        title: 'Closer por Chat',
        description: 'Condução autônoma da conversa de vendas com gestão de objeções e envio de proposta.',
      },
      {
        title: 'Contrato & Pagamento',
        description: 'Automação da coleta de assinatura digital e confirmação de pagamento dentro do fluxo.',
      },
    ],
  },
  {
    id: 'raissa',
    nome: 'RAÍSSA',
    funcao: 'Upsell & Reativação',
    categoria: 'PÓS-VENDA',
    emoji: '🔁',
    avatarSrc: '/images/Avatar Agentes IA/Avatar_Raissa.png',
    cor: '#22D3EE',
    genero: 'F',
    tagline: 'Receita extra extraída da base que você já conquistou.',
    descricao:
      'Raíssa identifica quem está pronto para comprar mais, quem sumiu sem avisar e age no momento exato com a oferta certa.',
    personalidade: 'Perspicaz · Calorosa · Oportuna',
    frase: 'Cliente inativo há 38 dias. Oferta personalizada enviada com sucesso.',
    habilidades: [
      'Identificação de potencial de upgrade',
      'Reativação de inativos',
      'Ofertas personalizadas',
      'Aumento de LTV',
    ],
    specialtyTitles: [],
    comingSoonSpecialties: [
      {
        title: 'Reativação de Inativos',
        description: 'Identificação e abordagem de clientes inativos com ofertas personalizadas no momento certo.',
      },
      {
        title: 'Upsell Inteligente',
        description: 'Mapeamento de oportunidades de upgrade e expansão de receita na base atual de clientes.',
      },
    ],
  },
  {
    id: 'taina',
    nome: 'TAINÁ',
    funcao: 'Nutrição de Leads',
    categoria: 'NUTRIÇÃO',
    emoji: '💌',
    avatarSrc: '/images/Avatar Agentes IA/Avatar_Taina.png',
    cor: '#F472B6',
    genero: 'F',
    tagline: 'O lead certo, na hora certa, com a mensagem certa.',
    descricao:
      'Tainá orquestra fluxos de nutrição personalizados, levando cada lead pelo caminho mais curto até a decisão de compra.',
    personalidade: 'Empática · Estratégica · Persuasiva',
    frase: 'Sequência de nutrição disparada. Taxa de abertura: 68%.',
    habilidades: [
      'Fluxos de e-mail personalizados',
      'Segmentação por comportamento',
      'Lead scoring automático',
      'Gatilhos de conversão',
    ],
    specialtyTitles: [],
    comingSoonSpecialties: [
      {
        title: 'Fluxos de Nutrição',
        description: 'Criação e disparo de sequências de e-mail personalizadas por segmento e comportamento do lead.',
      },
      {
        title: 'Lead Scoring',
        description: 'Pontuação automática de leads com base em engajamento e sinalização de prontidão para compra.',
      },
    ],
  },
  {
    id: 'ulisses',
    nome: 'ULISSES',
    funcao: 'Chief of Staff Virtual',
    categoria: 'GESTÃO',
    emoji: '🧭',
    avatarSrc: '/images/Avatar Agentes IA/Avatar_Ulisses.png',
    cor: '#FBBF24',
    genero: 'M',
    tagline: 'Você pensa no futuro. Ele cuida do presente.',
    descricao:
      'Ulisses organiza a agenda, filtra o que importa, prepara briefings, distribui tarefas e garante que nenhum deadline escape.',
    personalidade: 'Estratégico · Proativo · Discreto',
    frase: 'Agenda otimizada. Você tem 3h livres hoje para o que realmente importa.',
    habilidades: [
      'Gestão de agenda',
      'Filtragem de e-mails',
      'Briefings de reunião',
      'Distribuição de tarefas',
    ],
    specialtyTitles: [],
    comingSoonSpecialties: [
      {
        title: 'Briefing de Reunião',
        description: 'Preparação automática de briefings com contexto, pauta e ações anteriores antes de cada reunião.',
      },
      {
        title: 'Gestor de Tarefas',
        description: 'Distribuição e acompanhamento de tasks com priorização inteligente e alertas de deadline.',
      },
    ],
  },
];

/** Retorna o TeamAgent dono de uma especialidade pelo título */
export function getTeamAgentForSpecialty(specialtyTitle: string): TeamAgent | undefined {
  return TEAM_AGENTS.find((a) => a.specialtyTitles.includes(specialtyTitle));
}

/** Retorna TeamAgent pelo id/slug */
export function getTeamAgentById(id: string): TeamAgent | undefined {
  return TEAM_AGENTS.find((a) => a.id === id);
}
