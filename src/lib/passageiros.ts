import {
  type Destino,
  type Passageiro,
  type PedidoEntrada,
  type PlanoPagamento,
  type RespostaViagem,
} from "@/data/exemplo";
import { formatarReais } from "@/lib/dinheiro";
import { caminhoCompleto } from "@/lib/destinos";

export const PLANOS: { id: PlanoPagamento; rotulo: string; texto: string; rotuloValor: string }[] = [
  { id: "viagem", rotulo: "Por viagem", texto: "Ida + volta: 1 cobrança, mesmo noutro dia.", rotuloValor: "Valor por viagem" },
  { id: "diario", rotulo: "Diário", texto: "1 cobrança por dia que embarcou.", rotuloValor: "Valor por dia" },
  { id: "quinzenal", rotulo: "Quinzenal", texto: "A cada 15 dias", rotuloValor: "Valor da quinzena" },
  { id: "mensal", rotulo: "Mensal", texto: "Uma vez por mês", rotuloValor: "Valor do mês" },
];

export const PLANO_ROTULO: Record<PlanoPagamento, string> = {
  viagem: "Por viagem",
  diario: "Diário",
  quinzenal: "Quinzenal",
  mensal: "Mensal",
};

/** Only quinzenal and mensal plans have a due day. */
export function planoTemVencimento(plano: PlanoPagamento | null) {
  return plano === "quinzenal" || plano === "mensal";
}

/** "Mensal · R$ 280,00". */
export function descricaoPlano(p: Pick<Passageiro, "plano" | "valor">) {
  return `${PLANO_ROTULO[p.plano]} · ${formatarReais(p.valor)}`;
}

export function somenteDigitos(texto: string) {
  return texto.replace(/\D/g, "");
}

/** Formats as the person types: "(43) 99812-3456". */
export function formatarTelefone(texto: string) {
  const d = somenteDigitos(texto).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const resto = d.slice(2);
  if (resto.length <= 4) return `(${ddd}) ${resto}`;
  const corte = d.length === 11 ? 5 : 4;
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`;
}

/** Brazilian phone with DDD: 10 or 11 digits. */
export function telefoneValido(texto: string) {
  const n = somenteDigitos(texto).length;
  return n === 10 || n === 11;
}

export function linkWhatsApp(telefone: string, texto?: string) {
  const base = `https://wa.me/55${somenteDigitos(telefone)}`;
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}

/** Reads "280", "280,50" or "1.280,00" as a number; null when empty or invalid. */
export function lerValor(texto: string): number | null {
  const limpo = texto.trim().replace(/^R\$\s*/, "");
  if (!limpo) return null;
  const normal = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  const n = Number(normal);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}

export function lerVencimento(texto: string): number | null {
  const n = Number(texto);
  return Number.isInteger(n) && n >= 1 && n <= 31 ? n : null;
}

/** Cities and stops where a passenger can board, in path order. */
export function pontosDeEmbarque(d: Pick<Destino, "origem" | "destino" | "paradas">) {
  return [...new Set(caminhoCompleto(d))];
}

export function contarPassageiros(lista: Pick<Passageiro, "destinoId">[], destinoId: string) {
  return lista.filter((p) => p.destinoId === destinoId).length;
}

/** What the vanzeiro fills in while adding or editing a passenger. */
export type RascunhoPassageiro = {
  pessoaId?: string | undefined;
  nome: string;
  telefone: string;
  cidade: string;
  endereco: string;
  plano: PlanoPagamento | null;
  valor: string;
  vencimento: string;
  /** Mensal/quinzenal only. Starts as "Não". */
  descontaFaltas: boolean;
  valorFalta: string;
};

/** Empty form, or prefilled with the name and phone of an accepted pedido. */
export function rascunhoPassageiroVazio(pedido?: Pick<PedidoEntrada, "nome" | "telefone" | "pessoaId">): RascunhoPassageiro {
  return {
    pessoaId: pedido?.pessoaId,
    nome: pedido?.nome ?? "",
    telefone: pedido ? formatarTelefone(pedido.telefone) : "",
    cidade: "",
    endereco: "",
    plano: null,
    valor: "",
    vencimento: "",
    descontaFaltas: false,
    valorFalta: "",
  };
}

