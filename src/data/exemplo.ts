import type { Gasto } from "@/lib/gastos";

// Dados de exemplo da etapa visual. Substituir por dados reais nas próximas etapas.

export const vanzeiroExemplo = {
  id: "vanzeiro-carlos",
  nome: "Carlos",
  nomeCompleto: "Carlos Pereira",
  telefone: "43999551234",
  /** Chave Pix que aparece para os passageiros. */
  pix: "carlos.vanzeiro@email.com",
  van: { modelo: "Sprinter", placa: "ABC-1D23", lugares: 15 as number | null },
  /** Resposta de cada passageiro para a viagem de hoje. Quem não está aqui ainda não respondeu. */
  respostasHoje: {
    "p-gabriel": "vai",
    "p-fernanda": "vai",
    "p-thiago": "vai",
    "p-camila": "nao-vai",
    "p-mariana": "vai",
    "p-pedro": "vai",
    "p-ana": "vai",
    "p-lucas": "vai",
  } as Record<string, RespostaViagem>,
};

/** A passageira de exemplo é a Juliana, cadastrada em Cambará → UENP Jacarezinho e Jacarezinho → Londrina. */
export const passageiroExemplo = { passageiroId: "p-juliana" };

export type DiaSemana = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
export type TipoDestino = "fixa" | "avulsa";
/** Até quando o passageiro confirma "Vou": tempo antes da saída, ou a noite anterior às 20h. */
export type PrazoConfirmacao = "30min" | "1h" | "2h" | "noite-anterior";

export type Destino = {
  id: string;
  vanzeiroId: string;
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
  /** Viagem avulsa: data da volta quando ela é em outro dia (null = no mesmo dia). */
  voltaData: string | null;
  /** Cidades ou paradas no caminho, em ordem (sem a origem e o destino). */
  paradas: string[];
  /** Código curto que o vanzeiro envia para quem quer entrar (ex.: VAN-4821). */
  convite: string;
  /** Quem não confirmar "Vou" até este prazo não entra na busca. */
  prazo: PrazoConfirmacao;
  ativo: boolean;
  /** Dias em que o vanzeiro cancelou a viagem (feriado, sem aula). Nesses dias a viagem não acontece; sem desconto. */
  diasCancelados?: DiaSemViagem[] | undefined;
};

/** Um dia cancelado pelo vanzeiro: a data (AAAA-MM-DD), o motivo e quando foi cancelado. */
export type DiaSemViagem = { data: string; motivo: string; canceladoEm: string };

export const destinosExemplo: Destino[] = [
  {
    id: "jacarezinho-londrina",
    vanzeiroId: "vanzeiro-carlos",
    origem: "Jacarezinho",
    destino: "Londrina",
    tipo: "fixa",
    dias: ["sex", "sab", "dom"],
    data: null,
    saida: "06:00",
    volta: "18:30",
    voltaData: null,
    paradas: ["Santo Antônio da Platina"],
    convite: "VAN-4821",
    prazo: "1h",
    ativo: true,
  },
  {
    id: "centro-unisul",
    vanzeiroId: "vanzeiro-carlos",
    origem: "Cambará",
    destino: "UENP Jacarezinho",
    tipo: "fixa",
    dias: ["seg", "ter", "qua", "qui", "sex"],
    data: null,
    saida: "06:40",
    volta: "17:50",
    voltaData: null,
    paradas: ["Jacarezinho"],
    convite: "VAN-3175",
    prazo: "1h",
    ativo: true,
  },
  {
    id: "excursao-beto-carrero",
    vanzeiroId: "vanzeiro-carlos",
    origem: "Jacarezinho",
    destino: "Beto Carrero World",
    tipo: "avulsa",
    dias: [],
    data: "2026-11-28",
    saida: "04:30",
    volta: "19:00",
    voltaData: null,
    paradas: ["Curitiba", "Joinville"],
    convite: "VAN-9064",
    prazo: "noite-anterior",
    ativo: true,
  },
];

export type RespostaViagem = "vai" | "nao-vai";

export type PlanoPagamento = "viagem" | "diario" | "quinzenal" | "mensal";

