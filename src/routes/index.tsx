import { createFileRoute, redirect } from "@tanstack/react-router";
import { obterCicloUsecase } from "../usecases/usecases";

export const Route = createFileRoute("/")({
  beforeLoad: async ({}) => {
    const ciclo = await obterCicloUsecase.obterCicloAtual();
    throw redirect({
      to: `/ciclos/$dataInicio`,
      params: { dataInicio: ciclo.dataInicio },
    });
  },
});
