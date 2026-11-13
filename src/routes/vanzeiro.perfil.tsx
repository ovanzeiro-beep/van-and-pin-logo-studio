import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Car, Check, LogOut, Pencil, Phone, QrCode, RectangleHorizontal, User, X } from "lucide-react";
import { CampoComIcone } from "@/components/app/CampoComIcone";
import { LinhaPerfil } from "@/components/app/LinhaPerfil";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";
import { VanIcon } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { formatarTelefone, somenteDigitos, telefoneValido } from "@/lib/passageiros";
import { salvarPerfilVanzeiro, usePerfilVanzeiro, type PerfilVanzeiro } from "@/lib/vanzeiro-store";

export const Route = createFileRoute("/vanzeiro/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil do vanzeiro — O Vanzeiro" },
      { name: "description", content: "Seus dados, a chave Pix que os passageiros veem e a sua van." },
      { property: "og:title", content: "Perfil do vanzeiro — O Vanzeiro" },
      { property: "og:description", content: "Seus dados, a chave Pix que os passageiros veem e a sua van." },
    ],
  }),
  component: AbaPerfil,
});

function AbaPerfil() {
  const perfil = usePerfilVanzeiro();
  const [editando, setEditando] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <VanzeiroHeader compacto titulo="Perfil" subtitulo="Seus dados e a sua van." />
      <div className="relative z-10 -mt-4 space-y-3 px-5 pb-4">
        {editando ? (
          <Editar perfil={perfil} fechar={() => setEditando(false)} />
        ) : (
          <>
            <section className="rounded-3xl bg-card p-4 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Você</p>
              <dl className="mt-2 space-y-2">
                <LinhaPerfil icon={User} rotulo="Nome" valor={perfil.nome} />
                <LinhaPerfil icon={Phone} rotulo="Telefone" valor={formatarTelefone(perfil.telefone)} />
                <LinhaPerfil icon={QrCode} rotulo="Chave Pix (os passageiros veem esta)" valor={perfil.pix} />
              </dl>
            </section>
            <section className="rounded-3xl bg-card p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <VanIcon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sua van</p>
                  <p className="font-display text-lg font-bold leading-tight text-foreground">{perfil.van.modelo}</p>
                  <p className="text-sm text-muted-foreground">Placa {perfil.van.placa}</p>
                </div>
              </div>
            </section>
            <Button size="lg" variant="outline" className="w-full" onClick={() => setEditando(true)}>
              <Pencil className="!h-5 !w-5" /> Editar
            </Button>
            <Button size="lg" variant="ghost" className="w-full" onClick={() => navigate({ to: "/entrar" })}>
              <LogOut className="!h-5 !w-5" /> Sair
            </Button>
          </>
        )}
      </div>
    </>
  );
}

function Editar({ perfil, fechar }: { perfil: PerfilVanzeiro; fechar: () => void }) {
  const [nome, setNome] = useState(perfil.nome);
  const [telefone, setTelefone] = useState(formatarTelefone(perfil.telefone));
  const [pix, setPix] = useState(perfil.pix);
  const [modelo, setModelo] = useState(perfil.van.modelo);
  const [placa, setPlaca] = useState(perfil.van.placa);
  const pode = nome.trim() && telefoneValido(telefone) && pix.trim() && modelo.trim() && placa.trim();

  const salvar = () => {
    salvarPerfilVanzeiro({
      nome: nome.trim(),
      telefone: somenteDigitos(telefone),
      pix: pix.trim(),
      van: { modelo: modelo.trim(), placa: placa.trim().toUpperCase() },
    });
    fechar();
  };

  return (
    <section className="space-y-3 rounded-3xl bg-card p-4 shadow-card">
      <CampoComIcone id="v-nome" label="Nome" icon={User} value={nome} onChange={(e) => setNome(e.target.value)} />
      <CampoComIcone
        id="v-telefone"
        label="Telefone (WhatsApp)"
        icon={Phone}
        inputMode="tel"
        value={telefone}
        onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
      />
      <CampoComIcone id="v-pix" label="Chave Pix" icon={QrCode} value={pix} onChange={(e) => setPix(e.target.value)} />
      <CampoComIcone id="v-modelo" label="Modelo da van" icon={Car} value={modelo} onChange={(e) => setModelo(e.target.value)} />
      <CampoComIcone
        id="v-placa"
        label="Placa"
        icon={RectangleHorizontal}
        value={placa}
        onChange={(e) => setPlaca(e.target.value.toUpperCase())}
      />
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Button size="lg" variant="outline" onClick={fechar}>
          <X className="!h-5 !w-5" /> Cancelar
        </Button>
        <Button size="lg" variant="cta" disabled={!pode} onClick={salvar}>
          <Check className="!h-5 !w-5" /> Salvar
        </Button>
      </div>
    </section>
  );
}