export type Passageiro = {
  id: string;
  vanzeiroId: string;
  /** Identidade compartilhada; id continua sendo a matrícula no destino. */
  pessoaId?: string | undefined;
  destinoId: string;
  nome: string;
  /** Só números, com DDD (ex.: 43998123456). */
  telefone: string;
  /** Cidade ou parada do caminho onde a pessoa embarca. */
  cidade: string;
  /** Endereço ou ponto de embarque. */
  endereco: string;
  plano: PlanoPagamento;
  /** Em centavos (R$ 280,00 = 28000). */
  valor: number;
  /** Dia do mês do vencimento (só quinzenal e mensal). */
  vencimento: number | null;
  /** Só mensal e quinzenal: desconta as faltas da cobrança. */
  descontaFaltas: boolean;
  /** Valor descontado por falta, quando desconta faltas (em centavos). */
  valorFalta: number | null;
  /** Ordem de busca dentro da cidade (1, 2, 3…), mudada arrastando o nome na lista. */
  ordem?: number | undefined;
  /** Ponto de embarque marcado no mapa (latitude e longitude). Sem ele, o mapa usa o centro da cidade. */
  ponto?: { lat: number; lng: number } | undefined;
  /** Dia em que saiu do destino (saiu, foi removido ou o destino foi excluído). Continua guardado para o histórico e as cobranças. */
  saiuEm?: string | undefined;
};

/** Pessoa que usou o código de convite e espera o vanzeiro aceitar. */
export type SituacaoPedido = "aguardando" | "aceito" | "recusado";

export type PedidoEntrada = {
  id: string;
  vanzeiroId: string;
  pessoaId?: string | undefined;
  destinoId: string;
  nome: string;
  telefone: string;
  /** Onde a pessoa embarca, preenchido por ela no pedido: cidade do caminho, endereço e ponto no mapa. */
  cidade?: string | undefined;
  endereco?: string | undefined;
  ponto?: { lat: number; lng: number } | undefined;
  /** Aguardando o vanzeiro, aceito ou recusado. O pedido nunca é apagado. */
  situacao?: SituacaoPedido | undefined;
  /** Quando aceito: a matrícula criada a partir dele. */
  matriculaId?: string | undefined;
  pedidoEm?: string | undefined;
  respondidoEm?: string | undefined;
};

