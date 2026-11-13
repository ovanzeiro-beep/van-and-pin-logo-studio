import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Mail, User } from "lucide-react";
import { AuthLayout, OuDivisor } from "@/components/app/AuthLayout";
import { CampoComIcone } from "@/components/app/CampoComIcone";
import { GoogleButton } from "@/components/app/GoogleButton";
import { Button } from "@/components/ui/button";
import { criarContaNova } from "@/lib/sessao-passageiro";

export const Route = createFileRoute("/criar-conta")({
  head: () => ({
    meta: [
      { title: "Criar conta — O Vanzeiro" },
      { name: "description", content: "Crie sua conta grátis no O Vanzeiro." },
      { property: "og:title", content: "Criar conta — O Vanzeiro" },
      { property: "og:description", content: "Crie sua conta grátis no O Vanzeiro." },
    ],
  }),
  component: CriarConta,
});

function CriarConta() {
  const navigate = useNavigate();
  const avancar = () => navigate({ to: "/como-vai-usar" });

  return (
    <AuthLayout
      titulo="Criar sua conta"
      subtitulo="Leva menos de um minuto."
      rodape={
        <>
          Já tem conta?{" "}
          <Link to="/entrar" className="font-bold text-primary">
            Entrar
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          // A new account is not in any van yet: as a passenger it starts at "Entrar na van".
          criarContaNova(String(new FormData(e.currentTarget).get("nome") ?? ""));
          avancar();
        }}
      >
        <CampoComIcone id="nome" name="nome" label="Nome" icon={User} placeholder="Seu nome" autoComplete="name" />
        <CampoComIcone id="email" label="E-mail" type="email" icon={Mail} placeholder="voce@email.com" autoComplete="email" />
        <CampoComIcone id="senha" label="Senha" type="password" icon={Lock} placeholder="Crie uma senha" autoComplete="new-password" />
        <Button type="submit" variant="cta" size="xl" className="mt-2 w-full">
          Criar conta
        </Button>
      </form>
      <OuDivisor />
      <GoogleButton
        label="Entrar com Google"
        onClick={() => {
          criarContaNova("");
          avancar();
        }}
      />
    </AuthLayout>
  );
}
