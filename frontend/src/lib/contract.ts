import abi from "../../../contracts/artifacts/contracts/TranscriptRegistry.sol/TranscriptRegistry.json" with { type: "json" };

export const registryAddress = (import.meta.env.VITE_TRANSCRIPT_REGISTRY_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const registryAbi = abi.abi as typeof abi.abi;
