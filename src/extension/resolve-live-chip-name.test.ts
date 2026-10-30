import { describe, expect, it } from "vitest";
import type { CatalogItem } from "../shared/index.js";
import { resolveLiveChipName } from "./resolve-live-chip-name.js";

const CATALOG_SKILL: CatalogItem = {
  id: ".cursor/skills/stack/react/SKILL.md",
  kind: "skill",
  path: "/tmp/workspace/.cursor/skills/stack/react/SKILL.md",
  enabled: true,
  title: "React Conventions",
};

describe("resolveLiveChipName", () => {
  it("uses the card name when the path matches a catalog skill", () => {
    expect(
      resolveLiveChipName("/tmp/workspace/.cursor/skills/stack/react/SKILL.md", [CATALOG_SKILL]),
    ).toBe("React Conventions");
  });

  it("uses the same id fallback the card shows when the skill has no title", () => {
    const untitled: CatalogItem = {
      id: CATALOG_SKILL.id,
      kind: "skill",
      path: CATALOG_SKILL.path,
      enabled: true,
    };

    expect(resolveLiveChipName(CATALOG_SKILL.path, [untitled])).toBe(CATALOG_SKILL.id);
  });

  it("falls back to the folder that contains the SKILL.md when there is no card", () => {
    expect(
      resolveLiveChipName("/Users/me/.cursor/skills/create-hook/SKILL.md", [CATALOG_SKILL]),
    ).toBe("create-hook");
  });
});
