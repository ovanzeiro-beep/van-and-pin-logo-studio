import { describe, expect, it, vi } from "vitest";

// G2: leaving the account, this phone stops receiving its notices.
const falso = vi.hoisted(() => {
  const apagados: { coluna: string; valor: string }[] = [];
  const cliente = {
    from: () => ({
      delete: () => ({
        eq: async (coluna: string, valor: string) => (
          apagados.push({ coluna, valor }),
          { error: null }
        ),
      }),
    }),
  };
  return { apagados, cliente };
});
vi.mock("@/lib/supabase", () => ({
  USA_BANCO: { conta: true, destinos: true },
  supabase: () => falso.cliente,
  SUPABASE_URL: "",
  SUPABASE_CHAVE_PUBLICA: "",
}));

import { esquecerEsteCelular } from "@/lib/banco/celular";
import { mudarSessao } from "@/lib/sessao";

describe("G2: sair da conta desliga as notificações deste celular", () => {
  it("apaga o endereço de entrega no banco e desliga no navegador", async () => {
    const desligar = vi.fn(async () => true);
    const assinatura = { endpoint: "https://fcm.googleapis.com/x/123", unsubscribe: desligar };
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        getRegistration: async () => ({ pushManager: { getSubscription: async () => assinatura } }),
      },
    });
    mudarSessao({ conta: { id: "u-1", email: "a@b.com", nome: "A" } });
    await esquecerEsteCelular();
    expect(falso.apagados).toEqual([
      { coluna: "endereco->>endpoint", valor: "https://fcm.googleapis.com/x/123" },
    ]);
    expect(desligar).toHaveBeenCalled();
  });
});
