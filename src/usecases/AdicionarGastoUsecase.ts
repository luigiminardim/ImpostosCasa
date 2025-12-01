import { Gasto } from "../domain/Gasto";
import type { CiclosRepository } from "./CiclosRepository";

export class AdicionarGastoUsecase {
  private ciclosRepository: CiclosRepository;

  constructor(ciclosRepository: CiclosRepository) {
    this.ciclosRepository = ciclosRepository;
  }

  async obterOpcaoDePagadoresNoCicloAtual(nomePessoa: string): Promise<string[]> {
    const hoje = new Date();
    const cicloAtual = await this.ciclosRepository.obterCiclo(hoje);
    if (!cicloAtual) {
      throw new Error("Ciclo atual não encontrado");
    }
    const pessoasNoCiclo = cicloAtual.pessoas()
      .map((p) => p.nome)
      .filter((nome) => nome !== nomePessoa);
    return pessoasNoCiclo;
  }

  async adicionarGastoNoCicloAtual(params: {
    nomePessoa: string;
    nome: string;
    valor: number;
    nomePagador: null | string;
    ciclico: boolean;
  }): Promise<void> {
    const hoje = new Date();
    const cicloAtual = await this.ciclosRepository.obterCiclo(hoje);
    if (!cicloAtual) {
      throw new Error("Ciclo atual não encontrado");
    }
    const pagador =
      cicloAtual.pessoas().find((p) => p.nome === params.nomePagador) || null;
    if (params.nomePagador !== null && pagador === null) {
      throw new Error("Pagador não encontrado no ciclo atual");
    }
    const gasto = new Gasto({
      nome: params.nome,
      valor: params.valor,
      pagador: pagador,
      ciclico: params.ciclico,
    });
    cicloAtual.adicionarGasto(params.nomePessoa, gasto);
    await this.ciclosRepository.salvarCiclo(cicloAtual);
  }
}
