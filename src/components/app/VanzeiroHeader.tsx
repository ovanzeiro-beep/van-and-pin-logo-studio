import { useNavigate } from "@tanstack/react-router";
import { ScreenHeader, type ScreenHeaderProps } from "@/components/app/ScreenHeader";
import { vanzeiroExemplo } from "@/data/exemplo";
import { useAvisosVanzeiro } from "@/lib/passageiros-store";

/** Tapping the bell opens the screen with every join request. */
export function useAbrirPedidos() {
  const navigate = useNavigate();
  return () => navigate({ to: "/vanzeiro/pedidos" });
}

/** Header of the vanzeiro screens: the bell counts join requests and opens them. */
export function VanzeiroHeader(props: Omit<ScreenHeaderProps, "nome" | "avisos" | "aoTocarAvisos">) {
  const avisos = useAvisosVanzeiro();
  const abrirPedidos = useAbrirPedidos();
  return <ScreenHeader {...props} nome={vanzeiroExemplo.nome} avisos={avisos} aoTocarAvisos={abrirPedidos} />;
}
