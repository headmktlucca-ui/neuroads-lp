export type ChannelMetric = {
  platform: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
};

export type ExtractedMetrics = {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  channels: ChannelMetric[];
};

export type CompanyContextProfile = {
  companyName: string;
  segment: string;
  subsegment: string;
  businessModel: string;
  products: string[];
  services: string[];
  region: string;
  targetAudience: string;
  objectives: string[];
  mainOffer: string;
  differentiators: string[];
  objections: string[];
  funnelModel: string;
  acquisitionPlatforms: string[];
  averageTicket: number;
  icp: string;
};

export type BrandDnaSnapshot = {
  isLoaded: boolean;
  generatedAt: string | null;
  mission: string;
  positioning: string;
  personalityTraits: string[];
  archetypes: string[];
  visualDirection: string[];
  communicationTone: string[];
  languagePatterns: string[];
};

export type ContextSources = {
  websiteUrl: string;
  landingPageUrl: string;
  blogUrl: string;
  social: {
    instagram: string;
    facebook: string;
    linkedin: string;
    tiktok: string;
    youtube: string;
    x: string;
    pinterest: string;
  };
};

export type ContextEngineOutput = {
  profile: CompanyContextProfile;
  sources: ContextSources;
  dataCoverageScore: number;
  missingSignals: string[];
  narrativeSummary: string;
};

export type BrandIntelligenceOutput = {
  coherenceScore: number;
  visualConsistencyRules: string[];
  narrativeConsistencyRules: string[];
  misalignmentRisks: string[];
};

export type StrategyEngineOutput = {
  primaryGoal: string;
  trafficIntent: string;
  funnelStage: string;
  dominantEmotion: string;
  psychologicalTriggers: string[];
  narrativeArc: string;
  campaignArchitecture: string[];
};

export type CreativeAssetPlan = {
  channel: string;
  format: string;
  conceptName: string;
  conceptDescription: string;
  visualDirection: string;
  hook: string;
  cta: string;
};

export type CreativeEngineOutput = {
  assetPlan: CreativeAssetPlan[];
  productionCadence: string[];
};

export type CopyEngineOutput = {
  headlines: string[];
  primaryTexts: string[];
  ctas: string[];
};

export type PerformanceEngineOutput = {
  currentCtr: number;
  currentCpl: number;
  currentConversionRate: number;
  predictedCtr: number;
  predictedCpl: number;
  predictedConversionRate: number;
  fatigueRisk: 'low' | 'medium' | 'high';
  conversionProbabilityScore: number;
  recommendations: string[];
};

export type LearningEngineOutput = {
  learnings: string[];
  dnaUpdateSuggestions: string[];
  nextIterationPriorities: string[];
};

