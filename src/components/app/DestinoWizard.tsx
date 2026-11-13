import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Clock,
  Flag,
  MapPin,
  Plus,
  Repeat,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { CampoComIcone } from "@/components/app/CampoComIcone";
import { CaminhoParadas, PontoDoCaminho } from "@/components/app/CaminhoParadas";
import { PassosLayout } from "@/components/app/PassosLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Destino } from "@/data/exemplo";
import {
  DIAS_DA_SEMANA,
  PRAZOS,
  PRAZO_TEXTO,
  TIPO_ROTULO,
  caminhoCompleto,
  destinoDeRascunho,
  moverItem,
  nomeDestino,
  passoCompleto,
  quandoAcontece,
  rascunhoDeDestino,
  rascunhoVazio,
  type Rascunho,
} from "@/lib/destinos";
import { salvarDestino } from "@/lib/destinos-store";
import { cn } from "@/lib/utils";
export { Rotulo, ItemResumo };

const PERGUNTAS = [
  "De onde sai e para onde vai?",
  "Quando e em que horário?",
  "Por onde a van passa?",
  "Confira antes de salvar.",
];

export function DestinoWizard({ inicial }: { inicial?: Destino }) {
  const navigate = useNavigate();
  const [passo, setPasso] = useState(1);
  const [r, setR] = useState<Rascunho>(() => (inicial ? rascunhoDeDestino(inicial) : rascunhoVazio()));
  const mudar = (parcial: Partial<Rascunho>) => setR((atual) => ({ ...atual, ...parcial }));

  const sair = () =>
    inicial
      ? navigate({ to: "/vanzeiro/destinos/$id", params: { id: inicial.id } })
      : navigate({ to: "/vanzeiro/destinos" });

  const salvar = () => {
    const d = destinoDeRascunho(r, inicial);
    salvarDestino(d);
    if (inicial) navigate({ to: "/vanzeiro/destinos/$id", params: { id: d.id } });
    else navigate({ to: "/vanzeiro/destinos" });
  };

  return (
    <PassosLayout
      titulo={inicial ? "Editar destino" : "Novo destino"}
      subtitulo={PERGUNTAS[passo - 1] ?? ""}
      passo={passo}
      podeContinuar={passoCompleto(passo, r)}
      onVoltar={() => (passo === 1 ? sair() : setPasso(passo - 1))}
      onContinuar={() => setPasso(passo + 1)}
      onSalvar={salvar}
      rotuloSalvar="Salvar destino"
    >
      {passo === 1 && <Passo1 r={r} mudar={mudar} />}
      {passo === 2 && <Passo2 r={r} mudar={mudar} />}
      {passo === 3 && <Passo3 r={r} mudar={mudar} />}
      {passo === 4 && <Resumo r={r} />}
    </PassosLayout>
  );
}

type PassoProps = { r: Rascunho; mudar: (p: Partial<Rascunho>) => void };

