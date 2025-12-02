import { Container, Heading, Stack } from "@chakra-ui/react";

export function Layout({
  title,
  children,
  footer,
}: React.PropsWithChildren<{ title: string; footer: React.ReactNode }>) {
  return (
    <Stack aria-label="Layout" direction={"column"} height={"100vh"}>
      <Container
        as="header"
        display={"flex"}
        paddingY={4}
        borderBottomWidth={"medium"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Heading as="h1" size="md">
          {title}
        </Heading>
      </Container>
      <Container
        as="main"
        flexGrow={1}
        display={"flex"}
        flexDirection={"column"}
        overflowY={"auto"}
      >
        {children}
      </Container>
      {footer && (
        <Container display={"flex"} paddingY={4} borderTopWidth={"medium"}>
          {footer}
        </Container>
      )}
    </Stack>
  );
}
