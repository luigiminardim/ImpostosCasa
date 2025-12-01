import type { Gasto } from "./Gasto";
import type { Pessoa } from "./Pessoa";
import {
  PoliticaDependenciaCasaDependentesMeiadosComDeducao,
  type PoliticaDependencia,
} from "./PoliticaDependencia";
import {
  PoliticaImpostoCasaEDependentes,
  type PoliticaImposto,
} from "./PoliticaImposto";
import type { Rendimento } from "./Rendimento";

export type DadoFinanceiro = {
  pessoa: Pessoa;
  ehDependente: boolean;
  rendimentos: Rendimento[];
  gastos: Gasto[];
};

export class Ciclo {
  dataInicio: Date;

  dataFim: null | Date;

  dadosFinanceiros: DadoFinanceiro[];

  constructor(params: {
    dataInicio: Date;
    dataFim: null | Date;
    dadosFinanceiros: Ciclo["dadosFinanceiros"];
  }) {
    this.dataInicio = params.dataInicio;
    this.dataFim = params.dataFim;
    this.dadosFinanceiros = params.dadosFinanceiros;
  }

  static criarNovoCiclo() {
    const agora = new Date();
    const hoje = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate()
    );
    return new Ciclo({ dataInicio: hoje, dataFim: null, dadosFinanceiros: [] });
  }

  static criarNovoCicloAPartirDoAnterior(cicloAnterior: Ciclo) {
    const agora = new Date();
    const hoje = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate()
    );
    const dadosFinanceiros: Ciclo["dadosFinanceiros"] =
      cicloAnterior.dadosFinanceiros.map((dadoFinanceiroAnterior) => ({
        pessoa: dadoFinanceiroAnterior.pessoa,
        ehDependente: dadoFinanceiroAnterior.ehDependente,
        rendimentos: dadoFinanceiroAnterior.rendimentos.filter(
          (rendimento) => rendimento.ciclico
        ),
        gastos: dadoFinanceiroAnterior.gastos.filter((gasto) => gasto.ciclico),
      }));
    return new Ciclo({
      dataInicio: hoje,
      dataFim: null,
      dadosFinanceiros,
    });
  }

  encerrado(): boolean {
    return this.dataFim !== null;
  }

  encerrarCiclo() {
    if (this.dataFim !== null) {
      console.trace("Ciclo já está encerrado.");
      return;
    }
    const agora = new Date();
    const hoje = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate()
    );
    if (hoje <= this.dataInicio) {
      console.trace("Data de fim do ciclo deve ser após a data de início.");
      return;
    }
    this.dataFim = hoje;
  }

  pessoas(): Pessoa[] {
    return this.dadosFinanceiros.map((dado) => dado.pessoa);
  }

  contribuintes(): Pessoa[] {
    return this.dadosFinanceiros
      .filter((dado) => !dado.ehDependente)
      .map((dado) => dado.pessoa);
  }

  dependentes(): Pessoa[] {
    return this.dadosFinanceiros
      .filter((dado) => dado.ehDependente)
      .map((dado) => dado.pessoa);
  }

  private adicionarPessoa(nomePessoa: Pessoa, ehDependente: boolean) {
    if (
      this.dadosFinanceiros.find((dado) => dado.pessoa.nome === nomePessoa.nome)
    ) {
      console.trace("Pessoa já existe no ciclo.");
      return;
    }
    this.dadosFinanceiros.push({
      pessoa: nomePessoa,
      ehDependente,
      rendimentos: [],
      gastos: [],
    });
  }

  adicionarContribuinte(nomePessoa: Pessoa) {
    this.adicionarPessoa(nomePessoa, false);
  }

  adicionarDependente(nomePessoa: Pessoa) {
    this.adicionarPessoa(nomePessoa, true);
  }

  redimentosDaPessoa(pessoa: Pessoa): Rendimento[] {
    const dadosFinanceirosPessoa = this.dadosFinanceiros.find(
      (dado) => dado.pessoa.nome === pessoa.nome
    );
    if (!dadosFinanceirosPessoa) {
      console.trace("Pessoa não encontrada no ciclo.");
      return [];
    }
    return dadosFinanceirosPessoa.rendimentos;
  }

  /**
   * Adiciona ou atualiza um rendimento para a pessoa no ciclo.
   */
  adicionarRendimento(nomePessoa: Pessoa["nome"], rendimento: Rendimento) {
    const dadosFinanceirosPessoa = this.dadosFinanceiros.find(
      (dado) => dado.pessoa.nome === nomePessoa
    );
    if (!dadosFinanceirosPessoa) {
      console.trace("Pessoa não encontrada no ciclo.");
      return;
    }
    dadosFinanceirosPessoa.rendimentos = [
      ...dadosFinanceirosPessoa.rendimentos.filter(
        (r) => r.nome !== rendimento.nome
      ),
      rendimento,
    ];
  }

  excluirRendimentoDaPessoa(
    nomePessoa: Pessoa["nome"],
    nome: Rendimento["nome"]
  ) {
    const dadosFinanceirosPessoa = this.dadosFinanceiros.find(
      (dado) => dado.pessoa.nome === nomePessoa
    );
    if (!dadosFinanceirosPessoa) {
      console.trace("Pessoa não encontrada no ciclo.");
      return;
    }
    dadosFinanceirosPessoa.rendimentos =
      dadosFinanceirosPessoa.rendimentos.filter(
        (rendimento) => rendimento.nome !== nome
      );
  }

  gastosDaPessoa(pessoa: Pessoa): Gasto[] {
    const dadosFinanceirosPessoa = this.dadosFinanceiros.find(
      (dado) => dado.pessoa.nome === pessoa.nome
    );
    if (!dadosFinanceirosPessoa) {
      console.trace("Pessoa não encontrada no ciclo.");
      return [];
    }
    return dadosFinanceirosPessoa.gastos;
  }

  gastosRestituiveisDaPessoa(
    pessoa: Pessoa
  ): { beneficiario: null | Pessoa; gasto: Gasto }[] {
    const gastosEmQueEhPagador = this.dadosFinanceiros.flatMap((dado) =>
      dado.gastos
        .filter((gasto) => gasto.pagador?.nome === pessoa.nome)
        .map((gasto) => ({ beneficiario: dado.pessoa, gasto }))
    );
    return gastosEmQueEhPagador;
  }

  adicionarGasto(nomePessoa: Pessoa["nome"], gasto: Gasto) {
    const dadosFinanceirosPessoa = this.dadosFinanceiros.find(
      (dado) => dado.pessoa.nome === nomePessoa
    );
    if (!dadosFinanceirosPessoa) {
      console.trace("Pessoa não encontrada no ciclo.");
      return;
    }
    dadosFinanceirosPessoa.gastos = [
      ...dadosFinanceirosPessoa.gastos.filter((g) => g.nome !== gasto.nome),
      gasto,
    ];
  }

  politicaImposto(): PoliticaImposto {
    const nDependentes = this.dadosFinanceiros.filter(
      (dado) => dado.ehDependente
    ).length;
    return new PoliticaImpostoCasaEDependentes(nDependentes);
  }

  politicaDependencia(): PoliticaDependencia {
    const nDependentes = this.dadosFinanceiros.filter(
      (dado) => dado.ehDependente
    ).length;
    return new PoliticaDependenciaCasaDependentesMeiadosComDeducao(
      nDependentes
    );
  }
}
