import { caminhoCompleto } from "@/lib/destinos";
import { distanciaKm, type Ponto } from "@/lib/mapa";
import type { Destino } from "@/data/exemplo";

// N3: "Organizar pela distância". Inside one city, puts the pickups in an order where each one is close to the next,
// coming from the previous city of the route (or, in the origem, ending on the side of the next city). Passengers
// without a point on the map cannot be placed: they keep their order at the end. The vanzeiro can still drag after.

type ComPonto = { id: string; ponto?: Ponto | null | undefined };

/** Length of the path start → a → b → … → end (end optional). */
function tamanho(inicio: Ponto | undefined, pontos: Ponto[], fim: Ponto | undefined) {
  let km = 0;
  let de = inicio;
  for (const p of pontos) {
    if (de) km += distanciaKm(de, p);
    de = p;
  }
  if (fim && de) km += distanciaKm(de, fim);
  return km;
}

/**
 * The new order of the ids: nearest next stop each time, then small swaps while they shorten the path (2-opt).
 * `entrada`: where the van comes from (previous city); `saida`: where it goes after (next city).
 */
export function ordemPelaDistancia(lista: ComPonto[], entrada?: Ponto, saida?: Ponto): string[] {
  const comPonto = lista.filter((p): p is { id: string; ponto: Ponto } => !!p.ponto);
  const semPonto = lista.filter((p) => !p.ponto).map((p) => p.id);
  if (comPonto.length < 2) return [...comPonto.map((p) => p.id), ...semPonto];

  // Start: the closest to where the van comes from; in the origem (nothing before), the farthest from the next city.
  const restam = [...comPonto];
  const primeiro = entrada
    ? restam.reduce((a, b) =>
        distanciaKm(entrada, b.ponto) < distanciaKm(entrada, a.ponto) ? b : a,
      )
    : saida
      ? restam.reduce((a, b) => (distanciaKm(saida, b.ponto) > distanciaKm(saida, a.ponto) ? b : a))
      : restam[0]!;
  const rota = [primeiro];
  restam.splice(restam.indexOf(primeiro), 1);
  while (restam.length) {
    const atual = rota[rota.length - 1]!.ponto;
    const perto = restam.reduce((a, b) =>
      distanciaKm(atual, b.ponto) < distanciaKm(atual, a.ponto) ? b : a,
    );
    rota.push(perto);
    restam.splice(restam.indexOf(perto), 1);
  }

  // 2-opt: reverses a piece of the path when that makes it shorter (the first stays first when there is an entrada).
  const inicio = entrada ? 1 : 0;
  let melhorou = true;
  for (let voltas = 0; melhorou && voltas < 50; voltas++) {
    melhorou = false;
    for (let i = inicio; i < rota.length - 1; i++) {
      for (let k = i + 1; k < rota.length; k++) {
        const nova = [...rota.slice(0, i), ...rota.slice(i, k + 1).reverse(), ...rota.slice(k + 1)];
        if (
          tamanho(
            entrada,
            nova.map((p) => p.ponto),
            saida,
          ) +
            1e-9 <
          tamanho(
            entrada,
            rota.map((p) => p.ponto),
            saida,
          )
        ) {
          rota.splice(0, rota.length, ...nova);
          melhorou = true;
        }
      }
    }
  }
  return [...rota.map((p) => p.id), ...semPonto];
}

/** The cities before and after this one on the route, where the map knows them. */
export function vizinhasNaRota(
  destino: Pick<Destino, "origem" | "destino" | "paradas">,
  cidade: string,
  coordenadas: Record<string, Ponto>,
) {
  const caminho = caminhoCompleto(destino);
  const i = caminho.indexOf(cidade);
  if (i < 0) return { entrada: undefined, saida: undefined };
  return {
    entrada: i > 0 ? coordenadas[caminho[i - 1]!] : undefined,
    saida: i < caminho.length - 1 ? coordenadas[caminho[i + 1]!] : undefined,
  };
}

/** Puts the passengers of one city of one destino in the given order (other cities and destinos never change). */
export function aplicarOrdemNaCidade<T extends { id: string; destinoId: string; cidade: string }>(
  lista: T[],
  destinoId: string,
  cidade: string,
  ids: string[],
): T[] {
  const posicoes = lista.flatMap((x, i) =>
    x.destinoId === destinoId && x.cidade === cidade ? [i] : [],
  );
  const grupo = posicoes.map((i) => lista[i]!);
  const novo = [
    ...ids.flatMap((id) => grupo.filter((x) => x.id === id)),
    ...grupo.filter((x) => !ids.includes(x.id)),
  ];
  if (novo.every((x, k) => x === grupo[k])) return lista;
  const resultado = [...lista];
  posicoes.forEach((pos, k) => (resultado[pos] = novo[k]!));
  return resultado;
}
