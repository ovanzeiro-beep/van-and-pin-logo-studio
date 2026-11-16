// New identifiers in one place (U1). Each one is different, even when two things are made in the same instant.
// With the database, the database makes the identifiers and only this function changes.

let contador = 0;

/** "pedido-lq3x9k-7": the kind of data, then a part that never repeats. */
export function novoId(tipo: string) {
  contador += 1;
  return `${tipo}-${Date.now().toString(36)}-${contador}`;
}
