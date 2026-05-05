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
import { isAdminEmail } from '../lib/admin-auth';

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
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkUsageLimit: (appName: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

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
              console.warn('Firestore write failed (offline?):', writeErr);
            }
            setProfile(newProfile);

            if (firebaseUser.email) {
              syncToHostingerReach({
                email: firebaseUser.email,
                name: firebaseUser.displayName || 'Usuário NeuroAds',
                tags: ['Usuários Ativos'],
              }).catch(err => console.error('Reach sync failed:', err));
            }
          }
        } catch (err) {
          // Firestore offline or quota error — set minimal profile so the app still opens
          console.warn('Firestore getDoc failed (offline?):', err);
          setProfile({ isPremium: false, usageStats: {} });
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const loginWithGoogle = async () => {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
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
    <AuthContext.Provider value={{ user, profile, loading, isAdmin: isAdminEmail(user?.email), loginWithGoogle, logout, checkUsageLimit }}>
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
