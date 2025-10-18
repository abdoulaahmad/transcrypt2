import type { PropsWithChildren } from "react";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import type { Chain } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const blockdagChain: Chain = {
  id: Number.parseInt(import.meta.env.VITE_CHAIN_ID ?? "1043", 10),
  name: "BlockDAG",
  nativeCurrency: {
    name: "BlockDAG ETH",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_RPC_URL ?? "https://rpc.awakening.bdagscan.com"]
    },
    public: {
      http: [import.meta.env.VITE_RPC_URL ?? "https://rpc.awakening.bdagscan.com"]
    }
  }
};

const { chains, publicClient, webSocketPublicClient } = configureChains([
  blockdagChain
], [
  jsonRpcProvider({
    rpc: () => ({ http: import.meta.env.VITE_RPC_URL ?? "https://rpc.awakening.bdagscan.com" })
  })
]);

const config = createConfig({
  autoConnect: true,
  connectors: [new MetaMaskConnector({ chains })],
  publicClient,
  webSocketPublicClient
});

export function WagmiProviderWrapper({ children }: PropsWithChildren) {
  return <WagmiConfig config={config}>{children}</WagmiConfig>;
}
