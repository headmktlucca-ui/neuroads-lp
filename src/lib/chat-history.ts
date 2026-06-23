'use client';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  text: string;
  createdAtMs: number;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAtMs: number;
  updatedAtMs: number;
};

export async function saveChatSession(
  userId: string,
  messages: ChatMessage[],
  sessionId?: string
): Promise<{ success: boolean; id?: string }> {
  try {
    const db = getFirebaseDb();
    const firstUserMsg = messages.find((m) => m.role === 'user');
    const title = firstUserMsg?.text?.slice(0, 60) || 'Conversa com Lucca';
    const now = Date.now();

    if (sessionId) {
      const ref = doc(db, 'users', userId, 'chat_sessions', sessionId);
      await setDoc(ref, { title, messages, updatedAtMs: now }, { merge: true });
      return { success: true, id: sessionId };
    }

    const ref = collection(db, 'users', userId, 'chat_sessions');
    const docRef = await addDoc(ref, {
      title,
      messages,
      createdAtMs: now,
      updatedAtMs: now,
    });
    return { success: true, id: docRef.id };
  } catch {
    return { success: false };
  }
}

export async function getChatSessions(userId: string, maxItems = 30): Promise<ChatSession[]> {
  try {
    const db = getFirebaseDb();
    const ref = collection(db, 'users', userId, 'chat_sessions');
    const q = query(ref, orderBy('updatedAtMs', 'desc'), limit(maxItems));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as Omit<ChatSession, 'id'>;
      return { id: d.id, ...data };
    });
  } catch {
    return [];
  }
}

export async function deleteChatSession(
  userId: string,
  sessionId: string
): Promise<{ success: boolean }> {
  try {
    const db = getFirebaseDb();
    await deleteDoc(doc(db, 'users', userId, 'chat_sessions', sessionId));
    return { success: true };
  } catch {
    return { success: false };
  }
}
