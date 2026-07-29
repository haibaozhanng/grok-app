/**
 * Sidebar "unread" markers when a turn finishes while the user is elsewhere.
 * Pure helpers — App owns React state.
 */

import type { SessionState } from "./session";
import { isSessionLiveStreaming } from "./session";
import type { SessionLiveMap, SessionLiveSnapshot } from "./sessionLiveStore";

/** sessionId → epoch ms when marked unread */
export type UnreadMap = Record<string, number>;

export function markUnread(
  map: UnreadMap,
  sessionId: string,
  atMs: number = Date.now(),
): UnreadMap {
  if (!sessionId) return map;
  if (map[sessionId] === atMs) return map;
  return { ...map, [sessionId]: atMs };
}

export function clearUnread(map: UnreadMap, sessionId: string): UnreadMap {
  if (!sessionId || map[sessionId] == null) return map;
  const next = { ...map };
  delete next[sessionId];
  return next;
}

export function isUnread(map: UnreadMap, sessionId: string): boolean {
  return map[sessionId] != null;
}

/** True while the sidebar should show the working spinner (not unread). */
export function snapshotIsTurnBusy(
  snap: SessionLiveSnapshot | null | undefined,
): boolean {
  if (!snap) return false;
  return (
    snap.awaitingPermission ||
    isSessionLiveStreaming(snap.state) ||
    snap.state === "awaiting_permission"
  );
}

export function stateIsTurnBusy(state: SessionState | null | undefined): boolean {
  if (!state) return false;
  return isSessionLiveStreaming(state) || state === "awaiting_permission";
}

/** Turn finished projection (spinner should leave). */
export function stateIsTurnSettled(
  state: SessionState | null | undefined,
): boolean {
  return state === "ready" || state === "idle" || state === "disconnected";
}

/**
 * Should we mark unread + toast + chime?
 * Only when a previously-busy turn settles and the user is not viewing that chat.
 */
export function shouldMarkUnreadOnSettle(opts: {
  sessionId: string | null | undefined;
  nextState: SessionState | null | undefined;
  wasBusy: boolean;
  viewingSessionId: string | null | undefined;
}): boolean {
  const sid = opts.sessionId?.trim();
  if (!sid || !opts.wasBusy) return false;
  if (!stateIsTurnSettled(opts.nextState)) return false;
  if (opts.viewingSessionId && opts.viewingSessionId === sid) return false;
  return true;
}

/** Look up prior busy flag from liveMap before a projection update. */
export function wasBusyInLiveMap(
  map: SessionLiveMap,
  sessionId: string | null | undefined,
): boolean {
  if (!sessionId) return false;
  return snapshotIsTurnBusy(map[sessionId]);
}
