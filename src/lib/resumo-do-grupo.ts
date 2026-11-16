import type { Destino, Passageiro } from "@/data/exemplo";
import { formatarData, primeiroNomeDe } from "@/lib/datas";
import { nomeDestino, textoDaVolta } from "@/lib/destinos";

// T4 (section 18 of docs/fonte-da-verdade.md): ready text for the van's WhatsApp group, sent by the vanzeiro.
// Decisions of the owner (16/11): only name and city (nobody in the group sees the others' addresses);
// who hasn't answered yet, with the deadline, while it is still open; button on the Viagem tab, before leaving.

/** First name; the full name when two people of the list share the first name. */
function nomesCurtos(pessoas: Pick<Passageiro, "id" | "nome">[]) {
  const primeiro = primeiroNomeDe;
  return (p: Pick<Passageiro, "nome">) => (pessoas.filter((x) => primeiro(x.nome) === primeiro(p.nome)).length > 1 ? p.nome : primeiro(p.nome));
}

export function resumoParaOGrupo(a: {
  destino: Destino;
  data: string;
  vao: Pick<Passageiro, "id" | "nome" | "cidade">[];
  /** Only while the deadline is open; empty after it. */
  semResposta: Pick<Passageiro, "id" | "nome">[];
  prazo: string;
  lugares: number | null;
}): string {
  const nome = nomesCurtos([...a.vao, ...a.semResposta]);
  const linhas = [
    `Viagem de hoje (${formatarData(a.data).toLowerCase()}): ${nomeDestino(a.destino)}`,
    `Saída ${a.destino.saida} · ${a.destino.volta ? `volta ${textoDaVolta(a.destino)}` : "sem volta"}`,
    `Vão: ${a.vao.length} ${a.vao.length === 1 ? "pessoa" : "pessoas"}${a.lugares !== null ? ` (a van tem ${a.lugares} lugares)` : ""}`,
  ];
  if (a.vao.length > 0) {
    linhas.push("", "Ordem da busca:", ...a.vao.map((p, i) => `${i + 1}. ${nome(p)} (${p.cidade})`));
  }
  if (a.semResposta.length > 0) {
    linhas.push("", `Ainda não responderam (até ${a.prazo}): ${a.semResposta.map(nome).join(", ")}.`, "Responda no app: Vou ou Não vou. Quem não confirmar até o prazo fica fora da busca.");
  }
  return linhas.join("\n");
}

/** WhatsApp without a number: the vanzeiro picks the group. */
export const linkParaOGrupo = (texto: string) => `https://wa.me/?text=${encodeURIComponent(texto)}`;
