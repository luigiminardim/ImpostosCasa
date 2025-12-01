import type { Ciclo } from "./Ciclo";
import type { Pessoa } from "./Pessoa";

function calcularRendimentosTotais(ciclo: Ciclo, dependente: Pessoa): number {
  const rendimentos = ciclo.redimentosDaPessoa(dependente);
  return rendimentos.reduce((acc, rendimento) => acc + rendimento.valor, 0);
}

function calcularRendimentosRetidosNaFonteTotais(ciclo: Ciclo, pessoa: Pessoa) {
  const rendimentos = ciclo.redimentosDaPessoa(pessoa);
  return rendimentos
    .filter((rendimento) => rendimento.retidoNaFonte)
    .reduce((acc, rendimento) => acc + rendimento.valor, 0);
}

function calcularGastosTotais(ciclo: Ciclo, pessoa: Pessoa) {
  const infoGastos = ciclo.gastosDaPessoa(pessoa);
  return infoGastos.reduce((acc, infoGasto) => acc + infoGasto.valor, 0);
}

function calcularGastosRestituiveisTotais(ciclo: Ciclo, pessoa: Pessoa) {
  const infoGastos = ciclo.gastosRestituiveisDaPessoa(pessoa);
  return infoGastos.reduce((acc, infoGasto) => acc + infoGasto.gasto.valor, 0);
}

class RelatorioContribuinte {
  contribuinte: Pessoa;
  contribuicaoTotal: number;
  rendimentosTotais: number;
  gastosTotais: number;
  gastosRestituiveisTotais: number;
  aPagar: number;

  constructor(ciclo: Ciclo, contribuinte: Pessoa) {
    this.contribuinte = contribuinte;
    this.contribuicaoTotal = this.calcularContribuicaoTotal(
      ciclo,
      contribuinte
    );
    this.rendimentosTotais = calcularRendimentosTotais(ciclo, contribuinte);
    const rendimentosRetidosNaFonteTotais =
      calcularRendimentosRetidosNaFonteTotais(ciclo, contribuinte);
    this.gastosTotais = calcularGastosTotais(ciclo, contribuinte);
    this.gastosRestituiveisTotais = calcularGastosRestituiveisTotais(
      ciclo,
      contribuinte
    );
    this.aPagar =
      this.contribuicaoTotal -
      rendimentosRetidosNaFonteTotais +
      this.gastosTotais -
      this.gastosRestituiveisTotais;
  }

  private calcularContribuicaoTotal(
    ciclo: Ciclo,
    contribuinte: Pessoa
  ): number {
    const politicaImposto = ciclo.politicaImposto();
    const rendimentos = ciclo.redimentosDaPessoa(contribuinte);
    return politicaImposto.calcularImpostoSobreRendimentos(rendimentos);
  }
}

class RelatorioDependente {
  dependente: Pessoa;
  rendimentosTotais: number;
  beneficiosTotais: number;
  gastosTotais: number;
  gastosRestituiveisTotais: number;
  aReceber: number;

  constructor(ciclo: Ciclo, dependente: Pessoa, arrecadacaoTotal: number) {
    this.dependente = dependente;
    this.rendimentosTotais = calcularRendimentosTotais(ciclo, dependente);
    const rendimentosRetidosNaFonteTotais =
      calcularRendimentosRetidosNaFonteTotais(ciclo, dependente);
    this.beneficiosTotais = this.calcularBeneficiosTotaisDependente(
      ciclo,
      dependente,
      arrecadacaoTotal
    );
    this.gastosTotais = calcularGastosTotais(ciclo, dependente);
    this.gastosRestituiveisTotais = calcularGastosRestituiveisTotais(
      ciclo,
      dependente
    );
    this.aReceber =
      this.beneficiosTotais -
      this.gastosTotais +
      this.gastosRestituiveisTotais +
      rendimentosRetidosNaFonteTotais;
  }

  private calcularBeneficiosTotaisDependente(
    ciclo: Ciclo,
    dependente: Pessoa,
    arrecadacaoTotal: number
  ): number {
    const politicaDependencia = ciclo.politicaDependencia();
    const rendimentos = ciclo.redimentosDaPessoa(dependente);
    return politicaDependencia.calcularBeneficioParaDependente(
      arrecadacaoTotal,
      rendimentos
    );
  }
}

export class RelatorioCiclo {
  relatoriosContribuintes: RelatorioContribuinte[];
  relatoriosDependentes: RelatorioDependente[];
  arrecadacaoTotal: number;

  constructor(ciclo: Ciclo) {
    const contribuintes = ciclo.contribuintes();
    this.relatoriosContribuintes = contribuintes.map(
      (contribuinte) => new RelatorioContribuinte(ciclo, contribuinte)
    );

    this.arrecadacaoTotal = this.relatoriosContribuintes.reduce(
      (acc, relatorio) => acc + relatorio.contribuicaoTotal,
      0
    );

    const dependentes = ciclo.dependentes();
    this.relatoriosDependentes = dependentes.map(
      (dependente) =>
        new RelatorioDependente(ciclo, dependente, this.arrecadacaoTotal)
    );
  }

  public relatorioPessoa(
    nomePessoa: Pessoa["nome"]
  ):
    | { ehDependente: false; relatorio: RelatorioContribuinte }
    | { ehDependente: true; relatorio: RelatorioDependente }
    | null {
    const relatorioContribuinte = this.relatoriosContribuintes.find(
      (relatorio) => relatorio.contribuinte.nome === nomePessoa
    );
    if (relatorioContribuinte) {
      return { ehDependente: false, relatorio: relatorioContribuinte };
    }
    const relatorioDependente = this.relatoriosDependentes.find(
      (relatorio) => relatorio.dependente.nome === nomePessoa
    );
    if (relatorioDependente) {
      return { ehDependente: true, relatorio: relatorioDependente };
    }
    return null;
  }
}
