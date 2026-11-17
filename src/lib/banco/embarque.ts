import { useEffect, useState } from "react";
import { embarqueDaViagem, type EmbarqueDaViagem } from "@/lib/embarque";
import { usePassageiros } from "@/lib/passageiros-store";
import { supabase, USA_BANCO } from "@/lib/supabase";
import { useViagensDoDia } from "@/lib/viagem-store";

// REV-09: with the database the passenger's phone does not have the whole trip (privacy); `embarque_da_viagem` gives
// only numbers and initials. It is read again every time the trip changes (the real-time signal reloads it).

export function useEmbarqueDaViagem(
  matriculaId: string,
  destinoId: string,
): EmbarqueDaViagem | null {
  const viagem = useViagensDoDia().viagens[destinoId];
  const passageiros = usePassageiros();
  const [doBanco, setDoBanco] = useState<EmbarqueDaViagem | null>(null);
  const emBusca = viagem?.fase === "busca";
  useEffect(() => {
    const sb = supabase();
    if (!USA_BANCO.destinos || !sb || !emBusca) return;
    let vivo = true;
    void sb.rpc("embarque_da_viagem", { matricula: matriculaId }).then(({ data, error }) => {
      const l = (
        data as
          | {
              total: number;
              embarcaram: number;
              iniciais: string[];
              posicao: number | null;
              faltam_antes: number | null;
              eu_embarquei: boolean;
            }[]
          | null
      )?.[0];
      if (vivo && !error && l)
        setDoBanco({
          total: l.total,
          embarcaram: l.embarcaram,
          iniciais: l.iniciais,
          posicao: l.posicao,
          faltamAntes: l.faltam_antes,
          euEmbarquei: l.eu_embarquei,
        });
    });
    return () => {
      vivo = false;
    };
  }, [matriculaId, emBusca, viagem]);
  if (!viagem || !emBusca) return null;
  if (USA_BANCO.destinos) return doBanco;
  return embarqueDaViagem(
    viagem,
    matriculaId,
    (id) => passageiros.find((p) => p.id === id)?.nome ?? "",
  );
}
