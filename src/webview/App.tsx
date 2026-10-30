import { useLayoutEffect, useRef, useState } from "react";
import raccoonImage from "../../media/racoon.png";
import { CatalogTabs } from "./catalog-tabs";
import { ChevronDownIcon } from "./chevron-down-icon";
import { ConnectionBadge } from "./connection-badge";
import { filterCatalogItems } from "./filter-catalog-items";
import { requestOpenSettings } from "./host-message-bridge";
import { SearchIcon } from "./search-icon";
import { SettingsIcon } from "./settings-icon";
import { SkillDexLogo } from "./skilldex-logo";
import { useCatalog } from "./use-catalog";
import { useHostHandshake } from "./use-host-handshake";
import { useLiveFeed } from "./use-live-feed";
import { useSkilldexSettings } from "./use-skilldex-settings";
import { useWorkspaceFolders } from "./use-workspace-folders";
import { workspaceFolderOptionLabel } from "./workspace-folder-option-label";

const CATALOG_WAITING_LABEL = "Catálogo: esperando…";
const PRODUCT_TITLE = "SkillDex";
const ANALYSIS_FOLDER_LABEL = "Carpeta de análisis";
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
  const { folders, selectedId, selectFolder } = useWorkspaceFolders();
  const liveFeed = useLiveFeed();
  const {
    catalog,
    toggleError,
    openError,
    pendingToggleIds,
    toggleItemEnabled,
    openItem,
    openLiveActivation,
    resetForFolderChange,
  } = useCatalog(handshakeStatus);
  const actionError = toggleError ?? openError;
  const [query, setQuery] = useState("");
  const [folderListOpen, setFolderListOpen] = useState(false);
  const previousSelectedIdRef = useRef<string | null>(null);
  const selectedFolder =
    folders.find((folder) => folder.id === selectedId) ??
    (folders.length === 1 ? folders[0] : undefined);
  const canChooseFolder = folders.length >= 2 && selectedFolder !== undefined;

  useLayoutEffect(() => {
    const previousSelectedId = previousSelectedIdRef.current;
    previousSelectedIdRef.current = selectedId;
    if (previousSelectedId === null || selectedId === null || previousSelectedId === selectedId)
      return;
    setQuery("");
    setFolderListOpen(false);
    resetForFolderChange();
  }, [selectedId, resetForFolderChange]);
  const bothSectionsHidden = settings !== undefined && !settings.showSkills && !settings.showRules;
  const waitingForCatalog =
    !bothSectionsHidden && (settings === undefined || catalog === undefined);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 flex-col gap-2 border-b border-(--vscode-sideBarSectionHeader-border,#3c3c3c) px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex min-w-0 items-center gap-2">
            <SkillDexLogo className="shrink-0 opacity-90" />
            <h1
              className={`m-0 min-w-0 text-base font-semibold tracking-wide ${canChooseFolder ? "" : "truncate"}`}
              title={canChooseFolder ? undefined : selectedFolder?.path}
            >
              {canChooseFolder ? (
                <button
                  type="button"
                  className="inline-flex min-w-0 max-w-full cursor-pointer items-center gap-1 bg-transparent p-0 text-left text-base font-semibold tracking-wide"
                  aria-haspopup="listbox"
                  aria-expanded={folderListOpen}
                  aria-label={`${ANALYSIS_FOLDER_LABEL}: ${selectedFolder.name}`}
                  title={selectedFolder.path}
                  onClick={() => setFolderListOpen((open) => !open)}
                >
                  <span className="truncate">{selectedFolder.name}</span>
                  <ChevronDownIcon className="shrink-0" />
                </button>
              ) : (
                (selectedFolder?.name ?? PRODUCT_TITLE)
              )}
            </h1>
            {canChooseFolder && folderListOpen ? (
              <ul
                role="listbox"
                aria-label={ANALYSIS_FOLDER_LABEL}
                className="absolute top-full left-0 z-10 mt-1 max-h-60 min-w-full overflow-auto rounded-md border border-(--vscode-sideBarSectionHeader-border,#3c3c3c) bg-(--vscode-sideBar-background,#252526) p-1"
              >
                {folders.map((folder) => (
                  <li
                    key={folder.id}
                    role="option"
                    aria-selected={folder.id === selectedFolder.id}
                    className="cursor-pointer truncate rounded-sm px-2 py-1 text-sm"
                    onClick={() => {
                      setFolderListOpen(false);
                      selectFolder(folder.id);
                    }}
                  >
                    {workspaceFolderOptionLabel(folder, folders)}
                  </li>
                ))}
              </ul>
            ) : null}
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
            showLiveArea={settings.showLiveArea}
            onToggleEnabled={toggleItemEnabled}
            onOpenItem={openItem}
            pendingToggleIds={pendingToggleIds}
            liveFeed={liveFeed}
            onOpenLiveActivation={openLiveActivation}
          />
        ) : null}
      </main>
    </div>
  );
}
