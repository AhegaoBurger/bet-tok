import { type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import type { RouterAuthContext } from "../types/auth.types";
import { useAuth } from "../hooks/useAuth";

interface AuthGateProps {
  children: (authContext: RouterAuthContext) => ReactNode;
}

function AuthContextProvider({
  children,
}: {
  children: (authContext: RouterAuthContext) => ReactNode;
}) {
  const { isConnected, address, fid } = useAuth();

  const authContext: RouterAuthContext = {
    isConnected,
    address,
    fid,
  };

  return <>{children(authContext)}</>;
}

export function AuthGate({ children }: AuthGateProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </WagmiProvider>
  );
}
