import { limparCobrancas } from "@/lib/cobrancas-store";
import { limparDestinos } from "@/lib/destinos-store";
import { limparPassageiros } from "@/lib/passageiros-store";
import { limparRespostas } from "@/lib/respostas-store";
import { mudarSessao, obterSessao, type Papel } from "@/lib/sessao";
import { perfilNovo } from "@/lib/vanzeiro-store";
import { limparViagens } from "@/lib/viagem-store";

// Entrar, Criar conta, "Como você vai usar o app?" and Sair. Everything is saved in sessao.ts.
// "Criar conta" makes a new person. When their first choice is "Sou vanzeiro", the vanzeiro panel
// starts empty (no destinos, passengers, pedidos, charges or trips) with their name.
// Choosing "Sou passageiro" first, or using "Entrar", keeps the sample data, so a new passenger can
// still switch to the sample vanzeiro to accept their own pedido. Reloading brings the samples back.

/** "Entrar": the sample data stays as it is. */
export function entrar() {
  mudarSessao({ contaNova: null });
}

/** "Criar conta": a new person, not in any van yet. */
export function criarConta(nome: string) {
  mudarSessao({ contaNova: { nome: nome.trim() }, passageiro: { nome: nome.trim(), telefone: "", passageiroId: null, pedidoId: null } });
}

/** "Sou vanzeiro" / "Sou passageiro", first time or switching on the Perfil. */
export function escolherPapel(papel: Papel) {
  const { contaNova } = obterSessao();
  if (papel === "vanzeiro" && contaNova) {
    limparViagens();
    limparRespostas();
    limparCobrancas();
    limparPassageiros();
    limparDestinos();
    perfilNovo(contaNova.nome);
  }
  mudarSessao({ papel, contaNova: null });
}

export function sair() {
  mudarSessao({ papel: null, contaNova: null });
}
