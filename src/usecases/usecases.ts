import { CiclosLocalRepository } from "../repositories/CiclosLocalRepository";
import { PessoasLocalRepository } from "../repositories/PessoasLocalRepository";
import { ObterCicloUsecase } from "./ObterCicloUsecase";
import { AdicionarPessoaUsecase } from "./AdicionarPessoaUsecase";

const pessoasRepository = new PessoasLocalRepository();
const ciclosRepository = new CiclosLocalRepository(pessoasRepository);

export const obterCicloUsecase = new ObterCicloUsecase(ciclosRepository);
export const adicionarPesoaUsecase = new AdicionarPessoaUsecase(
  ciclosRepository,
  pessoasRepository
);
