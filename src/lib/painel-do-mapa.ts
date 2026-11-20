// CORREÇÃO 4 (20/11/2026): what the passenger's map screen says. Only real data: the route's cities and the person's
// own point on the map; the trip's situation and the boarding come from the trip itself (and, with the database,
// from `embarque_da_viagem`). The van's position is never shown: there is no real GPS yet.

export type EstadoDoMapa = "sem-destino" | "carregando" | "indisponivel" | "pronto";

/** Which map to show: the route, a "loading" box, or an honest "not available now". */
export function estadoDoMapa(a: {
  temDestino: boolean;
  cidadesNoMapa: number;
  procurando: boolean;
}): EstadoDoMapa {
  if (!a.temDestino) return "sem-destino";
  if (a.cidadesNoMapa > 0) return "pronto";
  return a.procurando ? "carregando" : "indisponivel";
}

export const TEXTO_DO_MAPA: Record<Exclude<EstadoDoMapa, "pronto">, string> = {
  "sem-destino":
    "Você ainda não está em um destino. Entre com o código do vanzeiro para ver a rota.",
  carregando: "Carregando o mapa…",
  indisponivel:
    "Não deu para carregar o mapa agora. Confira a internet. As informações da viagem continuam valendo.",
};

/** Said on the screen, always: the map does not show where the van is. */
export const AVISO_DA_POSICAO = "O mapa ainda não mostra onde a van está agora.";

/** What a screen reader says about the map. */
export function rotuloDoMapa(nomeDoDestino: string, temMeuPonto: boolean) {
  return `Mapa da rota ${nomeDoDestino}${temMeuPonto ? ", com o seu ponto de embarque" : ""}`;
}
