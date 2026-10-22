import { useEffect, useState } from "react";
import { replyToHostReady, subscribeToHostMessages } from "./host-message-bridge";

export type HandshakeStatus = "waiting" | "connected";

export function useHostHandshake(): HandshakeStatus {
  const [status, setStatus] = useState<HandshakeStatus>("waiting");

  useEffect(() => {
    return subscribeToHostMessages((message) => {
      replyToHostReady(message);
      setStatus("connected");
      console.log("SkillDex handshake complete");
    });
  }, []);

  return status;
}
