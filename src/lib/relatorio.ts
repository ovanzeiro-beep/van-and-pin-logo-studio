import type { Cobranca } from "@/lib/cobrancas";
import { valorFinal } from "@/lib/cobrancas";
import { TIPOS_DE_GASTO, type Gasto } from "@/lib/gastos";

// Correção 5 (decisão C): before deleting the account, the vanzeiro downloads their own report (expenses and money
// received or still open), so they keep what their own obligations may require. A spreadsheet file (CSV, ";").

const reais = (centavos: number) => (centavos / 100).toFixed(2).replace(".", ",");
const campo = (t: string) => (/[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);
const linha = (cols: string[]) => cols.map(campo).join(";");

export function relatorioDoVanzeiro(cobrancas: Cobranca[], gastos: Gasto[], vanzeiroId: string): string {
  const linhas = [linha(["Tipo", "Data", "Descrição", "Passageiro", "Valor (R$)", "Situação"])];
  for (const c of cobrancas.filter((x) => x.vanzeiroId === vanzeiroId).sort((a, b) => a.vencimento.localeCompare(b.vencimento))) {
    if (c.pagamento) linhas.push(linha(["Recebido", c.pagamento.data, c.referencia, c.nome, reais(valorFinal(c)), c.pagamento.forma === "pix" ? "Pago (Pix)" : "Pago (dinheiro)"]));
    else if (c.cancelamento) linhas.push(linha(["Cancelado", c.cancelamento.data, c.referencia, c.nome, reais(valorFinal(c)), `Cancelado: ${c.cancelamento.motivo}`]));
    else linhas.push(linha(["A receber", c.vencimento, c.referencia, c.nome, reais(valorFinal(c)), "Em aberto"]));
  }
  for (const g of gastos.filter((x) => x.vanzeiroId === vanzeiroId).sort((a, b) => a.data.localeCompare(b.data))) {
    const tipo = TIPOS_DE_GASTO.find((t) => t.id === g.tipo)?.rotulo ?? g.tipo;
    linhas.push(linha(["Gasto", g.data, g.descricao ? `${tipo}: ${g.descricao}` : tipo, "", reais(g.valor), ""]));
  }
  return linhas.join("\r\n");
}

/** Saves the file on the phone (Downloads). The BOM makes Excel and Google Sheets read the accents right. */
export function baixarArquivo(nome: string, conteudo: string) {
  const url = URL.createObjectURL(new Blob(["﻿" + conteudo], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
