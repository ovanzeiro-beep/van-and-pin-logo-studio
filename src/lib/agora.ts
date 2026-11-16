
// The only place the app asks for the current date and time. Since V3 (16/11/2026) the app uses the real clock
// (Brasília); the automatic tests keep the fixed moment of the samples (Friday 13/11/2026, 05:10), so they always
// check the same sums. The samples move along with the real clock (see `diasParaOsExemplos`).
//
// The app ALWAYS counts days and hours in Brasília time, wherever the phone or the server is: after 21:00 the
// world clock (UTC) is already on the next day, which would break the "noite anterior, 20h" deadline, due dates
// and the trip of the day.

export const FUSO_DO_APP = "America/Sao_Paulo";

/** A moment in time as Brasília sees it: { data: "AAAA-MM-DD", hora: "HH:MM" }. */
export function emBrasilia(instante: Date): { data: string; hora: string } {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: FUSO_DO_APP,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(instante)
      .map((p) => [p.type, p.value]),
  );
  const p = (tipo: string) => partes[tipo] ?? "00";
  return { data: `${p("year")}-${p("month")}-${p("day")}`, hora: `${p("hour")}:${p("minute")}` };
}

/** The fixed moment of the samples: Friday 13/11/2026 at 05:10 (the 06:40 deadline is still open, the 06:00 one closed). */
export const MOMENTO_DOS_EXEMPLOS = { data: "2026-11-13", hora: "05:10" } as const;

/** The real clock in the app; the fixed moment in the automatic tests. */
const RELOGIO_DE_VERDADE = import.meta.env.MODE !== "test";

/** Where "now" comes from. */
const relogio = (): { data: string; hora: string } => (RELOGIO_DE_VERDADE ? emBrasilia(new Date()) : { ...MOMENTO_DOS_EXEMPLOS });

/**
 * How many days the sample data moves so it stays around today: whole weeks, up to the most recent Friday
 * (the samples' "today"), so every sample day keeps its weekday and the routes still run on it. 0 in the tests.
 */
export function diasParaOsExemplos(): number {
  if (!RELOGIO_DE_VERDADE) return 0;
  const dia = (iso: string) => {
    const [a = 0, m = 1, d = 1] = iso.split("-").map(Number);
    return Date.UTC(a, m - 1, d) / 86_400_000;
  };
  return Math.floor((dia(relogio().data) - dia(MOMENTO_DOS_EXEMPLOS.data)) / 7) * 7;
}

/** Today, as AAAA-MM-DD (Brasília). */
export function dataDeHoje(): string {
  return relogio().data;
}

/** Now, as HH:MM (Brasília). */
export function horaDeAgora(): string {
  return relogio().hora;
}

export function agora(): { data: string; hora: string } {
  return relogio();
}
