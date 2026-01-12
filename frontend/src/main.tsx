import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { AuthGate } from "@/features/auth/components/AuthGate";
import type { RouterAuthContext } from "@/features/auth/types/auth.types";
import "./styles.css";

// Create query client with defaults optimized for API calls
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Create router factory that takes auth context
function createAppRouter(auth: RouterAuthContext) {
  return createRouter({
    routeTree,
    context: {
      queryClient,
      auth,
    },
    defaultPreload: "intent",
    scrollRestoration: true,
  });
}

// Register router for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}

// Render app
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        {(authContext) => (
          <RouterProvider router={createAppRouter(authContext)} />
        )}
      </AuthGate>
    </QueryClientProvider>
  </StrictMode>
);
