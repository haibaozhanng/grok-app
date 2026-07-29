import { describe, expect, it } from "vitest";
import {
  clearUnread,
  isUnread,
  markUnread,
  shouldMarkUnreadOnSettle,
  snapshotIsTurnBusy,
} from "./sessionUnread";
import { emptyLiveSnapshot } from "./sessionLiveStore";

describe("sessionUnread", () => {
  it("marks and clears", () => {
    let m = markUnread({}, "a", 100);
    expect(isUnread(m, "a")).toBe(true);
    m = clearUnread(m, "a");
    expect(isUnread(m, "a")).toBe(false);
  });

  it("only marks when busy→settled off-view", () => {
    expect(
      shouldMarkUnreadOnSettle({
        sessionId: "s1",
        nextState: "ready",
        wasBusy: true,
        viewingSessionId: "other",
      }),
    ).toBe(true);
    expect(
      shouldMarkUnreadOnSettle({
        sessionId: "s1",
        nextState: "ready",
        wasBusy: true,
        viewingSessionId: "s1",
      }),
    ).toBe(false);
    expect(
      shouldMarkUnreadOnSettle({
        sessionId: "s1",
        nextState: "ready",
        wasBusy: false,
        viewingSessionId: "other",
      }),
    ).toBe(false);
    expect(
      shouldMarkUnreadOnSettle({
        sessionId: "s1",
        nextState: "streaming",
        wasBusy: true,
        viewingSessionId: "other",
      }),
    ).toBe(false);
  });

  it("snapshotIsTurnBusy", () => {
    const idle = emptyLiveSnapshot("x");
    expect(snapshotIsTurnBusy(idle)).toBe(false);
    expect(
      snapshotIsTurnBusy({ ...idle, state: "streaming" }),
    ).toBe(true);
    expect(
      snapshotIsTurnBusy({ ...idle, awaitingPermission: true }),
    ).toBe(true);
  });
});
