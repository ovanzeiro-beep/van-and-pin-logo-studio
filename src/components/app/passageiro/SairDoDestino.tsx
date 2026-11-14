import { UserMinus } from "lucide-react";
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
import { type Destino, type Passageiro } from "@/data/exemplo";
import { dataDeHoje } from "@/lib/agora";
import { resumoDaSaida } from "@/lib/cobrancas";
import { useCobrancas } from "@/lib/cobrancas-store";
import { nomeDestino } from "@/lib/destinos";
import { sairDoDestino } from "@/lib/exclusoes";
import { emAndamento, useViagensDoDia } from "@/lib/viagem-store";

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

/** "Sair deste destino" on the passenger's Perfil, with what happens to their charges (decision 6). */
export function SairDoDestino({ p, d }: { p: Passageiro; d: Destino }) {
  const { pendentes, devendo } = resumoDaSaida(useCobrancas(), [p.id], dataDeHoje());
  const emViagem = emAndamento(useViagensDoDia())?.destinoId === d.id;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="h-10 w-full text-destructive">
          <UserMinus className="!h-5 !w-5" /> Sair deste destino
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Sair de {nomeDestino(d)}?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            {emViagem ? (
              <p>A viagem de hoje deste destino já começou. Você pode sair depois que ela terminar.</p>
            ) : (
              <ul className="space-y-1 text-left">
                <li>Você deixa de ver as viagens deste destino.</li>
                {pendentes > 0 && <li>{plural(pendentes, "cobrança pendente é cancelada", "cobranças pendentes são canceladas")}.</li>}
                {devendo > 0 && (
                  <li>
                    {plural(devendo, "cobrança que está devendo continua", "cobranças que estão devendo continuam")} nos seus Pagamentos, para pagar ao vanzeiro.
                  </li>
                )}
                <li>Para voltar, peça um código novo ao vanzeiro.</li>
                <li className="font-bold text-foreground">Não dá para desfazer.</li>
              </ul>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className={buttonVariants({ variant: "outline", size: "lg" })}>Cancelar</AlertDialogCancel>
          <AlertDialogAction className={buttonVariants({ variant: "destructive", size: "lg" })} disabled={emViagem} onClick={() => sairDoDestino(p.id)}>
            Sair deste destino
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
