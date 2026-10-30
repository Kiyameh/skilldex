import { appendFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createLiveActivationFeed, type LiveActivationFeed } from "./live-activation-feed.js";
import {
  cursorProjectSlug,
  directoryContainingPath,
  startLiveActivationIntake,
  type LiveActivationIntake,
  type WatchFiles,
} from "./live-activation-intake.js";

const OPEN_FOLDER = "/Users/me/Code/my app";
const OTHER_FOLDER = "/Users/me/Code/other";

interface FakeWatch {
  baseDirectory: string;
  globPattern: string;
  onFileChanged: (filePath: string) => void;
}

function spoolLine(skillFilePath: string, workspaceRoots: string[]): string {
  return `${JSON.stringify({ path: skillFilePath, conversationId: "c-1", workspaceRoots })}\n`;
}

function attachedSkillsLine(skillFilePaths: string[]): string {
  const entries = skillFilePaths.map(
    (skillFilePath) => `Skill Name: x\nPath: ${skillFilePath}\nSKILL.md content:\n# Body\n`,
  );
  const text = ["<manually_attached_skills>", ...entries, "</manually_attached_skills>"].join("\n");
  return `${JSON.stringify({ role: "user", message: { content: [{ type: "text", text }] } })}\n`;
}

function readToolLine(skillFilePath: string): string {
  return `${JSON.stringify({
    role: "assistant",
    message: { content: [{ type: "tool_use", name: "Read", input: { path: skillFilePath } }] },
  })}\n`;
}

describe("directoryContainingPath", () => {
  it("picks the longest directory that contains the file", () => {
    expect(
      directoryContainingPath("/repo/packages/web/.cursor/skills/react/SKILL.md", [
        "/repo",
        "/repo/packages/web",
        "/other",
      ]),
    ).toBe(path.resolve("/repo/packages/web"));
  });

  it("returns nothing when the file is outside every directory", () => {
    expect(directoryContainingPath("/skills/maquetado/SKILL.md", ["/repo"])).toBeUndefined();
  });
});

describe("cursorProjectSlug", () => {
  it("replaces every non-alphanumeric character and drops the leading dash", () => {
    expect(cursorProjectSlug("/Users/me/Code/skilldex")).toBe("Users-me-Code-skilldex");
    expect(
      cursorProjectSlug("/Users/me/Library/Application Support/Cursor/Workspaces/1/workspace.json"),
    ).toBe("Users-me-Library-Application-Support-Cursor-Workspaces-1-workspace-json");
  });
});