export type CreativeGeneratorOperatingPlan = {
  context: ContextEngineOutput;
  brandIntelligence: BrandIntelligenceOutput;
  strategy: StrategyEngineOutput;
  creative: CreativeEngineOutput;
  copy: CopyEngineOutput;
  performance: PerformanceEngineOutput;
  learning: LearningEngineOutput;
};

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return 0;
  const parsed = Number(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function readRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function tokenize(value: string): string[] {
  return value
    .split(/[\n,;|]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizePlatformName(value: string): string {
  const normalized = value.toLowerCase();
  if (normalized.includes('google')) return 'Google Ads';
  if (normalized.includes('meta') || normalized.includes('facebook') || normalized.includes('instagram')) return 'Meta Ads';
  if (normalized.includes('linkedin')) return 'LinkedIn Ads';
  if (normalized.includes('youtube')) return 'YouTube';
  if (normalized.includes('tiktok')) return 'TikTok';
  return value;
}

export function deriveCompanyContextProfile(profile: unknown, overrides: Partial<CompanyContextProfile>): CompanyContextProfile {
  const root = readRecord(profile);
  const onboarding = readRecord(root.onboarding);
  const details = readRecord(root.profileDetails);

  const companyName =
    readString(overrides.companyName) ||
    readString(root.companyName) ||
    readString(root.company) ||
    readString(onboarding.companyName) ||
    readString(details.companyName) ||
    'Empresa não cadastrada';

  const segment =
    readString(overrides.segment) ||
    readString(root.segment) ||
    readString(root.segmento) ||
    readString(onboarding.segment) ||
    readString(onboarding.segmento) ||
    readString(details.segment) ||
    'Segmento não informado';

  const subsegment =
    readString(overrides.subsegment) ||
    readString(root.subsegment) ||
    readString(root.subsegmento) ||
    readString(onboarding.subsegment) ||
    readString(onboarding.subsegmento) ||
    readString(details.subsegment) ||
    'Subsegmento não informado';

  const businessModel =
    readString(overrides.businessModel) ||
    readString(root.businessModel) ||
    readString(root.modeloNegocio) ||
    readString(onboarding.businessModel) ||
    readString(onboarding.modeloNegocio) ||
    'Modelo de negócio não informado';

  const products = overrides.products?.length
    ? overrides.products
    : tokenize(readString(root.products) || readString(root.produtos) || readString(onboarding.products) || readString(onboarding.produtos));

  const services = overrides.services?.length
    ? overrides.services
    : tokenize(readString(root.services) || readString(root.servicos) || readString(onboarding.services) || readString(onboarding.servicos));

  const region =
    readString(overrides.region) ||
    readString(root.region) ||
    readString(root.regiao) ||
    readString(onboarding.region) ||
    readString(onboarding.regiao) ||
    'Região não informada';

  const targetAudience =
    readString(overrides.targetAudience) ||
    readString(root.targetAudience) ||
    readString(root.publicoAlvo) ||
    readString(onboarding.targetAudience) ||
    readString(onboarding.publicoAlvo) ||
    'Público-alvo não informado';

  const objectives = overrides.objectives?.length
    ? overrides.objectives
    : tokenize(
        readString(root.objectives) ||
          readString(root.objetivos) ||
          readString(onboarding.objectives) ||
          readString(onboarding.objetivos)
      );

  const mainOffer =
    readString(overrides.mainOffer) ||
    readString(root.mainOffer) ||
    readString(root.ofertaPrincipal) ||
    readString(onboarding.mainOffer) ||
    readString(onboarding.ofertaPrincipal) ||
    'Oferta principal não informada';

  const differentiators = overrides.differentiators?.length
    ? overrides.differentiators
    : tokenize(
        readString(root.differentiators) ||
          readString(root.diferenciais) ||
          readString(onboarding.differentiators) ||
          readString(onboarding.diferenciais)
      );

  const objections = overrides.objections?.length
    ? overrides.objections
    : tokenize(
        readString(root.objections) ||
          readString(root.objecoes) ||
          readString(onboarding.objections) ||
          readString(onboarding.objecoes)
      );

  const funnelModel =
    readString(overrides.funnelModel) ||
    readString(root.funnelModel) ||
    readString(root.funil) ||
    readString(onboarding.funnelModel) ||
    readString(onboarding.funil) ||
    'Funil não informado';

  const acquisitionPlatforms = overrides.acquisitionPlatforms?.length
    ? overrides.acquisitionPlatforms.map(normalizePlatformName)
    : tokenize(
        readString(root.acquisitionPlatforms) ||
          readString(root.plataformasAquisicao) ||
          readString(onboarding.acquisitionPlatforms) ||
          readString(onboarding.plataformasAquisicao)
      ).map(normalizePlatformName);

  const averageTicket = readNumber(overrides.averageTicket) || readNumber(root.averageTicket) || readNumber(root.ticketMedio) || readNumber(onboarding.averageTicket) || readNumber(onboarding.ticketMedio);

  const icp =
    readString(overrides.icp) ||
    readString(root.icp) ||
    readString(onboarding.icp) ||
    readString(details.icp) ||
    'ICP não informado';

  return {
    companyName,
    segment,
    subsegment,
    businessModel,
    products,
    services,
    region,
    targetAudience,
    objectives,
    mainOffer,
    differentiators,
    objections,
    funnelModel,
    acquisitionPlatforms,
    averageTicket,
    icp,
  };
}

export function deriveContextEngineOutput(profile: CompanyContextProfile, sources: ContextSources): ContextEngineOutput {
  const missingSignals: string[] = [];

  if (!profile.objectives.length) missingSignals.push('Objetivos comerciais não estruturados.');
  if (!profile.mainOffer || profile.mainOffer.includes('não informada')) missingSignals.push('Oferta principal não definida.');
  if (!profile.differentiators.length) missingSignals.push('Diferenciais competitivos ausentes.');
  if (!profile.objections.length) missingSignals.push('Objeções de compra não mapeadas.');
  if (!sources.websiteUrl) missingSignals.push('Website principal não informado.');

  const socialLinks = Object.values(sources.social).filter(Boolean).length;
  const sourceCoverage = clamp((socialLinks / 7) * 100, 0, 100);

  const contextFields = [
    profile.segment,
    profile.subsegment,
    profile.targetAudience,
    profile.mainOffer,
    profile.funnelModel,
    profile.icp,
  ];
  const filledFields = contextFields.filter((item) => item && !item.includes('não informado')).length;
  const profileCoverage = clamp((filledFields / contextFields.length) * 100, 0, 100);
  const dataCoverageScore = Math.round(profileCoverage * 0.7 + sourceCoverage * 0.3);

  const narrativeSummary = `${profile.companyName} opera em ${profile.segment}/${profile.subsegment}, com oferta principal "${profile.mainOffer}" e foco em ${profile.objectives.join(', ') || 'objetivos comerciais em definição'}.`;

  return {
    profile,
    sources,
    dataCoverageScore,
    missingSignals,
    narrativeSummary,
  };
}

export function deriveBrandIntelligenceOutput(
  context: ContextEngineOutput,
  brandDna: BrandDnaSnapshot
): BrandIntelligenceOutput {
  const visualConsistencyRules = brandDna.visualDirection.length
    ? brandDna.visualDirection.map((item) => `Manter direção visual: ${item}.`)
    : ['Padronizar paleta e contraste com base no site e nos ativos atuais da marca.'];

  const narrativeConsistencyRules = brandDna.communicationTone.length
    ? brandDna.communicationTone.map((item) => `Comunicação deve manter tom ${item}.`)
    : ['Unificar narrativa entre anúncio, oferta e CTA para reduzir quebra de expectativa.'];

  const misalignmentRisks: string[] = [];
  if (!brandDna.isLoaded) {
    misalignmentRisks.push('DNA da Marca não carregado do banco. Risco de perda de consistência estratégica.');
  }
  if (!context.profile.differentiators.length) {
    misalignmentRisks.push('Diferenciais ausentes podem gerar criativos genéricos e menor autoridade percebida.');
  }
  if (!context.sources.websiteUrl) {
    misalignmentRisks.push('Sem website validado, o alinhamento de posicionamento pode ficar parcial.');
  }

  const coherenceBase = brandDna.isLoaded ? 78 : 55;
  const coherencePenalty = misalignmentRisks.length * 7;
  const coherenceScore = clamp(coherenceBase - coherencePenalty + Math.round(context.dataCoverageScore * 0.15), 0, 100);

  return {
    coherenceScore,
    visualConsistencyRules,
    narrativeConsistencyRules,
    misalignmentRisks,
  };
}

export function deriveStrategyEngineOutput(context: ContextEngineOutput): StrategyEngineOutput {
  const primaryGoal = context.profile.objectives[0] || 'Geração de demanda qualificada';

  const funnelLower = context.profile.funnelModel.toLowerCase();
  const funnelStage =
    funnelLower.includes('topo') ? 'Awareness' : funnelLower.includes('meio') ? 'Consideration' : funnelLower.includes('fundo') ? 'Decision' : 'Consideration';

  const trafficIntent =
    funnelStage === 'Awareness'
      ? 'Interromper o scroll e educar rapidamente'
      : funnelStage === 'Decision'
        ? 'Acelerar decisão com prova e oferta clara'
        : 'Transformar interesse em ação qualificada';

  const dominantEmotion =
    primaryGoal.toLowerCase().includes('escala')
      ? 'Ambição com segurança'
      : primaryGoal.toLowerCase().includes('leads')
        ? 'Urgência com clareza'
        : 'Confiança racional';

  const psychologicalTriggers = [
    'Autoridade com dados reais',
    'Prova social contextualizada',
    'Clareza de benefício financeiro',
    'Urgência legítima sem exagero',
  ];

  const narrativeArc = 'dor real -> impacto financeiro -> mecanismo estratégico -> prova -> CTA objetivo';

  const campaignArchitecture = [
    'Topo: criativos de diagnóstico e quebra de padrão',
    'Meio: criativos de mecanismo e diferenciais competitivos',
    'Fundo: criativos de prova, oferta e chamada de ação direta',
  ];

  return {
    primaryGoal,
    trafficIntent,
    funnelStage,
    dominantEmotion,
    psychologicalTriggers,
    narrativeArc,
    campaignArchitecture,
  };
}

export function deriveCreativeEngineOutput(
  context: ContextEngineOutput,
  strategy: StrategyEngineOutput,
  channels: string[]
): CreativeEngineOutput {
  const baseChannels = channels.length ? channels : ['Meta Ads', 'Google Ads'];
  const assetPlan: CreativeAssetPlan[] = baseChannels.flatMap((channel, index) => {
    const position = index % 3;
    const format = channel === 'Google Ads' ? 'Display + Responsive + Shorts' : channel === 'LinkedIn Ads' ? 'Imagem estática + vídeo curto + carrossel' : 'Reels + Stories + Carrossel';

    const conceptBase = context.profile.mainOffer.includes('não informada') ? 'Sistema de Crescimento Previsível' : context.profile.mainOffer;

    const conceptDescription =
      position === 0
        ? `Criativo centrado em ${strategy.dominantEmotion.toLowerCase()}, mostrando cenário antes/depois da operação com ${conceptBase}.`
        : position === 1
          ? `Criativo de mecanismo: explicita como o sistema reduz desperdício e aumenta previsibilidade no caixa.`
          : `Criativo de prova: dados reais, casos comparáveis e CTA direto para próximo passo comercial.`;

    const hook =
      position === 0
        ? 'Sua verba está sendo investida com previsibilidade ou no escuro?'
        : position === 1
          ? 'O problema não é falta de verba. É falta de sistema.'
          : 'Dados bons sem venda previsível ainda significam risco no caixa.';

    return [
      {
        channel,
        format,
        conceptName: `${channel} • Conceito ${position + 1}`,
        conceptDescription,
        visualDirection: context.profile.segment.includes('não informado')
          ? 'Estética premium com contraste alto, leitura rápida e foco em benefício financeiro.'
          : `Estética alinhada ao segmento ${context.profile.segment}, mantendo autoridade e clareza visual.`,
        hook,
        cta: 'Solicitar diagnóstico estratégico',
      },
    ];
  });

  const productionCadence = [
    'Semana 1: 3 variações de gancho por canal principal.',
    'Semana 2: 3 variações de mecanismo + prova social.',
    'Semana 3: 3 variações de oferta e CTA para fundo de funil.',
    'Semana 4: reciclagem dos vencedores com atualização visual para reduzir fadiga.',
  ];

  return {
    assetPlan,
    productionCadence,
  };
}

export function deriveCopyEngineOutput(
  context: ContextEngineOutput,
  strategy: StrategyEngineOutput
): CopyEngineOutput {
  const offer = context.profile.mainOffer.includes('não informada') ? 'sistema de crescimento previsível' : context.profile.mainOffer;

  const headlines = [
    `Chega de investir no escuro: ${offer} com foco em caixa.`,
    `Se os números parecem bons mas as vendas não batem, seu sistema está quebrado.`,
    `Escala previsível começa quando mídia, mensagem e oferta finalmente conversam.`,
  ];

  const primaryTexts = [
    `Sua operação não precisa de mais volume sem direção. Precisa de um sistema que transforme dados reais em decisões de campanha e criativos com impacto financeiro.`,
    `Enquanto muitos vendem campanha, você precisa de um ecossistema de performance: estratégia, criativo e otimização contínua para crescer com previsibilidade.`,
    `A proposta é simples: alinhar narrativa, criativo e funil para aumentar conversão e reduzir desperdício. Resultado esperado: mais receita com menos ruído operacional.`,
  ];

  const ctas = [
    'Ativar diagnóstico estratégico',
    'Solicitar plano criativo orientado a performance',
    `Executar próximo passo (${strategy.funnelStage})`,
  ];

  return { headlines, primaryTexts, ctas };
}

export function derivePerformanceEngineOutput(
  metrics: ExtractedMetrics,
  targetCtr: number,
  targetConversionRate: number,
  targetCpl: number,
  upliftGoal: number
): PerformanceEngineOutput {
  const currentCtr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0;
  const currentConversionRate = metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0;
  const currentCpl = metrics.conversions > 0 ? metrics.spend / metrics.conversions : 0;

  const upliftFactor = 1 + clamp(upliftGoal, 0, 200) / 100;
  const predictedCtr = currentCtr * upliftFactor;
  const predictedConversionRate = currentConversionRate * (1 + clamp(upliftGoal, 0, 200) / 140);
  const predictedConversions = metrics.impressions * (predictedCtr / 100) * (predictedConversionRate / 100);
  const predictedCpl = predictedConversions > 0 ? metrics.spend / predictedConversions : currentCpl;

  const ctrGap = targetCtr > 0 ? targetCtr - currentCtr : 0;
  const cvGap = targetConversionRate > 0 ? targetConversionRate - currentConversionRate : 0;
  const cplGap = targetCpl > 0 ? currentCpl - targetCpl : 0;

  const fatiguePoints = metrics.channels.filter((channel) => {
    const channelCtr = channel.impressions > 0 ? (channel.clicks / channel.impressions) * 100 : 0;
    return channelCtr < currentCtr * 0.8 && channel.spend > metrics.spend * 0.15;
  }).length;

  const fatigueRisk: 'low' | 'medium' | 'high' = fatiguePoints >= 2 ? 'high' : fatiguePoints === 1 ? 'medium' : 'low';

  const baseScore = 62;
  const score = clamp(
    baseScore +
      Math.round((targetCtr > 0 ? (currentCtr / targetCtr) * 12 : 0)) +
      Math.round((targetConversionRate > 0 ? (currentConversionRate / targetConversionRate) * 12 : 0)) -
      Math.round((targetCpl > 0 && currentCpl > 0 ? (currentCpl / targetCpl - 1) * 12 : 0)) -
      (fatigueRisk === 'high' ? 12 : fatigueRisk === 'medium' ? 6 : 0),
    0,
    100
  );

  const recommendations: string[] = [];
  if (ctrGap > 0.2) {
    recommendations.push(`CTR atual ${currentCtr.toFixed(2)}% abaixo da meta ${targetCtr.toFixed(2)}%: criar novos hooks visuais e abertura de 3 segundos.`);
  }
  if (cvGap > 0.2) {
    recommendations.push(`Conversão atual ${currentConversionRate.toFixed(2)}% abaixo da meta ${targetConversionRate.toFixed(2)}%: alinhar promessa criativa com oferta de destino.`);
  }
  if (cplGap > 1) {
    recommendations.push(`CPL atual acima da meta (${currentCpl.toFixed(2)} vs ${targetCpl.toFixed(2)}): priorizar provas e argumentos de objeção para qualificar cliques.`);
  }
  if (!recommendations.length) {
    recommendations.push('Indicadores próximos das metas. Próxima ação: iterar apenas os vencedores para manter consistência e reduzir fadiga.');
  }

  return {
    currentCtr,
    currentCpl,
    currentConversionRate,
    predictedCtr,
    predictedCpl,
    predictedConversionRate,
    fatigueRisk,
    conversionProbabilityScore: score,
    recommendations,
  };
}

export function deriveLearningEngineOutput(
  plan: CreativeGeneratorOperatingPlan,
  previousHistoryCount: number
): LearningEngineOutput {
  const learnings = [
    `Histórico de execuções analisado: ${previousHistoryCount} relatórios salvos para este agente.`,
    `Risco atual de fadiga criativa: ${plan.performance.fatigueRisk}.`,
    `Score preditivo de conversão: ${plan.performance.conversionProbabilityScore}/100.`,
  ];

  const dnaUpdateSuggestions = [
    'Atualizar seção de linguagem da marca com headlines vencedoras por canal.',
    'Registrar padrões visuais vencedores para reduzir variações fora do posicionamento.',
    'Evoluir tom de comunicação conforme métricas de retenção por estágio do funil.',
  ];

  const nextIterationPriorities = [
    'Iterar os dois conceitos com melhor CTR projetado.',
    'Executar teste A/B de promessa principal versus prova social.',
    'Revisar CTA para reduzir atrito entre clique e ação final.',
  ];

  return {
    learnings,
    dnaUpdateSuggestions,
    nextIterationPriorities,
  };
}

export function formatCreativeOperatingPlanMarkdown(plan: CreativeGeneratorOperatingPlan): string {
  const lines: string[] = [];

  lines.push(`# Plano Operacional - Gerador de Criativos`);
  lines.push('');
  lines.push(`## 1) Context Engine`);
  lines.push(`Cobertura de dados: ${plan.context.dataCoverageScore}/100`);
  lines.push(plan.context.narrativeSummary);
  if (plan.context.missingSignals.length) {
    lines.push('Gaps contextuais:');
    plan.context.missingSignals.forEach((item) => lines.push(`- ${item}`));
  }

  lines.push('');
  lines.push(`## 2) Brand Intelligence Engine`);
  lines.push(`Coerência de marca: ${plan.brandIntelligence.coherenceScore}/100`);
  plan.brandIntelligence.visualConsistencyRules.forEach((item) => lines.push(`- ${item}`));
  plan.brandIntelligence.narrativeConsistencyRules.forEach((item) => lines.push(`- ${item}`));
  if (plan.brandIntelligence.misalignmentRisks.length) {
    lines.push('Riscos de desalinhamento:');
    plan.brandIntelligence.misalignmentRisks.forEach((item) => lines.push(`- ${item}`));
  }

  lines.push('');
  lines.push(`## 3) Strategy Engine`);
  lines.push(`Objetivo primário: ${plan.strategy.primaryGoal}`);
  lines.push(`Estágio do funil: ${plan.strategy.funnelStage}`);
  lines.push(`Emoção dominante: ${plan.strategy.dominantEmotion}`);
  lines.push(`Arco narrativo: ${plan.strategy.narrativeArc}`);
  plan.strategy.campaignArchitecture.forEach((item) => lines.push(`- ${item}`));

  lines.push('');
  lines.push(`## 4) Creative + Copy Engine`);
  plan.creative.assetPlan.forEach((asset) => {
    lines.push(`- ${asset.channel} | ${asset.format} | ${asset.conceptName}`);
    lines.push(`  Hook: ${asset.hook}`);
    lines.push(`  CTA: ${asset.cta}`);
  });
  lines.push('Headlines sugeridas:');
  plan.copy.headlines.forEach((item) => lines.push(`- ${item}`));

  lines.push('');
  lines.push(`## 5) Performance Engine`);
  lines.push(`CTR atual/projetado: ${plan.performance.currentCtr.toFixed(2)}% -> ${plan.performance.predictedCtr.toFixed(2)}%`);
  lines.push(`CPL atual/projetado: ${plan.performance.currentCpl.toFixed(2)} -> ${plan.performance.predictedCpl.toFixed(2)}`);
  lines.push(`Probabilidade de conversão: ${plan.performance.conversionProbabilityScore}/100`);
  plan.performance.recommendations.forEach((item) => lines.push(`- ${item}`));

  lines.push('');
  lines.push(`## 6) Learning Engine`);
  plan.learning.learnings.forEach((item) => lines.push(`- ${item}`));
  lines.push('Atualizações recomendadas para DNA da Marca:');
  plan.learning.dnaUpdateSuggestions.forEach((item) => lines.push(`- ${item}`));

  return lines.join('\n');
}
