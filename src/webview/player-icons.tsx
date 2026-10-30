import type { ReactNode } from "react";

interface PlayerIconProps {
  className?: string;
}

interface PlayerIconFrameProps {
  className: string | undefined;
  children: ReactNode;
}

function PlayerIconFrame({ className, children }: PlayerIconFrameProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      {children}
    </svg>
  );
}

export function PlayerPlayIcon({ className }: PlayerIconProps) {
  return (
    <PlayerIconFrame className={className}>
      <path d="M7 4v16l13 -8l-13 -8" />
    </PlayerIconFrame>
  );
}

export function PlayerStopIcon({ className }: PlayerIconProps) {
  return (
    <PlayerIconFrame className={className}>
      <path d="M5 7a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2l0 -10" />
    </PlayerIconFrame>
  );
}

export function RefreshIcon({ className }: PlayerIconProps) {
  return (
    <PlayerIconFrame className={className}>
      <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
    </PlayerIconFrame>
  );
}
