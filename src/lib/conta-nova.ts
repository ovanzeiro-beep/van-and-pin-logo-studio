import { limparCobrancas } from "@/lib/cobrancas-store";
import { limparDestinos } from "@/lib/destinos-store";
import { limparPassageiros } from "@/lib/passageiros-store";
import { limparRespostas } from "@/lib/respostas-store";
import { perfilNovo } from "@/lib/vanzeiro-store";
import { limparViagens } from "@/lib/viagem-store";

// "Criar conta" makes a new person. The first time they open the vanzeiro panel,
// it starts empty (no destinos, passengers, pedidos, charges or trips) with their name.
// "Entrar" keeps the sample data. Reloading the page brings the samples back.
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
