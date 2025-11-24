import React from 'react'
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

const queryClient = new QueryClient();

function App() {
  return (
    <React.StrictMode>
      <ChakraProvider value={defaultSystem}>
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>
      </ChakraProvider>
    </React.StrictMode>
  );
}

export const Route = createRootRoute({ component: App });
