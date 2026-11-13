import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, Home } from "lucide-react";
import { AntesDeSair } from "@/components/app/viagem/AntesDeSair";
import { EscolhaDaViagem } from "@/components/app/viagem/partes";
import { PrimeiroDestino } from "@/components/app/PrimeiroDestino";
import { ResumoDaViagem } from "@/components/app/viagem/ResumoDaViagem";
import { ViagemEmCurso } from "@/components/app/viagem/ViagemEmCurso";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";
import { buttonVariants } from "@/components/ui/button";
import { DATA_DE_HOJE } from "@/data/exemplo";
import { useRespostasDoDia } from "@/lib/respostas-store";
import { formatarData, nomeDestino } from "@/lib/destinos";
import { useDestinos } from "@/lib/destinos-store";
import { usePassageiros } from "@/lib/passageiros-store";
import { cn } from "@/lib/utils";
import { listaDaViagem, proximaViagem, viagensDoDia, type FaseViagem } from "@/lib/viagem";
import { comecarViagem, emAndamento, escolherViagem, useViagensDoDia } from "@/lib/viagem-store";

export const Route = createFileRoute("/vanzeiro/viagem")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Viagem — O Vanzeiro" },
      { name: "description", content: "Busque os passageiros na ordem, faça paradas com conferência e registre a volta." },
      { property: "og:title", content: "Viagem — O Vanzeiro" },
      { property: "og:description", content: "Busque os passageiros na ordem, faça paradas com conferência e registre a volta." },
    ],
  }),
  component: AbaViagem,
});

const TITULO: Record<FaseViagem, string> = {
  busca: "Buscando passageiros",
  parada: "Parada",
  conferencia: "Conferência",
  chegada: "Chegou ao destino",
  "conferencia-volta": "Conferência da volta",
  volta: "Levando de volta",
  encerrada: "Viagem encerrada",
};

function AbaViagem() {
  const estado = useViagensDoDia();
  const destinos = useDestinos();
  const passageiros = usePassageiros();
  const respostas = useRespostasDoDia(DATA_DE_HOJE);
  const hoje = viagensDoDia(destinos, DATA_DE_HOJE);
  const andamento = emAndamento(estado);
  const dataDeHoje = `Hoje, ${formatarData(DATA_DE_HOJE).toLowerCase()}`;

  if (andamento) {
    const destino = destinos.find((d) => d.id === andamento.destinoId);
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <VanzeiroHeader compacto titulo={TITULO[andamento.fase]} subtitulo={destino ? nomeDestino(destino) : dataDeHoje} />
        <div className="relative z-10 -mt-4 flex min-h-0 flex-1 flex-col">
          <ViagemEmCurso v={andamento} passageiros={passageiros} />
        </div>
      </div>
    );
  }

  if (destinos.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <VanzeiroHeader compacto titulo="Viagem" subtitulo={dataDeHoje} />
        <PrimeiroDestino />
      </div>
    );
  }

  if (hoje.length === 0) {
    const proxima = proximaViagem(destinos, DATA_DE_HOJE);
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <VanzeiroHeader compacto titulo="Viagem" subtitulo={dataDeHoje} />
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft text-primary">
            <CalendarClock className="h-8 w-8" />
          </div>
          <p className="mt-4 font-display text-xl font-bold text-foreground">Nenhuma viagem hoje</p>
          {proxima ? (
            <p className="mt-2 text-muted-foreground">
              Próxima: <span className="font-semibold text-foreground">{formatarData(proxima.data)}</span>
              <br />
              {nomeDestino(proxima.destino)} · saída {proxima.destino.saida}
            </p>
          ) : (
            <p className="mt-2 text-muted-foreground">Nenhuma viagem marcada.</p>
          )}
        </div>
      </div>
    );
  }

  const destino = hoje.find((d) => d.id === estado.escolhida) ?? hoje[0]!;
  const feita = estado.viagens[destino.id];
  const feitas = hoje.filter((d) => estado.viagens[d.id]).map((d) => d.id);
  const lista = listaDaViagem(passageiros, destino, respostas);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <VanzeiroHeader compacto titulo={feita ? "Viagem encerrada" : "Viagem"} subtitulo={dataDeHoje} />
      {hoje.length > 1 && (
        <div className="relative z-10 -mt-4 shrink-0 px-5">
          <EscolhaDaViagem viagens={hoje} escolhida={destino.id} feitas={feitas} aoEscolher={escolherViagem} />
        </div>
      )}
      <div className={cn("flex min-h-0 flex-1 flex-col", hoje.length > 1 ? "" : "relative z-10 -mt-4")}>
        {feita ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-3 pt-3">
              <p className="mb-2 px-1 font-display text-base font-bold text-foreground">{nomeDestino(destino)}</p>
              <ResumoDaViagem v={feita} passageiros={passageiros} completo />
            </div>
            <div className="shrink-0 px-5 pb-3 pt-1">
              <Link to="/vanzeiro" className={cn(buttonVariants({ variant: "outline", size: "xl" }), "w-full rounded-2xl font-display font-bold")}>
                <Home className="h-5 w-5" /> Voltar ao início
              </Link>
            </div>
          </>
        ) : (
          <AntesDeSair
            destino={destino}
            {...lista}
            aoIniciar={() => comecarViagem(destino, lista.vao.map((p) => p.id))}
          />
        )}
      </div>
    </div>
  );
}
