/**
 * Template mestre de prompt de operação — Sprint 1 / P0
 *
 * Toda operação pré-configurada executada em hub/assistente-ia é montada a
 * partir deste template, que padroniza:
 *  1. Objetivo e entrega esperada da operação
 *  2. Protocolo de fontes em ordem obrigatória (conectores → Base de Conhecimento → web)
 *  3. Protocolo de autonomia (nunca perguntar o que pode ser descoberto)
 *  4. Gate de pergunta única consolidada (exceção controlada)
 *  5. Rastreabilidade de números (toda métrica cita fonte)
 *
 * Especificações por operação (conectores necessários, dados indispensáveis,
 * formato preferido de entrega) vivem no registro OPERATION_SPECS e são
 * mescladas ao template no momento da montagem.
 */

import { agents as allSpecialties } from '../data/agents';
import { getConnectorDisplayName } from './connectors';

/* ── Tipos ─────────────────────────────────────────────────────────── */

export type OperationSpec = {
  /** Título exato da especialidade em src/data/agents.ts */
  specialtyTitle: string;
  /** Nomes de exibição dos conectores que a operação usa como fonte primária */
  primaryConnectors?: string[];
  /**
   * Dados indispensáveis que, se ausentes de todas as fontes, entram no
   * gate de pergunta única. Formato: rótulo legível + por que é necessário.
   */
  essentialInputs?: Array<{ label: string; reason: string }>;
  /** Direção extra de pesquisa web/social específica desta operação */
  webResearchFocus?: string;
  /** Formato preferido do painel de resultado (tabela, checklist, ranking…) */
  preferredOutput?: string;
};

export type OperationBlockParams = {
  specialtyTitle: string | undefined;
  connected: string[];
  disconnected: string[];
};

/* ── Registro de especificações por operação ───────────────────────── */
/* Preenchido em lotes por agente no Sprint 2. Operações sem entrada     */
/* aqui usam o template mestre com o escopo de src/data/agents.ts.      */

