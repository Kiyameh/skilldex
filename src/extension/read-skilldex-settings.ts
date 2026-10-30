import type { SkilldexSettings } from "../shared/index.js";
import { AI_TOOL_DIRECTORY_SETTING, coerceAiToolDirectory } from "./catalog-paths.js";

export interface SkilldexConfiguration {
  get(section: string): unknown;
}

export function readSkilldexSettings(configuration: SkilldexConfiguration): SkilldexSettings {
  return {
    showSkills: coerceShown(configuration.get("showSkills")),
    showRules: coerceShown(configuration.get("showRules")),
    showLiveArea: coerceShown(configuration.get("showLiveArea")),
  };
}

export function readAiToolDirectory(configuration: SkilldexConfiguration): string {
  return coerceAiToolDirectory(configuration.get(AI_TOOL_DIRECTORY_SETTING));
}

function coerceShown(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  return true;
}
