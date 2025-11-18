/**
 * Representa um contribuinte ou um dependente dentro da família.
 */
export class Pessoa {
  /**
   * Nome completo da pessoa.
   */
  nome: string;

  constructor(params: { nome: string }) {
    this.nome = params.nome.trim();
  }
}
