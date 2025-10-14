import { jsx as _jsx } from "react/jsx-runtime";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
const ganacheChain = {
    id: Number.parseInt(import.meta.env.VITE_GANACHE_CHAIN_ID ?? "1337", 10),
    name: "Ganache",
    nativeCurrency: {
        name: "Ganache ETH",
        symbol: "ETH",
        decimals: 18
    },
    rpcUrls: {
        default: {
            http: [
                import.meta.env.VITE_RPC_URL ?? "http://127.0.0.1:7545"
            ]
        },
        public: {
            http: [
                import.meta.env.VITE_RPC_URL ?? "http://127.0.0.1:7545"
            ]
        }
    }
};
const { chains, publicClient, webSocketPublicClient } = configureChains([
    ganacheChain
], [
    jsonRpcProvider({
        rpc: () => ({ http: import.meta.env.VITE_RPC_URL ?? "http://127.0.0.1:7545" })
    })
]);
const config = createConfig({
    autoConnect: true,
    connectors: [new MetaMaskConnector({ chains })],
    publicClient,
    webSocketPublicClient
});
export function WagmiProviderWrapper({ children }) {
    return _jsx(WagmiConfig, { config: config, children: children });
}