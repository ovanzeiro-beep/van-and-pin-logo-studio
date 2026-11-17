import { useEffect, useState } from "react";
import { contarVou } from "@/lib/lugares";
import { usePassageiros } from "@/lib/passageiros-store";
import { useRespostasDoDia } from "@/lib/respostas-store";
import { supabase, USA_BANCO } from "@/lib/supabase";
import { usePerfilDoVanzeiro } from "@/lib/vanzeiro-store";

// REV-08: seats of one trip as the passenger sees them. The passenger's phone does not have the other passengers'
// answers (privacy), so with the database the count comes from `lugares_da_viagem` (only numbers). It is read again
// whenever the answers change (real time already reloads them).

export type LugaresDaViagem = { lugares: number | null; vao: number; euVou: boolean };

export function useLugaresDaViagem(a: {
  matriculaId: string;
  destinoId: string;
  vanzeiroId: string;
  data: string;
}): LugaresDaViagem | null {
  const doDia = useRespostasDoDia(a.data);
  const passageiros = usePassageiros();
  const lugares = usePerfilDoVanzeiro(a.vanzeiroId).van.lugares;
  const local: LugaresDaViagem = {
    lugares,
    vao: contarVou(passageiros, a.destinoId, doDia),
    euVou: doDia[a.matriculaId] === "vai",
  };
  const [doBanco, setDoBanco] = useState<LugaresDaViagem | null>(null);
  useEffect(() => {
    const sb = supabase();
    if (!USA_BANCO.destinos || !sb) return;
    let vivo = true;
    void sb
      .rpc("lugares_da_viagem", { matricula: a.matriculaId, dia: a.data })
      .then(({ data, error }) => {
        const l = (data as { lugares: number | null; vao: number; eu_vou: boolean }[] | null)?.[0];
        if (vivo && !error && l) setDoBanco({ lugares: l.lugares, vao: l.vao, euVou: l.eu_vou });
      });
    return () => {
      vivo = false;
    };
  }, [a.matriculaId, a.data, doDia]);
  return USA_BANCO.destinos ? doBanco : local;
}
