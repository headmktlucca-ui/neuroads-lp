'use server';

import { getFirebaseDb } from '../../lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, doc, setDoc } from 'firebase/firestore';
import { buildAutomationTimestamps } from '../../lib/hub-automations';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function scheduleAutomation(userId: string, config: { platform: string, frequency: string, accountId: string, email: string }) {
  try {
    const db = getFirebaseDb();
    const userRef = doc(db, 'users', userId);

    const automationKey = config.platform.toLowerCase().replace(/\s+/g, '_');
    const normalizedFrequency = config.frequency.trim().toLowerCase();
    const schedulePresetMap: Record<string, { cadence: string; monthlyExecutions: number; scheduleLabel: string }> = {
      diário: {
        cadence: 'execução diária (7 rotinas/semana)',
        monthlyExecutions: 30,
        scheduleLabel: 'Seg a Dom • 09:00',
      },
      diario: {
        cadence: 'execução diária (7 rotinas/semana)',
        monthlyExecutions: 30,
        scheduleLabel: 'Seg a Dom • 09:00',
      },
      semanal: {
        cadence: '1x por semana (1 rotinas/semana)',
        monthlyExecutions: 4,
        scheduleLabel: 'Seg • 09:00',
      },
      quinzenal: {
        cadence: 'Cadência quinzenal (1 rotina a cada 2 semanas)',
        monthlyExecutions: 2,
        scheduleLabel: 'Seg • 09:00',
      },
      mensal: {
        cadence: 'Cadência mensal (1 rotina por mês)',
        monthlyExecutions: 1,
        scheduleLabel: 'Dia 01 • 09:00',
      },
    };

    const preset = schedulePresetMap[normalizedFrequency] ?? schedulePresetMap.semanal;
    const now = Date.now();
    const timestamps = buildAutomationTimestamps({
      cadence: preset.cadence,
      monthlyExecutions: preset.monthlyExecutions,
      scheduleOptionLabel: preset.scheduleLabel,
      now,
    });

    await setDoc(
      userRef,
      {
        [`automations.${automationKey}`]: {
          status: 'active',
          agentTitle: config.platform,
          agentCategory: 'Performance',
          cadenceId: `legacy_${normalizedFrequency || 'semanal'}`,
          cadenceTitle: `Cadência ${config.frequency}`,
          cadence: preset.cadence,
          monthlyExecutions: preset.monthlyExecutions,
          distribution: `Configuração legada (${config.frequency})`,
          objective: 'Automação agendada via rotina legada de diagnóstico.',
          scheduleOptionId: `legacy_${normalizedFrequency || 'semanal'}_0900`,
          scheduleOptionLabel: preset.scheduleLabel,
          scheduleOptionDetail: `Conta conectada: ${config.accountId}`,
          legacySource: 'traffic-analyst',
          legacyEmail: config.email,
          legacyAccountId: config.accountId,
          activatedAt: now,
          updatedAt: now,
          lastUpdateAt: timestamps.lastUpdateAt,
          nextUpdateAt: timestamps.nextUpdateAt,
        },
      },
      { merge: true }
    );

    return { success: true };
  } catch (error: unknown) {
    console.error('Error scheduling automation:', error);
    return { success: false, error: getErrorMessage(error, 'Erro ao agendar automação.') };
  }
}

export async function getHistory(userId: string) {
  try {
    const db = getFirebaseDb();
    const historyRef = collection(db, 'history');
    const q = query(historyRef, where('userId', '==', userId), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, results };
  } catch (error: unknown) {
    console.error('Error fetching history:', error);
    return { success: false, error: getErrorMessage(error, 'Erro ao buscar histórico.') };
  }
}

export async function saveToHistory(userId: string, data: Record<string, unknown>) {
  try {
    const db = getFirebaseDb();
    const historyRef = collection(db, 'history');
    await addDoc(historyRef, {
      userId,
      ...data,
      timestamp: Date.now()
    });
    return { success: true };
  } catch (error: unknown) {
    console.error('Error saving to history:', error);
    return { success: false, error: getErrorMessage(error, 'Erro ao salvar histórico.') };
  }
}
