'use client';

/**
 * useCompanyMigration
 *
 * Runs once per user to migrate legacy single-company data from the root
 * profile document into the new `companies` subcollection.
 *
 * Only executes if the `companies` subcollection is empty AND the user has
 * existing company data on the profile root.
 *
 * A localStorage flag prevents running more than once per browser session.
 */

import { useEffect } from 'react';
import {
  doc,
  setDoc,
  collection,
  getDocs,
  limit,
  query,
} from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';
import type { User } from 'firebase/auth';
import type { Company } from '../types/company-types';

const MIGRATION_FLAG_PREFIX = 'neuroads_company_migrated_';

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

interface LegacyProfile {
  companyName?: string;
  company?: string;
  site?: string;
  website?: string;
  instagram?: string;
  linkedin?: string;
  whatsapp?: string;
  phone?: string;
  connections?: Record<string, unknown>;
  onboarding?: Record<string, unknown>;
  profileDetails?: Record<string, unknown>;
}

function isMigrationDone(uid: string): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(`${MIGRATION_FLAG_PREFIX}${uid}`) === '1';
}

function markMigrationDone(uid: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(`${MIGRATION_FLAG_PREFIX}${uid}`, '1');
}

export function useCompanyMigration(
  user: User | null,
  profile: LegacyProfile | null
): void {
  useEffect(() => {
    if (!user || !profile) return;
    if (isMigrationDone(user.uid)) return;

    const uid = user.uid;

    async function migrate() {
      try {
        const db = getFirebaseDb();
        const companiesRef = collection(db, 'users', uid, 'companies');
        const existing = await getDocs(query(companiesRef, limit(1)));

        // If companies already exist, nothing to migrate
        if (!existing.empty) {
          markMigrationDone(uid);
          return;
        }

        const p = profile as LegacyProfile;
        const onboarding = (p.onboarding || {}) as Record<string, unknown>;
        const profileDetails = (p.profileDetails || {}) as Record<string, unknown>;

        const companyName = readString(
          p.companyName ??
          p.company ??
          onboarding.companyName ??
          onboarding.company ??
          profileDetails.companyName ??
          profileDetails.company
        );

        // Skip migration if no meaningful company name exists
        if (!companyName || companyName.toLowerCase() === 'sua empresa') {
          markMigrationDone(uid);
          return;
        }

        const site = readString(
          p.site ?? p.website ??
          onboarding.site ?? onboarding.website ??
          profileDetails.site ?? profileDetails.website
        );

        const instagram = readString(
          p.instagram ??
          (onboarding.instagram as string | undefined) ??
          (profileDetails.instagram as string | undefined)
        );

        const linkedin = readString(
          p.linkedin ??
          (onboarding.linkedin as string | undefined) ??
          (profileDetails.linkedin as string | undefined)
        );

        const whatsapp = readString(
          p.whatsapp ?? p.phone ??
          (onboarding.whatsapp as string | undefined) ??
          (onboarding.phone as string | undefined)
        );

        const now = Date.now();
        const defaultCompany: Omit<Company, 'id'> = {
          companyName,
          site: site || '',
          instagram: instagram || '',
          linkedin: linkedin || '',
          tiktok: '',
          blog: '',
          whatsapp: whatsapp || '',
          connections: (p.connections || {}) as Company['connections'],
          createdAt: now,
          updatedAt: now,
        };

        const defaultDocRef = doc(companiesRef, 'default');
        await setDoc(defaultDocRef, defaultCompany);

        // Set activeCompanyId on the root profile
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, { activeCompanyId: 'default', updatedAt: now }, { merge: true });

        markMigrationDone(uid);
      } catch (err) {
        console.warn('[CompanyMigration] Failed to migrate company data:', err);
        // Don't mark as done so it retries next session
      }
    }

    void migrate();
  }, [user, profile]);
}
