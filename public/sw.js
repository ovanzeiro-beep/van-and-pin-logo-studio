// O Vanzeiro — keeps a copy of the app on the phone, so it opens and works without signal (inside the van).
// Always tries the internet first, so a new version is never held back; the copy is used only when there is no signal.

const CACHE = "vanzeiro-v2";
/** The last data read from the database, for opening without signal (same name as in src/lib/conta.ts). */
const DADOS = "vanzeiro-dados-v2";
const PAGINAS = [
  "/",
  "/entrar",
  "/criar-conta",
  "/como-vai-usar",
  "/vanzeiro",
  "/vanzeiro/viagem",
  "/passageiro",
  "/manifest.webmanifest",
  "/favicon.svg",
];
const FONTES = ["https://fonts.googleapis.com", "https://fonts.gstatic.com"];

/** Saves a screen and the app files it uses (the ones every screen needs to start). */
async function guardarPagina(cache, url) {
  const r = await fetch(url);
  if (!r.ok) return;
  const html = await r.clone().text();
  await cache.put(url, r);
  const arquivos = [...new Set(html.match(/\/assets\/[^"'\s)]+/g) || [])];
  await Promise.all(arquivos.map((a) => cache.add(a).catch(() => undefined)));
}

// The same address as the fonts link in src/routes/__root.tsx.
const LETRAS =
  "https://fonts.googleapis.com/css2?family=Google+Sans:wght@500&family=Manrope:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&display=swap";

/** Saves the fonts used in Portuguese (the "latin" parts), so every screen keeps its letters without signal. */
async function guardarLetras(cache) {
  const r = await fetch(LETRAS);
  if (!r.ok) return;
  const css = await r.clone().text();
  await cache.put(LETRAS, r);
  const blocos = css.split("/* ").filter((b) => b.startsWith("latin */") || b.startsWith("latin-ext */"));
  const arquivos = blocos.flatMap((b) => b.match(/https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2/g) || []);
  await Promise.all([...new Set(arquivos)].map((a) => cache.add(a).catch(() => undefined)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all([...PAGINAS.map((url) => guardarPagina(cache, url).catch(() => undefined)), guardarLetras(cache).catch(() => undefined)]),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE && n !== DADOS).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

function guardar(request, resposta) {
  if (resposta && (resposta.ok || resposta.type === "opaque")) {
    const copia = resposta.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copia));
  }
  return resposta;
}

// Phone notifications: from the open app, and from the server ("push", W10), even with the app closed, as
// { titulo, corpo, url, tag }. The same notice has the same tag, so it never shows twice.
self.addEventListener("push", (event) => {
  let dados = {};
  try {
    dados = event.data ? event.data.json() : {};
  } catch (e) {
    dados = { corpo: event.data ? event.data.text() : "" };
  }
  if (dados?.chegada === true) {
    event.waitUntil(receberAvisoDeChegada(dados));
    return;
  }
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((janelas) => {
      // The app is on the screen: it plays its own loud alert (vibrates and rings) and shows the notice on the bell.
      const naTela = janelas.filter((j) => j.visibilityState === "visible");
      if (naTela.length > 0) {
        naTela.forEach((j) => j.postMessage({ tipo: "aviso-novo" }));
        return undefined;
      }
      return mostrarNotificacao(dados);
    }),
  );
});

// A van pode avançar entre o envio ao serviço de push e a entrega no aparelho.
async function receberAvisoDeChegada(dados) {
  const janelas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  // Só o painel do passageiro aberto acompanha o registro e toca por conta própria.
  const painelVisivel = janelas.some((janela) => {
    if (janela.visibilityState !== "visible") return false;
    const caminho = new URL(janela.url).pathname;
    return caminho === "/passageiro" || caminho.startsWith("/passageiro/");
  });
  if (painelVisivel) return;
  const consulta = new URL("https://rnziztwicggdekmpwpgy.supabase.co/functions/v1/avisos-no-celular");
  consulta.searchParams.set("chegada", dados.tag);
  const controle = new AbortController();
  const prazo = setTimeout(() => controle.abort(), 5000);
  try {
    const resposta = await fetch(consulta, { cache: "no-store", signal: controle.signal });
    if (resposta.ok && (await resposta.json()).ativa === true) await mostrarNotificacao(dados);
  } catch {
    // Sem verificar a parada atual, o alerta poderia chamar alguém quando a van já seguiu.
  } finally {
    clearTimeout(prazo);
  }
}

/** Minimized, screen off or app closed: the phone's notification. */
function mostrarNotificacao(dados) {
  return self.registration.showNotification(dados.titulo || "O Vanzeiro", {
    body: dados.corpo || "",
    icon: "/icones/icone-192.png",
    badge: "/icones/icone-192.png",
    // Each notice vibrates and plays the phone's notification sound (also when it replaces an older one).
    // Same as VIBRACAO in src/lib/alerta.ts: a strong one, then gentle taps that grow.
    vibrate: [700, 300, 80, 250, 120, 220, 200, 180, 320, 150, 500, 120, 800],
    silent: false,
    ...(dados.tag ? { tag: dados.tag, renotify: true } : {}),
    data: { url: dados.url || "/" },
  });
}

// Tapping a notification opens the app on the Notificações screen (or brings it to the front).
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((janelas) => {
      for (const j of janelas) {
        if ("focus" in j) return j.navigate(url).then((x) => (x || j).focus()).catch(() => j.focus());
      }
      return self.clients.openWindow(url);
    }),
  );
});

// Keep offline Supabase responses separate even if an old request finishes after sign-out.
async function dadosDaConta(request) {
  const autenticacao = request.headers.get("Authorization");
  if (!autenticacao) return fetch(request);

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(autenticacao));
  const chave = new URL(request.url);
  chave.searchParams.set(
    "__conta_offline",
    Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join(""),
  );
  try {
    const resposta = await fetch(request);
    if (resposta.ok) {
      const copia = resposta.clone();
      await caches
        .open(DADOS)
        .then((cache) => cache.put(chave.href, copia))
        .catch(() => undefined);
    }
    return resposta;
  } catch {
    return (
      (await caches.match(chave.href, { cacheName: DADOS }).catch(() => undefined)) ||
      Response.error()
    );
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // The data read from the database (destinos, passageiros, cobranças…): internet first; without signal, the last copy
  // read on this phone, so the app opens with the data inside the van. The copy is erased when the person logs out.
  if (url.hostname.endsWith(".supabase.co") && url.pathname.startsWith("/rest/v1/")) {
    event.respondWith(dadosDaConta(request));
    return;
  }

  const mesmoSite = url.origin === self.location.origin;
  if (!mesmoSite && !FONTES.includes(url.origin)) return;

  // Opening a screen: internet first; without signal, the saved copy of that screen, or of the start screen.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((r) => guardar(request, r))
        .catch(() => caches.match(request).then((r) => r || caches.match("/"))),
    );
    return;
  }

  // App files with a fixed name per version, and the fonts: the saved copy first (they never change).
  if ((mesmoSite && url.pathname.startsWith("/assets/")) || !mesmoSite) {
    event.respondWith(caches.match(request).then((r) => r || fetch(request).then((resp) => guardar(request, resp))));
    return;
  }

  // Everything else: internet first, the saved copy without signal.
  event.respondWith(
    fetch(request)
      .then((r) => guardar(request, r))
      .catch(() => caches.match(request).then((r) => r || Response.error())),
  );
});
