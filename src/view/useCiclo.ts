import { useQuery, useQueryClient } from "@tanstack/react-query";
import { obterCicloUsecase } from "../usecases/usecases";

export function useCiclo(dataInicio: string) {
  const { data: ciclo = null, isLoading } = useQuery({
    queryKey: ["ciclos", dataInicio],
    queryFn: () => obterCicloUsecase.obterCiclo(dataInicio),
  });
  return { ciclo, isLoading };
}

export function useInvalidateCiclos() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["ciclos"] });
  };
}
