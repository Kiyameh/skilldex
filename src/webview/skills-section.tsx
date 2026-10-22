import type { CatalogItem } from "../shared/index.js";
import { SkillCard } from "./skill-card";

interface SkillsSectionProps {
  skills: CatalogItem[];
  onToggleEnabled: (item: CatalogItem, nextEnabled: boolean) => void;
  pendingToggleIds?: ReadonlySet<string>;
}

const EMPTY_SKILLS_MESSAGE = "No hay skills todavía";

export function SkillsSection({ skills, onToggleEnabled, pendingToggleIds }: SkillsSectionProps) {
  const isEmpty = skills.length === 0;

  return (
    <section aria-labelledby="skills-heading" className="flex min-h-0 flex-2 flex-col">
      <h2 id="skills-heading" className="m-0 mb-2 shrink-0 text-sm font-semibold tracking-wide">
        Skills
      </h2>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {isEmpty ? (
          <p className="m-0 text-xs opacity-70">{EMPTY_SKILLS_MESSAGE}</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {skills.map((skill) => (
              <li key={skill.id}>
                <SkillCard
                  item={skill}
                  onToggleEnabled={onToggleEnabled}
                  toggleDisabled={pendingToggleIds?.has(skill.id) ?? false}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
