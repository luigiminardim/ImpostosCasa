import type { Rendimento } from "./Rendimento";

/**
 * Representa a política de distribuição de renda para dependentes.
 */
export interface PoliticaDependencia {
  /**
   * Calcula o benefício para um dependente conforme a política implementada.
   *
   * @param totalArrecadado - Total arrecadado pela casa
   * @param rendimentosDependente - Todos os rendimentos do dependente
   * @returns O benefício calculado para o dependente conforme a política implementada.
   */
  calcularBeneficioParaDependente(
    totalArrecadado: number,
    rendimentosDependente: Rendimento[]
  ): number;
}

/**
 * O racional dessa política é que a casa deve sustentar a si própria e cada um dos seus dependentes de forma igualitária.
 * Portanto, uma parcela deve ficar com a casa e as outras parcelas devem ser distribuídas de forma igualitária entre os dependentes.
 * Além disso, cada dependente deve sustentar a si próprio e também contribuir para o sustento da casa, de forma que parte do benefício seja retido para a casa.
 * Dessa forma, o benefício total é divido pela metade.
 */
export class PoliticaDependenciaCasaDependentesMeiadosComDeducao
  implements PoliticaDependencia
{
  private fatorRecebimentoDependente: number;

  private calcularFatorRecebimentoDependente(nDependentes: number): number {
    return (1 / (1 + nDependentes)) * 0.5;
  }

  constructor(nDependentes: number) {
    this.fatorRecebimentoDependente =
      this.calcularFatorRecebimentoDependente(nDependentes);
  }

  calcularBeneficioParaDependente(
    totalArrecadado: number,
    rendimentosDependente: Rendimento[]
  ): number {
    const totalRendimentosDependente = rendimentosDependente.reduce(
      (acc, rendimento) => acc + rendimento.valor,
      0
    );
    const beneficioBruto = totalArrecadado * this.fatorRecebimentoDependente;
    const beneficioLiquido = beneficioBruto - totalRendimentosDependente;
    return beneficioLiquido;
  }
}
