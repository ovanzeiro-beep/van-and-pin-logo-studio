import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, MessageCircle, Phone, Route as RouteIcon, User } from "lucide-react";
import { LinhaPerfil } from "@/components/app/LinhaPerfil";
import { OpcoesDaConta } from "@/components/app/OpcoesDaConta";
import { PassageiroHeader } from "@/components/app/passageiro/PassageiroHeader";
import { VanIcon } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { nomeDestino } from "@/lib/destinos";
import { useDestinos } from "@/lib/destinos-store";
import { formatarTelefone, linkWhatsApp } from "@/lib/passageiros";
import { useEu, useMinhasMatriculas } from "@/lib/sessao-passageiro";
import { textoDaVan, usePerfilVanzeiro } from "@/lib/vanzeiro-store";

export const Route = createFileRoute("/passageiro/perfil")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Meu perfil — O Vanzeiro" },
      { name: "description", content: "Seus dados, onde você embarca e o contato do seu vanzeiro." },
      { property: "og:title", content: "Meu perfil — O Vanzeiro" },
      { property: "og:description", content: "Seus dados, onde você embarca e o contato do seu vanzeiro." },
    ],
  }),
  component: PerfilPassageiro,
});

function PerfilPassageiro() {
  const eu = useEu();
  const matriculas = useMinhasMatriculas();
  const destinos = useDestinos();
  const vanzeiro = usePerfilVanzeiro();

  return (
    <>
      <PassageiroHeader compacto titulo="Perfil" subtitulo="Seus dados e a sua van." />
      <div className="relative z-10 -mt-4 space-y-3 px-5 pb-4">
        <section className="rounded-3xl bg-card p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Você</p>
          <dl className="mt-2 space-y-2">
            <LinhaPerfil icon={User} rotulo="Nome" valor={eu.nome} />
            <LinhaPerfil icon={Phone} rotulo="Telefone" valor={formatarTelefone(eu.telefone)} />
            {matriculas.map((p) => {
              const d = destinos.find((d) => d.id === p.destinoId);
              return <div key={p.id} className="space-y-2">
                {d && <LinhaPerfil icon={RouteIcon} rotulo="Destino" valor={nomeDestino(d)} />}
                <LinhaPerfil icon={MapPin} rotulo="Onde embarca" valor={`${p.cidade} · ${p.endereco}`} />
              </div>;
            })}
          </dl>
        </section>

        <section className="rounded-3xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-success-soft text-success">
              <VanIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Seu vanzeiro</p>
              <p className="font-display text-lg font-bold leading-tight text-foreground">{vanzeiro.nome}</p>
              <p className="text-sm text-muted-foreground">{textoDaVan(vanzeiro)}</p>
            </div>
          </div>
          <Button asChild size="lg" variant="success" className="mt-3 w-full">
            <a href={linkWhatsApp(vanzeiro.telefone)} target="_blank" rel="noreferrer">
              <MessageCircle className="!h-5 !w-5" /> Chamar no WhatsApp
            </a>
          </Button>
        </section>

        <Button asChild variant="outline" size="lg" className="w-full"><Link to="/passageiro/entrar-destino">Entrar em outro destino</Link></Button>
        <OpcoesDaConta trocarPara="vanzeiro" />
      </div>
    </>
  );
}
