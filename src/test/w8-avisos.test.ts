import { describe, expect, it, vi } from "vitest";

// W8: the bell's notices with Supabase simulated (two phones share the same fake database).
const falso = vi.hoisted(() => {
  const avisos: Record<string, unknown>[] = [];
  const quem = { id: "" };
  const rpc = async (nome: string, a: Record<string, unknown>) => {
    if (nome === "salvar_aviso") {
      const l = a["aviso"] as Record<string, unknown>;
      const igual = avisos.find((x) => x["para"] === l["para"] && x["chave"] === l["chave"]);
      if (igual && a["trocar"]) Object.assign(igual, l, { lido: false });
      if (!igual) avisos.push({ ...l, vanzeiro_id: "u-rosa", lido: false });
      return { error: null };
    }
    if (nome === "marcar_avisos_lidos")
      avisos.filter((x) => x["para"] === quem.id).forEach((x) => (x["lido"] = true));
    return { error: null };
  };
  const from = () => {
    let para = "";
    let tipoOculto = "";
    const q = {
      select: () => q,
      eq: (_c: string, v: string) => ((para = v), q),
      neq: (_c: string, v: string) => ((tipoOculto = v), q),
      order: () => q,
      limit: () => q,
      then: (ok: (r: unknown) => void) =>
        ok({ data: avisos.filter((x) => x["para"] === para && x["tipo"] !== tipoOculto).map((x) => ({ ...x })), error: null }),
    };
    return q;
  };
  return { avisos, quem, cliente: { rpc, from } };
});

vi.mock("@/lib/supabase", () => ({
  USA_BANCO: { conta: true, destinos: true },
  supabase: () => falso.cliente,
  SUPABASE_URL: "",
  SUPABASE_CHAVE_PUBLICA: "",
}));

import { avisoDaLinha, carregarAvisos, linhaDoAviso, sincronizarAvisos } from "@/lib/banco/avisos";
import { comecarContaDeVerdade } from "@/lib/acesso";
import {
  criarAviso,
  criarAvisoUmaVez,
  marcarTodosComoLido,
  obterAvisos,
  trocarAviso,
} from "@/lib/avisos-store";
import { mudarSessao } from "@/lib/sessao";

const entrar = (id: string, nome: string) => {
  comecarContaDeVerdade({ id, nome });
  mudarSessao({ conta: { id, email: `${id}@x.com`, nome } });
  falso.quem.id = id;
};
const resposta = (texto: string) => ({
  vanzeiroId: "u-rosa",
  tipo: "resposta_passageiro" as const,
  paraVanzeiroOuPassageiroId: "u-rosa",
  destinoId: "d1",
  passageiroId: "m1",
  chave: "resposta_m1_2026-11-14",
  dataCriacao: "2026-11-13",
  lido: false,
  textoResumido: texto,
});

describe("W8: avisos do sininho no banco (Supabase simulado)", () => {
  it("o aviso vai e volta do banco do mesmo jeito", () => {
    const a = { ...resposta("Beto respondeu"), id: "a1" };
    expect(avisoDaLinha({ ...linhaDoAviso(a), vanzeiro_id: "u-rosa", lido: false })).toEqual(a);
  });

  it("o passageiro responde e muda a resposta: o vanzeiro vê um aviso só, com a última", async () => {
    entrar("u-beto", "Beto");
    trocarAviso(resposta('Beto respondeu "Vou"'));
    await sincronizarAvisos();
    trocarAviso(resposta('Beto respondeu "Não vou"'));
    await sincronizarAvisos();
    expect(falso.avisos).toHaveLength(1);

    entrar("u-rosa", "Rosa");
    await carregarAvisos();
    expect(obterAvisos().map((a) => [a.textoResumido, a.lido])).toEqual([
      ['Beto respondeu "Não vou"', false],
    ]);
  });

  it("o mesmo aviso do relógio feito de novo não repete; abrir o sininho marca como lido no banco", async () => {
    criarAvisoUmaVez({
      vanzeiroId: "u-rosa",
      tipo: "van_saiu",
      paraVanzeiroOuPassageiroId: "u-beto",
      destinoId: "d1",
      chave: "van_saiu_m1_2026-11-13",
      dataCriacao: "2026-11-13",
      lido: false,
      textoResumido: "A van saiu",
    });
    criarAviso({
      vanzeiroId: "u-rosa",
      tipo: "van_saiu",
      paraVanzeiroOuPassageiroId: "u-beto",
      destinoId: "d1",
      chave: "van_saiu_m1_2026-11-13",
      dataCriacao: "2026-11-13",
      lido: false,
      textoResumido: "A van saiu",
    });
    marcarTodosComoLido("u-rosa");
    await sincronizarAvisos();
    expect(falso.avisos.filter((a) => a["para"] === "u-beto")).toHaveLength(1);
    expect(falso.avisos.find((a) => a["para"] === "u-rosa")!["lido"]).toBe(true);

    entrar("u-beto", "Beto");
    await carregarAvisos();
    expect(obterAvisos().map((a) => a.textoResumido)).toEqual(["A van saiu"]);
  });
});
