import { useEffect, useState } from "react";
import type { Aviso, PedidoEntrada, TipoAviso } from "@/data/exemplo";
import { obterAvisos, ouvirAvisos } from "@/lib/avisos-store";
import { nomeDestino } from "@/lib/destinos";
import { obterDestinos } from "@/lib/destinos-store";
import { identidadePassageiro } from "@/lib/passageiros";
import { obterMudancasDeEndereco, obterTodosOsPedidos, ouvirPassageiros, type MudancaDeEndereco } from "@/lib/passageiros-store";
import { textoDaDistancia } from "@/lib/endereco";
import { idDoVanzeiro, obterSessao, type Papel } from "@/lib/sessao";
import { obterMinhasMatriculas } from "@/lib/sessao-passageiro";
import { guardarEsteCelular } from "@/lib/banco/celular";
import { VIBRACAO } from "@/lib/alerta";

// Notifications on the phone (decision A2 of the owner, 15/11/2026).
// Now (no server): while the app is open in the background, new notices show up as phone notifications.
// With the database: the server sends them even with the app closed (public/sw.js already shows them).

export type Permissao = "ativada" | "bloqueada" | "nao-pedida" | "sem-suporte";

export function estadoDaPermissao(temSuporte: boolean, permissao: NotificationPermission | undefined): Permissao {
  if (!temSuporte || !permissao) return "sem-suporte";
  if (permissao === "granted") return "ativada";
  if (permissao === "denied") return "bloqueada";
  return "nao-pedida";
}

const permissaoAtual = (): Permissao =>
  typeof window === "undefined" ? "sem-suporte" : estadoDaPermissao("Notification" in window, window.Notification?.permission);

/** The words of each notice, the same as on the bell. */
export const ROTULO_DO_AVISO: Record<TipoAviso, string> = {
  pedido_novo: "Pedido novo",
  resposta_passageiro: "Resposta de passageiro",
  cobranca_vencida: "Cobrança vencida",
  prazo_chegando: "Prazo chegando",
  van_saiu: "Van saiu",
  cobranca_vencendo: "Cobrança vencendo",
  pedido_recusado: "Pedido não aceito",
  pedido_aceito: "Pedido aceito",
  endereco_aceito: "Endereço aceito",
  endereco_recusado: "Endereço não aceito",
  viagem_cancelada: "Sem viagem",
  viagem_de_volta: "Vai ter viagem",
  destino_excluido: "Destino excluído",
  presenca_confirmada: "Presença confirmada",
  ausencia_registrada: "Ausência registrada",
};

export type Notificacao = { titulo: string; corpo: string; url: string; tag: string };

const telaDeAvisos = (papel: Papel) => (papel === "vanzeiro" ? "/vanzeiro/notificacoes" : "/passageiro/notificacoes");

export function notificacaoDoAviso(a: Aviso, papel: Papel): Notificacao {
  return { titulo: ROTULO_DO_AVISO[a.tipo], corpo: a.textoResumido, url: telaDeAvisos(papel), tag: a.id };
}

export function notificacaoDoPedido(p: PedidoEntrada, nomeDoDestino: string | undefined): Notificacao {
  return {
    titulo: ROTULO_DO_AVISO.pedido_novo,
    corpo: `${p.nome} quer entrar${nomeDoDestino ? ` em ${nomeDoDestino}` : ""}`,
    url: "/vanzeiro/notificacoes",
    tag: p.id,
  };
}

/** A passenger asked to board farther than 1 km from the agreed point: the vanzeiro must answer. */
export function notificacaoDaMudanca(m: Pick<MudancaDeEndereco, "id" | "nome" | "distanciaKm">, nomeDoDestino: string | undefined): Notificacao {
  return {
    titulo: "Mudança de endereço",
    corpo: `${m.nome} quer mudar onde embarca${nomeDoDestino ? ` em ${nomeDoDestino}` : ""}${m.distanciaKm !== null ? ` (${textoDaDistancia(m.distanciaKm)} do ponto combinado)` : ""}`,
    url: "/vanzeiro/notificacoes",
    tag: m.id,
  };
}

