import { DATA_DE_HOJE, HORA_DE_AGORA } from "@/data/exemplo";

// The only place the app asks for the current date and time. Fixed in the sample data for now;
// with the real clock, only these functions change.

/** Today, as AAAA-MM-DD. */
export function dataDeHoje(): string {
  return DATA_DE_HOJE;
}

/** Now, as HH:MM. */
export function horaDeAgora(): string {
  return HORA_DE_AGORA;
}

export function agora(): { data: string; hora: string } {
  return { data: dataDeHoje(), hora: horaDeAgora() };
}
