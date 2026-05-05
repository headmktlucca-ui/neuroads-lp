'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut 
} from 'firebase/auth';
import { getFirebaseAuth, getFirebaseDb } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { syncToHostingerReach } from '../app/actions/hostinger';
import { getPrimaryAuthEmail, isAdminEmail } from '../lib/admin-auth';

interface UserProfile {
  isPremium: boolean;
  usageStats: Record<string, { lastUsed: number; countThisWeek: number }>;
  connections?: Record<string, { 
    accountId: string; 
    accessToken: string; 
    isActive: boolean;
    loginCustomerId?: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  userEmail: string | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkUsageLimit: (appName: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_EMAIL_CACHE_PREFIX = 'neuroads_auth_email_';

function isFirestoreOfflineError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const code = 'code' in error ? String((error as { code?: string }).code ?? '') : '';
  if (code === 'unavailable') return true;

  const message = 'message' in error ? String((error as { message?: string }).message ?? '').toLowerCase() : '';
  return message.includes('client is offline') || message.includes('offline');
}

function getCachedAuthEmail(uid: string): string | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(`${AUTH_EMAIL_CACHE_PREFIX}${uid}`);
  return value?.trim() || null;
}

function cacheAuthEmail(uid: string, email: string | null): void {
  if (typeof window === 'undefined' || !email?.trim()) return;
  window.localStorage.setItem(`${AUTH_EMAIL_CACHE_PREFIX}${uid}`, email.trim());
}

async function resolvePrimaryAuthEmail(firebaseUser: User | null): Promise<string | null> {
  if (!firebaseUser) return null;

  const directEmail = getPrimaryAuthEmail(firebaseUser.email, firebaseUser.providerData);
  if (directEmail) return directEmail;

  try {
    const token = await firebaseUser.getIdTokenResult();
    const claimEmail = token?.claims?.email;
    if (typeof claimEmail === 'string' && claimEmail.trim()) {
      return claimEmail.trim();
    }
  } catch {
    // Ignore token inspection failures and continue with cache fallback.
  }

  return getCachedAuthEmail(firebaseUser.uid);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      const primaryEmail = await resolvePrimaryAuthEmail(firebaseUser);
      setUserEmail(primaryEmail);
      if (firebaseUser && primaryEmail) {
        cacheAuthEmail(firebaseUser.uid, primaryEmail);
      }

      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            const newProfile: UserProfile = { isPremium: false, usageStats: {} };
            try {
              await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            } catch (writeErr) {
              if (isFirestoreOfflineError(writeErr)) {
                console.info('Firestore temporariamente offline. Prosseguindo com perfil local.');
              } else {
                console.warn('Firestore write failed:', writeErr);
              }
            }
            setProfile(newProfile);

            if (primaryEmail) {
              syncToHostingerReach({
                email: primaryEmail,
                name: firebaseUser.displayName || 'Usuário NeuroAds',
                tags: ['Usuários Ativos'],
              }).catch(err => console.error('Reach sync failed:', err));
            }
          }
        } catch (err) {
          // Firestore offline or quota error — set minimal profile so the app still opens
          if (isFirestoreOfflineError(err)) {
            console.info('Firestore temporariamente offline. Abrindo app com fallback local.');
          } else {
            console.warn('Firestore getDoc failed:', err);
          }
          setProfile({ isPremium: false, usageStats: {} });
        }
      } else {
        setProfile(null);
        setUserEmail(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const loginWithGoogle = async () => {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });

    const result = await signInWithPopup(auth, provider);
    const primaryEmail = await resolvePrimaryAuthEmail(result.user);
    if (primaryEmail) {
      setUserEmail(primaryEmail);
      cacheAuthEmail(result.user.uid, primaryEmail);
    }
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    await signOut(auth);
  };

  const checkUsageLimit = async (appName: string): Promise<boolean> => {
    if (!user || !profile) return false;
    if (profile.isPremium) return true;

    const stats = profile.usageStats[appName];
    if (!stats) return true;

    const now = Date.now();
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    
    // Check if the last use was more than a week ago
    if (now - stats.lastUsed > oneWeekInMs) {
      return true;
    }

    return false;
  };

  return (
    <AuthContext.Provider value={{ user, userEmail, profile, loading, isAdmin: isAdminEmail(userEmail), loginWithGoogle, logout, checkUsageLimit }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
