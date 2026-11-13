import { ScreenHeader, type ScreenHeaderProps } from "@/components/app/ScreenHeader";
import { useMinhaSituacao, useSessaoPassageiro } from "@/lib/sessao-passageiro";

/** Header of the passenger screens, greeting whoever is using the panel. */
export function PassageiroHeader(props: Omit<ScreenHeaderProps, "nome">) {
  const sessao = useSessaoPassageiro();
  const s = useMinhaSituacao();
  const nome = s.tipo === "membro" ? s.passageiro.nome : sessao.nome;
  return <ScreenHeader {...props} nome={nome.split(" ")[0] || "Passageiro"} />;
}
