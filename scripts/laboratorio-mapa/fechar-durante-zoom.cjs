// CORREÇÃO 4 — o erro de produção "Cannot read properties of undefined (reading '_leaflet_pos')".
// Abre e fecha o mapa 60 vezes num Chromium, fechando durante zoom animado (duplo toque e foco por GPS/busca) e sem
// animação, com 0, 40, 100 e 200 ms de espera. Esperado: nenhum erro. Antes da correção: 40 de 40 com erro nos
// casos com zoom (docs/evidencias/2026-11-20-correcao4-mapa.md).
// Uso: node scripts/laboratorio-mapa/fechar-durante-zoom.cjs
const { spawn } = require("node:child_process");
const path = require("node:path");
const { chromium } = require("playwright");

(async () => {
  const pasta = path.join(__dirname, "componente");
  const servidor = spawn("npx", ["vite", "--config", path.join(pasta, "vite.config.mjs")], {
    cwd: path.join(__dirname, "../.."),
    stdio: "ignore",
  });
  try {
    for (let i = 0; i < 60; i++) {
      const ok = await fetch("http://127.0.0.1:5175/")
        .then((r) => r.ok)
        .catch(() => false);
      if (ok) break;
      await new Promise((r) => setTimeout(r, 500));
    }
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.route("https://**", (r) => r.abort());
    const erros = [];
    page.on("pageerror", (e) => erros.push(e.message));
    await page.goto("http://127.0.0.1:5175/");
    const res = {};
    const acoes = {
      "duplo toque": () => page.dblclick(".leaflet-container", { position: { x: 200, y: 250 } }),
      "foco (GPS/busca)": () => page.evaluate(() => window.focar(11)),
      "sem animação": async () => {},
    };
    for (const [nome, acao] of Object.entries(acoes)) {
      let n = 0;
      for (const espera of [0, 40, 100, 200])
        for (let i = 0; i < 5; i++) {
          await page.evaluate(() => window.abrir());
          await page.waitForSelector(".leaflet-container .leaflet-map-pane", {
            state: "attached",
            timeout: 5000,
          });
          await page.waitForTimeout(600);
          const antes = erros.length;
          await acao();
          await page.waitForTimeout(espera);
          await page.evaluate(() => window.fechar());
          await page.waitForTimeout(400);
          n += erros.length - antes;
        }
      res[nome] = `${n}/20 com erro`;
    }
    await page.evaluate(() => window.abrir());
    await page.waitForSelector(".leaflet-container .leaflet-map-pane", {
      state: "attached",
      timeout: 5000,
    });
    res["reabre e desenha a rota"] = (await page.locator(".leaflet-interactive").count()) > 0;
    res["mensagens"] = [...new Set(erros)];
    console.log(JSON.stringify(res, null, 1));
    const passou = erros.length === 0 && res["reabre e desenha a rota"];
    console.log(passou ? "FECHAR DURANTE ZOOM: PASSOU" : "FECHAR DURANTE ZOOM: FALHOU");
    process.exitCode = passou ? 0 : 1;
    await browser.close();
  } finally {
    servidor.kill();
  }
})();
