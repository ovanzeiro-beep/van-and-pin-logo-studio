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
