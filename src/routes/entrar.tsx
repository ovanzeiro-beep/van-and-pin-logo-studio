import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Mail } from "lucide-react";
import { AuthLayout, OuDivisor } from "@/components/app/AuthLayout";
import { CampoComIcone } from "@/components/app/CampoComIcone";
import { GoogleButton } from "@/components/app/GoogleButton";
import { Button } from "@/components/ui/button";
import { entrar } from "@/lib/acesso";
import { fazer } from "@/lib/acoes";
import { entrarComEmail, entrarComGoogle } from "@/lib/conta";
import { obterSessao } from "@/lib/sessao";
import { USA_BANCO } from "@/lib/supabase";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Entrar — O Vanzeiro" },
      { name: "description", content: "Entre na sua conta do O Vanzeiro." },
      { property: "og:title", content: "Entrar — O Vanzeiro" },
      { property: "og:description", content: "Entre na sua conta do O Vanzeiro." },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  // W1: with the database, the e-mail and password are checked for real; the last panel used opens first.
  const avancar = async () => {
    if (USA_BANCO.conta) {
      const r = await fazer(() => entrarComEmail(email, senha));
      if (!r.ok) return;
      const papel = obterSessao().papel;
      await navigate({ to: papel === "vanzeiro" ? "/vanzeiro" : papel === "passageiro" ? "/passageiro" : "/como-vai-usar" });
      return;
    }
    entrar();
    await navigate({ to: "/como-vai-usar" });
  };
  const google = () => (USA_BANCO.conta ? void fazer(entrarComGoogle) : void avancar());

  return (
    <AuthLayout
      titulo="Bem-vindo de volta"
      subtitulo="Entre para acompanhar suas viagens."
      rodape={
        <>
          Ainda não tem conta?{" "}
          <Link to="/criar-conta" className="font-bold text-primary">
            Criar conta
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void avancar();
        }}
      >
        <CampoComIcone id="email" label="E-mail" type="email" icon={Mail} placeholder="voce@email.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <CampoComIcone id="senha" label="Senha" type="password" icon={Lock} placeholder="Sua senha" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <div className="flex justify-end">
          <Link to="/esqueci-senha" className="text-sm font-semibold text-primary">
            Esqueci minha senha
          </Link>
        </div>
        <Button type="submit" variant="cta" size="xl" className="w-full">
          Entrar
        </Button>
      </form>
      <OuDivisor />
      <GoogleButton label="Entrar com Google" onClick={google} />
    </AuthLayout>
  );
}
