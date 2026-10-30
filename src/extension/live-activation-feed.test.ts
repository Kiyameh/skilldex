import { describe, expect, it, vi } from "vitest";
import { createLiveActivationFeed, type LiveActivationFeed } from "./live-activation-feed.js";

const SKILL_FILE_PATH = "/repo/.cursor/skills/demo/SKILL.md";

function activate(feed: LiveActivationFeed, name: string): void {
  feed.addActivation(name, "repo", SKILL_FILE_PATH);
}

describe("createLiveActivationFeed", () => {
  it("starts running with an empty list", () => {
    expect(createLiveActivationFeed().getSnapshot()).toEqual({ watching: true, chips: [] });
  });

  it("puts the newest activation first and keeps the order of the rest", () => {
    const feed = createLiveActivationFeed();
    activate(feed, "coding-conventions");
    activate(feed, "maquetado");
    activate(feed, "testing");

    expect(feed.getSnapshot().chips.map((chip) => chip.name)).toEqual([
      "testing",
      "maquetado",
      "coding-conventions",
    ]);
  });

  it("stamps each activation with the instant it was recorded", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-30T10:08:00.000Z"));
    try {
      const feed = createLiveActivationFeed();
      activate(feed, "maquetado");
      expect(feed.getSnapshot().chips[0]?.activatedAt).toBe("2026-10-30T10:08:00.000Z");
    } finally {
      vi.useRealTimers();
    }
  });

  it("adds a separate chip with its own id when a name repeats", () => {
    const feed = createLiveActivationFeed();
    activate(feed, "maquetado");
    activate(feed, "maquetado");

    const [newest, oldest] = feed.getSnapshot().chips;
    expect(newest?.name).toBe("maquetado");
    expect(oldest?.name).toBe("maquetado");
    expect(newest?.id).not.toBe(oldest?.id);
    expect(newest?.workspaceName).toBe("repo");
    expect(oldest?.workspaceName).toBe("repo");
    expect(feed.getSkillFilePath(newest?.id ?? "")).toBe(SKILL_FILE_PATH);
  });

  it("forgets the skill file when the feed is reset", () => {
    const feed = createLiveActivationFeed();
    activate(feed, "maquetado");
    const id = feed.getSnapshot().chips[0]?.id ?? "";

    feed.reset();

    expect(feed.getSkillFilePath(id)).toBeUndefined();
  });

  it("keeps current chips when stopped and discards activations during the pause", () => {
    const feed = createLiveActivationFeed();
    activate(feed, "maquetado");
    feed.setWatching(false);
    activate(feed, "testing");

    expect(feed.getSnapshot()).toEqual({
      watching: false,
      chips: [expect.objectContaining({ name: "maquetado" })],
    });
  });

  it("accepts activations again after resuming without backfilling the pause", () => {
    const feed = createLiveActivationFeed();
    feed.setWatching(false);
    activate(feed, "during-pause");
    feed.setWatching(true);
    activate(feed, "after-resume");

    expect(feed.getSnapshot().chips.map((chip) => chip.name)).toEqual(["after-resume"]);
  });

  it("clears every chip on reset and keeps the watching state", () => {
    const feed = createLiveActivationFeed();
    for (let index = 0; index < 9; index += 1) activate(feed, `skill-${index}`);
    feed.setWatching(false);
    feed.reset();

    expect(feed.getSnapshot()).toEqual({ watching: false, chips: [] });
  });

  it("notifies listeners on each change and not on a no-op", () => {
    const feed = createLiveActivationFeed();
    const listener = vi.fn();
    feed.onDidChange(listener);

    activate(feed, "maquetado");
    feed.setWatching(true);
    feed.setWatching(false);
    activate(feed, "ignored");
    feed.reset();

    expect(listener).toHaveBeenCalledTimes(3);
    expect(listener).toHaveBeenLastCalledWith({ watching: false, chips: [] });
  });
});
