export type HubAutomationEventType = 'started' | 'completed' | 'delayed' | 'failed';
export type HubAutomationEventPriority = 'low' | 'medium' | 'high';
export type HubAutomationEventStatus = 'open' | 'acknowledged';
export type HubAutomationPriorityReason =
  | 'default_medium'
  | 'delayed_over_sla'
  | 'execution_failed'
  | 'financial_risk'
  | 'completed_on_time';

export type HubAutomationEvent = {
  eventType: HubAutomationEventType;
  executionKey: string;
  automationKey: string;
  agentTitle: string;
  agentCategory: string;
  scheduledAt: number | null;
  startedAt: number | null;
  completedAt: number | null;
  durationMs: number | null;
  impact: 'operational' | 'conversion' | 'revenue';
  priority: HubAutomationEventPriority;
  priorityReason: HubAutomationPriorityReason;
  status: HubAutomationEventStatus;
  message: string;
  createdAt: number;
  updatedAt: number;
};

export function buildAutomationExecutionKey(automationKey: string, scheduledAt: number | null): string {
  return `${automationKey}:${scheduledAt ?? 'na'}`;
}

export function buildAutomationStartedEvent(input: {
  automationKey: string;
  agentTitle: string;
  agentCategory: string;
  scheduledAt: number | null;
  startedAt: number;
}): HubAutomationEvent {
  return {
    eventType: 'started',
    executionKey: buildAutomationExecutionKey(input.automationKey, input.scheduledAt),
    automationKey: input.automationKey,
    agentTitle: input.agentTitle,
    agentCategory: input.agentCategory,
    scheduledAt: input.scheduledAt,
    startedAt: input.startedAt,
    completedAt: null,
    durationMs: null,
    impact: 'operational',
    priority: 'medium',
    priorityReason: 'default_medium',
    status: 'open',
    message: `A automação ${input.agentTitle} iniciou a execução programada.`,
    createdAt: input.startedAt,
    updatedAt: input.startedAt,
  };
}

export function buildAutomationCompletedEvent(input: {
  automationKey: string;
  agentTitle: string;
  agentCategory: string;
  scheduledAt: number | null;
  startedAt: number;
  completedAt: number;
}): HubAutomationEvent {
  return {
    eventType: 'completed',
    executionKey: buildAutomationExecutionKey(input.automationKey, input.scheduledAt),
    automationKey: input.automationKey,
    agentTitle: input.agentTitle,
    agentCategory: input.agentCategory,
    scheduledAt: input.scheduledAt,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
    durationMs: Math.max(input.completedAt - input.startedAt, 0),
    impact: 'operational',
    priority: 'low',
    priorityReason: 'completed_on_time',
    status: 'open',
    message: `A automação ${input.agentTitle} concluiu o ciclo programado com sucesso.`,
    createdAt: input.completedAt,
    updatedAt: input.completedAt,
  };
}
