import { useCatalog } from "./use-catalog";
import { useHostHandshake } from "./use-host-handshake";

export function App() {
  const handshakeStatus = useHostHandshake();
  const catalog = useCatalog(handshakeStatus);
  const handshakeLabel = handshakeStatus === "connected" ? "Host: conectado" : "Host: esperando";
  const skillCount = catalog?.skills.length ?? 0;
  const ruleCount = catalog?.rules.length ?? 0;
  const countsLabel =
    catalog === undefined
      ? "Catálogo: esperando…"
      : `${skillCount} skills / ${ruleCount} rules`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-(--vscode-sideBarSectionHeader-border,#3c3c3c) px-4 py-3">
        <h1 className="m-0 text-base font-semibold tracking-wide">SkillDex</h1>
        <p className="m-0 mt-1 text-xs opacity-70">
          Panel visual para Rules y Skills bajo .cursor/
        </p>
        <p className="m-0 mt-2 text-xs opacity-80" role="status" aria-live="polite">
          {handshakeLabel}
        </p>
      </header>
      <main className="flex-1 px-4 py-4" aria-label="SkillDex dashboard">
        <p className="m-0 text-xs opacity-80" aria-live="polite">
          {countsLabel}
        </p>
        {catalog !== undefined ? (
          <pre
            className="mt-3 max-h-96 overflow-auto rounded border border-(--vscode-sideBarSectionHeader-border,#3c3c3c) p-2 text-[10px] leading-snug whitespace-pre-wrap break-all"
            aria-label="Catalog dump"
          >
            {JSON.stringify(catalog, null, 2)}
          </pre>
        ) : null}
      </main>
    </div>
  );
}
