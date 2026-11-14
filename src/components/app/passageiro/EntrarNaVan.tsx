import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, KeyRound, LogOut, MessageCircle, Phone, Search, User, XCircle } from "lucide-react";
import { CampoComIcone } from "@/components/app/CampoComIcone";
import { VanIcon } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Destino } from "@/data/exemplo";
import { nomeDestino, quandoAcontece } from "@/lib/destinos";
import { useDestino, useDestinos } from "@/lib/destinos-store";
import { matriculasDaPessoa, formatarTelefone, somenteDigitos, telefoneValido } from "@/lib/passageiros";
import { sair } from "@/lib/acesso";
import { pedirParaEntrar, tentarOutroCodigo, useMinhaSituacao, useSessaoPassageiro } from "@/lib/sessao-passageiro";
import { usePerfilVanzeiro } from "@/lib/vanzeiro-store";
import { obterPedidos, usePassageiros, useAceitos } from "@/lib/passageiros-store";
import { acharPorCodigo } from "@/lib/convite";
import { PassageiroHeader } from "./PassageiroHeader";

/** Shown while the passenger is not in any van: invite code → "Pedir para entrar" → waiting for the vanzeiro. */
export function EntrarNaVan({ outro = false }: { outro?: boolean }) {
  const s = useMinhaSituacao();
  const sessao = useSessaoPassageiro();
  const destinos = useDestinos();
  const aceitos = useAceitos();
  const destinoPedido = !aceitos[sessao.pedidoId ?? ""] && destinos.find((d) => d.id === sPedido(sessao.pedidoId));
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PassageiroHeader compacto titulo={outro ? "Entrar em outro destino" : "Entrar na van"} subtitulo="Use o código que o vanzeiro te enviou." />
      <div className="relative z-10 -mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-4">
        {outro && destinoPedido ? <Aguardando destinoId={destinoPedido.id} /> : s.tipo === "aguardando" ? <Aguardando destinoId={s.destinoId} /> : s.tipo === "recusado" ? <Recusado /> : <Codigo primeiroUso={!outro} />}
        <Link
          to={outro ? "/passageiro/perfil" : "/entrar"}
          onClick={outro ? undefined : sair}
          className="mx-auto flex h-11 w-fit items-center gap-2 px-4 text-sm font-semibold text-muted-foreground"
        >
          <LogOut className="h-4 w-4" /> {outro ? "Voltar ao perfil" : "Sair"}
        </Link>
      </div>
    </div>
  );
}

function Codigo({ primeiroUso }: { primeiroUso: boolean }) {
  const destinos = useDestinos();
  const [codigo, setCodigo] = useState("");
  const [achado, setAchado] = useState<Destino | null | undefined>(undefined);

  const procurar = () => setAchado(acharPorCodigo(destinos, codigo) ?? null);

  if (achado) return <Confirmar destino={achado} voltar={() => setAchado(undefined)} />;

  return (
    <>
    <section className="space-y-3 rounded-3xl bg-card p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <KeyRound className="h-6 w-6" />
        </div>
        <p className="font-semibold leading-snug text-foreground">Digite o código de convite da sua van.</p>
      </div>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          procurar();
        }}
      >
        <Input
          aria-label="Código de convite"
          placeholder="Ex.: VAN-4821"
          value={codigo}
          autoCapitalize="characters"
          onChange={(e) => {
            setCodigo(e.target.value.toUpperCase());
            setAchado(undefined);
          }}
          className="h-14 rounded-xl border-input bg-surface text-center font-display text-xl font-bold tracking-widest shadow-none md:text-xl"
        />
        {achado === null && (
          <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-destructive" role="alert">
            <XCircle className="h-4 w-4" /> Código não encontrado
          </p>
        )}
        <Button type="submit" variant="cta" size="xl" className="w-full" disabled={!codigo.trim()}>
          <Search className="!h-5 !w-5" /> Procurar van
        </Button>
      </form>
    </section>
    {primeiroUso && <OndeConseguir />}
    </>
  );
}

/** First use: where the invite code comes from. */
function OndeConseguir() {
  return (
    <section className="flex items-start gap-3 rounded-3xl bg-card p-4 shadow-card">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success">
        <MessageCircle className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="font-bold leading-snug text-foreground">Onde consigo o código?</p>
        <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
          Peça ao seu vanzeiro. Ele envia o código pelo WhatsApp.
        </p>
      </div>
    </section>
  );
}

function CardDaVan({ destino }: { destino: Destino }) {
  const vanzeiro = usePerfilVanzeiro();
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-surface p-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success">
        <VanIcon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vanzeiro</p>
        <p className="font-display text-lg font-bold leading-tight text-foreground">{vanzeiro.nome}</p>
        <p className="mt-1 font-semibold text-foreground">{nomeDestino(destino)}</p>
        <p className="text-sm text-muted-foreground">
          {quandoAcontece(destino)} · saída {destino.saida}
        </p>
      </div>
    </div>
  );
}

function Confirmar({ destino, voltar }: { destino: Destino; voltar: () => void }) {
  const sessao = useSessaoPassageiro();
  const [nome, setNome] = useState(sessao.nome);
  const [telefone, setTelefone] = useState(sessao.telefone ? formatarTelefone(sessao.telefone) : "");
  const situacao = useMinhaSituacao();
  const passageiros = usePassageiros();
  const ja = situacao.tipo === "membro" && matriculasDaPessoa(passageiros, situacao.passageiro).some((p) => p.destinoId === destino.id);
  const pode = !ja && nome.trim() !== "" && telefoneValido(telefone);
  return (
    <section className="space-y-3 rounded-3xl bg-card p-4 shadow-card">
      <CardDaVan destino={destino} />
      {ja && <p className="text-sm font-semibold text-muted-foreground">Você já está neste destino.</p>}
      <CampoComIcone id="meu-nome" label="Seu nome" icon={User} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
      <CampoComIcone
        id="meu-whatsapp"
        label="Seu WhatsApp"
        icon={Phone}
        inputMode="tel"
        value={telefone}
        onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
        placeholder="(00) 00000-0000"
      />
      <Button variant="cta" size="xl" className="w-full" disabled={!pode} onClick={() => pedirParaEntrar(destino.id, nome, somenteDigitos(telefone))}>
        Pedir para entrar
      </Button>
      <Button variant="ghost" className="w-full" onClick={voltar}>
        Usar outro código
      </Button>
    </section>
  );
}

function Aguardando({ destinoId }: { destinoId: string }) {
  const destino = useDestino(destinoId);
  return (
    <section className="space-y-3 rounded-3xl bg-card p-4 text-center shadow-card">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-warning-soft text-warning">
        <Clock className="h-7 w-7" />
      </div>
      <p className="font-display text-xl font-bold text-foreground">Aguardando o vanzeiro aceitar</p>
      <p className="text-sm text-muted-foreground">Assim que ele aceitar, o seu painel abre aqui.</p>
      {destino && <CardDaVan destino={destino} />}
    </section>
  );
}

function Recusado() {
  return (
    <section className="space-y-3 rounded-3xl bg-card p-4 text-center shadow-card">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-destructive-soft text-destructive">
        <XCircle className="h-7 w-7" />
      </div>
      <p className="font-display text-xl font-bold text-foreground">O vanzeiro não aceitou o pedido</p>
      <p className="text-sm text-muted-foreground">Fale com ele ou tente outro código.</p>
      <Button variant="cta" size="xl" className="w-full" onClick={tentarOutroCodigo}>
        Tentar outro código
      </Button>
    </section>
  );
}

function sPedido(id: string | null) { return obterPedidos().find((p) => p.id === id)?.destinoId; }
