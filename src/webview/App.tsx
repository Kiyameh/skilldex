export function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-(--vscode-sideBarSectionHeader-border,#3c3c3c) px-4 py-3">
        <h1 className="m-0 text-base font-semibold tracking-wide">SkillDex</h1>
        <p className="m-0 mt-1 text-xs opacity-70">
          Panel visual para Rules y Skills bajo .cursor/
        </p>
      </header>
      <main className="flex-1 px-4 py-4" aria-label="SkillDex dashboard">
        {/* Dashboard content lands in later OpenSpec slices */}
      </main>
    </div>
  );
}
