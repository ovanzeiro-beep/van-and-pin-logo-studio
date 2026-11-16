import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Clock, KeyRound, LogOut, MessageCircle, Phone, Search, User, Wallet, XCircle } from "lucide-react";
import { CampoComIcone } from "@/components/app/CampoComIcone";
import { VanIcon } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Destino } from "@/data/exemplo";
import { nomeDestino, quandoAcontece } from "@/lib/destinos";
import { useDestino, useDestinos } from "@/lib/destinos-store";
import { matriculasDaPessoa, formatarTelefone, somenteDigitos, telefoneValido } from "@/lib/passageiros";
import { ConfirmarSair } from "@/components/app/ConfirmarSair";
import { pedirParaEntrar, tentarOutroCodigo, useEmAbertoDeQuemSaiu, useMinhaSituacao, useSessaoPassageiro } from "@/lib/sessao-passageiro";
import { InfoCard } from "@/components/app/InfoCard";
import { OndeEmbarco } from "./OndeEmbarco";
import { embarqueCompleto, type Embarque } from "@/lib/endereco";
import { BadgeSituacao } from "@/components/app/CobrancaItem";
import { formatarReais } from "@/lib/dinheiro";
import { usePerfilDoVanzeiro } from "@/lib/vanzeiro-store";
import { obterPedidos, usePassageiros, useAceitos } from "@/lib/passageiros-store";
import { procurarPorCodigo, type DestinoDoConvite } from "@/lib/convite";
import { PassageiroHeader } from "./PassageiroHeader";
import { fazer } from "@/lib/acoes";
import { pedirParaEntrarNoBanco } from "@/lib/banco/passageiros";
import { USA_BANCO } from "@/lib/supabase";

/** Shown while the passenger is not in any van: invite code → "Pedir para entrar" → waiting for the vanzeiro. */
export function EntrarNaVan({ outro = false }: { outro?: boolean }) {
  const s = useMinhaSituacao();
  const sessao = useSessaoPassageiro();
  const destinos = useDestinos();
  const aceitos = useAceitos();
  const destinoPedido = !aceitos[sessao.pedidoId ?? ""] && destinos.find((d) => d.id === sPedido(sessao.pedidoId));
  // "Entrar em outro destino": the pedido is gone and was not accepted, so the vanzeiro declined it.
  const recusadoOutro = outro && !!sessao.pedidoId && !aceitos[sessao.pedidoId] && !sPedido(sessao.pedidoId);
  // While asking to join, the header says the step ("Passo 1 de 2 · Seus dados").
  const [passoDoPedido, setPassoDoPedido] = useState<0 | 1 | 2>(0);
  const subtitulo = passoDoPedido === 1 ? "Passo 1 de 2 · Seus dados" : passoDoPedido === 2 ? "Passo 2 de 2 · Onde você embarca" : "Use o código que o vanzeiro te enviou.";
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PassageiroHeader compacto titulo={outro ? "Entrar em outro destino" : "Entrar na van"} subtitulo={subtitulo} />
      <div className="relative z-10 -mt-4 flex min-h-0 flex-1 flex-col space-y-3 overflow-y-auto px-5 pb-4">
        {!outro && <EmAbertoDeQuemSaiu />}
        {outro && destinoPedido ? <Aguardando destinoId={destinoPedido.id} /> : recusadoOutro ? <Recusado /> : s.tipo === "aguardando" ? <Aguardando destinoId={s.destinoId} /> : s.tipo === "recusado" ? <Recusado /> : <Codigo primeiroUso={!outro} aoMudarPasso={setPassoDoPedido} />}
        {passoDoPedido === 2 ? null : outro ? (
          <Link to="/passageiro/perfil" className="mx-auto flex h-11 w-fit items-center gap-2 px-4 text-sm font-semibold text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar ao perfil
          </Link>
        ) : (
          <ConfirmarSair>
            <button type="button" className="mx-auto flex h-11 w-fit items-center gap-2 px-4 text-sm font-semibold text-muted-foreground">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </ConfirmarSair>
        )}
      </div>
    </div>
  );
}

