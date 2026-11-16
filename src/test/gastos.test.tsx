import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { GastosDoMes, Sobrou } from "@/components/app/Gastos";
import { gastosDoMes, problemaDoGasto, rotuloDoGasto, sobrouNoMes, totalDosGastos } from "@/lib/gastos";
import { anotarGasto, apagarGasto, obterGastos } from "@/lib/gastos-store";
import { mudarSessao } from "@/lib/sessao";

const hoje = "2026-11-13";

describe("T6: gastos da van", () => {
  it("regras: tipo, 'Outros' com o que foi, valor e dia até hoje", () => {
    expect(problemaDoGasto({ tipo: null, descricao: "", valor: 100, data: hoje }, hoje)).toBe("Escolha o tipo do gasto.");
    expect(problemaDoGasto({ tipo: "outros", descricao: " ", valor: 100, data: hoje }, hoje)).toBe("Escreva o que foi o gasto.");
    expect(problemaDoGasto({ tipo: "combustivel", descricao: "", valor: null, data: hoje }, hoje)).toBe("Digite o valor do gasto.");
    expect(problemaDoGasto({ tipo: "combustivel", descricao: "", valor: 100, data: "2026-11-14" }, hoje)).toBe("O dia do gasto não pode ser depois de hoje.");
    expect(problemaDoGasto({ tipo: "pedagio", descricao: "", valor: 100, data: hoje }, hoje)).toBeNull();
    expect(rotuloDoGasto({ tipo: "outros", descricao: "Lavagem" })).toBe("Lavagem");
    expect(rotuloDoGasto({ tipo: "documentos", descricao: "" })).toBe("Documentos e seguro");
  });

  it("gastos do mês, total e Sobrou = Recebido − Gastos (negativo = Faltou)", () => {
    const g = obterGastos();
    const nov = gastosDoMes(g, "2026-11");
    expect(nov.map((x) => x.data)).toEqual(["2026-11-11", "2026-11-08", "2026-11-03"]);
    expect(totalDosGastos(nov)).toBe(81860);
    expect(sobrouNoMes(100000, 81860)).toBe(18140);
    expect(sobrouNoMes(66300, 81860)).toBe(-15560);
  });

  it("anotar e apagar; cada vanzeiro só mexe nos seus", () => {
    const antes = obterGastos().length;
    anotarGasto({ tipo: "outros", descricao: " Lavagem ", valor: 3000, data: hoje });
    const novo = obterGastos().find((g) => g.descricao === "Lavagem")!;
    expect(novo).toMatchObject({ vanzeiroId: "vanzeiro-carlos", valor: 3000, data: hoje });
    mudarSessao({ vanzeiroId: "outro-vanzeiro" });
    expect(obterGastos()).toEqual([]);
    apagarGasto(novo.id);
    mudarSessao({ vanzeiroId: "vanzeiro-carlos" });
    expect(obterGastos()).toHaveLength(antes + 1);
    apagarGasto(novo.id);
    expect(obterGastos()).toHaveLength(antes);
  });

  it("na tela: Sobrou em verde, Faltou em vermelho; 'Anotar gasto' avisa o que falta", () => {
    const { rerender } = render(<Sobrou recebido={100000} gastos={81860} />);
    expect(screen.getByText("Sobrou")).toBeTruthy();
    rerender(<Sobrou recebido={66300} gastos={81860} />);
    expect(screen.getByText("Faltou")).toBeTruthy();
    render(<GastosDoMes gastos={[]} mes="2026-11" />);
    expect(screen.getByText("Nenhum gasto anotado neste mês.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Anotar gasto/ }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(screen.getByText("Escolha o tipo do gasto.")).toBeTruthy();
  });
});
