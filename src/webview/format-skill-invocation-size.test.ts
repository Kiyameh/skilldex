import { describe, expect, it } from "vitest";
import { formatSkillInvocationSize } from "./format-skill-invocation-size";

describe("formatSkillInvocationSize", () => {
  it("formats 1024 with es-ES grouping and rounded tokens", () => {
    expect(formatSkillInvocationSize(1024)).toBe("1.024 caracteres (~366 tokens)");
  });

  it("formats zero count", () => {
    expect(formatSkillInvocationSize(0)).toBe("0 caracteres (~0 tokens)");
  });

  it("keeps the tilde when characterCount divides evenly by 2.8", () => {
    expect(formatSkillInvocationSize(28)).toBe("28 caracteres (~10 tokens)");
  });
});
