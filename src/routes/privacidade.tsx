import { createFileRoute } from "@tanstack/react-router";
import { LeituraLayout, Secao } from "@/components/app/LeituraLayout";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Política de Privacidade — O Vanzeiro" },
      { name: "description", content: "Quais dados o O Vanzeiro guarda, para que servem e como pedir para ver, corrigir ou apagar." },
      { property: "og:title", content: "Política de Privacidade — O Vanzeiro" },
      { property: "og:description", content: "Quais dados o O Vanzeiro guarda, para que servem e como pedir para ver, corrigir ou apagar." },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  return (
    <LeituraLayout titulo="Política de Privacidade" resumo="Quais dados guardamos e o que fazemos com eles.">
      <Secao titulo="Quais dados o app guarda">
        <ul>
          <li>Nome</li>
          <li>E-mail</li>
          <li>Telefone</li>
          <li>Endereço de embarque</li>
        </ul>
        <p>
          Para o app funcionar, também ficam guardadas as respostas "Vou" e "Não vou", os embarques e faltas, as
          cobranças e, do vanzeiro, a chave Pix e os dados da van.
        </p>
      </Secao>

      <Secao titulo="Para que servem">
        <ul>
          <li>Nome e e-mail: criar e acessar sua conta.</li>
          <li>Telefone: o vanzeiro e o passageiro conversarem pelo WhatsApp.</li>
          <li>Endereço de embarque: montar a ordem da busca.</li>
          <li>Respostas, embarques e cobranças: organizar as viagens e os pagamentos.</li>
        </ul>
        <p>Não vendemos seus dados.</p>
      </Secao>

      <Secao titulo="Quem vê seus dados">
        <p>
          <strong>O vanzeiro vê os dados dos seus passageiros</strong>: nome, telefone, endereço de embarque, respostas,
          viagens e pagamentos.
        </p>
        <p>O passageiro vê o nome, o telefone, a chave Pix e a van do seu vanzeiro.</p>
      </Secao>

      <Secao titulo="Seus direitos">
        <p>
          Você pode pedir para <strong>ver, corrigir ou apagar</strong> seus dados a qualquer momento. É só falar com o
          responsável pelo app no contato abaixo.
        </p>
      </Secao>

      <Secao titulo="Estatísticas de visitas">
        <p>
          Para melhorar o app, contamos as visitas. Isso não usa cookies, não guarda nada no seu celular, não guarda o
          seu endereço IP e não identifica quem você é. O Lovable coleta esses dados para nós. A{" "}
          <a
            href="https://lovable.dev/privacy"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-primary underline underline-offset-2"
          >
            política de privacidade do Lovable
          </a>{" "}
          explica como ele cuida deles.
        </p>
        <p>
          São registrados: as telas visitadas, de onde a pessoa veio, o país, o navegador, o sistema e o tipo de aparelho,
          quanto tempo ela fica, a velocidade das telas, erros e os toques em botões e links. Isso é registrado para todos
          os visitantes. Os dados detalhados ficam guardados por 90 dias, e os resumos de cada dia, por um ano.
        </p>
      </Secao>

      <Secao titulo="Fontes do Google">
        <p>
          As letras do app são carregadas dos servidores do Google. Ao abrir o app, o Google recebe o seu endereço IP e
          dados do navegador para entregar essas letras.
        </p>
      </Secao>

      <Secao titulo="Contato do responsável">
        <p>
          <strong>Responsável:</strong> (a definir)
          <br />
          <strong>E-mail:</strong> (a definir)
          <br />
          <strong>Telefone:</strong> (a definir)
        </p>
      </Secao>
    </LeituraLayout>
  );
}
