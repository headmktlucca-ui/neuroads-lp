import 'server-only';

import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function readRequiredEnv(name: string, value: string | undefined): string {
  if (!value || !value.trim()) {
    throw new Error(`Firebase Admin env ausente: ${name}`);
  }
  return value;
}

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  const normalizedPrivateKey = privateKeyRaw?.replace(/\\n/g, '\n');

  return initializeApp({
    credential: cert({
      projectId: readRequiredEnv('FIREBASE_PROJECT_ID', projectId),
      clientEmail: readRequiredEnv('FIREBASE_CLIENT_EMAIL', clientEmail),
      privateKey: readRequiredEnv('FIREBASE_PRIVATE_KEY', normalizedPrivateKey),
    }),
  });
}

export function getAdminDb() {
  return getFirestore(getFirebaseAdminApp());
}
