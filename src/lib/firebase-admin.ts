import 'server-only';

import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function cleanEnvVal(val: string | undefined): string | undefined {
  if (!val) return undefined;
  return val.trim().replace(/^["']|["']$/g, '');
}

function normalizePrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;

  let formatted = key.trim();

  // Strip surrounding quotes if present (e.g. "..." or '...')
  formatted = formatted.replace(/^["']|["']$/g, '');

  // Unescape backslash-escaped quotes and literal escaped newlines
  formatted = formatted.replace(/\\"/g, '"').replace(/\\n/g, '\n').trim();

  // Strip again in case of nested quote wrapping (e.g. '"-----BEGIN..."')
  formatted = formatted.replace(/^["']|["']$/g, '').trim();

  // Ensure PEM start line starts at -----BEGIN
  const beginIndex = formatted.indexOf('-----BEGIN');
  if (beginIndex > 0) {
    formatted = formatted.substring(beginIndex);
  }

  return formatted;
}

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

  const rawProjectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const rawClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  const projectId = cleanEnvVal(rawProjectId);
  const clientEmail = cleanEnvVal(rawClientEmail);
  const privateKey = normalizePrivateKey(rawPrivateKey);

  return initializeApp({
    credential: cert({
      projectId: readRequiredEnv('FIREBASE_PROJECT_ID', projectId),
      clientEmail: readRequiredEnv('FIREBASE_CLIENT_EMAIL', clientEmail),
      privateKey: readRequiredEnv('FIREBASE_PRIVATE_KEY', privateKey),
    }),
  });
}

export function getAdminDb() {
  return getFirestore(getFirebaseAdminApp());
}

