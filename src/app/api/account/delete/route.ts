import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAuth } from 'firebase-admin/auth';
import { getAdminDb } from '../../../../lib/firebase-admin';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type FirebaseLookupUser = { localId?: string; email?: string };
type FirebaseLookupResponse = {
  users?: FirebaseLookupUser[];
  error?: { message?: string };
};

function readString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function extractBearerToken(value: string | null): string | null {
  if (!value) return null;
  const [scheme, token] = value.split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

function shouldCancelSubscription(status: Stripe.Subscription.Status): boolean {
  return ['trialing', 'active', 'past_due', 'unpaid', 'incomplete'].includes(status);
}

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY não configurada.');
  return new Stripe(key, { apiVersion: '2026-02-25.clover' as never });
}

/** Verifica o ID-token do Firebase via REST (sem firebase-admin/auth na etapa de verificação inicial) */
async function verifyFirebaseIdToken(idToken: string): Promise<{ uid: string; email: string | null }> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
  if (!apiKey) throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY não configurada.');

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );

  const data = (await res.json().catch(() => null)) as FirebaseLookupResponse | null;
  if (!res.ok) throw new Error(data?.error?.message ?? 'Sessão Firebase inválida.');

  const user = data?.users?.[0];
  const uid  = readString(user?.localId);
  if (!uid) throw new Error('Usuário não encontrado na sessão Firebase.');

  return { uid, email: readString(user?.email) || null };
}

// ─── Delete all Firestore data for a user ────────────────────────────────────

const KNOWN_SUBCOLLECTIONS = [
  'automations',
  'connectors',
  'reports',
  'conversations',
  'documents',
  'dna',
  'sessions',
  'agentRuns',
  'notifications',
] as const;

const BATCH_SIZE = 450; // Firestore max batch is 500 — leave margin

async function deleteFirestoreUserData(uid: string): Promise<void> {
  const db = getAdminDb();
  const userRef = db.collection('users').doc(uid);

  // 1. Delete known sub-collections in parallel
  await Promise.allSettled(
    KNOWN_SUBCOLLECTIONS.map(async (sub) => {
      const snap = await userRef.collection(sub).listDocuments();
      // Batch-delete in chunks
      for (let i = 0; i < snap.length; i += BATCH_SIZE) {
        const batch = db.batch();
        snap.slice(i, i + BATCH_SIZE).forEach((ref) => batch.delete(ref));
        await batch.commit();
      }
    })
  );

  // 2. Delete the root user document itself
  await userRef.delete();

  // 3. Also clean up any top-level collections that reference the user by UID
  //    (e.g. agentWorkspaces/{uid}, dnaProfiles/{uid})
  const topLevelRefs = [
    db.collection('agentWorkspaces').doc(uid),
    db.collection('dnaProfiles').doc(uid),
    db.collection('conversations').doc(uid),
  ];
  await Promise.allSettled(topLevelRefs.map((ref) => ref.delete()));
}

// ─── Cancel all Stripe subscriptions for a user ───────────────────────────────

async function cancelStripeSubscriptions(
  stripe: Stripe,
  stripeCustomerId: string,
  primaryEmail: string
): Promise<string[]> {
  const subscriptionIds = new Set<string>();

  // From explicit customer ID
  if (stripeCustomerId) {
    const { data } = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'all',
      limit: 30,
    });
    data.filter((s) => shouldCancelSubscription(s.status)).forEach((s) => subscriptionIds.add(s.id));
  }

  // From email lookup (catches duplicate customer records)
  if (primaryEmail) {
    const { data: customers } = await stripe.customers.list({ email: primaryEmail, limit: 10 });
    for (const customer of customers) {
      const { data: subs } = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'all',
        limit: 30,
      });
      subs.filter((s) => shouldCancelSubscription(s.status)).forEach((s) => subscriptionIds.add(s.id));
    }
  }

  const canceled: string[] = [];
  for (const id of subscriptionIds) {
    try {
      const sub = await stripe.subscriptions.retrieve(id);
      if (shouldCancelSubscription(sub.status)) {
        await stripe.subscriptions.cancel(id);
        canceled.push(id);
      }
    } catch {
      // Non-fatal — continue canceling the rest
    }
  }
  return canceled;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    // 1. Verify session
    const token = extractBearerToken(req.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Token ausente.' }, { status: 401 });
    }

    const session = await verifyFirebaseIdToken(token);
    const body = (await req.json().catch(() => ({}))) as {
      uid?: unknown;
      email?: unknown;
      stripeCustomerId?: unknown;
      stripeSubscriptionId?: unknown;
      onboardingStripeSubscriptionId?: unknown;
    };

    const payloadUid = readString(body.uid);
    if (payloadUid && payloadUid !== session.uid) {
      return NextResponse.json({ error: 'Sessão inválida para este usuário.' }, { status: 403 });
    }

    const uid            = session.uid;
    const primaryEmail   = readString(body.email) || session.email || '';
    const stripeCustomerId = readString(body.stripeCustomerId);

    // 2. Cancel Stripe subscriptions (best-effort — don't block deletion on failure)
    let canceledSubscriptions: string[] = [];
    try {
      const stripe = getStripeClient();
      canceledSubscriptions = await cancelStripeSubscriptions(stripe, stripeCustomerId, primaryEmail);
    } catch (stripeErr) {
      console.error('[account/delete] Stripe cancellation failed (non-fatal):', stripeErr);
    }

    // 3. Delete ALL Firestore data for this user
    await deleteFirestoreUserData(uid);

    // 4. Delete the Firebase Auth account — must be last so previous steps can still auth-check
    try {
      await getAuth().deleteUser(uid);
    } catch (authErr) {
      console.error('[account/delete] Firebase Auth deletion failed:', authErr);
      // Still return success — Firestore data is gone; auth cleanup can be retried via admin
    }

    console.log(`[account/delete] User ${uid} fully deleted. Subscriptions canceled: ${canceledSubscriptions.join(', ') || 'none'}`);

    return NextResponse.json({
      ok: true,
      uid,
      canceledSubscriptions,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Falha ao excluir conta.';
    console.error('[account/delete] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
