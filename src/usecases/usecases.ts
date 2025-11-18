import { CiclosLocalRepository } from "../repositories/CiclosLocalRepository";
import { PessoasLocalRepository } from "../repositories/PessoasLocalRepository";
import { ObterCicloUsecase } from "./ObterCicloUsecase";

const pessoasRepository = new PessoasLocalRepository();
const ciclosRepository = new CiclosLocalRepository(pessoasRepository);

export const obterCicloUsecase = new ObterCicloUsecase(ciclosRepository);
