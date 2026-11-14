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
import { type PedidoEntrada } from "@/data/exemplo";
import { recusarPedido } from "@/lib/passageiros-store";

/** "Recusar pedido" with a confirmation dialog. */
export function RecusarPedido({ pedido }: { pedido: PedidoEntrada }) {
  const recusar = () => {
    recusarPedido(pedido.id);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="lg" variant="outline">
          <X className="!h-5 !w-5" /> Recusar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Recusar {pedido.nome}?</AlertDialogTitle>
          <AlertDialogDescription>
            <p>Você recusará o pedido de {pedido.nome} para entrar neste destino.</p>
            <p className="mt-2 font-bold text-foreground">Não dá para desfazer.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className={buttonVariants({ variant: "outline", size: "lg" })}>Cancelar</AlertDialogCancel>
          <AlertDialogAction className={buttonVariants({ variant: "destructive", size: "lg" })} onClick={recusar}>
            Recusar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
