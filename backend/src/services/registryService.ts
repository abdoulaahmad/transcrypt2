import { createPublicClient, getContract, http } from "viem";
import { hardhat } from "viem/chains";

import { config } from "../config.js";
import abi from "../../../contracts/artifacts/contracts/TranscriptRegistry.sol/TranscriptRegistry.json" with { type: "json" };

const client = createPublicClient({
  chain: hardhat,
  transport: http(config.rpcUrl)
});

type TranscriptAbi = typeof abi.abi;

export const transcriptRegistry = getContract({
  address: config.registryAddress as `0x${string}`,
  abi: abi.abi as TranscriptAbi,
  client
});

export async function getRoles(address: `0x${string}`) {
  const [universityRole, registrarRole, ministryRole, adminRole] = await Promise.all([
    transcriptRegistry.read.UNIVERSITY_ROLE(),
    transcriptRegistry.read.REGISTRAR_ROLE(),
    transcriptRegistry.read.MINISTRY_ROLE(),
    transcriptRegistry.read.DEFAULT_ADMIN_ROLE()
  ]);

  const [isUniversity, isRegistrar, isMinistry] = await Promise.all([
    transcriptRegistry.read.hasRole([universityRole, address]),
    transcriptRegistry.read.hasRole([registrarRole, address]),
    transcriptRegistry.read.hasRole([ministryRole, address])
  ]);

  const isAdmin = await transcriptRegistry.read.hasRole([adminRole, address]);

  return { isUniversity, isRegistrar, isMinistry, isAdmin };
}
