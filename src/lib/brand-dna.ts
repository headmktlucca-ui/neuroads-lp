import { doc, type Firestore } from 'firebase/firestore';

export type BrandDnaMemoryRecord = {
  siteUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  reportMarkdown: string;
  structuredPresentation: unknown;
  sources: unknown;
  sourceAgent: string;
  savedByUserId: string;
  generatedAt: string;
  updatedAt: number;
};

export function getBrandDnaMemoryRef(db: Firestore, userId: string) {
  return doc(db, 'users', userId, 'brand_memory', 'dna_da_marca');
}

