/**
 * Short in-app completion chime (Web Audio). No external assets.
 * Fail-closed: never throws into the UI path.
 */

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!sharedCtx) {
    try {
      sharedCtx = new AC();
    } catch {
      return null;
    }
  }
  return sharedCtx;
}

/** Soft two-note chime (~0.35s). Safe to call from any event handler. */
export function playCompletionChime(): void {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    // Autoplay policy: resume if suspended (user already interacted with app).
    if (ctx.state === "suspended") {
      void ctx.resume().catch(() => {
        /* ignore */
      });
    }
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    master.connect(ctx.destination);

    const tone = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.9, start + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(g);
      g.connect(master);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    };

    // Pleasant "done" interval (C6 → E6-ish).
    tone(1046.5, now, 0.16);
    tone(1318.5, now + 0.12, 0.2);
  } catch {
    /* ignore */
  }
}
