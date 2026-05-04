'use server';

import { getFirebaseDb } from '../../lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function scheduleAutomation(userId: string, config: { platform: string, frequency: string, accountId: string, email: string }) {
  try {
    const db = getFirebaseDb();
    const userRef = doc(db, 'users', userId);
    
    // Save or update schedule
    await updateDoc(userRef, {
      [`automations.${config.platform.toLowerCase().replace(' ', '_')}`]: {
        ...config,
        status: 'active',
        createdAt: Date.now(),
        lastRun: null,
      }
    });

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
