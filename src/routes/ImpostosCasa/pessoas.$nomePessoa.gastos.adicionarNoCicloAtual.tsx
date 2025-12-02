import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "../../view/Layout";
import { useForm } from "@tanstack/react-form";
import { adicionarGastoUsecase } from "../../usecases/usecases";
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
  type MaskitoNumberParams,
} from "@maskito/kit";
import { useMaskito } from "@maskito/react";

export const Route = createFileRoute(
  "/ImpostosCasa/pessoas/$nomePessoa/gastos/adicionarNoCicloAtual"
)({
  component: RouteComponent,
  async loader({ params }) {
    const opcoesPagadores =
      await adicionarGastoUsecase.obterOpcaoDePagadoresNoCicloAtual(
        params.nomePessoa
      );
    return { opcoesPagadores };
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
  const { nomePessoa } = Route.useParams();
  const { opcoesPagadores } = Route.useLoaderData();
  const opcoesPagadoresCollection = createListCollection({
    items: opcoesPagadores.map((nome) => ({ label: nome, value: nome })),
  });
  const form = useForm({
    defaultValues: {
      nome: "",
      valor: "",
      possuiPagador: false,
      nomePagador: undefined as undefined | string,
      ciclico: false,
    },
    async onSubmit({ value }) {
      const valor = maskitoParseNumber(value.valor, valorMaskParams);
      const nomePagador = value.possuiPagador
        ? (value.nomePagador ?? null)
        : null;
      await adicionarGastoUsecase.adicionarGastoNoCicloAtual({
        nomePessoa,
        nome: value.nome,
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
      title="Adicionar Gasto"
      footer={
        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              form="adicionar-gasto-form"
              size="lg"
              width="full"
              loading={state.isSubmitting}
            >
              Adicionar Gasto
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
          id="adicionar-gasto-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Fieldset.Root size="lg">
            <Fieldset.Legend>
              Adicione um gasto de {nomePessoa} ao ciclo atual.
            </Fieldset.Legend>
            <form.Field
              name="nome"
              validators={{
                onBlur({ value }) {
                  return value.length > 3
                    ? undefined
                    : "O nome deve ter mais de 3 caracteres.";
                },
              }}
            >
              {(field) => (
                <Field.Root invalid={!field.state.meta.isValid}>
                  <Field.Label>
                    Nome do Gasto <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    size="lg"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    onBlur={field.handleBlur}
                  />
                  <Field.ErrorText>
                    {field.state.meta.errors.join(" ")}
                  </Field.ErrorText>
                </Field.Root>
              )}
            </form.Field>
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
            <form.Field name="possuiPagador">
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
                    <Switch.Label>Possui Pagador</Switch.Label>
                  </Switch.Root>
                  <Field.ErrorText>
                    {field.state.meta.errors.join(" ")}
                  </Field.ErrorText>
                  <Field.HelperText>
                    Quando marcado, indica que este gasto foi pago por outra
                    pessoa do ciclo. Caso contrário, o gasto é considerado como
                    pago pela casa.
                  </Field.HelperText>
                </Field.Root>
              )}
            </form.Field>
            <form.Subscribe>
              {(state) =>
                state.values.possuiPagador && (
                  <form.Field name="nomePagador">
                    {(field) => (
                      <Field.Root invalid={!field.state.meta.isValid}>
                        <Select.Root
                          collection={opcoesPagadoresCollection}
                          width="full"
                          value={undefined}
                          onValueChange={(e) => {
                            field.setValue(e.value[0]);
                          }}
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
                                {opcoesPagadoresCollection.items.map(
                                  (opcaoPagador) => (
                                    <Select.Item
                                      item={opcaoPagador}
                                      key={opcaoPagador.value}
                                    >
                                      {opcaoPagador.label}
                                      <Select.ItemIndicator />
                                    </Select.Item>
                                  )
                                )}
                              </Select.Content>
                            </Select.Positioner>
                          </Portal>
                        </Select.Root>
                      </Field.Root>
                    )}
                  </form.Field>
                )
              }
            </form.Subscribe>
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
