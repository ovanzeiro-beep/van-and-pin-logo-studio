import { DATA_DE_HOJE, HORA_DE_AGORA, type RespostaViagem, type Passageiro, type Destino } from "@/data/exemplo";
import { formatarData, textoDoPrazo } from "@/lib/destinos";
import { useDestinos } from "@/lib/destinos-store";
import { respostasDoDia, useRespostas } from "@/lib/respostas-store";
import { useEu, useMinhasMatriculas } from "@/lib/sessao-passageiro";
import { confirmacaoAberta, proximasDatas, proximaViagem } from "@/lib/viagem";
import { useViagensDoDia } from "@/lib/viagem-store";

export const AGORA = { data: DATA_DE_HOJE, hora: HORA_DE_AGORA };
export type MinhaProximaViagem = {
  data: string; resposta: RespostaViagem | undefined; aberta: boolean; prazo: string; emAndamento: boolean;
  eu: Passageiro; destino: Destino;
};
export function rotuloDoDia(data: string, hoje = DATA_DE_HOJE) {
  const texto = formatarData(data);
  return data === hoje ? `Hoje, ${texto.split(", ")[1] ?? texto}` : texto;
}
export function viagensDasMatriculas(matriculas: Passageiro[], destinos: Destino[], hoje: string) {
  return matriculas.flatMap((eu) => {
    const destino = destinos.find((d) => d.id === eu.destinoId);
    return destino ? proximasDatas(destino, hoje).map((data) => ({ data, eu, destino })) : [];
  }).sort((a, b) => a.data.localeCompare(b.data) || a.destino.saida.localeCompare(b.destino.saida));
}
export function useMinhasViagens() {
  const ancora = useEu();
  const matriculas = useMinhasMatriculas();
  const destinos = useDestinos();
  const respostas = useRespostas();
  const { viagens } = useViagensDoDia();
  const proximas: MinhaProximaViagem[] = viagensDasMatriculas(matriculas, destinos, DATA_DE_HOJE)
    .filter((v) => !(v.data === DATA_DE_HOJE && viagens[v.destino.id]?.fase === "encerrada"))
    .map((v) => {
      const comecou = v.data === DATA_DE_HOJE && viagens[v.destino.id] !== undefined;
      return { ...v, resposta: respostasDoDia(respostas, v.data)[v.eu.id], aberta: confirmacaoAberta(v.destino, v.data, AGORA, comecou), prazo: textoDoPrazo(v.destino, v.data), emAndamento: comecou };
    });
  const meusDestinos = destinos.filter((d) => matriculas.some((p) => p.destinoId === d.id));
  const distante = proximas.length === 0 ? proximaViagem(meusDestinos, DATA_DE_HOJE) : null;
  // An active conference takes priority so it remains available even with several memberships.
  const ativa = matriculas.find((p) => viagens[p.destinoId] && viagens[p.destinoId]?.fase !== "encerrada");
  const eu = ativa ?? proximas[0]?.eu ?? ancora;
  const destino = destinos.find((d) => d.id === (ativa?.destinoId ?? proximas[0]?.destino.id ?? distante?.destino.id ?? eu.destinoId));
  return { eu, destino, proximas, matriculas, destinos, viagens, proximaDistante: distante?.data ?? null, viagemDeHoje: viagens[eu.destinoId], respostaDeHoje: respostasDoDia(respostas, DATA_DE_HOJE)[eu.id] };
}
