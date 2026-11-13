import { CircleCheck, Coffee, Flag, Home, Play, Smartphone, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Passageiro } from "@/data/exemplo";
import { cn } from "@/lib/utils";
import {
  aBordo,
  chegarAoDestino,
  conferenciaCompleta,
  conferir,
  desceu,
  encerrarViagem,
  fazerParada,
  iniciarVolta,
  listaDaConferencia,
  proximoDaBusca,
  proximoDaVolta,
  retomarViagem,
  seguirViagem,
  type ViagemDoDia,
} from "@/lib/viagem";
import { atualizarViagem, marcarEmbarcou, marcarNaoEstava } from "@/lib/viagem-store";
import { LinhaPassageiro, PassageiroDaVez, Progresso } from "./partes";
import { ResumoDaViagem } from "./ResumoDaViagem";

const botaoGrande = "h-[3.25rem] w-full rounded-2xl font-display text-base font-bold";

function BotaoParada() {
  return (
    <Button variant="outline" className="w-full rounded-2xl font-bold" onClick={() => atualizarViagem(fazerParada)}>
      <Coffee className="h-5 w-5" /> Fazer parada
    </Button>
  );
}

/** Body of the Viagem tab while a trip is in progress, one screen per moment of the trip. */
export function ViagemEmCurso({ v, passageiros }: { v: ViagemDoDia; passageiros: Passageiro[] }) {
  const achar = (id: string | undefined) => passageiros.find((p) => p.id === id);

  if (v.fase === "busca") {
    const id = proximoDaBusca(v);
    const feitos = v.embarcaram.length + v.naoEstavam.length;
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 px-5 pb-2.5 pt-3">
        <Progresso
          feitos={v.embarcaram.length}
          total={v.ordem.length}
          texto="embarcados"
          extra={v.naoEstavam.length > 0 && <span className="text-sm font-bold text-destructive">{v.naoEstavam.length} faltou</span>}
        />
        {id ? (
          <>
            <PassageiroDaVez rotulo="Próximo passageiro" p={achar(id)} posicao={`${feitos + 1}º de ${v.ordem.length}`} />
            <div className="grid gap-2">
              <Button variant="success" size="xl" className={botaoGrande} onClick={() => marcarEmbarcou(id)}>
                <UserCheck className="h-6 w-6" /> Embarcou
              </Button>
              <Button
                size="xl"
                className={cn(botaoGrande, "border-2 border-destructive bg-destructive-soft text-destructive hover:bg-destructive-soft/80")}
                onClick={() => marcarNaoEstava(id)}
              >
                <UserX className="h-6 w-6" /> Não estava no ponto
              </Button>
            </div>
          </>
        ) : (
          <>
            <section className="flex flex-1 flex-col items-center justify-center rounded-3xl bg-card p-5 text-center shadow-card">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-success-soft text-success">
                <CircleCheck className="h-7 w-7" />
              </div>
              <p className="mt-3 font-display text-xl font-bold leading-tight text-foreground">Todos buscados — seguir para o destino</p>
            </section>
            <Button variant="cta" size="xl" className={botaoGrande} onClick={() => atualizarViagem(chegarAoDestino)}>
              <Flag className="h-5 w-5" /> Cheguei ao destino
            </Button>
          </>
        )}
        <div className="mt-auto">
          <BotaoParada />
        </div>
      </div>
    );
  }

  if (v.fase === "volta") {
    const id = proximoDaVolta(v);
    const total = v.naVolta.filter((x) => !v.ficaram.includes(x) || v.desceram.includes(x)).length;
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 px-5 pb-2.5 pt-3">
        <Progresso feitos={v.desceram.length} total={total} texto="deixados em casa" />
        {id && (
          <>
            <PassageiroDaVez rotulo="Próxima descida" p={achar(id)} posicao={`${v.desceram.length + 1}º de ${total}`} />
            <Button variant="success" size="xl" className={botaoGrande} onClick={() => atualizarViagem((x) => desceu(x, id))}>
              <Home className="h-6 w-6" /> Desceu
            </Button>
          </>
        )}
        <div className="mt-auto">
          <BotaoParada />
        </div>
      </div>
    );
  }

  if (v.fase === "parada") {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 px-5 pb-2.5 pt-3">
        <section className="flex flex-1 flex-col items-center justify-center rounded-3xl bg-card p-6 text-center shadow-card">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-warning-soft text-warning">
            <Coffee className="h-8 w-8" />
          </div>
          <p className="mt-4 font-display text-2xl font-bold text-foreground">Parada em andamento</p>
          <p className="mt-1 text-muted-foreground">
            {aBordo(v).length > 0 ? "Antes de seguir, você confere quem está na van." : "Toque abaixo quando for seguir."}
          </p>
        </section>
        <Button variant="cta" size="xl" className={botaoGrande} onClick={() => atualizarViagem(retomarViagem)}>
          <Play className="h-5 w-5" /> Retomar viagem
        </Button>
      </div>
    );
  }

  if (v.fase === "conferencia" || v.fase === "conferencia-volta") {
    const lista = listaDaConferencia(v);
    const conferidos = lista.filter((id) => v.conferencia[id] !== undefined).length;
    const completa = conferenciaCompleta(v);
    return (
      <>
        <div className="shrink-0 px-5 pt-3">
          <Progresso feitos={conferidos} total={lista.length} texto="conferidos" />
        </div>
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 pb-3 pt-3">
          {lista.map((id) => {
            const estado = v.conferencia[id];
            const p = achar(id);
            const celular = v.peloCelular.includes(id);
            return (
              <li
                key={id}
                className={cn(
                  "rounded-2xl border-2 bg-card p-3 shadow-card",
                  estado === undefined && "border-destructive bg-destructive-soft",
                  estado === "na-van" && "border-success bg-success-soft",
                  estado === "ficou" && "border-transparent opacity-70",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className={cn("truncate font-semibold", estado === "na-van" ? "text-success" : "text-foreground")}>
                      {p?.nome ?? "Passageiro removido"}
                    </p>
                    {estado !== undefined && (
                      <p className={cn("flex items-center gap-1 text-xs font-semibold", celular ? "text-success" : "text-muted-foreground")}>
                        {celular && <Smartphone className="h-3.5 w-3.5" />}
                        {celular ? "Confirmou pelo celular" : "Conferido pelo vanzeiro"}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-xs font-bold",
                      estado === undefined ? "text-destructive" : estado === "na-van" ? "text-success" : "text-muted-foreground",
                    )}
                  >
                    {estado === undefined ? "Falta conferir" : estado === "na-van" ? "Na van" : "Ficou aqui"}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                  <Button
                    variant={estado === "na-van" ? "success" : "outline"}
                    className="rounded-xl font-bold"
                    aria-pressed={estado === "na-van"}
                    onClick={() => atualizarViagem((x) => conferir(x, id, "na-van"))}
                  >
                    <UserCheck className="h-5 w-5" /> Está na van
                  </Button>
                  <Button
                    variant={estado === "ficou" ? "secondary" : "ghost"}
                    className="rounded-xl font-semibold"
                    aria-pressed={estado === "ficou"}
                    onClick={() => atualizarViagem((x) => conferir(x, id, "ficou"))}
                  >
                    Ficou aqui
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="shrink-0 px-5 pb-3 pt-1">
          {!completa && <p className="mb-1.5 text-center text-sm font-semibold text-destructive">Confira todos para seguir.</p>}
          <Button variant="cta" size="xl" className={botaoGrande} disabled={!completa} onClick={() => atualizarViagem(seguirViagem)}>
            <Play className="h-5 w-5" /> Seguir viagem
          </Button>
        </div>
      </>
    );
  }

  if (v.fase === "chegada") {
    return (
      <>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-3 pt-3">
          <ResumoDaViagem v={v} passageiros={passageiros} completo={false} />
        </div>
        <div className="shrink-0 px-5 pb-3 pt-1">
          {v.temVolta ? (
            <Button variant="cta" size="xl" className={botaoGrande} onClick={() => atualizarViagem(iniciarVolta)}>
              <Play className="h-5 w-5" /> Iniciar volta
            </Button>
          ) : (
            <Button variant="cta" size="xl" className={botaoGrande} onClick={() => atualizarViagem(encerrarViagem)}>
              <Flag className="h-5 w-5" /> Encerrar viagem
            </Button>
          )}
        </div>
      </>
    );
  }

  return null;
}
