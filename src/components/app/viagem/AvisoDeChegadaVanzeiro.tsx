import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAvisoDeChegada, useChegadaDisponivel } from "@/lib/banco/aviso-de-chegada";

export function AvisoDeChegadaVanzeiro(props: {
  contaId: string;
  viagemId: string;
  matriculaId: string;
}) {
  const disponivel = useChegadaDisponivel(props.contaId);
  return disponivel ? <ChegadaAtiva {...props} /> : null;
}

function ChegadaAtiva({
  contaId,
  viagemId,
  matriculaId,
}: {
  contaId: string;
  viagemId: string;
  matriculaId: string;
}) {
  const { aviso, expirou, indisponivel, carregando, enviar } = useAvisoDeChegada(contaId, {
    viagemId,
    matriculaId,
  });

  if (aviso) {
    const texto = aviso.confirmado_em
      ? "Passageiro confirmou que viu."
      : expirou
        ? "Prazo do aviso encerrado sem confirmação."
        : "Aguardando confirmação do passageiro.";
    return (
      <p className="mt-2.5 text-sm font-semibold" role="status">
        {texto}
      </p>
    );
  }

  return (
    <div className="mt-2.5 grid gap-2">
      <Button
        variant="outline"
        className="w-full rounded-2xl font-bold"
        disabled={carregando || enviar.isPending}
        onClick={() => enviar.mutate()}
      >
        <BellRing className="h-5 w-5" />
        {enviar.isPending ? "Enviando aviso…" : "Avisar que cheguei"}
      </Button>
      {(enviar.error || indisponivel) && (
        <p className="text-sm text-destructive" role="alert">
          {enviar.error?.message ?? "Não foi possível consultar o aviso. Confira a conexão."}
        </p>
      )}
    </div>
  );
}
