export type DocumentId = string;
export type ProductType = 'pen' | 'sum' | 'glimpse';

export interface BaseDocumentMetadata {
  id: DocumentId;
  title: string;
  type: ProductType;
  createdAt: number;
  updatedAt: number;
  version: number;
  author?: string;
  tags?: string[];
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system' | 'glass-dark' | 'glass-frost';
  locale: string;
  autoSaveIntervalMs: number;
  enableLocalAi: boolean;
  aiProviderEndpoint?: string;
}

export function generateId(prefix: string = 'oh'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}
