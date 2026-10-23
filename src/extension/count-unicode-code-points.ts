/**
 * Counts Unicode code points in a string (not UTF-16 code units).
 * Emoji outside the BMP (e.g. "😀") count as 1.
 */
export function countUnicodeCodePoints(text: string): number {
  return Array.from(text).length;
}
