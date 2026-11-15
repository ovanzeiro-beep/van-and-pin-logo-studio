import { type Passageiro, type PedidoEntrada } from "@/data/exemplo";
import { dataDeHoje } from "@/lib/agora";
import { situacao, valorFinal } from "@/lib/cobrancas";
import { useCobrancasDasMatriculas } from "@/lib/cobrancas-store";
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
  if (obterMinhasMatriculas().some((p) => p.destinoId === destinoId)) return;
  const destino = obterDestinos().find((d) => d.id === destinoId);
  if (!destino) return;
  const eu = obterMinhasMatriculas()[0];
  const pedidoId = adicionarPedido({ vanzeiroId: destino.vanzeiroId, destinoId, nome: nome.trim(), telefone, pessoaId: eu ? identidadePassageiro(eu) : undefined });
  // Someone already in a van keeps being who they are: the new pedido must not replace the accepted one that said so.
  const passageiroId = obterSessao().passageiro.passageiroId ?? eu?.id ?? null;
  mudarSessaoPassageiro({ nome: nome.trim(), telefone, pedidoId, passageiroId });
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

/** The destinos this person left, found by the person (or, with no destino left, by the session). */
export function minhasSaidasDe(saidas: Passageiro[], euIdentidade: string | null, sessaoPassageiroId: string | null) {
  const quem = euIdentidade ?? saidas.find((p) => p.id === sessaoPassageiroId || identidadePassageiro(p) === sessaoPassageiroId);
  if (!quem) return [];
  const identidade = typeof quem === "string" ? quem : identidadePassageiro(quem);
  return saidas.filter((p) => identidadePassageiro(p) === identidade);
}

/** Whose charges the passenger sees: current destinos plus destinos they left (what they still owe there, decision A3). */
export function useIdsDasMinhasCobrancas() {
  const s = useMinhaSituacao();
  const sessao = useSessaoPassageiro();
  const todos = usePassageiros();
  const saidas = useSaidas();
  const eu = s.tipo === "membro" ? s.passageiro : null;
  const matriculas = eu ? matriculasDaPessoa(todos, eu) : [];
  const minhas = minhasSaidasDe(saidas, eu ? identidadePassageiro(eu) : null, sessao.passageiroId);
  return [...matriculas, ...minhas].map((p) => p.id);
}

/** Decision A3: someone who left their last destino still sees what they owe there (pendente or devendo). */
export function useEmAbertoDeQuemSaiu() {
  const s = useMinhaSituacao();
  const ids = useIdsDasMinhasCobrancas();
  const lista = useCobrancasDasMatriculas(ids);
  if (s.tipo === "membro") return null;
  const abertas = lista.filter((c) => {
    const sit = situacao(c, dataDeHoje());
    return sit === "pendente" || sit === "devendo";
  });
  if (abertas.length === 0) return null;
  return { total: abertas.reduce((soma, c) => soma + valorFinal(c), 0), devendo: abertas.some((c) => situacao(c, dataDeHoje()) === "devendo") };
}
/** The memberships of whoever is using the passenger panel. */
export function obterMinhasMatriculas() {
  const lista = obterPassageiros();
  const s = situacaoDe(obterSessao().passageiro, lista, obterPedidos(), obterAceitos());
  return s.tipo === "membro" ? matriculasDaPessoa(lista, s.passageiro) : [];
}
