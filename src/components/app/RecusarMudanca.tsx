import { X } from "lucide-react";
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
import { type MudancaDeEndereco } from "@/lib/passageiros-store";
import { fazer } from "@/lib/acoes";
import { responderMudancaNoBanco } from "@/lib/banco/passageiros";

/** "Recusar" an address change, with a confirmation (same as "Recusar pedido"). */
export function RecusarMudanca({ m }: { m: MudancaDeEndereco }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="lg" variant="outline">
          <X className="!h-5 !w-5" /> Recusar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Recusar a mudança de {m.nome}?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <p>
                Continua valendo: {m.de.cidade} · {m.de.endereco}.
              </p>
              <p className="mt-2 font-bold text-foreground">Não dá para desfazer.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className={buttonVariants({ variant: "outline", size: "lg" })}>Cancelar</AlertDialogCancel>
          <AlertDialogAction className={buttonVariants({ variant: "destructive", size: "lg" })} onClick={() => void fazer(() => responderMudancaNoBanco(m.id, false))}>
            Recusar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
