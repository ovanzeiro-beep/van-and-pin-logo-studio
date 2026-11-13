import { limparCobrancas } from "@/lib/cobrancas-store";
import { limparDestinos } from "@/lib/destinos-store";
import { limparPassageiros } from "@/lib/passageiros-store";
import { limparRespostas } from "@/lib/respostas-store";
import { perfilNovo } from "@/lib/vanzeiro-store";
import { limparViagens } from "@/lib/viagem-store";

// "Criar conta" makes a new person. When their first choice is "Sou vanzeiro", the vanzeiro panel
// starts empty (no destinos, passengers, pedidos, charges or trips) with their name.
// Choosing "Sou passageiro" first, or using "Entrar", keeps the sample data, so a new passenger can
// still switch to the sample vanzeiro to accept their own pedido. Reloading brings the samples back.
let contaNova: { nome: string } | null = null;

export function marcarContaNova(nome: string) {
  contaNova = { nome };
}

/** Called when the person taps "Sou vanzeiro". */
export function abrirPainelVanzeiro() {
  if (!contaNova) return;
  limparViagens();
  limparRespostas();
  limparCobrancas();
  limparPassageiros();
  limparDestinos();
  perfilNovo(contaNova.nome);
  contaNova = null;
}

/** "Sou passageiro" or "Entrar": the sample vanzeiro panel stays as it is. */
export function esquecerContaNova() {
  contaNova = null;
}
