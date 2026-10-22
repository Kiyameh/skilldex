interface EnabledLedProps {
  enabled: boolean;
}

const ENABLED_LABEL = "Activa";
const DISABLED_LABEL = "Desactivada";

export function EnabledLed({ enabled }: EnabledLedProps) {
  const label = enabled ? ENABLED_LABEL : DISABLED_LABEL;
  const ledColor = enabled ? "bg-emerald-500" : "bg-red-500";

  return (
    <span className="inline-flex items-center gap-1.5 text-xs opacity-90" aria-label={label}>
      <span
        className={`inline-block size-2 shrink-0 rounded-full ${ledColor}`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}
