import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CalendarDays, CalendarRange, MapPin, Phone, Sun, Ticket, User, Wallet, type LucideIcon } from "lucide-react";
import { CampoComIcone } from "@/components/app/CampoComIcone";
import { ItemResumo, Rotulo } from "@/components/app/DestinoWizard";
import { PassosLayout } from "@/components/app/PassosLayout";
import { type Destino, type Passageiro, type PedidoEntrada, type PlanoPagamento } from "@/data/exemplo";
import { formatarReais } from "@/lib/dinheiro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nomeDestino } from "@/lib/destinos";
import {
  PLANOS,
  descricaoPlano,
  formatarTelefone,
  passageiroDeRascunho,
  passoPassageiroCompleto,
  planoTemVencimento,
  pontosDeEmbarque,
  pessoasParaDestino,
  rascunhoDePassageiro,
  rascunhoPassageiroVazio,
  type RascunhoPassageiro,
} from "@/lib/passageiros";
import { salvarPassageiro, usePassageiros } from "@/lib/passageiros-store";
import { cn } from "@/lib/utils";

const PERGUNTAS = ["Nome e WhatsApp.", "Onde a pessoa embarca?", "Como a pessoa paga?", "Confira antes de salvar."];

const ICONE_PLANO: Record<PlanoPagamento, LucideIcon> = {
  viagem: Ticket,
  diario: Sun,
  quinzenal: CalendarRange,
  mensal: CalendarDays,
};

export function PassageiroWizard({
  destino,
  inicial,
  pedido,
}: {
  destino: Destino;
  inicial?: Passageiro;
  /** Accepted join request: name and phone come prefilled. */
  pedido?: PedidoEntrada | undefined;
}) {
  const navigate = useNavigate();
  const pontos = pontosDeEmbarque(destino);
  const pessoas = pessoasParaDestino(usePassageiros(), destino.id);
  const [modo, setModo] = useState<"novo" | "existente">("novo");
  const [passo, setPasso] = useState(1);
  const [r, setR] = useState<RascunhoPassageiro>(() =>
    inicial ? rascunhoDePassageiro(inicial) : rascunhoPassageiroVazio(pedido),
  );
  const mudar = (parcial: Partial<RascunhoPassageiro>) => setR((atual) => ({ ...atual, ...parcial }));

  const irParaDestino = () => navigate({ to: "/vanzeiro/destinos/$id", params: { id: destino.id } });
  const irParaPassageiro = (pid: string) =>
    navigate({ to: "/vanzeiro/destinos/$id/passageiros/$pid", params: { id: destino.id, pid } });

  const sair = () => (inicial ? irParaPassageiro(inicial.id) : irParaDestino());

  const salvar = () => {
    const p = passageiroDeRascunho(r, destino.id, inicial);
    salvarPassageiro(p, pedido?.id);
    if (inicial) irParaPassageiro(p.id);
    else irParaDestino();
  };

  return (
    <PassosLayout
      titulo={inicial ? "Editar passageiro" : "Novo passageiro"}
      subtitulo={PERGUNTAS[passo - 1] ?? ""}
      passo={passo}
      podeContinuar={passoPassageiroCompleto(passo, r, pontos) && (passo !== 1 || modo === "novo" || !!r.pessoaId)}
      onVoltar={() => (passo === 1 ? sair() : setPasso(passo - 1))}
      onContinuar={() => setPasso(passo + 1)}
      onSalvar={salvar}
      rotuloSalvar="Salvar passageiro"
    >
      {passo === 1 && (
        <>
          {!inicial && !pedido && <div className="grid grid-cols-2 gap-2">
            <Button variant={modo === "novo" ? "default" : "outline"} className="h-11 whitespace-normal text-xs" aria-pressed={modo === "novo"} onClick={() => { setModo("novo"); mudar({ nome: "", telefone: "", pessoaId: undefined }); }}>Passageiro novo</Button>
            <Button variant={modo === "existente" ? "default" : "outline"} className="h-11 whitespace-normal text-xs" aria-pressed={modo === "existente"} onClick={() => { setModo("existente"); mudar({ nome: "", telefone: "", pessoaId: undefined }); }}>Já é meu passageiro</Button>
          </div>}
          {modo === "existente" && <div className="space-y-1.5">
            <label htmlFor="pessoa-existente" className="text-sm font-semibold text-foreground">Escolha o passageiro</label>
            <select id="pessoa-existente" className="h-11 w-full rounded-xl border border-input bg-surface px-3 text-sm text-foreground" value={r.pessoaId ?? ""} onChange={(e) => {
              const p = pessoas.find((p) => (p.pessoaId ?? p.id) === e.target.value);
              if (p) mudar({ pessoaId: p.pessoaId ?? p.id, nome: p.nome, telefone: formatarTelefone(p.telefone) });
            }}>
              <option value="">Selecionar</option>
              {pessoas.map((p) => <option key={p.id} value={p.pessoaId ?? p.id}>{p.nome}</option>)}
            </select>
          </div>}
          <Passo1 r={r} mudar={mudar} readonly={modo === "existente"} />
        </>
      )}
      {passo === 2 && <Passo2 r={r} mudar={mudar} pontos={pontos} />}
      {passo === 3 && <Passo3 r={r} mudar={mudar} />}
      {passo === 4 && <Resumo r={r} destino={destino} />}
    </PassosLayout>
  );
}

