export type LogLevel = 'info' | 'warn' | 'error';

type LogPayload = {
  event: string;
  level?: LogLevel;
  context?: Record<string, unknown>;
};

export function logEvent(payload: LogPayload) {
  const level = payload.level || 'info';
  const base = {
    ts: new Date().toISOString(),
    event: payload.event,
    ...payload.context,
  };

  if (level === 'error') {
    console.error('[admin-observability]', JSON.stringify(base));
    return;
  }
  if (level === 'warn') {
    console.warn('[admin-observability]', JSON.stringify(base));
    return;
  }
  console.info('[admin-observability]', JSON.stringify(base));
}

export async function timed<T>(name: string, fn: () => Promise<T>) {
  const startedAt = Date.now();
  try {
    const result = await fn();
    logEvent({
      event: `${name}.ok`,
      context: { durationMs: Date.now() - startedAt },
    });
    return result;
  } catch (error) {
    logEvent({
      event: `${name}.failed`,
      level: 'error',
      context: {
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : 'unknown_error',
      },
    });
    throw error;
  }
}
