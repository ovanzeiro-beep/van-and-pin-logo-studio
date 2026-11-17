// REV-09 (owner, 17/11/2026): during the pickup, the passenger follows the boarding: how many already boarded
// (only initials, never full names), their place in the order and how many are still before them.
// The database gives the same with `embarque_da_viagem` (supabase/migrations/20261117050000_*).

export type EmbarqueDaViagem = {
  total: number;
  embarcaram: number;
  iniciais: string[];
  /** 1-based place in the pickup order; null when the person is not in it. */
  posicao: number | null;
  faltamAntes: number | null;
  euEmbarquei: boolean;
};

/** "Monica Hazama" → "M. H."; "Bruno" → "B.". */
export function iniciaisDoNome(nome: string) {
  const p = nome.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "";
  const primeira = (s: string) => s.charAt(0).toUpperCase();
  return p.length === 1
    ? `${primeira(p[0]!)}.`
    : `${primeira(p[0]!)}. ${primeira(p[p.length - 1]!)}.`;
}

export function embarqueDaViagem(
  v: { ordem: string[]; embarcaram: string[]; naoEstavam: string[] },
  eu: string,
  nomeDe: (id: string) => string,
): EmbarqueDaViagem {
  const i = v.ordem.indexOf(eu);
  const feitos = new Set([...v.embarcaram, ...v.naoEstavam]);
  return {
    total: v.ordem.length,
    embarcaram: v.embarcaram.length,
    iniciais: v.embarcaram.map((id) => iniciaisDoNome(nomeDe(id))),
    posicao: i < 0 ? null : i + 1,
    faltamAntes: i < 0 ? null : v.ordem.slice(0, i).filter((id) => !feitos.has(id)).length,
    euEmbarquei: v.embarcaram.includes(eu),
  };
}

/** "3 de 8 já embarcaram" and the person's own line. */
export function textoDoEmbarque(e: EmbarqueDaViagem) {
  const titulo = `${e.embarcaram} de ${e.total} já ${e.embarcaram === 1 ? "embarcou" : "embarcaram"}`;
  const minha = e.euEmbarquei
    ? "Você embarcou"
    : e.faltamAntes === null
      ? null
      : e.faltamAntes === 0
        ? "Você é o próximo — aguarde no ponto"
        : e.faltamAntes === 1
          ? "Falta 1 antes de você"
          : `Faltam ${e.faltamAntes} antes de você`;
  return { titulo, minha };
}

/**
 * Owner (17/11/2026): the 3 steps of "Situação da van" follow the pickup. "Saiu da garagem" turns green when the trip
 * starts; "A caminho" only when it is the person's turn; "Na van" when the vanzeiro marks "Embarcou". With the
 * database the passenger's phone only has its own place in the trip, so the turn comes from `embarque_da_viagem`.
 */
export function situacaoComEmbarque<
  T extends { situacao: string; detalhe: string; etapa: number; alerta: boolean },
>(van: T, e: EmbarqueDaViagem | null): T {
  if (!e || e.posicao === null || e.euEmbarquei || van.alerta || van.etapa === 2) return van;
  if (e.faltamAntes === 0)
    return {
      ...van,
      situacao: "Você é o próximo",
      detalhe: "Aguarde no ponto: a van está chegando",
      etapa: 1,
    };
  const n = e.faltamAntes ?? 0;
  return {
    ...van,
    situacao: "Viagem começou",
    detalhe: n === 1 ? "Falta 1 pessoa antes de você" : `Faltam ${n} pessoas antes de você`,
    etapa: 0,
  };
}
