import { type Passageiro, type PedidoEntrada } from "@/data/exemplo";
import { obterDestinos } from "@/lib/destinos-store";
import { adicionarPedido, obterAceitos, obterPassageiros, obterPedidos, salvarDadosDoPassageiro, useAceitos, usePassageiros, usePedidos, useSaidas } from "@/lib/passageiros-store";

import { matriculasDaPessoa, identidadePassageiro, somenteDigitos, type MeusDados } from "@/lib/passageiros";
import { mudarSessaoPassageiro, obterSessao, useSessao, type SessaoPassageiro } from "@/lib/sessao";

// The passenger panel of whoever is using the app (saved in sessao.ts). Starts as the sample
// passenger (Juliana); a new account starts with no van and joins one with an invite code.

export function useSessaoPassageiro() {
  return useSessao().passageiro;
}

export function pedirParaEntrar(destinoId: string, nome: string, telefone: string) {
  if (obterSessao().passageiro.passageiroId && obterMinhasMatriculas().some((p) => p.destinoId === destinoId)) return;
  const destino = obterDestinos().find((d) => d.id === destinoId);
  if (!destino) return;
  const eu = obterMinhasMatriculas()[0];
  const pedidoId = adicionarPedido({ vanzeiroId: destino.vanzeiroId, destinoId, nome: nome.trim(), telefone, pessoaId: eu ? identidadePassageiro(eu) : undefined });
  mudarSessaoPassageiro({ nome: nome.trim(), telefone, pedidoId });
}

/** "Editar" on the passenger's Perfil: saves on every destino of this person and in this session. */
export function salvarMeusDados(euId: string, dados: MeusDados) {
  salvarDadosDoPassageiro(euId, dados);
  mudarSessaoPassageiro({ nome: dados.nome.trim(), telefone: somenteDigitos(dados.telefone) });
}

export function tentarOutroCodigo() {
  mudarSessaoPassageiro({ pedidoId: null });
}

export type MinhaSituacao =
  | { tipo: "membro"; passageiro: Passageiro }
  | { tipo: "aguardando"; destinoId: string }
  | { tipo: "recusado" }
  | { tipo: "sem-van" };

/** Whether this person is in a van, waiting for the vanzeiro, or still needs an invite code. */
export function useMinhaSituacao(): MinhaSituacao {
  return situacaoDe(useSessaoPassageiro(), usePassageiros(), usePedidos(), useAceitos());
}

function situacaoDe(s: SessaoPassageiro, passageiros: Passageiro[], pedidos: PedidoEntrada[], aceitos: Record<string, string>): MinhaSituacao {
  const id = (s.pedidoId && aceitos[s.pedidoId]) || s.passageiroId;
  const ancora = passageiros.find((p) => p.id === id) ?? passageiros.find((p) => identidadePassageiro(p) === (s.passageiroId ?? id));
  const passageiro = ancora;
  if (passageiro) return { tipo: "membro", passageiro };
  if (s.pedidoId) {
    const pedido = pedidos.find((p) => p.id === s.pedidoId);
    return pedido ? { tipo: "aguardando", destinoId: pedido.destinoId } : { tipo: "recusado" };
  }
  return { tipo: "sem-van" };
}

/** The passenger record of whoever is using the panel (the panel only opens when there is one). */
export function useEu(): Passageiro {
  const s = useMinhaSituacao();
  if (s.tipo !== "membro") throw new Error("Passageiro sem van");
  return s.passageiro;
}

export function useMinhasMatriculas() {
  const eu = useEu();
  return matriculasDaPessoa(usePassageiros(), eu);
}

/** Whose charges the passenger sees: current destinos plus destinos they left (what they still owe there). */
export function useIdsDasMinhasCobrancas() {
  const eu = useEu();
  const matriculas = useMinhasMatriculas();
  const saidas = useSaidas();
  const minhas = saidas.filter((p) => identidadePassageiro(p) === identidadePassageiro(eu));
  return [...matriculas, ...minhas].map((p) => p.id);
}
/** The memberships of whoever is using the passenger panel. */
export function obterMinhasMatriculas() {
  const lista = obterPassageiros();
  const s = situacaoDe(obterSessao().passageiro, lista, obterPedidos(), obterAceitos());
  return s.tipo === "membro" ? matriculasDaPessoa(lista, s.passageiro) : [];
}
