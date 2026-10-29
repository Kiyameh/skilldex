import type { CatalogItem } from "../shared/index.js";
import { groupSkillsByCategory } from "./group-skills-by-category";
import { SkillCard } from "./skill-card";

interface SkillsSectionProps {
  skills: CatalogItem[];
  onToggleEnabled: (item: CatalogItem, nextEnabled: boolean) => void;
  onOpenItem: (item: CatalogItem) => void;
  pendingToggleIds?: ReadonlySet<string>;
}

const EMPTY_SKILLS_MESSAGE = "No hay skills todavía";

export function SkillsSection({
  skills,
  onToggleEnabled,
  onOpenItem,
  pendingToggleIds,
}: SkillsSectionProps) {
  const isEmpty = skills.length === 0;
  const groups = groupSkillsByCategory(skills);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto pr-1">
      {isEmpty ? (
        <p className="m-0 text-xs opacity-70">{EMPTY_SKILLS_MESSAGE}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((group) => {
            const headingId = `skills-category-${group.id}`;
            return (
              <section key={group.id} aria-labelledby={headingId} className="flex flex-col gap-2">
                <h3 id={headingId} className="m-0 text-xs font-semibold tracking-wide opacity-80">
                  {group.label}
                </h3>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {group.skills.map((skill) => (
                    <li key={skill.id}>
                      <SkillCard
                        item={skill}
                        onToggleEnabled={onToggleEnabled}
                        onOpenItem={onOpenItem}
                        toggleDisabled={pendingToggleIds?.has(skill.id) ?? false}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
