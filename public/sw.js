// O Vanzeiro — keeps a copy of the app on the phone, so it opens and works without signal (inside the van).
// Always tries the internet first, so a new version is never held back; the copy is used only when there is no signal.

const CACHE = "vanzeiro-v1";
const PAGINAS = ["/", "/entrar", "/criar-conta", "/como-vai-usar", "/vanzeiro", "/passageiro", "/manifest.webmanifest", "/favicon.svg"];
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
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
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

// Phone notifications. Now they come from the open app; with the database, the server sends them ("push"),
// even with the app closed, as { titulo, corpo, url }.
self.addEventListener("push", (event) => {
  let dados = {};
  try {
    dados = event.data ? event.data.json() : {};
  } catch (e) {
    dados = { corpo: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(dados.titulo || "O Vanzeiro", {
      body: dados.corpo || "",
      icon: "/icones/icone-192.png",
      badge: "/icones/icone-192.png",
      data: { url: dados.url || "/" },
    }),
  );
});

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

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
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
