// Dados de exemplo da etapa visual. Substituir por dados reais nas próximas etapas.

export const vanzeiroExemplo = {
  id: "vanzeiro-carlos",
  nome: "Carlos",
  nomeCompleto: "Carlos Pereira",
  telefone: "43999551234",
  /** Chave Pix que aparece para os passageiros. */
  pix: "carlos.vanzeiro@email.com",
  van: { modelo: "Sprinter", placa: "ABC-1D23" },
  viagemHoje: {
    /** Destino da viagem de hoje: nome e horários vêm do cadastro dele. */
    destinoId: "centro-unisul",
  },
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
  /** Cidades ou paradas no caminho, em ordem (sem a origem e o destino). */
  paradas: string[];
  /** Código curto que o vanzeiro envia para quem quer entrar (ex.: VAN-4821). */
  convite: string;
  /** Quem não confirmar "Vou" até este prazo não entra na busca. */
  prazo: PrazoConfirmacao;
  ativo: boolean;
};

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
  valor: number;
  /** Dia do mês do vencimento (só quinzenal e mensal). */
  vencimento: number | null;
  /** Só mensal e quinzenal: desconta as faltas da cobrança. */
  descontaFaltas: boolean;
  /** Valor descontado por falta, quando desconta faltas. */
  valorFalta: number | null;
};

/** Pessoa que usou o código de convite e espera o vanzeiro aceitar. */
export type PedidoEntrada = {
  id: string;
  vanzeiroId: string;
  pessoaId?: string | undefined;
  destinoId: string;
  nome: string;
  telefone: string;
};

export const passageirosExemplo: Passageiro[] = [
  // Jacarezinho → Londrina
  { id: "p-mariana", vanzeiroId: "vanzeiro-carlos", destinoId: "jacarezinho-londrina", nome: "Mariana Souza", telefone: "43998123456", cidade: "Jacarezinho", endereco: "Praça Rui Barbosa, ponto de embarque", plano: "mensal", valor: 280, vencimento: 10, descontaFaltas: true, valorFalta: 15 },
  { id: "p-pedro", vanzeiroId: "vanzeiro-carlos", destinoId: "jacarezinho-londrina", nome: "Pedro Henrique Lima", telefone: "43999874512", cidade: "Jacarezinho", endereco: "Rua Paraná, 455", plano: "quinzenal", valor: 150, vencimento: 15, descontaFaltas: false, valorFalta: null },
  { id: "p-ana", vanzeiroId: "vanzeiro-carlos", destinoId: "jacarezinho-londrina", nome: "Ana Clara Ribeiro", telefone: "43996541230", cidade: "Santo Antônio da Platina", endereco: "Rodoviária de Santo Antônio da Platina", plano: "viagem", valor: 45, vencimento: null, descontaFaltas: false, valorFalta: null },
  { id: "p-lucas", vanzeiroId: "vanzeiro-carlos", destinoId: "jacarezinho-londrina", nome: "Lucas Ferreira", telefone: "43991237788", cidade: "Santo Antônio da Platina", endereco: "Av. Oliveira Motta, ponto de embarque", plano: "diario", valor: 80, vencimento: null, descontaFaltas: false, valorFalta: null },
  { id: "p-beatriz", vanzeiroId: "vanzeiro-carlos", destinoId: "jacarezinho-londrina", nome: "Beatriz Martins", telefone: "43988452301", cidade: "Jacarezinho", endereco: "Av. Getúlio Vargas, 1020", plano: "mensal", valor: 280, vencimento: 5, descontaFaltas: false, valorFalta: null },
  // Cambará → UENP Jacarezinho (IDs preservados para manter cobranças e histórico).
  { id: "p-juliana", vanzeiroId: "vanzeiro-carlos", destinoId: "centro-unisul", nome: "Juliana Alves", telefone: "43998771234", cidade: "Jacarezinho", endereco: "Rua Paraná, 210", plano: "mensal", valor: 280, vencimento: 20, descontaFaltas: false, valorFalta: null },
  { id: "p-gabriel", vanzeiroId: "vanzeiro-carlos", destinoId: "centro-unisul", nome: "Gabriel Rocha", telefone: "43999125566", cidade: "Cambará", endereco: "Praça Dr. Miguel Dinizo, ponto de embarque", plano: "mensal", valor: 260, vencimento: 10, descontaFaltas: false, valorFalta: null },
  { id: "p-fernanda", vanzeiroId: "vanzeiro-carlos", destinoId: "centro-unisul", nome: "Fernanda Costa", telefone: "43996654321", cidade: "Cambará", endereco: "Av. Brasil, 88", plano: "quinzenal", valor: 140, vencimento: 5, descontaFaltas: true, valorFalta: 10 },
  { id: "p-rafael", vanzeiroId: "vanzeiro-carlos", destinoId: "centro-unisul", nome: "Rafael Mendes", telefone: "43991478523", cidade: "Jacarezinho", endereco: "Av. Getúlio Vargas, 1500", plano: "diario", valor: 22, vencimento: null, descontaFaltas: false, valorFalta: null },
  { id: "p-camila", vanzeiroId: "vanzeiro-carlos", destinoId: "centro-unisul", nome: "Camila Duarte", telefone: "43988236547", cidade: "Cambará", endereco: "Rodoviária de Cambará", plano: "viagem", valor: 12, vencimento: null, descontaFaltas: false, valorFalta: null },
  { id: "p-thiago", vanzeiroId: "vanzeiro-carlos", destinoId: "centro-unisul", nome: "Thiago Nunes", telefone: "43997563214", cidade: "Jacarezinho", endereco: "Rua dos Expedicionários, 37", plano: "mensal", valor: 280, vencimento: 20, descontaFaltas: false, valorFalta: null },
  { id: "p-juliana-londrina", vanzeiroId: "vanzeiro-carlos", pessoaId: "p-juliana", destinoId: "jacarezinho-londrina", nome: "Juliana Alves", telefone: "43998771234", cidade: "Jacarezinho", endereco: "Praça Rui Barbosa", plano: "mensal", valor: 180, vencimento: 20, descontaFaltas: false, valorFalta: null },
  // Excursão Beto Carrero
  { id: "p-rosana", vanzeiroId: "vanzeiro-carlos", destinoId: "excursao-beto-carrero", nome: "Rosana Pereira", telefone: "43998012233", cidade: "Jacarezinho", endereco: "Praça Rui Barbosa", plano: "viagem", valor: 320, vencimento: null, descontaFaltas: false, valorFalta: null },
  { id: "p-jose", vanzeiroId: "vanzeiro-carlos", destinoId: "excursao-beto-carrero", nome: "José Carlos Silva", telefone: "43999347788", cidade: "Jacarezinho", endereco: "Rodoviária de Jacarezinho", plano: "viagem", valor: 320, vencimento: null, descontaFaltas: false, valorFalta: null },
  { id: "p-patricia", vanzeiroId: "vanzeiro-carlos", destinoId: "excursao-beto-carrero", nome: "Patrícia Gomes", telefone: "41998456123", cidade: "Curitiba", endereco: "Rodoferroviária", plano: "viagem", valor: 280, vencimento: null, descontaFaltas: false, valorFalta: null },
  { id: "p-marcos", vanzeiroId: "vanzeiro-carlos", destinoId: "excursao-beto-carrero", nome: "Marcos Antunes", telefone: "43991113344", cidade: "Jacarezinho", endereco: "Rua Paraná, 120", plano: "viagem", valor: 320, vencimento: null, descontaFaltas: false, valorFalta: null },
];