type PassoProps = { r: RascunhoPassageiro; mudar: (p: Partial<RascunhoPassageiro>) => void };

function Passo1({ r, mudar, readonly }: PassoProps & { readonly?: boolean }) {
  return (
    <>
      <CampoComIcone
        id="nome"
        label="Nome do passageiro"
        icon={User}
        placeholder="Ex.: Mariana Souza"
        autoComplete="off"
        value={r.nome}
        readOnly={readonly}
        onChange={(e) => mudar({ nome: e.target.value })}
      />
      <div className="space-y-1.5">
        <CampoComIcone
          id="telefone"
          label="Telefone (WhatsApp)"
          icon={Phone}
          type="tel"
          inputMode="numeric"
          placeholder="(43) 99812-3456"
          value={r.telefone}
          readOnly={readonly}
          onChange={(e) => mudar({ telefone: formatarTelefone(e.target.value) })}
        />
        <p className="text-xs text-muted-foreground">Com DDD.</p>
      </div>
    </>
  );
}

function Passo2({ r, mudar, pontos }: PassoProps & { pontos: string[] }) {
  return (
    <>
      <div>
        <Rotulo>Em qual cidade embarca?</Rotulo>
        <div className="grid grid-cols-2 gap-2">
          {pontos.map((p) => {
            const ativo = r.cidade === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => mudar({ cidade: p })}
                aria-pressed={ativo}
                className={cn(
                  "flex min-h-12 items-center gap-2 rounded-2xl border-2 px-3 py-2 text-left text-sm font-semibold leading-tight transition-colors",
                  ativo ? "border-primary bg-primary-soft text-foreground" : "border-border bg-surface text-foreground",
                )}
              >
                <MapPin className={cn("h-4 w-4 shrink-0", ativo ? "text-primary" : "text-muted-foreground")} />
                <span className="break-words">{p}</span>
              </button>
            );
          })}
        </div>
      </div>
      <CampoComIcone
        id="endereco"
        label="Endereço ou ponto de embarque"
        icon={MapPin}
        placeholder="Ex.: Rua Paraná, 455"
        autoComplete="off"
        value={r.endereco}
        onChange={(e) => mudar({ endereco: e.target.value })}
      />
    </>
  );
}

