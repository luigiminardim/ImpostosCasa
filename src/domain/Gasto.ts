import type { Pessoa } from "./Pessoa";

export class Gasto {
  /**
   * Nome do gasto (ex: Aluguel, Supermercado, etc.).
   */
  nome: string;

  /**
   * Valor inteiro na menor unidade da moeda. Ex: (centavos de Real).
   */
  valor: number;

  /**
   * Pessoa que pagou o gasto. Null se o gasto foi pago pela casa.
   */
  pagador: null | Pessoa;

  /**
   * Indica se o gasto deve ser replicado na criação de um novo ciclo.
   */
  ciclico: boolean;

  constructor(params: {
    nome: string;
    valor: number;
    pagador: null | Pessoa;
    ciclico: boolean;
  }) {
    this.nome = params.nome.trim();
    this.valor = params.valor;
    this.pagador = params.pagador;
    this.ciclico = params.ciclico;
  }
}
