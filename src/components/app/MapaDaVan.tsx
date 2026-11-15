import { useEffect, useRef } from "react";
import type { Map as MapaLeaflet, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";
import { VAN_BODY, WHEEL } from "@/components/brand/Logo";
import type { Ponto } from "@/lib/mapa";

const VAN_SVG = `<svg viewBox="4 9 56 56" width="22" height="22" aria-hidden="true"><path fill="white" fill-rule="evenodd" d="${VAN_BODY}"/><path fill="white" fill-rule="evenodd" d="${WHEEL(18)}"/><path fill="white" fill-rule="evenodd" d="${WHEEL(47)}"/></svg>`;
const PINO_SVG = `<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path fill="var(--warning)" stroke="white" stroke-width="1.5" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.6" fill="white"/></svg>`;

/** Map of the trip: the cities in order, the passenger's own point and the van. Only on the phone (no server drawing). */
export function MapaDaVan({
  cidades,
  meuPonto,
  van,
  marcando,
  aoMarcar,
}: {
  cidades: { nome: string; ponto: Ponto }[];
  meuPonto: Ponto | null;
  van: Ponto | null;
  marcando: boolean;
  aoMarcar: (p: Ponto) => void;
}) {
  const caixa = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaLeaflet | null>(null);
  const camada = useRef<LayerGroup | null>(null);
  const leaflet = useRef<typeof import("leaflet") | null>(null);
  const aoMarcarRef = useRef(aoMarcar);
  const marcandoRef = useRef(marcando);
  aoMarcarRef.current = aoMarcar;
  marcandoRef.current = marcando;

  // Creates the map once (Leaflet only works in the browser).
  useEffect(() => {
    let vivo = true;
    void import("leaflet").then((L) => {
      if (!vivo || !caixa.current || mapa.current) return;
      leaflet.current = L;
      const m = L.map(caixa.current, { zoomControl: false, attributionControl: true });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(m);
      m.attributionControl.setPrefix(false);
      m.on("click", (e) => {
        if (marcandoRef.current) aoMarcarRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
      mapa.current = m;
      camada.current = L.layerGroup().addTo(m);
      desenhar();
    });
    return () => {
      vivo = false;
      mapa.current?.remove();
      mapa.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function desenhar(enquadrar = true) {
    const L = leaflet.current;
    const m = mapa.current;
    const g = camada.current;
    if (!L || !m || !g) return;
    g.clearLayers();
    const linha = cidades.map((c) => [c.ponto.lat, c.ponto.lng] as [number, number]);
    if (linha.length > 1) L.polyline(linha, { color: "var(--primary)", weight: 4, opacity: 0.55, dashArray: "8 8" }).addTo(g);
    for (const c of cidades) {
      L.circleMarker([c.ponto.lat, c.ponto.lng], { radius: 5, color: "white", weight: 2, fillColor: "var(--primary)", fillOpacity: 1 })
        .bindTooltip(c.nome, { direction: "top", offset: [0, -4] })
        .addTo(g);
    }
    if (meuPonto) {
      L.marker([meuPonto.lat, meuPonto.lng], {
        icon: L.divIcon({ html: PINO_SVG, className: "", iconSize: [30, 30], iconAnchor: [15, 29] }),
        title: "Seu ponto",
      }).addTo(g);
    }
    if (van) {
      L.marker([van.lat, van.lng], {
        icon: L.divIcon({
          html: `<div style="width:40px;height:40px;border-radius:9999px;background:var(--primary);border:3px solid white;box-shadow:0 2px 8px rgb(0 0 0 / .3);display:flex;align-items:center;justify-content:center">${VAN_SVG}</div>`,
          className: "",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        }),
        title: "Van",
        zIndexOffset: 1000,
      }).addTo(g);
    }
    if (enquadrar) {
      const todos = [...linha, ...(meuPonto ? [[meuPonto.lat, meuPonto.lng] as [number, number]] : []), ...(van ? [[van.lat, van.lng] as [number, number]] : [])];
      if (todos.length > 1) m.fitBounds(todos, { padding: [28, 28] });
      else if (todos.length === 1) m.setView(todos[0]!, 13);
    }
  }

  // Redraws when the van moves or the point changes (keeps the zoom the person chose);
  // fits the map again when cities arrive from the search.
  const quantasCidades = useRef(cidades.length);
  useEffect(() => {
    const chegaramCidades = cidades.length !== quantasCidades.current;
    quantasCidades.current = cidades.length;
    desenhar(chegaramCidades);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [van?.lat, van?.lng, meuPonto?.lat, meuPonto?.lng, cidades]);

  return (
    <div
      ref={caixa}
      role="application"
      aria-label="Mapa da viagem"
      className={`h-full w-full overflow-hidden rounded-3xl bg-muted shadow-card ${marcando ? "cursor-crosshair ring-4 ring-warning" : ""}`}
    />
  );
}
