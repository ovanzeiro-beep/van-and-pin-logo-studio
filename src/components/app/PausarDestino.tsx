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
import { alternarAtivo } from "@/lib/destinos-store";

/** "Pausar" asks first (the destino leaves the trips); "Ativar" works right away. */
export function PausarDestino({ d }: { d: Pick<Destino, "id" | "ativo"> }) {
  if (!d.ativo) {
    return (
      <Button size="lg" variant="success" onClick={() => alternarAtivo(d.id)}>
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
            Ele sai das viagens até você ativar de novo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className={buttonVariants({ variant: "outline", size: "lg" })}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ size: "lg" })}
            onClick={() => alternarAtivo(d.id)}
          >
            Pausar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
