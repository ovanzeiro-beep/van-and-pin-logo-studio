import { ScreenHeader, type ScreenHeaderProps } from "@/components/app/ScreenHeader";
import { vanzeiroExemplo } from "@/data/exemplo";
import { useAvisosVanzeiro } from "@/lib/passageiros-store";

/** Header of the vanzeiro screens: the bell counts join requests waiting for an answer. */
export function VanzeiroHeader(props: Omit<ScreenHeaderProps, "nome" | "avisos">) {
  const avisos = useAvisosVanzeiro();
  return <ScreenHeader {...props} nome={vanzeiroExemplo.nome} avisos={avisos} />;
}
