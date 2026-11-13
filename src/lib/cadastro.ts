// Rules of the "Criar conta" and "Esqueci minha senha" forms. Pure, so they can be tested.

export const SENHA_MINIMA = 8;
export const podeContinuarComGoogle = (aceitouTermos: boolean) => aceitouTermos;

export type DadosCadastro = {
  nome: string;
  email: string;
  senha: string;
  confirmar: string;
  aceitouTermos: boolean;
};

export type ErrosCadastro = Partial<Record<"nome" | "email" | "senha" | "confirmar" | "termos", string>>;

export function emailValido(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function erroDoEmail(email: string): string | undefined {
  if (!email.trim()) return "Digite seu e-mail";
  if (!emailValido(email)) return "E-mail inválido";
  return undefined;
}

/** Every field is required; returns one short message per field with a problem. */
export function validarCadastro(d: DadosCadastro): ErrosCadastro {
  const erros: ErrosCadastro = {};
  if (!d.nome.trim()) erros.nome = "Digite seu nome";
  const email = erroDoEmail(d.email);
  if (email) erros.email = email;
  if (!d.senha) erros.senha = "Crie uma senha";
  else if (d.senha.length < SENHA_MINIMA) erros.senha = `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres`;
  if (!d.confirmar) erros.confirmar = "Digite a senha de novo";
  else if (d.confirmar !== d.senha) erros.confirmar = "As senhas não são iguais";
  if (!d.aceitouTermos) erros.termos = "Marque a caixinha para continuar";
  return erros;
}

export const cadastroOk = (erros: ErrosCadastro) => Object.keys(erros).length === 0;

// What was typed in "Criar conta", kept while the person reads the Termos or the Política.
const vazio: DadosCadastro = { nome: "", email: "", senha: "", confirmar: "", aceitouTermos: false };
let rascunho: DadosCadastro = vazio;
export const rascunhoDoCadastro = () => rascunho;
export const guardarRascunhoDoCadastro = (d: DadosCadastro) => {
  rascunho = d;
};
export const limparRascunhoDoCadastro = () => {
  rascunho = vazio;
};
