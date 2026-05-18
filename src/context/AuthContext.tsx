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

interface UserProfile {
  [key: string]: unknown;
  isPremium: boolean;
  usageStats: Record<string, { lastUsed: number; countThisWeek: number }>;
  authEmail?: string;
  registeredAt?: number;
  createdAt?: number;
  updatedAt?: number;
  companyName?: string;
  site?: string;
  whatsapp?: string;
  instagram?: string;
  linkedin?: string;
  onboarding?: Record<string, unknown>;
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
const ACCOUNT_DELETE_FLAG_PREFIX = 'neuroads_account_delete_in_progress_';

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

function isAccountDeletionInProgress(uid: string): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(`${ACCOUNT_DELETE_FLAG_PREFIX}${uid}`) === '1';
}

function clearAccountDeletionFlag(uid: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(`${ACCOUNT_DELETE_FLAG_PREFIX}${uid}`);
}

function readCachedJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeProfileWithLocalFallback(snapshotProfile: UserProfile, uid: string): UserProfile {
  const companyCache = readCachedJson<{
    companyName?: string;
    site?: string;
    instagram?: string;
    linkedin?: string;
    tiktok?: string;
    blog?: string;
  }>(`neuroads_company_profile_${uid}`);

  const mergedOnboarding =
    snapshotProfile.onboarding && typeof snapshotProfile.onboarding === 'object'
      ? { ...(snapshotProfile.onboarding as Record<string, unknown>) }
      : {};

  const profileRecord = snapshotProfile as Record<string, unknown>;
  const profileDetails =
    profileRecord.profileDetails && typeof profileRecord.profileDetails === 'object'
      ? (profileRecord.profileDetails as Record<string, unknown>)
      : null;

  // Campos usados na validação de onboarding devem vir apenas do Firestore.
  const companyName = readString(
    profileRecord.companyName ??
      profileRecord.company ??
      mergedOnboarding.companyName ??
      mergedOnboarding.company ??
      profileDetails?.companyName ??
      profileDetails?.company
  );
  const site = readString(
    profileRecord.site ??
      profileRecord.website ??
      mergedOnboarding.site ??
      mergedOnboarding.website ??
      profileDetails?.site ??
      profileDetails?.website
  );
  const whatsapp = readString(
    profileRecord.whatsapp ??
      profileRecord.phone ??
      mergedOnboarding.whatsapp ??
      mergedOnboarding.phone ??
      profileDetails?.whatsapp ??
      profileDetails?.phone
  );
  const instagram = readString(profileRecord.instagram) || readString(companyCache?.instagram);
  const linkedin = readString(profileRecord.linkedin) || readString(companyCache?.linkedin);

  if (!readString(mergedOnboarding.companyName) && companyName) mergedOnboarding.companyName = companyName;
  if (!readString(mergedOnboarding.site) && site) mergedOnboarding.site = site;
  if (!readString(mergedOnboarding.whatsapp) && whatsapp) mergedOnboarding.whatsapp = whatsapp;
  if (!readString(mergedOnboarding.instagram) && instagram) mergedOnboarding.instagram = instagram;
  if (!readString(mergedOnboarding.linkedin) && linkedin) mergedOnboarding.linkedin = linkedin;

  return {
    ...snapshotProfile,
    ...(companyName ? ({ companyName } as Partial<UserProfile>) : {}),
    ...(site ? ({ site } as Partial<UserProfile>) : {}),
    ...(whatsapp ? ({ whatsapp } as Partial<UserProfile>) : {}),
    ...(instagram ? ({ instagram } as Partial<UserProfile>) : {}),
    ...(linkedin ? ({ linkedin } as Partial<UserProfile>) : {}),
    onboarding: mergedOnboarding,
  } as UserProfile;
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
              clearAccountDeletionFlag(firebaseUser.uid);
              const snapshotProfile = userDoc.data() as UserProfile;
              const normalizedFromCache = normalizeProfileWithLocalFallback(snapshotProfile, firebaseUser.uid);
              const registrationTimestamp =
                (typeof normalizedFromCache.registeredAt === 'number' && Number.isFinite(normalizedFromCache.registeredAt)
                  ? normalizedFromCache.registeredAt
                  : typeof normalizedFromCache.createdAt === 'number' && Number.isFinite(normalizedFromCache.createdAt)
                    ? normalizedFromCache.createdAt
                    : typeof normalizedFromCache.updatedAt === 'number' && Number.isFinite(normalizedFromCache.updatedAt)
                      ? normalizedFromCache.updatedAt
                      : Date.now());

              const normalizedProfile: UserProfile = {
                ...normalizedFromCache,
                registeredAt: registrationTimestamp,
              };

              setProfile(normalizedProfile);
              setPremiumSyncing(false);

              if (snapshotProfile.registeredAt !== registrationTimestamp) {
                void setDoc(
                  userRef,
                  {
                    registeredAt: registrationTimestamp,
                    updatedAt: Date.now(),
                  },
                  { merge: true }
                ).catch((writeErr) => {
                  if (!isFirestoreOfflineError(writeErr)) {
                    console.warn('Falha ao normalizar timestamp de cadastro:', writeErr);
                  }
                });
              }

              if (
                primaryEmail &&
                (
                  snapshotProfile.authEmail !== primaryEmail ||
                  (snapshotProfile as Record<string, unknown>).email !== primaryEmail
                )
              ) {
                void setDoc(
                  userRef,
                  {
                    authEmail: primaryEmail,
                    email: primaryEmail,
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
              if (isAccountDeletionInProgress(firebaseUser.uid)) {
                setPremiumSyncing(false);
                setProfile(null);
                setLoading(false);
                return;
              }

              setPremiumSyncing(true);
              const now = Date.now();
              const newProfile: UserProfile = {
                isPremium: false,
                usageStats: {},
                registeredAt: now,
                createdAt: now,
                updatedAt: now,
                ...(primaryEmail ? { authEmail: primaryEmail, email: primaryEmail } : {}),
              };

              void setDoc(
                userRef,
                newProfile,
                { merge: true }
              )
                .then(() => {
                  if (primaryEmail) {
                    syncToHostingerReach({
                      email: primaryEmail,
                      name: firebaseUser.displayName || 'Usuário NeuroAds',
                      tags: ['Usuários Ativos'],
                    }).catch(err => console.error('Reach sync failed:', err));
                  }
                })
                .catch((writeErr) => {
                  setPremiumSyncing(false);
                  setProfile(null);
                  setLoading(false);
                  if (isFirestoreOfflineError(writeErr)) {
                    console.info('Firestore temporariamente offline. Não foi possível concluir o cadastro.');
                  } else {
                    console.warn('Firestore write failed:', writeErr);
                  }
                });

              return;
            }

            setLoading(false);
          },
          (err) => {
            setPremiumSyncing(false);
            if (isFirestoreOfflineError(err)) {
              console.info('Firestore temporariamente offline. Não foi possível validar cadastro no Hub.');
            } else {
              console.warn('Firestore profile snapshot failed:', err);
            }
            setProfile(null);
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
    void appName;
    // No modelo atual, o uso continua ilimitado para usuários cadastrados.
    return true;
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
