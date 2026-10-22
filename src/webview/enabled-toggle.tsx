import { ToggleLeftIcon, ToggleRightIcon } from "./toggle-icons";

interface EnabledToggleProps {
  enabled: boolean;
  onToggle: (nextEnabled: boolean) => void;
  disabled?: boolean;
}

const ENABLED_LABEL = "Activa";
const DISABLED_LABEL = "Inactiva";

export function EnabledToggle({ enabled, onToggle, disabled = false }: EnabledToggleProps) {
  const label = enabled ? ENABLED_LABEL : DISABLED_LABEL;
  const ledColor = enabled ? "bg-emerald-500" : "bg-red-500";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded text-xs opacity-90 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--vscode-focusBorder,#007fd4) disabled:cursor-not-allowed disabled:opacity-50"
      onClick={() => onToggle(!enabled)}
    >
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
      <span>{label}</span>
    </button>
  );
}
