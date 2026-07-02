// Small UX feedback helpers: screen-shake micro-interaction + audio beep.
// Used when the user unlocks Ultra tier or finishes a training protocol.

/** Briefly shake the whole viewport. */
export function screenShake(ms = 600) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.classList.remove("screen-shake");
  // force reflow so re-applying the class restarts the animation
  void el.offsetWidth;
  el.classList.add("screen-shake");
  window.setTimeout(() => el.classList.remove("screen-shake"), ms);
}

/** Short 2-tone confirmation beep via Web Audio API (no assets needed). */
export function successBeep() {
  try {
    const AC =
      (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const now = ctx.currentTime;
    const tone = (freq: number, start: number, dur: number, gain = 0.18) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, now + start);
      g.gain.linearRampToValueAtTime(gain, now + start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      o.connect(g).connect(ctx.destination);
      o.start(now + start);
      o.stop(now + start + dur + 0.02);
    };
    tone(660, 0, 0.18);
    tone(990, 0.14, 0.28, 0.14);
    window.setTimeout(() => ctx.close().catch(() => {}), 800);
  } catch {
    /* audio unavailable — silent no-op */
  }
}

export function celebrate() {
  screenShake();
  successBeep();
}