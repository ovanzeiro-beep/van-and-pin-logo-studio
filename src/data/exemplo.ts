// Dados de exemplo da etapa visual. Substituir por dados reais nas próximas etapas.

export const vanzeiroExemplo = {
  nome: "Carlos",
  viagemHoje: {
    rota: "Centro → Faculdade Unisul",
    saida: "06:40",
    chegadaPrevista: "07:25",
    van: "Sprinter · ABC-1D23",
  },
  passageiros: { confirmados: 12, total: 15, semResposta: 2, naoVao: 1 },
  financeiro: { aReceber: 1840, pagos: 9, pendentes: 4, atrasados: 2 },
};

export const passageiroExemplo = {
  nome: "Juliana",
  proximaViagem: {
    ehHoje: true,
    data: "Hoje, 13 de nov",
    rota: "Bairro Pedra Branca → Faculdade Unisul",
    embarque: "06:52",
    ponto: "Rua das Flores, 210",
    motorista: "Carlos",
  },
  // etapa: 0 = saiu da garagem, 1 = a caminho, 2 = no seu ponto
  van: { situacao: "A caminho", detalhe: "Chega no seu ponto em cerca de 8 min", etapa: 1, placa: "ABC-1D23" },
  emAberto: { valor: 280, vencimento: "20 de nov", referencia: "Mensalidade de novembro" },
};

export function formatarReais(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export type DiaSemana = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
export type TipoDestino = "fixa" | "avulsa";

export type Destino = {
  id: string;
  origem: string;
  destino: string;
  tipo: TipoDestino;
  /** Rota fixa: dias da semana em que a rota acontece. */
  dias: DiaSemana[];
  /** Viagem avulsa: data única (AAAA-MM-DD). */
  data: string | null;
  saida: string;
  /** Horário da volta, ou null quando não tem volta. */
  volta: string | null;
  /** Cidades ou paradas no caminho, em ordem (sem a origem e o destino). */
  paradas: string[];
  passageiros: number;
  ativo: boolean;
};

export const destinosExemplo: Destino[] = [
  {
    id: "jacarezinho-londrina",
    origem: "Jacarezinho",
    destino: "Londrina",
    tipo: "fixa",
    dias: ["sex", "sab", "dom"],
    data: null,
    saida: "06:00",
    volta: "18:30",
    paradas: ["Santo Antônio da Platina"],
    passageiros: 9,
    ativo: true,
  },
  {
    id: "centro-unisul",
    origem: "Centro",
    destino: "Faculdade Unisul",
    tipo: "fixa",
    dias: ["seg", "ter", "qua", "qui", "sex"],
    data: null,
    saida: "06:40",
    volta: "17:50",
    paradas: ["Bairro Pedra Branca"],
    passageiros: 15,
    ativo: true,
  },
  {
    id: "excursao-beto-carrero",
    origem: "Jacarezinho",
    destino: "Beto Carrero World",
    tipo: "avulsa",
    dias: [],
    data: "2026-11-28",
    saida: "04:30",
    volta: "19:00",
    paradas: ["Curitiba", "Joinville"],
    passageiros: 14,
    ativo: true,
  },
];
