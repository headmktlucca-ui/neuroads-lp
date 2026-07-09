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
  // ── Piloto (Paola / Tráfego) ──
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

  const primary = opSpec?.primaryConnectors ?? [];
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
${essentialsBlock}

GATE DE PERGUNTA ÚNICA (exceção controlada):
- Pergunte SOMENTE quando um dado indispensável não existir em nenhuma fonte.
- Consolide TODAS as pendências em UMA única mensagem: lista objetiva de no máximo 4 itens, cada um com o motivo em uma frase.
- Recebidas as respostas, execute a operação completa sem novas perguntas.

RASTREABILIDADE (inviolável):
- Todo número do resultado tem origem identificável: nome do canal conectado, documento da Base de Conhecimento, ou "benchmark de mercado".
- Preencha o campo "sources" do JSON de saída com todas as fontes efetivamente usadas (ex.: "GA4 (últimos 28 dias)", "Relatório 'Auditoria CAC' — Base de Conhecimento", "Benchmark de mercado — CPC médio do setor").`;
}
