import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CalendarDays, CalendarRange, MapPin, Phone, Sun, Ticket, User, Wallet, type LucideIcon } from "lucide-react";
import { CampoComIcone } from "@/components/app/CampoComIcone";
import { ItemResumo, Rotulo } from "@/components/app/DestinoWizard";
import { PassosLayout } from "@/components/app/PassosLayout";
import type { Destino, Passageiro, PedidoEntrada, PlanoPagamento } from "@/data/exemplo";
import { nomeDestino } from "@/lib/destinos";
import {
  PLANOS,
  descricaoPlano,
  formatarTelefone,
  passageiroDeRascunho,
  passoPassageiroCompleto,
  planoTemVencimento,
  pontosDeEmbarque,
  rascunhoDePassageiro,
  rascunhoPassageiroVazio,
  type RascunhoPassageiro,
} from "@/lib/passageiros";
import { salvarPassageiro } from "@/lib/passageiros-store";
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
      podeContinuar={passoPassageiroCompleto(passo, r, pontos)}
      onVoltar={() => (passo === 1 ? sair() : setPasso(passo - 1))}
      onContinuar={() => setPasso(passo + 1)}
      onSalvar={salvar}
      rotuloSalvar="Salvar passageiro"
    >
      {passo === 1 && <Passo1 r={r} mudar={mudar} />}
      {passo === 2 && <Passo2 r={r} mudar={mudar} pontos={pontos} />}
      {passo === 3 && <Passo3 r={r} mudar={mudar} />}
      {passo === 4 && <Resumo r={r} destino={destino} />}
    </PassosLayout>
  );
}

type PassoProps = { r: RascunhoPassageiro; mudar: (p: Partial<RascunhoPassageiro>) => void };

function Passo1({ r, mudar }: PassoProps) {
  return (
    <>
      <CampoComIcone
        id="nome"
        label="Nome do passageiro"
        icon={User}
        placeholder="Ex.: Mariana Souza"
        autoComplete="off"
        value={r.nome}
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
    <>
      <div>
        <Rotulo>Qual o plano de pagamento?</Rotulo>
        <div className="grid grid-cols-2 gap-2">
          {PLANOS.map((p) => {
            const ativo = r.plano === p.id;
            const Icon = ICONE_PLANO[p.id];
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => mudar({ plano: p.id })}
                aria-pressed={ativo}
                className={cn(
                  "flex flex-col items-start rounded-2xl border-2 px-3 py-2.5 text-left transition-colors",
                  ativo ? "border-primary bg-primary-soft" : "border-border bg-surface",
                )}
              >
                <span className="flex items-center gap-1.5 font-display text-[0.95rem] font-bold text-foreground">
                  <Icon className={cn("h-4 w-4", ativo ? "text-primary" : "text-muted-foreground")} />
                  {p.rotulo}
                </span>
                <span className="mt-0.5 text-xs text-muted-foreground">{p.texto}</span>
              </button>
            );
          })}
        </div>
      </div>
      {plano && (
        <div className={cn("grid gap-3", comVencimento ? "grid-cols-2" : "grid-cols-1")}>
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
    </>
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
    </>
  );
}
