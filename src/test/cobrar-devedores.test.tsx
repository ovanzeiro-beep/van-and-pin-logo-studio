import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CobrarDevedores } from "@/components/app/CobrarDevedores";
import { devedores, mensagemDosAtrasados, type Cobranca } from "@/lib/cobrancas";

const hoje = "2026-11-13";
const cobranca = (o: Partial<Cobranca>): Cobranca => ({
  id: "c",
  vanzeiroId: "vanzeiro-carlos",
  passageiroId: "p1",
  destinoId: "d1",
  nome: "Ana Souza",
  telefone: "43999990001",
  tipo: "mensal",
  referencia: "Mensalidade de outubro",
  vencimento: "2026-10-10",
  valorBase: 28000,
  faltas: 0,
  valorFalta: 0,
  periodoFaltas: null,
  pagamento: null,
  cancelamento: null,
  ...o,
});

const lista = [
  cobranca({ id: "a1" }),
  cobranca({ id: "a2", referencia: "Mensalidade de novembro", vencimento: "2026-11-10" }),
  cobranca({ id: "a3", referencia: "Mensalidade de dezembro", vencimento: "2026-12-10" }), // pendente: não entra
  cobranca({
    id: "b1",
    passageiroId: "p2",
    nome: "Bruno Lima",
    telefone: "43999990002",
    valorBase: 4500,
    vencimento: "2026-11-12",
  }),
  cobranca({
    id: "b2",
    passageiroId: "p2",
    nome: "Bruno Lima",
    vencimento: "2026-11-01",
    pagamento: { data: "2026-11-02", forma: "pix" },
  }),
  cobranca({
    id: "c1",
    passageiroId: "p3",
    nome: "Caio",
    vencimento: "2026-11-01",
    cancelamento: { data: "2026-11-02", motivo: "x" },
  }),
];

describe("T2: cobrar quem está devendo", () => {
  it("só entra quem está devendo (vencida e não paga), uma linha por pessoa, maior total primeiro", () => {
    const d = devedores(lista, hoje);
    expect(d.map((x) => [x.nome, x.total, x.cobrancas.map((c) => c.id)])).toEqual([
      ["Ana Souza", 56000, ["a1", "a2"]],
      ["Bruno Lima", 4500, ["b1"]],
    ]);
  });

  it("a mensagem lista as cobranças, o total e o Pix com o valor", () => {
    const [ana] = devedores(lista, hoje);
    const m = mensagemDosAtrasados(ana!, () => "Jacarezinho → UENP", {
      chave: "carlos@email.com",
      copiaECola: "000201XYZ",
    });
    const m2 = m.replace(/\u00a0/g, " ");
    expect(m2).toContain("Olá, Ana!");
    expect(m2).toContain(
      "• Mensalidade de outubro (Jacarezinho → UENP): R$ 280,00, venceu em 10/10",
    );
    expect(m2).toContain("Total: R$ 560,00.");
    expect(m2).toContain("Chave Pix: carlos@email.com");
    expect(m2).toContain("Pix copia e cola (já com o valor de R$ 560,00):\n000201XYZ");
    const semPix = mensagemDosAtrasados(ana!, () => "", { chave: "", copiaECola: null });
    expect(semPix).not.toContain("Pix");
  });

  it("um botão por pessoa abre o WhatsApp com a mensagem e fica marcado como enviado", () => {
    render(
      <CobrarDevedores
        lista={devedores(lista, hoje)}
        pix="carlos@email.com"
        nomeDoVanzeiro="Carlos"
        nomeDoDestino={() => ""}
        cidadeDoDestino={() => "Jacarezinho"}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Cobrar quem está devendo \(2\)/ }));
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]!.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/5543999990001\?text=/);
    expect(decodeURIComponent(links[0]!.getAttribute("href")!)).toContain("5406560.00");
    links[0]!.addEventListener("click", (e) => e.preventDefault());
    fireEvent.click(links[0]!);
    expect(links[0]!.textContent).toContain("Enviado");
    expect(links[1]!.textContent).toContain("Cobrar");
  });

  it("ninguém devendo: o botão não aparece", () => {
    const { container } = render(
      <CobrarDevedores
        lista={[]}
        pix=""
        nomeDoVanzeiro=""
        nomeDoDestino={() => ""}
        cidadeDoDestino={() => ""}
      />,
    );
    expect(container.textContent).toBe("");
  });
});
