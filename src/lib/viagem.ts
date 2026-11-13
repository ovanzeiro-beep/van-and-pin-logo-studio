export type SituacaoVan = { situacao: string; detalhe: string; etapa: number };

/** The van's live status ("A caminho" etc.) only applies on the day of the trip. */
export function situacaoDaVan(viagem: { ehHoje: boolean }, van: SituacaoVan): SituacaoVan {
  if (!viagem.ehHoje) {
    return { situacao: "Aguardando o dia da viagem", detalhe: "A van ainda não saiu para a sua viagem", etapa: -1 };
  }
  return { situacao: van.situacao, detalhe: van.detalhe, etapa: van.etapa };
}