describe("startLiveActivationIntake", () => {
  let root = "";
  let spoolPath = "";
  let projectsDirectory = "";
  let transcriptsDirectory = "";
  let watches: FakeWatch[] = [];
  let feed: LiveActivationFeed;
  let intake: LiveActivationIntake | undefined;

  beforeEach(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), "skilldex-intake-"));
    spoolPath = path.join(root, "storage", "skill-reads.jsonl");
    projectsDirectory = path.join(root, "projects");
    transcriptsDirectory = path.join(
      projectsDirectory,
      cursorProjectSlug(OPEN_FOLDER),
      "agent-transcripts",
    );
    await mkdir(path.dirname(spoolPath), { recursive: true });
    await mkdir(path.join(transcriptsDirectory, "conversation-1"), { recursive: true });
    watches = [];
    feed = createLiveActivationFeed();
  });

  afterEach(async () => {
    intake?.dispose();
    intake = undefined;
    await rm(root, { recursive: true, force: true });
  });

  const watchFiles: WatchFiles = (baseDirectory, globPattern, onFileChanged) => {
    const watch = { baseDirectory, globPattern, onFileChanged };
    watches.push(watch);
    return { dispose: () => (watches = watches.filter((entry) => entry !== watch)) };
  };

  function start(): LiveActivationIntake {
    intake = startLiveActivationIntake({
      spoolPath,
      projectsDirectory,
      workspacePaths: [OPEN_FOLDER],
      openFolderPaths: [OPEN_FOLDER],
      watchFiles,
      onSkillActivated: (skillFilePath, workspaceDirectory) =>
        feed.addActivation(
          path.basename(path.dirname(skillFilePath)),
          path.basename(workspaceDirectory),
          skillFilePath,
        ),
    });
    return intake;
  }

  async function notifyChange(filePath: string): Promise<void> {
    for (const watch of watches) {
      if (filePath.startsWith(`${watch.baseDirectory}${path.sep}`)) watch.onFileChanged(filePath);
    }
    await intake?.whenSettled();
  }

  function chipNames(): string[] {
    return feed.getSnapshot().chips.map((chip) => chip.name);
  }

  it("watches the spool and the transcripts of the open workspace slug", () => {
    start();

    expect(
      watches.map(({ baseDirectory, globPattern }) => ({ baseDirectory, globPattern })),
    ).toEqual([
      { baseDirectory: path.dirname(spoolPath), globPattern: "skill-reads.jsonl" },
      {
        baseDirectory: projectsDirectory,
        globPattern: `${cursorProjectSlug(OPEN_FOLDER)}/agent-transcripts/**/*.jsonl`,
      },
    ]);
  });

  it("adds a chip for a spool read that shares an open folder and ignores other windows", async () => {
    start();
    await intake?.whenSettled();
    await writeFile(spoolPath, spoolLine("/skills/maquetado/SKILL.md", [`${OPEN_FOLDER}/`]));
    await appendFile(spoolPath, spoolLine("/skills/other-window/SKILL.md", [OTHER_FOLDER]));
    await appendFile(spoolPath, spoolLine("/skills/no-roots/SKILL.md", []));

    await notifyChange(spoolPath);

    expect(chipNames()).toEqual(["maquetado"]);
    expect(feed.getSnapshot().chips[0]?.workspaceName).toBe("my app");
  });

  it("adds one chip per attached path and none for a Read line of the same transcript", async () => {
    const transcriptPath = path.join(
      transcriptsDirectory,
      "conversation-1",
      "conversation-1.jsonl",
    );
    await writeFile(transcriptPath, "");
    start();
    await intake?.whenSettled();
    await appendFile(
      transcriptPath,
      attachedSkillsLine(["/skills/a/SKILL.md", "/skills/b/SKILL.md"]),
    );
    await appendFile(transcriptPath, readToolLine("/skills/a/SKILL.md"));

    await notifyChange(transcriptPath);

    expect(chipNames()).toEqual(["b", "a"]);
  });

  it("never backfills lines that existed before the session started", async () => {
    const transcriptPath = path.join(
      transcriptsDirectory,
      "conversation-1",
      "conversation-1.jsonl",
    );
    await writeFile(spoolPath, spoolLine("/skills/old-read/SKILL.md", [OPEN_FOLDER]));
    await writeFile(transcriptPath, attachedSkillsLine(["/skills/old-attach/SKILL.md"]));
    start();
    await intake?.whenSettled();

    await notifyChange(spoolPath);
    await notifyChange(transcriptPath);
    await appendFile(spoolPath, spoolLine("/skills/new-read/SKILL.md", [OPEN_FOLDER]));
    await notifyChange(spoolPath);

    expect(chipNames()).toEqual(["new-read"]);
  });

  it("reads a transcript that appears after the start from its first line", async () => {
    start();
    await intake?.whenSettled();
    const subagentPath = path.join(
      transcriptsDirectory,
      "conversation-1",
      "subagents",
      "s-1.jsonl",
    );
    await mkdir(path.dirname(subagentPath), { recursive: true });
    await writeFile(subagentPath, attachedSkillsLine(["/skills/fresh/SKILL.md"]));

    await notifyChange(subagentPath);

    expect(chipNames()).toEqual(["fresh"]);
  });

  it("waits for a partial line to be completed before reading it", async () => {
    start();
    await intake?.whenSettled();
    const line = spoolLine("/skills/split/SKILL.md", [OPEN_FOLDER]);
    await writeFile(spoolPath, line.slice(0, 20));
    await notifyChange(spoolPath);
    expect(chipNames()).toEqual([]);

    await appendFile(spoolPath, line.slice(20));
    await notifyChange(spoolPath);

    expect(chipNames()).toEqual(["split"]);
  });

  it("drops what happens during a pause and only counts what arrives after resuming", async () => {
    start();
    await intake?.whenSettled();
    feed.setWatching(false);
    await writeFile(spoolPath, spoolLine("/skills/during-pause/SKILL.md", [OPEN_FOLDER]));
    await notifyChange(spoolPath);

    feed.setWatching(true);
    await notifyChange(spoolPath);
    await appendFile(spoolPath, spoolLine("/skills/after-resume/SKILL.md", [OPEN_FOLDER]));
    await notifyChange(spoolPath);

    expect(chipNames()).toEqual(["after-resume"]);
  });

  it("does not rewind after a reset", async () => {
    start();
    await intake?.whenSettled();
    await writeFile(spoolPath, spoolLine("/skills/before-reset/SKILL.md", [OPEN_FOLDER]));
    await notifyChange(spoolPath);

    feed.reset();
    await notifyChange(spoolPath);

    expect(feed.getSnapshot()).toEqual({ watching: true, chips: [] });
  });

  it("stops watching on dispose", () => {
    start().dispose();

    expect(watches).toEqual([]);
  });
});
