export class Rendimento {
  /**
   * Nome do rendimento (ex: Salário, Aluguel, etc.).
   */
  nome: string;

  /**
   * Valor inteiro na menor unidade da moeda. Ex: (centavos de Real).
   */
  valor: number;

  /**
   * Indica se o imposto de renda já foi retido na fonte.
   */
  retidoNaFonte: boolean;

  /**
   * Indica se o rendimento deve ser replicado na criação de um novo ciclo.
   */
  ciclico: boolean;

  constructor(params: {
    nome: string;
    valor: number;
    retidoNaFonte: boolean;
    ciclico: boolean;
  }) {
    this.nome = params.nome.trim();
    this.valor = params.valor;
    this.retidoNaFonte = params.retidoNaFonte;
    this.ciclico = params.ciclico;
  }
}
