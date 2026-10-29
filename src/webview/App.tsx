import { useState } from "react";
import raccoonImage from "../../media/racoon.png";
import { CatalogTabs } from "./catalog-tabs";
import { ConnectionBadge } from "./connection-badge";
import { filterCatalogItems } from "./filter-catalog-items";
import { requestOpenSettings } from "./host-message-bridge";
import { SearchIcon } from "./search-icon";
import { SettingsIcon } from "./settings-icon";
import { SkillDexLogo } from "./skilldex-logo";
import { useCatalog } from "./use-catalog";
import { useHostHandshake } from "./use-host-handshake";
import { useSkilldexSettings } from "./use-skilldex-settings";

const CATALOG_WAITING_LABEL = "Catálogo: esperando…";
const SEARCH_FIELD_LABEL = "Encuentra algo...";
const SETTINGS_BUTTON_LABEL = "Configuración";
const NO_PANELS_MESSAGE = "No tienes ningún panel seleccionado, así que toma un mapache :D";
const OPEN_SETTINGS_LABEL = "Ir a la config";
const RACCOON_LABEL = "Mapache";

const HEADER_ICON_BUTTON_CLASS =
  "inline-flex cursor-pointer items-center rounded-md p-1 hover:bg-(--vscode-toolbar-hoverBackground,#ffffff14) focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--vscode-focusBorder,#007fd4)";

export function App() {
  const handshakeStatus = useHostHandshake();
  const settings = useSkilldexSettings();
  const { catalog, toggleError, openError, pendingToggleIds, toggleItemEnabled, openItem } =
    useCatalog(handshakeStatus);
  const actionError = toggleError ?? openError;
  const [query, setQuery] = useState("");
  const bothSectionsHidden = settings !== undefined && !settings.showSkills && !settings.showRules;
  const waitingForCatalog =
    !bothSectionsHidden && (settings === undefined || catalog === undefined);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 flex-col gap-2 border-b border-(--vscode-sideBarSectionHeader-border,#3c3c3c) px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <SkillDexLogo className="shrink-0 opacity-90" />
            <h1 className="m-0 text-base font-semibold tracking-wide">SkillDex</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label={SETTINGS_BUTTON_LABEL}
              className={HEADER_ICON_BUTTON_CLASS}
              onClick={requestOpenSettings}
            >
              <SettingsIcon />
            </button>
            <ConnectionBadge status={handshakeStatus} />
          </div>
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
        {waitingForCatalog ? (
          <p className="m-0 text-xs opacity-80" aria-live="polite">
            {CATALOG_WAITING_LABEL}
          </p>
        ) : null}
        {bothSectionsHidden ? (
          <div className="flex flex-col items-start gap-3">
            <p className="m-0 text-xs opacity-80">{NO_PANELS_MESSAGE}</p>
            <img src={raccoonImage} alt={RACCOON_LABEL} className="w-40" />
            <button
              type="button"
              className="cursor-pointer rounded-md border border-(--vscode-sideBarSectionHeader-border,#3c3c3c) px-2 py-1 text-xs"
              onClick={requestOpenSettings}
            >
              {OPEN_SETTINGS_LABEL}
            </button>
          </div>
        ) : null}
        {settings !== undefined && catalog !== undefined && !bothSectionsHidden ? (
          <CatalogTabs
            skills={filterCatalogItems(catalog.skills, query, "skill")}
            rules={filterCatalogItems(catalog.rules, query, "rule")}
            unfilteredSkillsCount={catalog.skills.length}
            unfilteredRulesCount={catalog.rules.length}
            showSkills={settings.showSkills}
            showRules={settings.showRules}
            onToggleEnabled={toggleItemEnabled}
            onOpenItem={openItem}
            pendingToggleIds={pendingToggleIds}
          />
        ) : null}
      </main>
    </div>
  );
}
