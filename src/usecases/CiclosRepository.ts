import type { Ciclo } from "../domain/Ciclo";

export interface CiclosRepository {
  salvarCiclo(ciclo: Ciclo): Promise<void>;

  obterCiclo(data: Date): Promise<null | Ciclo>;
}
