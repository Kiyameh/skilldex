import { describe, expect, it, vi } from "vitest";
import { discoverCatalog } from "./discover-catalog.js";
import { readSkilldexSettings, type SkilldexConfiguration } from "./read-skilldex-settings.js";

vi.mock("./discover-catalog.js", () => ({
  discoverCatalog: vi.fn(),
}));

function configurationFrom(values: Record<string, unknown>): SkilldexConfiguration {
  return {
    get: (section) => values[section],
  };
}

describe("readSkilldexSettings", () => {
  it("falls back when a visibility value is missing or not a boolean and the URL is not a string", () => {
    expect(
      readSkilldexSettings(
        configurationFrom({
          showSkills: "yes",
          remoteSkillsRepositoryUrl: 12,
        }),
      ),
    ).toEqual({
      showSkills: true,
      showRules: true,
      remoteSkillsRepositoryUrl: "",
    });
    expect(discoverCatalog).not.toHaveBeenCalled();
  });

  it("reads a workspace URL as stored", () => {
    expect(
      readSkilldexSettings(
        configurationFrom({
          showSkills: false,
          showRules: true,
          remoteSkillsRepositoryUrl: "https://github.com/org/skills",
        }),
      ),
    ).toEqual({
      showSkills: false,
      showRules: true,
      remoteSkillsRepositoryUrl: "https://github.com/org/skills",
    });
    expect(discoverCatalog).not.toHaveBeenCalled();
  });
});
