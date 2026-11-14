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
import { sair } from "@/lib/acesso";
import { contaComViagemEmAndamento, excluirMinhaConta } from "@/lib/exclusoes";
import { useViagensDoDia } from "@/lib/viagem-store";

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

/** "Excluir minha conta" with a confirmation that explains what happens (LGPD requirement). */
export function ExcluirMinhaConta({ papel, numDestinos }: { papel: "vanzeiro" | "passageiro"; numDestinos: number }) {
  const navigate = useNavigate();
  useViagensDoDia();
  const emViagem = contaComViagemEmAndamento(papel);

  const excluir = async () => {
    if (!excluirMinhaConta(papel)) return;
    sair();
    await navigate({ to: "/entrar" });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="lg" variant="ghost" className="w-full text-destructive">
          <Trash2 className="!h-5 !w-5" /> Excluir minha conta
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir minha conta?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            {emViagem ? (
              <p>A viagem de hoje está em andamento. Termine a viagem antes de excluir a conta.</p>
            ) : (
              <ul className="space-y-1 text-left">
                {papel === "vanzeiro" ? (
                  <>
                    <li>
                      {numDestinos === 0
                        ? "Você não tem destinos."
                        : `${plural(numDestinos, "destino é excluído", "destinos são excluídos")} como se você tivesse excluído cada um.`}
                    </li>
                    <li>Cobranças pendentes são canceladas.</li>
                    <li>Cobranças que estão devendo continuam a receber.</li>
                    <li>Seus dados pessoais são apagados.</li>
                    <li>O app volta para a tela Entrar.</li>
                  </>
                ) : (
                  <>
                    <li>
                      {numDestinos === 0
                        ? "Você não está em nenhum destino."
                        : `Você sai de ${plural(numDestinos, "destino", "destinos")} como se tivesse saído de cada um.`}
                    </li>
                    <li>Cobranças pendentes são canceladas.</li>
                    <li>Cobranças que estão devendo continuam a receber.</li>
                    <li>Seus dados pessoais são apagados.</li>
                    <li>O app volta para a tela Entrar.</li>
                  </>
              )}
              <li className="font-bold text-foreground">Não dá para desfazer.</li>
            </ul>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className={buttonVariants({ variant: "outline", size: "lg" })}>Cancelar</AlertDialogCancel>
          <AlertDialogAction className={buttonVariants({ variant: "destructive", size: "lg" })} disabled={emViagem} onClick={excluir}>
            Excluir minha conta
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
