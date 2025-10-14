import abi from "@contracts/artifacts/contracts/TranscriptRegistry.sol/TranscriptRegistry.json" assert { type: "json" };
export const registryAddress =
    import.meta.env.VITE_TRANSCRIPT_REGISTRY_ADDRESS ?? "0x0000000000000000000000000000000000000000";
export const registryAbi = abi.abi;