import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const ganachePrivateKey = process.env.GANACHE_PRIVATE_KEY;
const ganacheUrl = process.env.GANACHE_RPC_URL || "http://127.0.0.1:7545";

const blockdagNetwork: NetworkUserConfig = {
  url: process.env.BLOCKDAG_RPC_URL || "",
  accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
};

if (process.env.BLOCKDAG_CHAIN_ID) {
  blockdagNetwork.chainId = Number(process.env.BLOCKDAG_CHAIN_ID);
}

if (process.env.BLOCKDAG_GAS_PRICE) {
  blockdagNetwork.gasPrice = Number(process.env.BLOCKDAG_GAS_PRICE);
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    ganache: {
      url: ganacheUrl,
      accounts: ganachePrivateKey ? [ganachePrivateKey] : undefined,
    },
    fantomTestnet: {
      url: process.env.FANTOM_RPC_URL || "",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
    avalancheFuji: {
      url: process.env.AVALANCHE_FUJI_RPC_URL || "",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
    blockdag: blockdagNetwork,
  },
  paths: {
    sources: "contracts",
    tests: "test",
    cache: "cache",
    artifacts: "artifacts",
  },
};

export default config;
