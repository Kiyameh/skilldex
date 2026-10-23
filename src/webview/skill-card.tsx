import type { CatalogItem } from "../shared/index.js";
import { EditButton } from "./edit-button";
import { EnabledToggle } from "./enabled-toggle";

interface SkillCardProps {
  item: CatalogItem;
  onToggleEnabled: (item: CatalogItem, nextEnabled: boolean) => void;
  onOpenItem: (item: CatalogItem) => void;
  toggleDisabled?: boolean;
}

const MISSING_DESCRIPTION = "Sin descripción";

export function SkillCard({
  item,
  onToggleEnabled,
  onOpenItem,
  toggleDisabled = false,
}: SkillCardProps) {
  const name = item.title ?? item.id;
  const description = item.description ?? MISSING_DESCRIPTION;

  return (
    <article
      className="group rounded border border-(--vscode-sideBarSectionHeader-border,#3c3c3c) px-3 py-2"
      aria-label={name}
    >
      <header className="flex items-center justify-between gap-2">
        <h3 className="m-0 truncate text-sm font-medium">{name}</h3>
        <EnabledToggle
          enabled={item.enabled}
          disabled={toggleDisabled}
          onToggle={(nextEnabled) => onToggleEnabled(item, nextEnabled)}
        />
      </header>
      <div className="max-h-0 overflow-hidden transition-[max-height] duration-300 ease-out group-hover:max-h-28 group-focus-within:max-h-28">
        <div className="flex items-start justify-between gap-3 pt-3">
          <p className="m-0 min-w-0 flex-1 text-xs opacity-80">{description}</p>
          <EditButton onClick={() => onOpenItem(item)} />
        </div>
      </div>
    </article>
  );
}
