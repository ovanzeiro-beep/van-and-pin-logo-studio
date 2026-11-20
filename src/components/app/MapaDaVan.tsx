import { useEffect, useRef } from "react";
import type { Map as MapaLeaflet, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Ponto } from "@/lib/mapa";

const PINO_SVG = `<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path fill="var(--warning)" stroke="white" stroke-width="1.5" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.6" fill="white"/></svg>`;

/**
 * Map of the trip: the cities in order and the passenger's own point. Only on the phone (no server drawing).
 * CORREÇÃO 4: no van on the map (there is no real GPS; the old simulated van looked real).
 */
export function MapaDaVan({
  cidades,
  meuPonto,
  marcando,
  aoMarcar,
  foco,
  rotulo = "Mapa da viagem",
}: {
  cidades: { nome: string; ponto: Ponto }[];
  meuPonto: Ponto | null;
  marcando: boolean;
  aoMarcar: (p: Ponto) => void;
  /** Where to look instead of the whole route (marking the point: the chosen city, or the pin already marked). */
  foco?: { ponto: Ponto; zoom: number } | null | undefined;
  /** What a screen reader says about the map. */
  rotulo?: string | undefined;
}) {
  const caixa = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaLeaflet | null>(null);
  const camada = useRef<LayerGroup | null>(null);
  const leaflet = useRef<typeof import("leaflet") | null>(null);
  const aoMarcarRef = useRef(aoMarcar);
  const marcandoRef = useRef(marcando);
  aoMarcarRef.current = aoMarcar;
  marcandoRef.current = marcando;
  const focoRef = useRef(foco);
  focoRef.current = foco;

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
      const m = mapa.current;
      if (m) {
        // CORREÇÃO 4: Leaflet 1.9.4 ends an animated zoom with a 250 ms timer that remove() does not cancel. When the
        // screen closed during a zoom (double tap, GPS or search moving the map), the timer ran after the map was gone
        // and read its deleted pane: "Cannot read properties of undefined (reading '_leaflet_pos')", seen in
        // production. The zoom is ended first, so the late timer has nothing to do.
        (m as unknown as { _animatingZoom?: boolean })._animatingZoom = false;
        m.stop();
        m.remove();
      }
      mapa.current = null;
      camada.current = null;
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
    const f = focoRef.current;
    if (f) {
      if (enquadrar) m.setView([f.ponto.lat, f.ponto.lng], f.zoom);
    } else if (enquadrar) {
      const todos = [
        ...linha,
        ...(meuPonto ? [[meuPonto.lat, meuPonto.lng] as [number, number]] : []),
      ];
      if (todos.length > 1) m.fitBounds(todos, { padding: [28, 28] });
      else if (todos.length === 1) m.setView(todos[0]!, 13);
    }
  }

  // Redraws when the point changes (keeps the zoom the person chose);
  // fits the map again when cities arrive from the search.
  const quantasCidades = useRef(cidades.length);
  useEffect(() => {
    const chegaramCidades = cidades.length !== quantasCidades.current;
    quantasCidades.current = cidades.length;
    desenhar(chegaramCidades);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meuPonto?.lat, meuPonto?.lng, cidades]);

  // A new focus (another city chosen, or the pin found by the GPS or the search): goes there, without zooming out.
  useEffect(() => {
    const m = mapa.current;
    if (!m || !foco) return;
    m.setView([foco.ponto.lat, foco.ponto.lng], Math.max(m.getZoom(), foco.zoom));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foco?.ponto.lat, foco?.ponto.lng, foco?.zoom]);

  return (
    <div
      ref={caixa}
      role="application"
      aria-label={rotulo}
      className={`h-full w-full overflow-hidden rounded-3xl bg-muted shadow-card ${marcando ? "cursor-crosshair ring-4 ring-warning" : ""}`}
    />
  );
}
