import type { FileHandle } from "node:fs/promises";
import { open, readdir, stat } from "node:fs/promises";
import path from "node:path";
import type { Disposable } from "vscode";
import { parseAttachedSkillPaths } from "./parse-attached-skill-paths.js";
import { parseSkillReadSpoolLine } from "./parse-skill-read-spool-line.js";

const TRANSCRIPTS_DIRECTORY_NAME = "agent-transcripts";
const JSONL_EXTENSION = ".jsonl";
const NEWLINE_BYTE = 0x0a;

export type WatchFiles = (
  baseDirectory: string,
  globPattern: string,
  onFileChanged: (filePath: string) => void,
) => Disposable;

export interface LiveActivationIntakeOptions {
  spoolPath: string;
  projectsDirectory: string;
  workspacePaths: string[];
  openFolderPaths: string[];
  watchFiles: WatchFiles;
  onSkillActivated: (skillFilePath: string, workspaceDirectory: string) => void;
}

export function directoryContainingPath(
  filePath: string,
  directories: readonly string[],
): string | undefined {
  const resolvedFilePath = path.resolve(filePath);
  return directories
    .map((directory) => path.resolve(directory))
    .filter(
      (directory) =>
        resolvedFilePath === directory || resolvedFilePath.startsWith(`${directory}${path.sep}`),
    )
    .sort((left, right) => right.length - left.length)[0];
}

export interface LiveActivationIntake extends Disposable {
  whenSettled: () => Promise<void>;
}

type LineHandler = (line: string, sourceFilePath: string) => void;

/** Cursor names each project folder after the workspace path with every non-alphanumeric character as `-`. */
export function cursorProjectSlug(workspacePath: string): string {
  return workspacePath.replace(/[^a-zA-Z0-9]/gu, "-").replace(/^-/u, "");
}

async function fileSize(filePath: string): Promise<number | undefined> {
  try {
    return (await stat(filePath)).size;
  } catch {
    return undefined;
  }
}

async function listJsonlFiles(directory: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { recursive: true });
    return entries
      .filter((entry) => entry.endsWith(JSONL_EXTENSION))
      .map((entry) => path.join(directory, entry));
  } catch {
    return [];
  }
}

/**
 * Files present at start are skipped to their current size so history is never backfilled;
 * files that appear later are read from their first byte.
 */
export function startLiveActivationIntake(
  options: LiveActivationIntakeOptions,
): LiveActivationIntake {
  const offsets = new Map<string, number>();
  const openFolderPaths = new Set(options.openFolderPaths.map((folder) => path.resolve(folder)));
  const slugs = [...new Set(options.workspacePaths.map(cursorProjectSlug))];
  let disposed = false;
  let queue: Promise<void> = Promise.resolve();

  const enqueue = (work: () => Promise<void>): void => {
    queue = queue.then(work).catch(() => undefined);
  };

  const consumeNewLines = async (filePath: string, handleLine: LineHandler): Promise<void> => {
    if (disposed) return;
    let handle: FileHandle;
    try {
      handle = await open(filePath, "r");
    } catch {
      return;
    }
    try {
      const { size } = await handle.stat();
      const storedOffset = offsets.get(filePath) ?? 0;
      const offset = size < storedOffset ? 0 : storedOffset;
      if (size === offset) return;

      const buffer = Buffer.alloc(size - offset);
      await handle.read(buffer, 0, buffer.length, offset);
      const lastNewline = buffer.lastIndexOf(NEWLINE_BYTE);
      if (lastNewline < 0) return;

      offsets.set(filePath, offset + lastNewline + 1);
      for (const line of buffer.subarray(0, lastNewline).toString("utf8").split("\n")) {
        if (line.length > 0) handleLine(line, filePath);
      }
    } finally {
      await handle.close();
    }
  };

  const workspaceDirectoryFor = (
    skillFilePath: string,
    candidates: readonly string[],
  ): string | undefined => {
    const openCandidates = candidates
      .map((candidate) => path.resolve(candidate))
      .filter((candidate) => openFolderPaths.has(candidate));
    return directoryContainingPath(skillFilePath, openCandidates) ?? openCandidates[0];
  };

  const workspacePathForTranscript = (sourceFilePath: string): string | undefined => {
    const relative = path.relative(options.projectsDirectory, path.resolve(sourceFilePath));
    const slug = relative.split(path.sep)[0];
    if (slug === undefined || slug.length === 0 || slug.startsWith("..")) return undefined;
    return options.workspacePaths.find(
      (workspacePath) => cursorProjectSlug(workspacePath) === slug,
    );
  };

  const handleSpoolLine: LineHandler = (line) => {
    const entry = parseSkillReadSpoolLine(line);
    if (entry === undefined) return;
    const workspaceDirectory = workspaceDirectoryFor(entry.skillFilePath, entry.workspaceRoots);
    if (workspaceDirectory === undefined) return;
    options.onSkillActivated(entry.skillFilePath, workspaceDirectory);
  };

  const handleTranscriptLine: LineHandler = (line, sourceFilePath) => {
    const eventWorkspace = workspacePathForTranscript(sourceFilePath);
    for (const skillFilePath of parseAttachedSkillPaths(line)) {
      const workspaceDirectory =
        directoryContainingPath(skillFilePath, [...openFolderPaths]) ?? eventWorkspace;
      if (workspaceDirectory === undefined) continue;
      options.onSkillActivated(skillFilePath, workspaceDirectory);
    }
  };

  const skipExistingContent = async (): Promise<void> => {
    const transcriptFiles = await Promise.all(
      slugs.map((slug) =>
        listJsonlFiles(path.join(options.projectsDirectory, slug, TRANSCRIPTS_DIRECTORY_NAME)),
      ),
    );
    for (const filePath of [options.spoolPath, ...transcriptFiles.flat()]) {
      const size = await fileSize(filePath);
      if (size !== undefined) offsets.set(filePath, size);
    }
  };

  enqueue(skipExistingContent);

  const watchers = [
    options.watchFiles(
      path.dirname(options.spoolPath),
      path.basename(options.spoolPath),
      (filePath) => enqueue(() => consumeNewLines(filePath, handleSpoolLine)),
    ),
    ...slugs.map((slug) =>
      options.watchFiles(
        options.projectsDirectory,
        `${slug}/${TRANSCRIPTS_DIRECTORY_NAME}/**/*${JSONL_EXTENSION}`,
        (filePath) => enqueue(() => consumeNewLines(filePath, handleTranscriptLine)),
      ),
    ),
  ];

  return {
    whenSettled: () => queue,
    dispose: () => {
      disposed = true;
      for (const watcher of watchers) watcher.dispose();
    },
  };
}
