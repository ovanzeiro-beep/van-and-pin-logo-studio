// Money is always kept in CENTAVOS (whole numbers: R$ 280,50 = 28050), so a sum never gains or loses a cent.
// It only becomes "R$ 280,50" on the screen (formatarReais) and is read from what people type in lerValor
// (src/lib/passageiros.ts). The database keeps the same centavos.

export type Centavos = number;

/** 28050 → "R$ 280,50". */
export function formatarReais(centavos: Centavos) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** 28050 → "280,50" (to fill a form field). */
export function centavosParaTexto(centavos: Centavos) {
  return (centavos / 100).toFixed(2).replace(".", ",");
}
