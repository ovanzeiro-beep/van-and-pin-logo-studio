// CORREÇÃO 4 — percurso completo do passageiro no app de verdade (Chromium), com o Supabase SIMULADO no navegador.
// Nada sai para a internet: banco, busca de cidades e mapas são respondidos aqui, com dados fictícios.
// Uso: com o app rodando (npx vite --port 5176 --host 127.0.0.1), node scripts/laboratorio-mapa/percurso-passageiro.cjs
const { chromium } = require("playwright");

const BASE = process.env.APP_URL || "http://127.0.0.1:5176";
const SUPABASE = "https://rnziztwicggdekmpwpgy.supabase.co";
const P = "11111111-1111-4111-8111-111111111111";
const V = "22222222-2222-4222-8222-222222222222";
const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const exp = Math.floor(Date.now() / 1000) + 3600;
const usuario = {
  id: P,
  aud: "authenticated",
  role: "authenticated",
  email: "passageiro@exemplo.invalid",
  app_metadata: { provider: "email" },
  user_metadata: { nome: "Ana Teste" },
};
const sessao = {
  access_token: `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: P, role: "authenticated", exp, aud: "authenticated" })}.assinatura`,
  token_type: "bearer",
  expires_in: 3600,
  expires_at: exp,
  refresh_token: "ficticio",
  user: usuario,
};

const tabelas = {
  contas: [
    {
      id: P,
      nome: "Ana Teste",
      ultimo_papel: "passageiro",
      aceite_termos_em: "2026-11-01T00:00:00Z",
      e_passageiro: true,
      e_vanzeiro: false,
    },
  ],
  perfis_vanzeiro: [
    {
      id: V,
      nome: "Vanzeiro Teste",
      telefone: "43999990000",
      pix: "pix-ficticio",
      van_modelo: "Sprinter",
      van_placa: "ABC-1D23",
      van_lugares: 15,
    },
  ],
  destinos: [
    {
      id: "d1",
      vanzeiro_id: V,
      origem: "Jacarezinho",
      destino: "Londrina",
      tipo: "fixa",
      dias: ["seg", "ter", "qua", "qui", "sex", "sab", "dom"],
      data: null,
      saida: "23:50",
      volta: null,
      volta_data: null,
      paradas: ["Santo Antônio da Platina"],
      cafe_parada: null,
      cafe_minutos: null,
      cafe_local: null,
      convite: "VAN-1234",
      prazo: "30min",
      ativo: true,
      criado_em: "2026-11-01T00:00:00Z",
    },
  ],
  matriculas: [
    {
      id: "m1",
      vanzeiro_id: V,
      destino_id: "d1",
      pessoa_id: P,
      nome: "Ana Teste",
      telefone: "43999990001",
      cidade: "Jacarezinho",
      endereco: "Rua Fictícia, 10",
      ponto_lat: -23.158,
      ponto_lng: -49.972,
      ordem: 3,
      plano: "viagem",
      valor: 3000,
      vencimento: null,
      desconta_faltas: false,
      valor_falta: null,
      entrou_em: "2026-11-01",
      saiu_em: null,
    },
  ],
  respostas: [
    {
      matricula_id: "m1",
      data: hoje,
      resposta: "vai",
      respondida_em: `${hoje}T09:00:00Z`,
      prazo: `${hoje}T23:20:00Z`,
    },
  ],
};
const cidades = {
  Jacarezinho: [-23.1606, -49.9692],
  "Santo Antônio da Platina": [-23.2953, -50.0786],
  Londrina: [-23.3045, -51.1696],
};

