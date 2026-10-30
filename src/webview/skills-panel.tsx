import type { CatalogItem } from "../shared/index.js";
import { LiveBlock } from "./live-block";
import { SkillsSection } from "./skills-section";
import type { UseLiveFeedResult } from "./use-live-feed";

interface SkillsPanelProps {
  skills: CatalogItem[];
  unfilteredCount: number;
  onToggleEnabled: (item: CatalogItem, nextEnabled: boolean) => void;
  onOpenItem: (item: CatalogItem) => void;
  pendingToggleIds?: ReadonlySet<string> | undefined;
  showLiveArea: boolean;
  liveFeed: UseLiveFeedResult;
  onOpenLiveActivation: (id: string) => void;
}

export function SkillsPanel({
  liveFeed,
  showLiveArea,
  onOpenLiveActivation,
  ...skillsSectionProps
}: SkillsPanelProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <SkillsSection {...skillsSectionProps} />
      {showLiveArea ? (
        <LiveBlock
          watching={liveFeed.watching}
          chips={liveFeed.chips}
          onToggleWatching={liveFeed.toggleWatching}
          onReset={liveFeed.reset}
          onOpenChip={(chip) => onOpenLiveActivation(chip.id)}
        />
      ) : null}
    </div>
  );
}
