import type { Cobranca } from "@/lib/cobrancas";
import { FORMA_ROTULO, situacao, SITUACAO_ROTULO, valorFinal } from "@/lib/cobrancas";
import { TIPOS_DE_GASTO, type Gasto } from "@/lib/gastos";
import { planilhaXlsx, TIPO_XLSX, type Celula, type Coluna } from "@/lib/planilha";

// Correção 5 (decisão C): before deleting the account, the vanzeiro downloads their own report (expenses and money
// received, still open or cancelled), so they keep what their own obligations may require. An Excel file (.xlsx).

export const COLUNAS_DO_RELATORIO: Coluna[] = [
  { titulo: "Tipo", tipo: "texto", largura: 12 },
  { titulo: "Data", tipo: "data", largura: 12 },
  { titulo: "Passageiro", tipo: "texto", largura: 24 },
  { titulo: "Valor (R$)", tipo: "reais", largura: 14 },
  { titulo: "Situação", tipo: "texto", largura: 22 },
  { titulo: "Descrição", tipo: "texto", largura: 26 },
  { titulo: "Vencimento", tipo: "data", largura: 12 },
];

/** One line per charge and per expense of this vanzeiro only. Dates "AAAA-MM-DD", money in centavos. */
export function linhasDoRelatorio(cobrancas: Cobranca[], gastos: Gasto[], vanzeiroId: string, hoje: string): Celula[][] {
  const linhas: Celula[][] = [];
  for (const c of cobrancas.filter((x) => x.vanzeiroId === vanzeiroId).sort((a, b) => a.vencimento.localeCompare(b.vencimento))) {
    const valor = valorFinal(c);
    if (c.pagamento) linhas.push(["Recebido", c.pagamento.data, c.nome, valor, `Pago (${FORMA_ROTULO[c.pagamento.forma]})`, c.referencia, c.vencimento]);
    else if (c.cancelamento) linhas.push(["Cancelado", c.cancelamento.data, c.nome, valor, `Cancelada: ${c.cancelamento.motivo}`, c.referencia, c.vencimento]);
    else linhas.push(["A receber", c.vencimento, c.nome, valor, SITUACAO_ROTULO[situacao(c, hoje)], c.referencia, c.vencimento]);
  }
  for (const g of gastos.filter((x) => x.vanzeiroId === vanzeiroId).sort((a, b) => a.data.localeCompare(b.data))) {
    const tipo = TIPOS_DE_GASTO.find((t) => t.id === g.tipo)?.rotulo ?? g.tipo;
    linhas.push(["Gasto", g.data, null, g.valor, null, g.descricao ? `${tipo}: ${g.descricao}` : tipo, null]);
  }
  return linhas;
}

export function relatorioDoVanzeiro(cobrancas: Cobranca[], gastos: Gasto[], vanzeiroId: string, hoje: string): Uint8Array {
  return planilhaXlsx({ nome: "Relatório", colunas: COLUNAS_DO_RELATORIO, linhas: linhasDoRelatorio(cobrancas, gastos, vanzeiroId, hoje) });
}

/** Saves the file on the phone (Downloads). */
export function baixarArquivo(nome: string, conteudo: Uint8Array, tipo = TIPO_XLSX) {
  const url = URL.createObjectURL(new Blob([conteudo as BlobPart], { type: tipo }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
