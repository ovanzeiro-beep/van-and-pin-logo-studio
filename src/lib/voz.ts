import { useEffect, useSyncExternalStore } from "react";
import type { Destino, Passageiro } from "@/data/exemplo";
import { proximoDaBusca, proximoDaVolta, type ViagemDoDia } from "@/lib/viagem";

// Driving mode with voice (section 18 of docs/fonte-da-verdade.md): during the trip the phone says who is next,
// so the vanzeiro doesn't need to read the screen while driving. It uses the phone's own voice (no internet, no
// server). Off until the vanzeiro turns it on; it stays on until the page is reloaded.

/** What the app says at this moment of the trip, with the same words as the screen; null when there is nothing to say. */
export function fraseDaViagem(v: ViagemDoDia, passageiros: Pick<Passageiro, "id" | "nome" | "endereco" | "cidade">[], destino?: Pick<Destino, "destino">): string | null {
  const quem = (id: string | undefined) => passageiros.find((p) => p.id === id);
  const dizer = (rotulo: string, id: string | undefined) => {
    const p = quem(id);
    return p ? `${rotulo}: ${p.nome}, ${p.endereco}, em ${p.cidade}.` : null;
  };
  switch (v.fase) {
    case "busca":
      return proximoDaBusca(v) ? dizer("Próximo passageiro", proximoDaBusca(v)) : `Todos buscados. Siga para ${destino?.destino ?? "o destino"}.`;
    case "volta":
      return proximoDaVolta(v) ? dizer("Próxima descida", proximoDaVolta(v)) : "Todos deixados em casa.";
    case "parada":
      return "Parada. Antes de seguir, confira quem está na van.";
    case "conferencia":
    case "conferencia-volta":
      return "Confira quem está na van.";
    case "chegada":
      return `Chegamos em ${destino?.destino ?? "o destino"}.`;
    default:
      return null;
  }
}

let ligada = false;
const ouvintes = new Set<() => void>();
const inscrever = (o: () => void) => {
  ouvintes.add(o);
  return () => {
    ouvintes.delete(o);
  };
};

export const vozDisponivel = () => typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";

export function useVozLigada() {
  return useSyncExternalStore(inscrever, () => ligada, () => false);
}

export function alternarVoz() {
  ligada = !ligada;
  if (!ligada && vozDisponivel()) window.speechSynthesis.cancel();
  ouvintes.forEach((o) => o());
}

/** Speaks now, in Brazilian Portuguese, cutting whatever was still being said. */
function falar(texto: string) {
  if (!vozDisponivel()) return;
  window.speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = "pt-BR";
  fala.rate = 1;
  window.speechSynthesis.speak(fala);
}

/** While the voice is on, says the phrase of the moment every time it changes (and right when it is turned on). */
export function useVozDaViagem(frase: string | null) {
  const voz = useVozLigada();
  useEffect(() => {
    if (voz && frase) falar(frase);
  }, [voz, frase]);
}