export function rascunhoDePassageiro(p: Passageiro): RascunhoPassageiro {
  return {
    pessoaId: p.pessoaId ?? p.id,
    nome: p.nome,
    telefone: formatarTelefone(p.telefone),
    cidade: p.cidade,
    endereco: p.endereco,
    plano: p.plano,
    valor: p.valor.toFixed(2).replace(".", ","),
    vencimento: p.vencimento ? String(p.vencimento) : "",
    descontaFaltas: p.descontaFaltas,
    valorFalta: p.valorFalta ? p.valorFalta.toFixed(2).replace(".", ",") : "",
  };
}

/** Whether the vanzeiro can leave this step (1, 2 or 3). */
export function passoPassageiroCompleto(passo: number, r: RascunhoPassageiro, pontos: string[]) {
  if (passo === 1) return r.nome.trim() !== "" && telefoneValido(r.telefone);
  if (passo === 2) return pontos.includes(r.cidade) && r.endereco.trim() !== "";
  if (passo === 3) {
    if (r.plano === null || lerValor(r.valor) === null) return false;
    if (!planoTemVencimento(r.plano)) return true;
    return lerVencimento(r.vencimento) !== null && (!r.descontaFaltas || lerValor(r.valorFalta) !== null);
  }
  return true;
}

export function passageiroDeRascunho(r: RascunhoPassageiro, destino: Pick<Destino, "id" | "vanzeiroId">, anterior?: Passageiro): Passageiro {
  const plano = r.plano ?? "mensal";
  return {
    id: anterior?.id ?? `passageiro-${Date.now()}`,
    vanzeiroId: destino.vanzeiroId,
    destinoId: destino.id,
    pessoaId: anterior?.pessoaId ?? anterior?.id ?? r.pessoaId,
    nome: r.nome.trim(),
    telefone: somenteDigitos(r.telefone),
    cidade: r.cidade,
    endereco: r.endereco.trim(),
    plano,
    valor: lerValor(r.valor) ?? 0,
    vencimento: planoTemVencimento(plano) ? lerVencimento(r.vencimento) : null,
    descontaFaltas: planoTemVencimento(plano) && r.descontaFaltas,
    valorFalta: planoTemVencimento(plano) && r.descontaFaltas ? lerValor(r.valorFalta) : null,
  };
}

/** Who goes, who did not answer and who does not go on a trip, counting only the destino's current passengers. */
export function presencaDaViagem(
  lista: Pick<Passageiro, "id" | "destinoId">[],
  destinoId: string,
  respostas: Record<string, RespostaViagem>,
) {
  const doDestino = lista.filter((p) => p.destinoId === destinoId);
  const vao = doDestino.filter((p) => respostas[p.id] === "vai").length;
  const naoVao = doDestino.filter((p) => respostas[p.id] === "nao-vai").length;
  return { total: doDestino.length, vao, naoVao, semResposta: doDestino.length - vao - naoVao };
}

export const identidadePassageiro = (p: Passageiro) => p.pessoaId ?? p.id;
export function matriculasDaPessoa(lista: Passageiro[], p: Passageiro) {
  return lista.filter((x) => identidadePassageiro(x) === identidadePassageiro(p));
}
export function pessoasParaDestino(lista: Passageiro[], destinoId: string) {
  const ja = new Set(lista.filter((p) => p.destinoId === destinoId).map(identidadePassageiro));
  return lista.filter((p, i) => !ja.has(identidadePassageiro(p)) && lista.findIndex((x) => identidadePassageiro(x) === identidadePassageiro(p)) === i);
}

/** What the passenger changes in "Editar" on their Perfil. Endereços are per membership (passenger id). */
export type MeusDados = { nome: string; telefone: string; enderecos: Record<string, string> };

/** Saving needs a name, a phone with DDD and every boarding address filled in. */
export function meusDadosValidos(d: MeusDados) {
  return d.nome.trim() !== "" && telefoneValido(d.telefone) && Object.values(d.enderecos).every((e) => e.trim() !== "");
}

/**
 * The passenger's own edit: name and phone change in every destino of this person, the address only
 * in its destino. City, plan and value stay with the vanzeiro. Other people are never touched.
 */
export function atualizarMeusDados(lista: Passageiro[], eu: Passageiro, d: MeusDados): Passageiro[] {
  const minhas = new Set(matriculasDaPessoa(lista, eu).map((p) => p.id));
  return lista.map((p) =>
    minhas.has(p.id)
      ? { ...p, nome: d.nome.trim(), telefone: somenteDigitos(d.telefone), endereco: d.enderecos[p.id]?.trim() || p.endereco }
      : p,
  );
}
