import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, History, Home, MapPin, UserPlus } from "lucide-react";
import { AntesDeSair } from "@/components/app/viagem/AntesDeSair";
import { EscolhaDaViagem } from "@/components/app/viagem/partes";
import { PrimeiroDestino } from "@/components/app/PrimeiroDestino";
import { TelaVazia } from "@/components/app/TelaVazia";
import { ResumoDaViagem } from "@/components/app/viagem/ResumoDaViagem";
import { ViagemEmCurso } from "@/components/app/viagem/ViagemEmCurso";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";
import { buttonVariants } from "@/components/ui/button";
import { dataDeHoje } from "@/lib/agora";
import { useRespostasDoDia } from "@/lib/respostas-store";
import { formatarData, nomeDestino } from "@/lib/destinos";
import { useDestinos } from "@/lib/destinos-store";
import { usePassageiros } from "@/lib/passageiros-store";
import { cn } from "@/lib/utils";
import { listaDaViagem, proximaViagem, viagemDeHoje, viagensDoDia, type FaseViagem } from "@/lib/viagem";
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
  const respostas = useRespostasDoDia(dataDeHoje());
  const hoje = viagensDoDia(destinos, dataDeHoje());
  const andamento = emAndamento(estado);
  const textoDeHoje = `Hoje, ${formatarData(dataDeHoje()).toLowerCase()}`;

  if (andamento) {
    const destino = destinos.find((d) => d.id === andamento.destinoId);
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <VanzeiroHeader compacto titulo={TITULO[andamento.fase]} subtitulo={destino ? nomeDestino(destino) : textoDeHoje} />
        <div className="relative z-10 -mt-4 flex min-h-0 flex-1 flex-col">
          <ViagemEmCurso v={andamento} passageiros={passageiros} />
        </div>
      </div>
    );
  }

  if (destinos.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <VanzeiroHeader compacto titulo="Viagem" subtitulo={textoDeHoje} />
        <PrimeiroDestino />
      </div>
    );
  }

  if (hoje.length === 0) {
    const proxima = proximaViagem(destinos, dataDeHoje());
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <VanzeiroHeader compacto titulo="Viagem" subtitulo={textoDeHoje}>
          <LinkViagensFeitas />
        </VanzeiroHeader>
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
          <Link to="/vanzeiro/destinos" className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full")}>
            <MapPin className="!h-5 !w-5" /> Ver destinos
          </Link>
        </div>
      </div>
    );
  }

  const destino = viagemDeHoje(destinos, estado.escolhida, dataDeHoje())!;
  const feita = estado.viagens[destino.id];
  const feitas = hoje.filter((d) => estado.viagens[d.id]).map((d) => d.id);
  const lista = listaDaViagem(passageiros, destino, respostas);
  const semPassageiros = lista.vao.length + lista.semResposta.length + lista.naoVao.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <VanzeiroHeader compacto titulo={feita ? "Viagem encerrada" : "Viagem"} subtitulo={textoDeHoje}>
        <LinkViagensFeitas />
      </VanzeiroHeader>
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
        ) : semPassageiros ? (
          <TelaVazia
            icon={UserPlus}
            titulo="Este destino ainda não tem passageiros."
            texto={nomeDestino(destino)}
            botao={
              <Link to="/vanzeiro/destinos/$id" params={{ id: destino.id }} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                <UserPlus className="!h-5 !w-5" /> Convidar passageiros
              </Link>
            }
          />
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

/** Discreet way to the history of finished trips, in the header, when no trip is in progress. */
function LinkViagensFeitas() {
  return (
    <Link
      to="/vanzeiro/historico"
      className="relative mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-header-foreground/10 px-3.5 text-sm font-semibold transition-colors hover:bg-header-foreground/20"
    >
      <History className="h-4 w-4" /> Viagens feitas
    </Link>
  );
}
