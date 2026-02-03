import { useAccount, useChainId, useSwitchChain, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { base, bsc, polygon } from "wagmi/chains";

const SUPPORTED_CHAINS = [
  { chain: base, label: "Base", color: "bg-blue-500" },
  { chain: bsc, label: "BNB Chain", color: "bg-yellow-500" },
  { chain: polygon, label: "Polygon", color: "bg-purple-500" },
];

export function WalletStatus() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const { disconnect } = useDisconnect();

  const currentChain = SUPPORTED_CHAINS.find((c) => c.chain.id === chainId);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Connection</CardTitle>
          <CardDescription>
            Connect your wallet to enable authenticated features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No wallet connected. Use the connect button in the header to connect your wallet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Connection</CardTitle>
        <CardDescription>
          Manage your connected wallet and switch between chains.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
          <div>
            <p className="text-sm font-medium">Connected Address</p>
            <p className="text-sm text-muted-foreground font-mono">
              {address ? truncateAddress(address) : "—"}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => disconnect()}>
            Disconnect
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Current Chain</p>
          <div className="flex items-center gap-2">
            {currentChain && (
              <span className={`w-3 h-3 rounded-full ${currentChain.color}`} />
            )}
            <span className="text-sm">
              {currentChain?.label || `Unknown (${chainId})`}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Switch Chain</p>
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_CHAINS.map(({ chain, label, color }) => (
              <Button
                key={chain.id}
                variant={chainId === chain.id ? "default" : "outline"}
                size="sm"
                disabled={isPending || chainId === chain.id}
                onClick={() => switchChain({ chainId: chain.id })}
                className="flex items-center gap-2"
              >
                <span className={`w-2 h-2 rounded-full ${color}`} />
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>Polymarket</strong> uses Polygon, <strong>Opinion</strong> uses BNB Chain,
            and <strong>Base</strong> is for Farcaster integration.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
