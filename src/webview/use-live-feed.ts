import { useEffect, useState } from "react";
import { HOST_TO_WEBVIEW_MESSAGE_TYPES, type LiveFeedSnapshot } from "../shared/index.js";
import {
  requestResetLiveFeed,
  requestSetLiveWatching,
  subscribeToHostMessages,
} from "./host-message-bridge";

const INITIAL_LIVE_FEED: LiveFeedSnapshot = { watching: true, chips: [] };

export interface UseLiveFeedResult extends LiveFeedSnapshot {
  toggleWatching: () => void;
  reset: () => void;
}

export function useLiveFeed(): UseLiveFeedResult {
  const [snapshot, setSnapshot] = useState<LiveFeedSnapshot>(INITIAL_LIVE_FEED);

  useEffect(() => {
    return subscribeToHostMessages((message) => {
      if (message.type !== HOST_TO_WEBVIEW_MESSAGE_TYPES.liveFeed) return;
      setSnapshot({ watching: message.watching, chips: message.chips });
    });
  }, []);

  return {
    ...snapshot,
    toggleWatching: () => requestSetLiveWatching(!snapshot.watching),
    reset: requestResetLiveFeed,
  };
}