async function abrirApp(browser, { embarque, busca = "ok", destinoDesconhecido = false, escala = 1 }) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: escala });
  const erros = [];
  const chamadas = [];
  page.on("pageerror", (e) => erros.push(e.message));
  await page.addInitScript(
    ([k, s]) => localStorage.setItem(k, s),
    ["sb-rnziztwicggdekmpwpgy-auth-token", JSON.stringify(sessao)],
  );
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === new URL(BASE).origin) return route.continue();
    if (url.href.startsWith(`${SUPABASE}/auth/v1/user`)) return route.fulfill({ json: usuario });
    if (url.href.startsWith(`${SUPABASE}/auth/v1/token`)) return route.fulfill({ json: sessao });
    if (url.href.startsWith(`${SUPABASE}/rest/v1/rpc/`)) {
      const nome = url.pathname.split("/").pop();
      chamadas.push(`rpc ${nome}`);
      if (nome === "minha_viagem_de_hoje")
        return route.fulfill({
          json: [
            {
              viagem_id: `d1_${hoje}`,
              fase: "busca",
              na_ordem: true,
              embarcou: false,
              conferencia: null,
              comecou_em: new Date().toISOString(),
              volta_as: null,
              nao_estava: false,
            },
          ],
        });
      if (nome === "embarque_da_viagem")
        return embarque === "falha"
          ? route.fulfill({ status: 503, json: { message: "sem resposta" } })
          : route.fulfill({
              json: [
                {
                  total: 4,
                  embarcaram: 1,
                  iniciais: ["G. R."],
                  posicao: 3,
                  faltam_antes: 2,
                  eu_embarquei: false,
                },
              ],
            });
      if (nome === "lugares_da_viagem")
        return route.fulfill({ json: [{ lugares: 15, vao: 4, eu_vou: true }] });
      if (nome === "chegada_disponivel") return route.fulfill({ json: false });
      return route.fulfill({ json: null });
    }
    if (url.href.startsWith(`${SUPABASE}/rest/v1/`)) {
      const tabela = url.pathname.split("/").pop();
      chamadas.push(`get ${tabela}`);
      let linhas = tabelas[tabela] ?? [];
      if (destinoDesconhecido && tabela === "destinos")
        linhas = linhas.map((d) => ({
          ...d,
          origem: "Vila Fictícia do Norte",
          destino: "Vila Fictícia do Sul",
          paradas: [],
        }));
      const objeto = (route.request().headers()["accept"] || "").includes("vnd.pgrst.object");
      return route.fulfill({
        json: objeto ? (linhas[0] ?? null) : linhas,
        headers: { "content-range": `0-${Math.max(linhas.length - 1, 0)}/${linhas.length}` },
      });
    }
    if (url.hostname === "nominatim.openstreetmap.org") {
      if (busca === "falha") return route.abort("internetdisconnected");
      if (busca === "lenta") await new Promise((ok) => setTimeout(ok, 2500));
      const q = url.searchParams.get("q") ?? "";
      const c = cidades[q] ?? (destinoDesconhecido ? [-23.2, -50.0] : undefined);
      return route.fulfill({ json: c ? [{ lat: String(c[0]), lon: String(c[1]) }] : [] });
    }
    return route.abort();
  });
  return { page, erros, chamadas };
}

const PROIBIDO = /chega(rá)? (no seu ponto )?em|passando por|posição simulada/i;

