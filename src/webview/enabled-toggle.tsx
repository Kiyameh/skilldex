import { ToggleLeftIcon, ToggleRightIcon } from "./toggle-icons";

interface EnabledToggleProps {
  enabled: boolean;
  onToggle: (nextEnabled: boolean) => void;
  disabled?: boolean;
  enabledLabel?: string;
  disabledLabel?: string;
}

const DEFAULT_ENABLED_LABEL = "Auto";
const DEFAULT_DISABLED_LABEL = "Manual";

export function EnabledToggle({
  enabled,
  onToggle,
  disabled = false,
  enabledLabel = DEFAULT_ENABLED_LABEL,
  disabledLabel = DEFAULT_DISABLED_LABEL,
}: EnabledToggleProps) {
  const label = enabled ? enabledLabel : disabledLabel;
  const ledColor = enabled ? "bg-emerald-500" : "bg-red-500";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      disabled={disabled}
      className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-(--vscode-sideBarSectionHeader-border,#3c3c3c) px-1.5 py-0.5 text-xs opacity-90 transition-colors hover:bg-(--vscode-toolbar-hoverBackground,#ffffff14) focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--vscode-focusBorder,#007fd4) disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
      onClick={() => onToggle(!enabled)}
    >
      <span>{label}</span>
      <span
        className="relative inline-flex size-4 shrink-0 items-center justify-center"
        aria-hidden="true"
      >
        <span
          className={`inline-block size-2 rounded-full ${ledColor} group-hover:hidden group-focus-within:hidden`}
        />
        <span className="hidden group-hover:inline-flex group-focus-within:inline-flex">
          {enabled ? <ToggleRightIcon /> : <ToggleLeftIcon />}
        </span>
      </span>
    </button>
  );
}
