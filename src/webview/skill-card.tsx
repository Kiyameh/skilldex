import type { CatalogItem } from "../shared/index.js";
import { EnabledToggle } from "./enabled-toggle";

interface SkillCardProps {
  item: CatalogItem;
  onToggleEnabled: (item: CatalogItem, nextEnabled: boolean) => void;
  toggleDisabled?: boolean;
}

const MISSING_DESCRIPTION = "Sin descripción";

export function SkillCard({ item, onToggleEnabled, toggleDisabled = false }: SkillCardProps) {
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
      <div className="max-h-0 overflow-hidden transition-[max-height] duration-300 ease-out group-hover:max-h-24 group-focus-within:max-h-24">
        <p className="m-0 pt-1.5 text-xs opacity-80">{description}</p>
      </div>
    </article>
  );
}
