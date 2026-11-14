import { Link, createFileRoute } from "@tanstack/react-router";
import { PassageiroHeader } from "@/components/app/passageiro/PassageiroHeader";
import { TelaVazia } from "@/components/app/TelaVazia";
import { Bell, Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { diaMes } from "@/lib/cobrancas";
import { cn } from "@/lib/utils";
import { useAvisosNaoLidos } from "@/lib/avisos-store";
import { identidadePassageiro } from "@/lib/passageiros";
import { useMinhaSituacao } from "@/lib/sessao-passageiro";

const tipoAviso: Record<string, { label: string; cor: string }> = {
  prazo_chegando: { label: "Prazo chegando", cor: "text-warning" },
  van_saiu: { label: "Van saiu", cor: "text-primary" },
  cobranca_vencendo: { label: "Cobrança vencendo", cor: "text-warning" },
};

export const Route = createFileRoute("/passageiro/notificacoes")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Notificações — O Vanzeiro" },
      { name: "description", content: "Seus avisos." },
      { property: "og:title", content: "Notificações — O Vanzeiro" },
      { property: "og:description", content: "Seus avisos." },
    ],
  }),
  component: PaginaNotificacoes,
});

function PaginaNotificacoes() {
  const s = useMinhaSituacao();
  const meuId = s.tipo === "membro" ? identidadePassageiro(s.passageiro) : "";
  const avisos = useAvisosNaoLidos(meuId);
  const noAvisos = avisos.length === 0;

  return (
    <>
      <PassageiroHeader compacto titulo="Notificações" subtitulo="Seus avisos." />
      <div className="relative z-10 -mt-4 space-y-3 px-5 pb-4">
        {noAvisos ? (
          <TelaVazia
            icon={Bell}
            titulo="Nenhuma notificação"
            texto="Quando houver avisos, aparecerão aqui."
            botao={
              <Link to="/passageiro/viagens" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                <Compass className="!h-5 !w-5" /> Minhas viagens
              </Link>
            }
          />
        ) : (
          <section className="rounded-3xl bg-card p-4 shadow-card">
            {avisos.map((aviso) => (
              <div key={aviso.id} className="border-b border-border px-4 py-3 last:border-b-0">
                <p className={`text-xs font-semibold uppercase tracking-wider ${tipoAviso[aviso.tipo]?.cor || "text-muted-foreground"}`}>
                  {tipoAviso[aviso.tipo]?.label || aviso.tipo}
                </p>
                <p className="mt-1 font-semibold text-foreground">{aviso.textoResumido}</p>
                <p className="text-xs text-muted-foreground">{diaMes(aviso.dataCriacao)}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </>
  );
}
