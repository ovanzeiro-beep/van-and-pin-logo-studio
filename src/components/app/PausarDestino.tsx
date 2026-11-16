import { Pause, Play } from "lucide-react";
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
import type { Destino } from "@/data/exemplo";
import { pausarOuAtivarDestino } from "@/lib/exclusoes";
import { emAndamento, useViagensDoDia } from "@/lib/viagem-store";
import { fazer } from "@/lib/acoes";

/** "Pausar" asks first (the destino leaves the trips); "Ativar" works right away. */
export function PausarDestino({ d }: { d: Pick<Destino, "id" | "ativo"> }) {
  const emViagem = emAndamento(useViagensDoDia())?.destinoId === d.id;
  if (!d.ativo) {
    return (
      <Button size="lg" variant="success" onClick={() => void fazer(() => pausarOuAtivarDestino(d.id))}>
        <Play className="!h-5 !w-5" /> Ativar
      </Button>
    );
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="lg" variant="outline">
          <Pause className="!h-5 !w-5" /> Pausar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Pausar este destino?</AlertDialogTitle>
          <AlertDialogDescription>
            {emViagem
              ? "A viagem de hoje deste destino está em andamento. Termine a viagem antes de pausar."
              : "Ele sai das viagens até você ativar de novo."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className={buttonVariants({ variant: "outline", size: "lg" })}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ size: "lg" })}
            disabled={emViagem}
            onClick={() => void fazer(() => pausarOuAtivarDestino(d.id))}
          >
            Pausar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
