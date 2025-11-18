import type { Rendimento } from "./Rendimento";

/**
 * Política de cálculo de imposto sobre os rendimentos de uma pessoa.
 */
export interface PoliticaImposto {
  /**
   * Calcula o imposto sobre os rendimentos de uma pessoa conforme a política implementada.
   *
   * @param rendimentosContribuinte - Todos os rendimentos de uma pessoa
   */
  calcularImpostoSobreRendimentos(
    rendimentosContribuinte: Rendimento[]
  ): number;
}

/**
 * O racional dessa política é que cada contribuinte deve sustentar a si próprio, à casa e a cada
 * dependente de forma igualitária. Portanto, uma parcela não é tributada e as outras parcelas
 * são tributadas de forma igualitária para cobrir o custo da casa e dos dependentes.
 */
export class PoliticaImpostoCasaEDependentes implements PoliticaImposto {
  private aliquota: number;

  private calcularAliquota(nDependentes: number): number {
    return 1 - 1 / (1 + 1 + nDependentes);
  }

  constructor(nDependentes: number) {
    this.aliquota = this.calcularAliquota(nDependentes);
  }

  calcularImpostoSobreRendimentos(
    rendimentosContribuinte: Rendimento[]
  ): number {
    const totalRendimentos = rendimentosContribuinte.reduce(
      (acc, rendimento) => acc + rendimento.valor,
      0
    );
    return Math.floor(totalRendimentos * this.aliquota);
  }
}
