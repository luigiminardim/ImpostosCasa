import { Ciclo } from "../domain/Ciclo";
import type { CiclosRepository } from "./CiclosRepository";
import { CicloView } from "./CicloView";

export class ObterCicloUsecase {
  private cicloRepository: CiclosRepository;

  constructor(cicloRepository: CiclosRepository) {
    this.cicloRepository = cicloRepository;
  }

  async obterCicloAtual(): Promise<CicloView> {
    const hoje = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );
    const ultimoCiclo =
      (await this.cicloRepository.obterCiclo(hoje)) ??
      (await this.criarNovoCiclo());
    const ultimoCicloAberto = ultimoCiclo.encerrado()
      ? await this.criarNovoCicloAPartirDoAnterior(ultimoCiclo)
      : ultimoCiclo;
    return new CicloView(ultimoCicloAberto);
  }

  async obterCiclo(data: string): Promise<null | CicloView> {
    const dataObj = new Date(data);
    const ciclo = await this.cicloRepository.obterCiclo(dataObj);
    if (!ciclo) return null;
    return new CicloView(ciclo);
  }

  private async criarNovoCiclo(): Promise<Ciclo> {
    const novoCiclo = Ciclo.criarNovoCiclo();
    await this.cicloRepository.salvarCiclo(novoCiclo);
    return novoCiclo;
  }

  private async criarNovoCicloAPartirDoAnterior(
    cicloAnterior: Ciclo
  ): Promise<Ciclo> {
    const novoCiclo = Ciclo.criarNovoCicloAPartirDoAnterior(cicloAnterior);
    await this.cicloRepository.salvarCiclo(novoCiclo);
    return novoCiclo;
  }
}
