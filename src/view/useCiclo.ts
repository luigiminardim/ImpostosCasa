import { useQuery } from "@tanstack/react-query";
import { obterCicloUsecase } from "../usecases/usecases";

export function useCiclo(dataInicio: string) {
  const { data: ciclo, isLoading } = useQuery({
    queryKey: ["ciclos", dataInicio],
    queryFn: () => obterCicloUsecase.obterCiclo(dataInicio),
  });
  return { ciclo, isLoading };
}
