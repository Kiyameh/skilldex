import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { CatalogItem } from "../shared/index.js";
import { RulesSection } from "./rules-section";
import { SkillsSection } from "./skills-section";

const CATALOG_TAB_IDS = ["skills", "rules"] as const;

type CatalogTabId = (typeof CATALOG_TAB_IDS)[number];

const CATALOG_TAB_LABELS: Record<CatalogTabId, string> = {
  skills: "Skills",
  rules: "Rules",
};

const DEFAULT_CATALOG_TAB: CatalogTabId = "skills";

interface CatalogTabsProps {
  skills: CatalogItem[];
  rules: CatalogItem[];
  unfilteredSkillsCount: number;
  unfilteredRulesCount: number;
  showSkills: boolean;
  showRules: boolean;
  onToggleEnabled: (item: CatalogItem, nextEnabled: boolean) => void;
  onOpenItem: (item: CatalogItem) => void;
  pendingToggleIds?: ReadonlySet<string> | undefined;
}

function tabDomId(tabId: CatalogTabId): string {
  return `catalog-tab-${tabId}`;
}

function panelDomId(tabId: CatalogTabId): string {
  return `catalog-panel-${tabId}`;
}

function nextTabIndex(currentIndex: number, key: string): number | undefined {
  if (key === "ArrowRight" || key === "ArrowDown")
    return (currentIndex + 1) % CATALOG_TAB_IDS.length;
  if (key === "ArrowLeft" || key === "ArrowUp")
    return (currentIndex - 1 + CATALOG_TAB_IDS.length) % CATALOG_TAB_IDS.length;
  if (key === "Home") return 0;
  if (key === "End") return CATALOG_TAB_IDS.length - 1;
  return undefined;
}

export function CatalogTabs({
  skills,
  rules,
  unfilteredSkillsCount,
  unfilteredRulesCount,
  showSkills,
  showRules,
  onToggleEnabled,
  onOpenItem,
  pendingToggleIds,
}: CatalogTabsProps) {
  const [selectedTab, setSelectedTab] = useState<CatalogTabId>(DEFAULT_CATALOG_TAB);
  const tabButtonRefs = useRef<Partial<Record<CatalogTabId, HTMLButtonElement>>>({});

  if (showSkills && !showRules) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <SkillsSection
          skills={skills}
          unfilteredCount={unfilteredSkillsCount}
          onToggleEnabled={onToggleEnabled}
          onOpenItem={onOpenItem}
          pendingToggleIds={pendingToggleIds}
        />
      </div>
    );
  }

  if (!showSkills && showRules) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <RulesSection
          rules={rules}
          unfilteredCount={unfilteredRulesCount}
          onToggleEnabled={onToggleEnabled}
          onOpenItem={onOpenItem}
          pendingToggleIds={pendingToggleIds}
        />
      </div>
    );
  }

  if (!showSkills && !showRules) return null;

  function selectTab(tabId: CatalogTabId, shouldFocus: boolean) {
    setSelectedTab(tabId);
    if (shouldFocus) tabButtonRefs.current[tabId]?.focus();
  }

  function handleTabListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = CATALOG_TAB_IDS.indexOf(selectedTab);
    const tabIndex = nextTabIndex(currentIndex, event.key);
    if (tabIndex === undefined) return;

    const tabId = CATALOG_TAB_IDS[tabIndex];
    if (tabId === undefined) return;

    event.preventDefault();
    selectTab(tabId, true);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div
        role="tablist"
        aria-label="Catálogo"
        className="grid shrink-0 grid-cols-2 border-b border-(--vscode-sideBarSectionHeader-border,#3c3c3c)"
        onKeyDown={handleTabListKeyDown}
      >
        {CATALOG_TAB_IDS.map((tabId) => {
          const isSelected = selectedTab === tabId;
          const selectedClassName = isSelected
            ? "border-(--vscode-focusBorder,#007acc) opacity-100"
            : "border-transparent opacity-60 hover:opacity-100";

          return (
            <button
              key={tabId}
              ref={(element) => {
                if (element === null) {
                  delete tabButtonRefs.current[tabId];
                  return;
                }
                tabButtonRefs.current[tabId] = element;
              }}
              id={tabDomId(tabId)}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={panelDomId(tabId)}
              tabIndex={isSelected ? 0 : -1}
              className={`cursor-pointer border-b-2 px-2 py-1.5 text-sm font-medium tracking-wide focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--vscode-focusBorder,#007fd4) ${selectedClassName}`}
              onClick={() => selectTab(tabId, false)}
            >
              {CATALOG_TAB_LABELS[tabId]}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={panelDomId(selectedTab)}
        aria-labelledby={tabDomId(selectedTab)}
        className="flex min-h-0 flex-1 flex-col"
      >
        {selectedTab === "skills" ? (
          <SkillsSection
            skills={skills}
            unfilteredCount={unfilteredSkillsCount}
            onToggleEnabled={onToggleEnabled}
            onOpenItem={onOpenItem}
            pendingToggleIds={pendingToggleIds}
          />
        ) : (
          <RulesSection
            rules={rules}
            unfilteredCount={unfilteredRulesCount}
            onToggleEnabled={onToggleEnabled}
            onOpenItem={onOpenItem}
            pendingToggleIds={pendingToggleIds}
          />
        )}
      </div>
    </div>
  );
}
