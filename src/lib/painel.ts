import { createContext, useContext, useMemo } from "react";

// "Cada vanzeiro só vê o que é dele" (U3, section 19 of docs/fonte-da-verdade.md). The vanzeiro panel says who is
// looking (src/routes/vanzeiro.tsx); inside it, the reading functions of src/lib return only that vanzeiro's
// destinos, passengers, pedidos, address changes, charges and trips. The passenger panel has no owner here: its own
// functions already keep only the person's memberships. With the database, the database does this same filter.

/** The vanzeiro whose panel is open, or null outside the vanzeiro panel. */
export const PainelDoVanzeiro = createContext<string | null>(null);

/** Only what belongs to the vanzeiro whose panel is open (everything, outside it). */
export function useSoDoMeuPainel<T extends { vanzeiroId: string }>(lista: T[]): T[] {
  const dono = useContext(PainelDoVanzeiro);
  return useMemo(() => (dono === null ? lista : lista.filter((x) => x.vanzeiroId === dono)), [lista, dono]);
}

/** The vanzeiro whose panel is open, or null. */
export const useDonoDoPainel = () => useContext(PainelDoVanzeiro);
