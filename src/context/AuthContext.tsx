'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useMemo } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  signOut 
} from 'firebase/auth';
import { getFirebaseAuth, getFirebaseDb } from '../lib/firebase';
import { doc, onSnapshot, setDoc, collection, query } from 'firebase/firestore';
import { syncToHostingerReach } from '../app/actions/hostinger';
import { getPrimaryAuthEmail, isAdminEmail, isSuperAdminEmail } from '../lib/admin-auth';

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
    accountId?: string; 
    accessToken?: string; 
    isActive: boolean;
    provider?: string;
    refreshToken?: string;
    connectedAt?: number;
    updatedAt?: number;
    expiresIn?: number;
    expiresAt?: number;
    metadata?: Record<string, unknown>;
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
  isSuperAdmin: boolean;
  actingUid: string | null;
  setActingUid: (uid: string | null) => void;
  availableCompanies: Array<{ uid: string; companyName: string; email: string }>;
  hasPasswordProvider: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
  registerWithEmailPassword: (email: string, password: string) => Promise<void>;
  linkCurrentUserWithEmailPassword: (email: string, password: string) => Promise<void>;
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

  const [actingUid, setActingUidState] = useState<string | null>(null);
  const [availableCompanies, setAvailableCompanies] = useState<Array<{ uid: string; companyName: string; email: string }>>([]);

  const isSuperAdmin = useMemo(() => isSuperAdminEmail(userEmail), [userEmail]);

  // Load actingUid from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('neuroads_acting_uid');
      if (stored) {
        setActingUidState(stored);
      }
    }
  }, []);

  const setActingUid = (uid: string | null) => {
    setActingUidState(uid);
    if (typeof window !== 'undefined') {
      if (uid) {
        window.localStorage.setItem('neuroads_acting_uid', uid);
      } else {
        window.localStorage.removeItem('neuroads_acting_uid');
      }
    }
  };

  // Fetch all companies if the user is Super Admin
  useEffect(() => {
    if (!user || !isSuperAdmin) {
      setAvailableCompanies([]);
      return;
    }

    const db = getFirebaseDb();
    const usersQuery = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const companiesList: Array<{ uid: string; companyName: string; email: string }> = [];
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const email = String(data.authEmail || data.email || '').trim();
          const profileDetails = data.profileDetails as Record<string, unknown> | null;
          const onboarding = data.onboarding as Record<string, unknown> | null;

          const companyName = String(
            data.companyName ??
            data.company ??
            onboarding?.companyName ??
            onboarding?.company ??
            profileDetails?.companyName ??
            profileDetails?.company ??
            ''
          ).trim();

          if (email && companyName && companyName.toLowerCase() !== 'sua empresa' && companyName !== 'undefined') {
            companiesList.push({
              uid: doc.id,
              companyName,
              email,
            });
          }
        });

        // Sort A-Z by company name
        companiesList.sort((a, b) => a.companyName.localeCompare(b.companyName, 'pt-BR'));
        setAvailableCompanies(companiesList);
      },
      (err) => {
        console.warn('Failed to listen to available companies:', err);
      }
    );

    return () => unsubscribe();
  }, [user, isSuperAdmin]);

  const authInitialized = useRef(false);

  // Auth state listener
  useEffect(() => {
    const auth = getFirebaseAuth();
    
    // Captura erros ou resultados de redirecionamentos (importante para o fallback do COOP)
    getRedirectResult(auth).then((result) => {
      if (result) {
        console.log("Login por redirecionamento concluído com sucesso!");
      }
    }).catch((error) => {
      console.error("Erro após retorno do signInWithRedirect:", error);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      authInitialized.current = true;
      setUser(firebaseUser);
      const primaryEmail = await resolvePrimaryAuthEmail(firebaseUser);
      setUserEmail(primaryEmail);
      if (firebaseUser && primaryEmail) {
        cacheAuthEmail(firebaseUser.uid, primaryEmail);
      }

      if (!firebaseUser) {
        setProfile(null);
        setPremiumSyncing(false);
        premiumSyncAttemptRef.current = {};
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Profile real-time listener (handles regular or acting user profile subscription)
  useEffect(() => {
    if (!user) {
      setProfile(null);
      if (authInitialized.current) {
        setLoading(false);
      }
      return;
    }

    const db = getFirebaseDb();
    setLoading(true);

    const targetUid = (isSuperAdmin && actingUid) ? actingUid : user.uid;
    const userRef = doc(db, 'users', targetUid);

    const unsubscribe = onSnapshot(
      userRef,
      (userDoc) => {
        if (userDoc.exists()) {
          clearAccountDeletionFlag(targetUid);
          const snapshotProfile = userDoc.data() as UserProfile;
          const normalizedFromCache = normalizeProfileWithLocalFallback(snapshotProfile, targetUid);
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

          // Only auto-correct profile details if operating on own profile
          if (targetUid === user.uid) {
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
              userEmail &&
              (
                snapshotProfile.authEmail !== userEmail ||
                (snapshotProfile as Record<string, unknown>).email !== userEmail
              )
            ) {
              void setDoc(
                userRef,
                {
                  authEmail: userEmail,
                  email: userEmail,
                  updatedAt: Date.now(),
                },
                { merge: true }
              ).catch((writeErr) => {
                if (!isFirestoreOfflineError(writeErr)) {
                  console.warn('Falha ao atualizar e-mail primário no perfil:', writeErr);
                }
              });
            }
          }
        } else {
          // If own profile doesn't exist, create it
          if (targetUid === user.uid) {
            if (isAccountDeletionInProgress(user.uid)) {
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
              ...(userEmail ? { authEmail: userEmail, email: userEmail } : {}),
            };

            void setDoc(
              userRef,
              newProfile,
              { merge: true }
            )
              .then(() => {
                if (userEmail) {
                  syncToHostingerReach({
                    email: userEmail,
                    name: user.displayName || 'Usuário NeuroAds',
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
          } else {
            // Acting profile target not found
            setProfile(null);
            setPremiumSyncing(false);
          }
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

    return () => unsubscribe();
  }, [user, userEmail, actingUid, isSuperAdmin]);

  // Intercept the user object with a Proxy to fake the uid when actingUid is active
  const activeUser = useMemo(() => {
    if (!user || !actingUid || !isSuperAdmin) return user;
    return new Proxy(user, {
      get(target, prop, receiver) {
        if (prop === 'uid') {
          return actingUid;
        }
        const value = Reflect.get(target, prop, receiver);
        if (typeof value === 'function') {
          return value.bind(target);
        }
        return value;
      }
    });
  }, [user, actingUid, isSuperAdmin]);

  const loginWithGoogle = async () => {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      // Tenta abrir via popup primeiro
      await signInWithPopup(auth, provider);
    } catch (error: unknown) {
      console.warn('Falha no signInWithPopup (possível bloqueio de COOP/Popups). Usando fallback de redirecionamento...', error);
      // Fallback garantido para redirecionamento em qualquer erro de popup
      await signInWithRedirect(auth, provider);
    }
  };

  const loginWithEmailPassword = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    const credentials = await signInWithEmailAndPassword(auth, email.trim(), password);
    const primaryEmail = await resolvePrimaryAuthEmail(credentials.user);
    if (primaryEmail) {
      setUserEmail(primaryEmail);
      cacheAuthEmail(credentials.user.uid, primaryEmail);
    }
  };

  const registerWithEmailPassword = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    const credentials = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const primaryEmail = await resolvePrimaryAuthEmail(credentials.user);
    if (primaryEmail) {
      setUserEmail(primaryEmail);
      cacheAuthEmail(credentials.user.uid, primaryEmail);
    }
  };

  const linkCurrentUserWithEmailPassword = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Sessão de autenticação não encontrada. Faça login novamente.');
    }

    const normalizedEmail = email.trim() || userEmail?.trim() || currentUser.email?.trim() || '';
    if (!normalizedEmail) {
      throw new Error('Não foi possível identificar um e-mail para vincular esta conta.');
    }

    const alreadyLinked = currentUser.providerData.some((provider) => provider.providerId === 'password');
    if (alreadyLinked) {
      return;
    }

    const credential = EmailAuthProvider.credential(normalizedEmail, password);
    await linkWithCredential(currentUser, credential);

    setUserEmail(normalizedEmail);
    cacheAuthEmail(currentUser.uid, normalizedEmail);
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('neuroads_acting_uid');
    }
    setActingUidState(null);
    await signOut(auth);
  };

  const checkUsageLimit = async (appName: string): Promise<boolean> => {
    void appName;
    // No modelo atual, o uso continua ilimitado para usuários cadastrados.
    return true;
  };

  const hasPasswordProvider = Boolean(user?.providerData.some((provider) => provider.providerId === 'password'));

  return (
    <AuthContext.Provider
      value={{
        user: activeUser,
        userEmail: (isSuperAdmin && actingUid) 
          ? (typeof profile?.authEmail === 'string' ? profile.authEmail : typeof profile?.email === 'string' ? profile.email : userEmail) 
          : userEmail,
        profile,
        loading,
        premiumSyncing,
        isAdmin: isAdminEmail(userEmail),
        isSuperAdmin,
        actingUid,
        setActingUid,
        availableCompanies,
        hasPasswordProvider,
        loginWithGoogle,
        loginWithEmailPassword,
        registerWithEmailPassword,
        linkCurrentUserWithEmailPassword,
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
