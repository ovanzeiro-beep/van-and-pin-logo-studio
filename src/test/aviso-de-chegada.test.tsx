import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { destinosExemplo, passageirosExemplo } from "@/data/exemplo";
import { mudarSessao } from "@/lib/sessao";
import { iniciarViagem } from "@/lib/viagem";
import { ViagemEmCurso } from "@/components/app/viagem/ViagemEmCurso";
import { AvisoDeChegadaPassageiro } from "@/components/app/passageiro/AvisoDeChegadaPassageiro";

const simulado = vi.hoisted(() => {
  const canais: {
    ativo: boolean;
    topico: string;
    eventos: { tabela: string; filtro: string; evento: string; avisar: () => void }[];
  }[] = [];
  const rpc = vi.fn();
  const tocar = vi.fn();
  const banco = { ativo: true };
  const channel = (topico: string) => {
    if (canais.some((canal) => canal.topico === topico)) throw new Error("Tópico ainda em uso");
    const registro: (typeof canais)[number] = { ativo: true, topico, eventos: [] };
    canais.push(registro);
    return {
      registro,
      on(
        _evento: string,
        filtro: { table: string; filter: string; event: string },
        avisar: () => void,
      ) {
        registro.eventos.push({
          tabela: filtro.table,
          filtro: filtro.filter,
          evento: filtro.event,
          avisar,
        });
        return this;
      },
      subscribe(pronto: (status: string) => void) {
        pronto("SUBSCRIBED");
        return this;
      },
    };
  };
  const removeChannel = ({ registro }: ReturnType<typeof channel>) => {
    registro.ativo = false;
  };
  return {
    canais,
    rpc,
    tocar,
    banco,
    cliente: {
      rpc: (funcao: string, args?: unknown) =>
        funcao === "chegada_disponivel"
          ? Promise.resolve({ data: banco.ativo, error: banco.ativo ? null : { code: "PGRST202" } })
          : rpc(funcao, args),
      channel,
      removeChannel,
    },
  };
});

vi.mock("@/lib/supabase", () => ({
  USA_BANCO: { conta: false, destinos: true },
  supabase: () => simulado.cliente,
  SUPABASE_URL: "",
  SUPABASE_CHAVE_PUBLICA: "",
}));
vi.mock("@/lib/alerta", () => ({ tocarAlerta: simulado.tocar }));

const destino = destinosExemplo[0]!;
const motorista = destino.vanzeiroId;
const pessoas = passageirosExemplo
  .filter((p) => p.destinoId === destino.id)
  .slice(0, 2)
  .map((p, i) => ({ ...p, pessoaId: `conta-passageiro-${i}` }));
const [primeiro, segundo] = [pessoas[0]!, pessoas[1]!];
const viagem = iniciarViagem(destino, [primeiro.id, segundo.id], "2026-11-13");
const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function conta(id: string) {
  mudarSessao({ conta: { id, nome: id, email: "teste@example.invalid" } });
}

function emitir(tabela: string, filtro: string, evento = "INSERT") {
  act(() => {
    for (const canal of simulado.canais.filter((item) => item.ativo)) {
      canal.eventos
        .filter((e) => e.tabela === tabela && e.filtro === filtro && e.evento === evento)
        .forEach((e) => e.avisar());
    }
  });
}

function chegada(segundos = 180, confirmado = false) {
  const agora = Date.now();
  return {
    id: "aviso-a",
    destino_id: destino.id,
    trajeto: `${destino.origem} → ${destino.destino}`,
    expira_em: new Date(agora + segundos * 1_000).toISOString(),
    servidor_agora: new Date(agora).toISOString(),
    confirmado_em: confirmado ? new Date(agora).toISOString() : null,
  };
}

function resposta(data: unknown, error: { code: string; message: string } | null = null) {
  return Object.assign(Promise.resolve({ data, error }), {
    abortSignal: () => Promise.resolve({ data, error }),
  });
}

beforeEach(() => {
  cliente.clear();
  simulado.rpc.mockReset();
  simulado.banco.ativo = true;
  simulado.tocar.mockClear();
  simulado.canais.length = 0;
});
afterEach(() => {
  vi.restoreAllMocks();
  mudarSessao({ conta: null });
});

