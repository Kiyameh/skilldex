import { useEffect, useState } from "react";
import {
  HOST_TO_WEBVIEW_MESSAGE_TYPES,
  type CatalogPayload,
} from "../shared/index.js";
import { requestCatalog, subscribeToHostMessages } from "./host-message-bridge";
import type { HandshakeStatus } from "./use-host-handshake";

export function useCatalog(handshakeStatus: HandshakeStatus): CatalogPayload | undefined {
  const [catalog, setCatalog] = useState<CatalogPayload | undefined>(undefined);

  useEffect(() => {
    if (handshakeStatus !== "connected") return;

    requestCatalog();

    return subscribeToHostMessages((message) => {
      if (message.type !== HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog) return;
      setCatalog({
        skills: message.skills,
        rules: message.rules,
      });
    });
  }, [handshakeStatus]);

  return catalog;
}
