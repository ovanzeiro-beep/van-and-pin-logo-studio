import { webcrypto } from "node:crypto";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, it } from "vitest";

it("separa os dados offline quando duas contas fazem a mesma consulta", async () => {
  const guardadas = new Map<string, Response>();
  let internet = true;
  let receber!: (evento: { request: Request; respondWith: (p: Promise<Response>) => void }) => void;
  runInNewContext(readFileSync("public/sw.js", "utf8"), {
    self: {
      addEventListener(tipo: string, ouvinte: typeof receber) {
        if (tipo === "fetch") receber = ouvinte;
      },
    },
    caches: {
      open: async () => ({
        put: async (chave: string, resposta: Response) => guardadas.set(chave, resposta),
      }),
      match: async (chave: string) => guardadas.get(chave)?.clone(),
    },
    async fetch(request: Request) {
      if (!internet) throw new TypeError("Failed to fetch");
      return new Response(request.headers.get("authorization"));
    },
    crypto: webcrypto,
    Response,
    TextEncoder,
    URL,
  });

  function consultar(conta: string) {
    const request = new Request("https://app-teste.supabase.co/rest/v1/viagens?select=*", {
      headers: { Authorization: `Bearer conta-ficticia-${conta}` },
    });
    return new Promise<Response>((resolve) => receber({ request, respondWith: resolve }));
  }

  expect(await (await consultar("A")).text()).toBe("Bearer conta-ficticia-A");
  internet = false;
  expect((await consultar("B")).type).toBe("error");
  expect(await (await consultar("A")).text()).toBe("Bearer conta-ficticia-A");
  internet = true;
  await consultar("B");
  internet = false;
  expect(await (await consultar("B")).text()).toBe("Bearer conta-ficticia-B");
  expect(guardadas.size).toBe(2);
});
