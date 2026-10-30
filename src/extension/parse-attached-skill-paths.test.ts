import { describe, expect, it } from "vitest";
import { parseAttachedSkillPaths } from "./parse-attached-skill-paths.js";

function attachedSkillEntry(name: string, skillPath: string, body: string): string {
  return [`Skill Name: ${name}`, `Path: ${skillPath}`, "SKILL.md content:", body, ""].join("\n");
}

function userLine(text: string): string {
  return JSON.stringify({ role: "user", message: { content: [{ type: "text", text }] } });
}

function attachedSkillsMessage(entries: string[]): string {
  return [
    "<manually_attached_skills>",
    "The user has manually attached the following skills to their message.",
    "",
    ...entries,
    "</manually_attached_skills>",
    "<user_query>",
    "hola",
    "</user_query>",
  ].join("\n");
}

describe("parseAttachedSkillPaths", () => {
  it("returns one path per attached skill in a user message", () => {
    const line = userLine(
      attachedSkillsMessage([
        attachedSkillEntry("openspec-explore", "/repo/.cursor/skills/explore/SKILL.md", "# Body"),
        attachedSkillEntry("maquetado", "/repo/.cursor/skills/maquetado/SKILL.md", "# Body"),
      ]),
    );

    expect(parseAttachedSkillPaths(line)).toEqual([
      "/repo/.cursor/skills/explore/SKILL.md",
      "/repo/.cursor/skills/maquetado/SKILL.md",
    ]);
  });

  it("ignores lookalike Path lines inside an inlined skill body", () => {
    const line = userLine(
      attachedSkillsMessage([
        attachedSkillEntry(
          "docs",
          "/repo/.cursor/skills/docs/SKILL.md",
          ["Example:", "Path: /repo/.cursor/skills/fake/SKILL.md"].join("\n"),
        ),
      ]),
    );

    expect(parseAttachedSkillPaths(line)).toEqual(["/repo/.cursor/skills/docs/SKILL.md"]);
  });

  it("ignores the Read tool calls the agent makes in the same transcript", () => {
    const line = JSON.stringify({
      role: "assistant",
      message: {
        content: [
          {
            type: "tool_use",
            name: "Read",
            input: { path: "/repo/.cursor/skills/maquetado/SKILL.md" },
          },
        ],
      },
    });

    expect(parseAttachedSkillPaths(line)).toEqual([]);
  });

  it("returns nothing for a user message without attachments, a turn end, or invalid JSON", () => {
    expect(parseAttachedSkillPaths(userLine("<user_query>hola</user_query>"))).toEqual([]);
    expect(parseAttachedSkillPaths('{"type":"turn_ended","status":"success"}')).toEqual([]);
    expect(parseAttachedSkillPaths("<manually_attached_skills> not json")).toEqual([]);
  });

  it("ignores an assistant message that quotes the attachment block", () => {
    const line = JSON.stringify({
      role: "assistant",
      message: {
        content: [
          {
            type: "text",
            text: attachedSkillsMessage([
              attachedSkillEntry("maquetado", "/repo/.cursor/skills/maquetado/SKILL.md", "#"),
            ]),
          },
        ],
      },
    });

    expect(parseAttachedSkillPaths(line)).toEqual([]);
  });
});
