import { useState } from "react";
import { LoaderCircle, LocateFixed, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampoComIcone } from "@/components/app/CampoComIcone";
import { MapaDaVan } from "@/components/app/MapaDaVan";
import type { Destino } from "@/data/exemplo";
import { pontoObrigatorio, type Embarque } from "@/lib/endereco";
import { cidadesNoMapa, type Ponto } from "@/lib/mapa";
import { useCoordenadas, useProcurarCidades } from "@/lib/coordenadas-store";
import { acharEndereco, avisoDeLonge, enderecoDoPonto, minhaLocalizacao } from "@/lib/ponto-de-embarque";
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
  const coordenadas = useCoordenadas();
  useProcurarCidades(caminhoCompleto(destino));
  const cidades = cidadesNoMapa(destino);
  const centro = valor.cidade ? coordenadas[valor.cidade] : undefined;
  // Where the map looks: the pin found by the GPS or the search (or the one already marked), else the chosen city.
  // Tapping the map moves the pin without moving the map.
  const [alvo, setAlvo] = useState<Ponto | null>(valor.ponto);
  const foco = alvo ? { ponto: alvo, zoom: 17 } : centro ? { ponto: centro, zoom: 14 } : null;
  const [ocupado, setOcupado] = useState<"gps" | "busca" | null>(null);
  const [mensagem, setMensagem] = useState<{ texto: string; tom: "aviso" | "ok" } | null>(null);

  const marcar = (ponto: Ponto, extra: Partial<Embarque> = {}) => {
    setAlvo(ponto);
    mudar({ ponto, ...extra });
    const longe = avisoDeLonge(ponto, valor.cidade, centro);
    setMensagem(longe ? { texto: longe, tom: "aviso" } : { texto: "Pronto! Confira o pino. Se precisar, toque no lugar certo.", tom: "ok" });
  };

  const usarGps = async () => {
    setOcupado("gps");
    setMensagem(null);
    const r = await minhaLocalizacao();
    if (!r.ok) {
      setOcupado(null);
      setMensagem({ texto: r.erro, tom: "aviso" });
      return;
    }
    // The street and number fill the address only when it is empty (never erase what the person wrote).
    const rua = valor.endereco.trim() === "" ? await enderecoDoPonto(r.ponto) : "";
    setOcupado(null);
    marcar(r.ponto, rua ? { endereco: rua } : {});
  };

  const procurar = async () => {
    setOcupado("busca");
    setMensagem(null);
    try {
      const ponto = await acharEndereco(valor.endereco, valor.cidade, centro);
      if (ponto) marcar(ponto);
      else setMensagem({ texto: `Não achamos esse endereço em ${valor.cidade}. Toque no mapa onde você espera a van.`, tom: "aviso" });
    } catch {
      setMensagem({ texto: "Sem internet para procurar. Tente de novo ou toque no mapa.", tom: "aviso" });
    } finally {
      setOcupado(null);
    }
  };

  const titulo = avisoDoMapa ?? mensagem?.texto ?? (valor.ponto ? "Seu ponto no mapa" : "Toque no mapa onde você espera a van");
  const tituloEhAviso = !!avisoDoMapa || mensagem?.tom === "aviso";
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
                onClick={() => {
                  if (p !== valor.cidade) {
                    setAlvo(null);
                    setMensagem(null);
                  }
                  mudar({ cidade: p });
                }}
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
        <div className="grid shrink-0 grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-11 whitespace-normal rounded-2xl px-2 py-2 text-sm font-bold leading-tight [@media(max-height:700px)]:min-h-9 [@media(max-height:700px)]:py-1.5"
            disabled={ocupado !== null}
            onClick={() => void usarGps()}
          >
            {ocupado === "gps" ? <LoaderCircle className="!h-5 !w-5 animate-spin" /> : <LocateFixed className="!h-5 !w-5" />}
            Estou no ponto agora
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-11 whitespace-normal rounded-2xl px-2 py-2 text-sm font-bold leading-tight [@media(max-height:700px)]:min-h-9 [@media(max-height:700px)]:py-1.5"
            disabled={ocupado !== null || !valor.cidade || valor.endereco.trim() === ""}
            onClick={() => void procurar()}
          >
            {ocupado === "busca" ? <LoaderCircle className="!h-5 !w-5 animate-spin" /> : <Search className="!h-5 !w-5" />}
            Achar no mapa
          </Button>
        </div>
      )}
      {pontoObrigatorio(destino) && (
        <div className={cn(mapaFlexivel && "flex min-h-0 flex-1 flex-col")}>
          <p
            className={cn("mb-1.5 text-sm font-semibold", tituloEhAviso ? "text-warning" : mensagem ? "text-success" : "text-foreground")}
            role={tituloEhAviso || mensagem ? "status" : undefined}
          >
            {ocupado === "gps" ? "Procurando onde você está…" : ocupado === "busca" ? "Procurando o endereço…" : titulo}
          </p>
          <div className={mapaFlexivel ? "min-h-28 flex-1 [@media(max-height:700px)]:min-h-[5.5rem]" : "h-44 [@media(max-height:700px)]:h-36"}>
            <MapaDaVan
              cidades={cidades}
              meuPonto={valor.ponto}
              van={null}
              marcando
              foco={foco}
              aoMarcar={(ponto) => {
                setMensagem(null);
                mudar({ ponto });
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
