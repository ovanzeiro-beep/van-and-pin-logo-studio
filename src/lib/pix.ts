import type { Centavos } from "@/lib/dinheiro";

// "Pix copia e cola" with the right value (section 18 of docs/fonte-da-verdade.md): the static BR Code of the
// Banco Central (EMV fields + CRC16), made on the phone itself, no server. The passenger pastes it in their bank
// app and the value comes along. When the key is ambiguous (11 digits can be a CPF or a cell phone), no code is
// made: a wrong code would fail at the bank, so only "copy the key" is offered, as before.

export type TipoDeChave = "email" | "telefone" | "cpf" | "cnpj" | "aleatoria";

/** The key in the format the BR Code needs, or null when the type can't be told for sure. */
export function chaveParaPix(chave: string): { tipo: TipoDeChave; valor: string } | null {
  const c = chave.trim();
  if (!c) return null;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) return { tipo: "email", valor: c.toLowerCase() };
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c))
    return { tipo: "aleatoria", valor: c.toLowerCase() };
  const digitos = c.replace(/\D/g, "");
  // Phone: written with +55 or with the DDD in parentheses, e.g. "(43) 99955-1234".
  if ((/^\+55/.test(c) || /\(\d{2}\)/.test(c)) && /^(55)?\d{10,11}$/.test(digitos)) {
    return { tipo: "telefone", valor: `+55${digitos.replace(/^55(?=\d{10,11}$)/, "")}` };
  }
  // CPF only when written with dots and dash (123.456.789-09); 11 loose digits could also be a phone.
  if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(c)) return { tipo: "cpf", valor: digitos };
  if (digitos.length === 14 && /^[\d./-]+$/.test(c)) return { tipo: "cnpj", valor: digitos };
  return null;
}

const campo = (id: string, valor: string) =>
  `${id}${String(valor.length).padStart(2, "0")}${valor}`;

/** Upper case without accents, only what the BR Code accepts, cut to `max` letters. */
function textoSimples(texto: string, max: number) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase()
    .slice(0, max);
}

/** CRC16-CCITT (0xFFFF, polynomial 0x1021), as the Banco Central asks, in 4 hex digits. */
export function crc16(texto: string) {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(texto)) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++)
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** The "copia e cola" code. Without a value (`centavos` null), the passenger types it in the bank app. */
export function pixCopiaECola(a: {
  chave: string;
  nome: string;
  cidade: string;
  centavos: Centavos | null;
}): string | null {
  const chave = chaveParaPix(a.chave);
  const nome = textoSimples(a.nome, 25);
  const cidade = textoSimples(a.cidade, 15) || "BRASIL";
  if (!chave || !nome) return null;
  const conta = campo("26", campo("00", "br.gov.bcb.pix") + campo("01", chave.valor));
  const valor =
    a.centavos !== null && a.centavos > 0 ? campo("54", (a.centavos / 100).toFixed(2)) : "";
  const semCrc =
    campo("00", "01") +
    conta +
    campo("52", "0000") +
    campo("53", "986") +
    valor +
    campo("58", "BR") +
    campo("59", nome) +
    campo("60", cidade) +
    campo("62", campo("05", "***")) +
    "6304";
  return semCrc + crc16(semCrc);
}
