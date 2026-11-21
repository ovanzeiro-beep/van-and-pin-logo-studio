import { beforeEach, describe, expect, it, vi } from "vitest";

// W2 and W3: profile and destinos in the database. Supabase is simulated (the tests never touch the real one).
const falso = vi.hoisted(() => {
  const estado = {
    tabelas: {} as Record<string, Record<string, unknown>[]>,
    erroNaProxima: null as null | { code: string; message: string },
    chamadas: [] as string[],
  };
  const tabela = (nome: string) => (estado.tabelas[nome] ??= []);
  const responder = <T,>(data: T) => {
    const erro = estado.erroNaProxima;
    estado.erroNaProxima = null;
    return Promise.resolve(erro ? { data: null, error: erro } : { data, error: null });
  };
  const consulta = (nome: string) => {
    const filtros: ((l: Record<string, unknown>) => boolean)[] = [];
    const q = {
      select: () => q,
      is: (c: string, v: unknown) => (filtros.push((l) => (l[c] ?? null) === v), q),
      order: () => q,
      then: (ok: (r: unknown) => void) => ok({ data: tabela(nome).filter((l) => filtros.every((f) => f(l))), error: null }),
    };
    return q;
  };
  const cliente = {
    rpc: () => responder(null),
    from: (nome: string) => ({
      ...consulta(nome),
      upsert: (linha: Record<string, unknown>) => {
        estado.chamadas.push(`upsert ${nome}`);
        // Like the real database, the answer can be read back (".select(...).maybeSingle()").
        const comLeitura = (r: Promise<{ data: unknown; error: unknown }>, salvo?: Record<string, unknown>) =>
          Object.assign(r, { select: () => ({ maybeSingle: () => r.then((x) => (x.error ? x : { data: salvo ?? null, error: null })) }) });
        if (estado.erroNaProxima) return comLeitura(responder(null));
        const t = tabela(nome);
        const chave = nome === "dias_sem_viagem" ? (l: Record<string, unknown>) => l["destino_id"] === linha["destino_id"] && l["data"] === linha["data"] : (l: Record<string, unknown>) => l["id"] === linha["id"];
        const i = t.findIndex(chave);
        // Correção 6: the database never changes a code that already exists.
        if (i >= 0) t[i] = { ...t[i], ...linha, ...(nome === "destinos" ? { convite: t[i]!["convite"] } : {}) };
        else t.push(linha);
        return comLeitura(responder(null), t.find(chave));
      },
      update: (mudanca: Record<string, unknown>) => ({
        eq: (c: string, v: unknown) => {
          estado.chamadas.push(`update ${nome}`);
          if (estado.erroNaProxima) return responder(null);
          tabela(nome).forEach((l) => l[c] === v && Object.assign(l, mudanca));
          return Object.assign(responder(null), { is: () => responder(null) });
        },
      }),
      delete: () => ({
        eq: (c1: string, v1: unknown) => ({
          eq: (c2: string, v2: unknown) => {
            estado.chamadas.push(`delete ${nome}`);
            estado.tabelas[nome] = tabela(nome).filter((l) => !(l[c1] === v1 && l[c2] === v2));
            return responder(null);
          },
        }),
      }),
    }),
  };
  return { estado, cliente };
});

vi.mock("@/lib/supabase", () => ({ USA_BANCO: { conta: true, destinos: true }, supabase: () => falso.cliente, SUPABASE_URL: "", SUPABASE_CHAVE_PUBLICA: "" }));

import { destinosExemplo } from "@/data/exemplo";
import {
  cancelarDiaNoBanco,
  carregarPerfisEDestinos,
  desfazerDiaNoBanco,
  destinoDaLinha,
  excluirDestinoNoBanco,
  linhaDoDestino,
  pausarOuAtivarNoBanco,
  salvarDestinoNoBanco,
  salvarPerfilNoBanco,
} from "@/lib/banco/destinos";
import { obterDestinos } from "@/lib/destinos-store";
import { obterPerfilDoVanzeiro } from "@/lib/vanzeiro-store";

const base = { ...destinosExemplo.find((d) => d.id === "centro-unisul")!, id: "d-novo", convite: "VAN-7001", vanzeiroId: "u-rosa", diasCancelados: undefined };

beforeEach(() => {
  falso.estado.erroNaProxima = null;
  falso.estado.chamadas = [];
});