export const OPERATION_SPECS: Record<string, OperationSpec> = {
  // ══ PAOLA — Tráfego pago ═══════════════════════════════════════════
  'Analista de Tráfego': {
    specialtyTitle: 'Analista de Tráfego',
    preferredOutput: 'Tabela por canal (Canal, Investimento, CTR, CPA, ROAS) + diagnóstico de fadiga de criativo.',
  },
  'Gerador de Criativos': {
    specialtyTitle: 'Gerador de Criativos',
    preferredOutput: 'Ranking de briefs de criativo priorizados por potencial de conversão, com ângulo e formato.',
  },
  'Gerador de Copies de Conversão': {
    specialtyTitle: 'Gerador de Copies de Conversão',
    preferredOutput: 'Lista de variações de headline/CTA agrupadas por objeção que quebram.',
  },
  'Análise Viral': {
    specialtyTitle: 'Análise Viral',
    webResearchFocus: 'Hooks, formatos e narrativas em alta nas redes sociais (Instagram, TikTok, YouTube Shorts) no nicho do usuário nas últimas 24-72h.',
    preferredOutput: 'Ranking de tendências com variação de aplicação para a marca do usuário.',
  },
  'Rastreador Cirúrgico': {
    specialtyTitle: 'Rastreador Cirúrgico',
    preferredOutput: 'Checklist técnico de implementação (Etapa, Ação, Status) para tracking server-side.',
  },
  'Preditor de Funil': {
    specialtyTitle: 'Preditor de Funil',
    essentialInputs: [
      { label: 'Ticket médio (R$)', reason: 'base do cálculo de conversão em receita por etapa do funil' },
      { label: 'Meta de vendas do período', reason: 'define o alvo da projeção' },
    ],
    preferredOutput: 'Tabela de cenários por nível de investimento (Investimento, Cliques, Leads, MQL, SQL, Vendas).',
  },
  'Diagnóstico de Landing Page': {
    specialtyTitle: 'Diagnóstico de Landing Page',
    essentialInputs: [
      { label: 'URL da landing page', reason: 'necessária para a auditoria — só peça se não constar no site do perfil nem na Base de Conhecimento' },
    ],
    preferredOutput: 'Lista de gargalos priorizados por impacto em conversão, com ação corretiva por item.',
  },
  'Simulador de ROAS': {
    specialtyTitle: 'Simulador de ROAS',
    primaryConnectors: ['Google Ads API', 'Meta Ads API', 'GA4 Data API'],
    essentialInputs: [
      { label: 'Ticket médio (R$)', reason: 'base do cálculo reverso de meta → vendas → verba' },
      { label: 'Meta de faturamento mensal (R$)', reason: 'define o alvo da simulação' },
    ],
    webResearchFocus:
      'CPC e CVR médios atuais do setor do usuário no Brasil, para calibrar cenários quando não houver histórico próprio.',
    preferredOutput:
      'Tabela de cenários (conservador/realista/agressivo) com colunas: Investimento, Cliques, Leads, Vendas, Faturamento, ROAS.',
  },
  'Analisador de Público': {
    specialtyTitle: 'Analisador de Público',
    webResearchFocus: 'Interesses, comportamentos e clusters de audiência associados ao nicho do usuário.',
    preferredOutput: 'Ranking de combinações de segmentação por potencial de CPC/qualidade.',
  },
  'Diagnóstico de Funil': {
    specialtyTitle: 'Diagnóstico de Funil',
    preferredOutput: 'Mapa de etapas do funil com taxa de queda e ponto crítico destacado.',
  },
  'Auditor de Desperdício': {
    specialtyTitle: 'Auditor de Desperdício',
    preferredOutput: 'Tabela de desperdícios identificados (Origem, Motivo, Valor estimado, Ação recomendada).',
  },
  'Otimizador de Orçamento': {
    specialtyTitle: 'Otimizador de Orçamento',
    essentialInputs: [
      { label: 'Meta de ROAS ou CPA alvo', reason: 'referência para decidir a realocação de verba entre campanhas' },
    ],
    preferredOutput: 'Plano de realocação (Campanha/Canal, Verba atual, Verba sugerida, Justificativa).',
  },
  'Gerador de Testes A/B': {
    specialtyTitle: 'Gerador de Testes A/B',
    essentialInputs: [
      { label: 'Elemento a testar (headline, criativo ou CTA)', reason: 'define o escopo do protocolo — pergunte só se o usuário não tiver indicado' },
    ],
    preferredOutput: 'Protocolo de teste (Elemento, Hipótese, Variações, Critério de vitória).',
  },
  'Avaliador de Oferta': {
    specialtyTitle: 'Avaliador de Oferta',
    essentialInputs: [
      { label: 'Estrutura da oferta (preço, bônus, garantia)', reason: 'necessária para o score — verifique primeiro na Base de Conhecimento/DNA da Marca' },
    ],
    webResearchFocus: 'Benchmark de ofertas equivalentes no mercado do usuário (preço, bônus, garantias praticadas).',
    preferredOutput: 'Score de atratividade com detalhamento por critério (preço, bônus, garantia, ancoragem).',
  },
  'Radar de Oportunidades': {
    specialtyTitle: 'Radar de Oportunidades',
    webResearchFocus: 'Canais de aquisição emergentes ou subestimados no setor do usuário, com custo de atenção em queda.',
    preferredOutput: 'Ranking de canais por oportunidade (Canal, Motivo, Estimativa de custo, Risco).',
  },

  // ══ IGOR — Dados & SEO/GEO ═════════════════════════════════════════
  'SEO & GEO': {
    specialtyTitle: 'SEO & GEO',
    webResearchFocus: 'Posição orgânica atual e presença em respostas de buscadores generativos (ChatGPT, Gemini, Claude) para os termos-chave do nicho do usuário.',
    preferredOutput: 'Plano de ação priorizado (Ação, Frente SEO/GEO, Impacto esperado).',
  },
  'Análise de Concorrentes': {
    specialtyTitle: 'Análise de Concorrentes',
    essentialInputs: [
      { label: 'Nome ou domínio dos concorrentes diretos', reason: 'necessário se não houver concorrentes já mapeados na Base de Conhecimento' },
    ],
    webResearchFocus: 'Biblioteca de anúncios ativos e movimentações recentes de posicionamento dos concorrentes indicados.',
    preferredOutput: 'Tabela comparativa (Concorrente, Estratégia observada, Oportunidade para o usuário).',
  },
  'Público-Alvo Ideal': {
    specialtyTitle: 'Público-Alvo Ideal',
    webResearchFocus: 'Padrões de comportamento e interesse do público do nicho do usuário.',
    preferredOutput: 'Perfil de avatar com clusters de interesse e gatilhos de decisão.',
  },

  // ══ LAÍS — Conteúdo & Criativos de Formato ═════════════════════════
  'Agente Editorial': {
    specialtyTitle: 'Agente Editorial',
    essentialInputs: [
      { label: 'Tema ou pauta do conteúdo', reason: 'define o escopo do artigo — pergunte só se não houver pauta definida no pedido ou na Base' },
    ],
    preferredOutput: 'Estrutura de artigo com título SEO, H2/H3, briefing de imagem e cronograma de publicação sugerido.',
  },
  'Gerador de Carrossel': {
    specialtyTitle: 'Gerador de Carrossel',
    essentialInputs: [
      { label: 'Tema, produto ou oferta do carrossel', reason: 'necessário para estruturar os slides — só pergunte se não estiver claro no pedido' },
    ],
    preferredOutput: 'Sequência de slides (Slide, Headline, Copy, Direção visual, Etapa AIDA).',
  },
  'Roteirista de Vídeo': {
    specialtyTitle: 'Roteirista de Vídeo',
    essentialInputs: [
      { label: 'Produto/oferta e duração alvo do vídeo', reason: 'necessário para calibrar o roteiro — só pergunte se não estiver claro no pedido' },
    ],
    preferredOutput: 'Roteiro cena a cena (Tempo, Tipo narrativo, Visual, Locução/texto).',
  },
  'Redator de Artigos': {
    specialtyTitle: 'Redator de Artigos',
    essentialInputs: [
      { label: 'Tema do artigo, newsletter ou e-mail', reason: 'necessário para redigir o conteúdo — só pergunte se não estiver claro no pedido' },
    ],
    preferredOutput: 'Peça completa com título SEO, meta descrição, corpo estruturado e CTA.',
  },
  'DNA da Marca': {
    specialtyTitle: 'DNA da Marca',
    preferredOutput: 'Documento com pilares de tom de voz, diferenciais e provas de valor.',
  },

  // ══ VITOR — SDR / Prospecção ═══════════════════════════════════════
  'Prospector Outbound': {
    specialtyTitle: 'Prospector Outbound',
    essentialInputs: [
      { label: 'Perfil de cliente ideal (cargo, setor, porte)', reason: 'necessário se não houver ICP definido no CRM ou na Base de Conhecimento' },
    ],
    preferredOutput: 'Lista de leads priorizados com abordagem de cold mail sugerida por perfil.',
  },
  'Qualificador de ICP': {
    specialtyTitle: 'Qualificador de ICP',
    preferredOutput: 'Ranking de leads por score BANT/GPCT com justificativa.',
  },

  // ══ MANU — Suporte ═════════════════════════════════════════════════
  'Atendimento 24/7': {
    specialtyTitle: 'Atendimento 24/7',
    preferredOutput: 'Resumo de tickets resolvidos/pendentes com taxa de resolução automática.',
  },
  'Histórico de Cliente': {
    specialtyTitle: 'Histórico de Cliente',
    essentialInputs: [
      { label: 'Identificação do cliente (nome ou e-mail)', reason: 'necessário para montar o dossiê — só pergunte se não for possível identificar pelo contexto da conversa' },
    ],
    preferredOutput: 'Dossiê consolidado (interações, compras, tickets) do cliente identificado.',
  },

  // ══ BRENO — Closer ═════════════════════════════════════════════════
  'Closer por Chat': {
    specialtyTitle: 'Closer por Chat',
    essentialInputs: [
      { label: 'Lead ou negociação específica a conduzir', reason: 'necessário se não houver negociação em aberto identificável no CRM' },
    ],
    preferredOutput: 'Roteiro de resposta a objeções + proposta estruturada para o lead identificado.',
  },
  'Contrato & Pagamento': {
    specialtyTitle: 'Contrato & Pagamento',
    essentialInputs: [
      { label: 'Dados do contrato (valor, condições)', reason: 'necessário se não houver negociação vinculada no CRM/Payments' },
    ],
    preferredOutput: 'Status da formalização (Etapa, Ação, Pendência) com link de assinatura/pagamento quando aplicável.',
  },

  // ══ RAÍSSA — Upsell & Reativação ═══════════════════════════════════
  'Reativação de Inativos': {
    specialtyTitle: 'Reativação de Inativos',
    preferredOutput: 'Lista de clientes inativos priorizados com oferta de reengajamento sugerida.',
  },
  'Upsell Inteligente': {
    specialtyTitle: 'Upsell Inteligente',
    preferredOutput: 'Ranking de clientes com maior potencial de upgrade/cross-sell e a oferta recomendada.',
  },

  // ══ TAINÁ — Nutrição ════════════════════════════════════════════════
  'Fluxos de Nutrição': {
    specialtyTitle: 'Fluxos de Nutrição',
    essentialInputs: [
      { label: 'Segmento ou estágio de funil alvo', reason: 'necessário se não estiver claro no pedido — define topo/meio/fundo de funil' },
    ],
    preferredOutput: 'Régua de e-mails por estágio (Estágio, Gatilho, Copy resumida, Objetivo).',
  },
  'Lead Scoring': {
    specialtyTitle: 'Lead Scoring',
    preferredOutput: 'Ranking de leads por pontuação com critérios que geraram o score.',
  },

  // ══ HEITOR / ULISSES — Gestão & Integrações ════════════════════════
  'Briefing de Reunião': {
    specialtyTitle: 'Briefing de Reunião',
    essentialInputs: [
      { label: 'Nome do lead/empresa da reunião', reason: 'necessário para montar o briefing — só pergunte se não for possível identificar pelo contexto' },
    ],
    preferredOutput: 'Briefing com histórico, dores mapeadas e pauta sugerida.',
  },
  'Gestor de Tarefas': {
    specialtyTitle: 'Gestor de Tarefas',
    preferredOutput: 'Quadro de tarefas priorizadas (Tarefa, Responsável, Prazo, Status).',
  },
};

