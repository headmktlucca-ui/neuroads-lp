// Company data type — each user can have multiple companies
// stored as users/{uid}/companies/{companyId} in Firestore

export interface Company {
  id: string;           // Firestore document ID
  companyName: string;
  site: string;
  instagram: string;
  linkedin: string;
  tiktok: string;
  blog: string;
  whatsapp: string;
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
  createdAt: number;
  updatedAt: number;
}

export type CompanyFormData = Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'connections'>;