describe("Aviso de chegada no cartão de busca e na tela do passageiro", () => {
  it("envia só para o próximo, mostra a confirmação e limpa o estado ao avançar a busca", async () => {
    conta(motorista);
    let status: ReturnType<typeof chegada> | undefined;
    simulado.rpc.mockImplementation((funcao, args) => {
      if (funcao === "avisar_chegada") {
        status = chegada();
        return resposta(status.id);
      }
      return resposta(status && args.p_matricula_id === primeiro.id ? [status] : []);
    });
    const planta = (v: typeof viagem) => (
      <QueryClientProvider client={cliente}>
        <ViagemEmCurso v={v} passageiros={pessoas} destino={destino} />
      </QueryClientProvider>
    );
    const tela = render(planta(viagem));
    const enviar = await screen.findByRole<HTMLButtonElement>("button", {
      name: "Avisar que cheguei",
    });
    await waitFor(() => expect(enviar.disabled).toBe(false));
    fireEvent.click(enviar);
    expect(await screen.findByText("Aguardando confirmação do passageiro.")).toBeTruthy();
    expect(simulado.rpc).toHaveBeenCalledWith("avisar_chegada", {
      p_viagem_id: viagem.id,
      p_matricula_id: primeiro.id,
    });
    expect(screen.getByRole("button", { name: "Embarcou" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Não estava no ponto" })).toBeTruthy();
    status = chegada(180, true);
    emitir("avisos_de_chegada", `viagem_id=eq.${viagem.id}`, "UPDATE");
    expect(await screen.findByText("Passageiro confirmou que viu.")).toBeTruthy();
    tela.rerender(planta({ ...viagem, embarcaram: [primeiro.id] }));
    await waitFor(() =>
      expect(
        screen.getByRole<HTMLButtonElement>("button", { name: "Avisar que cheguei" }).disabled,
      ).toBe(false),
    );
    expect(screen.queryByText("Passageiro confirmou que viu.")).toBeNull();
    expect(simulado.rpc).toHaveBeenCalledWith("ler_avisos_de_chegada", {
      p_viagem_id: viagem.id,
      p_matricula_id: segundo.id,
    });
  });

  it("exibe somente o aviso pendente e confirma apenas após a resposta do banco", async () => {
    conta(primeiro.pessoaId);
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    let pendente = false;
    let permitirConfirmar = false;
    simulado.rpc.mockImplementation((funcao) => {
      if (funcao === "confirmar_aviso_de_chegada") {
        if (!permitirConfirmar) return resposta(null, { code: "503", message: "Indisponível" });
        pendente = false;
        return resposta("confirmado");
      }
      return resposta(pendente ? [chegada()] : []);
    });
    render(
      <QueryClientProvider client={cliente}>
        <AvisoDeChegadaPassageiro contaId={primeiro.pessoaId} />
      </QueryClientProvider>,
    );
    await waitFor(() =>
      expect(simulado.rpc).toHaveBeenCalledWith("ler_avisos_de_chegada", {
        p_viagem_id: null,
        p_matricula_id: null,
      }),
    );
    expect(screen.queryByText("Sua van chegou")).toBeNull();
    pendente = true;
    emitir("avisos_de_chegada", `passageiro_id=eq.${primeiro.pessoaId}`);
    fireEvent.click(await screen.findByRole("button", { name: "Estou ciente" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível confirmar");
    expect(screen.getByText("Sua van chegou")).toBeTruthy();
    expect(screen.getByText(`${destino.origem} → ${destino.destino}`)).toBeTruthy();
    expect(simulado.tocar).toHaveBeenCalledTimes(1);
    permitirConfirmar = true;
    fireEvent.click(screen.getByRole("button", { name: "Estou ciente" }));
    await waitFor(() => expect(screen.queryByText("Sua van chegou")).toBeNull());
    expect(simulado.rpc).toHaveBeenCalledWith("confirmar_aviso_de_chegada", {
      p_aviso_id: "aviso-a",
    });
  });

  it("retira o aviso antigo quando a viagem avança e ao trocar de conta", async () => {
    conta(primeiro.pessoaId);
    let pendente = true;
    simulado.rpc.mockImplementation(() => resposta(pendente ? [chegada()] : []));
    const painel = (id: string) => (
      <QueryClientProvider client={cliente}>
        <AvisoDeChegadaPassageiro key={id} contaId={id} />
      </QueryClientProvider>
    );
    const tela = render(painel(primeiro.pessoaId));
    expect(await screen.findByText("Sua van chegou")).toBeTruthy();
    await waitFor(() =>
      expect(
        simulado.canais.some(
          (canal) => canal.ativo && canal.eventos.some((e) => e.tabela === "viagem_sinais"),
        ),
      ).toBe(true),
    );
    pendente = false;
    emitir("viagem_sinais", `destino_id=eq.${destino.id}`, "UPDATE");
    await waitFor(() => expect(screen.queryByText("Sua van chegou")).toBeNull());
    pendente = true;
    emitir("avisos_de_chegada", `passageiro_id=eq.${primeiro.pessoaId}`);
    expect(await screen.findByText("Sua van chegou")).toBeTruthy();
    pendente = false;
    conta(segundo.pessoaId);
    tela.rerender(painel(segundo.pessoaId));
    expect(screen.queryByText("Sua van chegou")).toBeNull();
    await waitFor(() => {
      expect(
        simulado.canais
          .filter((c) => c.ativo)
          .flatMap((c) => c.eventos)
          .map((e) => e.filtro),
      ).toEqual([`passageiro_id=eq.${segundo.pessoaId}`, `passageiro_id=eq.${segundo.pessoaId}`]);
    });
  });

  it("ignora um aviso que chega fora do prazo", async () => {
    conta(primeiro.pessoaId);
    simulado.rpc.mockImplementation(() => resposta([chegada(-1)]));
    render(
      <QueryClientProvider client={cliente}>
        <AvisoDeChegadaPassageiro contaId={primeiro.pessoaId} />
      </QueryClientProvider>,
    );
    await waitFor(() =>
      expect(
        cliente.getQueryState(["aviso-de-chegada", primeiro.pessoaId, null, null])?.status,
      ).toBe("success"),
    );
    expect(screen.queryByText("Sua van chegou")).toBeNull();
    expect(simulado.tocar).not.toHaveBeenCalled();
  });

  it("preserva os botões da busca quando o banco ainda não foi ativado", async () => {
    conta(motorista);
    simulado.banco.ativo = false;
    render(
      <QueryClientProvider client={cliente}>
        <ViagemEmCurso v={viagem} passageiros={pessoas} destino={destino} />
      </QueryClientProvider>,
    );
    await waitFor(() =>
      expect(cliente.getQueryData(["chegada-disponivel", motorista])).toBe(false),
    );
    expect(screen.queryByRole("button", { name: "Avisar que cheguei" })).toBeNull();
    expect(screen.getByRole("button", { name: "Embarcou" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Não estava no ponto" })).toBeTruthy();
    expect(simulado.canais).toHaveLength(0);
    expect(simulado.rpc).not.toHaveBeenCalled();
  });

  it("sem conexão, o motorista recebe uma mensagem e nada fica para disparar depois", async () => {
    conta(motorista);
    simulado.rpc.mockImplementation(() => resposta([]));
    render(
      <QueryClientProvider client={cliente}>
        <ViagemEmCurso v={viagem} passageiros={pessoas} destino={destino} />
      </QueryClientProvider>,
    );
    const enviar = await screen.findByRole<HTMLButtonElement>("button", {
      name: "Avisar que cheguei",
    });
    await waitFor(() => expect(enviar.disabled).toBe(false));
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    fireEvent.click(enviar);
    expect(await screen.findByRole("alert")).toHaveTextContent("Conecte-se à internet");
    expect(simulado.rpc.mock.calls.some(([nome]) => nome === "avisar_chegada")).toBe(false);
    expect(screen.queryByText("Aguardando confirmação do passageiro.")).toBeNull();
  });
});
