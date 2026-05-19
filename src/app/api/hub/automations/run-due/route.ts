import { NextResponse } from 'next/server';
import { getAdminDb } from '../../../../../lib/firebase-admin';
import { buildAutomationCompletedEvent, buildAutomationStartedEvent } from '../../../../../lib/hub-automation-events';
import { buildAutomationTimestamps, getHubAutomationsFromProfile } from '../../../../../lib/hub-automations';

const CRON_SECRET_HEADER = 'x-hub-cron-secret';

function isAuthorized(request: Request): boolean {
  const expectedSecret = process.env.HUB_AUTOMATIONS_CRON_SECRET?.trim();
  if (!expectedSecret) return false;
  const providedSecret = request.headers.get(CRON_SECRET_HEADER)?.trim();
  return Boolean(providedSecret && providedSecret === expectedSecret);
}

async function runDueAutomations(now: number): Promise<{
  usersScanned: number;
  automationsDue: number;
  usersTouched: number;
}> {
  const db = getAdminDb();
  const usersSnapshot = await db.collection('users').get();

  let automationsDue = 0;
  let usersTouched = 0;

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data() as Record<string, unknown>;
    const automations = getHubAutomationsFromProfile(userData);
    const dueAutomations = automations.filter(
      (automation) => automation.status === 'active' && Boolean(automation.nextUpdateAt && automation.nextUpdateAt <= now)
    );

    if (!dueAutomations.length) continue;

    const updatePayload: Record<string, unknown> = {};
    const batch = db.batch();

    for (const automation of dueAutomations) {
      automationsDue += 1;
      const scheduledAt = automation.nextUpdateAt ?? null;
      const startedAt = now;
      const completedAt = now;

      const nextTimestamps = buildAutomationTimestamps({
        cadence: automation.cadence,
        monthlyExecutions: automation.monthlyExecutions,
        scheduleOptionLabel: automation.scheduleOptionLabel,
        now: completedAt,
      });

      updatePayload[`automations.${automation.key}.lastUpdateAt`] = nextTimestamps.lastUpdateAt;
      updatePayload[`automations.${automation.key}.nextUpdateAt`] = nextTimestamps.nextUpdateAt;
      updatePayload[`automations.${automation.key}.updatedAt`] = completedAt;
      updatePayload[`automations.${automation.key}.lastScheduledAt`] = scheduledAt ?? completedAt;
      updatePayload[`automations.${automation.key}.lastExecutionSource`] = 'cron-monitor';
      updatePayload[`automations.${automation.key}.lastExecutionStatus`] = 'completed';

      const startedEvent = buildAutomationStartedEvent({
        automationKey: automation.key,
        agentTitle: automation.agentTitle,
        agentCategory: automation.agentCategory,
        scheduledAt,
        startedAt,
      });
      const completedEvent = buildAutomationCompletedEvent({
        automationKey: automation.key,
        agentTitle: automation.agentTitle,
        agentCategory: automation.agentCategory,
        scheduledAt,
        startedAt,
        completedAt,
      });

      const startedEventRef = userDoc.ref.collection('automationEvents').doc(`${startedEvent.executionKey}:started`);
      const completedEventRef = userDoc.ref.collection('automationEvents').doc(`${completedEvent.executionKey}:completed`);
      batch.set(startedEventRef, startedEvent, { merge: true });
      batch.set(completedEventRef, completedEvent, { merge: true });
    }

    batch.set(userDoc.ref, updatePayload, { merge: true });
    await batch.commit();
    usersTouched += 1;
  }

  return {
    usersScanned: usersSnapshot.size,
    automationsDue,
    usersTouched,
  };
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Não autorizado. Configure HUB_AUTOMATIONS_CRON_SECRET e envie x-hub-cron-secret.' },
      { status: 401 }
    );
  }

  try {
    const now = Date.now();
    const result = await runDueAutomations(now);
    return NextResponse.json({
      ok: true,
      timestamp: now,
      ...result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Falha ao processar automações.';
    console.error('Erro em /api/hub/automations/run-due:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
