import { useEffect, useState } from "react";
import { HOST_TO_WEBVIEW_MESSAGE_TYPES, type SkilldexSettings } from "../shared/index.js";
import { subscribeToHostMessages } from "./host-message-bridge";

export function useSkilldexSettings(): SkilldexSettings | undefined {
  const [settings, setSettings] = useState<SkilldexSettings | undefined>(undefined);

  useEffect(() => {
    return subscribeToHostMessages((message) => {
      if (message.type !== HOST_TO_WEBVIEW_MESSAGE_TYPES.settings) return;
      setSettings({
        showSkills: message.showSkills,
        showRules: message.showRules,
        remoteSkillsRepositoryUrl: message.remoteSkillsRepositoryUrl,
      });
    });
  }, []);

  return settings;
}
