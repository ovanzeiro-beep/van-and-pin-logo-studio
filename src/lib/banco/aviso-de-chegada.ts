import { useEffect, useId, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { obterSessao } from "@/lib/sessao";
import { supabase } from "@/lib/supabase";

type Parada = { viagemId: string; matriculaId: string };
type LinhaChegada = {
  id: string;
  destino_id: string;
  trajeto: string;
  expira_em: string;
  confirmado_em: string | null;
  servidor_agora: string;
};
type Chegada = LinhaChegada & { prazoNoAparelho: number };

function mensagemDeErro(erro: unknown, acao: string) {
  if (
    erro &&
    typeof erro === "object" &&
    "code" in erro &&
    erro.code === "P0001" &&
    "message" in erro &&
    typeof erro.message === "string"
  ) {
    return erro.message;
  }
  return `Não foi possível ${acao}. Confira a conexão e tente de novo.`;
}

const semConexao = () => navigator.onLine === false;

/** A interface só aparece após a versão de entrega estar ativada no banco. */
export function useChegadaDisponivel(contaId: string) {
  const consulta = useQuery({
    queryKey: ["chegada-disponivel", contaId],
    queryFn: async () => {
      const sb = supabase();
      if (!sb || obterSessao().conta?.id !== contaId) return false;
      const { data, error } = await sb.rpc("chegada_disponivel");
      return !error && data === true && obterSessao().conta?.id === contaId;
    },
    staleTime: 60_000,
    retry: false,
  });
  return consulta.data === true && !consulta.isError;
}

export function useAvisoDeChegada(contaId: string, parada?: Parada) {
  const cliente = useQueryClient();
  const canalId = useId();
  const revisaoDoCanal = useRef(0);
  const viagemId = parada?.viagemId ?? null;
  const matriculaId = parada?.matriculaId ?? null;
  const chave = ["aviso-de-chegada", contaId, viagemId, matriculaId] as const;
  const [canalPronto, setCanalPronto] = useState(false);
  const [, atualizarPrazo] = useState(0);

  const consulta = useQuery({
    queryKey: chave,
    queryFn: async ({ signal }) => {
      const sb = supabase();
      if (!sb || obterSessao().conta?.id !== contaId) throw new Error("Sessão indisponível");
      const inicioDaConsulta = performance.now();
      const { data, error } = await sb
        .rpc("ler_avisos_de_chegada", {
          p_viagem_id: viagemId,
          p_matricula_id: matriculaId,
        })
        .abortSignal(signal);
      if (error || obterSessao().conta?.id !== contaId) throw new Error("Consulta indisponível");
      return (data as LinhaChegada[]).map((aviso): Chegada => ({
        ...aviso,
        // Usa o relógio do servidor e desconta toda a duração da consulta.
        prazoNoAparelho:
          inicioDaConsulta + Date.parse(aviso.expira_em) - Date.parse(aviso.servidor_agora),
      }));
    },
    retry: false,
    refetchInterval: canalPronto ? false : 15_000,
    gcTime: 0,
  });

  const aviso = parada
    ? consulta.data?.[0]
    : consulta.data?.find((item) => item.prazoNoAparelho > performance.now());
  const prazo = aviso?.prazoNoAparelho;
  const destinoDoAviso = parada ? undefined : aviso?.destino_id;

  useEffect(() => {
    if (prazo === undefined || prazo <= performance.now()) return;
    const timer = window.setTimeout(
      () => atualizarPrazo((versao) => versao + 1),
      prazo - performance.now() + 1,
    );
    return () => window.clearTimeout(timer);
  }, [prazo]);

  useEffect(() => {
    const sb = supabase();
    if (!sb) return;
    let ativo = true;
    setCanalPronto(false);
    const leitura = {
      queryKey: ["aviso-de-chegada", contaId, viagemId, matriculaId],
      exact: true,
    };
    const atualizar = () => {
      if (!ativo || obterSessao().conta?.id !== contaId) return;
      void cliente.cancelQueries(leitura).then(() => {
        if (ativo && obterSessao().conta?.id === contaId) void cliente.invalidateQueries(leitura);
      });
    };
    // A saída do canal anterior é assíncrona. Cada inscrição usa seu próprio tópico.
    const canal = sb.channel(`chegada-${canalId}-${++revisaoDoCanal.current}`);
    const filtroDoAviso = {
      schema: "public",
      table: "avisos_de_chegada",
      filter: viagemId ? `viagem_id=eq.${viagemId}` : `passageiro_id=eq.${contaId}`,
    };
    canal.on("postgres_changes", { ...filtroDoAviso, event: "INSERT" }, atualizar);
    canal.on("postgres_changes", { ...filtroDoAviso, event: "UPDATE" }, atualizar);
    if (destinoDoAviso) {
      canal.on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "viagem_sinais",
          filter: `destino_id=eq.${destinoDoAviso}`,
        },
        atualizar,
      );
    }
    canal.subscribe((status) => {
      if (!ativo) return;
      setCanalPronto(status === "SUBSCRIBED");
      if (status === "SUBSCRIBED") atualizar();
    });
    return () => {
      ativo = false;
      void sb.removeChannel(canal);
    };
  }, [canalId, cliente, contaId, destinoDoAviso, matriculaId, viagemId]);

  const enviar = useMutation({
    networkMode: "always",
    mutationFn: async () => {
      const sb = supabase();
      if (!sb || !parada || semConexao() || obterSessao().conta?.id !== contaId) {
        throw new Error("Conecte-se à internet para avisar que chegou.");
      }
      try {
        const { error } = await sb.rpc("avisar_chegada", {
          p_viagem_id: parada.viagemId,
          p_matricula_id: parada.matriculaId,
        });
        if (error) throw error;
      } catch (erro) {
        throw new Error(mensagemDeErro(erro, "enviar o aviso"));
      }
    },
    onSettled: () => cliente.invalidateQueries({ queryKey: chave, exact: true }),
  });

  const confirmar = useMutation({
    networkMode: "always",
    mutationFn: async (id: string) => {
      const sb = supabase();
      if (!sb || semConexao() || obterSessao().conta?.id !== contaId) {
        throw new Error("Conecte-se à internet para confirmar que viu.");
      }
      try {
        const { error } = await sb.rpc("confirmar_aviso_de_chegada", { p_aviso_id: id });
        if (error) throw error;
      } catch (erro) {
        throw new Error(mensagemDeErro(erro, "confirmar que viu"));
      }
    },
    onSuccess: async (_, id) => {
      await cliente.cancelQueries({ queryKey: chave, exact: true });
      cliente.setQueryData<Chegada[]>(chave, (itens) => itens?.filter((item) => item.id !== id));
    },
    onSettled: () => cliente.invalidateQueries({ queryKey: chave, exact: true }),
  });

  return {
    aviso,
    expirou: prazo !== undefined && prazo <= performance.now(),
    indisponivel: consulta.isError && !consulta.data,
    carregando: consulta.isPending && consulta.fetchStatus === "fetching",
    enviar,
    confirmar,
  };
}
