import { MapPin } from "lucide-react";
import { CampoComIcone } from "@/components/app/CampoComIcone";
import { MapaDaVan } from "@/components/app/MapaDaVan";
import type { Destino } from "@/data/exemplo";
import { pontoObrigatorio, type Embarque } from "@/lib/endereco";
import { cidadesNoMapa } from "@/lib/mapa";
import { useCoordenadas, useProcurarCidades } from "@/lib/coordenadas-store";
import { caminhoCompleto } from "@/lib/destinos";
import { pontosDeEmbarque } from "@/lib/passageiros";
import { cn } from "@/lib/utils";

/** The passenger says where they board: city of the route, address and the point on the map. */
export function OndeEmbarco({
  destino,
  valor,
  mudar,
  avisoDoMapa,
  mapaFlexivel = false,
}: {
  destino: Pick<Destino, "origem" | "destino" | "paradas">;
  valor: Embarque;
  mudar: (e: Partial<Embarque>) => void;
  /** Shown in place of the map's title (e.g. the distance warning), so the form does not grow. */
  avisoDoMapa?: string | undefined;
  /** The map takes the space left on the screen (screens that must not scroll), instead of a fixed height. */
  mapaFlexivel?: boolean;
}) {
  useCoordenadas();
  useProcurarCidades(caminhoCompleto(destino));
  const cidades = cidadesNoMapa(destino);
  return (
    <>
      <div>
        <p className="mb-1.5 text-sm font-semibold text-foreground">Em qual cidade você embarca?</p>
        <div className="grid grid-cols-2 gap-2">
          {pontosDeEmbarque(destino).map((p) => {
            const ativo = valor.cidade === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => mudar({ cidade: p })}
                aria-pressed={ativo}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-2xl border-2 px-3 py-2 text-left text-sm font-semibold leading-tight transition-colors [@media(max-height:700px)]:min-h-9 [@media(max-height:700px)]:py-1.5",
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
        id="meu-endereco"
        label="Seu endereço ou ponto de embarque"
        icon={MapPin}
        placeholder="Ex.: Rua Paraná, 455"
        autoComplete="off"
        value={valor.endereco}
        onChange={(e) => mudar({ endereco: e.target.value })}
      />
      {pontoObrigatorio(destino) && (
        <div className={cn(mapaFlexivel && "flex min-h-0 flex-1 flex-col")}>
          <p className={cn("mb-1.5 text-sm font-semibold", avisoDoMapa ? "text-warning" : "text-foreground")} role={avisoDoMapa ? "status" : undefined}>
            {avisoDoMapa ?? (valor.ponto ? "Seu ponto no mapa" : "Toque no mapa onde você espera a van")}
          </p>
          <div className={mapaFlexivel ? "min-h-28 flex-1 [@media(max-height:700px)]:min-h-[5.5rem]" : "h-44 [@media(max-height:700px)]:h-36"}>
            <MapaDaVan cidades={cidades} meuPonto={valor.ponto} van={null} marcando aoMarcar={(ponto) => mudar({ ponto })} />
          </div>
        </div>
      )}
    </>
  );
}
