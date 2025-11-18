import { createFileRoute, redirect } from "@tanstack/react-router";
import { Loading, Page } from "@geist-ui/core";
import { obterCicloUsecase } from "../../usecases/usecases";
import { useCiclo } from "../../view/useCiclo";

export const Route = createFileRoute("/ciclos/$dataInicio")({
  component: CicloPage,

  beforeLoad: async ({ params }) => {
    const ciclo = await obterCicloUsecase.obterCiclo(params.dataInicio);
    if (!ciclo) {
      throw redirect({ to: "/" });
    }
    if (ciclo.dataInicio !== params.dataInicio) {
      throw redirect({
        to: "/ciclos/$dataInicio",
        params: {
          dataInicio: params.dataInicio,
        },
      });
    }
  },
});

function CicloPage() {
  const { dataInicio } = Route.useParams();
  const { ciclo, isLoading: isLoadingCiclo } = useCiclo(dataInicio);

  if (isLoadingCiclo) return <Loading>Carregando</Loading>;
  if (!ciclo) return <>Ciclo Não encontrado</>;

  return (
    <Page dotBackdrop>
      <Page.Header center>Ciclo {ciclo.dataInicio}</Page.Header>
      <Page.Content>Page</Page.Content>
      <Page.Footer>Footer</Page.Footer>
    </Page>
  );
}
