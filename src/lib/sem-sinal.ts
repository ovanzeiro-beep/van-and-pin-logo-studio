import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

// Without signal inside the van (decision A1 of the owner, 15/11/2026): the app keeps a copy of itself
// on the phone (public/sw.js) and opens and works without internet.

/** Where the copy is NOT kept: while editing (dev) and inside the Lovable editor's preview, so edits always show. */
export function podeGuardarCopia(a: { emDesenvolvimento: boolean; dentroDeOutraTela: boolean; temSuporte: boolean }) {
  return a.temSuporte && !a.emDesenvolvimento && !a.dentroDeOutraTela;
}

/** Same name as in public/sw.js. */
const COPIA = "vanzeiro-v1";

/** The app files and fonts this screen already loaded, which the copy must have. */
export function arquivosParaGuardar(enderecos: string[], site: string) {
  return [...new Set(enderecos)].filter(
    (u) => u.startsWith(`${site}/assets/`) || u.startsWith("https://fonts.googleapis.com/") || u.startsWith("https://fonts.gstatic.com/"),
  );
}

/** Files loaded before the copy started working never passed through it: saves them now. */
async function guardarArquivosCarregados() {
  const enderecos = performance.getEntriesByType("resource").map((e) => e.name);
  const cache = await caches.open(COPIA);
  const ja = new Set((await cache.keys()).map((r) => r.url));
  await Promise.all(
    arquivosParaGuardar(enderecos, location.origin)
      .filter((u) => !ja.has(u))
      .map((u) => cache.add(u).catch(() => undefined)),
  );
}

/** Saves the copy of the app and loads every screen once, so all of them open later without signal. */
export function useFuncionarSemSinal() {
  const router = useRouter();
  useEffect(() => {
    const pode = podeGuardarCopia({
      emDesenvolvimento: import.meta.env.DEV,
      dentroDeOutraTela: window.self !== window.top,
      temSuporte: "serviceWorker" in navigator,
    });
    if (!pode) return;
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => navigator.serviceWorker.ready)
      .then(() => Promise.all(Object.values(router.routesById).map((rota) => router.loadRouteChunk(rota as never))))
      .then(() => guardarArquivosCarregados())
      .catch(() => undefined);
  }, [router]);
}
