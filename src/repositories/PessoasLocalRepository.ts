import { Pessoa } from "../domain/Pessoa";
import type { PessoasRepository } from "../usecases/PessoasRepository";

class PessoaDao {
  value: {
    nome: string;
  };

  private constructor(value: PessoaDao["value"]) {
    this.value = value;
  }

  static fromPessoa(pessoa: Pessoa) {
    return new PessoaDao({ nome: pessoa.nome });
  }

  toJson(): string {
    return JSON.stringify(this.value);
  }

  static fromJsonString(jsonString: string) {
    const value = JSON.parse(jsonString) as PessoaDao["value"];
    return new PessoaDao(value);
  }

  toPessoa(): Pessoa {
    return new Pessoa({ nome: this.value.nome });
  }
}

export class PessoasLocalRepository implements PessoasRepository {
  async obterTodasPessoas(): Promise<Pessoa[]> {
    const indices = await this.obterIndicesPessoas();
    const pessoas = (await Promise.all(indices.map(this.obterPessoa))).flatMap(
      (pessoa) => (pessoa === null ? [] : pessoa)
    );
    return pessoas;
  }

  private async obterIndicesPessoas(): Promise<string[]> {
    const indicesPessoas = window.localStorage.getItem("pessoas/*");
    if (!indicesPessoas) {
      return [];
    }
    return JSON.parse(indicesPessoas) as string[];
  }

  async obterPessoa(nome: string): Promise<Pessoa | null> {
    const pessoaJson = window.localStorage.getItem(`pessoas/${nome}`);
    if (!pessoaJson) return null;
    return PessoaDao.fromJsonString(pessoaJson).toPessoa();
  }

  async salvarPessoa(pessoa: Pessoa): Promise<void> {
    const pessoaJson = PessoaDao.fromPessoa(pessoa).toJson();
    window.localStorage.setItem(`pessoa/${pessoa.nome}`, pessoaJson);
    await this.adicionarPessoaAoIndice(pessoa);
  }

  private async adicionarPessoaAoIndice(pessoa: Pessoa): Promise<void> {
    const indices = await this.obterIndicesPessoas();
    if (indices.some((indice) => indice === pessoa.nome)) {
      return;
    }
    indices.push(pessoa.nome);
    window.localStorage.setItem("pessoas/*", JSON.stringify(indices));
  }
}
