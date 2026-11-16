import type { Aviso } from "@/data/exemplo";
import { carregarAvisosDoBanco, foiTrocado, obterAvisos, ouvirAvisos } from "@/lib/avisos-store";
import { obterSessao } from "@/lib/sessao";
import { supabase, USA_BANCO } from "@/lib/supabase";

// W8 (docs/banco-de-dados.md, section 8.3): the bell's notices in the database. The app keeps creating them from what
// happens (an answer, the van leaving, a deadline, a charge, a pedido accepted, a day cancelled); each one goes to the
// database a moment later (`salvar_aviso`: only someone of the destino, only for someone of the destino; the same chave
// never makes two). Each person reads only their own notices, on opening and every 30 s; opening the bell marks them read.

type LinhaAviso = {
  id: string;
  vanzeiro_id: string;
  para: string;
  tipo: string;
  texto: string;
  chave: string;
  destino_id: string | null;
  matricula_id: string | null;
  cobranca_id: string | null;
  criado_em: string;
  lido: boolean;
};

export const avisoDaLinha = (l: LinhaAviso): Aviso => ({
  id: l.id,
  vanzeiroId: l.vanzeiro_id,
  tipo: l.tipo as Aviso["tipo"],
  paraVanzeiroOuPassageiroId: l.para,
  dataCriacao: l.criado_em,
  lido: l.lido,
  ...(l.destino_id ? { destinoId: l.destino_id } : {}),
  ...(l.matricula_id ? { passageiroId: l.matricula_id } : {}),
  ...(l.cobranca_id ? { cobrancaId: l.cobranca_id } : {}),
  ...(l.chave !== l.id ? { chave: l.chave } : {}),
  textoResumido: l.texto,
});

export const linhaDoAviso = (a: Aviso) => ({
  id: a.id,
  para: a.paraVanzeiroOuPassageiroId,
  tipo: a.tipo,
  texto: a.textoResumido,
  chave: a.chave ?? a.id,
  destino_id: a.destinoId ?? null,
  matricula_id: a.passageiroId ?? null,
  cobranca_id: a.cobrancaId ?? null,
  criado_em: a.dataCriacao,
});

const usaBanco = () => USA_BANCO.destinos && supabase() !== null && obterSessao().conta !== null;

/** Notices already in the database (or refused by it: they are not sent again), and whether this person's are read. */
const salvos = new Set<string>();
let lidosNoBanco = true;
let fila: Promise<boolean> = Promise.resolve(true);

/** Saves the new notices and the "read". true when everything is saved. */
export function sincronizarAvisos(): Promise<boolean> {
  fila = fila.then(salvarMudancas, salvarMudancas);
  return fila;
}

async function salvarMudancas(): Promise<boolean> {
  const sb = supabase();
  const conta = obterSessao().conta;
  if (!usaBanco() || !sb || !conta) return true;
  let tudo = true;
  // Only notices about a destino can be saved (the others are of the sample data).
  for (const a of obterAvisos().filter((x) => !salvos.has(x.id) && x.destinoId)) {
    const { error } = await sb.rpc("salvar_aviso", {
      aviso: linhaDoAviso(a),
      trocar: foiTrocado(a.id),
    });
    if (error && /fetch|network/i.test(error.message ?? "")) tudo = false;
    else salvos.add(a.id);
  }
  const naoLidos = obterAvisos().some((a) => a.paraVanzeiroOuPassageiroId === conta.id && !a.lido);
  if (!naoLidos && !lidosNoBanco) {
    const { error } = await sb.rpc("marcar_avisos_lidos");
    if (error) tudo = false;
    else lidosNoBanco = true;
  }
  return tudo;
}

// A moment after any change in the notices, it goes to the database.
let espera: ReturnType<typeof setTimeout> | null = null;
if (typeof window !== "undefined") {
  ouvirAvisos(() => {
    if (!usaBanco()) return;
    if (espera) clearTimeout(espera);
    espera = setTimeout(() => {
      espera = null;
      void sincronizarAvisos();
    }, 400);
  });
}

/** This person's notices, as the database has them. */
export async function carregarAvisos(): Promise<void> {
  const sb = supabase();
  const conta = obterSessao().conta;
  if (!USA_BANCO.destinos || !sb || !conta) return;
  await sincronizarAvisos();
  const { data, error } = await sb
    .from("avisos")
    .select("*")
    .eq("para", conta.id)
    .order("criado_em")
    .limit(300);
  if (error) return;
  const lista = (data as LinhaAviso[]).map(avisoDaLinha);
  lista.forEach((a) => salvos.add(a.id));
  lidosNoBanco = lista.every((a) => a.lido);
  carregarAvisosDoBanco(lista, conta.id);
}
