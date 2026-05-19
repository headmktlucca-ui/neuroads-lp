import type { AgentExample } from '@/components/neuroads/SubmenuPageShell';
import { agents, type Agent } from './agents';

export type AgentStageKey = 'aquisicao' | 'conversao' | 'inteligencia-de-dados' | 'visao-geral';

export const NEUROADS_AGENT_COUNT = agents.length;

const STAGE_LABEL: Record<AgentStageKey, string> = {
  aquisicao: 'aquisição',
  conversao: 'conversão',
  'inteligencia-de-dados': 'inteligência de dados',
  'visao-geral': 'escala previsível',
};

const STAGE_AGENT_TITLES: Record<Exclude<AgentStageKey, 'visao-geral'>, string[]> = {
  aquisicao: [
    'Analista de Tráfego',
    'Auditor de Desperdício',
    'Otimizador de Orçamento',
    'Analisador de Público',
    'Gerador de Criativos',
    'Gerador de Copies de Conversão',
    'Público-Alvo Ideal',
    'Radar de Oportunidades',
  ],
  conversao: [
    'Gerador de Copies de Conversão',
    'Diagnóstico de Landing Page',
    'Diagnóstico de Funil',
    'Avaliador de Oferta',
    'Preditor de Funil',
    'Gerador de Testes A/B',
    'DNA da Marca',
    'SEO & GEO',
  ],
  'inteligencia-de-dados': [
    'Rastreador Cirúrgico',
    'Simulador de ROAS',
    'Preditor de Funil',
    'SEO & GEO',
    'Análise de Concorrentes',
    'Análise Viral',
    'Radar de Oportunidades',
    'Diagnóstico de Funil',
  ],
};

const CATEGORY_METRIC: Record<string, string> = {
  Performance: 'Foco: ROAS e CPL',
  Criativos: 'Foco: resposta criativa',
  Técnico: 'Foco: previsibilidade operacional',
  Inteligência: 'Foco: decisão orientada por dados',
};

const CATEGORY_RESULT: Record<string, string> = {
  Performance: 'eficiência de investimento e tração de demanda qualificada',
  Criativos: 'mensagens com maior aderência e aceleração de resposta do público',
  Técnico: 'governança de execução e menos gargalo operacional no funil',
  Inteligência: 'clareza estratégica para priorizar ações com impacto no caixa',
};

function resolveAgentsByStage(stage: AgentStageKey): Agent[] {
  if (stage === 'visao-geral') return agents;
  const orderedTitles = STAGE_AGENT_TITLES[stage];
  const agentMap = new Map(agents.map((agent) => [agent.title, agent]));
  return orderedTitles
    .map((title) => agentMap.get(title))
    .filter((agent): agent is Agent => Boolean(agent));
}

function buildAgentExample(agent: Agent, stage: AgentStageKey): AgentExample {
  const stageLabel = STAGE_LABEL[stage];
  const resultTheme = CATEGORY_RESULT[agent.category] || 'resultado financeiro com menor desperdício';

  return {
    name: agent.title,
    icon: agent.icon,
    trigger:
      stage === 'visao-geral'
        ? 'Quando a operação precisa conectar mídia, conteúdo e comercial sem decisões por achismo.'
        : `Quando a etapa de ${stageLabel} precisa escalar com mais consistência e menos desperdício.`,
    action: agent.description,
    result: `Gera ${resultTheme} na etapa de ${stageLabel}.`,
    metric: CATEGORY_METRIC[agent.category] || 'Foco: performance real',
  };
}

export function getAgentExamplesForStage(stage: AgentStageKey): AgentExample[] {
  return resolveAgentsByStage(stage).map((agent) => buildAgentExample(agent, stage));
}
