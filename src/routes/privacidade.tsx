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
    <LeituraLayout titulo="Política de Privacidade" resumo="Quais dados guardamos e o que fazemos com eles. Atualizada em 17/11/2026.">
      <Secao titulo="Quem cuida dos seus dados">
        <p>
          O responsável pelos seus dados (controlador, pela Lei Geral de Proteção de Dados, LGPD) é{" "}
          <strong>Rafael Atencia</strong>, que também é o encarregado de atender os pedidos sobre dados. O contato está
          no fim desta página.
        </p>
      </Secao>

      <Secao titulo="Quais dados o app guarda">
        <ul>
          <li>Nome</li>
          <li>E-mail</li>
          <li>Telefone</li>
          <li>Endereço de embarque</li>
          <li>Ponto de embarque marcado no mapa (o lugar onde você espera a van)</li>
        </ul>
        <p>
          Para o app funcionar, também ficam guardadas as respostas "Vou" e "Não vou", os embarques e faltas, as
          cobranças e, do vanzeiro, a chave Pix, os dados da van e os gastos anotados. Se você entrar com o Google,
          recebemos do Google o seu nome e e-mail.
        </p>
      </Secao>

      <Secao titulo="Para que servem">
        <ul>
          <li>Nome e e-mail: criar e acessar sua conta.</li>
          <li>Telefone: o vanzeiro e o passageiro conversarem pelo WhatsApp.</li>
          <li>Endereço de embarque: montar a ordem da busca.</li>
          <li>
            Ponto no mapa: mostrar a van chegando, calcular quanto falta e conferir se uma mudança de endereço fica perto
            do combinado.
          </li>
          <li>Respostas, embarques e cobranças: organizar as viagens e os pagamentos.</li>
        </ul>
        <p>Não vendemos seus dados.</p>
        <p>
          <strong>Base legal:</strong> usamos os dados para cumprir o serviço que você pediu ao criar a conta (execução de
          contrato), para manter o app seguro e funcionando (legítimo interesse) e, nas notificações no celular, com o seu
          consentimento.
        </p>
      </Secao>

      <Secao titulo="Quem vê seus dados">
        <p>
          <strong>O vanzeiro vê os dados dos seus passageiros</strong>: nome, telefone, endereço e ponto de embarque no
          mapa, respostas, viagens e pagamentos.
        </p>
        <p>O passageiro vê o nome, o telefone, a chave Pix e a van do seu vanzeiro.</p>
        <p>Nenhum passageiro vê os dados de outro passageiro, nem o ponto dele no mapa.</p>
        <p>
          Durante a viagem, os passageiros da mesma viagem veem apenas <strong>quantos lugares estão ocupados</strong> e as{" "}
          <strong>iniciais</strong> de quem já embarcou (por exemplo, "M. H."), nunca o nome completo, o telefone ou o
          endereço.
        </p>
      </Secao>

      <Secao titulo="Onde os dados ficam e quem nos ajuda">
        <ul>
          <li>Os dados ficam guardados no Supabase, um serviço de banco de dados seguro, com acesso protegido por senha.</li>
          <li>O app é hospedado pelo Lovable.</li>
          <li>O login com Google é feito pelo Google.</li>
          <li>Os e-mails de cadastro e de troca de senha são enviados pelo Gmail.</li>
          <li>As notificações no celular passam pelo serviço de notificações do seu navegador (Google ou Apple).</li>
        </ul>
        <p>
          Esses serviços só tratam os dados para fazer o app funcionar. Alguns deles podem guardar dados fora do Brasil,
          sempre com as proteções exigidas pela LGPD.
        </p>
      </Secao>

      <Secao titulo="Por quanto tempo guardamos">
        <ul>
          <li>Enquanto a sua conta existir.</li>
          <li>
            Ao <strong>excluir a conta</strong>, seu login, seu nome e seu endereço são apagados, inclusive das cobranças.
            O vanzeiro continua com o histórico das viagens e cobranças e com o telefone que ele mesmo cadastrou, pelo tempo
            que a lei exigir. Para apagar também esses dados, peça no contato abaixo.
          </li>
          <li>
            Se o <strong>vanzeiro</strong> excluir a conta, o nome, telefone, Pix, dados da van e gastos dele são apagados.
            Os passageiros são avisados e continuam vendo o histórico das viagens e pagamentos feitos com ele.
          </li>
          <li>Os registros de erros do app ficam guardados só pelo tempo necessário para corrigir os problemas.</li>
        </ul>
      </Secao>

      <Secao titulo="Seus direitos">
        <p>Pela LGPD, você pode pedir, a qualquer momento e de graça:</p>
        <ul>
          <li>para saber se temos seus dados e para ver quais são;</li>
          <li>para corrigir dados errados ou desatualizados;</li>
          <li>para apagar seus dados ou excluir a conta (também dá para fazer pelo Perfil);</li>
          <li>uma cópia dos seus dados;</li>
          <li>informações sobre com quem compartilhamos seus dados;</li>
          <li>para retirar o seu consentimento, como desligar as notificações.</li>
        </ul>
        <p>
          É só escrever para o contato abaixo. Respondemos em até 15 dias. Você também pode reclamar na Autoridade Nacional
          de Proteção de Dados (ANPD).
        </p>
      </Secao>

      <Secao titulo="Menores de idade">
        <p>
          Menores de 18 anos só usam o app com a autorização do responsável legal. O responsável pode pedir, a qualquer
          momento, para ver, corrigir ou apagar os dados do menor.
        </p>
      </Secao>

      <Secao titulo="Registro de erros">
        <p>
          Quando acontece um erro no app, guardamos o texto do erro, a tela onde aconteceu, o tipo de navegador e se você
          é vanzeiro ou passageiro, para conseguir corrigir. E-mails e números de telefone são apagados do texto antes de
          guardar.
        </p>
      </Secao>

      <Secao titulo="Segurança">
        <p>
          Cada pessoa só acessa os dados que pode ver, e as regras de acesso ficam no próprio banco de dados. Mesmo assim,
          nenhum sistema é 100% seguro. Se acontecer algum incidente que possa trazer risco a você, avisaremos.
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

      <Secao titulo="Notificações no celular">
        <p>
          Só chegam se você ativar no Perfil. Elas mostram os mesmos avisos do sininho. Para parar, é só desligar nas
          configurações do celular. Ao sair da conta, aquele celular para de receber os avisos dela.
        </p>
      </Secao>

      <Secao titulo="Mapa e busca de endereços">
        <p>
          O mapa e a busca de cidades vêm dos servidores do OpenStreetMap. Ao abrir uma tela com mapa, ou quando o app
          procura uma cidade, o OpenStreetMap recebe o seu endereço IP, dados do navegador e o nome da cidade procurada.
          Quando você toca em "Achar no mapa", ele recebe o endereço que você escreveu; quando toca em "Estou no ponto
          agora", recebe o ponto onde o celular está, para devolver o nome da rua. Se ele não responder, o ponto vai para o
          Photon (da empresa Komoot), que usa os mesmos dados do OpenStreetMap. A localização do celular só é usada
          nessa hora, quando você toca no botão, e não fica sendo acompanhada. A{" "}
          <a
            href="https://osmfoundation.org/wiki/Privacy_Policy"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-primary underline underline-offset-2"
          >
            política de privacidade do OpenStreetMap
          </a>{" "}
          explica como ele cuida desses dados.
        </p>
      </Secao>

      <Secao titulo="Cópia do app no celular">
        <p>
          Para abrir sem internet, o app guarda uma cópia das suas telas no próprio celular. Ela fica só no seu aparelho
          e some se você apagar os dados do app ou do navegador.
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
          <strong>Responsável e encarregado:</strong> Rafael Atencia
          <br />
          <strong>E-mail:</strong> contato@ovanzeiro.com.br
          <br />
          <strong>Telefone e WhatsApp:</strong> (14) 99773-2018
        </p>
      </Secao>
    </LeituraLayout>
  );
}
