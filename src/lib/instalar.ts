import { useEffect, useState, useSyncExternalStore } from "react";

// Installing the app from the link (no store). Android/Chrome offers it through an event the app keeps
// until the person taps "Instalar o app"; the iPhone has no such offer, so the app explains how to add it.

type PedidoDeInstalacao = Event & { prompt: () => Promise<void> };

export type ComoInstalar = "botao" | "iphone" | null;

/** What "Instalar o app" does: open the install (Android/Chrome), explain it (iPhone), or nothing (installed / not possible). */
export function comoInstalar(a: {
  instalado: boolean;
  temPedido: boolean;
  ehIphone: boolean;
}): ComoInstalar {
  if (a.instalado) return null;
  if (a.temPedido) return "botao";
  if (a.ehIphone) return "iphone";
  return null;
}

let pedido: PedidoDeInstalacao | null = null;
const ouvintes = new Set<() => void>();
const avisar = () => ouvintes.forEach((o) => o());

function inscrever(o: () => void) {
  ouvintes.add(o);
  return () => ouvintes.delete(o);
}

// Listens from the moment the app loads: the browser's offer can come before the Entrar screen opens.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    pedido = e as PedidoDeInstalacao;
    avisar();
  });
  window.addEventListener("appinstalled", () => {
    pedido = null;
    avisar();
  });
}

function estaInstalado() {
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return (
    standalone ||
    matchMedia("(display-mode: fullscreen)").matches ||
    matchMedia("(display-mode: standalone)").matches
  );
}

const ehIphone = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

export function useComoInstalar(): ComoInstalar {
  const temPedido = useSyncExternalStore(
    inscrever,
    () => pedido !== null,
    () => false,
  );
  // Phone checks only after the screen is on the phone, so the first drawing is the same everywhere.
  const [noAparelho, setNoAparelho] = useState(false);
  useEffect(() => setNoAparelho(true), []);
  if (!noAparelho) return null;
  return comoInstalar({ instalado: estaInstalado(), temPedido, ehIphone: ehIphone() });
}

/** Opens the browser's install window (Android/Chrome). */
export async function instalar() {
  const atual = pedido;
  if (!atual) return;
  pedido = null;
  avisar();
  await atual.prompt();
}
