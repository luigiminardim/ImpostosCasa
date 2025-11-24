import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { obterCicloUsecase } from "../usecases/usecases";
import { useCiclo } from "../view/useCiclo";
import {
  Accordion,
  Avatar,
  Badge,
  Button,
  Center,
  EmptyState,
  For,
  FormatNumber,
  Heading,
  IconButton,
  Menu,
  Portal,
  Stack,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuPlus, LuUserPlus } from "react-icons/lu";
import type { CicloView } from "../usecases/CicloView";
import { Layout } from "../view/Layout";
import { RiParentFill } from "react-icons/ri";

export const Route = createFileRoute("/ciclos/$dataInicio")({
  component: CicloPage,

  beforeLoad: async ({ params }) => {
    const ciclo = await obterCicloUsecase.obterCiclo(params.dataInicio);
    console.log("Ciclo na rota:", ciclo);
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
  const { ciclo } = useCiclo(dataInicio);

  if (ciclo === null) return <></>;
  return (
    <Layout title="Imposto Família" footer={<ResumoFooter ciclo={ciclo} />}>
      {ciclo.pessoas.length > 0 ? (
        <PessoasSection pessoas={ciclo.pessoas} />
      ) : (
        <EmptyPessoasSection />
      )}
    </Layout>
  );
}

function EmptyPessoasSection() {
  return (
    <Center flexGrow={1}>
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <LuUserPlus />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>Não há pessoas cadastradas</EmptyState.Title>
            <EmptyState.Description>
              Adicione pessoas para começar a gerenciar as finças de sua
              família.
            </EmptyState.Description>
          </VStack>
          <Button asChild size="lg">
            <Link to={`/pessoas/adicionarNoCicloAtual`}>
              <LuUserPlus /> Adicionar Pessoa
            </Link>
          </Button>
        </EmptyState.Content>
      </EmptyState.Root>
    </Center>
  );
}

function PessoasSection({ pessoas }: { pessoas: CicloView["pessoas"] }) {
  return (
    <VStack as="section" flexGrow={1} gap={8}>
      <Accordion.Root collapsible as="section">
        <For each={pessoas}>
          {(pessoa) => (
            <Accordion.Item key={pessoa.nome} value={pessoa.nome}>
              <Accordion.ItemTrigger>
                <Avatar.Root
                  shape="rounded"
                  colorPalette={pessoa.ehDependente ? "green" : "yellow"}
                >
                  <Avatar.Fallback name={pessoa.nome} />
                </Avatar.Root>
                <VStack flexGrow={1} align={"flex-start"}>
                  {pessoa.ehDependente && (
                    <Badge colorPalette="green">
                      <RiParentFill />
                      Dependente
                    </Badge>
                  )}
                  <Heading as="h3" size={"md"}>
                    {pessoa.nome}
                  </Heading>
                  {pessoa.ehDependente ? (
                    <Text textStyle={"sm"}>
                      Total a receber{" "}
                      <FormatNumber
                        value={pessoa.aReceber}
                        style="currency"
                        currency="BRL"
                      />
                    </Text>
                  ) : (
                    <Text textStyle={"sm"}>
                      Total a pagar:{" "}
                      <FormatNumber
                        value={pessoa.aPagar}
                        style="currency"
                        currency="BRL"
                      />
                    </Text>
                  )}
                </VStack>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody>
                  <Table.Root size={"sm"}>
                    <Table.Body>
                      {[
                        {
                          name: "Rendimento Total",
                          value: pessoa.rendimentosTotais,
                        },
                        {
                          name: "Contribuição",
                          value: pessoa.contribuicaoTotal,
                        },
                        {
                          name: "Gastos Dedutíveis",
                          value: pessoa.gastosDedutiveisTotais,
                        },
                        {
                          name: "Benefício Total",
                          value: pessoa.beneficiosTotais,
                        },
                      ]
                        .filter((item) => item.value != 0)
                        .map((item, index) => (
                          <Table.Row key={index}>
                            <Table.Cell>{item.name}</Table.Cell>
                            <Table.Cell textAlign="end">
                              <FormatNumber
                                value={item.value}
                                style="currency"
                                currency="BRL"
                              />
                            </Table.Cell>
                          </Table.Row>
                        ))}
                    </Table.Body>
                  </Table.Root>
                </Accordion.ItemBody>
                <For each={pessoa.rendimentos}>
                  {(rendimento) => (
                    <Accordion.ItemBody>{rendimento.nome}</Accordion.ItemBody>
                  )}
                </For>
              </Accordion.ItemContent>
              <Accordion.ItemContent
                display={"flex"}
                flexDirection={"row"}
                justifyContent={"center"}
                paddingBottom={4}
              >
                <Menu.Root positioning={{ placement: "top" }}>
                  <Menu.Trigger asChild>
                    <IconButton variant="solid">
                      <LuPlus />
                    </IconButton>
                  </Menu.Trigger>
                  <Portal>
                    <Menu.Positioner>
                      <Menu.Content>
                        <Menu.Item value="new-txt">
                          Adicionar Rendimento
                        </Menu.Item>
                        <Menu.Item value="new-file">Adicionar Gasto</Menu.Item>
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>
              </Accordion.ItemContent>
            </Accordion.Item>
          )}
        </For>
      </Accordion.Root>
      <Button asChild size="sm" variant={"surface"}>
        <Link to={`/pessoas/adicionarNoCicloAtual`}>
          <LuUserPlus /> Adicionar Pessoa
        </Link>
      </Button>
    </VStack>
  );
}

function ResumoFooter({ ciclo }: { ciclo: CicloView }) {
  const title = ciclo.encerrado ? `Ciclo ${ciclo.dataInicio}` : `Ciclo Atual`;
  const items = [{ name: "Arrecadação Total", value: ciclo.arrecadacaoTotal }];
  return (
    <Stack data-component="ResumoFooter" as="footer" width="full" gap={4}>
      <Stack as="header" width="full">
        <Stack gap={1}>
          <Heading size="xl">{title}</Heading>
          <Text>
            {new Date(ciclo.dataInicio).toLocaleDateString()} -{" "}
            {ciclo.dataFim
              ? new Date(ciclo.dataFim).toLocaleDateString()
              : "Presente"}
          </Text>
        </Stack>
      </Stack>
      <Table.Root width="full">
        <Table.Body>
          {items.map((item, index) => (
            <Table.Row key={index}>
              <Table.Cell>{item.name}</Table.Cell>
              <Table.Cell textAlign="end">
                <FormatNumber
                  value={item.value}
                  style="currency"
                  currency="BRL"
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Button width={"full"}>Encerrar Ciclo</Button>
    </Stack>
  );
}
