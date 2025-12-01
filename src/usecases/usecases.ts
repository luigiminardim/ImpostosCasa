import { CiclosLocalRepository } from "../repositories/CiclosLocalRepository";
import { PessoasLocalRepository } from "../repositories/PessoasLocalRepository";
import { ObterCicloUsecase } from "./ObterCicloUsecase";
import { AdicionarPessoaUsecase } from "./AdicionarPessoaUsecase";
import { AdicionarRendimentoUsecase } from "./AdicionarRendimentoUsecase";
import { AdicionarGastoUsecase } from "./AdicionarGastoUsecase";
import { ExcluirRendimentoUsecase } from "./ExcluirRendimentoUsecase";

const pessoasRepository = new PessoasLocalRepository();
const ciclosRepository = new CiclosLocalRepository(pessoasRepository);

export const obterCicloUsecase = new ObterCicloUsecase(ciclosRepository);
export const adicionarPesoaUsecase = new AdicionarPessoaUsecase(
  ciclosRepository,
  pessoasRepository
);
export const adicionarRendimentoUsecase = new AdicionarRendimentoUsecase(
  ciclosRepository
);
export const excluirRendimentoUsecase = new ExcluirRendimentoUsecase(
  ciclosRepository
);
export const adicionarGastoUsecase = new AdicionarGastoUsecase(
  ciclosRepository
);
