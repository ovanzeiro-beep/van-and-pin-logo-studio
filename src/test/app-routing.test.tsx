import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});

describe("O Vanzeiro screens", () => {
  const telas = [
    "/entrar",
    "/criar-conta",
    "/esqueci-senha",
    "/termos",
    "/privacidade",
    "/como-vai-usar",
    "/vanzeiro",
    "/vanzeiro/destinos",
    "/vanzeiro/viagem",
    "/vanzeiro/financeiro",
    "/vanzeiro/perfil",
    "/passageiro",
    "/passageiro/viagens",
    "/passageiro/pagamentos",
    "/passageiro/perfil",
  ];

  it.each(telas)("has a page for %s", (path) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const leaf = router.matchRoutes(path).at(-1)?.routeId;
    expect(leaf).not.toBe(rootRouteId);
    expect(leaf?.replace(/\/$/, "")).toBe(path);
  });
});
