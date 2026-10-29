import type { SkilldexSettings } from "../shared/index.js";

export interface SkilldexConfiguration {
  get(section: string): unknown;
}

export function readSkilldexSettings(configuration: SkilldexConfiguration): SkilldexSettings {
  return {
    showSkills: coerceShown(configuration.get("showSkills")),
    showRules: coerceShown(configuration.get("showRules")),
    remoteSkillsRepositoryUrl: coerceRepositoryUrl(configuration.get("remoteSkillsRepositoryUrl")),
  };
}

function coerceShown(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  return true;
}

function coerceRepositoryUrl(value: unknown): string {
  if (typeof value === "string") return value;
  return "";
}
