import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function getFirebaseConfig(): FirebaseConfig {
  const requireEnv = (name: string, value: string | undefined): string => {
    if (!value) {
      throw new Error(`Firebase env ausente: ${name}`);
    }
    return value;
  };

  // Use static env access so Next/Turbopack can inline NEXT_PUBLIC vars in client bundles.
  const cleanEnv = (val: string) => val.trim().replace(/(^"|"$)/g, '');

  const apiKey = cleanEnv(requireEnv('NEXT_PUBLIC_FIREBASE_API_KEY', process.env.NEXT_PUBLIC_FIREBASE_API_KEY));
  const authDomain = cleanEnv(requireEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN));
  const projectId = cleanEnv(requireEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID));
  const storageBucket = cleanEnv(requireEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET));
  const messagingSenderId = cleanEnv(requireEnv(
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  ));
  const appId = cleanEnv(requireEnv('NEXT_PUBLIC_FIREBASE_APP_ID', process.env.NEXT_PUBLIC_FIREBASE_APP_ID));

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

let auth: Auth | undefined;
let db: Firestore | undefined;

function getFirebaseApp() {
  if (getApps().length > 0) return getApp();
  return initializeApp(getFirebaseConfig());
}

const getFirebaseAuth = () => {
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
};

const getFirebaseDb = () => {
  if (!db) db = getFirestore(getFirebaseApp());
  return db;
};

export { getFirebaseApp, getFirebaseAuth, getFirebaseDb };
