import { describe, expect, it, vi } from "vitest";

// W4: invite → pedido → accepted → passenger panel, with Supabase simulated (two people share the same fake database).
const falso = vi.hoisted(() => {
  const banco = {
    matriculas: [] as Record<string, unknown>[],
    pedidos: [] as Record<string, unknown>[],
    mudancas_endereco: [] as Record<string, unknown>[],
    perfis_vanzeiro: [] as Record<string, unknown>[],
    destinos: [] as Record<string, unknown>[],
    dias_sem_viagem: [] as Record<string, unknown>[],
  };
  let n = 0;
  const lista = (t: keyof typeof banco) => {
    const q = { select: () => q, order: () => q, is: () => q, then: (ok: (r: unknown) => void) => ok({ data: banco[t], error: null }) };
    return q;
  };
  const rpc = async (nome: string, a: Record<string, unknown>) => {
    if (nome === "pedir_para_entrar") {
      const id = `ped-${++n}`;
      banco.pedidos.push({ id, vanzeiro_id: "u-rosa", destino_id: "d1", pessoa_id: "u-beto", nome: a["nome"], telefone: a["telefone"], cidade: a["cidade"], endereco: a["endereco"], ponto_lat: a["lat"], ponto_lng: a["lng"], situacao: "aguardando", matricula_id: null, pedido_em: "2026-11-13", respondido_em: null });
      return { data: id, error: null };
    }
    if (nome === "aceitar_pedido") {
      const p = banco.pedidos.find((x) => x["id"] === a["pedido"])!;
      const m = a["matricula"] as Record<string, unknown>;
      banco.matriculas.push({ ...m, vanzeiro_id: p["vanzeiro_id"], destino_id: p["destino_id"], pessoa_id: p["pessoa_id"], saiu_em: null });
      Object.assign(p, { situacao: "aceito", matricula_id: m["id"] });
      return { data: m["id"], error: null };
    }
    if (nome === "recusar_pedido") {
      const p = banco.pedidos.find((x) => x["id"] === a["pedido"] && x["situacao"] === "aguardando");
      if (!p) return { data: null, error: { code: "P0001", message: "Este pedido já foi respondido." } };
      p["situacao"] = "recusado";
      return { data: null, error: null };
    }
    if (nome === "mudar_meu_embarque") return { data: "aguardando", error: null };
    return { data: null, error: null };
  };
  const cliente = { rpc, from: (t: keyof typeof banco) => ({ ...lista(t) }) };
  return { banco, cliente };
});

vi.mock("@/lib/supabase", () => ({ USA_BANCO: { conta: true, destinos: true }, supabase: () => falso.cliente, SUPABASE_URL: "", SUPABASE_CHAVE_PUBLICA: "" }));

import { carregarPassageirosEPedidos, linhaDoPassageiro, mudarMeuEmbarqueNoBanco, passageiroDaLinha, pedirParaEntrarNoBanco, recusarPedidoNoBanco, salvarPassageiroNoBanco } from "@/lib/banco/passageiros";
import { comecarContaDeVerdade } from "@/lib/acesso";
import { obterPassageiros } from "@/lib/passageiros-store";
import { mudarSessao, obterSessao } from "@/lib/sessao";
import { obterMinhasMatriculas } from "@/lib/sessao-passageiro";

const beto = { id: "u-beto", nome: "Beto" };

describe("W4: convite → pedido → aceite → passageiro (Supabase simulado)", () => {
  it("a matrícula vai e volta do banco do mesmo jeito (a conta da pessoa nunca vai pelo vanzeiro)", () => {
    const p = { id: "m1", vanzeiroId: "u-rosa", destinoId: "d1", pessoaId: "u-beto", nome: "Beto Silva", telefone: "43999990002", cidade: "Cambará", endereco: "Rua 1", plano: "mensal" as const, valor: 28000, vencimento: 10, descontaFaltas: true, valorFalta: 1500, ordem: 2, ponto: { lat: -23, lng: -50 } };
    const linha = linhaDoPassageiro(p);
    expect(linha).not.toHaveProperty("pessoa_id");
    expect(passageiroDaLinha({ ...linha, pessoa_id: "u-beto", saiu_em: null })).toEqual(p);
  });

  it("o passageiro pede para entrar e fica aguardando; o vanzeiro aceita; o painel do passageiro abre", async () => {
    comecarContaDeVerdade(beto);
    mudarSessao({ conta: { id: "u-beto", email: "beto@x.com", nome: "Beto" } });
    expect(obterSessao().passageiro.passageiroId).toBe("u-beto");
    expect(await pedirParaEntrarNoBanco("VAN-1111", "beto silva", "(43) 99999-0002", { cidade: "Cambará", endereco: "rua 1", ponto: { lat: -23, lng: -50 } })).toEqual({ ok: true });
    expect(falso.banco.pedidos[0]).toMatchObject({ nome: "Beto Silva", telefone: "43999990002", endereco: "Rua 1" });
    expect(obterSessao().passageiro.pedidoId).toBe("ped-1");
    expect(obterMinhasMatriculas()).toEqual([]);

    // The vanzeiro's phone accepts (same database).
    const pedido = { id: "ped-1" };
    const nova = { id: "m-beto", vanzeiroId: "u-rosa", destinoId: "d1", nome: "Beto Silva", telefone: "43999990002", cidade: "Cambará", endereco: "Rua 1", plano: "viagem" as const, valor: 4500, vencimento: null, descontaFaltas: false, valorFalta: null };
    expect(await salvarPassageiroNoBanco(nova, pedido.id)).toEqual({ ok: true });
    expect(falso.banco.matriculas[0]).toMatchObject({ id: "m-beto", pessoa_id: "u-beto" });

    // The passenger's phone reads the news: now it is a member.
    await carregarPassageirosEPedidos();
    expect(obterMinhasMatriculas().map((p) => p.id)).toEqual(["m-beto"]);
    expect(obterPassageiros().find((p) => p.id === "m-beto")?.pessoaId).toBe("u-beto");
  });

  it("recusar: o banco responde; recusar de novo explica que já foi respondido", async () => {
    await pedirParaEntrarNoBanco("VAN-1111", "Outro", "43999990077");
    expect(await recusarPedidoNoBanco("ped-2")).toEqual({ ok: true });
    expect(await recusarPedidoNoBanco("ped-2")).toEqual({ ok: false, motivo: "Este pedido já foi respondido." });
  });

  it("mudar onde embarca: o banco mede a distância e diz se precisa do vanzeiro", async () => {
    expect(await mudarMeuEmbarqueNoBanco("m-beto", { cidade: "Cambará", endereco: "sítio longe", ponto: { lat: -23.2, lng: -50.2 } })).toEqual({ ok: true, situacao: "aguardando" });
  });
});
