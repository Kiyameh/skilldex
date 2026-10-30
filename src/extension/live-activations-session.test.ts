import { appendFile, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { WatchFiles } from "./live-activation-intake.js";
import {
  startLiveActivationsSession,
  type LiveActivationsSession,
} from "./live-activations-session.js";

const OPEN_FOLDER = "/repo";
const SKILL_FILE_PATH = "/repo/.cursor/skills/react/SKILL.md";

describe("startLiveActivationsSession", () => {
  let root = "";
  let spoolPath = "";
  let notifySpool: (filePath: string) => void = () => undefined;
  let session: LiveActivationsSession | undefined;

  const watchFiles: WatchFiles = (baseDirectory, _globPattern, onFileChanged) => {
    if (baseDirectory === path.dirname(spoolPath)) notifySpool = onFileChanged;
    return { dispose: () => undefined };
  };

  beforeEach(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), "skilldex-session-"));
    spoolPath = path.join(root, "skill-reads.jsonl");
    await writeFile(spoolPath, "");
    session = startLiveActivationsSession({
      spoolPath,
      projectsDirectory: path.join(root, "projects"),
      workspacePaths: [OPEN_FOLDER],
      openFolderPaths: [OPEN_FOLDER],
      watchFiles,
    });
    await session.whenSettled();
  });

  afterEach(async () => {
    session?.dispose();
    await rm(root, { recursive: true, force: true });
  });

  async function readSkill(): Promise<void> {
    await appendFile(
      spoolPath,
      `${JSON.stringify({ path: SKILL_FILE_PATH, workspaceRoots: [OPEN_FOLDER] })}\n`,
    );
    notifySpool(spoolPath);
    await session?.whenSettled();
  }

  it("starts running and empty", () => {
    expect(session?.feed.getSnapshot()).toEqual({ watching: true, chips: [] });
  });

  it("names the chip after the folder until the catalog knows the skill, then after its card", async () => {
    await readSkill();
    session?.setCatalogSkills([
      {
        id: ".cursor/skills/react/SKILL.md",
        kind: "skill",
        path: SKILL_FILE_PATH,
        enabled: true,
        title: "React",
      },
    ]);
    await readSkill();

    expect(session?.feed.getSnapshot().chips.map((chip) => chip.name)).toEqual(["React", "react"]);
    expect(session?.feed.getSnapshot().chips.map((chip) => chip.workspaceName)).toEqual([
      "repo",
      "repo",
    ]);
  });
});
