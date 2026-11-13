import { formatarReais, type Destino, type Passageiro, type PedidoEntrada, type PlanoPagamento } from "@/data/exemplo";
import { caminhoCompleto } from "@/lib/destinos";

export const PLANOS: { id: PlanoPagamento; rotulo: string; texto: string; rotuloValor: string }[] = [
  { id: "viagem", rotulo: "Por viagem", texto: "Paga cada viagem", rotuloValor: "Valor por viagem" },
  { id: "diario", rotulo: "Diário", texto: "Paga por dia", rotuloValor: "Valor por dia" },
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
  nome: string;
  telefone: string;
  cidade: string;
  endereco: string;
  plano: PlanoPagamento | null;
  valor: string;
  vencimento: string;
};

/** Empty form, or prefilled with the name and phone of an accepted pedido. */
export function rascunhoPassageiroVazio(pedido?: Pick<PedidoEntrada, "nome" | "telefone">): RascunhoPassageiro {
  return {
    nome: pedido?.nome ?? "",
    telefone: pedido ? formatarTelefone(pedido.telefone) : "",
    cidade: "",
    endereco: "",
    plano: null,
    valor: "",
    vencimento: "",
  };
}

export function rascunhoDePassageiro(p: Passageiro): RascunhoPassageiro {
  return {
    nome: p.nome,
    telefone: formatarTelefone(p.telefone),
    cidade: p.cidade,
    endereco: p.endereco,
    plano: p.plano,
    valor: p.valor.toFixed(2).replace(".", ","),
    vencimento: p.vencimento ? String(p.vencimento) : "",
  };
}

/** Whether the vanzeiro can leave this step (1, 2 or 3). */
export function passoPassageiroCompleto(passo: number, r: RascunhoPassageiro, pontos: string[]) {
  if (passo === 1) return r.nome.trim() !== "" && telefoneValido(r.telefone);
  if (passo === 2) return pontos.includes(r.cidade) && r.endereco.trim() !== "";
  if (passo === 3) {
    if (r.plano === null || lerValor(r.valor) === null) return false;
    return !planoTemVencimento(r.plano) || lerVencimento(r.vencimento) !== null;
  }
  return true;
}

export function passageiroDeRascunho(r: RascunhoPassageiro, destinoId: string, anterior?: Passageiro): Passageiro {
  const plano = r.plano ?? "mensal";
  return {
    id: anterior?.id ?? `passageiro-${Date.now()}`,
    destinoId,
    nome: r.nome.trim(),
    telefone: somenteDigitos(r.telefone),
    cidade: r.cidade,
    endereco: r.endereco.trim(),
    plano,
    valor: lerValor(r.valor) ?? 0,
    vencimento: planoTemVencimento(plano) ? lerVencimento(r.vencimento) : null,
  };
}
