import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "../../view/Layout";
import { useForm } from "@tanstack/react-form";
import { adicionarRendimentoUsecase } from "../../usecases/usecases";
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
  type MaskitoNumberParams,
} from "@maskito/kit";
import { useMaskito } from "@maskito/react";

export const Route = createFileRoute(
  "/ImpostosCasa/pessoas/$nome/rendimentos/adicionarNoCicloAtual"
)({
  component: RouteComponent,
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
  const nomePessoa = Route.useParams().nome;
  const form = useForm({
    defaultValues: {
      nome: "",
      valor: "",
      retidoNaFonte: false,
      ciclico: false,
    },
    async onSubmit({ value }) {
      const valor = maskitoParseNumber(value.valor, valorMaskParams);
      await adicionarRendimentoUsecase.adicionarRendimentoNoCicloAtual({
        nomePessoa,
        nome: value.nome,
        valor: valor,
        retidoNaFonte: value.retidoNaFonte,
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
      title="Adicionar Rendimento"
      footer={
        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              form="adicionar-pessoa-form"
              size="lg"
              width="full"
              loading={state.isSubmitting}
            >
              Adicionar Rendimento
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
          id="adicionar-pessoa-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Fieldset.Root size="lg">
            <Fieldset.Legend>
              Adicione um rendimento de {nomePessoa} ao ciclo atual.
            </Fieldset.Legend>
            <form.Field
              name="nome"
              validators={{
                onChange({ value }) {
                  return value.length > 3
                    ? undefined
                    : "O nome deve ter mais de 3 caracteres.";
                },
              }}
            >
              {(field) => (
                <Field.Root invalid={!field.state.meta.isValid}>
                  <Field.Label>
                    Nome do Rendimento <Field.RequiredIndicator />
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
            </form.Field  >
          </Fieldset.Root>
        </form>
      </Center>
    </Layout>
  );
}
