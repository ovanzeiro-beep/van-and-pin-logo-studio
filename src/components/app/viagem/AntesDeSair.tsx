import { Play, Route as RouteIcon } from "lucide-react";
import { InfoCard, StatusBadge } from "@/components/app/InfoCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Destino, Passageiro } from "@/data/exemplo";
import { nomeDestino } from "@/lib/destinos";
import { LinhaPassageiro, Secao } from "./partes";

/** Before leaving: the trip of the day, who goes in pickup order, who didn't answer and who doesn't go. */
export function AntesDeSair({
  destino,
  vao,
  semResposta,
  naoVao,
  faltamResponder,
  prazo,
  aoIniciar,
}: {
  destino: Destino;
  vao: Passageiro[];
  semResposta: Passageiro[];
  naoVao: Passageiro[];
  /** Answers still missing when starting before the deadline (0 = start right away). */
  faltamResponder: number;
  prazo: string;
  aoIniciar: () => void;
}) {
  const propsDoBotao = { variant: "cta" as const, size: "xl" as const, className: "w-full rounded-2xl font-display font-bold", disabled: vao.length === 0 };
  const botao = (
    <Button {...propsDoBotao}>
      <Play className="h-5 w-5" /> Iniciar viagem
    </Button>
  );
  return (
    <>
      <div className="shrink-0 px-5 pt-3">
        <InfoCard
          compacto
          icon={RouteIcon}
          label="Viagem de hoje"
          value={nomeDestino(destino)}
          detail={`Saída ${destino.saida} · ${destino.volta ? `volta ${destino.volta}` : "sem volta"}`}
          aside={<StatusBadge status="pago">{vao.length} {vao.length === 1 ? "vai" : "vão"}</StatusBadge>}
        />
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-3 pt-4">
        <Secao titulo="Quem vai · na ordem da busca">
          {vao.length === 0 ? (
            <p className="rounded-2xl bg-card px-4 py-3 text-sm text-muted-foreground shadow-card">Ninguém confirmou ainda.</p>
          ) : (
            vao.map((p, i) => (
              <LinhaPassageiro
                key={p.id}
                p={p}
                inicio={
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-soft font-display text-sm font-bold text-success">
                    {i + 1}
                  </span>
                }
              />
            ))
          )}
        </Secao>
        {semResposta.length > 0 && (
          <Secao titulo="Sem resposta">
            {semResposta.map((p) => (
              <LinhaPassageiro key={p.id} p={p} fim={<StatusBadge status="pendente">Sem resposta</StatusBadge>} />
            ))}
          </Secao>
        )}
        {naoVao.length > 0 && (
          <Secao titulo="Não vão">
            {naoVao.map((p) => (
              <LinhaPassageiro key={p.id} p={p} className="opacity-80" fim={<StatusBadge status="deve">Não vai</StatusBadge>} />
            ))}
          </Secao>
        )}
      </div>

      <div className="shrink-0 px-5 pb-3 pt-1">
        {faltamResponder > 0 && vao.length > 0 ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>{botao}</AlertDialogTrigger>
            <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Iniciar mesmo assim?</AlertDialogTitle>
                <AlertDialogDescription>
                  {faltamResponder === 1 ? "Ainda falta 1 responder" : `Ainda faltam ${faltamResponder} responder`}. O prazo é até {prazo}; se iniciar agora,
                  quem não respondeu fica fora da busca.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className={buttonVariants({ variant: "outline", size: "lg" })}>Esperar</AlertDialogCancel>
                <AlertDialogAction className={buttonVariants({ variant: "cta", size: "lg" })} onClick={aoIniciar}>
                  Iniciar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button {...propsDoBotao} onClick={aoIniciar}>
            <Play className="h-5 w-5" /> Iniciar viagem
          </Button>
        )}
      </div>
    </>
  );
}