function Codigo({ primeiroUso, aoMudarPasso }: { primeiroUso: boolean; aoMudarPasso: (p: 0 | 1 | 2) => void }) {
  const destinos = useDestinos();
  const [codigo, setCodigo] = useState("");
  const [achado, setAchado] = useState<DestinoDoConvite | null | undefined>(undefined);
  const [procurando, setProcurando] = useState(false);

  const procurar = async () => {
    setProcurando(true);
    await fazer(async () => {
      try {
        setAchado(await procurarPorCodigo(codigo, destinos));
        return { ok: true };
      } catch {
        return { ok: false, motivo: "Não deu para procurar a van. Confira o sinal e tente de novo." };
      } finally {
        setProcurando(false);
      }
    });
  };

  if (achado) return <Confirmar destino={achado} voltar={() => setAchado(undefined)} aoMudarPasso={aoMudarPasso} />;

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
          void procurar();
        }}
      >
        <Input
          aria-label="Código de convite"
          placeholder="Ex.: VAN-4821"
          value={codigo}
          disabled={procurando}
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
        <Button type="submit" variant="cta" size="xl" className="w-full" disabled={!codigo.trim() || procurando}>
          <Search className="!h-5 !w-5" /> Procurar van
        </Button>
      </form>
    </section>
    {primeiroUso && <OndeConseguir />}
    </>
  );
}

/** Decision A3: left the last destino but still owes there. */
function EmAbertoDeQuemSaiu() {
  const emAberto = useEmAbertoDeQuemSaiu();
  if (!emAberto) return null;
  return (
    <Link to="/passageiro/pagamentos" className="block">
      <InfoCard
        icon={Wallet}
        tone="warning"
        label="Em aberto"
        value={formatarReais(emAberto.total)}
        detail="De destino que você saiu. Toque para ver e pagar."
        aside={<BadgeSituacao s={emAberto.devendo ? "devendo" : "pendente"} />}
      />
    </Link>
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

function CardDaVan({ destino }: { destino: DestinoDoConvite | Destino }) {
  const agenda = "vanzeiroId" in destino ? destino : destino.agenda;
  const vanzeiro = usePerfilDoVanzeiro(agenda?.vanzeiroId ?? "");
  const nome = "vanzeiroNome" in destino ? destino.vanzeiroNome : undefined;
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-surface p-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success">
        <VanIcon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vanzeiro</p>
        <p className="font-display text-lg font-bold leading-tight text-foreground">{nome ?? vanzeiro.nome}</p>
        <p className="mt-1 font-semibold text-foreground">{nomeDestino(destino)}</p>
        <p className="text-sm text-muted-foreground">
          {agenda ? `${quandoAcontece(agenda)} · ` : ""}saída {destino.saida}
        </p>
      </div>
    </div>
  );
}

function Confirmar({ destino, voltar, aoMudarPasso }: { destino: DestinoDoConvite; voltar: () => void; aoMudarPasso: (p: 0 | 1 | 2) => void }) {
  const sessao = useSessaoPassageiro();
  const [nome, setNome] = useState(sessao.nome);
  const [telefone, setTelefone] = useState(sessao.telefone ? formatarTelefone(sessao.telefone) : "");
  const situacao = useMinhaSituacao();
  const passageiros = usePassageiros();
  const ja = situacao.tipo === "membro" && matriculasDaPessoa(passageiros, situacao.passageiro).some((p) => p.destinoId === destino.id);
  const [passo, setPasso] = useState(1);
  const [embarque, setEmbarque] = useState<Embarque>({ cidade: "", endereco: "", ponto: null });
  const pode = !ja && nome.trim() !== "" && telefoneValido(telefone);
  useEffect(() => {
    aoMudarPasso(passo === 2 ? 2 : 1);
  }, [passo, aoMudarPasso]);
  useEffect(() => () => aoMudarPasso(0), [aoMudarPasso]);

  if (passo === 2) {
    return (
      <section className="flex flex-1 flex-col gap-3 rounded-3xl bg-card p-4 shadow-card [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:p-3">
        <OndeEmbarco destino={destino} valor={embarque} mudar={(m) => setEmbarque((e) => ({ ...e, ...m }))} mapaFlexivel />
        <div className="grid shrink-0 grid-cols-2 gap-3">
          <Button size="lg" variant="outline" onClick={() => setPasso(1)}>
            <ArrowLeft className="!h-5 !w-5" /> Voltar
          </Button>
          <Button
            size="lg"
            variant="cta"
            disabled={!pode || !embarqueCompleto(destino, embarque)}
            onClick={() => void fazer(() => (USA_BANCO.destinos ? pedirParaEntrarNoBanco(destino.convite, nome, telefone, embarque) : pedirParaEntrar(destino.id, nome, somenteDigitos(telefone), embarque)))}
          >
            Pedir para entrar
          </Button>
        </div>
      </section>
    );
  }

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
      <Button variant="cta" size="xl" className="w-full" disabled={!pode} onClick={() => setPasso(2)}>
        Continuar <ArrowRight className="!h-5 !w-5" />
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
