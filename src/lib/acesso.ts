import { limparAvisos } from "@/lib/avisos-store";
import { limparCobrancas } from "@/lib/cobrancas-store";
import { limparDestinos } from "@/lib/destinos-store";
import { limparGastos } from "@/lib/gastos-store";
import { limparPassageiros } from "@/lib/passageiros-store";
import { limparRespostas } from "@/lib/respostas-store";
import { mudarSessao, obterSessao, type Papel } from "@/lib/sessao";
import { perfilNovo } from "@/lib/vanzeiro-store";
import { limparViagens } from "@/lib/viagem-store";
import { limparViagensEncerradas } from "@/lib/viagens-encerradas-store";
import { nomeDePessoa } from "@/lib/formatos";

// Entrar, Criar conta, "Como você vai usar o app?" and Sair. Everything is saved in sessao.ts.
// "Criar conta" makes a new person. When their first choice is "Sou vanzeiro", the vanzeiro panel
// starts empty (no destinos, passengers, pedidos, charges, trips or notices) with their name.
// Choosing "Sou passageiro" first, or using "Entrar", keeps the sample data, so a new passenger can
// still switch to the sample vanzeiro to accept their own pedido. Reloading brings the samples back.

/** "Entrar": the sample data stays as it is. */
export function entrar() {
  mudarSessao({ contaNova: null });
}

/** "Criar conta": a new person, not in any van yet. */
export function criarConta(nome: string) {
  mudarSessao({ contaNova: { nome: nomeDePessoa(nome) }, passageiro: { nome: nomeDePessoa(nome), telefone: "", passageiroId: null, pedidoId: null } });
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
    limparAvisos();
    limparViagensEncerradas();
    limparGastos();
    perfilNovo(contaNova.nome);
  }
  mudarSessao({ papel, contaNova: null });
}

/**
 * W1: a real account just logged in. Until each part of the app moves to the database (W2 to W8), what is in memory
 * starts empty for it (the samples belong to the sample vanzeiro), as "Criar conta" already did.
 */
export function comecarContaDeVerdade(conta: { id: string; nome: string }) {
  limparViagens();
  limparRespostas();
  limparCobrancas();
  limparPassageiros();
  limparDestinos();
  limparAvisos();
  limparViagensEncerradas();
  limparGastos();
  mudarSessao({ vanzeiroId: conta.id, contaNova: null, passageiro: { nome: conta.nome, telefone: "", passageiroId: conta.id, pedidoId: null } });
  perfilNovo(conta.nome);
}

export function sair() {
  mudarSessao({ papel: null, contaNova: null });
}
