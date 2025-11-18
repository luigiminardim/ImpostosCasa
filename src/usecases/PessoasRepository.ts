import type { Pessoa } from "../domain/Pessoa";

export interface PessoasRepository {
    salvarPessoa(pessoa: Pessoa): Promise<void>;
    
    obterPessoa(nome: string): Promise<null | Pessoa>
    
    obterTodasPessoas(): Promise<Pessoa[]>;
}