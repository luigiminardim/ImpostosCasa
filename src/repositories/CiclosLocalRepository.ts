import { Ciclo, type DadoFinanceiro } from "../domain/Ciclo";
import { Gasto } from "../domain/Gasto";
import { Rendimento } from "../domain/Rendimento";
import type { CiclosRepository } from "../usecases/CiclosRepository";
import type { PessoasRepository } from "../usecases/PessoasRepository";

type RendimentoDao = {
  nome: string;
  valor: number;
  retidoNaFonte: boolean;
  ciclico: boolean;
};

type GastoDao = {
  nome: string;
  valor: number;
  nomePagador: null | string;
  ciclico: boolean;
};

type DadoFinanceiroDao = {
  nomePessoa: string;
  ehDependente: boolean;
  rendimentos: RendimentoDao[];
  gastos: GastoDao[];
};

class CicloDao {
  value: {
    /** yyyy-mm-dd */
    dataInicio: string;

    /** yyyy-mm-dd */
    dataFim: null | string;

    dadosFinanceiros: DadoFinanceiroDao[];
  };

  private constructor(value: CicloDao["value"]) {
    this.value = value;
  }

  static fromCiclo(ciclo: Ciclo): CicloDao {
    const ISO_DATE_LENGTH = "yyyy-mm-dd".length;
    const value: CicloDao["value"] = {
      dataInicio: ciclo.dataInicio.toISOString().substring(0, ISO_DATE_LENGTH),
      dataFim:
        ciclo.dataFim?.toISOString().substring(0, ISO_DATE_LENGTH) ?? null,
      dadosFinanceiros: ciclo.dadosFinanceiros.map((dadoFinanceiro) => ({
        nomePessoa: dadoFinanceiro.pessoa.nome,
        ehDependente: dadoFinanceiro.ehDependente,
        rendimentos: dadoFinanceiro.rendimentos.map((rendimento) => ({
          nome: rendimento.nome,
          valor: rendimento.valor,
          retidoNaFonte: rendimento.retidoNaFonte,
          ciclico: rendimento.ciclico,
        })),
        gastos: dadoFinanceiro.gastos.map((gasto) => ({
          nome: gasto.nome,
          valor: gasto.valor,
          nomePagador: gasto.pagador?.nome ?? null,
          ciclico: gasto.ciclico,
        })),
      })),
    };
    return new CicloDao(value);
  }

  toJson(): string {
    return JSON.stringify(this.value);
  }

  static fromJson(json: string): CicloDao {
    const value = JSON.parse(json);
    return new CicloDao(value);
  }

  async toCiclo(pessoasRepository: PessoasRepository): Promise<Ciclo | Error> {
    const dadosFinanceiros = (
      await Promise.all(
        this.value.dadosFinanceiros.map((dadoFinanceiro) =>
          CicloDao.dadoFinanceiroDaoToDadoFinanceiro(
            dadoFinanceiro,
            pessoasRepository
          )
        )
      )
    ).reduce((dadosFinanceiros, dadoFinanceiro) => {
      if (dadosFinanceiros instanceof Error) return dadosFinanceiros;
      if (dadoFinanceiro instanceof Error) return dadoFinanceiro;
      return [...dadosFinanceiros, dadoFinanceiro];
    }, [] as DadoFinanceiro[] | Error);
    if (dadosFinanceiros instanceof Error) {
      return dadosFinanceiros;
    }
    return new Ciclo({
      dataInicio: new Date(this.value.dataInicio),
      dataFim:
        this.value.dataFim === null ? null : new Date(this.value.dataFim),
      dadosFinanceiros,
    });
  }