describe("W2/W3: perfil e destinos no banco (Supabase simulado)", () => {
  it("o destino vai e volta do banco do mesmo jeito", () => {
    const linha = linhaDoDestino(base);
    expect(linha).toMatchObject({ id: "d-novo", vanzeiro_id: "u-rosa", convite: "VAN-7001", volta_data: null });
    expect(destinoDaLinha(linha, [{ destino_id: "d-novo", data: "2026-11-20", motivo: "Feriado", cancelado_em: "2026-11-13" }])).toEqual({
      ...base,
      cafe: null,
      diasCancelados: [{ data: "2026-11-20", motivo: "Feriado", canceladoEm: "2026-11-13" }],
    });
  });

  it("salvar grava no banco e só então aparece na tela; se o banco recusar, nada muda", async () => {
    falso.estado.erroNaProxima = { code: "P0001", message: "A data da viagem já passou." };
    expect(await salvarDestinoNoBanco(base)).toEqual({ ok: false, motivo: "A data da viagem já passou." });
    expect(obterDestinos().some((d) => d.id === "d-novo")).toBe(false);
    expect(await salvarDestinoNoBanco(base)).toEqual({ ok: true });
    expect(obterDestinos()[0]?.id).toBe("d-novo");
    expect(falso.estado.tabelas["destinos"]?.some((l) => l["id"] === "d-novo")).toBe(true);
  });

  it("código de convite já usado por outro vanzeiro: o app gera outro e tenta de novo", async () => {
    falso.estado.erroNaProxima = { code: "23505", message: 'duplicate key value violates unique constraint "destinos_convite_unico"' };
    const r = await salvarDestinoNoBanco({ ...base, id: "d-outro", convite: "VAN-7002" });
    expect(r).toEqual({ ok: true });
    const salvo = obterDestinos().find((d) => d.id === "d-outro")!;
    expect(salvo.convite).not.toBe("VAN-7002");
    expect(salvo.convite).toMatch(/^VAN-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
  });

  it("Correção 6: salvar o destino de novo não troca o código (quem manda no código é o banco)", async () => {
    const antes = obterDestinos().find((d) => d.id === "d-novo")!.convite;
    expect(await salvarDestinoNoBanco({ ...obterDestinos().find((d) => d.id === "d-novo")!, origem: "Outra origem", convite: "VAN-TROCAD" })).toEqual({ ok: true });
    const depois = obterDestinos().find((d) => d.id === "d-novo")!;
    expect(depois.origem).toBe("Outra origem");
    expect(depois.convite).toBe(antes);
  });

  it("pausar, dia sem viagem e desfazer gravam no banco; erro desfaz na tela", async () => {
    expect(await pausarOuAtivarNoBanco("d-novo")).toEqual({ ok: true });
    expect(obterDestinos().find((d) => d.id === "d-novo")?.ativo).toBe(false);
    falso.estado.erroNaProxima = { code: "XX", message: "fetch failed" };
    expect((await pausarOuAtivarNoBanco("d-novo")).ok).toBe(false);
    expect(obterDestinos().find((d) => d.id === "d-novo")?.ativo).toBe(false);
    await pausarOuAtivarNoBanco("d-novo");
    expect(await cancelarDiaNoBanco("d-novo", "2026-11-16", "feriado")).toEqual({ ok: true });
    expect(falso.estado.tabelas["dias_sem_viagem"]).toContainEqual({ destino_id: "d-novo", data: "2026-11-16", motivo: "Feriado" });
    expect(await desfazerDiaNoBanco("d-novo", "2026-11-16")).toEqual({ ok: true });
    expect(falso.estado.tabelas["dias_sem_viagem"]).toEqual([]);
  });

  it("perfil: grava no formato padrão; se o banco recusar, volta o de antes", async () => {
    expect(await salvarPerfilNoBanco("vanzeiro-carlos", { nome: "carlos pereira", telefone: "(43) 99955-1234", pix: "Carlos@x.com", van: { modelo: "sprinter", placa: "abc1d23", lugares: 15 } })).toEqual({ ok: true });
    expect(falso.estado.tabelas["perfis_vanzeiro"]?.[0]).toEqual({ id: "vanzeiro-carlos", nome: "Carlos Pereira", telefone: "43999551234", pix: "carlos@x.com", van_modelo: "Sprinter", van_placa: "ABC-1D23", van_lugares: 15 });
    falso.estado.erroNaProxima = { code: "XX", message: "fetch failed" };
    expect((await salvarPerfilNoBanco("vanzeiro-carlos", { nome: "Outro", telefone: "43900000000", pix: "", van: { modelo: "", placa: "", lugares: null } })).ok).toBe(false);
    expect(obterPerfilDoVanzeiro("vanzeiro-carlos").nome).toBe("Carlos Pereira");
  });

  it("ao entrar, o que está no banco aparece (destino excluído não)", async () => {
    await excluirDestinoNoBanco("d-outro");
    await carregarPerfisEDestinos();
    expect(obterDestinos().map((d) => d.id)).toEqual(["d-novo"]);
    expect(obterPerfilDoVanzeiro("vanzeiro-carlos").van.placa).toBe("ABC-1D23");
  });
});
