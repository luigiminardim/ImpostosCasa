import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "../view/Layout";
import { useForm } from "@tanstack/react-form";
import { adicionarRendimentoUsecase, obterCicloUsecase } from "../usecases/usecases";
import {
  Button,
  Center,
  Field,
  Fieldset,
  Input,
  InputGroup,
  Switch,
} from "@chakra-ui/react";
import {
  maskitoNumberOptionsGenerator,
  maskitoParseNumber,
  maskitoStringifyNumber,
  type MaskitoNumberParams,
} from "@maskito/kit";
import { useMaskito } from "@maskito/react";

export const Route = createFileRoute("/pessoas/$nomePessoa/rendimentos/$nome")({
  component: RouteComponent,
  loader: async ({params}) => {
    const cicloView = await obterCicloUsecase.obterCicloAtual();
    const pessoa = cicloView.pessoas.find(p => p.nome === params.nomePessoa);
    if (!pessoa) {
      throw new Response("Pessoa não encontrada", { status: 404 });
    }
    const rendimento = pessoa.rendimentos.find(r => r.nome === params.nome);
    if (!rendimento) {
      throw new Response("Rendimento não encontrado", { status: 404 });
    }
    return { rendimento };
  }
});

const valorMaskParams: MaskitoNumberParams = {
  min: 0,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  thousandSeparator: ".",
  decimalSeparator: ",",
};

function RouteComponent() {
  const navigate = Route.useNavigate();
  const nome = Route.useParams().nome;
  const nomePessoa = Route.useParams().nomePessoa;
  const { rendimento } = Route.useLoaderData();
  const form = useForm({
    defaultValues: {
      valor: maskitoStringifyNumber(rendimento.valor, valorMaskParams),
      retidoNaFonte: rendimento.retidoNaFonte,
      ciclico: rendimento.ciclico,
    },
    async onSubmit({ value }) {
      const valor = maskitoParseNumber(value.valor, valorMaskParams);
      await adicionarRendimentoUsecase.adicionarRendimentoNoCicloAtual({
        nomePessoa,
        nome: nome,
        valor: valor,
        retidoNaFonte: value.retidoNaFonte,
        ciclico: value.ciclico,
      });
      navigate({ to: "/" });
    },
  });
  const valueInputRef = useMaskito({
    options: maskitoNumberOptionsGenerator(valorMaskParams),
  });

  return (
    <Layout
      title="Editar Rendimento"
      footer={
        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              form="editar-rendimento-form"
              size="lg"
              width="full"
              loading={state.isSubmitting}
            >
              Editar Rendimento
            </Button>
          )}
        </form.Subscribe>
      }
    >
      <Center
        asChild
        flexGrow={1}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"space-around"}
      >
        <form
          id="editar-rendimento-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Fieldset.Root size="lg">
            <Fieldset.Legend>
              Edite o rendimento <b>{nome}</b> de {nomePessoa} no ciclo atual.
            </Fieldset.Legend>
            <Field.Root disabled>
              <Field.Label>
                Nome do Rendimento <Field.RequiredIndicator />
              </Field.Label>
              <Input size="lg" name={"nome"} value={nome} />
            </Field.Root>
            <form.Field name="valor">
              {(field) => (
                <Field.Root invalid={!field.state.meta.isValid}>
                  <Field.Label>
                    Nome do Rendimento <Field.RequiredIndicator />
                  </Field.Label>
                  <InputGroup startAddon="R$">
                    <Input
                      ref={valueInputRef}
                      size="lg"
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.currentTarget.value);
                      }}
                      onBlur={field.handleBlur}
                    />
                  </InputGroup>
                  <Field.ErrorText>
                    {field.state.meta.errors.join(", ")}
                  </Field.ErrorText>
                </Field.Root>
              )}
            </form.Field>
            <form.Field name="retidoNaFonte">
              {(field) => (
                <Field.Root invalid={!field.state.meta.isValid}>
                  <Switch.Root
                    size="lg"
                    name={field.name}
                    checked={field.state.value}
                    onCheckedChange={(e) => field.handleChange(e.checked)}
                    onBlur={field.handleBlur}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    <Switch.Label>Retido na Fonte</Switch.Label>
                  </Switch.Root>
                  <Field.HelperText>
                    Quando marcado, indica que o imposto sobre este rendimento
                    já foi retido e descontado pelo pagador, funcionando como
                    crédito tributário.
                  </Field.HelperText>
                </Field.Root>
              )}
            </form.Field>
            <form.Field name="ciclico">
              {(field) => (
                <Field.Root invalid={!field.state.meta.isValid}>
                  <Switch.Root
                    size="lg"
                    name={field.name}
                    checked={field.state.value}
                    onCheckedChange={(e) => field.handleChange(e.checked)}
                    onBlur={field.handleBlur}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    <Switch.Label>Cíclico</Switch.Label>
                  </Switch.Root>
                  <Field.HelperText>
                    Indica se este rendimento deve ser adicionado
                    automaticamente em futuros ciclos.
                  </Field.HelperText>
                </Field.Root>
              )}
            </form.Field>
          </Fieldset.Root>
        </form>
      </Center>
    </Layout>
  );
}
