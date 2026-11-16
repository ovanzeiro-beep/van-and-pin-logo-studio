import { useNavigate } from "@tanstack/react-router";
import { primeiroNomeDe } from "@/lib/datas";
import { ScreenHeader, type ScreenHeaderProps } from "@/components/app/ScreenHeader";
import { useMinhaSituacao, useSessaoPassageiro } from "@/lib/sessao-passageiro";
import { useAvisosNaoLidos } from "@/lib/avisos-store";
import { identidadePassageiro } from "@/lib/passageiros";

function useAbrirNotificacoes() {
  const navigate = useNavigate();
  return () => navigate({ to: "/passageiro/notificacoes" });
}

/** Header of the passenger screens, greeting whoever is using the panel. */
export function PassageiroHeader(props: Omit<ScreenHeaderProps, "nome">) {
  const sessao = useSessaoPassageiro();
  const s = useMinhaSituacao();
  const nome = s.tipo === "membro" ? s.passageiro.nome : sessao.nome;
  const meuId = s.tipo === "membro" ? identidadePassageiro(s.passageiro) : "";
  const avisosNaoLidos = useAvisosNaoLidos(meuId);
  const abrirNotificacoes = useAbrirNotificacoes();
  return (
    <ScreenHeader
      {...props}
      nome={primeiroNomeDe(nome) || "Passageiro"}
      avisos={avisosNaoLidos.length}
      aoTocarAvisos={abrirNotificacoes}
    />
  );
}
