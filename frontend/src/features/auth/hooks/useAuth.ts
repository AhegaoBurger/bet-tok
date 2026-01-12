import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useCallback, useMemo } from "react";
import type { AuthState } from "../types/auth.types";

export function useAuth(): AuthState & {
  connect: () => void;
  disconnect: () => void;
} {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const handleConnect = useCallback(() => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  }, [connect, connectors]);

  const handleDisconnect = useCallback(() => {
    wagmiDisconnect();
  }, [wagmiDisconnect]);

  const authState = useMemo(
    (): AuthState => ({
      isConnected,
      isInitializing: isConnecting || isReconnecting,
      address: address ?? null,
      fid: null, // Farcaster ID will be fetched separately if needed
    }),
    [isConnected, isConnecting, isReconnecting, address]
  );

  return {
    ...authState,
    connect: handleConnect,
    disconnect: handleDisconnect,
  };
}
