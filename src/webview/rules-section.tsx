import type { CatalogItem } from "../shared/index.js";
import { RuleCard } from "./rule-card";

interface RulesSectionProps {
  rules: CatalogItem[];
  onToggleEnabled: (item: CatalogItem, nextEnabled: boolean) => void;
  pendingToggleIds?: ReadonlySet<string>;
}

const EMPTY_RULES_MESSAGE = "No hay rules todavía";

export function RulesSection({ rules, onToggleEnabled, pendingToggleIds }: RulesSectionProps) {
  const isEmpty = rules.length === 0;

  return (
    <section aria-labelledby="rules-heading" className="flex min-h-0 flex-1 flex-col">
      <h2
        id="rules-heading"
        className="m-0 mb-2 shrink-0 text-sm font-medium tracking-wide opacity-90"
      >
        Rules
      </h2>
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
                  toggleDisabled={pendingToggleIds?.has(rule.id) ?? false}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
