import { collection, getDocs, limit, query } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import { getFirebaseDb } from '../../../../lib/firebase';

async function probeCollection(pathSegments: [string, ...string[]]) {
  const startedAt = Date.now();
  const db = getFirebaseDb();
  const collectionRef = collection(db, ...pathSegments);
  const snapshot = await getDocs(query(collectionRef, limit(1)));
  return {
    ok: true,
    durationMs: Date.now() - startedAt,
    countSample: snapshot.size,
  };
}

export async function GET() {
  const workspaceUserId = process.env.LUCCA_DEFAULT_WORKSPACE_USER_ID || '';
  if (!workspaceUserId) {
    return NextResponse.json(
      { ok: false, error: 'LUCCA_DEFAULT_WORKSPACE_USER_ID não configurado.' },
      { status: 500 },
    );
  }

  const checks: Array<[string, ...string[]]> = [
    ['admin_workspaces', workspaceUserId, 'crm_accounts'],
    ['admin_workspaces', workspaceUserId, 'crm_contacts'],
    ['admin_workspaces', workspaceUserId, 'crm_deals'],
    ['admin_workspaces', workspaceUserId, 'executive_tasks'],
    ['admin_workspaces', workspaceUserId, 'finance_entries'],
    ['admin_workspaces', workspaceUserId, 'crm_interactions'],
  ];

  const startedAt = Date.now();
  const results = await Promise.allSettled(checks.map((segments) => probeCollection(segments)));
  const normalized = results.map((result, index) => {
    const key = checks[index]?.[2] || `check_${index}`;
    if (result.status === 'fulfilled') {
      return { key, ...result.value };
    }
    return {
      key,
      ok: false,
      durationMs: 0,
      error: result.reason instanceof Error ? result.reason.message : 'unknown_error',
    };
  });

  const failed = normalized.filter((item) => !item.ok);
  const payload = {
    ok: failed.length === 0,
    checkedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    checks: normalized,
  };

  return NextResponse.json(payload, { status: payload.ok ? 200 : 500 });
}
