import { useState } from "react";
import { CatalogTabs } from "./catalog-tabs";
import { ConnectionBadge } from "./connection-badge";
import { filterCatalogItems } from "./filter-catalog-items";
import { SearchIcon } from "./search-icon";
import { SkillDexLogo } from "./skilldex-logo";
import { useCatalog } from "./use-catalog";
import { useHostHandshake } from "./use-host-handshake";

const CATALOG_WAITING_LABEL = "Catálogo: esperando…";
const SEARCH_FIELD_LABEL = "Encuentra algo...";

export function App() {
  const handshakeStatus = useHostHandshake();
  const { catalog, toggleError, openError, pendingToggleIds, toggleItemEnabled, openItem } =
    useCatalog(handshakeStatus);
  const actionError = toggleError ?? openError;
  const [query, setQuery] = useState("");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 flex-col gap-2 border-b border-(--vscode-sideBarSectionHeader-border,#3c3c3c) px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <SkillDexLogo className="shrink-0 opacity-90" />
            <h1 className="m-0 text-base font-semibold tracking-wide">SkillDex</h1>
          </div>
          <ConnectionBadge status={handshakeStatus} />
        </div>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 opacity-70" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={SEARCH_FIELD_LABEL}
            aria-label={SEARCH_FIELD_LABEL}
            className="w-full rounded-full border-0 bg-transparent py-1 pr-3 pl-9 text-sm font-medium text-foreground outline-1 outline-(--vscode-input-background,#3c3c3c)"
          />
        </div>
      </header>
      <main
        className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-3"
        aria-label="SkillDex dashboard"
      >
        {actionError !== undefined ? (
          <p className="m-0 text-xs text-red-400" role="alert">
            {actionError}
          </p>
        ) : null}
        {catalog === undefined ? (
          <p className="m-0 text-xs opacity-80" aria-live="polite">
            {CATALOG_WAITING_LABEL}
          </p>
        ) : (
          <CatalogTabs
            skills={filterCatalogItems(catalog.skills, query, "skill")}
            rules={filterCatalogItems(catalog.rules, query, "rule")}
            unfilteredSkillsCount={catalog.skills.length}
            unfilteredRulesCount={catalog.rules.length}
            onToggleEnabled={toggleItemEnabled}
            onOpenItem={openItem}
            pendingToggleIds={pendingToggleIds}
          />
        )}
      </main>
    </div>
  );
}
