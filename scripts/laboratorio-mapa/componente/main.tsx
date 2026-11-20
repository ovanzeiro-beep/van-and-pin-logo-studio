/* eslint-disable react-refresh/only-export-components -- página de laboratório, não é parte do app */
// CORREÇÃO 4 — laboratório do componente do mapa (o mesmo MapaDaVan do app), aberto e fechado num Chromium.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { MapaDaVan } from "@/components/app/MapaDaVan";

const cidades = [
  { nome: "Jacarezinho", ponto: { lat: -23.16, lng: -49.97 } },
  { nome: "Santo Antônio da Platina", ponto: { lat: -23.29, lng: -50.08 } },
  { nome: "Londrina", ponto: { lat: -23.31, lng: -51.16 } },
];

function App() {
  const [aberto, setAberto] = useState(true);
  const [foco, setFoco] = useState<{ ponto: { lat: number; lng: number }; zoom: number } | null>(
    null,
  );
  const w = window as unknown as Record<string, unknown>;
  w["fechar"] = () => setAberto(false);
  w["abrir"] = () => {
    setFoco(null);
    setAberto(true);
  };
  w["focar"] = (zoom: number) => setFoco({ ponto: cidades[0]!.ponto, zoom });
  return (
    <div id="caixa">
      {aberto && (
        <MapaDaVan
          cidades={cidades}
          meuPonto={{ lat: -23.17, lng: -49.98 }}
          marcando={false}
          aoMarcar={() => undefined}
          foco={foco}
        />
      )}
    </div>
  );
}

createRoot(document.getElementById("raiz")!).render(<App />);
