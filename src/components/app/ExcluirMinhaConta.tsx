import { useNavigate } from "@tanstack/react-router";
import { Download, Trash2 } from "lucide-react";
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
import { excluirContaDoBanco, sairDaConta } from "@/lib/conta";
import { aReceberAntesDeExcluir, contaComViagemEmAndamento, excluirMinhaConta } from "@/lib/exclusoes";
import { obterCobrancas, useCobrancas } from "@/lib/cobrancas-store";
import { obterGastos } from "@/lib/gastos-store";
import { formatarReais } from "@/lib/dinheiro";
import { baixarArquivo, relatorioDoVanzeiro } from "@/lib/relatorio";
import { idDoVanzeiro } from "@/lib/sessao";
import { dataDeHoje } from "@/lib/agora";
import { useViagensDoDia } from "@/lib/viagem-store";
import { fazer } from "@/lib/acoes";

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

/** "Excluir minha conta" with a confirmation that explains what happens (LGPD requirement). */
export function ExcluirMinhaConta({ papel, numDestinos }: { papel: "vanzeiro" | "passageiro"; numDestinos: number }) {
  const navigate = useNavigate();
  useViagensDoDia();
  const emViagem = contaComViagemEmAndamento(papel);
  useCobrancas();
  // Correção 5: before deleting, the vanzeiro sees what is still open and can download the report.
  const aReceber = papel === "vanzeiro" ? aReceberAntesDeExcluir() : { quantos: 0, valor: 0 };
  const baixar = () =>
    baixarArquivo(
      `o-vanzeiro-relatorio-${dataDeHoje()}.xlsx`,
      relatorioDoVanzeiro(obterCobrancas(), obterGastos(), idDoVanzeiro(), dataDeHoje()),
    );

  const excluir = async () => {
    const r = await fazer(() => excluirMinhaConta(papel));
    if (!r.ok) return;
    // W1: the login and the account in the database go too.
    const banco = await fazer(excluirContaDoBanco);
    if (!banco.ok) return;
    await sairDaConta();
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
                    {aReceber.valor > 0 && (
                      <li className="rounded-2xl bg-warning-soft px-3 py-2 font-semibold text-warning">
                        Você tem {formatarReais(aReceber.valor)} a receber de {aReceber.quantos === 1 ? "1 passageiro" : `${aReceber.quantos} passageiros`}.
                        Antes, marque o que já recebeu. O resto continua em aberto: o passageiro vê que você saiu do app e combina o
                        acerto direto com você.
                      </li>
                    )}
                    <li>
                      {numDestinos === 0
                        ? "Você não tem destinos."
                        : `${plural(numDestinos, "destino é excluído", "destinos são excluídos")} como se você tivesse excluído cada um.`}
                    </li>
                    <li>Os passageiros são avisados e saem dos destinos. Só as cobranças de períodos futuros são canceladas.</li>
                    <li>O histórico de viagens e pagamentos fica para os passageiros.</li>
                    <li>Seu nome, a van e os gastos são apagados. Telefone e Pix ficam só para quem ainda tem valor em aberto com você, até o acerto.</li>
                    <li>
                      <button type="button" onClick={baixar} className="inline-flex items-center gap-1.5 font-bold text-primary underline underline-offset-2">
                        <Download className="h-4 w-4" /> Baixar meu relatório (planilha)
                      </button>{" "}
                      com gastos e recebimentos, antes de excluir.
                    </li>
                    <li>O app volta para a tela Entrar.</li>
                  </>
                ) : (
                  <>
                    <li>
                      {numDestinos === 0
                        ? "Você não está em nenhum destino."
                        : `Você sai de ${plural(numDestinos, "destino", "destinos")} como se tivesse saído de cada um.`}
                    </li>
                    <li>Viagens feitas e mensalidades já começadas continuam a receber. As de períodos futuros são canceladas.</li>
                    <li>Seu nome e endereço são apagados. O vanzeiro continua com o histórico e o telefone.</li>
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
