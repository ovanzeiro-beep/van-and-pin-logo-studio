import { useEffect, useRef } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tocarAlerta } from "@/lib/alerta";
import { useAvisoDeChegada, useChegadaDisponivel } from "@/lib/banco/aviso-de-chegada";

export function AvisoDeChegadaPassageiro(props: { contaId: string }) {
  const disponivel = useChegadaDisponivel(props.contaId);
  return disponivel ? <ChegadaAtiva {...props} /> : null;
}

function ChegadaAtiva({ contaId }: { contaId: string }) {
  const { aviso, confirmar } = useAvisoDeChegada(contaId);

  const jaTocou = useRef<string | undefined>(undefined);
  const avisoId = aviso?.id;
  useEffect(() => {
    if (!avisoId) return;
    const alertar = () => {
      if (document.visibilityState !== "visible" || jaTocou.current === avisoId) return;
      jaTocou.current = avisoId;
      tocarAlerta();
    };
    alertar();
    document.addEventListener("visibilitychange", alertar);
    return () => document.removeEventListener("visibilitychange", alertar);
  }, [avisoId]);

  if (!aviso) return null;
  return (
    <section
      aria-label="Sua van chegou"
      className="mx-4 mt-3 grid shrink-0 gap-2 rounded-2xl bg-warning-soft p-3.5 text-foreground"
    >
      <div role="status">
        <h2 className="flex items-center gap-2 font-display text-base font-bold">
          <BellRing className="h-5 w-5" /> Sua van chegou
        </h2>
        <p className="mt-1 text-sm font-semibold">{aviso.trajeto}</p>
        <p className="mt-1 text-sm">O vanzeiro está aguardando no seu ponto de embarque.</p>
      </div>
      <Button
        variant="cta"
        className="w-full rounded-2xl"
        disabled={confirmar.isPending}
        onClick={() => confirmar.mutate(aviso.id)}
      >
        {confirmar.isPending ? "Confirmando…" : "Estou ciente"}
      </Button>
      {confirmar.error && confirmar.variables === aviso.id && (
        <p className="text-sm text-destructive" role="alert">
          {confirmar.error.message}
        </p>
      )}
    </section>
  );
}
