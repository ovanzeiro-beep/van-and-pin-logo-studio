import type { Destino } from "@/data/exemplo";
import { dataDaVolta } from "@/lib/destinos";
import { formatarData } from "@/lib/datas";

export function previsaoDaVolta(
  destino: Pick<Destino, "tipo" | "saida" | "volta" | "voltaData">,
  dataIda: string,
  agora: { data: string; hora: string },
) {
  const data = dataDaVolta(destino, dataIda);
  if (!data || !destino.volta) return null;

  // Ambas as datas já estão no horário de Brasília. Compará-las na mesma escala inclui a mudança de dia.
  const volta = Date.parse(`${data}T${destino.volta}:00Z`);
  const atual = Date.parse(`${agora.data}T${agora.hora}:00Z`);
  if (!Number.isFinite(volta) || !Number.isFinite(atual)) return null;
  const minutos = Math.max(0, (volta - atual) / 60_000);
  const dias = Math.floor(minutos / 1440);
  const horas = Math.floor((minutos % 1440) / 60);
  const restantes = minutos % 60;
  const duracao = [
    dias > 0 ? `${dias} ${dias === 1 ? "dia" : "dias"}` : "",
    horas > 0 ? `${horas} h` : "",
    restantes > 0 ? `${restantes} min` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    horario:
      data === agora.data
        ? `Volta às ${destino.volta}`
        : `Volta em ${formatarData(data).toLowerCase()}, às ${destino.volta}`,
    situacao:
      minutos > 0
        ? `${minutos === 1 ? "Falta" : "Faltam"} ${duracao}`
        : "Aguardando o motorista iniciar a volta.",
  };
}