  private static async dadoFinanceiroDaoToDadoFinanceiro(
    dadoFinanceiro: DadoFinanceiroDao,
    pessoasRepository: PessoasRepository
  ): Promise<DadoFinanceiro | Error> {
    const pessoa = await pessoasRepository.obterPessoa(
      dadoFinanceiro.nomePessoa
    );
    if (!pessoa) {
      const error = `Ciclo.dadoFinanceiroDaoToDadoFinanceiro: pessoa ${dadoFinanceiro.nomePessoa} não encontrada`;
      throw new Error(error);
    }
    const gastos = (
      await Promise.all(
        dadoFinanceiro.gastos.map((gastoDao) =>
          this.gastoDaoToGasto(gastoDao, pessoasRepository)
        )
      )
    ).reduce((gastos, gasto) => {
      if (gastos instanceof Error) return gastos;
      if (gasto instanceof Error) return gasto;
      return [...gastos, gasto];
    }, [] as Gasto[] | Error);
    if (gastos instanceof Error) {
      return gastos;
    }
    return {
      pessoa,
      ehDependente: dadoFinanceiro.ehDependente,
      gastos,
      rendimentos: dadoFinanceiro.rendimentos.map((rendimentoDao) =>
        this.rendimentoDaoToRendimento(rendimentoDao)
      ),
    } as DadoFinanceiro;
  }

  private static async gastoDaoToGasto(
    gastoDao: DadoFinanceiroDao["gastos"][0],
    pessoasRepository: PessoasRepository
  ): Promise<Gasto | Error> {
    const pagador =
      gastoDao.nomePagador === null
        ? null
        : await pessoasRepository.obterPessoa(gastoDao.nomePagador);
    if (gastoDao.nomePagador && pagador === null) {
      const error = `CicloDao.gastoDaoToGasto: pessoa ${gastoDao.nomePagador} não encontrada`;
      return new Error(error);
    }
    return new Gasto({
      nome: gastoDao.nome,
      valor: gastoDao.valor,
      pagador,
      ciclico: gastoDao.ciclico,
    });
  }

  private static rendimentoDaoToRendimento(
    rendimentoDao: RendimentoDao
  ): Rendimento {
    return new Rendimento({
      nome: rendimentoDao.nome,
      valor: rendimentoDao.valor,
      retidoNaFonte: rendimentoDao.retidoNaFonte,
      ciclico: rendimentoDao.ciclico,
    });
  }
}

export class CiclosLocalRepository implements CiclosRepository {
  private pessoasRepository: PessoasRepository;

  constructor(pessoasRepository: PessoasRepository) {
    this.pessoasRepository = pessoasRepository;
  }

  private static indiceCiclo(dataInicio: Date): string {
    const ISO_DATE_LENGTH = "yyyy-mm-dd".length;
    const id = dataInicio.toISOString().substring(0, ISO_DATE_LENGTH);
    return `ciclos/${id}`;
  }

  private obterIndices(): string[] {
    const json = window.localStorage.getItem("ciclos/*");
    if (json === null) return [];
    const indices = JSON.parse(json) as string[];
    return indices;
  }

  private salvarIndices(indices: string[]) {
    const json = JSON.stringify(indices);
    window.localStorage.setItem("ciclos/*", json);
  }

  private salvarIndice(indice: string) {
    const indices = this.obterIndices();
    if (indices.some((x) => x === indice)) return;
    indices.push(indice);
    indices.sort();
    this.salvarIndices(indices);
  }

  async salvarCiclo(ciclo: Ciclo): Promise<void> {
    const indice = CiclosLocalRepository.indiceCiclo(ciclo.dataInicio);
    const cicloJson = CicloDao.fromCiclo(ciclo).toJson();
    window.localStorage.setItem(indice, cicloJson);
    this.salvarIndice(indice);
  }

  async obterCiclo(data: Date): Promise<null | Ciclo> {
    const indices = await this.obterIndices();
    const primeiroIndiceMaiorOuIgual = indices.find((indice) => {
      const dataInicioStr = indice.substring("ciclos/".length);
      const dataInicio = new Date(dataInicioStr);
      return dataInicio <= data;
    });
    if (!primeiroIndiceMaiorOuIgual) {
      return null;
    }
    const json = window.localStorage.getItem(primeiroIndiceMaiorOuIgual);
    if (json === null) return null;
    const ciclo = await CicloDao.fromJson(json).toCiclo(this.pessoasRepository);
    if (ciclo instanceof Error) {
      throw ciclo;
    }
    return ciclo;
  }
}
