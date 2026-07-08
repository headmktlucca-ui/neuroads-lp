'use client';

import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { HUB_PLAN, getOperationCreditCost, type HubCreditOperation } from '../data/hub-plan';

const COLLECTION = 'hubCreditUsage';

export type HubCreditUsage = {
  cycleKey: string;
  used: number;
  extraCredits: number;
  totalCredits: number;
  remaining: number;
  ratio: number;
  isNearLimit: boolean;
  isExhausted: boolean;
};

export type HubCreditReservation =
  | { allowed: true; cost: number; usage: HubCreditUsage }
  | { allowed: false; cost: number; usage: HubCreditUsage; reason: string };

export type HubCreditOptions = {
  /** Durante o trial de 14 dias o envelope é HUB_PLAN.trialCredits, não o mensal. */
  isTrialing?: boolean;
};

export function getCurrentCycleKey(reference: Date = new Date()): string {
  const year = reference.getFullYear();
  const month = String(reference.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function usageDocId(userId: string, cycleKey: string): string {
  return `${userId}_${cycleKey}`;
}

function baseCredits(options?: HubCreditOptions): number {
  return options?.isTrialing ? HUB_PLAN.trialCredits : HUB_PLAN.monthlyCredits;
}

function buildUsage(
  cycleKey: string,
  used: number,
  extraCredits: number,
  options?: HubCreditOptions
): HubCreditUsage {
  const totalCredits = baseCredits(options) + extraCredits;
  const remaining = Math.max(totalCredits - used, 0);
  const ratio = totalCredits > 0 ? Math.min(used / totalCredits, 1) : 1;

  return {
    cycleKey,
    used,
    extraCredits,
    totalCredits,
    remaining,
    ratio,
    isNearLimit: ratio >= HUB_PLAN.alertThreshold,
    isExhausted: remaining <= 0,
  };
}

function readCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

export async function getCreditUsage(
  userId: string,
  options?: HubCreditOptions
): Promise<HubCreditUsage> {
  const cycleKey = getCurrentCycleKey();
  const db = getFirebaseDb();
  const snapshot = await getDoc(doc(db, COLLECTION, usageDocId(userId, cycleKey)));
  const data = snapshot.exists() ? snapshot.data() : {};

  return buildUsage(cycleKey, readCount(data.used), readCount(data.extraCredits), options);
}

/**
 * Reserva créditos ANTES de iniciar uma execução (nunca durante).
 * Se o saldo não cobre o custo, a operação é negada por inteiro — tarefa
 * nenhuma é interrompida no meio por falta de crédito.
 */
export async function reserveCredits(
  userId: string,
  operation: HubCreditOperation,
  agentTitle?: string,
  options?: HubCreditOptions
): Promise<HubCreditReservation> {
  const cost = getOperationCreditCost(operation, agentTitle);
  const cycleKey = getCurrentCycleKey();
  const db = getFirebaseDb();
  const usageRef = doc(db, COLLECTION, usageDocId(userId, cycleKey));

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(usageRef);
    const data = snapshot.exists() ? snapshot.data() : {};
    const used = readCount(data.used);
    const extraCredits = readCount(data.extraCredits);
    const usage = buildUsage(cycleKey, used, extraCredits, options);

    if (usage.remaining < cost) {
      return {
        allowed: false,
        cost,
        usage,
        reason: options?.isTrialing
          ? 'Créditos de teste esgotados. Assine o plano para liberar os créditos mensais completos.'
          : 'Créditos do ciclo esgotados. Contrate um booster de créditos ou aguarde a renovação do plano.',
      };
    }

    const nextUsage = buildUsage(cycleKey, used + cost, extraCredits, options);
    transaction.set(
      usageRef,
      {
        userId,
        cycleKey,
        used: nextUsage.used,
        extraCredits,
        updatedAtMs: Date.now(),
      },
      { merge: true }
    );

    return { allowed: true, cost, usage: nextUsage };
  });
}

/** Credita um booster (pós-checkout) no ciclo vigente. */
export async function addBoosterCredits(
  userId: string,
  credits: number,
  options?: HubCreditOptions
): Promise<HubCreditUsage> {
  const cycleKey = getCurrentCycleKey();
  const db = getFirebaseDb();
  const usageRef = doc(db, COLLECTION, usageDocId(userId, cycleKey));
  const amount = readCount(credits);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(usageRef);
    const data = snapshot.exists() ? snapshot.data() : {};
    const used = readCount(data.used);
    const extraCredits = readCount(data.extraCredits) + amount;

    transaction.set(
      usageRef,
      {
        userId,
        cycleKey,
        used,
        extraCredits,
        updatedAtMs: Date.now(),
      },
      { merge: true }
    );

    return buildUsage(cycleKey, used, extraCredits, options);
  });
}
