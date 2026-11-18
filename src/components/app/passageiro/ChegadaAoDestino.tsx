import { useEffect, useState } from "react";
import { CircleCheck, Clock } from "lucide-react";
import type { Destino } from "@/data/exemplo";
import { InfoCard } from "@/components/app/InfoCard";
import { agora } from "@/lib/agora";
import { nomeDestino } from "@/lib/destinos";
import { previsaoDaVolta } from "@/lib/volta-do-passageiro";

export function ChegadaAoDestino({ destino, dataIda }: { destino: Destino; dataIda: string }) {
  const [momento, setMomento] = useState(agora);

  useEffect(() => {
    if (!destino.volta) return;
    const atualizar = () => setMomento(agora());
    const timer = window.setInterval(atualizar, 15_000);
    document.addEventListener("visibilitychange", atualizar);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", atualizar);
    };
  }, [destino.volta]);

  const volta = previsaoDaVolta(destino, dataIda, momento);
  return (
    <InfoCard
      compacto
      icon={CircleCheck}
      tone="success"
      label="Viagem de ida"
      value="Chegamos ao destino"
      detail={nomeDestino(destino)}
    >
      {volta ? (
        <div className="flex items-start gap-2 rounded-2xl bg-primary-soft p-3 text-sm">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="font-bold text-primary">{volta.horario}</p>
            <p className="mt-0.5 text-foreground">{volta.situacao}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm font-semibold text-success">Ida concluída</p>
      )}
    </InfoCard>
  );
}
