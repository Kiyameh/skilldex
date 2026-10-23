const FENCE_LINE_PREFIXES = ["```", "~~~"] as const;
const ATX_H2_PATTERN = /^##[ \t]+(.+?)[ \t]*#*[ \t]*$/;

function isFenceLine(trimmedLine: string): boolean {
  return FENCE_LINE_PREFIXES.some((prefix) => trimmedLine.startsWith(prefix));
}

/**
 * Extracts ATX h2 titles (`## …`) from Markdown body text.
 * Headings inside fenced code blocks are ignored; `#` and `###+` are not counted.
 */
export function extractRuleSections(markdownBody: string): string[] {
  const sections: string[] = [];
  let insideFence = false;

  for (const line of markdownBody.split("\n")) {
    const trimmed = line.trim();
    if (isFenceLine(trimmed)) {
      insideFence = !insideFence;
      continue;
    }
    if (insideFence) continue;

    const match = ATX_H2_PATTERN.exec(line);
    if (match?.[1] === undefined) continue;
    sections.push(match[1].trim());
  }

  return sections;
}
