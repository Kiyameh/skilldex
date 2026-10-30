const ATTACHED_SKILLS_OPEN_TAG = "<manually_attached_skills>";
const ATTACHED_SKILLS_CLOSE_TAG = "</manually_attached_skills>";
const SKILL_PATH_LINE = /^Skill Name: .*\r?\nPath: (.+[\\/]SKILL\.md)\r?$/gmu;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function userMessageTexts(entry: unknown): string[] {
  if (!isRecord(entry) || entry["role"] !== "user") return [];
  const message = entry["message"];
  if (!isRecord(message) || !Array.isArray(message["content"])) return [];

  return message["content"].flatMap((part: unknown) =>
    isRecord(part) && part["type"] === "text" && typeof part["text"] === "string"
      ? [part["text"]]
      : [],
  );
}

function attachedSkillsBlock(text: string): string | undefined {
  const start = text.indexOf(ATTACHED_SKILLS_OPEN_TAG);
  if (start < 0) return undefined;
  const end = text.indexOf(ATTACHED_SKILLS_CLOSE_TAG, start);
  return text.slice(start, end < 0 ? undefined : end);
}

/**
 * Only the `Path:` line right after each `Skill Name:` is read; the inlined skill bodies live
 * in the same block and may contain lookalike lines.
 */
export function parseAttachedSkillPaths(transcriptLine: string): string[] {
  if (!transcriptLine.includes(ATTACHED_SKILLS_OPEN_TAG)) return [];

  let entry: unknown;
  try {
    entry = JSON.parse(transcriptLine);
  } catch {
    return [];
  }

  return userMessageTexts(entry).flatMap((text) => {
    const block = attachedSkillsBlock(text);
    if (block === undefined) return [];
    return Array.from(block.matchAll(SKILL_PATH_LINE), (match) => match[1] ?? "").filter(
      (skillPath) => skillPath.length > 0,
    );
  });
}
