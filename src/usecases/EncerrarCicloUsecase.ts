import { Ciclo } from "../domain/Ciclo";
import { IsoDate } from "../domain/objectValues/IsoDate";
import type { CiclosRepository } from "./CiclosRepository";

export class EncerrarCicloUsecase {
  private ciclosRepository: CiclosRepository;

  constructor(ciclosRepository: CiclosRepository) {
    this.ciclosRepository = ciclosRepository;
  }

  async encerrarCicloAtual(): Promise<void> {
    const hoje = IsoDate.today();
    const cicloAtual = await this.ciclosRepository.obterCiclo(hoje);
    if (!cicloAtual) {
      throw new Error("Nenhum ciclo ativo encontrado para encerrar.");
    }
    cicloAtual.encerrar();
    await this.ciclosRepository.salvarCiclo(cicloAtual);
    const novoCiclo = Ciclo.criarNovoCicloAPartirDoAnterior(cicloAtual);
    await this.ciclosRepository.salvarCiclo(novoCiclo);
  }
}