export const passageirosExemplo: Passageiro[] = [
  // Jacarezinho → Londrina
  { id: "p-mariana", vanzeiroId: "vanzeiro-carlos", destinoId: "jacarezinho-londrina", nome: "Mariana Souza", telefone: "43998123456", cidade: "Jacarezinho", endereco: "Praça Rui Barbosa, ponto de embarque", plano: "mensal", valor: 28000, vencimento: 10, descontaFaltas: true, valorFalta: 1500 },
  { id: "p-pedro", vanzeiroId: "vanzeiro-carlos", destinoId: "jacarezinho-londrina", nome: "Pedro Henrique Lima", telefone: "43999874512", cidade: "Jacarezinho", endereco: "Rua Paraná, 455", plano: "quinzenal", valor: 15000, vencimento: 15, descontaFaltas: false, valorFalta: null },
  { id: "p-ana", vanzeiroId: "vanzeiro-carlos", destinoId: "jacarezinho-londrina", nome: "Ana Clara Ribeiro", telefone: "43996541230", cidade: "Santo Antônio da Platina", endereco: "Rodoviária de Santo Antônio da Platina", plano: "viagem", valor: 4500, vencimento: null, descontaFaltas: false, valorFalta: null },
  { id: "p-lucas", vanzeiroId: "vanzeiro-carlos", destinoId: "jacarezinho-londrina", nome: "Lucas Ferreira", telefone: "43991237788", cidade: "Santo Antônio da Platina", endereco: "Av. Oliveira Motta, ponto de embarque", plano: "diario", valor: 8000, vencimento: null, descontaFaltas: false, valorFalta: null },
  { id: "p-beatriz", vanzeiroId: "vanzeiro-carlos", destinoId: "jacarezinho-londrina", nome: "Beatriz Martins", telefone: "43988452301", cidade: "Jacarezinho", endereco: "Av. Getúlio Vargas, 1020", plano: "mensal", valor: 28000, vencimento: 5, descontaFaltas: false, valorFalta: null },
  // Cambará → UENP Jacarezinho (IDs preservados para manter cobranças e histórico).
  { id: "p-juliana", vanzeiroId: "vanzeiro-carlos", destinoId: "centro-unisul", nome: "Juliana Alves", telefone: "43998771234", cidade: "Jacarezinho", endereco: "Rua Paraná, 210", plano: "mensal", valor: 28000, vencimento: 20, descontaFaltas: false, valorFalta: null },
  { id: "p-gabriel", vanzeiroId: "vanzeiro-carlos", destinoId: "centro-unisul", nome: "Gabriel Rocha", telefone: "43999125566", cidade: "Cambará", endereco: "Praça Dr. Miguel Dinizo, ponto de embarque", plano: "mensal", valor: 26000, vencimento: 10, descontaFaltas: false, valorFalta: null },
  { id: "p-fernanda", vanzeiroId: "vanzeiro-carlos", destinoId: "centro-unisul", nome: "Fernanda Costa", telefone: "43996654321", cidade: "Cambará", endereco: "Av. Brasil, 88", plano: "quinzenal", valor: 14000, vencimento: 5, descontaFaltas: true, valorFalta: 1000 },
  { id: "p-rafael", vanzeiroId: "vanzeiro-carlos", destinoId: "centro-unisul", nome: "Rafael Mendes", telefone: "43991478523", cidade: "Jacarezinho", endereco: "Av. Getúlio Vargas, 1500", plano: "diario", valor: 2200, vencimento: null, descontaFaltas: false, valorFalta: null },
  { id: "p-camila", vanzeiroId: "vanzeiro-carlos", destinoId: "centro-unisul", nome: "Camila Duarte", telefone: "43988236547", cidade: "Cambará", endereco: "Rodoviária de Cambará", plano: "viagem", valor: 1200, vencimento: null, descontaFaltas: false, valorFalta: null },
  { id: "p-thiago", vanzeiroId: "vanzeiro-carlos", destinoId: "centro-unisul", nome: "Thiago Nunes", telefone: "43997563214", cidade: "Jacarezinho", endereco: "Rua dos Expedicionários, 37", plano: "mensal", valor: 28000, vencimento: 20, descontaFaltas: false, valorFalta: null },
  { id: "p-juliana-londrina", vanzeiroId: "vanzeiro-carlos", pessoaId: "p-juliana", destinoId: "jacarezinho-londrina", nome: "Juliana Alves", telefone: "43998771234", cidade: "Jacarezinho", endereco: "Praça Rui Barbosa", plano: "mensal", valor: 18000, vencimento: 20, descontaFaltas: false, valorFalta: null },
  // Excursão Beto Carrero
  { id: "p-rosana", vanzeiroId: "vanzeiro-carlos", destinoId: "excursao-beto-carrero", nome: "Rosana Pereira", telefone: "43998012233", cidade: "Jacarezinho", endereco: "Praça Rui Barbosa", plano: "viagem", valor: 32000, vencimento: null, descontaFaltas: false, valorFalta: null },
  { id: "p-jose", vanzeiroId: "vanzeiro-carlos", destinoId: "excursao-beto-carrero", nome: "José Carlos Silva", telefone: "43999347788", cidade: "Jacarezinho", endereco: "Rodoviária de Jacarezinho", plano: "viagem", valor: 32000, vencimento: null, descontaFaltas: false, valorFalta: null },
  { id: "p-patricia", vanzeiroId: "vanzeiro-carlos", destinoId: "excursao-beto-carrero", nome: "Patrícia Gomes", telefone: "41998456123", cidade: "Curitiba", endereco: "Rodoferroviária", plano: "viagem", valor: 28000, vencimento: null, descontaFaltas: false, valorFalta: null },
  { id: "p-marcos", vanzeiroId: "vanzeiro-carlos", destinoId: "excursao-beto-carrero", nome: "Marcos Antunes", telefone: "43991113344", cidade: "Jacarezinho", endereco: "Rua Paraná, 120", plano: "viagem", valor: 32000, vencimento: null, descontaFaltas: false, valorFalta: null },
];

