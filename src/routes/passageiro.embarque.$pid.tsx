import { useState } from "react";
import { createFileRoute, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { Check, Clock } from "lucide-react";
import { OndeEmbarco } from "@/components/app/passageiro/OndeEmbarco";
import { PassageiroHeader } from "@/components/app/passageiro/PassageiroHeader";
import { Button } from "@/components/ui/button";
import { nomeDestino } from "@/lib/destinos";
import { useDestinos } from "@/lib/destinos-store";
import { LIMITE_MUDANCA_KM, avaliarMudanca, embarqueCompleto, textoDaDistancia, type Embarque } from "@/lib/endereco";
import { mudarMeuEmbarque, useMudancasAguardando } from "@/lib/passageiros-store";
import { useMinhasMatriculas } from "@/lib/sessao-passageiro";
import { BotaoVoltar } from "@/components/app/PilulaDoCabecalho";
import { fazer } from "@/lib/acoes";

export const Route = createFileRoute("/passageiro/embarque/$pid")({
  head: () => ({
    meta: [
      { title: "Onde você embarca — O Vanzeiro" },
      { name: "description", content: "Mude o endereço e o ponto onde você espera a van." },
    ],
  }),
  component: OndeVoceEmbarca,
});

function OndeVoceEmbarca() {
  const { pid } = Route.useParams();
  const eu = useMinhasMatriculas().find((p) => p.id === pid);
  const destino = useDestinos().find((d) => d.id === eu?.destinoId);
  const aguardando = useMudancasAguardando().find((m) => m.matriculaId === pid);
  const [valor, setValor] = useState<Embarque>(() => ({ cidade: eu?.cidade ?? "", endereco: eu?.endereco ?? "", ponto: eu?.ponto ?? null }));
  const [enviado, setEnviado] = useState(false);
  const router = useRouter();
  const podeVoltar = useCanGoBack();
  const navigate = useNavigate();
  const voltar = () => (podeVoltar ? router.history.back() : navigate({ to: "/passageiro/perfil" }));

  const cabecalho = (
    <PassageiroHeader compacto titulo="Onde você embarca" subtitulo={destino ? nomeDestino(destino) : "Sua van."}>
      <BotaoVoltar senao="/passageiro/perfil" />
    </PassageiroHeader>
  );

  if (!eu || !destino) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {cabecalho}
        <p className="px-5 pt-6 text-center text-muted-foreground">Destino não encontrado.</p>
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {cabecalho}
        <section className="mx-5 mt-4 space-y-3 rounded-3xl bg-card p-4 text-center shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-warning-soft text-warning">
            <Clock className="h-7 w-7" />
          </div>
          <p className="font-display text-xl font-bold text-foreground">Mudança enviada ao vanzeiro</p>
          <p className="text-sm text-muted-foreground">Até ele aceitar, a van continua passando em: {eu.endereco}.</p>
          <Button size="lg" variant="cta" className="w-full" onClick={voltar}>
            Voltar
          </Button>
        </section>
      </div>
    );
  }

  const { distanciaKm, precisaAprovar } = avaliarMudanca(eu, valor);
  const mudou = valor.cidade !== eu.cidade || valor.endereco.trim() !== eu.endereco || valor.ponto?.lat !== eu.ponto?.lat || valor.ponto?.lng !== eu.ponto?.lng;
  const pode = mudou && embarqueCompleto(destino, valor);

  const salvar = async () => {
    const r = await fazer(() => mudarMeuEmbarque(eu.id, valor));
    if (!r.ok) return;
    if ("situacao" in r && r.situacao === "aguardando") setEnviado(true);
    else voltar();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {cabecalho}
      <div className="relative z-10 -mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-2">
        <section className="flex min-h-0 flex-1 flex-col gap-3 rounded-3xl bg-card p-4 shadow-card [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:p-3 [@media(max-height:700px)]:pb-2">
          {aguardando && (
            <p className="rounded-2xl bg-warning-soft px-3.5 py-2 text-sm font-semibold text-warning" role="status">
              Aguardando o vanzeiro aceitar: {aguardando.para.endereco}. Até lá, vale o endereço de agora.
            </p>
          )}
          <OndeEmbarco
            destino={destino}
            valor={valor}
            mudar={(m) => setValor((v) => ({ ...v, ...m }))}
            mapaFlexivel
            avisoDoMapa={
              mudou && precisaAprovar
                ? `${distanciaKm !== null ? `A ${textoDaDistancia(distanciaKm)} do ponto combinado` : "Outra cidade"} (mais de ${LIMITE_MUDANCA_KM} km): o vanzeiro precisa aceitar.`
                : undefined
            }
          />
        </section>
      </div>
      <div className="shrink-0 px-5 pb-3 pt-2">
        <Button size="lg" variant="cta" className="w-full" disabled={!pode} onClick={salvar}>
          <Check className="!h-5 !w-5" /> {precisaAprovar ? "Enviar ao vanzeiro" : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
