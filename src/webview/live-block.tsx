import "@github/relative-time-element";
import type { LiveFeedChip } from "../shared/index.js";
import { PokeballIcon } from "./pokeball-icon";
import { PlayerPlayIcon, PlayerStopIcon, RefreshIcon } from "./player-icons";
import { WandIcon } from "./wand-icon";

const LIVE_TITLE = "Live";
const LIVE_HEADING_ID = "live-activations-heading";
const LIVE_RUNNING_LABEL = "Live en marcha";
const LIVE_STOPPED_LABEL = "Live parado";
const STOP_LIVE_LABEL = "Parar Live";
const RESUME_LIVE_LABEL = "Reanudar Live";
const RESET_LIVE_LABEL = "Reiniciar Live";
const LIVE_CHIPS_LABEL = "Activaciones de skills";
const LIVE_USED_LABEL = "He usado";
const LIVE_TIME_CLASS = "shrink-0 text-[10px] leading-none text-neutral-400";
const LIVE_LIST_HEIGHT_CLASS = "h-[196px]";
const NEUTRAL_CHIP_CLASS =
  "inline-flex h-6 min-w-0 max-w-[40%] shrink items-center gap-1.5 rounded-full border border-(--vscode-sideBarSectionHeader-border,#3c3c3c) px-2.5";
const NEWEST_CHIP_CLASS =
  "inline-flex h-6 min-w-0 max-w-[40%] shrink items-center gap-1.5 rounded-full border border-teal-400 px-2.5 text-teal-400";
const CHIP_BUTTON_CLASS =
  "cursor-pointer bg-transparent focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--vscode-focusBorder,#007fd4)";

const LIVE_ICON_BUTTON_CLASS =
  "inline-flex cursor-pointer items-center rounded-md p-1 hover:bg-(--vscode-toolbar-hoverBackground,#ffffff14) focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--vscode-focusBorder,#007fd4)";

interface LiveBlockProps {
  watching: boolean;
  chips: LiveFeedChip[];
  onToggleWatching: () => void;
  onReset: () => void;
  onOpenChip: (chip: LiveFeedChip) => void;
}

export function LiveBlock({
  watching,
  chips,
  onToggleWatching,
  onReset,
  onOpenChip,
}: LiveBlockProps) {
  const ledClassName = watching ? "animate-pulse bg-emerald-500" : "bg-red-500";

  return (
    <section
      aria-labelledby={LIVE_HEADING_ID}
      className="flex shrink-0 flex-col gap-2 border-t border-(--vscode-sideBarSectionHeader-border,#3c3c3c) pt-2"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <h2 id={LIVE_HEADING_ID} className="m-0 text-xs font-semibold tracking-wide">
            {LIVE_TITLE}
          </h2>
          <span
            role="img"
            aria-label={watching ? LIVE_RUNNING_LABEL : LIVE_STOPPED_LABEL}
            className={`inline-block size-2 rounded-full ${ledClassName}`}
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={watching ? STOP_LIVE_LABEL : RESUME_LIVE_LABEL}
            className={LIVE_ICON_BUTTON_CLASS}
            onClick={onToggleWatching}
          >
            {watching ? <PlayerStopIcon /> : <PlayerPlayIcon />}
          </button>
          <button
            type="button"
            aria-label={RESET_LIVE_LABEL}
            className={LIVE_ICON_BUTTON_CLASS}
            onClick={onReset}
          >
            <RefreshIcon />
          </button>
        </div>
      </div>
      <ul
        aria-label={LIVE_CHIPS_LABEL}
        className={`m-0 flex list-none flex-col overflow-hidden p-0 ${LIVE_LIST_HEIGHT_CLASS}`}
      >
        {chips.map((chip, index) => (
          <li key={chip.id} className="grid grid-rows-[1fr] animate-live-chip-enter">
            <div className="flex min-h-0 items-center gap-1.5 overflow-hidden pb-1 text-xs whitespace-nowrap">
              <PokeballIcon className="size-3.5 shrink-0 text-neutral-400" />
              <span className="shrink-0">{`${LIVE_USED_LABEL} `}</span>
              <button
                type="button"
                className={`${index === 0 ? NEWEST_CHIP_CLASS : NEUTRAL_CHIP_CLASS} ${CHIP_BUTTON_CLASS}`}
                aria-label={`Abrir ${chip.name}`}
                onClick={() => onOpenChip(chip)}
              >
                <WandIcon
                  className={`size-3.5 shrink-0 ${index === 0 ? "text-teal-400" : "text-neutral-400"}`}
                />
                <span className="truncate">{chip.name}</span>
              </button>
              <span className="min-w-0 truncate">{` de ${chip.workspaceName}`}</span>
              <relative-time
                className={LIVE_TIME_CLASS}
                datetime={chip.activatedAt}
                format="datetime"
                weekday=""
                day="numeric"
                month="short"
                year="numeric"
                hour="numeric"
                minute="2-digit"
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
