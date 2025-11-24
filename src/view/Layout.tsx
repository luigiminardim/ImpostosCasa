import { Center, Container, Heading, Stack } from "@chakra-ui/react";

export function Layout({
  title,
  children,
  footer,
}: React.PropsWithChildren<{ title: string; footer: React.ReactNode }>) {
  return (
    <Stack aria-label="Layout" direction={"column"} minHeight={"100vh"}>
      <Center as="header" paddingY={4}>
        <Heading as="h1" size="md">
          {title}
        </Heading>
      </Center>
      <Container
        as="main"
        flexGrow={1}
        display={"flex"}
        flexDirection={"column"}
      >
        {children}
      </Container>
      {footer && (
        <Container display={"flex"} paddingY={4} borderTopWidth={"thin"}>
          {footer}
        </Container>
      )}
    </Stack>
  );
}
