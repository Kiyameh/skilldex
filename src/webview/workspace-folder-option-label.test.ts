import { describe, expect, it } from "vitest";
import type { WorkspaceFolderSnapshotEntry } from "../shared/index.js";
import { workspaceFolderOptionLabel } from "./workspace-folder-option-label";

const ALPHA: WorkspaceFolderSnapshotEntry = {
  id: "file:///Users/a/alpha",
  name: "alpha",
  path: "/Users/a/alpha",
};

const DEMO_A: WorkspaceFolderSnapshotEntry = {
  id: "file:///Users/a/demo",
  name: "demo",
  path: "/Users/a/demo",
};

const DEMO_B: WorkspaceFolderSnapshotEntry = {
  id: "file:///Users/b/demo",
  name: "demo",
  path: "/Users/b/demo",
};

const DEMO_ROOT: WorkspaceFolderSnapshotEntry = {
  id: "file:///demo",
  name: "demo",
  path: "/demo",
};

describe("workspaceFolderOptionLabel", () => {
  it("shows only the folder name when it is unique", () => {
    expect(workspaceFolderOptionLabel(ALPHA, [ALPHA, DEMO_A])).toBe("alpha");
  });

  it("adds the parent segment when the folder name is repeated", () => {
    const folders = [DEMO_A, DEMO_B];
    expect(workspaceFolderOptionLabel(DEMO_A, folders)).toBe("demo (a)");
    expect(workspaceFolderOptionLabel(DEMO_B, folders)).toBe("demo (b)");
  });

  it("shows the full path when the parent segment is empty", () => {
    expect(workspaceFolderOptionLabel(DEMO_ROOT, [DEMO_A, DEMO_ROOT])).toBe("/demo");
  });
});
