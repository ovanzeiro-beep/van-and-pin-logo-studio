// Dados de exemplo da etapa visual. Substituir por dados reais nas próximas etapas.

export const vanzeiroExemplo = {
  nome: "Carlos",
  viagemHoje: {
    /** Destino da viagem de hoje: nome e horários vêm do cadastro dele. */
    destinoId: "centro-unisul",
    van: "Sprinter · ABC-1D23",
  },
  /** Resposta de cada passageiro para a viagem de hoje. Quem não está aqui ainda não respondeu. */
  respostasHoje: {
    "p-juliana": "vai",
    "p-gabriel": "vai",
    "p-fernanda": "vai",
    "p-thiago": "vai",
    "p-camila": "nao-vai",
  } as Record<string, RespostaViagem>,
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
  /** Código curto que o vanzeiro envia para quem quer entrar (ex.: VAN-4821). */
  convite: string;
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
    convite: "VAN-4821",
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
    convite: "VAN-3175",
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
    convite: "VAN-9064",
    ativo: true,
  },
];

export type RespostaViagem = "vai" | "nao-vai";

export type PlanoPagamento = "viagem" | "diario" | "quinzenal" | "mensal";

export type Passageiro = {
  id: string;
  destinoId: string;
  nome: string;
  /** Só números, com DDD (ex.: 43998123456). */
  telefone: string;
  /** Cidade ou parada do caminho onde a pessoa embarca. */
  cidade: string;
  /** Endereço ou ponto de embarque. */
  endereco: string;
  plano: PlanoPagamento;
  valor: number;
  /** Dia do mês do vencimento (só quinzenal e mensal). */
  vencimento: number | null;
};

/** Pessoa que usou o código de convite e espera o vanzeiro aceitar. */
export type PedidoEntrada = {
  id: string;
  destinoId: string;
  nome: string;
  telefone: string;
};

export const passageirosExemplo: Passageiro[] = [
  // Jacarezinho → Londrina
  { id: "p-mariana", destinoId: "jacarezinho-londrina", nome: "Mariana Souza", telefone: "43998123456", cidade: "Jacarezinho", endereco: "Praça Rui Barbosa, em frente à igreja", plano: "mensal", valor: 280, vencimento: 10 },
  { id: "p-pedro", destinoId: "jacarezinho-londrina", nome: "Pedro Henrique Lima", telefone: "43999874512", cidade: "Jacarezinho", endereco: "Rua Paraná, 455", plano: "quinzenal", valor: 150, vencimento: 15 },
  { id: "p-ana", destinoId: "jacarezinho-londrina", nome: "Ana Clara Ribeiro", telefone: "43996541230", cidade: "Santo Antônio da Platina", endereco: "Rodoviária", plano: "viagem", valor: 45, vencimento: null },
  { id: "p-lucas", destinoId: "jacarezinho-londrina", nome: "Lucas Ferreira", telefone: "43991237788", cidade: "Santo Antônio da Platina", endereco: "Posto na entrada da cidade", plano: "diario", valor: 80, vencimento: null },
  { id: "p-beatriz", destinoId: "jacarezinho-londrina", nome: "Beatriz Martins", telefone: "43988452301", cidade: "Jacarezinho", endereco: "Av. Getúlio Vargas, 1020", plano: "mensal", valor: 280, vencimento: 5 },
  // Centro → Faculdade Unisul
  { id: "p-juliana", destinoId: "centro-unisul", nome: "Juliana Alves", telefone: "48998771234", cidade: "Bairro Pedra Branca", endereco: "Rua das Flores, 210", plano: "mensal", valor: 280, vencimento: 20 },
  { id: "p-gabriel", destinoId: "centro-unisul", nome: "Gabriel Rocha", telefone: "48999125566", cidade: "Centro", endereco: "Praça XV, ponto de ônibus", plano: "mensal", valor: 260, vencimento: 10 },
  { id: "p-fernanda", destinoId: "centro-unisul", nome: "Fernanda Costa", telefone: "48996654321", cidade: "Centro", endereco: "Rua Felipe Schmidt, 88", plano: "quinzenal", valor: 140, vencimento: 5 },
  { id: "p-rafael", destinoId: "centro-unisul", nome: "Rafael Mendes", telefone: "48991478523", cidade: "Bairro Pedra Branca", endereco: "Av. Pedra Branca, 1500", plano: "diario", valor: 22, vencimento: null },
  { id: "p-camila", destinoId: "centro-unisul", nome: "Camila Duarte", telefone: "48988236547", cidade: "Centro", endereco: "Terminal Central", plano: "viagem", valor: 12, vencimento: null },
  { id: "p-thiago", destinoId: "centro-unisul", nome: "Thiago Nunes", telefone: "48997563214", cidade: "Bairro Pedra Branca", endereco: "Rua dos Ipês, 37", plano: "mensal", valor: 280, vencimento: 20 },
  // Excursão Beto Carrero
  { id: "p-rosana", destinoId: "excursao-beto-carrero", nome: "Rosana Pereira", telefone: "43998012233", cidade: "Jacarezinho", endereco: "Praça Rui Barbosa", plano: "viagem", valor: 320, vencimento: null },
  { id: "p-jose", destinoId: "excursao-beto-carrero", nome: "José Carlos Silva", telefone: "43999347788", cidade: "Jacarezinho", endereco: "Rodoviária", plano: "viagem", valor: 320, vencimento: null },
  { id: "p-patricia", destinoId: "excursao-beto-carrero", nome: "Patrícia Gomes", telefone: "41998456123", cidade: "Curitiba", endereco: "Rodoferroviária", plano: "viagem", valor: 280, vencimento: null },
  { id: "p-marcos", destinoId: "excursao-beto-carrero", nome: "Marcos Antunes", telefone: "43991113344", cidade: "Jacarezinho", endereco: "Rua Paraná, 120", plano: "viagem", valor: 320, vencimento: null },
];

export const pedidosExemplo: PedidoEntrada[] = [
  { id: "pedido-larissa", destinoId: "jacarezinho-londrina", nome: "Larissa Moreira", telefone: "43997012345" },
  { id: "pedido-joao", destinoId: "jacarezinho-londrina", nome: "João Vitor Santos", telefone: "43998456721" },
];
