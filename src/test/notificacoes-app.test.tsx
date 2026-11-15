import { renderHook } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { criarAviso } from "@/lib/avisos-store";
import { useNotificarAvisosNovos } from "@/lib/notificacoes";
import { adicionarPedido } from "@/lib/passageiros-store";
import { mudarSessao } from "@/lib/sessao";

const mostradas: { titulo: string; corpo: string }[] = [];
class NotificacaoDeTeste {
  static permission: NotificationPermission = "granted";
  constructor(titulo: string, opcoes: { body: string }) {
    mostradas.push({ titulo, corpo: opcoes.body });
  }
}

let visivel: DocumentVisibilityState = "hidden";
beforeAll(() => {
  vi.stubGlobal("Notification", NotificacaoDeTeste);
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => visivel });
});
afterAll(() => vi.unstubAllGlobals());

const novoAviso = (para: string, texto: string) =>
  criarAviso({ vanzeiroId: "vanzeiro-carlos", tipo: "cobranca_vencida", paraVanzeiroOuPassageiroId: para, dataCriacao: "2026-11-13", lido: false, textoResumido: texto });

describe("A2: com o app minimizado, aviso novo vira notificação no celular", () => {
  it("só os avisos novos de quem está usando o celular; com o app na tela, não", async () => {
    mudarSessao({ papel: "vanzeiro" });
    renderHook(() => useNotificarAvisosNovos());

    novoAviso("vanzeiro-carlos", "Beatriz está devendo R$ 280,00, em Jacarezinho → Londrina");
    novoAviso("p-juliana", "Aviso de outra pessoa");
    adicionarPedido({ vanzeiroId: "vanzeiro-carlos", destinoId: "jacarezinho-londrina", nome: "Rita Lima", telefone: "43990001111" });
    await Promise.resolve();
    expect(mostradas).toEqual([
      { titulo: "Cobrança vencida", corpo: "Beatriz está devendo R$ 280,00, em Jacarezinho → Londrina" },
      { titulo: "Pedido novo", corpo: "Rita Lima quer entrar em Jacarezinho → Londrina" },
    ]);

    visivel = "visible";
    novoAviso("vanzeiro-carlos", "Com o app na tela");
    await Promise.resolve();
    expect(mostradas.length).toBe(2);
  });
});
