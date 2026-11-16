import type { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useSessao } from "@/lib/sessao";
import { USA_BANCO } from "@/lib/supabase";

/**
 * W1: the panels and "Como você vai usar o app?" only open for someone logged in. While the app still checks the
 * login (a moment when it opens), nothing is shown; without an account, it goes to Entrar.
 */
export function ExigeConta({ children }: { children: ReactNode }) {
  const { conta, contaPronta } = useSessao();
  if (!USA_BANCO.conta) return <>{children}</>;
  if (!contaPronta) return <div className="min-h-dvh bg-surface" aria-busy="true" />;
  if (!conta) return <Navigate to="/entrar" replace />;
  return <>{children}</>;
}
