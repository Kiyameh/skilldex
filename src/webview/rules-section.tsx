import type { CatalogItem } from "../shared/index.js";
import { RuleCard } from "./rule-card";

interface RulesSectionProps {
  rules: CatalogItem[];
  onToggleEnabled: (item: CatalogItem, nextEnabled: boolean) => void;
  onOpenItem: (item: CatalogItem) => void;
  pendingToggleIds?: ReadonlySet<string>;
}

const EMPTY_RULES_MESSAGE = "No hay rules todavía";

export function RulesSection({
  rules,
  onToggleEnabled,
  onOpenItem,
  pendingToggleIds,
}: RulesSectionProps) {
  const isEmpty = rules.length === 0;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto pr-1">
      {isEmpty ? (
        <p className="m-0 text-xs opacity-70">{EMPTY_RULES_MESSAGE}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {rules.map((rule) => (
            <li key={rule.id}>
              <RuleCard
                item={rule}
                onToggleEnabled={onToggleEnabled}
                onOpenItem={onOpenItem}
                toggleDisabled={pendingToggleIds?.has(rule.id) ?? false}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
