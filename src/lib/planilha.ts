// A real Excel file (.xlsx) built in the phone, with no library: one sheet, bold header, columns with width,
// dates as dates (dd/mm/aaaa) and money as money (R$). Opens in Excel, Google Sheets and LibreOffice.
// An .xlsx is a zip of a few XML files; the zip here only stores them (no compression), which every reader accepts.

export type TipoDeColuna = "texto" | "data" | "reais";
export type Coluna = { titulo: string; tipo: TipoDeColuna; largura: number };
/** Text, a date "AAAA-MM-DD", money in centavos, or empty. */
export type Celula = string | number | null;
export type Aba = { nome: string; colunas: Coluna[]; linhas: Celula[][] };

export const TIPO_XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const xml = (t: string) =>
  t
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** A, B, …, Z, AA… */
function letra(i: number): string {
  let s = "";
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26))
    s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

/** "2026-11-20" → the day number Excel uses (days since 30/12/1899). */
export function diaDoExcel(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return Math.round((Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!) - Date.UTC(1899, 11, 30)) / 86400000);
}

// Styles: 0 normal text · 1 header · 2 date · 3 money.
const ESTILO: Record<TipoDeColuna, number> = { texto: 0, data: 2, reais: 3 };

function celula(ref: string, valor: Celula, tipo: TipoDeColuna): string {
  if (valor === null || valor === "") return "";
  if (tipo === "data" && typeof valor === "string") {
    const dia = diaDoExcel(valor);
    if (dia !== null) return `<c r="${ref}" s="2"><v>${dia}</v></c>`;
  }
  if (tipo === "reais" && typeof valor === "number")
    return `<c r="${ref}" s="3"><v>${(valor / 100).toFixed(2)}</v></c>`;
  return `<c r="${ref}" s="${ESTILO.texto}" t="inlineStr"><is><t xml:space="preserve">${xml(String(valor))}</t></is></c>`;
}

function folha(aba: Aba): string {
  const ultima = letra(aba.colunas.length - 1);
  const fim = aba.linhas.length + 1;
  const cabecalho = aba.colunas
    .map(
      (c, i) =>
        `<c r="${letra(i)}1" s="1" t="inlineStr"><is><t xml:space="preserve">${xml(c.titulo)}</t></is></c>`,
    )
    .join("");
  const linhas = aba.linhas
    .map(
      (l, n) =>
        `<row r="${n + 2}">${aba.colunas.map((c, i) => celula(`${letra(i)}${n + 2}`, l[i] ?? null, c.tipo)).join("")}</row>`,
    )
    .join("");
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<dimension ref="A1:${ultima}${fim}"/>` +
    `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` +
    `<sheetFormatPr defaultRowHeight="18"/>` +
    `<cols>${aba.colunas.map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.largura}" customWidth="1"/>`).join("")}</cols>` +
    `<sheetData><row r="1" ht="22" customHeight="1">${cabecalho}</row>${linhas}</sheetData>` +
    `<autoFilter ref="A1:${ultima}${fim}"/>` +
    `</worksheet>`
  );
}

const ESTILOS =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
  `<numFmts count="2"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/><numFmt numFmtId="165" formatCode="[$R$-416]\\ #,##0.00"/></numFmts>` +
  `<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>` +
  `<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>` +
  `<fill><patternFill patternType="solid"><fgColor rgb="FF14295C"/><bgColor indexed="64"/></patternFill></fill></fills>` +
  `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
  `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
  `<cellXfs count="4">` +
  `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
  `<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>` +
  `<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` +
  `<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` +
  `</cellXfs>` +
  `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>` +
  `</styleSheet>`;

function arquivos(aba: Aba): [string, string][] {
  const nome = xml(aba.nome.slice(0, 31));
  const fim = `$${letra(aba.colunas.length - 1)}$${aba.linhas.length + 1}`;
  return [
    [
      "[Content_Types].xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
        `<Default Extension="xml" ContentType="application/xml"/>` +
        `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
        `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
        `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
        `</Types>`,
    ],
    [
      "_rels/.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
        `</Relationships>`,
    ],
    [
      "xl/workbook.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
        `<sheets><sheet name="${nome}" sheetId="1" r:id="rId1"/></sheets>` +
        `<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">'${nome.replace(/'/g, "''")}'!$A$1:${fim}</definedName></definedNames>` +
        `</workbook>`,
    ],
    [
      "xl/_rels/workbook.xml.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
        `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
        `</Relationships>`,
    ],
    ["xl/styles.xml", ESTILOS],
    ["xl/worksheets/sheet1.xml", folha(aba)],
  ];
}

// ---------- zip (stored, no compression) ----------

const TABELA_CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(dados: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of dados) c = TABELA_CRC[(c ^ b) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zip(entradas: [string, string][]): Uint8Array {
  const codificar = new TextEncoder();
  const partes: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let posicao = 0;
  for (const [nome, texto] of entradas) {
    const n = codificar.encode(nome);
    const d = codificar.encode(texto);
    const crc = crc32(d);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true); // names in UTF-8
    local.setUint16(8, 0, true); // stored
    local.setUint16(12, 0x21, true); // date 01/01/1980
    local.setUint32(14, crc, true);
    local.setUint32(18, d.length, true);
    local.setUint32(22, d.length, true);
    local.setUint16(26, n.length, true);
    const cab = new DataView(new ArrayBuffer(46));
    cab.setUint32(0, 0x02014b50, true);
    cab.setUint16(4, 20, true);
    cab.setUint16(6, 20, true);
    cab.setUint16(8, 0x0800, true);
    cab.setUint16(14, 0x21, true);
    cab.setUint32(16, crc, true);
    cab.setUint32(20, d.length, true);
    cab.setUint32(24, d.length, true);
    cab.setUint16(28, n.length, true);
    cab.setUint32(42, posicao, true);
    partes.push(new Uint8Array(local.buffer), n, d);
    central.push(new Uint8Array(cab.buffer), n);
    posicao += 30 + n.length + d.length;
  }
  const tamanhoCentral = central.reduce((s, p) => s + p.length, 0);
  const fim = new DataView(new ArrayBuffer(22));
  fim.setUint32(0, 0x06054b50, true);
  fim.setUint16(8, entradas.length, true);
  fim.setUint16(10, entradas.length, true);
  fim.setUint32(12, tamanhoCentral, true);
  fim.setUint32(16, posicao, true);
  const todas = [...partes, ...central, new Uint8Array(fim.buffer)];
  const saida = new Uint8Array(todas.reduce((s, p) => s + p.length, 0));
  let i = 0;
  for (const p of todas) {
    saida.set(p, i);
    i += p.length;
  }
  return saida;
}

/** The .xlsx file, ready to save. */
export function planilhaXlsx(aba: Aba): Uint8Array {
  return zip(arquivos(aba));
}
