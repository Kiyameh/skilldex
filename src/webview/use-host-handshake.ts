import { useEffect, useState } from "react";
import { HOST_TO_WEBVIEW_MESSAGE_TYPES } from "../shared/index.js";
import { replyToHostReady, subscribeToHostMessages } from "./host-message-bridge";

export type HandshakeStatus = "waiting" | "connected";

export function useHostHandshake(): HandshakeStatus {
  const [status, setStatus] = useState<HandshakeStatus>("waiting");

  useEffect(() => {
    return subscribeToHostMessages((message) => {
      if (message.type !== HOST_TO_WEBVIEW_MESSAGE_TYPES.ready) return;
      replyToHostReady(message);
      setStatus("connected");
      console.log("SkillDex handshake complete");
    });
  }, []);

  return status;
}
