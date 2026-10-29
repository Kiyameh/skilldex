import type { CatalogItem, CatalogItemKind } from "../shared/index.js";

function itemMatchesQuery(
  item: CatalogItem,
  normalizedQuery: string,
  kind: CatalogItemKind,
): boolean {
  const visibleName = (item.title ?? item.id).toLowerCase();
  if (visibleName.includes(normalizedQuery)) return true;
  if (kind !== "skill") return false;
  if (typeof item.description !== "string") return false;
  return item.description.toLowerCase().includes(normalizedQuery);
}

export function filterCatalogItems(
  items: CatalogItem[],
  query: string,
  kind: CatalogItemKind,
): CatalogItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) return items;
  return items.filter((item) => itemMatchesQuery(item, normalizedQuery, kind));
}
