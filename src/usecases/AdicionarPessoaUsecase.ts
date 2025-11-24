import { Pessoa } from "../domain/Pessoa";
import type { CiclosRepository } from "./CiclosRepository";
import type { PessoasRepository } from "./PessoasRepository";

export class AdicionarPessoaUsecase {
  private ciclosRepository: CiclosRepository;
  private pessoasRepository: PessoasRepository;

  constructor(
    ciclosRepository: CiclosRepository,
    pessoasRepository: PessoasRepository
  ) {
    this.ciclosRepository = ciclosRepository;
    this.pessoasRepository = pessoasRepository;
  }

  async adicionarPessoaNoCicloAtual(
    nomePessoa: string,
    ehDependente: boolean = false
  ): Promise<void> {
    const hoje = new Date();
    const ciclo = await this.ciclosRepository.obterCiclo(hoje);
    if (!ciclo) {
      throw new Error("Ciclo não encontrado");
    }
    const pessoa = new Pessoa({ nome: nomePessoa });
    await this.pessoasRepository.salvarPessoa(pessoa);
    if (ehDependente) {
      ciclo.adicionarDependente(pessoa);
    } else {
      ciclo.adicionarContribuinte(pessoa);
    }
    await this.ciclosRepository.salvarCiclo(ciclo);
    return;
  }
}
