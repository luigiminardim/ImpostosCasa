import { Ciclo, type DadoFinanceiro } from "../domain/Ciclo";
import type { Gasto } from "../domain/Gasto";
import { RelatorioCiclo } from "../domain/RelatorioCiclo";
import type { Rendimento } from "../domain/Rendimento";

type PessoaView = {
  nome: string;
  ehDependente: boolean;
  rendimentos: Rendimento[];
  gastos: Gasto[];

  // Contribuinte e Depentente
  gastosDedutiveisTotais: number;
  rendimentosTotais: number;

  // Contribuinte
  contribuicaoTotal: number;
  aPagar: number;

  // Dependente
  beneficiosTotais: number;
  aReceber: number;
};

export class CicloView {
  /** yyyy-mm-dd */
  dataInicio: string;

  /** yyyy-mm-dd */
  dataFim: null | string;

  pessoas: PessoaView[];

  arrecadacaoTotal: number;

  constructor(ciclo: Ciclo) {
    const relatorio = new RelatorioCiclo(ciclo);
    this.dataInicio = ciclo.dataInicio.toISOString().split("T")[0] ?? "";
    this.dataFim = ciclo.dataFim?.toISOString().split("T")[0] ?? null;
    this.pessoas = ciclo.dadosFinanceiros.map((dadoFinanceiro) =>
      CicloView.createPessoaView(dadoFinanceiro, relatorio)
    );
    this.arrecadacaoTotal = relatorio.arrecadacaoTotal;
  }

  private static createPessoaView(
    dadoFinanceiro: DadoFinanceiro,
    relatorio: RelatorioCiclo
  ): PessoaView {
    const pessoa = dadoFinanceiro.pessoa;
    const relatorioPessoa = relatorio.relatorioPessoa(pessoa.nome);
    if (!relatorioPessoa)
      throw new Error(`pessoa ${pessoa.nome} não encontrada no relatório`);
    const gastosDedutiveisTotais =
      relatorioPessoa.relatorio.gastosDedutiveisTotais;
    const rendimentosTotais = relatorioPessoa.relatorio.rendimentosTotais;
    const { beneficiosTotais, aReceber, contribuicaoTotal, aPagar } =
      relatorioPessoa.ehDependente
        ? {
            beneficiosTotais: relatorioPessoa.relatorio.beneficiosTotais,
            aReceber: relatorioPessoa.relatorio.aReceber,
            contribuicaoTotal: 0,
            aPagar: 0,
          }
        : {
            beneficiosTotais: 0,
            aReceber: 0,
            contribuicaoTotal: relatorioPessoa.relatorio.contribuicaoTotal,
            aPagar: relatorioPessoa.relatorio.aPagar,
          };

    return {
      nome: dadoFinanceiro.pessoa.nome,
      ehDependente: dadoFinanceiro.ehDependente,
      rendimentos: dadoFinanceiro.rendimentos,
      gastos: dadoFinanceiro.gastos,
      gastosDedutiveisTotais,
      rendimentosTotais,
      beneficiosTotais,
      aReceber,
      contribuicaoTotal,
      aPagar,
    };
  }
}
