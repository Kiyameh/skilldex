import { describe, expect, it } from "vitest";
import { resolveLiveActivationPaths } from "./live-activation-paths.js";

describe("resolveLiveActivationPaths", () => {
  it("places the hook under ~/.cursor and the spool in the extension global storage", () => {
    expect(
      resolveLiveActivationPaths(
        "/Users/me",
        "/Users/me/Library/Application Support/Cursor/skilldex",
      ),
    ).toEqual({
      cursorDirectory: "/Users/me/.cursor",
      projectsDirectory: "/Users/me/.cursor/projects",
      spoolPath:
        "/Users/me/Library/Application Support/Cursor/skilldex/live-activations/skill-reads.jsonl",
    });
  });
});
