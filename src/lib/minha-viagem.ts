import { DATA_DE_HOJE, HORA_DE_AGORA, type RespostaViagem } from "@/data/exemplo";
import { formatarData, textoDoPrazo } from "@/lib/destinos";
import { useDestino } from "@/lib/destinos-store";
import { respostasDoDia, useRespostas } from "@/lib/respostas-store";
import { useEu } from "@/lib/sessao-passageiro";
import { confirmacaoAberta, proximasDatas, proximaViagem } from "@/lib/viagem";
import { useViagensDoDia } from "@/lib/viagem-store";

/** "Agora" of the visual stage (fixed date and time so the sample deadlines stay coherent). */
export const AGORA = { data: DATA_DE_HOJE, hora: HORA_DE_AGORA };

export type MinhaProximaViagem = {
  data: string;
  resposta: RespostaViagem | undefined;
  aberta: boolean;
  /** "05:40" or "20:00 do dia anterior". */
  prazo: string;
  /** The vanzeiro already started today's trip. */
  emAndamento: boolean;
};

/** "Hoje, 13 de nov" or "Seg, 16 de nov". */
export function rotuloDoDia(data: string, hoje = DATA_DE_HOJE) {
  const texto = formatarData(data);
  return data === hoje ? `Hoje, ${texto.split(", ")[1] ?? texto}` : texto;
}

/** Everything about the trips of whoever is using the passenger panel. */
export function useMinhasViagens() {
  const eu = useEu();
  const destino = useDestino(eu.destinoId);
  const respostas = useRespostas();
  const { viagens } = useViagensDoDia();
  const viagemDeHoje = viagens[eu.destinoId];
  const hoje = DATA_DE_HOJE;

  const proximas: MinhaProximaViagem[] = destino
    ? proximasDatas(destino, hoje)
        .filter((data) => !(data === hoje && viagemDeHoje?.fase === "encerrada"))
        .map((data) => {
          const comecou = data === hoje && viagemDeHoje !== undefined;
          return {
            data,
            resposta: respostasDoDia(respostas, data)[eu.id],
            aberta: confirmacaoAberta(destino, data, AGORA, comecou),
            prazo: textoDoPrazo(destino, data),
            emAndamento: comecou,
          };
        })
    : [];
  const depois = destino && proximas.length === 0 ? proximaViagem([destino], somarUmaSemana(hoje)) : null;

  return {
    eu,
    destino,
    proximas,
    /** Next trip date when the next 7 days have none. */
    proximaDistante: depois?.data ?? null,
    viagemDeHoje,
    respostaDeHoje: respostasDoDia(respostas, hoje)[eu.id],
  };
}

function somarUmaSemana(iso: string) {
  const [a = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + 6)).toISOString().slice(0, 10);
}
