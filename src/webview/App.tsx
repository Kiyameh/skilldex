import { ConnectionBadge } from "./connection-badge";
import { RulesSection } from "./rules-section";
import { SkillDexLogo } from "./skilldex-logo";
import { SkillsSection } from "./skills-section";
import { useCatalog } from "./use-catalog";
import { useHostHandshake } from "./use-host-handshake";

const CATALOG_WAITING_LABEL = "Catálogo: esperando…";

export function App() {
  const handshakeStatus = useHostHandshake();
  const { catalog, toggleError, openError, pendingToggleIds, toggleItemEnabled, openItem } =
    useCatalog(handshakeStatus);
  const actionError = toggleError ?? openError;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-(--vscode-sideBarSectionHeader-border,#3c3c3c) px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <SkillDexLogo className="shrink-0 opacity-90" />
          <h1 className="m-0 text-base font-semibold tracking-wide">SkillDex</h1>
        </div>
        <ConnectionBadge status={handshakeStatus} />
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
          <>
            <SkillsSection
              skills={catalog.skills}
              onToggleEnabled={toggleItemEnabled}
              onOpenItem={openItem}
              pendingToggleIds={pendingToggleIds}
            />
            <RulesSection
              rules={catalog.rules}
              onToggleEnabled={toggleItemEnabled}
              onOpenItem={openItem}
              pendingToggleIds={pendingToggleIds}
            />
          </>
        )}
      </main>
    </div>
  );
}
