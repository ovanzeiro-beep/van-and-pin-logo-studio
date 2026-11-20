import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { Destino, Passageiro } from "@/data/exemplo";
import { avisoDePeriodoDeNaoVou, avisoDeResposta } from "@/lib/avisos";

// CORREÇÃO 1 (20/11/2026): o banco só aceita o aviso "Resposta de passageiro" quando o texto é exatamente o que o app
// escreve (supabase/migrations/20261120120000_correcao1_avisos_seguros.sql). Este teste prende os textos do app a
// um arquivo de referência; o laboratório do banco (scripts/auditoria-laboratorio.py --grupos c1) confere o banco
// contra o MESMO arquivo. Se um texto mudar aqui, mude também as funções r_textos_* do banco e gere o arquivo de novo:
//   GERAR_TEXTOS_DOS_AVISOS=1 npx vitest run src/test/correcao1-textos-dos-avisos.test.ts

const ARQUIVO = resolve(__dirname, "../../supabase/testes/correcao1-textos-dos-avisos.json");

type Caso =
  | {
      tipo: "resposta";
      nome: string;
      origem: string;
      destino: string;
      dia: string;
      hoje: string;
      resposta: "vai" | "nao-vai";
      cancelou: boolean;
      texto: string;
    }
  | {
      tipo: "periodo";
      nome: string;
      origem: string;
      destino: string;
      de: string;
      ate: string;
      acao: "marcou" | "tirou";
      texto: string;
    };

const nomes = ["Ana Teste", "  Bruno   da Silva ", "Çélia Ômega", "José", "Maria-Clara Souza"];
const lugares: [string, string][] = [
  ["Jacarezinho", "Londrina"],
  ["São José dos Pinhais", "Curitiba (PR)"],
  ["Ourinhos-SP", "A.B. Centro"],
  ["UENP Jacarezinho", "Santo Antônio da Platina"],
];
// Hoje, amanhã, um sábado, um domingo, virada de mês e de ano.
const hojes = ["2026-11-20", "2026-11-30", "2026-12-31"];
const deslocamentos = [0, 1, 2, 3, 5, 6];

function somar(iso: string, dias: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

function gerarCasos(): Caso[] {
  const casos: Caso[] = [];
  nomes.forEach((nome, i) => {
    const [origem, destino] = lugares[i % lugares.length]!;
    const p = { id: `m${i}`, nome } as Passageiro;
    const d = { id: `d${i}`, vanzeiroId: "v", origem, destino } as Destino;
    for (const hoje of hojes) {
      for (const k of deslocamentos) {
        const dia = somar(hoje, k);
        for (const [resposta, cancelou] of [
          ["vai", false],
          ["nao-vai", false],
          ["nao-vai", true],
        ] as const) {
          const texto = avisoDeResposta(p, d, dia, resposta, hoje, cancelou).textoResumido;
          casos.push({
            tipo: "resposta",
            nome,
            origem,
            destino,
            dia,
            hoje,
            resposta,
            cancelou,
            texto,
          });
        }
      }
      for (const [de, ate] of [
        [hoje, hoje],
        [hoje, somar(hoje, 4)],
      ]) {
        for (const acao of ["marcou", "tirou"] as const) {
          const texto = avisoDePeriodoDeNaoVou(
            p,
            d,
            { id: "x", de: de!, ate: ate! },
            acao,
            hoje,
          ).textoResumido;
          casos.push({ tipo: "periodo", nome, origem, destino, de: de!, ate: ate!, acao, texto });
        }
      }
    }
  });
  return casos;
}

describe("Correção 1: os textos que o banco confere são os que o app escreve", () => {
  it("bate com o arquivo de referência usado no teste do banco", () => {
    const casos = gerarCasos();
    if (process.env["GERAR_TEXTOS_DOS_AVISOS"] === "1")
      writeFileSync(ARQUIVO, `${JSON.stringify(casos, null, 1)}\n`);
    const referencia = JSON.parse(readFileSync(ARQUIVO, "utf8")) as Caso[];
    expect(casos.length).toBeGreaterThan(200);
    expect(casos).toEqual(referencia);
  });
});
