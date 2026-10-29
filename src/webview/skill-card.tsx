import type { CatalogItem } from "../shared/index.js";
import { EditButton } from "./edit-button";
import { EnabledToggle } from "./enabled-toggle";
import { formatSkillInvocationSize } from "./format-skill-invocation-size";
import { WandIcon } from "./wand-icon";

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
  const version = item.version;
  const sizeLine = formatSkillInvocationSize(item.characterCount ?? 0);

  return (
    <article
      className="group rounded border border-(--vscode-sideBarSectionHeader-border,#3c3c3c) px-3 py-2"
      aria-label={name}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <WandIcon className="size-3.5 shrink-0 text-teal-400" />
          <div className="flex min-w-0 items-baseline gap-2">
            <h4 className="m-0 truncate text-sm font-medium">{name}</h4>
            {version !== undefined ? (
              <span className="shrink-0 text-xs opacity-70">{version}</span>
            ) : null}
          </div>
        </div>
        <EnabledToggle
          enabled={item.enabled}
          disabled={toggleDisabled}
          onToggle={(nextEnabled) => onToggleEnabled(item, nextEnabled)}
        />
      </header>
      <div className="max-h-0 overflow-hidden transition-[max-height] duration-300 ease-out group-hover:max-h-40 group-focus-within:max-h-40">
        <div className="flex items-start justify-between gap-3 pt-3">
          <div className="min-w-0 flex-1">
            <p className="m-0 text-xs opacity-80">{description}</p>
            <p className="m-0 mt-1 text-xs text-blue-500">{sizeLine}</p>
          </div>
          <EditButton onClick={() => onOpenItem(item)} />
        </div>
      </div>
    </article>
  );
}