/** Only what is new and for the person using this phone. */
export function novosParaMim<T extends { id: string }>(conhecidos: Set<string>, lista: T[], ehMeu: (x: T) => boolean): T[] {
  return lista.filter((x) => !conhecidos.has(x.id) && ehMeu(x));
}

/** Who is using this phone now, as the notices address them (vanzeiro id or the passenger's identity). */
function meuId(papel: Papel): string | null {
  if (papel === "vanzeiro") return idDoVanzeiro();
  const [eu] = obterMinhasMatriculas();
  return eu ? identidadePassageiro(eu) : null;
}

async function mostrar(n: Notificacao) {
  // Vibrates and plays the phone's notification sound, the same as the notices sent by the server (public/sw.js).
  const opcoes = { body: n.corpo, tag: n.tag, renotify: true, silent: false, vibrate: VIBRACAO, icon: "/icones/icone-192.png", badge: "/icones/icone-192.png", data: { url: n.url } };
  const registro = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
  if (registro) await registro.showNotification(n.titulo, opcoes);
  else new Notification(n.titulo, opcoes);
}

/** "Ativar" on the Perfil: asks the phone for permission. */
export function useNotificacoesNoCelular() {
  const [permissao, setPermissao] = useState<Permissao>("sem-suporte");
  useEffect(() => setPermissao(permissaoAtual()), []);
  const ativar = async () => {
    if (permissaoAtual() !== "nao-pedida") return;
    await Notification.requestPermission();
    setPermissao(permissaoAtual());
    // W10: from now on the notices also arrive with the app closed.
    void guardarEsteCelular();
  };
  return { permissao, ativar };
}

/** While the app is open but not on screen, new notices and join requests become phone notifications. */
export function useNotificarAvisosNovos() {
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    let avisosConhecidos = new Set(obterAvisos().map((a) => a.id));
    let pedidosConhecidos = new Set(obterTodosOsPedidos().map((p) => p.id));
    let mudancasConhecidas = new Set(obterMudancasDeEndereco().map((m) => m.id));

    const verificar = () => {
      const papel = obterSessao().papel;
      const avisos = obterAvisos();
      const pedidos = obterTodosOsPedidos();
      const mudancas = obterMudancasDeEndereco();
      const avisar = papel !== null && permissaoAtual() === "ativada" && document.visibilityState === "hidden";
      if (avisar) {
        const id = meuId(papel);
        for (const a of novosParaMim(avisosConhecidos, avisos, (x) => x.paraVanzeiroOuPassageiroId === id)) {
          void mostrar(notificacaoDoAviso(a, papel)).catch(() => undefined);
        }
        if (papel === "vanzeiro") {
          for (const p of novosParaMim(pedidosConhecidos, pedidos, (x) => x.vanzeiroId === id && (x.situacao ?? "aguardando") === "aguardando")) {
            const d = obterDestinos().find((x) => x.id === p.destinoId);
            void mostrar(notificacaoDoPedido(p, d ? nomeDestino(d) : undefined)).catch(() => undefined);
          }
          for (const m of novosParaMim(mudancasConhecidas, mudancas, (x) => x.vanzeiroId === id && x.situacao === "aguardando")) {
            const d = obterDestinos().find((x) => x.id === m.destinoId);
            void mostrar(notificacaoDaMudanca(m, d ? nomeDestino(d) : undefined)).catch(() => undefined);
          }
        }
      }
      avisosConhecidos = new Set(avisos.map((a) => a.id));
      pedidosConhecidos = new Set(pedidos.map((p) => p.id));
      mudancasConhecidas = new Set(mudancas.map((m) => m.id));
    };

    const pararAvisos = ouvirAvisos(verificar);
    const pararPedidos = ouvirPassageiros(verificar);
    return () => {
      pararAvisos();
      pararPedidos();
    };
  }, []);
}
