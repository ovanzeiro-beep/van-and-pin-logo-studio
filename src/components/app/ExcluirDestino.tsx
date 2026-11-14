import { useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
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
import { type Destino } from "@/data/exemplo";
import { dataDeHoje } from "@/lib/agora";
import { resumoDaSaida } from "@/lib/cobrancas";
import { useCobrancas } from "@/lib/cobrancas-store";
import { nomeDestino } from "@/lib/destinos";
import { excluirDestino } from "@/lib/exclusoes";
import { usePassageirosDoDestino, usePedidosDoDestino } from "@/lib/passageiros-store";
import { emAndamento, useViagensDoDia } from "@/lib/viagem-store";

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

/** "Excluir destino" with a confirmation that says what happens to passengers and charges (decision 6). */
export function ExcluirDestino({ d }: { d: Destino }) {
  const navigate = useNavigate();
  const passageiros = usePassageirosDoDestino(d.id);
  const pedidos = usePedidosDoDestino(d.id);
  const { pendentes, devendo } = resumoDaSaida(useCobrancas(), passageiros.map((p) => p.id), dataDeHoje());
  const emViagem = emAndamento(useViagensDoDia())?.destinoId === d.id;

  const excluir = async () => {
    await navigate({ to: "/vanzeiro/destinos" });
    excluirDestino(d.id);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="lg" variant="ghost" className="w-full text-destructive">
          <Trash2 className="!h-5 !w-5" /> Excluir destino
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir {nomeDestino(d)}?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            {emViagem ? (
              <p>A viagem de hoje deste destino está em andamento. Termine a viagem antes de excluir.</p>
            ) : (
              <ul className="space-y-1 text-left">
                <li>
                  {passageiros.length === 0
                    ? "Nenhum passageiro neste destino."
                    : `${plural(passageiros.length, "passageiro sai", "passageiros saem")} deste destino.`}
                  {pedidos.length > 0 && ` ${plural(pedidos.length, "pedido para entrar é recusado", "pedidos para entrar são recusados")}.`}
                </li>
                {pendentes > 0 && <li>{plural(pendentes, "cobrança pendente é cancelada", "cobranças pendentes são canceladas")}.</li>}
                {devendo > 0 && <li>{plural(devendo, "cobrança que está devendo continua", "cobranças que estão devendo continuam")} a receber.</li>}
                <li>As cobranças pagas ficam no histórico.</li>
                <li className="font-bold text-foreground">Não dá para desfazer.</li>
              </ul>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className={buttonVariants({ variant: "outline", size: "lg" })}>Cancelar</AlertDialogCancel>
          <AlertDialogAction className={buttonVariants({ variant: "destructive", size: "lg" })} disabled={emViagem} onClick={excluir}>
            Excluir destino
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