(async () => {
  const browser = await chromium.launch();
  const r = {};
  // 1. Percurso completo com o banco respondendo
  {
    const { page, erros } = await abrirApp(browser, { embarque: "ok" });
    await page.goto(`${BASE}/passageiro`);
    await page.getByRole("link", { name: /Situação da van/ }).waitFor({ timeout: 20000 });
    r["1 Início: situação"] =
      (await page.getByText("Faltam 2 pessoas antes de você").count()) > 0
        ? "Faltam 2 pessoas antes de você"
        : "NÃO APARECEU";
    await page.getByRole("link", { name: /Situação da van/ }).click();
    await page.waitForURL("**/passageiro/van");
    const mapa = page.getByRole("application", {
      name: "Mapa da rota Jacarezinho → Londrina, com o seu ponto de embarque",
    });
    await mapa.waitFor({ timeout: 20000 });
    await page.waitForTimeout(1500);
    const texto = await page.locator("body").innerText();
    r["2 Mapa: título"] = (await page.getByText("Situação da van", { exact: true }).count()) > 0;
    r["3 Mapa: rota e ponto desenhados"] = {
      linhas: await page.locator("path.leaflet-interactive").count(),
      pino: await page.locator(".leaflet-marker-icon").count(),
    };
    r["4 Mapa: informações"] = [
      "Faltam 2 pessoas antes de você",
      "1 de 4 já embarcou",
      "O mapa ainda não mostra onde a van está agora.",
    ].map((t) => `${t}: ${texto.includes(t)}`);
    r["5 Mapa: nada fictício"] =
      !PROIBIDO.test(texto) && (await page.locator('[title="Van"]').count()) === 0;
    await page.screenshot({ path: process.env.FOTO || "/tmp/mapa-passageiro.png" });
    await page
      .getByRole("button", { name: /Voltar/ })
      .first()
      .click();
    await page.waitForURL(/\/passageiro$/);
    r["6 Voltou ao Início"] = page.url().endsWith("/passageiro");
    for (let i = 0; i < 3; i++) {
      await page.getByRole("link", { name: /Situação da van/ }).click();
      await page.waitForURL("**/passageiro/van");
      await mapa.waitFor();
      await page.dblclick(".leaflet-container", { position: { x: 180, y: 200 } }); // zoom e já volta
      await page
        .getByRole("button", { name: /Voltar/ })
        .first()
        .click();
      await page.waitForURL(/\/passageiro$/);
    }
    await page.waitForTimeout(800);
    r["7 Abriu e fechou o mapa 3 vezes (fechando durante zoom)"] = "ok";
    r["8 Erros no navegador"] = erros;
    await page.close();
  }
  // 2. Sem a ordem real (a consulta do embarque falha): não pode inventar "Você é o próximo"
  {
    const { page, erros } = await abrirApp(browser, { embarque: "falha" });
    await page.goto(`${BASE}/passageiro/van`);
    await page.getByRole("status", { name: "Situação da viagem" }).waitFor({ timeout: 20000 });
    await page.waitForTimeout(1500);
    const painel = await page.getByRole("status", { name: "Situação da viagem" }).innerText();
    r["9 Sem a ordem real: painel"] = painel.split("\n").filter(Boolean).slice(0, 2);
    r["10 Sem a ordem real: nada inventado"] =
      !/próximo|antes de você/.test(painel) && !PROIBIDO.test(painel);
    r["11 Erros no navegador (sem a ordem)"] = erros;
    await page.close();
  }
  // 3. Cidades que o app ainda não conhece: "Carregando o mapa…" enquanto procura; sem internet, aviso honesto
  {
    const { page, erros } = await abrirApp(browser, {
      embarque: "ok",
      busca: "lenta",
      destinoDesconhecido: true,
    });
    await page.goto(`${BASE}/passageiro/van`);
    await page.getByText("Carregando o mapa…").waitFor({ timeout: 20000 });
    r["12 Busca lenta: mostra"] = "Carregando o mapa…";
    await page.locator(".leaflet-container").waitFor({ timeout: 20000 });
    r["13 Busca lenta: depois o mapa aparece"] = true;
    r["14 Erros (busca lenta)"] = erros;
    await page.close();
  }
  {
    const { page, erros } = await abrirApp(browser, {
      embarque: "ok",
      busca: "falha",
      destinoDesconhecido: true,
    });
    await page.goto(`${BASE}/passageiro/van`);
    await page.getByText(/Não deu para carregar o mapa agora/).waitFor({ timeout: 20000 });
    r["15 Sem internet para o mapa: aviso"] = await page
      .getByText(/Não deu para carregar o mapa agora/)
      .innerText();
    r["16 Sem internet para o mapa: a situação da viagem continua"] =
      (await page.getByText("Faltam 2 pessoas antes de você").count()) > 0;
    r["17 Erros (sem internet para o mapa)"] = erros;
    await page.close();
  }
  console.log(JSON.stringify(r, null, 1));
  const falhas = Object.entries(r).filter(
    ([k, v]) =>
      v === false ||
      (Array.isArray(v) && /Erros/.test(k) && v.length > 0) ||
      (typeof v === "string" && v.includes("NÃO")) ||
      (Array.isArray(v) && v.some((x) => /: false$/.test(String(x)))),
  );
  console.log(
    falhas.length
      ? `FALHOU: ${falhas.map(([k]) => k).join(", ")}`
      : "PERCURSO DO PASSAGEIRO: TUDO PASSOU",
  );
  process.exitCode = falhas.length ? 1 : 0;
  await browser.close();
})();
