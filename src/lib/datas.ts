// Dates in one place (U1): days are "AAAA-MM-DD" and months "AAAA-MM", always counted in UTC so the
// time zone of the phone never moves a day. The current date and time come from src/lib/agora.ts.

export const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** "2026-11-13" + 3 → "2026-11-16" (crosses months and years). */
export function somarDias(iso: string, dias: number) {
  const [a = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

/** "2026-11-28" → "Sáb, 28 de nov". */
export function formatarData(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  if (!a || !m || !d) return "Sem data";
  const semana = SEMANA[new Date(Date.UTC(a, m - 1, d)).getUTCDay()] ?? "";
  return `${semana.charAt(0).toUpperCase()}${semana.slice(1)}, ${d} de ${MESES_CURTOS[m - 1] ?? ""}`;
}

/** "hoje", or "sáb, 28 de nov" (for notices). */
export const quando = (data: string, hoje: string) => (data === hoje ? "hoje" : formatarData(data).toLowerCase());

/** "2026-11-13" (or "2026-11") → "novembro". */
export const nomeDoMesDe = (iso: string) => MESES[Number(iso.slice(5, 7)) - 1] ?? "";

/** "2026-11" → "Novembro de 2026". */
export function nomeDoMes(mes: string) {
  const nome = nomeDoMesDe(mes);
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} de ${mes.slice(0, 4)}`;
}

/** "Mariana Souza" → "Mariana" (empty when there is no name). */
export const primeiroNomeDe = (nome: string) => nome.trim().split(/\s+/)[0] ?? "";