export const pedidosExemplo: PedidoEntrada[] = [
  { id: "pedido-larissa", vanzeiroId: "vanzeiro-carlos", destinoId: "jacarezinho-londrina", nome: "Larissa Moreira", telefone: "43997012345", cidade: "Jacarezinho", endereco: "Rua Paraná, 900", ponto: { lat: -23.1638, lng: -49.9721 } },
  { id: "pedido-joao", vanzeiroId: "vanzeiro-carlos", destinoId: "jacarezinho-londrina", nome: "João Vitor Santos", telefone: "43998456721", cidade: "Santo Antônio da Platina", endereco: "Rua Rui Barbosa, 120", ponto: { lat: -23.2961, lng: -50.0792 } },
];

/** "Hoje" da etapa visual, para os exemplos de cobrança ficarem coerentes (sexta, 13 de nov). */
export const DATA_DE_HOJE = "2026-11-13";

/** Horário de "agora" na etapa visual: o prazo da viagem das 06:40 (05:40) ainda está aberto, o das 06:00 (05:00) já fechou. */
export const HORA_DE_AGORA = "05:10";

/** Primeiro dia do histórico de exemplo: as cobranças começam a ser criadas a partir daqui. */
export const INICIO_DO_HISTORICO = "2026-10-01";

export type FormaPagamento = "dinheiro" | "pix";

/** Dias em que passageiros de "Por viagem" e "Diário" embarcaram (geram cobranças). As viagens de hoje são feitas na aba Viagem. */
export const embarquesExemplo: { passageiroId: string; data: string }[] = [
  { passageiroId: "p-ana", data: "2026-11-06" },
  { passageiroId: "p-ana", data: "2026-11-08" },
  { passageiroId: "p-lucas", data: "2026-11-01" },
  { passageiroId: "p-lucas", data: "2026-11-06" },
  { passageiroId: "p-lucas", data: "2026-11-07" },
  { passageiroId: "p-rafael", data: "2026-11-09" },
  { passageiroId: "p-rafael", data: "2026-11-10" },
  { passageiroId: "p-rafael", data: "2026-11-11" },
  { passageiroId: "p-rafael", data: "2026-11-12" },
  { passageiroId: "p-camila", data: "2026-11-09" },
  { passageiroId: "p-camila", data: "2026-11-11" },
  { passageiroId: "p-camila", data: "2026-11-12" },
];

/** Dias de ausência; só avisos Não vou dentro do prazo dão desconto. */
export const faltasExemplo: { passageiroId: string; data: string; avisouNoPrazo: boolean }[] = [
  { passageiroId: "p-mariana", avisouNoPrazo: true, data: "2026-10-17" },
  { passageiroId: "p-mariana", avisouNoPrazo: true, data: "2026-10-24" },
  { passageiroId: "p-fernanda", avisouNoPrazo: true, data: "2026-10-28" },
  { passageiroId: "p-juliana", avisouNoPrazo: true, data: "2026-11-05" },
];

/** Cobranças com vencimento até esta data foram pagas por Pix no próprio vencimento. */
export const PAGAS_ATE_EXEMPLO = "2026-10-31";

/** Outras cobranças pagas, pela chave "passageiro_vencimento". */
export const pagamentosExemplo: Record<string, { data: string; forma: FormaPagamento }> = {
  "p-ana_2026-11-06": { data: "2026-11-06", forma: "dinheiro" },
  "p-lucas_2026-11-01": { data: "2026-11-01", forma: "dinheiro" },
  "p-lucas_2026-11-06": { data: "2026-11-06", forma: "pix" },
  "p-gabriel_2026-11-10": { data: "2026-11-10", forma: "pix" },
  "p-fernanda_2026-11-05": { data: "2026-11-04", forma: "dinheiro" },
  "p-rafael_2026-11-09": { data: "2026-11-09", forma: "pix" },
  "p-rafael_2026-11-10": { data: "2026-11-10", forma: "pix" },
  "p-camila_2026-11-09": { data: "2026-11-09", forma: "pix" },
  "p-camila_2026-11-11": { data: "2026-11-11", forma: "dinheiro" },
};

export const cancelamentosExemplo: Record<string, { data: string; motivo: string }> = {
  "p-lucas_2026-11-07": { data: "2026-11-08", motivo: "Dia de cortesia" },
};

/** Notification types for both vanzeiro and passageiro. */
export type TipoAviso =
  | "viagem_cancelada"
  | "viagem_de_volta"
  | "endereco_aceito"
  | "endereco_recusado"
  | "pedido_novo"
  | "resposta_passageiro"
  | "cobranca_vencida"
  | "prazo_chegando"
  | "van_saiu"
  | "cobranca_vencendo"
  | "pedido_recusado"
  | "pedido_aceito";

