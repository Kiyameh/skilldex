export const CATALOG_ITEM_KINDS = ["rule", "skill"] as const;

export type CatalogItemKind = (typeof CATALOG_ITEM_KINDS)[number];

export interface CatalogItem {
  id: string;
  kind: CatalogItemKind;
  path: string;
  enabled: boolean;
  title?: string;
  description?: string;
  globs?: string[];
  sections?: string[];
  version?: string;
  category?: string;
  characterCount?: number;
}

export interface CatalogPayload {
  skills: CatalogItem[];
  rules: CatalogItem[];
}
