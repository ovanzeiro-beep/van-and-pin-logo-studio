import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Mail } from "lucide-react";
import { AuthLayout, OuDivisor } from "@/components/app/AuthLayout";
import { CampoComIcone } from "@/components/app/CampoComIcone";
import { GoogleButton } from "@/components/app/GoogleButton";
import { Button } from "@/components/ui/button";
import { esquecerContaNova } from "@/lib/conta-nova";

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
  const avancar = () => {
    esquecerContaNova();
    navigate({ to: "/como-vai-usar" });
  };

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
          avancar();
        }}
      >
        <CampoComIcone id="email" label="E-mail" type="email" icon={Mail} placeholder="voce@email.com" autoComplete="email" />
        <CampoComIcone id="senha" label="Senha" type="password" icon={Lock} placeholder="Sua senha" autoComplete="current-password" />
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
      <GoogleButton label="Entrar com Google" onClick={avancar} />
    </AuthLayout>
  );
}
