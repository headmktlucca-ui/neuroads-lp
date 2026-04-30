import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Lazy initialization to prevent server-side crashes with client SDK
let auth: Auth;
let db: Firestore;

const getFirebaseAuth = () => {
  if (!auth) auth = getAuth(app);
  return auth;
};

const getFirebaseDb = () => {
  if (!db) db = getFirestore(app);
  return db;
};

// Maintain original exports for client components (with safety checks)
if (typeof window !== 'undefined') {
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db, getFirebaseAuth, getFirebaseDb };
