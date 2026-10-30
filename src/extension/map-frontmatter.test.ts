import path from "node:path";
import { describe, expect, it } from "vitest";
import { mapFrontmatterToCatalogItem } from "./map-frontmatter.js";

const WORKSPACE = "/tmp/workspace";

describe("mapFrontmatterToCatalogItem", () => {
  describe("rule sections", () => {
    it("maps h2 headings from the body into sections", () => {
      const contents = ["---", "title: Sample", "---", "## Alpha", "text", "## Beta", ""].join(
        "\n",
      );
      const item = mapFrontmatterToCatalogItem(
        path.join(WORKSPACE, ".cursor", "rules", "sample.mdc"),
        ".cursor/rules/sample.mdc",
        "rule",
        contents,
      );
      expect(item.sections).toEqual(["Alpha", "Beta"]);
    });

    it("ignores h2 headings inside fences and returns empty when none remain", () => {
      const contents = ["---", "title: Sample", "---", "```", "## Hidden", "```", ""].join("\n");
      const item = mapFrontmatterToCatalogItem(
        path.join(WORKSPACE, ".cursor", "rules", "sample.mdc"),
        ".cursor/rules/sample.mdc",
        "rule",
        contents,
      );
      expect(item.sections).toEqual([]);
    });
  });

  describe("skill version and category", () => {
    it("maps version only from metadata.version string", () => {
      const contents = [
        "---",
        "name: demo",
        "version: ignored",
        "metadata:",
        '  version: "1.0.0"',
        "---",
        "body",
      ].join("\n");
      const item = mapFrontmatterToCatalogItem(
        path.join(WORKSPACE, ".cursor", "skills", "demo", "SKILL.md"),
        ".cursor/skills/demo/SKILL.md",
        "skill",
        contents,
      );
      expect(item.version).toBe("1.0.0");
      expect(item.category).toBeUndefined();
    });

    it("omits version when metadata.version is not a string", () => {
      const contents = ["---", "name: demo", "metadata:", "  version: 2", "---", "body"].join("\n");
      const item = mapFrontmatterToCatalogItem(
        path.join(WORKSPACE, ".cursor", "skills", "demo", "SKILL.md"),
        ".cursor/skills/demo/SKILL.md",
        "skill",
        contents,
      );
      expect(item.version).toBeUndefined();
    });

    it("maps category from the first skills subdirectory when nested", () => {
      const contents = ["---", "name: react-conventions", "---", "body"].join("\n");
      const item = mapFrontmatterToCatalogItem(
        path.join(
          WORKSPACE,
          ".cursor",
          "skills",
          "stack",
          "react",
          "react-conventions",
          "SKILL.md",
        ),
        ".cursor/skills/stack/react/react-conventions/SKILL.md",
        "skill",
        contents,
      );
      expect(item.category).toBe("stack");
    });

    it("maps category when the ai tool directory is not .cursor", () => {
      const contents = ["---", "name: react-conventions", "---", "body"].join("\n");
      const item = mapFrontmatterToCatalogItem(
        path.join(WORKSPACE, ".agents", "skills", "stack", "react", "SKILL.md"),
        ".agents/skills/stack/react/SKILL.md",
        "skill",
        contents,
      );
      expect(item.category).toBe("stack");
    });

    it("omits category for skills directly under .cursor/skills/", () => {
      const contents = ["---", "name: openspec-explore", "---", "body"].join("\n");
      const item = mapFrontmatterToCatalogItem(
        path.join(WORKSPACE, ".cursor", "skills", "openspec-explore", "SKILL.md"),
        ".cursor/skills/openspec-explore/SKILL.md",
        "skill",
        contents,
      );
      expect(item.category).toBeUndefined();
    });
  });

  describe("skill characterCount", () => {
    it("counts Unicode code points of the full SKILL.md contents", () => {
      const contents = ["---", "name: demo", "---", "body with 😀"].join("\n");
      const item = mapFrontmatterToCatalogItem(
        path.join(WORKSPACE, ".cursor", "skills", "demo", "SKILL.md"),
        ".cursor/skills/demo/SKILL.md",
        "skill",
        contents,
      );
      expect(item.characterCount).toBe(Array.from(contents).length);
    });

    it("returns 0 for an empty skill file", () => {
      const item = mapFrontmatterToCatalogItem(
        path.join(WORKSPACE, ".cursor", "skills", "empty", "SKILL.md"),
        ".cursor/skills/empty/SKILL.md",
        "skill",
        "",
      );
      expect(item.characterCount).toBe(0);
    });

    it("omits characterCount on rules", () => {
      const contents = ["---", "title: Sample", "---", "body"].join("\n");
      const item = mapFrontmatterToCatalogItem(
        path.join(WORKSPACE, ".cursor", "rules", "sample.mdc"),
        ".cursor/rules/sample.mdc",
        "rule",
        contents,
      );
      expect(item.characterCount).toBeUndefined();
    });
  });

  describe("native enabled mapping", () => {
    it("maps rule enabled only when alwaysApply is boolean true", () => {
      const active = mapFrontmatterToCatalogItem(
        path.join(WORKSPACE, ".cursor", "rules", "a.mdc"),
        ".cursor/rules/a.mdc",
        "rule",
        ["---", "alwaysApply: true", "enabled: false", "---", "body"].join("\n"),
      );
      expect(active.enabled).toBe(true);

      const omitted = mapFrontmatterToCatalogItem(
        path.join(WORKSPACE, ".cursor", "rules", "b.mdc"),
        ".cursor/rules/b.mdc",
        "rule",
        ["---", "enabled: true", "---", "body"].join("\n"),
      );
      expect(omitted.enabled).toBe(false);

      const falseValue = mapFrontmatterToCatalogItem(
        path.join(WORKSPACE, ".cursor", "rules", "c.mdc"),
        ".cursor/rules/c.mdc",
        "rule",
        ["---", "alwaysApply: false", "---", "body"].join("\n"),
      );
      expect(falseValue.enabled).toBe(false);
    });

    it("maps skill disabled only when disable-model-invocation is boolean true", () => {
      const inactive = mapFrontmatterToCatalogItem(
        path.join(WORKSPACE, ".cursor", "skills", "a", "SKILL.md"),
        ".cursor/skills/a/SKILL.md",
        "skill",
        ["---", "name: a", "disable-model-invocation: true", "enabled: true", "---", "body"].join(
          "\n",
        ),
      );
      expect(inactive.enabled).toBe(false);

      const omitted = mapFrontmatterToCatalogItem(
        path.join(WORKSPACE, ".cursor", "skills", "b", "SKILL.md"),
        ".cursor/skills/b/SKILL.md",
        "skill",
        ["---", "name: b", "enabled: false", "---", "body"].join("\n"),
      );
      expect(omitted.enabled).toBe(true);

      const falseValue = mapFrontmatterToCatalogItem(
        path.join(WORKSPACE, ".cursor", "skills", "c", "SKILL.md"),
        ".cursor/skills/c/SKILL.md",
        "skill",
        ["---", "name: c", "disable-model-invocation: false", "---", "body"].join("\n"),
      );
      expect(falseValue.enabled).toBe(true);
    });
  });
});
