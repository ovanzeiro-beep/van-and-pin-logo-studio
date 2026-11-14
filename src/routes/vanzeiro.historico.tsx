import { createFileRoute, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";
import { TelaVazia } from "@/components/app/TelaVazia";
import { ArrowLeft, History } from "lucide-react";
import { formatarData } from "@/lib/destinos";
import { nomeDestino } from "@/lib/destinos";
import { useViagensEncerradasComDetalhes } from "@/lib/viagens-encerradas-store";

export const Route = createFileRoute("/vanzeiro/historico")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Histórico — O Vanzeiro" },
      { name: "description", content: "Suas viagens feitas." },
      { property: "og:title", content: "Histórico — O Vanzeiro" },
      { property: "og:description", content: "Suas viagens feitas." },
    ],
  }),
  component: PaginaHistorico,
});

function PaginaHistorico() {
  const viagens = useViagensEncerradasComDetalhes();
  const noViagens = viagens.length === 0;
  const router = useRouter();
  const podeVoltar = useCanGoBack();
  const navigate = useNavigate();
  const voltar = () => (podeVoltar ? router.history.back() : navigate({ to: "/vanzeiro/viagem" }));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <VanzeiroHeader compacto titulo="Histórico" subtitulo="Suas viagens feitas.">
        <button
          type="button"
          onClick={voltar}
          className="relative mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-header-foreground/10 px-3.5 text-sm font-semibold transition-colors hover:bg-header-foreground/20"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
      </VanzeiroHeader>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-4 pt-4">
        {noViagens ? (
          <TelaVazia
            icon={History}
            titulo="Nenhuma viagem feita"
            texto="Quando você fizer viagens, o histórico aparecerá aqui."
          />
        ) : (
          <section className="space-y-3">
            {viagens.map((v) => (
              <div key={`${v.destinoId}-${v.data}`} className="rounded-3xl bg-card p-4 shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{formatarData(v.data)}</p>
                    <p className="mt-1 font-display text-lg font-bold text-foreground">{v.destino ? nomeDestino(v.destino) : "Destino removido"}</p>
                    {v.destino && (
                      <p className="text-sm text-muted-foreground">
                        Saída {v.destino.saida} · {v.temVolta ? `Volta ${v.destino.volta}` : "Sem volta"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="font-semibold text-success">{v.embarcaram.length}</p>
                    <p className="text-xs text-muted-foreground">Embarcaram</p>
                  </div>
                  {v.naoEstavam.length > 0 && (
                    <div>
                      <p className="font-semibold text-destructive">{v.naoEstavam.length}</p>
                      <p className="text-xs text-muted-foreground">Não estavam</p>
                    </div>
                  )}
                  {v.ficaram.length > 0 && (
                    <div>
                      <p className="font-semibold text-warning">{v.ficaram.length}</p>
                      <p className="text-xs text-muted-foreground">Ficaram</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
