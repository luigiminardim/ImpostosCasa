import { createFileRoute, redirect } from "@tanstack/react-router";
import { obterCicloUsecase } from "../../usecases/usecases";

export const Route = createFileRoute("/ImpostosCasa/")({
  beforeLoad: async () => {
    const ciclo = await obterCicloUsecase.obterCicloAtual();
    throw redirect({
      to: `/ImpostosCasa/ciclos/$dataInicio`,
      params: { dataInicio: ciclo.dataInicio },
    });
  },
});
