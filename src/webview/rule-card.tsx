import type { CatalogItem } from "../shared/index.js";
import { EditButton } from "./edit-button";
import { EnabledToggle } from "./enabled-toggle";
import { SkullIcon } from "./skull-icon";

interface RuleCardProps {
  item: CatalogItem;
  onToggleEnabled: (item: CatalogItem, nextEnabled: boolean) => void;
  onOpenItem: (item: CatalogItem) => void;
  toggleDisabled?: boolean;
}

const NO_SECTIONS_LABEL = "No hay secciones";
const EMPTY_GLOBS_LABEL = "Sin globs";
const ALWAYS_APPLY_LABEL = "AlwaysApply";
const NOT_APPLY_LABEL = "NotApply";

export function RuleCard({
  item,
  onToggleEnabled,
  onOpenItem,
  toggleDisabled = false,
}: RuleCardProps) {
  const title = item.title ?? item.id;
  const sections = item.sections ?? [];
  const hasSections = sections.length > 0;
  const globs = item.globs ?? [];
  const hasGlobs = globs.length > 0;

  return (
    <article
      className="group rounded border border-(--vscode-sideBarSectionHeader-border,#3c3c3c) px-3 py-2"
      aria-label={title}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <SkullIcon className="size-3.5 shrink-0 text-rose-400" />
          <h3 className="m-0 min-w-0 text-sm font-medium">{title}</h3>
        </div>
        <EnabledToggle
          enabled={item.enabled}
          disabled={toggleDisabled}
          enabledLabel={ALWAYS_APPLY_LABEL}
          disabledLabel={NOT_APPLY_LABEL}
          onToggle={(nextEnabled) => onToggleEnabled(item, nextEnabled)}
        />
      </header>
      <div className="mt-3 flex items-start justify-between gap-3">
        {hasSections ? (
          <ol
            className="m-0 min-w-0 flex-1 list-decimal pl-5 text-xs opacity-80"
            aria-label="Secciones"
          >
            {sections.map((section) => (
              <li key={section}>{section}</li>
            ))}
          </ol>
        ) : (
          <p className="m-0 min-w-0 flex-1 text-xs opacity-80">{NO_SECTIONS_LABEL}</p>
        )}
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
