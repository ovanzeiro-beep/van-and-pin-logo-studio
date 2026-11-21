import { deuCerto, naoDeu, SEM_RESPOSTA, type Resultado } from "@/lib/acoes";
import { dataDeHoje } from "@/lib/agora";
import { carregarAcertos, registrarAcerto } from "@/lib/acertos-store";
import { supabase, USA_BANCO } from "@/lib/supabase";

const usaBanco = () => USA_BANCO.destinos && supabase() !== null;

/** The settlements this account can see (the passenger's own). Before the Correção 5 is in the database, nothing. */
export async function carregarAcertosDoBanco(): Promise<void> {
  if (!usaBanco()) return;
  const { data, error } = await supabase()!.from("acertos_informados").select("cobranca_id, informado_em");
  if (error || !data) return;
  carregarAcertos(Object.fromEntries((data as { cobranca_id: string; informado_em: string }[]).map((l) => [l.cobranca_id, l.informado_em.slice(0, 10)])));
}

/** "Informar que acertei com o vanzeiro": the database checks it is the person's own open charge and the vanzeiro left. */
export async function informarAcertoNoBanco(cobrancaId: string): Promise<Resultado> {
  if (!usaBanco()) {
    registrarAcerto(cobrancaId, dataDeHoje());
    return deuCerto;
  }
  const { error } = await supabase()!.rpc("informar_acerto", { cobranca: cobrancaId });
  if (error) return naoDeu(error.code === "P0001" && error.message ? error.message : SEM_RESPOSTA);
  registrarAcerto(cobrancaId, dataDeHoje());
  return deuCerto;
}
