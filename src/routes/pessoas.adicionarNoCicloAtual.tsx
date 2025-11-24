import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "../view/Layout";
import {
  Button,
  Center,
  Field,
  Fieldset,
  Input,
  Switch,
} from "@chakra-ui/react";
import { adicionarPesoaUsecase } from "../usecases/usecases";
import { useForm } from "@tanstack/react-form";

export const Route = createFileRoute("/pessoas/adicionarNoCicloAtual")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const form = useForm({
    defaultValues: {
      nome: "",
      ehDependente: false,
    },
    async onSubmit({ value }) {
      await adicionarPesoaUsecase.adicionarPessoaNoCicloAtual(
        value.nome,
        value.ehDependente
      );
      navigate({ to: "/" });
    },
  });

  return (
    <Layout
      title="Adicionar Pessoa"
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
              Adicionar Pessoa
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
              Adicione uma pessoa ao ciclo atual
            </Fieldset.Legend>
            <form.Field
              name="nome"
              validators={{
                onChange({ value }) {
                  return value.length > 3
                    ? undefined
                    : "O nome deve ter mais de 3 caracteres";
                },
              }}
            >
              {(field) => (
                <Field.Root invalid={!field.state.meta.isValid}>
                  <Field.Label>
                    Nome Completo <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    size="lg"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    onBlur={field.handleBlur}
                  />
                  <Field.ErrorText>
                    {field.state.meta.errors.join(", ")}
                    Dê um nome completo válido para essa pessoa.
                  </Field.ErrorText>
                </Field.Root>
              )}
            </form.Field>
            <form.Field name="ehDependente">
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
                    <Switch.Label>Dependente</Switch.Label>
                  </Switch.Root>
                  <Field.HelperText>
                    Pessoa que depende financeiramente dos outro membro da
                    família. Não contribui com os impostos do ciclo e pode
                    receber benefícios conforme a política do ciclo.
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
