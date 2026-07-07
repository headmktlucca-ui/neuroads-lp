/**
 * agent-workspace-registry.ts
 *
 * Registry centralizado de Workspaces de agentes.
 *
 * ─── Como adicionar um novo agente com workspace funcional ───────────────────
 *
 *  1. Crie o componente em:
 *        src/components/agents/[NomeAgente]Workspace.tsx
 *
 *  2. Importe-o aqui:
 *        import NomeAgenteWorkspace from '../components/agents/NomeAgenteWorkspace';
 *
 *  3. Adicione UMA entrada neste mapa com o título exato do agente
 *     (igual ao campo `title` em `src/data/agents.ts`):
 *        'Nome do Agente': NomeAgenteWorkspace,
 *
 *  Pronto. A página `agente/[slug]/page.tsx` buscará o componente automaticamente.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { ComponentType } from 'react';

// ─── Imports de Workspaces ────────────────────────────────────────────────────

import SeoGeoWorkspace from '../components/agents/SeoGeoWorkspace';
import TrafficAnalystWorkspace from '../components/agents/TrafficAnalystWorkspace';
import RoasSimulatorWorkspace from '../components/agents/RoasSimulatorWorkspace';
import FunnelPredictorWorkspace from '../components/agents/FunnelPredictorWorkspace';
import WasteAuditorWorkspace from '../components/agents/WasteAuditorWorkspace';
import BudgetOptimizerWorkspace from '../components/agents/BudgetOptimizerWorkspace';
import CreativeGeneratorWorkspace from '../components/agents/CreativeGeneratorWorkspace';
import ConversionCopyWorkspace from '../components/agents/ConversionCopyWorkspace';
import CreativeAnalysisWorkspace from '../components/agents/CreativeAnalysisWorkspace';
import CarouselWorkspaceWrapper from '../components/agents/CarouselWorkspaceWrapper';
import VideoWorkspaceWrapper from '../components/agents/VideoWorkspaceWrapper';
import LandingPageDiagnosisWorkspace from '../components/agents/LandingPageDiagnosisWorkspace';
import DnaBrandWorkspace from '../components/agents/DnaBrandWorkspace';
import GenericWorkspaceWrapper from '../components/agents/GenericWorkspaceWrapper';


// ─── Tipagem das props que todos os workspaces recebem ────────────────────────

/**
 * Props padrão injetadas em todos os workspaces via registry.
 * Workspaces que precisam de props extras devem tipá-las internamente.
 */
export interface WorkspaceProps {
  userId?: string;
  agentSlug: string;
  agentTitle: string;
  agentCategory: string;
}

// ─── Registry ─────────────────────────────────────────────────────────────────

/**
 * Mapa de título de agente → componente Workspace.
 *
 * Os títulos devem ser idênticos ao campo `title` em `src/data/agents.ts`.
 * Agentes sem entrada no registry usarão o `GenericAgentWorkspace` como fallback.
 */
export const AGENT_WORKSPACE_REGISTRY: Record<string, ComponentType<WorkspaceProps>> = {
  // ── Performance ──────────────────────────────────────────────────────────
  'Analista de Tráfego':      TrafficAnalystWorkspace,
  'Simulador de ROAS':        RoasSimulatorWorkspace,
  'Auditor de Desperdício':   WasteAuditorWorkspace,
  'Otimizador de Orçamento':  BudgetOptimizerWorkspace,

  // ── Técnico ──────────────────────────────────────────────────────────────
  'Preditor de Funil':        FunnelPredictorWorkspace,

  // ── Criativos ─────────────────────────────────────────────────────────────────────
  'Gerador de Criativos':               CreativeGeneratorWorkspace,
  'Gerador de Copies de Conversão':     ConversionCopyWorkspace,
  'Análise Viral':                      CreativeAnalysisWorkspace,
  'Gerador de Carrossel':               CarouselWorkspaceWrapper,
  'Roteirista de Vídeo':                VideoWorkspaceWrapper,
  'Redator de Artigos':                 GenericWorkspaceWrapper,

  // ── Inteligência ────────────────────────────────────────────────────────────────
  'SEO & GEO':                    SeoGeoWorkspace,
  'DNA da Marca':                 DnaBrandWorkspace,
  'Diagnóstico de Landing Page':  LandingPageDiagnosisWorkspace,
};

/**
 * Retorna o componente Workspace correto para um dado título de agente.
 * Retorna `null` se nenhum workspace específico for encontrado (usa GenericAgentWorkspace como fallback na página).
 */
export function getWorkspaceForAgent(agentTitle: string): ComponentType<WorkspaceProps> | null {
  return AGENT_WORKSPACE_REGISTRY[agentTitle] ?? null;
}
