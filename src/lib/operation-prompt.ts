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

export const OPERATION_SPECS: Record<string, OperationSpec> = {
  // ══ PAOLA — Tráfego Pago & Mídia ═══════════════════════════════════
  'Analista de Tráfego': {
    specialtyTitle: 'Analista de Tráfego',
    primaryConnectors: ['Google Ads API', 'Meta Ads API', 'GA4 Data API'],
    essentialInputs: [
      { label: 'Período de análise (ex: últimos 7, 14 ou 30 dias)', reason: 'necessário se não for indicado no pedido para delimitar o escopo da auditoria' },
    ],
    webResearchFocus: 'Benchmarks atuais de CTR, CPC e CPA por canal e formato no setor do usuário no Brasil.',
    preferredOutput: 'Tabela comparativa por canal (Canal, Investimento, CTR, CPA, ROAS) + diagnóstico detalhado de fadiga de criativo e lances.',
  },
  'Simulador de ROAS': {
    specialtyTitle: 'Simulador de ROAS',
    primaryConnectors: ['Google Ads API', 'Meta Ads API', 'GA4 Data API', 'CRM'],
    essentialInputs: [
      { label: 'Ticket médio do produto (R$)', reason: 'base essencial para o cálculo reverso de meta de faturamento para verba' },
      { label: 'Meta de faturamento do período (R$)', reason: 'define o objetivo financeiro da simulação' },
    ],
    webResearchFocus: 'CPC e CVR médios atuais do setor do usuário no Brasil para calibrar os cenários quando não houver histórico próprio.',
    preferredOutput: 'Tabela de cenários (conservador/realista/agressivo) com colunas: Investimento, Cliques, Leads, Vendas, Faturamento, ROAS.',
  },
  'Auditor de Desperdício': {
    specialtyTitle: 'Auditor de Desperdício',
    primaryConnectors: ['Google Ads API', 'Meta Ads API', 'GA4 Data API'],
    essentialInputs: [
      { label: 'CPA Alvo ou CPA máximo tolerado (R$)', reason: 'referência para isolar campanhas e segmentações que estão estourando o custo por aquisição' },
    ],
    webResearchFocus: 'Listas de termos de pesquisa irrelevantes e públicos com baixa conversão recorrentes no nicho do usuário.',
    preferredOutput: 'Tabela de desperdícios identificados (Origem, Motivo do Desperdício, Valor estimado drenado, Ação recomendada).',
  },
  'Otimizador de Orçamento': {
    specialtyTitle: 'Otimizador de Orçamento',
    primaryConnectors: ['Google Ads API', 'Meta Ads API', 'GA4 Data API'],
    essentialInputs: [
      { label: 'Meta de ROAS ou CPA alvo', reason: 'referência para decidir a realocação de verba entre campanhas CBO/ABO' },
    ],
    webResearchFocus: 'Tendências de busca e picos de demanda no segmento do usuário nas últimas 48 horas.',
    preferredOutput: 'Plano de realocação tática (Campanha/Canal, Verba Atual, Verba Sugerida, Ganho Estimado, Justificativa).',
  },
  'Gerador de Criativos': {
    specialtyTitle: 'Gerador de Criativos',
    primaryConnectors: ['Meta Ads API', 'Google Ads API', 'GA4 Data API'],
    essentialInputs: [
      { label: 'Principal ângulo ou dor a explorar no criativo', reason: 'direciona a criação dos ganchos e conceitos visuais — só pergunte se não constar na Base' },
    ],
    webResearchFocus: 'Anúncios e formatos visuais com maior taxa de engajamento na biblioteca de anúncios (Meta Ad Library) dos concorrentes.',
    preferredOutput: 'Ranking de briefs de criativos priorizados por potencial de conversão (Ângulo, Gancho Visual, Texto da Peça, CTA, Hipótese).',
  },
  'Gerador de Copies de Conversão': {
    specialtyTitle: 'Gerador de Copies de Conversão',
    primaryConnectors: ['GA4 Data API', 'CRM'],
    essentialInputs: [
      { label: 'Principal objeção ou dúvida do cliente final', reason: 'necessário para orientar a quebra de objeção nas variações de copy' },
    ],
    webResearchFocus: 'Gatilhos mentais, promessas e estruturas de copy direto-resposta utilizadas pelos líderes do nicho do usuário.',
    preferredOutput: 'Lista de variações de copy (Headline, Hook, Corpo, CTA) agrupadas pelo framework (AIDA/PAS) e objeção que quebram.',
  },
  'Análise Viral': {
    specialtyTitle: 'Análise Viral',
    primaryConnectors: ['Meta Ads API', 'GA4 Data API'],
    webResearchFocus: 'Hooks, formatos, áudios e narrativas em alta nas redes sociais (Instagram Reels, TikTok, YouTube Shorts) no nicho do usuário nas últimas 24-72h.',
    preferredOutput: 'Ranking de tendências virais com variação de aplicação direta para a marca do usuário (Formato, Hook, Narrativa, Adaptação).',
  },
  'Radar de Oportunidades': {
    specialtyTitle: 'Radar de Oportunidades',
    primaryConnectors: ['Google Ads API', 'Meta Ads API', 'GA4 Data API'],
    webResearchFocus: 'Canais de aquisição emergentes ou subaproveitados no setor do usuário (ex: Pinterest Ads, TikTok, Native Ads, Influenciadores) com CPM favorável.',
    preferredOutput: 'Ranking de canais de oportunidade por potencial de ROI (Canal, Motivo da Oportunidade, Custo Estimado de Entrada, Nível de Risco).',
  },

  // ══ IGOR — Dados & SEO/GEO ═════════════════════════════════════════
  'SEO & GEO': {
    specialtyTitle: 'SEO & GEO',
    primaryConnectors: ['Google Search Console', 'GA4 Data API'],
    webResearchFocus: 'Posição orgânica atual e presença em respostas de buscadores generativos (ChatGPT, Gemini, Claude, Perplexity) para os termos do nicho do usuário.',
    preferredOutput: 'Audit SEO & GEO completo (Score Geral, Posições Foco no Google, Citações em IAs, Plano de Ação Priorizado).',
  },
  'Análise de Concorrentes': {
    specialtyTitle: 'Análise de Concorrentes',
    primaryConnectors: ['Google Search Console', 'GA4 Data API'],
    essentialInputs: [
      { label: 'Nome ou domínio dos concorrentes diretos (até 3)', reason: 'necessário se não houver concorrentes já mapeados no perfil nem na Base de Conhecimento' },
    ],
    webResearchFocus: 'Biblioteca de anúncios ativos, palavras-chave orgânicas rankeadas e movimentações recentes de oferta dos concorrentes indicados.',
    preferredOutput: 'Tabela comparativa de inteligência competitiva (Concorrente, Estratégia Observada, Ponto Forte, Vulnerabilidade, Oportunidade para o Usuário).',
  },
  'Público-Alvo Ideal': {
    specialtyTitle: 'Público-Alvo Ideal',
    primaryConnectors: ['GA4 Data API', 'CRM'],
    webResearchFocus: 'Padrões de comportamento, dúvidas em fóruns e comunidades (Reddit, Quora, redes) e interesses do público comprador no nicho do usuário.',
    preferredOutput: 'Dossiê do Avatar ICP (Demografia, Dores Principais, Desejos Subconscientes, Gatilhos de Compra, Clusters de Interesses).',
  },
  'Avaliador de Oferta': {
    specialtyTitle: 'Avaliador de Oferta',
    primaryConnectors: ['GA4 Data API', 'CRM'],
    essentialInputs: [
      { label: 'Preço, bônus e garantia da oferta atual', reason: 'necessário para o cálculo do score de atratividade — verifique primeiro na Base/DNA da Marca' },
    ],
    webResearchFocus: 'Benchmark de ofertas equivalentes praticadas no mercado do usuário (preço, bônus oferecidos, prazos de garantia).',
    preferredOutput: 'Score de Atratividade da Oferta (0-100) com detalhamento por critério (Ancoragem, Bônus, Garantia, Percepção de Valor) + Recomendações.',
  },

  // ══ LAÍS — Conteúdo & Criativos ═════════════════════════════════════
  'Agente Editorial': {
    specialtyTitle: 'Agente Editorial',
    primaryConnectors: ['GA4 Data API', 'Google Search Console'],
    essentialInputs: [
      { label: 'Tema ou pauta principal do conteúdo', reason: 'define o escopo da redação — pergunte só se não houver pauta no pedido ou na Base' },
    ],
    webResearchFocus: 'Pautas em alta e pesquisas frequentes no Google e redes no nicho do usuário para criação de títulos com alto tráfego.',
    preferredOutput: 'Estrutura de artigo com Título SEO, Meta Description, H2/H3, Briefing de Imagem (prompt DALL-E/Midjourney) e Cronograma de Publicação.',
  },
  'Gerador de Carrossel': {
    specialtyTitle: 'Gerador de Carrossel',
    primaryConnectors: ['Meta Ads API', 'GA4 Data API'],
    essentialInputs: [
      { label: 'Tema, produto ou oferta a destacar no carrossel', reason: 'necessário para estruturar o fluxo narrativo dos slides — pergunte só se não estiver claro' },
    ],
    webResearchFocus: 'Formatos de carrossel de maior engajamento e salvamento no Instagram e LinkedIn no setor do usuário.',
    preferredOutput: 'Sequência detalhada de slides (Slide #, Headline, Copy do Slide, Direção Visual para Designer, Etapa AIDA).',
  },
  'Roteirista de Vídeo': {
    specialtyTitle: 'Roteirista de Vídeo',
    primaryConnectors: ['Meta Ads API', 'GA4 Data API'],
    essentialInputs: [
      { label: 'Produto/oferta e duração alvo do vídeo (ex: 15s, 30s ou 60s)', reason: 'necessário para calibrar o ritmo da locução — pergunte só se não indicado' },
    ],
    webResearchFocus: 'Ganchos visuais e narrativas de anúncios em vídeo com retenção >50% nos primeiros 3 segundos no nicho.',
    preferredOutput: 'Roteiro cena a cena (Tempo em Segundos, Tipo Narrativo, Descrição Visual, Locução/Texto na Tela, CTA).',
  },
  'Redator de Artigos': {
    specialtyTitle: 'Redator de Artigos',
    primaryConnectors: ['GA4 Data API', 'CRM'],
    essentialInputs: [
      { label: 'Tema do artigo, newsletter ou e-mail', reason: 'necessário para redigir o texto — só pergunte se não estiver claro no pedido' },
    ],
    webResearchFocus: 'Artigos e fontes de alta autoridade na web para citar dados e fortalecer a credibilidade do texto.',
    preferredOutput: 'Peça completa redigida (Título SEO, Meta Description, Corpo Otimizado com H2/H3, Briefing de Imagem, Call-to-Action).',
  },
  'DNA da Marca': {
    specialtyTitle: 'DNA da Marca',
    primaryConnectors: ['CRM', 'GA4 Data API'],
    webResearchFocus: 'Posicionamento, proposta de valor e tom de voz de referências e concorrentes no mercado do usuário.',
    preferredOutput: 'Manual DNA da Marca (Arquétipo da Marca, Tom de Voz, Paleta de Cores Recomendada, Diferenciais Competitivos, Provas de Valor).',
  },

  // ══ HEITOR — Processos, Funil & Tracking ═══════════════════════════
  'Rastreador Cirúrgico': {
    specialtyTitle: 'Rastreador Cirúrgico',
    primaryConnectors: ['GA4 Data API', 'Server Tracking', 'Warehouse'],
    webResearchFocus: 'Documentação técnica atualizada de Meta Conversions API (CAPI), Google Consent Mode V2 e GA4 Server-Side.',
    preferredOutput: 'Checklist técnico de implementação (Etapa de Rastreamento, Ação Requerida, Status, Risco de Perda de Atribuição).',
  },
  'Preditor de Funil': {
    specialtyTitle: 'Preditor de Funil',
    primaryConnectors: ['Google Ads API', 'Meta Ads API', 'GA4 Data API', 'CRM', 'Payments'],
    essentialInputs: [
      { label: 'Ticket médio do produto/serviço (R$)', reason: 'base da projeção financeira de conversão por etapa do funil' },
      { label: 'Meta de vendas ou investimento disponível', reason: 'define o alvo da simulação de tráfego' },
    ],
    webResearchFocus: 'Taxas de conversão médias por etapa do funil (clique -> lead -> MQL -> venda) no segmento do usuário.',
    preferredOutput: 'Tabela de projeção por nível de investimento (Investimento, Cliques, Leads, MQL, SQL, Vendas, Faturamento Projetado, ROI).',
  },
  'Diagnóstico de Landing Page': {
    specialtyTitle: 'Diagnóstico de Landing Page',
    primaryConnectors: ['GA4 Data API', 'Google Ads API', 'Meta Ads API', 'CRM'],
    essentialInputs: [
      { label: 'URL da landing page para análise', reason: 'necessária para a auditoria — verifique primeiro no site do perfil ou na Base' },
    ],
    webResearchFocus: 'Análise de tempo de carregamento, legibilidade mobile, clareza da proposta de valor e fricção de formulários.',
    preferredOutput: 'Score de Conversão da LP + Lista de gargalos priorizados (Elemento, Diagnóstico de Fricção, Impacto na Conversão, Ação Corretiva).',
  },
  'Diagnóstico de Funil': {
    specialtyTitle: 'Diagnóstico de Funil',
    primaryConnectors: ['GA4 Data API', 'Server Tracking', 'Warehouse'],
    webResearchFocus: 'Benchmarks de taxa de abandono de carrinho e queda de formulário por etapa comercial no e-commerce/SaaS B2B.',
    preferredOutput: 'Mapa visual de etapas do funil com Taxa de Queda (Drop-off Rate), Etapa Crítica de Gargalo e Custo de Oportunidade.',
  },
  'Gerador de Testes A/B': {
    specialtyTitle: 'Gerador de Testes A/B',
    primaryConnectors: ['Google Ads API', 'Meta Ads API', 'GA4 Data API'],
    essentialInputs: [
      { label: 'Elemento a testar (Headline, Criativo, CTA ou Preço)', reason: 'define a variável única do protocolo — pergunte só se não indicado' },
    ],
    webResearchFocus: 'Hipóteses de testes A/B com maior taxa histórica de vitória em campanhas do setor.',
    preferredOutput: 'Protocolo de Teste A/B estatisticamente válido (Variável Única, Hipótese, Variação A, Variação B, Tamanho de Amostra, Métrica de Parada).',
  },

  // ══ VITOR — SDR & Prospecção ═══════════════════════════════════════
  'Prospector Outbound': {
    specialtyTitle: 'Prospector Outbound',
    primaryConnectors: ['CRM', 'GA4 Data API'],
    essentialInputs: [
      { label: 'Perfil de cliente ideal (cargo do decisor, setor, porte)', reason: 'necessário se não houver ICP definido no CRM ou na Base de Conhecimento' },
    ],
    webResearchFocus: 'Mapeamento de empresas no perfil ideal no LinkedIn, Google e diretórios do setor do usuário.',
    preferredOutput: 'Lista de prospects priorizados + Cadência de abordagem Cold Mail (Dia, Canal, Assunto, Copy Personalizada).',
  },
  'Qualificador de ICP': {
    specialtyTitle: 'Qualificador de ICP',
    primaryConnectors: ['CRM', 'GA4 Data API'],
    webResearchFocus: 'Critérios BANT/GPCT mais aplicados no segmento B2B para valoração de potencial de fechamento.',
    preferredOutput: 'Ranking de qualificação de leads (Lead, Cargo, Empresa, Score BANT, Status de Prontidão Comercial, Recomendação).',
  },

  // ══ MANU — Suporte & Sucesso do Cliente ═════════════════════════════
  'Atendimento 24/7': {
    specialtyTitle: 'Atendimento 24/7',
    primaryConnectors: ['CRM'],
    webResearchFocus: 'Perguntas frequentes e dúvidas de suporte mais comuns em produtos/serviços semelhantes no mercado.',
    preferredOutput: 'Matriz de suporte (Dúvida Recorrente, Resposta Padrão Recomendada, Status de Resolução Autônoma).',
  },
  'Histórico de Cliente': {
    specialtyTitle: 'Histórico de Cliente',
    primaryConnectors: ['CRM'],
    essentialInputs: [
      { label: 'Nome ou e-mail do cliente para consulta', reason: 'necessário para localizar o registro no CRM/Base de Conhecimento' },
    ],
    webResearchFocus: 'Histórico de interações e reputação da empresa do cliente em canais públicos.',
    preferredOutput: 'Dossiê 360° do Cliente (Dados da Conta, Compras Anteriores, Tickets Resolvidos, LTV Atual, Nível de Risco de Churn).',
  },

  // ══ BRENO — Closer de Vendas ═══════════════════════════════════════
  'Closer por Chat': {
    specialtyTitle: 'Closer por Chat',
    primaryConnectors: ['CRM', 'Payments'],
    essentialInputs: [
      { label: 'Objeção ou dúvida apresentada pelo cliente no momento', reason: 'necessário para estruturar o script de fechamento e contorno de objeção' },
    ],
    webResearchFocus: 'Argumentos de fechamento comercial e contorno de objeções de preço/concorrência no nicho.',
    preferredOutput: 'Script de Fechamento por Chat (Objeção Identificada, Argumento de Valor, Resposta em Mensagem, Proposta de Fechamento).',
  },
  'Contrato & Pagamento': {
    specialtyTitle: 'Contrato & Pagamento',
    primaryConnectors: ['CRM', 'Payments'],
    essentialInputs: [
      { label: 'Valor e condições comerciais da proposta', reason: 'necessário para a formalização — verifique no CRM antes de perguntar' },
    ],
    webResearchFocus: 'Padrões de cláusulas e formas de pagamento mais aceitas no mercado para o produto/serviço.',
    preferredOutput: 'Resumo da Formalização Comercial (Cliente, Valor Total, Condições de Pagamento, Status do Contrato, Ação Pendente).',
  },

  // ══ RAÍSSA — Upsell & Reativação ═══════════════════════════════════
  'Reativação de Inativos': {
    specialtyTitle: 'Reativação de Inativos',
    primaryConnectors: ['CRM'],
    essentialInputs: [
      { label: 'Tempo de inatividade considerado (ex: 30, 60 ou 90 dias)', reason: 'define a régua de corte da base inativa — pergunte só se não houver padrão na Base' },
    ],
    webResearchFocus: 'Ofertas de resgate e ganchos de retorno com maior taxa de conversão em clientes inativos.',
    preferredOutput: 'Plano de Reativação de Base (Segmento de Inativos, Oferta de Gancho, Script de Contato, Estimativa de Receita Recuperada).',
  },
  'Upsell Inteligente': {
    specialtyTitle: 'Upsell Inteligente',
    primaryConnectors: ['CRM', 'Payments'],
    webResearchFocus: 'Combinações de produtos (cross-sell) e upgrades de planos com maior sinergia comercial no nicho.',
    preferredOutput: 'Matriz de Propensão a Upsell (Cliente/Segmento, Plano Atual, Produto Recomendado para Upgrade, Gatilho de Abordagem).',
  },

  // ══ TAINÁ — Nutrição & Lead Scoring ════════════════════════════════
  'Fluxos de Nutrição': {
    specialtyTitle: 'Fluxos de Nutrição',
    primaryConnectors: ['CRM', 'GA4 Data API'],
    essentialInputs: [
      { label: 'Objetivo do fluxo de nutrição (ex: Boas-vindas, Abandono, Aquecimento)', reason: 'necessário para calibrar a régua — pergunte só se não indicado' },
    ],
    webResearchFocus: 'Sequências de e-mail e réguas de nutrição com maiores taxas de abertura e clique no setor.',
    preferredOutput: 'Régua de Nutrição detalhada (E-mail #, Dia de Disparo, Assunto Persuasivo, Gatilho Comportamental, Copy Resumida, CTA).',
  },
  'Lead Scoring': {
    specialtyTitle: 'Lead Scoring',
    primaryConnectors: ['CRM', 'GA4 Data API'],
    webResearchFocus: 'Ações de navegação e engajamento com maior correlação com a decisão de compra no setor B2B/B2C.',
    preferredOutput: 'Tabela de Regras de Lead Scoring (Ação do Lead, Pontuação Atribuída, Estágio do Funil, Gatilho de Envio para Vendas).',
  },

  // ══ ULISSES / HEITOR — Gestão & Briefings ══════════════════════════
  'Briefing de Reunião': {
    specialtyTitle: 'Briefing de Reunião',
    primaryConnectors: ['CRM'],
    essentialInputs: [
      { label: 'Nome da empresa ou do prospect da reunião', reason: 'necessário para compilar o histórico — pergunte só se não identificado no contexto' },
    ],
    webResearchFocus: 'Mapeamento completo da empresa, movimentações recentes e cargos dos executivos no Google e LinkedIn.',
    preferredOutput: 'Briefing Pré-Reunião (Perfil da Empresa, Decisores, Dores Identificadas, Pauta Recomendada, Objeções Prováveis e Respostas).',
  },
  'Gestor de Tarefas': {
    specialtyTitle: 'Gestor de Tarefas',
    primaryConnectors: ['CRM'],
    webResearchFocus: 'Boas práticas de gestão de entregáveis e priorização por matriz de impacto vs esforço.',
    preferredOutput: 'Quadro Kanban de Tarefas (Tarefa, Agente Responsável, Prioridade, Prazo Limite, Status).',
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
  // automaticamente de requiredConnectors
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
      ? `Dados indispensáveis desta operação (verifique nas fontes antes de perguntar ao usuário):
${opSpec.essentialInputs.map((e) => `   • ${e.label} — ${e.reason}`).join('\n')}`
      : '';

  const webFocus = opSpec?.webResearchFocus
    ? `Foco da pesquisa de mercado nesta operação: ${opSpec.webResearchFocus}`
    : '';

  const outputHint = opSpec?.preferredOutput
    ? `Formato preferido do painel de resultado (leftPanelData JSON): ${opSpec.preferredOutput}`
    : '';

  return `OPERAÇÃO ATIVA: ${spec.title}
 
 OBJETIVO: ${spec.longDescription}
 ${spec.heroDescription ? `ENTREGA ESPERADA: ${spec.heroDescription}` : ''}
 ${outputHint}
 
 TAREFA 1: DIAGNÓSTICO DE CONECTORES (OBRIGATÓRIO E IMEDIATO)
 Antes de processar a solicitação ou gerar resultados, você deve identificar quais canais de integração listados abaixo são necessários para esta tarefa. Confirme o status de cada um e informe o usuário explicitamente:
 - Canais Requeridos para esta Operação: ${primary.length > 0 ? primary.join(', ') : 'Nenhum conector obrigatório.'}
 - Canais Conectados no Perfil do Usuário: ${connectorsLine}
 - Ação: Faça um relato rápido informando se os acessos e canais necessários estão disponíveis. Caso algum canal crítico esteja offline (desconectado), notifique o usuário e pergunte se ele deseja prosseguir em modo de simulação com dados da Base de Conhecimento + benchmarks de mercado.
 
 TAREFA 2: FORMULÁRIO DE FILTROS E PERGUNTAS-CHAVE (SE CONEXÃO OK OU EM SIMULAÇÃO)
 Se as conexões necessárias estiverem disponíveis (ou o usuário aceitar o modo de simulação), apresente de forma interativa um formulário com sugestões de filtros ou realize perguntas-chave para que o usuário refine os indicadores e o escopo da análise.
 ${essentialsBlock ? `Sugestões e dados chave baseados na operação:\n${essentialsBlock}` : ''}

 METODOLOGIA DE RESPOSTA OBRIGATÓRIA (ESTRUTURA EM 10 ETAPAS):
 Toda análise ou entregável gerado nesta operação deve incorporar rigorosamente a seguinte estrutura conceitual:
 1. CONTEXTO: Resumo do objetivo, perfil do usuário e site cadastrado analisado.
 2. DADOS UTILIZADOS: Lista das fontes consultadas (Conectores, Base de Conhecimento, Site e Web Search).
 3. DIAGNÓSTICO: Leitura fria da situação atual e identificação do gargalo dominante.
 4. HIPÓTESES: Causas prováveis das anomalias ou oportunidades mapeadas.
 5. EVIDÊNCIAS: Fatos e dados numéricos com fonte que comprovam cada hipótese.
 6. OPORTUNIDADES: Destaque de 💡 Oportunidades, ⚠️ Riscos Iminentes e 🔁 Padrões Detectados.
 7. PRIORIZAÇÃO: Ranqueamento por impacto × esforço ou frameworks RICE / ICE.
 8. PLANO DE AÇÃO: Passos operacionais executáveis (Quem, O quê, Como e Quando).
 9. PRÓXIMOS PASSOS: Ações imediatas recomendadas para o usuário (preenchendo exatamente 4 nextSteps).
 10. INDICADORES DE SUCESSO: KPIs e metas com prazo de validação (ex: 7 ou 14 dias).

 FRAMEWORKS APLICÁVEIS:
 Aplique autonomamente os frameworks de mercado mais pertinentes a esta operação:
 - Estratégia/Posicionamento: JTBD, Blue Ocean Strategy, SWOT, Porter (5 Forças), StoryBrand, Customer Journey Mapping.
 - Vendas/Prospecção: BANT, MEDDICC, SPIN Selling, ICP Canvas.
 - Copywriting/Conversão: AIDA, PAS, BAB, PASTOR.
 - Priorização/Métricas: RICE, ICE, AARRR, Growth Loops, Flywheel, Lean Analytics, North Star Metric, OKRs, Cohort Analysis, CAC, LTV, ROI, ROAS.

 PROTOCOLO DE FONTES (ordem obrigatória de consulta):
 1. CANAIS CONECTADOS (Integrações): ${connectorsLine}.
 ${primaryBlock}
 2. BASE DE CONHECIMENTO: relatórios dos Agentes, DNA da Marca e histórico já carregados neste contexto — trate como memória oficial da operação do usuário.
 3. PESQUISA DE MERCADO (web/redes sociais/site do usuário): utilize o site cadastrado pelo usuário e pesquisas profundas na internet para complementar lacunas com "benchmarks de mercado".
 ${webFocus}
 Dado real do usuário SEMPRE prevalece sobre benchmark. Nunca inverta a ordem.
 
 PROTOCOLO DE AUTONOMIA (mínima interação com o usuário):
 - NUNCA pergunte algo que você pode obter pelas fontes acima (perfil, site cadastrado, canais conectados, Base de Conhecimento, benchmark).
 - Execute a operação de ponta a ponta já na primeira resposta sempre que as fontes disponíveis permitirem.
 - Canal desconectado não é bloqueio: entregue com o que existe e aponte objetivamente o que a conexão destravaria.
 
 GATE DE PERGUNTA ÚNICA (exceção controlada):
 - Pergunte SOMENTE quando um dado indispensável não existir em nenhuma fonte.
 - Consolide TODAS as pendências em UMA única mensagem: lista objetiva de no máximo 4 itens, cada um com o motivo em uma frase.
 - Recebidas as respostas, execute a operação completa sem novas perguntas.
 
 RASTREABILIDADE E ESTRUTURA DO PAINEL ESQUERDO (inviolável):
 - Todo número do resultado tem origem identificável: nome do canal conectado, documento da Base de Conhecimento, ou "benchmark de mercado".
 - Preencha o campo "sources" do JSON de saída com todas as fontes efetivamente usadas (ex.: "GA4 (últimos 28 dias)", "Relatório 'DNA da Marca' — Base de Conhecimento", "Benchmark de mercado — CPC médio do setor").`;
}
