import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { AuthLayout } from "@/components/app/AuthLayout";
import { CampoComIcone } from "@/components/app/CampoComIcone";
import { Button } from "@/components/ui/button";
import { fazer } from "@/lib/acoes";
import { cadastroOk, validarSenhaNova } from "@/lib/cadastro";
import { salvarSenhaNova } from "@/lib/conta";

export const Route = createFileRoute("/nova-senha")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Criar senha nova — O Vanzeiro" },
      { name: "description", content: "Crie uma senha nova para a sua conta do O Vanzeiro." },
      { property: "og:title", content: "Criar senha nova — O Vanzeiro" },
      { property: "og:description", content: "Crie uma senha nova para a sua conta do O Vanzeiro." },
    ],
  }),
  component: NovaSenha,
});

/** W1: opened by the link of "Esqueci minha senha" (Supabase logs the person in through the link). */
function NovaSenha() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [tentou, setTentou] = useState(false);
  const erros = tentou ? validarSenhaNova(senha, confirmar) : {};

  return (
    <AuthLayout
      titulo="Criar senha nova"
      subtitulo="Escolha a senha que você vai usar para entrar."
      rodape={
        <Link to="/entrar" className="font-bold text-primary">
          Voltar para Entrar
        </Link>
      }
    >
      <form
        className="space-y-4"
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          setTentou(true);
          if (!cadastroOk(validarSenhaNova(senha, confirmar))) return;
          const r = await fazer(() => salvarSenhaNova(senha));
          if (r.ok) await navigate({ to: "/como-vai-usar" });
        }}
      >
        <CampoComIcone
          id="senha"
          label="Senha nova"
          type="password"
          olhinho
          icon={Lock}
          placeholder="Pelo menos 8 caracteres"
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          erro={erros.senha}
        />
        <CampoComIcone
          id="confirmar"
          label="Confirmar senha"
          type="password"
          olhinho
          icon={Lock}
          placeholder="Digite a senha de novo"
          autoComplete="new-password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          erro={erros.confirmar}
        />
        <Button type="submit" variant="cta" size="xl" className="mt-2 w-full">
          Salvar senha
        </Button>
      </form>
    </AuthLayout>
  );
}
