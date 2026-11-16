// How what people type is saved (decision of the owner, 16/11/2026): names, cities, addresses and the van model as
// "Mariana Souza"; acronyms typed in capitals stay ("UENP"); e-mail in lower case; plate as "ABC-1D23"; reasons and
// descriptions with the first letter in capitals. Phones are saved as digits only (see `somenteDigitos`).
// Every save goes through here, so the database always gets the same format.

/** Words that stay in lower case in the middle of a name ("Santo Antônio da Platina", "Rua dos Pinheiros"). */
const MINUSCULAS = new Set(["da", "das", "de", "do", "dos", "e", "di", "du"]);

const limpar = (texto: string) => texto.trim().replace(/\s+/g, " ");

const capitalizar = (palavra: string) => (palavra ? palavra.charAt(0).toLocaleUpperCase("pt-BR") + palavra.slice(1).toLocaleLowerCase("pt-BR") : palavra);

/** Brazilian states (PR, SP…): in places they always stay in capitals. */
const ESTADOS = new Set(["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"]);

/** Longest acronym kept in places and van models ("UENP", "UTFPR", "PR", "VW"). */
const SIGLA_MAX = 5;

/**
 * "rua paraná, 455" → "Rua Paraná, 455"; "UENP jacarezinho" → "UENP Jacarezinho" (places, addresses, van model).
 * When everything was typed in capitals (or in lower case), every word is fixed; when the case is mixed, short words
 * fully in capitals are acronyms and stay.
 */
export function nomeProprio(texto: string, siglas = true): string {
  const t = limpar(texto);
  if (!t) return "";
  const tudoIgual = t === t.toLocaleUpperCase("pt-BR") || t === t.toLocaleLowerCase("pt-BR");
  return t
    .split(" ")
    .map((palavra, i) => {
      const letras = palavra.replace(/[^\p{L}]/gu, "");
      const sigla = siglas && !tudoIgual && letras.length >= 2 && letras.length <= SIGLA_MAX && palavra === palavra.toLocaleUpperCase("pt-BR");
      if (sigla) return palavra;
      // States always in capitals in places: "Jacarezinho PR", "Ourinhos - SP".
      if (siglas && i > 0 && ESTADOS.has(letras.toLocaleUpperCase("pt-BR")) && letras.length === palavra.replace(/[^\p{L}]/gu, "").length && letras.length === 2) {
        return palavra.toLocaleUpperCase("pt-BR");
      }
      const minuscula = palavra.toLocaleLowerCase("pt-BR");
      if (i > 0 && MINUSCULAS.has(minuscula)) return minuscula;
      // Hyphenated parts and parts after an apostrophe: "Ana-Clara", "D'Ávila".
      return minuscula.split("-").map((p) => p.split("'").map(capitalizar).join("'")).join("-");
    })
    .join(" ");
}

/** "  rosa@Email.COM " → "rosa@email.com". */
export const emailPadrao = (texto: string) => texto.trim().toLowerCase();

/** "abc1d23" / "abc-1234" → "ABC-1D23" / "ABC-1234"; anything else in capitals, without spaces. */
export function placaPadrao(texto: string): string {
  const t = texto.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(t) ? `${t.slice(0, 3)}-${t.slice(3)}` : t;
}

/** "feriado" → "Feriado" (only the first letter; the rest as typed, without extra spaces). */
export function frase(texto: string): string {
  const t = limpar(texto);
  return t ? t.charAt(0).toLocaleUpperCase("pt-BR") + t.slice(1) : "";
}

/** Pix key: an e-mail key in lower case; the others as typed, without extra spaces. */
export function chavePixPadrao(texto: string): string {
  const t = texto.trim();
  return t.includes("@") ? t.toLowerCase() : t;
}

/** People's names: always "Mariana Souza" ("mariana SOUZA" too), never acronyms. */
export const nomeDePessoa = (texto: string) => nomeProprio(texto, false);
