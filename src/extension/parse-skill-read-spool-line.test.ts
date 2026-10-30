import { describe, expect, it } from "vitest";
import { parseSkillReadSpoolLine } from "./parse-skill-read-spool-line.js";

describe("parseSkillReadSpoolLine", () => {
  it("accepts a read of a file named SKILL.md with its workspace roots", () => {
    const line = JSON.stringify({
      path: "/repo/.cursor/skills/maquetado/SKILL.md",
      conversationId: "c-1",
      workspaceRoots: ["/repo"],
    });

    expect(parseSkillReadSpoolLine(line)).toEqual({
      skillFilePath: "/repo/.cursor/skills/maquetado/SKILL.md",
      workspaceRoots: ["/repo"],
    });
  });

  it("discards reads of any other file, including near-miss names", () => {
    for (const filePath of [
      "/repo/src/App.tsx",
      "/repo/.cursor/skills/maquetado/skill.md",
      "/repo/.cursor/skills/maquetado/SKILL.md.bak",
      "/repo/.cursor/skills/maquetado/references/SKILL.md.txt",
    ]) {
      expect(parseSkillReadSpoolLine(JSON.stringify({ path: filePath, workspaceRoots: [] }))).toBe(
        undefined,
      );
    }
  });

  it("discards malformed lines and keeps only string roots", () => {
    expect(parseSkillReadSpoolLine("not json")).toBe(undefined);
    expect(parseSkillReadSpoolLine("[]")).toBe(undefined);
    expect(parseSkillReadSpoolLine(JSON.stringify({ path: 3 }))).toBe(undefined);
    expect(
      parseSkillReadSpoolLine(
        JSON.stringify({ path: "/repo/SKILL.md", workspaceRoots: ["/repo", 4, null] }),
      ),
    ).toEqual({ skillFilePath: "/repo/SKILL.md", workspaceRoots: ["/repo"] });
  });
});