export const pedidosExemplo: PedidoEntrada[] = [
  { id: "pedido-larissa", vanzeiroId: "vanzeiro-carlos", destinoId: "jacarezinho-londrina", nome: "Larissa Moreira", telefone: "43997012345" },
  { id: "pedido-joao", vanzeiroId: "vanzeiro-carlos", destinoId: "jacarezinho-londrina", nome: "João Vitor Santos", telefone: "43998456721" },
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
  "p-fernanda_2026-11-04": { data: "2026-11-04", forma: "dinheiro" },
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
  | "pedido_novo"
  | "resposta_passageiro"
  | "cobranca_vencida"
  | "prazo_chegando"
  | "van_saiu"
  | "cobranca_vencendo";

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
  textoResumido: string;
};

/** Example notifications. Some are marked as read. */
export const avisosExemplo: Aviso[] = [
  {
    id: "av-1",
    vanzeiroId: "vanzeiro-carlos",
    tipo: "resposta_passageiro",
    paraVanzeiroOuPassageiroId: "vanzeiro-carlos",
    passageiroId: "p-gabriel",
    destinoId: "centro-unisul",
    dataCriacao: "2026-11-13",
    lido: true,
    textoResumido: "Gabriel respondeu à viagem de hoje",
  },
  {
    id: "av-2",
    vanzeiroId: "vanzeiro-carlos",
    tipo: "cobranca_vencida",
    paraVanzeiroOuPassageiroId: "vanzeiro-carlos",
    passageiroId: "p-beatriz",
    cobrancaId: "p-beatriz_2026-11-05",
    destinoId: "jacarezinho-londrina",
    dataCriacao: "2026-11-06",
    lido: false,
    textoResumido: "Beatriz tem cobrança vencida",
  },
  {
    id: "av-3",
    vanzeiroId: "vanzeiro-carlos",
    tipo: "cobranca_vencendo",
    paraVanzeiroOuPassageiroId: "p-juliana",
    destinoId: "centro-unisul",
    dataCriacao: "2026-11-13",
    lido: false,
    textoResumido: "Sua mensalidade vence em 20/11",
  },
  {
    id: "av-4",
    vanzeiroId: "vanzeiro-carlos",
    tipo: "prazo_chegando",
    paraVanzeiroOuPassageiroId: "p-juliana",
    destinoId: "centro-unisul",
    dataCriacao: "2026-11-13",
    lido: true,
    textoResumido: "Prazo para confirmar: 30 minutos",
  },
];

/** Example of a completed trip (from a past day). */
export type ViagemEncerrada = {
  vanzeiroId: string;
  destinoId: string;
  data: string;
  temVolta: boolean;
  embarcaram: string[];
  naoEstavam: string[];
  ficaram: string[];
};

export const viagensEncerradasExemplo: ViagemEncerrada[] = [
  {
    vanzeiroId: "vanzeiro-carlos",
    destinoId: "centro-unisul",
    data: "2026-11-12",
    temVolta: true,
    embarcaram: ["p-gabriel", "p-fernanda", "p-thiago", "p-mariana", "p-pedro", "p-ana", "p-lucas"],
    naoEstavam: ["p-camila"],
    ficaram: [],
  },
  {
    vanzeiroId: "vanzeiro-carlos",
    destinoId: "jacarezinho-londrina",
    data: "2026-11-11",
    temVolta: true,
    embarcaram: ["p-pedro", "p-beatriz", "p-mariana"],
    naoEstavam: ["p-juliana"],
    ficaram: [],
  },
];