/* ── Montagem do bloco de operação ─────────────────────────────────── */

export function buildOperationBlock({
  specialtyTitle,
  connected,
  disconnected,
}: OperationBlockParams): string {
  if (!specialtyTitle) return '';

  const spec = allSpecialties.find((s) => s.title === specialtyTitle);
  if (!spec) return '';

  const opSpec = OPERATION_SPECS[specialtyTitle];

  // Conectores primários: usa override explícito do spec, ou deriva
  // automaticamente de requiredConnectors (já curado por operação em
  // src/data/agents.ts) — evita duplicar a mesma lista em dois lugares.
  const primary =
    opSpec?.primaryConnectors ??
    (spec.requiredConnectors ?? []).map((key) => getConnectorDisplayName(key));
  const primaryConnected = primary.filter((name) => connected.includes(name));
  const primaryMissing = primary.filter((name) => !connected.includes(name));

  const connectorsLine =
    connected.length > 0
      ? connected.join(', ')
      : 'nenhum canal conectado — trabalhe com Base de Conhecimento + pesquisa de mercado e aponte a conexão que ampliaria a precisão';

  const primaryBlock =
    primary.length > 0
      ? `Conectores primários desta operação: ${primary.join(', ')}.
${primaryConnected.length > 0 ? `   • Disponíveis agora: ${primaryConnected.join(', ')} — extraia os dados deles antes de qualquer outra fonte.` : ''}
${primaryMissing.length > 0 ? `   • Não conectados: ${primaryMissing.join(', ')} — NÃO trave a operação; entregue com as fontes disponíveis e registre no resultado qual canal ampliaria a precisão.` : ''}`
      : '';

  const essentialsBlock =
    opSpec?.essentialInputs?.length
      ? `Dados indispensáveis desta operação (verifique nas fontes antes de perguntar):
${opSpec.essentialInputs.map((e) => `   • ${e.label} — ${e.reason}`).join('\n')}`
      : '';

  const webFocus = opSpec?.webResearchFocus
    ? `Foco da pesquisa de mercado nesta operação: ${opSpec.webResearchFocus}`
    : '';

  const outputHint = opSpec?.preferredOutput
    ? `Formato preferido do painel de resultado: ${opSpec.preferredOutput}`
    : '';

  return `OPERAÇÃO ATIVA: ${spec.title}
 
 OBJETIVO: ${spec.longDescription}
 ${spec.heroDescription ? `ENTREGA ESPERADA: ${spec.heroDescription}` : ''}
 ${outputHint}
 
 TAREFA 1: DIAGNÓSTICO DE CONECTORES (OBRIGATÓRIO E IMEDIATO)
 Antes de processar a solicitação ou gerar resultados, você deve identificar quais canais de integração listados abaixo são necessários para esta tarefa. Confirme o status de cada um e informe o usuário explicitamente:
 - Canais Requeridos para esta Operação: ${primary.length > 0 ? primary.join(', ') : 'Nenhum conector obrigatório.'}
 - Canais Conectados no Perfil do Usuário: ${connectorsLine}
 - Ação: Faça um relato rápido informando se os acessos e canais necessários estão disponíveis. Caso algum canal crítico esteja offline (desconectado), notifique o usuário e pergunte se ele deseja prosseguir em modo de simulação com dados da Base de Conhecimento.
 
 TAREFA 2: FORMULÁRIO DE FILTROS E PERGUNTAS-CHAVE (SE CONEXÃO OK)
 Se as conexões necessárias estiverem disponíveis (ou o usuário aceitar o modo de simulação), apresente de forma interativa um formulário com sugestões de filtros ou realize até 3 perguntas-chave para que o usuário refine os indicadores e o escopo da análise que ele busca.
 ${essentialsBlock ? `Sugestões e dados chave baseados na operação:\n${essentialsBlock}` : ''}

 PROTOCOLO DE FONTES (ordem obrigatória de consulta):
 1. CANAIS CONECTADOS (Integrações): ${connectorsLine}.
 ${primaryBlock}
 2. BASE DE CONHECIMENTO: relatórios dos Agentes e histórico já carregados neste contexto — trate como memória oficial da operação do usuário.
 3. PESQUISA DE MERCADO (web/redes sociais): use apenas para lacunas que os itens 1–2 não cobrem, SEMPRE rotulando como "benchmark de mercado" — nunca como dado próprio do usuário.
 ${webFocus}
 Dado real do usuário SEMPRE prevalece sobre benchmark. Nunca inverta a ordem.
 
 PROTOCOLO DE AUTONOMIA (mínima interação com o usuário):
 - NUNCA pergunte algo que você pode obter pelas fontes acima (perfil, canais conectados, Base de Conhecimento, benchmark).
 - Execute a operação de ponta a ponta já na primeira resposta sempre que as fontes disponíveis permitirem.
 - Canal desconectado não é bloqueio: entregue com o que existe e aponte objetivamente o que a conexão destravaria.
 
 GATE DE PERGUNTA ÚNICA (exceção controlada):
 - Pergunte SOMENTE quando um dado indispensável não existir em nenhuma fonte.
 - Consolide TODAS as pendências em UMA única mensagem: lista objetiva de no máximo 4 itens, cada um com o motivo em uma frase.
 - Recebidas as respostas, execute a operação completa sem novas perguntas.
 
 RASTREABILIDADE (inviolável):
 - Todo número do resultado tem origem identificável: nome do canal conectado, documento da Base de Conhecimento, ou "benchmark de mercado".
 - Preencha o campo "sources" do JSON de saída com todas as fontes efetivamente usadas (ex.: "GA4 (últimos 28 dias)", "Relatório 'Auditoria CAC' — Base de Conhecimento", "Benchmark de mercado — CPC médio do setor").`;
}
