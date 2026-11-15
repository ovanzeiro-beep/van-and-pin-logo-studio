import { renderHook } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { criarAviso } from "@/lib/avisos-store";
import { useNotificarAvisosNovos } from "@/lib/notificacoes";
import { adicionarPedido, mudarMeuEmbarque } from "@/lib/passageiros-store";
import { notificacaoDaMudanca } from "@/lib/notificacoes";
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

  it("mudança de endereço longe vira notificação para o vanzeiro; perto, não (salva direto)", async () => {
    visivel = "hidden";
    mostradas.length = 0;
    mudarSessao({ papel: "vanzeiro" });
    renderHook(() => useNotificarAvisosNovos());
    mudarMeuEmbarque("p-pedro", { cidade: "Jacarezinho", endereco: "Rua Perto", ponto: { lat: -23.161, lng: -49.9695 } });
    await Promise.resolve();
    expect(mostradas).toEqual([]);
    mudarMeuEmbarque("p-pedro", { cidade: "Santo Antônio da Platina", endereco: "Rua Longe", ponto: { lat: -23.295, lng: -50.077 } });
    await Promise.resolve();
    expect(mostradas.length).toBe(1);
    expect(mostradas[0]!.titulo).toBe("Mudança de endereço");
    expect(mostradas[0]!.corpo).toMatch(/^Pedro Henrique Lima quer mudar onde embarca em Jacarezinho → Londrina \(1\d,\d km do ponto combinado\)$/);
  });

  it("texto da notificação", () => {
    expect(notificacaoDaMudanca({ id: "m", nome: "Ana", distanciaKm: 3.24 }, "Cambará → UENP Jacarezinho")).toEqual({
      titulo: "Mudança de endereço",
      corpo: "Ana quer mudar onde embarca em Cambará → UENP Jacarezinho (3,2 km do ponto combinado)",
      url: "/vanzeiro/notificacoes",
      tag: "m",
    });
  });
});
