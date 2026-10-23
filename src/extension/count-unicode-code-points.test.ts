import { describe, expect, it } from "vitest";
import { countUnicodeCodePoints } from "./count-unicode-code-points.js";

describe("countUnicodeCodePoints", () => {
  it("counts ASCII characters", () => {
    expect(countUnicodeCodePoints("hello")).toBe(5);
  });

  it("counts emoji outside the BMP as one code point", () => {
    expect(countUnicodeCodePoints("😀")).toBe(1);
    expect("😀".length).toBe(2);
  });

  it("returns 0 for an empty string", () => {
    expect(countUnicodeCodePoints("")).toBe(0);
  });

  it("counts the full frontmatter and body string", () => {
    const contents = ["---", "name: demo", "---", "body with 😀"].join("\n");
    expect(countUnicodeCodePoints(contents)).toBe(Array.from(contents).length);
  });
});
