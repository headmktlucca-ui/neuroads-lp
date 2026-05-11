export interface SeoGeoAuditInput {
  websiteUrl: string;
  businessContext?: string;
}

export interface SeoGeoAuditResult {
  success: boolean;
  report?: string;
  error?: string;
  generatedAt?: string;
  model?: string;
  usedWebSearch?: boolean;
}
