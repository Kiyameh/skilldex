import { describe, expect, it, vi } from "vitest";
import { discoverCatalog } from "./discover-catalog.js";
import {
  readAiToolDirectory,
  readSkilldexSettings,
  type SkilldexConfiguration,
} from "./read-skilldex-settings.js";

vi.mock("./discover-catalog.js", () => ({
  discoverCatalog: vi.fn(),
}));

function configurationFrom(values: Record<string, unknown>): SkilldexConfiguration {
  return {
    get: (section) => values[section],
  };
}

describe("readSkilldexSettings", () => {
  it("falls back when a visibility value is missing or not a boolean", () => {
    expect(
      readSkilldexSettings(
        configurationFrom({
          showSkills: "yes",
        }),
      ),
    ).toEqual({
      showSkills: true,
      showRules: true,
      showLiveArea: true,
    });
    expect(discoverCatalog).not.toHaveBeenCalled();
  });

  it("reads stored visibility values", () => {
    expect(
      readSkilldexSettings(
        configurationFrom({
          showSkills: false,
          showRules: true,
          showLiveArea: false,
        }),
      ),
    ).toEqual({
      showSkills: false,
      showRules: true,
      showLiveArea: false,
    });
    expect(discoverCatalog).not.toHaveBeenCalled();
  });
});

describe("readAiToolDirectory", () => {
  it("defaults to .cursor when the value is missing, blank, or escapes the workspace", () => {
    expect(readAiToolDirectory(configurationFrom({}))).toBe(".cursor");
    expect(readAiToolDirectory(configurationFrom({ "ai-tool-directory": 12 }))).toBe(".cursor");
    expect(readAiToolDirectory(configurationFrom({ "ai-tool-directory": "  " }))).toBe(".cursor");
    expect(readAiToolDirectory(configurationFrom({ "ai-tool-directory": "../secret" }))).toBe(
      ".cursor",
    );
    expect(readAiToolDirectory(configurationFrom({ "ai-tool-directory": "/tmp/tools" }))).toBe(
      ".cursor",
    );
    expect(discoverCatalog).not.toHaveBeenCalled();
  });

  it("reads a relative directory and trims slashes", () => {
    expect(readAiToolDirectory(configurationFrom({ "ai-tool-directory": ".agents" }))).toBe(
      ".agents",
    );
    expect(readAiToolDirectory(configurationFrom({ "ai-tool-directory": ".cursor/" }))).toBe(
      ".cursor",
    );
    expect(readAiToolDirectory(configurationFrom({ "ai-tool-directory": "tools/claude" }))).toBe(
      "tools/claude",
    );
  });
});
