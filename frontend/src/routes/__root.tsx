import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect } from "react";

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <>
      <MainLayout>
        <Outlet />
      </MainLayout>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
