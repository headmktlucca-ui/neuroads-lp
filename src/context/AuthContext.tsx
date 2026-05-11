'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut 
} from 'firebase/auth';
import { getFirebaseAuth, getFirebaseDb } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { syncToHostingerReach } from '../app/actions/hostinger';
import { getPrimaryAuthEmail, isAdminEmail } from '../lib/admin-auth';
import { hasHubPlanAccess } from '../lib/hub-access';

interface UserProfile {
  isPremium: boolean;
  usageStats: Record<string, { lastUsed: number; countThisWeek: number }>;
  authEmail?: string;
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
  premiumSyncing: boolean;
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
  const [premiumSyncing, setPremiumSyncing] = useState(false);
  const premiumSyncAttemptRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    let profileUnsubscribe: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      setUser(firebaseUser);
      const primaryEmail = await resolvePrimaryAuthEmail(firebaseUser);
      setUserEmail(primaryEmail);
      if (firebaseUser && primaryEmail) {
        cacheAuthEmail(firebaseUser.uid, primaryEmail);
      }

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        profileUnsubscribe = onSnapshot(
          userRef,
          (userDoc) => {
            if (userDoc.exists()) {
              const snapshotProfile = userDoc.data() as UserProfile;
              setProfile(snapshotProfile);
              if (hasHubPlanAccess(snapshotProfile)) {
                setPremiumSyncing(false);
              }

              if (!hasHubPlanAccess(snapshotProfile) && !premiumSyncAttemptRef.current[firebaseUser.uid]) {
                premiumSyncAttemptRef.current[firebaseUser.uid] = true;
                setPremiumSyncing(true);
                void firebaseUser
                  .getIdToken()
                  .then((idToken) =>
                    fetch('/api/stripe/sync-premium', {
                      method: 'POST',
                      headers: {
                        Authorization: `Bearer ${idToken}`,
                      },
                    })
                  )
                  .then(async (response) => {
                    if (!response.ok) {
                      const payload = await response.json().catch(() => ({}));
                      console.warn('Não foi possível sincronizar assinatura com Stripe:', payload);
                    }
                  })
                  .catch((error) => {
                    console.warn('Falha ao acionar sincronização de assinatura:', error);
                  })
                  .finally(() => {
                    setPremiumSyncing(false);
                  });
              }

              if (primaryEmail && snapshotProfile.authEmail !== primaryEmail) {
                void setDoc(
                  userRef,
                  {
                    authEmail: primaryEmail,
                    updatedAt: Date.now(),
                  },
                  { merge: true }
                ).catch((writeErr) => {
                  if (!isFirestoreOfflineError(writeErr)) {
                    console.warn('Falha ao atualizar e-mail primário no perfil:', writeErr);
                  }
                });
              }
            } else {
              setPremiumSyncing(false);
              const newProfile: UserProfile = {
                isPremium: false,
                usageStats: {},
                ...(primaryEmail ? { authEmail: primaryEmail } : {}),
              };
              setProfile(newProfile);

              void setDoc(
                userRef,
                {
                  ...newProfile,
                  updatedAt: Date.now(),
                },
                { merge: true }
              ).catch((writeErr) => {
                if (isFirestoreOfflineError(writeErr)) {
                  console.info('Firestore temporariamente offline. Prosseguindo com perfil local.');
                } else {
                  console.warn('Firestore write failed:', writeErr);
                }
              });

              if (primaryEmail) {
                syncToHostingerReach({
                  email: primaryEmail,
                  name: firebaseUser.displayName || 'Usuário NeuroAds',
                  tags: ['Usuários Ativos'],
                }).catch(err => console.error('Reach sync failed:', err));
              }
            }

            setLoading(false);
          },
          (err) => {
            setPremiumSyncing(false);
            if (isFirestoreOfflineError(err)) {
              console.info('Firestore temporariamente offline. Abrindo app com fallback local.');
            } else {
              console.warn('Firestore profile snapshot failed:', err);
            }
            setProfile({ isPremium: false, usageStats: {}, ...(primaryEmail ? { authEmail: primaryEmail } : {}) });
            setLoading(false);
          }
        );
      } else {
        setProfile(null);
        setUserEmail(null);
        setPremiumSyncing(false);
        premiumSyncAttemptRef.current = {};
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
    };
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
    <AuthContext.Provider
      value={{
        user,
        userEmail,
        profile,
        loading,
        premiumSyncing,
        isAdmin: isAdminEmail(userEmail),
        loginWithGoogle,
        logout,
        checkUsageLimit,
      }}
    >
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
