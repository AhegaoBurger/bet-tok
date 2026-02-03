import { createConfig, http } from "wagmi";
import { base, bsc, polygon } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";

export const wagmiConfig = createConfig({
  chains: [base, bsc, polygon],
  transports: {
    [base.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
  },
  connectors: [farcasterMiniApp()],
});
