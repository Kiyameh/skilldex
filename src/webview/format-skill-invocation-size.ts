export const CHARS_PER_TOKEN = 2.8;

const NUMBER_LOCALE = "es-ES";
const NUMBER_FORMAT_OPTIONS: Intl.NumberFormatOptions = { useGrouping: true };

function formatCount(value: number): string {
  return value.toLocaleString(NUMBER_LOCALE, NUMBER_FORMAT_OPTIONS);
}

export function formatSkillInvocationSize(characterCount: number): string {
  const chars = formatCount(characterCount);
  const tokens = formatCount(Math.round(characterCount / CHARS_PER_TOKEN));
  return `${chars} caracteres (~${tokens} tokens)`;
}
