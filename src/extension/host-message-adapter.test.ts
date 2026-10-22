import { afterEach, describe, expect, it, vi } from "vitest";
import type { Disposable, Webview } from "vscode";
import { HOST_TO_WEBVIEW_MESSAGE_TYPES, WEBVIEW_TO_HOST_MESSAGE_TYPES } from "../shared/index.js";
import { startHostMessageHandling } from "./host-message-adapter.js";

interface FakeWebview {
  webview: Webview;
  posted: unknown[];
  emit: (payload: unknown) => void;
}

function createFakeWebview(): FakeWebview {
  const listeners: Array<(payload: unknown) => unknown> = [];
  const posted: unknown[] = [];

  const emit = (payload: unknown): void => {
    for (const listener of listeners) listener(payload);
  };

  const webview = {
    postMessage: (message: unknown) => {
      posted.push(message);
      return Promise.resolve(true);
    },
    onDidReceiveMessage: (listener: (e: unknown) => unknown): Disposable => {
      listeners.push(listener);
      return {
        dispose: () => {
          const index = listeners.indexOf(listener);
          if (index >= 0) listeners.splice(index, 1);
        },
      };
    },
  } as Webview;

  return { webview, posted, emit };
}

describe("startHostMessageHandling", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("posts host ready immediately and completes after webview ready", () => {
    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(webview, {
      getWorkspaceRoot: () => undefined,
    });

    expect(posted).toEqual([{ type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready }]);

    emit({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.ready });
    handling.dispose();
  });

  it("retries host ready until the webview replies", async () => {
    vi.useFakeTimers();
    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(webview, {
      getWorkspaceRoot: () => undefined,
    });

    expect(posted).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(100);
    expect(posted.length).toBeGreaterThan(1);

    emit({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.ready });
    const postedAfterHandshake = posted.length;
    await vi.advanceTimersByTimeAsync(500);
    expect(posted).toHaveLength(postedAfterHandshake);

    handling.dispose();
  });

  it("does not complete handshake on catalog request", () => {
    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(webview, {
      getWorkspaceRoot: () => undefined,
    });

    emit({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.catalogRequest });
    expect(posted[0]).toEqual({ type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready });
    expect(
      posted.some(
        (message) =>
          typeof message === "object" &&
          message !== null &&
          "type" in message &&
          message.type === HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
      ),
    ).toBe(true);

    handling.dispose();
  });

  it("replies with an empty catalog when workspace root is missing", async () => {
    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(webview, {
      getWorkspaceRoot: () => undefined,
    });

    emit({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.catalogRequest });
    await vi.waitFor(() => {
      expect(posted).toContainEqual({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
        skills: [],
        rules: [],
      });
    });

    handling.dispose();
  });

  it("ignores payloads that are not webview-to-host messages", () => {
    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(webview, {
      getWorkspaceRoot: () => undefined,
    });

    emit({ type: "unknown" });
    emit(null);
    expect(posted).toEqual([{ type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready }]);

    handling.dispose();
  });
});
