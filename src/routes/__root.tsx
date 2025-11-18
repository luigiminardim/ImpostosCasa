import { createRootRoute } from "@tanstack/react-router";

import { StrictMode } from "react";
import { CssBaseline, GeistProvider } from "@geist-ui/core";
import { Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <GeistProvider>
          <CssBaseline />
          <Outlet />
        </GeistProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

export const Route = createRootRoute({ component: App });