function Rotulo({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-sm font-semibold text-foreground">{children}</p>;
}

function Passo1({ r, mudar }: PassoProps) {
  return (
    <>
      <CampoComIcone
        id="origem"
        label="De onde sai?"
        icon={MapPin}
        placeholder="Ex.: Jacarezinho"
        value={r.origem}
        onChange={(e) => mudar({ origem: e.target.value })}
      />
      <CampoComIcone
        id="destino"
        label="Para onde vai?"
        icon={Flag}
        placeholder="Ex.: Londrina"
        value={r.destino}
        onChange={(e) => mudar({ destino: e.target.value })}
      />
      <div>
        <Rotulo>Que tipo de destino?</Rotulo>
        <div className="grid grid-cols-2 gap-3">
          <OpcaoTipo
            icon={Repeat}
            titulo="Rota fixa"
            texto="Repete toda semana"
            ativo={r.tipo === "fixa"}
            onClick={() => mudar({ tipo: "fixa" })}
          />
          <OpcaoTipo
            icon={CalendarDays}
            titulo="Viagem avulsa"
            texto="Uma data só"
            ativo={r.tipo === "avulsa"}
            onClick={() => mudar({ tipo: "avulsa" })}
          />
        </div>
      </div>
    </>
  );
}

function OpcaoTipo({
  icon: Icon,
  titulo,
  texto,
  ativo,
  onClick,
}: {
  icon: LucideIcon;
  titulo: string;
  texto: string;
  ativo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        "flex flex-col items-start gap-2 rounded-2xl border-2 p-3 text-left transition-colors",
        ativo ? "border-primary bg-primary-soft" : "border-border bg-surface",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          ativo ? "bg-primary text-primary-foreground" : "bg-card text-primary",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block font-display text-[0.95rem] font-bold text-foreground">{titulo}</span>
        <span className="block text-xs text-muted-foreground">{texto}</span>
      </span>
    </button>
  );
}

function Passo2({ r, mudar }: PassoProps) {
  const alternarDia = (id: (typeof DIAS_DA_SEMANA)[number]["id"]) =>
    mudar({ dias: r.dias.includes(id) ? r.dias.filter((d) => d !== id) : [...r.dias, id] });

  return (
    <>
      {r.tipo === "fixa" ? (
        <div>
          <Rotulo>Quais dias? Toque para escolher.</Rotulo>
          <div className="grid grid-cols-7 gap-1.5">
            {DIAS_DA_SEMANA.map((d) => {
              const ativo = r.dias.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => alternarDia(d.id)}
                  aria-pressed={ativo}
                  className={cn(
                    "h-12 rounded-xl text-[0.8rem] font-bold transition-colors",
                    ativo ? "bg-primary text-primary-foreground" : "border border-border bg-surface text-foreground",
                  )}
                >
                  {d.curto}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <CampoComIcone
          id="data"
          label="Qual a data?"
          icon={CalendarDays}
          type="date"
          value={r.data}
          onChange={(e) => mudar({ data: e.target.value })}
        />
      )}
      <div>
        <Rotulo>Tem volta?</Rotulo>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            size="lg"
            variant={r.temVolta === true ? "default" : "outline"}
            aria-pressed={r.temVolta === true}
            onClick={() => mudar({ temVolta: true })}
          >
            Sim
          </Button>
          <Button
            type="button"
            size="lg"
            variant={r.temVolta === false ? "default" : "outline"}
            aria-pressed={r.temVolta === false}
            onClick={() => mudar({ temVolta: false })}
          >
            Não
          </Button>
        </div>
      </div>
      {/* Side by side when there is a volta, so the step still fits without scrolling. */}
      <div className={cn("grid gap-3", r.temVolta && "grid-cols-2")}>
        <CampoComIcone
          id="saida"
          label={r.temVolta ? "Saída da ida" : "Horário de saída da ida"}
          icon={Clock}
          type="time"
          value={r.saida}
          onChange={(e) => mudar({ saida: e.target.value })}
        />
        {r.temVolta && (
          <CampoComIcone
            id="volta"
            label="Horário da volta"
            icon={Clock}
            type="time"
            value={r.volta}
            onChange={(e) => mudar({ volta: e.target.value })}
          />
        )}
      </div>
      <div>
        <Rotulo>Confirmar até</Rotulo>
        <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Confirmar até">
          {PRAZOS.map((p) => {
            const ativo = r.prazo === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => mudar({ prazo: p.id })}
                aria-pressed={ativo}
                aria-label={p.texto}
                className={cn(
                  "h-11 rounded-xl px-1 text-[0.72rem] font-bold leading-tight transition-colors",
                  ativo ? "bg-primary text-primary-foreground" : "border border-border bg-surface text-foreground",
                )}
              >
                {p.curto}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Passo3({ r, mudar }: PassoProps) {
  const [nova, setNova] = useState("");
  const total = r.paradas.length + 2;
  const adicionar = () => {
    if (!nova.trim()) return;
    mudar({ paradas: [...r.paradas, nova.trim()] });
    setNova("");
  };

  return (
    <>
      <p className="text-sm text-muted-foreground">Coloque as cidades ou paradas na ordem do caminho.</p>
      <ol>
        <PontoDoCaminho nome={r.origem} indice={0} total={total} />
        {r.paradas.map((p, i) => (
          <PontoDoCaminho
            key={`${i}-${p}`}
            nome={p}
            indice={i + 1}
            total={total}
            acoes={
              <>
                <BotaoIcone
                  rotulo={`Subir ${p}`}
                  icon={ArrowUp}
                  disabled={i === 0}
                  onClick={() => mudar({ paradas: moverItem(r.paradas, i, i - 1) })}
                />
                <BotaoIcone
                  rotulo={`Descer ${p}`}
                  icon={ArrowDown}
                  disabled={i === r.paradas.length - 1}
                  onClick={() => mudar({ paradas: moverItem(r.paradas, i, i + 1) })}
                />
                <BotaoIcone
                  rotulo={`Remover ${p}`}
                  icon={Trash2}
                  perigo
                  onClick={() => mudar({ paradas: r.paradas.filter((_, j) => j !== i) })}
                />
              </>
            }
          />
        ))}
        <PontoDoCaminho nome={r.destino} indice={total - 1} total={total} />
      </ol>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          adicionar();
        }}
      >
        <Input
          aria-label="Nova parada"
          placeholder="Nova parada"
          value={nova}
          onChange={(e) => setNova(e.target.value)}
          className="h-12 flex-1 rounded-xl border-input bg-surface text-base shadow-none md:text-base"
        />
        <Button type="submit" size="lg" variant="default" disabled={!nova.trim()}>
          <Plus className="!h-5 !w-5" /> Adicionar
        </Button>
      </form>
    </>
  );
}

function BotaoIcone({
  rotulo,
  icon: Icon,
  onClick,
  disabled,
  perigo,
}: {
  rotulo: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  perigo?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl transition-colors disabled:opacity-30",
        perigo ? "bg-destructive-soft text-destructive" : "bg-surface text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function Resumo({ r }: { r: Rascunho }) {
  const d = destinoDeRascunho(r);
  return (
    <>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{TIPO_ROTULO[d.tipo]}</p>
        <p className="mt-0.5 font-display text-lg font-bold leading-snug text-foreground">{nomeDestino(d)}</p>
      </div>
      <dl className="grid grid-cols-3 gap-2 text-center">
        <ItemResumo rotulo={d.tipo === "fixa" ? "Dias" : "Data"} valor={quandoAcontece(d)} />
        <ItemResumo rotulo="Ida" valor={d.saida} />
        <ItemResumo rotulo="Volta" valor={d.volta ?? "Sem volta"} />
      </dl>
      <p className="rounded-2xl bg-surface px-3 py-2 text-sm text-foreground">
        <span className="text-muted-foreground">Confirmar até: </span>
        <span className="font-bold">{PRAZO_TEXTO[d.prazo]}</span>
      </p>
      <CaminhoParadas pontos={caminhoCompleto(d)} />
    </>
  );
}

function ItemResumo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-2xl bg-surface px-2 py-2">
      <dt className="text-[0.7rem] font-semibold text-muted-foreground">{rotulo}</dt>
      <dd className="mt-0.5 text-sm font-bold leading-tight text-foreground">{valor}</dd>
    </div>
  );
}
