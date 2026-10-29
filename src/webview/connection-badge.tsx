import type { HandshakeStatus } from "./use-host-handshake";

interface ConnectionBadgeProps {
  status: HandshakeStatus;
}

export function ConnectionBadge({ status }: ConnectionBadgeProps) {
  const isConnected = status === "connected";
  const label = isConnected ? "actualizado" : "desconectado";
  const borderClass = isConnected
    ? "border-emerald-500 text-emerald-500"
    : "border-red-500 text-red-500";

  return (
    <span
      className={`rounded border px-1.5 py-0.5 text-[10px] leading-none font-medium tracking-wide ${borderClass}`}
      role="status"
      aria-live="polite"
    >
      {label}
    </span>
  );
}
