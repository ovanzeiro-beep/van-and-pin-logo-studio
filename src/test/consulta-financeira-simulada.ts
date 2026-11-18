export function consultaFinanceiraSimulada(linhas: Record<string, unknown>[]) {
  return {
    data: linhas.map((linha) => ({ ...linha })),
    error: null,
    order: () => ({
      limit: (maximo: number) => {
        function pagina(depois?: string) {
          const ids = linhas.filter((linha) => depois === undefined || String(linha["id"]) > depois);
          ids.sort((a, b) => String(a["id"]).localeCompare(String(b["id"]), "en", { numeric: false }));
          return { data: ids.slice(0, maximo), count: ids.length, error: null };
        }
        return { ...pagina(), gt: (_coluna: string, id: string) => pagina(id) };
      },
    }),
  };
}
