import { initializeApp, getApps, getApp } from 'firebase/app';
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

// Initialize services with SSR safety
let auth: Auth;
let db: Firestore;

if (typeof window !== 'undefined') {
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // On server, we initialize them but avoid calling browser-only methods
  // getAuth and getFirestore usually work in Node.js if the SDK version is modern,
  // but they shouldn't be used for auth persistence on the server.
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };
