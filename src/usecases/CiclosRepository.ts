import type { Ciclo } from "../domain/Ciclo";
import type { IsoDate } from "../domain/objectValues/IsoDate";

export interface CiclosRepository {
  salvarCiclo(ciclo: Ciclo): Promise<void>;

  obterCiclo(data: IsoDate): Promise<null | Ciclo>;
}
