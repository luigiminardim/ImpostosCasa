import { IsoDate } from "../domain/objectValues/IsoDate";
import type { CiclosRepository } from "./CiclosRepository";

export class ExcluirRendimentoUsecase {
  ciclosRepository: CiclosRepository;

  constructor(ciclosRepository: CiclosRepository) {
    this.ciclosRepository = ciclosRepository;
  }

  async excluirRendimentoDoCicloAtual(
    nomePessoa: string,
    nome: string
  ): Promise<void> {
    const hoje = IsoDate.today();
    const cicloAtual = await this.ciclosRepository.obterCiclo(hoje);
    if (!cicloAtual) {
      throw new Error("Ciclo atual não encontrado");
    }
    cicloAtual.excluirRendimentoDaPessoa(nomePessoa, nome);
    this.ciclosRepository.salvarCiclo(cicloAtual);
  }
}