function Passo3({ r, mudar }: PassoProps) {
  const plano = PLANOS.find((p) => p.id === r.plano);
  const comVencimento = planoTemVencimento(r.plano);
  return (
    <div className="space-y-3 [@media(max-height:700px)]:space-y-1 [&_input]:[@media(max-height:700px)]:h-10">
      <div>
        <Rotulo>Qual o plano de pagamento?</Rotulo>
        <div className="grid grid-cols-2 gap-1">
          {PLANOS.map((p) => {
            const ativo = r.plano === p.id;
            const Icon = ICONE_PLANO[p.id];
            return (
              <Button
                key={p.id}
                type="button"
                variant="outline"
                onClick={() => mudar({ plano: p.id })}
                aria-pressed={ativo}
                className={cn(
                  "h-auto w-full gap-0 whitespace-normal flex flex-col items-start rounded-2xl border-2 px-2.5 py-2 text-left transition-colors [@media(max-height:700px)]:py-0.5",
                  ativo ? "border-primary bg-primary-soft" : "border-border bg-surface",
                )}
              >
                <span className="flex items-center gap-1.5 font-display text-[0.95rem] font-bold text-foreground">
                  <Icon className={cn("h-4 w-4", ativo ? "text-primary" : "text-muted-foreground")} />
                  {p.rotulo}
                </span>
                <span className="mt-0.5 whitespace-normal text-xs leading-tight text-muted-foreground">{p.texto}</span>
              </Button>
            );
          })}
        </div>
      </div>
      {plano && (
        <div className={cn("grid gap-3 [&_input]:h-11", comVencimento ? "grid-cols-2" : "grid-cols-1")}>
          <CampoComIcone
            id="valor"
            label={plano.rotuloValor}
            icon={Wallet}
            inputMode="decimal"
            placeholder="Ex.: 280,00"
            value={r.valor}
            onChange={(e) => mudar({ valor: e.target.value.replace(/[^\d.,]/g, "") })}
          />
          {comVencimento && (
            <CampoComIcone
              id="vencimento"
              label="Dia do vencimento"
              icon={CalendarDays}
              inputMode="numeric"
              placeholder="Ex.: 10"
              value={r.vencimento}
              onChange={(e) => mudar({ vencimento: e.target.value.replace(/\D/g, "").slice(0, 2) })}
            />
          )}
        </div>
      )}
      {comVencimento && (
        <div className="space-y-1">
        <div className="flex items-center gap-3">
          <p className="flex-1 text-sm font-semibold text-foreground">Descontar faltas?</p>
          <div className="grid w-40 shrink-0 grid-cols-2 gap-2">
            <Button
              type="button"
              variant={!r.descontaFaltas ? "default" : "outline"}
              aria-pressed={!r.descontaFaltas}
              onClick={() => mudar({ descontaFaltas: false })}
            >
              Não
            </Button>
            <Button
              type="button"
              variant={r.descontaFaltas ? "default" : "outline"}
              aria-pressed={r.descontaFaltas}
              onClick={() => mudar({ descontaFaltas: true })}
            >
              Sim
            </Button>
          </div>
        </div>
        <p className="text-xs leading-snug text-muted-foreground">Só desconta quem avisar 'Não vou' dentro do prazo.</p>
        </div>
      )}
      {comVencimento && r.descontaFaltas && (
        <div className="flex items-center gap-3">
          <label htmlFor="valor-falta" className="flex-1 text-sm font-semibold text-foreground">
            Valor de cada falta
          </label>
          <div className="relative w-40 shrink-0">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
              R$
            </span>
            <Input
              id="valor-falta"
              inputMode="decimal"
              placeholder="15,00"
              value={r.valorFalta}
              onChange={(e) => mudar({ valorFalta: e.target.value.replace(/[^\d.,]/g, "") })}
              className="h-11 rounded-xl border-input bg-surface pl-10 text-base shadow-none focus-visible:bg-card md:text-base"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Resumo({ r, destino }: { r: RascunhoPassageiro; destino: Destino }) {
  const p = passageiroDeRascunho(r, destino.id);
  return (
    <>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{nomeDestino(destino)}</p>
        <p className="mt-0.5 font-display text-lg font-bold leading-snug text-foreground">{p.nome}</p>
        <p className="text-sm text-muted-foreground">{formatarTelefone(p.telefone)}</p>
      </div>
      <div className="rounded-2xl bg-surface px-3.5 py-2.5">
        <p className="text-[0.7rem] font-semibold text-muted-foreground">Embarca em</p>
        <p className="font-bold leading-snug text-foreground">{p.cidade}</p>
        <p className="break-words text-sm text-foreground">{p.endereco}</p>
      </div>
      <dl className={cn("grid gap-2 text-center", p.vencimento ? "grid-cols-2" : "grid-cols-1")}>
        <ItemResumo rotulo="Plano" valor={descricaoPlano(p)} />
        {p.vencimento && <ItemResumo rotulo="Vencimento" valor={`Todo dia ${p.vencimento}`} />}
      </dl>
      {planoTemVencimento(p.plano) && (
        <p className="rounded-2xl bg-surface px-3.5 py-2 text-sm text-foreground">
          {p.descontaFaltas && p.valorFalta
            ? `Desconta faltas: ${formatarReais(p.valorFalta)} por falta`
            : "Não desconta faltas"}
        </p>
      )}
    </>
  );
}
