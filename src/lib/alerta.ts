import { useEffect } from "react";

// With the app on the screen, a new notice from the server vibrates the phone and rings loud (decision of the owner,
// 16/11/2026: "vibrar e tocar" also with the app open). Minimized or closed, the phone's notification does it (public/sw.js).

let ultimo = 0;

/**
 * The vibration the owner asked for (16/11/2026): a strong one, then gentle taps that grow longer and stronger.
 * (The phone vibrates on and off: "stronger" is made with longer pulses.) Also used by the notification (public/sw.js).
 */
export const VIBRACAO = [700, 300, 80, 250, 120, 220, 200, 180, 320, 150, 500, 120, 800];
let som: AudioContext | null = null;

/** Two strong beeps and a long vibration; never twice in a row for the same news. */
export function tocarAlerta(agora = Date.now()): boolean {
  if (agora - ultimo < 3000) return false;
  ultimo = agora;
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    // The phone only lets a page vibrate after a touch on it: if it refused now, it vibrates on the next touch.
    if (!navigator.vibrate(VIBRACAO))
      window.addEventListener("pointerdown", () => navigator.vibrate(VIBRACAO), { once: true });
  }
  try {
    const Contexto =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Contexto) return true;
    som ??= new Contexto();
    void som.resume();
    for (const inicio of [0, 0.35]) {
      const t = som.currentTime + inicio;
      const nota = som.createOscillator();
      const volume = som.createGain();
      nota.type = "square";
      nota.frequency.setValueAtTime(988, t);
      nota.frequency.setValueAtTime(1319, t + 0.12);
      volume.gain.setValueAtTime(0.0001, t);
      volume.gain.exponentialRampToValueAtTime(1, t + 0.02);
      volume.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      nota.connect(volume).connect(som.destination);
      nota.start(t);
      nota.stop(t + 0.32);
    }
  } catch {
    // No sound on this phone: the vibration is enough.
  }
  return true;
}

/** In the root of the app: the server says a notice arrived while the app is on the screen → alert and show it. */
export function useAlertaComAppAberto(atualizar: () => void) {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const ouvir = (e: MessageEvent) => {
      if ((e.data as { tipo?: string } | null)?.tipo !== "aviso-novo") return;
      tocarAlerta();
      atualizar();
    };
    navigator.serviceWorker.addEventListener("message", ouvir);
    return () => navigator.serviceWorker.removeEventListener("message", ouvir);
  }, [atualizar]);
}