export type Aviso = {
  id: string;
  vanzeiroId: string;
  tipo: TipoAviso;
  paraVanzeiroOuPassageiroId: string;
  dataCriacao: string;
  lido: boolean;
  /** destinoId for vanzeiro/passageiro context. */
  destinoId?: string;
  /** passageiroId when the notification is about a specific passenger. */
  passageiroId?: string;
  /** Cobranca ID when notification is about a charge. */
  cobrancaId?: string;
  /** What the notice is about (e.g. "cobranca_vencida_<id>"), so the same event never makes two notices. */
  chave?: string;
  textoResumido: string;
};

/** No sample notices: the app creates them from what happens (answers, the van leaving, charges, deadlines). */
export const avisosExemplo: Aviso[] = [];

/** Example of a completed trip (from a past day). */
export type ViagemEncerrada = {
  vanzeiroId: string;
  destinoId: string;
  data: string;
  temVolta: boolean;
  /** The destino as it was on that day. */
  foto: { nome: string; saida: string; volta: string };
  embarcaram: string[];
  naoEstavam: string[];
  ficaram: string[];
};

export const viagensEncerradasExemplo: ViagemEncerrada[] = [
  // Same days as embarquesExemplo: on 12/11 everyone of Cambará → UENP went (Rafael and Camila boarded);
  // on Sunday 08/11 Ana boarded in Londrina and Lucas (diário) did not go.
  {
    vanzeiroId: "vanzeiro-carlos",
    destinoId: "centro-unisul",
    data: "2026-11-12",
    temVolta: true,
    foto: { nome: "Cambará → UENP Jacarezinho", saida: "06:40", volta: "17:50" },
    embarcaram: ["p-gabriel", "p-fernanda", "p-thiago", "p-juliana", "p-rafael", "p-camila"],
    naoEstavam: [],
    ficaram: [],
  },
  {
    vanzeiroId: "vanzeiro-carlos",
    destinoId: "jacarezinho-londrina",
    data: "2026-11-08",
    temVolta: true,
    foto: { nome: "Jacarezinho → Londrina", saida: "06:00", volta: "18:30" },
    embarcaram: ["p-mariana", "p-pedro", "p-ana", "p-beatriz", "p-juliana-londrina"],
    naoEstavam: [],
    ficaram: [],
  },
];

/**
 * Onde fica cada cidade dos exemplos no mapa (aproximado). Enquanto não há banco nem busca de endereço,
 * o mapa só sabe desenhar as cidades desta lista.
 */
export const coordenadasExemplo: Record<string, { lat: number; lng: number }> = {
  Jacarezinho: { lat: -23.1606, lng: -49.9692 },
  "Santo Antônio da Platina": { lat: -23.295, lng: -50.077 },
  Londrina: { lat: -23.3045, lng: -51.1696 },
  "Cambará": { lat: -23.0461, lng: -50.0739 },
  "UENP Jacarezinho": { lat: -23.1527, lng: -49.9617 },
  Curitiba: { lat: -25.4284, lng: -49.2733 },
  Joinville: { lat: -26.3045, lng: -48.8487 },
  "Beto Carrero World": { lat: -26.801, lng: -48.6176 },
};

/** Van expenses of the sample vanzeiro (T6, "Seu mês na van"), money in centavos. */
export const gastosExemplo: Gasto[] = [
  { id: "gasto-1", vanzeiroId: "vanzeiro-carlos", tipo: "combustivel", descricao: "", valor: 42000, data: "2026-11-03" },
  { id: "gasto-2", vanzeiroId: "vanzeiro-carlos", tipo: "pedagio", descricao: "", valor: 1860, data: "2026-11-08" },
  { id: "gasto-3", vanzeiroId: "vanzeiro-carlos", tipo: "combustivel", descricao: "", valor: 38000, data: "2026-11-11" },
  { id: "gasto-4", vanzeiroId: "vanzeiro-carlos", tipo: "combustivel", descricao: "", valor: 79000, data: "2026-10-15" },
  { id: "gasto-5", vanzeiroId: "vanzeiro-carlos", tipo: "manutencao", descricao: "", valor: 35000, data: "2026-10-22" },
];
