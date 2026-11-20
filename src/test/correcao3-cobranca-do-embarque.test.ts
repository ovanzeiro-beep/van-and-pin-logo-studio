import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { Passageiro } from "@/data/exemplo";
import { linhaDaCobranca } from "@/lib/banco/dinheiro";
import { aplicarEmbarque } from "@/lib/cobrancas";

// CORREÇÃO 3 (20/11/2026): o banco cria a cobrança do embarque junto com a viagem
// (supabase/migrations/20261120140000_correcao3_cobranca_no_embarque.sql), e o app continua criando a dele.
// As duas precisam ser IGUAIS (mesmo identificador e mesmos valores), senão haveria duas cobranças para um embarque.
// Este teste prende a cobrança do app a um arquivo; o laboratório (scripts/auditoria-laboratorio.py --grupos c3)
// confere o banco contra o MESMO arquivo. Se mudar a cobrança do app, gere o arquivo de novo e ajuste o banco:
//   GERAR_COBRANCAS_DO_EMBARQUE=1 npx vitest run src/test/correcao3-cobranca-do-embarque.test.ts

const ARQUIVO = resolve(__dirname, "../../supabase/testes/correcao3-cobrancas-do-embarque.json");

const passageiros: Passageiro[] = [
  { id: "mx1", plano: "viagem", valor: 3000, nome: "Ana Teste", telefone: "43999990101" },
  { id: "mx2", plano: "diario", valor: 2250, nome: "Bruno da Silva", telefone: "43999990102" },
  { id: "mx3", plano: "viagem", valor: 4550, nome: "Çélia Ômega", telefone: "43999990103" },
].map((p) => ({
  ...p,
  vanzeiroId: "V",
  destinoId: "d1",
  cidade: "Cidade A",
  endereco: "Rua",
  vencimento: null,
  descontaFaltas: false,
  valorFalta: null,
})) as Passageiro[];

const dias = ["2026-11-18", "2026-11-30", "2026-12-28", "2027-02-25", "2028-02-25"];

function gerar() {
  const casos: {
    matricula: string;
    data: string;
    viagem: string;
    linha: ReturnType<typeof linhaDaCobranca>;
  }[] = [];
  for (const p of passageiros) {
    for (const data of dias) {
      const viagem = `d1_${data}`;
      const [c] = aplicarEmbarque([], p, data, data, viagem);
      casos.push({ matricula: p.id, data, viagem, linha: linhaDaCobranca(c!) });
    }
  }
  return casos;
}

describe("Correção 3: a cobrança do embarque do app é a mesma que o banco cria", () => {
  it("bate com o arquivo de referência usado no teste do banco", () => {
    const casos = gerar();
    if (process.env["GERAR_COBRANCAS_DO_EMBARQUE"] === "1") {
      writeFileSync(ARQUIVO, `${JSON.stringify(casos, null, 1)}\n`);
    }
    expect(casos).toHaveLength(15);
    expect(casos).toEqual(JSON.parse(readFileSync(ARQUIVO, "utf8")));
  });
});
