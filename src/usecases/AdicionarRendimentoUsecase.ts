import { Rendimento } from "../domain/Rendimento";
import type { CiclosRepository } from "./CiclosRepository";

export class AdicionarRendimentoUsecase {
  private ciclosRepository: CiclosRepository;

  constructor(ciclosRepository: CiclosRepository) {
    this.ciclosRepository = ciclosRepository;
  }

  async adicionarRendimentoNoCicloAtual(params: {
    nomePessoa: string;
    nome: string;
    valor: number;
    retidoNaFonte: boolean;
    ciclico: boolean;
  }): Promise<void> {
    const hoje = new Date();
    const cicloAtual = await this.ciclosRepository.obterCiclo(hoje);
    if (!cicloAtual) {
      throw new Error("Ciclo atual não encontrado");
    }
    const rendimento = new Rendimento({
      nome: params.nome,
      valor: params.valor,
      retidoNaFonte: params.retidoNaFonte,
      ciclico: params.ciclico,
    });
    cicloAtual.adicionarRendimento(params.nomePessoa, rendimento);
    await this.ciclosRepository.salvarCiclo(cicloAtual);
  }
}
