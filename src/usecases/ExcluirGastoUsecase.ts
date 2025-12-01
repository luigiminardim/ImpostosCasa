import type { CiclosRepository } from "./CiclosRepository";

export class ExcluirGastoUsecase {
  ciclosRepository: CiclosRepository;

  constructor(ciclosRepository: CiclosRepository) {
    this.ciclosRepository = ciclosRepository;
  }

  async excluirGastoDoCicloAtual(nomePessoa: string, nome: string): Promise<void> {
    const hoje = new Date();
    const cicloAtual = await this.ciclosRepository.obterCiclo(hoje);
    if (!cicloAtual) {
      throw new Error("Ciclo atual não encontrado");
    }
    cicloAtual.excluirGastoDaPessoa(nomePessoa, nome);
    this.ciclosRepository.salvarCiclo(cicloAtual);
  }
}
