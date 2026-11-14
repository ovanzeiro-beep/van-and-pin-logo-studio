import { useNavigate } from "@tanstack/react-router";
import { ScreenHeader, type ScreenHeaderProps } from "@/components/app/ScreenHeader";
import { useAvisosVanzeiro } from "@/lib/passageiros-store";
import { primeiroNome, usePerfilVanzeiro } from "@/lib/vanzeiro-store";

/** Tapping the bell opens Notificações: join requests and the vanzeiro's notices. */
export function useAbrirNotificacoes() {
  const navigate = useNavigate();
  return () => navigate({ to: "/vanzeiro/notificacoes" });
}

/** Header of the vanzeiro screens: the bell counts join requests and unread notices. */
export function VanzeiroHeader(props: Omit<ScreenHeaderProps, "nome" | "avisos" | "aoTocarAvisos">) {
  const avisos = useAvisosVanzeiro();
  const abrirNotificacoes = useAbrirNotificacoes();
  const perfil = usePerfilVanzeiro();
  return <ScreenHeader {...props} nome={primeiroNome(perfil)} avisos={avisos} aoTocarAvisos={abrirNotificacoes} />;
}
