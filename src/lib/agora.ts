import { DATA_DE_HOJE, HORA_DE_AGORA } from "@/data/exemplo";

// The only place the app asks for the current date and time. Fixed in the sample data for now (13/11, 05:10);
// with the real clock (together with the database), only `relogio` changes: `() => emBrasilia(new Date())`.
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

/** Where "now" comes from. Today: the fixed sample moment. With the real clock: `() => emBrasilia(new Date())`. */
const relogio = (): { data: string; hora: string } => ({ data: DATA_DE_HOJE, hora: HORA_DE_AGORA });

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
