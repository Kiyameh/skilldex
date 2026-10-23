import type { CatalogItem } from "../shared/index.js";
import { EditButton } from "./edit-button";
import { EnabledToggle } from "./enabled-toggle";

interface RuleCardProps {
  item: CatalogItem;
  onToggleEnabled: (item: CatalogItem, nextEnabled: boolean) => void;
  onOpenItem: (item: CatalogItem) => void;
  toggleDisabled?: boolean;
}

const MISSING_DESCRIPTION = "Sin descripción";
const EMPTY_GLOBS_LABEL = "Sin globs";

export function RuleCard({
  item,
  onToggleEnabled,
  onOpenItem,
  toggleDisabled = false,
}: RuleCardProps) {
  const title = item.title ?? item.id;
  const description = item.description ?? MISSING_DESCRIPTION;
  const globs = item.globs ?? [];
  const hasGlobs = globs.length > 0;

  return (
    <article
      className="group rounded border border-(--vscode-sideBarSectionHeader-border,#3c3c3c) px-3 py-2"
      aria-label={title}
    >
      <header className="flex items-start justify-between gap-2">
        <h3 className="m-0 text-sm font-medium">{title}</h3>
        <EnabledToggle
          enabled={item.enabled}
          disabled={toggleDisabled}
          onToggle={(nextEnabled) => onToggleEnabled(item, nextEnabled)}
        />
      </header>
      <div className="mt-3 flex items-start justify-between gap-3">
        <p className="m-0 min-w-0 flex-1 text-xs opacity-80">{description}</p>
        <EditButton onClick={() => onOpenItem(item)} />
      </div>
      {hasGlobs ? (
        <ul className="m-0 mt-2 list-none p-0 text-xs opacity-70" aria-label="Globs">
          {globs.map((glob) => (
            <li key={glob} className="font-mono">
              {glob}
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 mt-2 text-xs opacity-60">{EMPTY_GLOBS_LABEL}</p>
      )}
    </article>
  );
}
