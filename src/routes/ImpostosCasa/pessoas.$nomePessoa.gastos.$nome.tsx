import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "../../view/Layout";
import { useForm } from "@tanstack/react-form";
import { adicionarGastoUsecase, obterCicloUsecase } from "../../usecases/usecases";
import {
  Button,
  Center,
  createListCollection,
  Field,
  Fieldset,
  Input,
  InputGroup,
  Portal,
  Select,
  Switch,
} from "@chakra-ui/react";
import {
  maskitoNumberOptionsGenerator,
  maskitoParseNumber,
  maskitoStringifyNumber,
  type MaskitoNumberParams,
} from "@maskito/kit";
import { useMaskito } from "@maskito/react";

export const Route = createFileRoute("/ImpostosCasa/pessoas/$nomePessoa/gastos/$nome")({
  component: RouteComponent,
  async loader({ params }) {
    const ciclo = await obterCicloUsecase.obterCicloAtual();
    const gastosDaPessoa = ciclo.pessoas.find(
      (p) => p.nome === params.nomePessoa
    );
    if (!gastosDaPessoa) {
      throw new Error("Pessoa não encontrada no ciclo atual");
    }
    const gasto = gastosDaPessoa?.gastos.find((g) => g.nome === params.nome);
    if (!gasto) {
      throw new Error("Gasto não encontrado");
    }
    return { gasto };
  },
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
  const { nomePessoa, nome } = Route.useParams();
  const { gasto } = Route.useLoaderData();
  const opcoesPagadoresCollection = createListCollection({
    items: gasto.pagador
      ? [{ value: gasto.pagador.nome, label: gasto.pagador.nome }]
      : [],
  });
  const form = useForm({
    defaultValues: {
      valor: maskitoStringifyNumber(gasto.valor, valorMaskParams),
      ciclico: gasto.ciclico,
    },
    async onSubmit({ value }) {
      const valor = maskitoParseNumber(value.valor, valorMaskParams);
      const nomePagador = gasto.pagador?.nome ?? null;
      await adicionarGastoUsecase.adicionarGastoNoCicloAtual({
        nomePessoa,
        nome: nome,
        valor: valor,
        nomePagador: nomePagador,
        ciclico: value.ciclico,
      });
      navigate({ to: "/ImpostosCasa" });
    },
  });
  const valueInputRef = useMaskito({
    options: maskitoNumberOptionsGenerator(valorMaskParams),
  });

  return (
    <Layout
      title="Editar Gasto"
      footer={
        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              form="editar-gasto-form"
              size="lg"
              width="full"
              loading={state.isSubmitting}
            >
              Editar Gasto
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
          id="editar-gasto-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Fieldset.Root size="lg">
            <Fieldset.Legend>
              Edite o gasto {nome} de {nomePessoa} no ciclo atual.
            </Fieldset.Legend>

            <Field.Root disabled>
              <Field.Label>
                Nome do Gasto <Field.RequiredIndicator />
              </Field.Label>
              <Input size="lg" name={"nome"} value={nome} />
            </Field.Root>
            <form.Field
              name="valor"
              validators={{
                onSubmit({ value }) {
                  if (value.trim() === "") {
                    return "Informe o valor do gasto.";
                  }
                  const valor = maskitoParseNumber(value, valorMaskParams);
                  if (valor < 0) return "Informe um valor.";
                  return;
                },
              }}
            >
              {(field) => (
                <Field.Root invalid={!field.state.meta.isValid}>
                  <Field.Label>Valor</Field.Label>
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
                    {field.state.meta.errors.join(" ")}
                  </Field.ErrorText>
                </Field.Root>
              )}
            </form.Field>
            <Field.Root disabled>
              <Switch.Root
                size="lg"
                name={"possuiPagador"}
                checked={gasto.pagador !== null}
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Label>Possui Pagador</Switch.Label>
              </Switch.Root>
              <Field.HelperText>
                Quando marcado, indica que este gasto foi pago por outra pessoa
                do ciclo. Caso contrário, o gasto é considerado como pago pela
                casa.
              </Field.HelperText>
            </Field.Root>
            {gasto.pagador !== null && (
              <Field.Root disabled>
                <Select.Root
                  collection={opcoesPagadoresCollection}
                  width="full"
                  value={[gasto.pagador.nome]}
                >
                  <Select.HiddenSelect />
                  <Select.Label>Pagador</Select.Label>
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Selecione o pagador" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {opcoesPagadoresCollection.items.map((opcaoPagador) => (
                          <Select.Item
                            item={opcaoPagador}
                            key={opcaoPagador.value}
                          >
                            {opcaoPagador.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Field.Root>
            )}
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
